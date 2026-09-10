# Backend-only OAuth: remove Supabase credentials from the frontend bundle — design

## Status

Approved by user (2026-09-10), pending implementation plan.

## Context

`src/lib/supabaseAuthClient.ts` bundles `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` into the
client-side JS and runs `supabase-js`'s browser client directly for the whole login flow: kicking
off `signInWithOAuth`, receiving the OAuth callback, and maintaining the session. This isn't a
credential leak in the usual sense — Supabase's anon key is designed to be public, and RLS (see
`docs/architecture.md`'s Supabase RLS section) is the real access control — but the goal here is
narrower and still real: **the frontend shouldn't need to hold or use Supabase credentials at
all**, and the OAuth handshake is the one place it currently does.

This is non-trivial because `lib/auth.ts`'s `requireUser()` doesn't validate an opaque bearer
token — it reconstructs a Supabase server client with the anon key and reads the *same*
`@supabase/ssr` cookie format the browser client wrote. Removing the anon key from the frontend
means the entire OAuth handshake (redirect to Google, receive the code, exchange it for a session,
write the session cookie) has to move server-side, onto `api/*.ts`, which already holds the anon
key.

**Explicitly not in scope**: reverting to `service_role` + a custom JWT (a different, stale plan
from an earlier parallel session proposed this; rejected — see "Explicitly out of scope" below).
Supabase Auth + RLS as a genuine second authorization layer, as documented in
`docs/superpowers/specs/2026-09-09-supabase-auth-migration-design.md`, is kept exactly as-is; only
where the OAuth handshake itself runs is changing.

**Discovery that shrinks this task**: `src/hooks/useAuth.ts` already contains the target shape as
dead code. It has an `if (supabaseAuthEnabled) { ... } else { window.location.href =
"/api/auth-google-start?returnTo=..." }` branch left over from when this app ran on both Netlify
(no Supabase Auth) and Vercel (Supabase Auth) at once. Netlify is retired
([NUT-52](https://linear.app/nutrition-grocery-planner/issue/NUT-52/netlifyi-sok-eski-deploy-hedefini-kaldir)),
so `VITE_SUPABASE_AUTH_ENABLED` is dead config already — always true in practice. The `else`
branch's redirect-to-a-backend-endpoint shape is exactly this design's target; the endpoint itself
(`api/auth-google-start.ts`) was just never built for Vercel — it only ever existed under the
now-deleted `netlify/functions/`.

**Unrelated gap found while reading this code, flagged not fixed**: `useAuth.ts`'s
`deleteAccount()` calls `/api/auth-delete-account`, which does not exist in `api/` (only ever
existed under `netlify/functions/`, also now deleted). Account deletion is silently broken on
Vercel today, independent of this design. Left for a separate fix — see "Explicitly out of scope."

## Architecture

Three legs move from the browser to `api/*.ts`:

1. **`GET /api/auth-google-start?returnTo=<url>`** — builds Supabase's
   `<SUPABASE_URL>/auth/v1/authorize?provider=google&redirect_to=<our-callback-url>` server-side
   (using `SUPABASE_URL`/`SUPABASE_ANON_KEY`, already server-only) and 302s the browser to it.
   `returnTo` is validated as same-origin-relative (reject absolute URLs to other hosts — see
   Security below) and stashed in a short-lived cookie so the callback can read it back; it is not
   passed through Supabase's `redirect_to` param itself, since that must exactly match one of the
   fixed URLs allow-listed in Supabase's Auth settings.
2. **`GET /api/auth-callback`** — Google redirects here via Supabase after consent. Exchanges the
   `code` query param for a session (`supabase.auth.exchangeCodeForSession`) using a **writable**
   cookie adapter (see below), does the identity-linking upsert `api/auth-link.ts` currently does
   (resolve the Google `sub`, upsert `app_users`, upsert `auth_user_map`) inline, reads back the
   stashed `returnTo` cookie, clears it, and 302s there. On any failure (missing code, exchange
   error, no Google identity on the session), redirects to `returnTo` (or `/` if that cookie is
   also missing) with `?auth_error=1` instead of throwing a raw error page.
3. **`api/auth-link.ts` is deleted** — its logic moves into `auth-callback.ts` as a plain function,
   not a separate HTTP round-trip.

Everything else on the backend is unchanged: `requireUser()`, `requireHouseholdAccess()`,
`api/auth-session.ts`, `api/auth-logout.ts`, and every data-serving `api/*.ts` function keep their
exact current behavior — they already only ever touch cookies, never the browser.

**Writable cookie adapter.** `api/auth-logout.ts` already contains a working writable
`@supabase/ssr` cookie adapter (`getAll`/`setAll` writing real `Set-Cookie` headers). Today it's
inlined there only. This design extracts it into `lib/auth.ts` as a shared helper (e.g.
`writableCookies(request, responseHeaders)`) so `auth-callback.ts` doesn't duplicate it a third
time, and `auth-logout.ts` switches to the shared version. `requireUser()`'s existing read-only
adapter is untouched — session refresh remains explicitly out of scope, same boundary as today.

**Security: `returnTo` validation.** Both `auth-google-start.ts` (stashing it) and
`auth-callback.ts` (redirecting to it) must reject anything that isn't a same-origin relative path
(e.g. require it to start with `/` and contain no `//` or `\` prefix trick). Without this, the
start endpoint is an open redirect (`?returnTo=https://evil.example`) that becomes attacker-chosen
once the user is logged in. This is a new check — today's client-side `signInWithOAuth({
redirectTo: window.location.href })` had no such vector since the browser controlled the value
directly.

## Frontend changes

- **`src/lib/supabaseAuthClient.ts` — deleted.** No more `createBrowserClient`, no more
  `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` read anywhere in `src/`.
- **`src/hooks/useAuth.ts`** — the `supabaseAuthEnabled` branch is removed entirely (not just
  defaulted): `signInWithGoogle()` becomes unconditionally the redirect; `fetchAppSession()`
  (today's `false`-branch path) becomes the only session check, run once on mount via a plain
  `useEffect`; `onAuthStateChange`/`getSupabaseAuthClient()` calls and the `AuthChangeEvent` import
  are deleted. `signOut()` drops its `if (supabaseAuthEnabled)` half — `POST /api/auth-logout`
  alone already clears the session cookie server-side.
- **`src/components/LoginGate.tsx`** — unaffected structurally (`onSignIn` prop keeps working,
  now just triggers a redirect instead of a `supabase-js` call). Gains a small inline error message
  when the URL carries `?auth_error=1` (read via `useSearchParams`-equivalent or a plain
  `URLSearchParams` check — this app has no router, so a direct `window.location.search` read is
  consistent with existing patterns like `LoginGate`'s own migration-notice hostname check).
- **`package.json`** — no dependency changes. `@supabase/supabase-js` and `@supabase/ssr` stay;
  both remain genuinely used server-side (`api/_auth-test-login.ts`, `lib/auth.ts`,
  `api/auth-logout.ts`, the new `auth-callback.ts`). Vite's own tree-shaking drops them from the
  client bundle once nothing under `src/` imports them — no build config change needed.
- **`VITE_SUPABASE_AUTH_ENABLED`** — removed everywhere (env var, the `supabaseAuthEnabled` export,
  its one remaining reader). Confirmed dead now that Netlify is retired.

## Data flow

```
Browser                     api/auth-google-start        Supabase Auth              Google
   │  click "Sign in"               │                          │                      │
   ├──── GET ?returnTo=/ ──────────>│                          │                      │
   │                                 │ validate returnTo        │                      │
   │                                 │ set returnTo cookie      │                      │
   │  <── 302 to Supabase authorize ─┤                          │                      │
   ├─────────────────────────────────────────────────────────>│                      │
   │                                 │                          ├── redirect to Google ─>│
   │  <───────────────────────────────────────────── consent screen ───────────────────┤
   │  (user approves)                                                                    │
   │  <──────────────────────────────────────────── redirect w/ code ────────────────────┤
   │                                 │                          │<──────────────────────┘
   │                                 │                    (Supabase relays code via its own
   │                                 │                     redirect_to, configured to point
   │                                 │                     at api/auth-callback)
Browser                     api/auth-callback
   ├──── GET ?code=... ─────────────>│
   │                                 │ exchangeCodeForSession(code)
   │                                 │ upsert app_users/auth_user_map
   │                                 │ read + clear returnTo cookie
   │  <── 302 to returnTo, session cookie set ──┤
```

## Error handling

| Failure | Behavior |
|---|---|
| `returnTo` missing/invalid at start | Fall back to `/` |
| User denies Google consent | Supabase redirects to our callback with an error param instead of `code`; callback redirects to `returnTo` (or `/`) with `?auth_error=1` |
| `exchangeCodeForSession` fails (expired/replayed code) | Same: redirect with `?auth_error=1`, no session cookie set |
| `app_users`/`auth_user_map` upsert fails | Same: redirect with `?auth_error=1` — user is not left "half logged in" (no session cookie written before this step succeeds, matching `auth-link.ts`'s current idempotent-upsert-first ordering) |

## Testing

**No automated tests are written for this work** — per explicit user instruction. No new `vitest`
files, no test scaffolding for the new endpoints. Verification is manual, end-to-end only, same
pattern as the original Supabase Auth migration's own plan:

- Fresh login (no existing `auth_user_map` row): full redirect chain completes, lands on
  `returnTo`, `/api/auth-session` returns the right `{ email, userId }`.
- Returning login: same, second time through, no duplicate `auth_user_map` row (upsert).
- Deny consent on Google's screen: lands back on `returnTo` with `?auth_error=1`, no session
  cookie set, `/api/auth-session` still 401s.
- `returnTo` tampering (`?returnTo=https://evil.example`): rejected, falls back to `/`.
- Logout: `/api/auth-logout` still clears the session; `/api/auth-session` 401s afterward.
- `tsc -b`, `tsc -p api/tsconfig.json --noEmit`, `vite build`, `vitest run` all clean, and confirm
  the built client bundle no longer references `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (grep
  `dist/assets/*.js`).

## Files changed (expected)

- New: `api/auth-google-start.ts`, `api/auth-callback.ts`.
- Deleted: `api/auth-link.ts`, `src/lib/supabaseAuthClient.ts`.
- Modified: `lib/auth.ts` (extract shared writable cookie adapter), `api/auth-logout.ts` (use the
  shared adapter), `src/hooks/useAuth.ts` (remove the flag/branch), `src/components/LoginGate.tsx`
  (error param display), `.env.local.example`/Vercel project settings (remove
  `VITE_SUPABASE_AUTH_ENABLED`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — the server-side
  `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` are untouched), `docs/architecture.md`
  (Environment variables / auth flow description).

## Explicitly out of scope

- Reverting Supabase Auth + RLS to `service_role` + a custom JWT (the stale parallel-session plan).
  RLS stays a real second layer; nothing about `requireHouseholdAccess()` or the RLS policies
  changes.
- Any Docker/container split of frontend and backend — `api/*.ts` stays on Vercel serverless
  functions, no standalone Node server.
- Fixing `deleteAccount()`'s missing `/api/auth-delete-account` endpoint — real, pre-existing,
  unrelated gap; separate task.
- Session refresh / token rotation — same explicit boundary as the original Supabase Auth
  migration design.
- `SUPABASE_ANON_KEY` usage elsewhere on the server (e.g. `nutrition.ts`'s reads) — unaffected,
  orthogonal to this change.

## Open items for the implementation plan

- **Supabase dashboard** (external, manual): add `<vercel-domain>/api/auth-callback` to Auth →
  URL Configuration → Redirect URLs, alongside whatever's already allow-listed from the original
  Supabase Auth migration.
- Exact cookie name/attributes/TTL for the `returnTo` stash (short-lived, `HttpOnly`, `SameSite=Lax`
  is enough — it never carries a secret, just a same-origin path).
- Whether `LoginGate.tsx`'s error message needs Turkish copy matching the rest of its strings (it
  does — this repo's UI is Turkish throughout) and exact wording.
- Confirm no other frontend code path reads `import.meta.env.VITE_SUPABASE_*` beyond the two files
  named above (a repo-wide grep at implementation time, not just this design's).
