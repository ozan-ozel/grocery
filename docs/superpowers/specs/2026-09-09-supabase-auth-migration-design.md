# Real Supabase Auth migration (Vercel only) — design

## Status

Approved by user (2026-09-09), pending implementation plan.

## Context

Supabase's Advisor flags `meal_entries`, `personal_plan`, and `preparation_batches` as
"RLS not enabled." This is not a regression — `11-fix-anon-read-rls-drift.sql` and
`18-preparation-batches-rls-drift.sql` document that RLS-enabled-with-zero-policies has
already broken production twice, because this app has no Supabase Auth: `auth.uid()` is
always null, so no RLS policy could ever match anyway. Authorization today runs entirely
at the Netlify/Vercel function layer (`requireUser`/`requireHouseholdAccess` in `_auth.ts`
/ `lib/auth.ts`).

A proposed fix — swap `SUPABASE_ANON_KEY` for `SUPABASE_SERVICE_ROLE_KEY` everywhere, then
enable RLS on every table — was reviewed and rejected: `service_role` always bypasses RLS,
so that would make RLS decorative for all of this app's own traffic while consolidating
every backend operation onto the single highest-privilege key. It silences the Advisor
without adding any real protection.

The actual fix is to give Postgres a real identity to check — i.e. adopt Supabase Auth, so
`auth.uid()` is non-null and RLS can run as a **second, independent layer** behind the
existing function-layer checks (not a replacement for them). This is a genuine
architectural migration: new identity provider, new session handling, real per-row
policies on every household/user-scoped table, and a reconciliation between the app's
existing text-based identity (`app_users.id` = Google `sub`) and Supabase Auth's own
uuid-per-user model on live data.

**Explicit scope decision (user, 2026-09-09):** this migration targets **`api/*.ts`
(Vercel) only.** `netlify/functions/*` — which still serves real user traffic today per
[NUT-29](https://linear.app/nutrition-grocery-planner/issue/NUT-29/netlifydan-vercele-tasinma)'s
closeout — is untouched. This means the migration provides no real-world security benefit
until Netlify is actually retired ([NUT-52](https://linear.app/nutrition-grocery-planner/issue/NUT-52/netlifyi-sok-eski-deploy-hedefini-kaldir),
no date set). The rationale for doing it now anyway: when a cutover date is eventually set,
Vercel is cut over to *already* having the stronger model, rather than cutting over to
Vercel-with-the-old-model and migrating auth a second time.

## Honest framing: this is not "bulletproof"

Worth stating plainly, since that word was used earlier in discussion and rejected as
overstating it:

- **Protects nothing until Vercel is live.** Zero effect on the real app until NUT-52.
- **Moves a failure mode, doesn't delete it.** If `auth_user_map` (below) isn't populated
  correctly on login, every RLS policy silently denies that user — the same "RLS enabled,
  quietly returns nothing" signature as the two incidents that started this conversation,
  relocated to a new seam instead of removed.
- **The login-linking step becomes the highest-value attack surface** — it's the one place
  `service_role` still runs for user data, at the exact joint between the old and new
  identity systems.
- **Only as strong as its worst policy.** Nine tables' worth of policies; one written too
  loosely undoes the benefit on that table with no visible signal.
- **No regression protection.** This repo has no test suite beyond `tsc -b`
  (see `CLAUDE.md`) — nothing stops a future edit from silently loosening a policy.
- **Doesn't touch session hijacking, XSS, or secret-hygiene risk classes at all** — those
  are unchanged by this work, for better or worse.

This migration closes one specific, real gap (single point of failure in the app layer)
correctly. It is not a claim that the app becomes unbreakable.

## Identity architecture

- Google sign-in moves to **Supabase-hosted OAuth**: `supabase.auth.signInWithOAuth({
  provider: 'google' })`. Supabase manages the entire redirect/callback. This deletes
  `auth-google-callback.ts` and `auth-google-start.ts` from `api/` — Supabase's own infra
  replaces them. Google Cloud Console needs Supabase's callback URL added as an authorized
  redirect URI (kept alongside the existing Vercel one until this ships and is verified).
- `app_users` is **untouched** — same table, same Google-`sub`-as-text-id rows,
  `owner_id`/`user_id` columns on `households`/`personal_plan`/`hidden_households` keep
  their exact existing values. Nothing destructive happens to live data.
- A new table links the two identity systems:

  ```sql
  create table public.auth_user_map (
    supabase_uid uuid primary key references auth.users(id) on delete cascade,
    app_user_id  text not null unique references public.app_users(id) on delete cascade,
    created_at   timestamptz not null default now()
  );
  ```

  Populated once per user, at first login under the new system, by a small endpoint the
  client calls right after `onAuthStateChange` fires `SIGNED_IN`: resolve the Google `sub`
  from the Supabase session's identity data, upsert `app_users` (unchanged shape), upsert
  `auth_user_map`. This is what `auth-google-callback.ts`'s upsert used to do, just
  triggered from the new place in the flow. Runs with `service_role` — the one place it's
  still used for user-facing data, and the single most security-sensitive piece of this
  migration (see "Honest framing" above).
- `lib/auth.ts` is rewritten around `@supabase/ssr`'s `createServerClient`, using
  web-standard cookie get/set adapters (fits naturally — `api/*.ts` already uses
  `Request`/`Response`). `requireUser()` changes from "verify our own signed JWT" to "call
  `supabase.auth.getUser()` against the session cookie." `requireHouseholdAccess()` keeps
  its **exact current logic** (owner check + `household_shares` lookup, via
  `service_role`) — unchanged, still the first layer. RLS is added underneath it, not
  instead of it.
- Every `api/*.ts` function's actual data read/write now uses **the caller's own Supabase
  access token** as the PostgREST bearer for their own data — not `anon`, not
  `service_role` — so `auth.uid()` is genuinely non-null and RLS evaluates for real.
- `auth-test-login.ts`'s QA bypass (get a working session without touching real Google) is
  replaced with the Supabase Admin API (`auth.admin.generateLink`), under the same double
  gate as today: non-prod `VERCEL_ENV` + a required secret compared with
  `timingSafeEqual`.

## RLS policy plan

Two helper functions, both `security definer`, `stable`, with a pinned `search_path`
(standard Supabase pattern — avoids RLS-recursion/performance surprises when one table's
policy queries another, and keeps the access rule defined exactly once):

```sql
create or replace function public.current_app_user_id()
returns text
language sql stable security definer set search_path = public
as $$
  select app_user_id from public.auth_user_map where supabase_uid = auth.uid()
$$;

create or replace function public.has_household_access(hh_id text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.households h
    where h.id = hh_id and h.owner_id = public.current_app_user_id()
  ) or exists (
    select 1 from public.household_shares s
    where s.household_id = hh_id and s.email = auth.email()
  )
$$;
```

`has_household_access` is a direct translation of today's `requireHouseholdAccess()` —
owner match, or an explicit `household_shares` row. `household_shares` is keyed by
**email**, not a user id, so that half uses Supabase's built-in `auth.email()` directly —
no mapping table needed there.

**`security definer` here is a correctness requirement, not just an optimization.**
`auth_user_map` has no user-facing SELECT policy (see the table below — it's fully
locked). A plain `using (...)` clause inline in another table's policy, without the
`security definer` wrapper, would query `auth_user_map` as the calling (restricted) role
and get zero rows for everyone, breaking every policy that depends on
`current_app_user_id()`. The functions must be created by (and owned by) a role Postgres
doesn't apply RLS to — the default when run via the Supabase SQL editor/dashboard as the
project's `postgres` role — or the whole scheme silently denies every user. This is the
single most important thing to verify live before trusting any of these policies.

| Table | Policy | Notes |
|---|---|---|
| `households` | SELECT via `owner_id = current_app_user_id() or has_household_share(id)` (**not** `has_household_access(id)` — see `supabase/20-households-select-returning-recursion-fix.sql`); UPDATE via `has_household_access(id)`; DELETE/ownership-transfer restricted to `owner_id = current_app_user_id()` | matches today's `ownerOnly` calls in `households.ts`. **households_select must never re-query `households` itself**: `api/households.ts` sends `Prefer: return=representation` on every write, so `INSERT ... RETURNING` requires the new row to pass this same SELECT policy, and a self-referential sub-query can't see the row its own command just inserted — this shipped broken once (42501 on every create) and was fixed live; don't reintroduce `has_household_access(id)` here. |
| `lists`, `items` | SELECT only, via `has_household_access(household_id)` (direct on `lists`; via a join to `lists` for `items`) | **dead-write scaffolding** per `docs/architecture.md` — `netlify/functions/lists.ts`/`items.ts` exist but nothing calls them; the only live usage is `state.ts`'s one-time `hydrateFromSupabase()` fallback read |
| `item_category_memory`, `meal_entries`, `preparation_batches`, `sync_state` | full SELECT/INSERT/UPDATE/DELETE via `has_household_access(household_id)` | actively read/written tables |
| `personal_plan` | `user_id = current_app_user_id()` | per-person by design, no household check |
| `hidden_households` | `user_id = current_app_user_id()` | per-viewer preference |
| `household_shares` | all operations restricted to `owner_id = current_app_user_id()` on the parent household | matches `ownerOnly: true` used on every call in `household-shares.ts` |
| `app_users`, `auth_user_map` | no user-facing policy — stays fully locked, `service_role` only | same as `app_users` already is today |

## Migration sequence (implementation-plan level detail comes from `writing-plans`)

1. **Supabase dashboard** (external, manual): enable Google as an Auth provider, reusing
   the existing `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`. Note the generated callback URL.
2. **Google Cloud Console** (external, manual): add that callback URL as an authorized
   redirect URI, alongside the existing Vercel one.
3. **DB migration** (`supabase/20-auth-user-map.sql`): `auth_user_map` table, the two
   helper functions, RLS + policies per the table above.
4. **Client-side**: add `@supabase/supabase-js`; swap the custom Google button for
   `supabase.auth.signInWithOAuth({ provider: 'google' })`.
5. **Server-side (`api/` only)**: `@supabase/ssr` in `lib/auth.ts`; `requireUser` validates
   the Supabase session; `requireHouseholdAccess` unchanged; every function's data query
   switches to a client authenticated with the caller's own access token.
6. **Login-linking endpoint**: new lightweight `api/auth-link.ts` (or similar), called once
   client-side on `SIGNED_IN`, doing the `app_users`/`auth_user_map` upsert described above.
7. **`auth-test-login.ts` replacement**: Supabase Admin API, same double gate as today.
8. **Delete** `auth-google-callback.ts`/`auth-google-start.ts` and the old JWT-cookie code,
   from `api/` only.
9. **End-to-end verification** on Vercel preview, then prod: login/logout, household
   CRUD, `/api/state` sync, meal planner, personal plan, preparation batches, household
   sharing — plus a deliberate **adversarial check**: two test households/users, confirm
   one genuinely cannot read or write the other's rows through the API. Worth keeping as a
   repeatable manual script even without a CI test framework (see "Honest framing" above).

## Explicitly out of scope

- `netlify/functions/*` — untouched, stays on the current model until (if ever) NUT-52
  happens.
- No existing table **data** is touched — this is purely additive (new table + policies).
- `nutrition.ts`/`nutrition` table — not household-scoped, no owner concept, left as-is.
- Session-lifetime/refresh UX beyond Supabase's own client defaults.
- `SUPABASE_ANON_KEY` usage elsewhere (e.g. `nutrition.ts`) — orthogonal, not removed.

## Open items for the implementation plan

- Exact shape/route of the login-linking endpoint (step 6) — whether it's a dedicated
  `api/auth-link.ts` or folds into an existing function.
- Whether `hidden_households` also needs a `has_household_access` check alongside
  `user_id = current_app_user_id()`, or the latter alone is the correct/sufficient
  invariant — needs a quick check against `hidden-households.ts`'s current behavior.
- Confirming `household_shares.email` and Supabase Auth's `auth.email()` are compared with
  consistent casing (today's app lowercases email at session-verification time in
  `_auth.ts`).
