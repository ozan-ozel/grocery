# Architecture

How the app is put together: data flow and invariants, the frontend, the API surface, auth and sessions, state
and persistence, tenants and RLS, the schema map, sync, boot loading, categorization, the nutrition backend, daily
rollover, the design/theming system and security boundaries. `CLAUDE.md` and [knowledge-map.md](knowledge-map.md)
only route here — this file is the canonical source for the subsystems below. Running, env vars, agent sessions and
deploys are in [operations.md](operations.md).

**For ordinary tasks, read only the relevant section(s), not the whole file** — `knowledge-map.md` says which
(list the headings with `grep -n '^## ' docs/architecture.md`). **For an explicit repository or architecture
analysis, read the whole file in Contents order.** A section carrying a *Verified against
code* line was checked against the source at the commit it names; the code is final on any volatile detail. An
unstamped section is accurate in structure but has not been re-verified.

For the React/Preact interop notes (why shadcn/ui's React source runs unmodified), see
README.md's "How shadcn/ui runs on Preact" section — not repeated here.

`src/lib/` groups multi-file domains into folders (`sync/`, `categorization/`) — the ones that
actually gained from it. `households.ts`, `nutrition.ts`, and `preferences.ts` stay flat at the
`src/lib/` root alongside `store.ts` and `utils.ts`: each is a single-file domain today, so a
folder would only add navigation depth with nothing to group. Promote one to a folder if it ever
grows a second file.

**Contents:** [Overview & data flow](#overview--data-flow) · [Core invariants](#core-invariants) ·
[Frontend](#frontend) · [API surface](#api-surface) · [Auth & session](#auth--session) ·
[State & persistence](#state--persistence) · [Tenants](#tenants) · [Supabase RLS](#supabase-rls) ·
[Persistence & schema map](#persistence--schema-map) · [Sync](#sync) · [Boot & data loading](#boot--data-loading) ·
[Categorization](#categorization) · [Nutrition](#nutrition) · [Personal meal planning](#personal-meal-planning) ·
[Deployment & environment](#deployment--environment) · [Daily rollover](#daily-rollover) ·
[Design tokens & theming](#design-tokens--theming) · [Security boundaries](#security-boundaries) ·
[Related docs](#related-docs)

## Overview & data flow

_Verified against code: 2026-09-21 @ 6f93963._

A Preact + shadcn/ui (Radix) + Tailwind v4 client (Vite) talks only to same-origin `/api/*` Vercel Functions
(`api/*.ts`, shared helpers in `lib/auth.ts`); those talk to Supabase (Postgres via PostgREST, plus Auth). The
browser never holds Supabase or Google credentials and runs no Supabase client: sign-in is a server-side Google
OAuth handshake that leaves an httpOnly session cookie (see "Auth & session").

```
browser (App.tsx + hooks, localStorage caches)
  └─ fetch /api/*  (cookie session)
       └─ Vercel Function (requireUser / requireHouseholdAccess = first layer)
            └─ PostgREST as the caller's own session  →  Postgres (RLS = second layer)
```

Data domains: **per-tenant list state** (one JSON blob per household, polling sync); **item-category memory**;
**households and invites**; **meal entries** and **preparation batches** (per household); **personal plan** and
**saved meals** (per user); **nutrition** (one global table); **auth**. localStorage holds device prefs and
per-tenant/per-user caches — see "State & persistence".

## Core invariants

Each is explained in the section named; break one only deliberately.

1. **No credentials in the client.** All data goes through `api/*`; the client bundle never receives Supabase or
   Google secrets, and localStorage never holds a token (only an identity hint) — "Auth & session", "Boot & data
   loading".
2. **Two authorization layers, neither replaces the other:** the function-layer checks (`requireUser`,
   `requireHouseholdAccess`) and Postgres RLS under the caller's own session — "Supabase RLS".
3. **A table's own SELECT policy must never re-query that same table** — "Supabase RLS".
4. **Enabling RLS on a table the app reads as the caller needs its policies in the same migration** — RLS with zero
   policies means "service role only", which broke production twice when a table was switched on too early
   (`supabase/11`, `18`). Zero policies is deliberate for `app_users`, `auth_user_map`, `agent_login_tokens` and
   `account_deletion_feedback`.
5. **`public.nutrition` is one global table**: writes are admin-only and fail closed, reads are open to signed-in
   users — "Nutrition".
6. **Sync is optimistic concurrency, last-write-wins by design** (stale `version` → 409, client adopts the server
   state) — "Sync".
7. **Session refresh is deliberately not implemented**; a session lives as long as Supabase's access-token lifetime
   — "Auth & session".
8. **Boot caches are cleared together** (sign-out, account deletion, confirmed 401, user change) — "Boot & data
   loading".
9. **The project is at the 12-function Hobby limit**; new endpoints must fit an existing function or displace one —
   [operations.md](operations.md) § Deployment.
10. **`agent-login` is local-only by deployment** and is never merged into a deployed function —
    [operations.md](operations.md) § Environment.
11. **The secrets boundary** (what Claude may never touch) lives in `CLAUDE.md`.

## Frontend

_Verified against code: 2026-09-21 @ 6f93963._

`src/main.tsx` mounts `<App/>` inside an error boundary and a TanStack Query `QueryClientProvider`. `App.tsx`
composes the hooks in `src/hooks/` (see "State & persistence") and routes between five sections —
`Section = "alisveris" | "besin" | "yemek" | "kisisel" | "ayarlar"` in `src/hooks/useUiPrefs.ts` (shopping,
nutrition, meal plan, personal plan, settings). The Nutrition, Meal Plan, Personal Plan and Settings views are
`lazy()`-loaded behind per-section `Suspense` fallbacks, and the Turkish categorization engine is loaded lazily
(`src/lib/categorization/categorizeLazy.ts`). Some components are unreachable from the UI and some were archived
to `archive/` (see its README), so **trace `App.tsx`'s section routing to find the live component** before
editing screen-specific UI. `README.md` explains why shadcn/ui's React source runs unmodified on Preact.

## API surface

_Verified against code: 2026-09-21 @ 6f93963. Re-check a row against the function's header comment before relying
on a detail._

Twelve routable functions (the Hobby limit). "Caller session" means PostgREST is called with the caller's own
Supabase token (`userRestHeaders`), so RLS applies; `requireUser` and `requireHouseholdAccess` are the first
layer and themselves use the service role for their lookups.

| Function | Routes / methods | Data | Access |
| --- | --- | --- | --- |
| `households.ts` | `/api/households` GET (list, or `?id=`), POST, PATCH (rename), DELETE (owner) | `households` | caller session; `requireHouseholdAccess` on writes |
| `household-shares.ts` | `/api/household-shares` GET, POST, DELETE — owner only | `household_shares` | caller session; `requireHouseholdAccess({ ownerOnly })` |
| `state.ts` | `/api/state?tenant=` GET, PUT | `sync_state` (falls back to `lists`/`items` hydration) | caller session; a 405 answers without an access lookup |
| `item-category-memory.ts` | GET, PUT | `item_category_memory` | caller session |
| `meal-entries.ts` | GET (range), POST, PATCH, DELETE | `meal_entries` | caller session; service role only for `mealEntryHouseholdId` (finds an entry's household from its id) |
| `preparation-batches.ts` | GET, POST only (immutable snapshots) | `preparation_batches` | caller session |
| `personal-plan.ts` | `/api/personal-plan` GET, PUT; `/api/saved-meals` GET, POST, PATCH, DELETE via `vercel.json` rewrite (`?_resource=saved-meals`) | `personal_plan`, `saved_meals` | caller session, **per user** (`requireUser`, no household) |
| `nutrition.ts` | GET (browse), POST (by names), PUT (bulk upsert, **admin only**) | `nutrition` | reads: anon key server-side; PUT: `requireAdmin` then service role |
| `auth-google.ts` | public `/api/auth-google-start` and `/api/auth-callback` via rewrites (`?_action=start\|callback`) | Google OAuth + Supabase Auth | public; callback links identity with the service role |
| `auth-session.ts` | GET → identity hint `{ email, userId }`, 401 if none | — | `requireUser` |
| `auth-logout.ts` | POST → clears session cookies | — | no data access |
| `auth-delete-account.ts` | DELETE `{ reason?, otherText? }` | owned households, invites, `app_users`, the Auth user, optional reason | `requireUser`, then service role |

Not counted: `agent-login.ts` (excluded by `.vercelignore`, local-only). Rewrites live in `vercel.json`.

## Auth & session

_Verified against code: 2026-09-21 @ 6f93963._

**Sign-in** is a server-side Google OAuth handshake — no browser-side Supabase client. `auth-google.ts` talks to
Google's own `/o/oauth2/v2/auth` and `oauth2.googleapis.com/token` endpoints directly with `GOOGLE_CLIENT_ID` /
`GOOGLE_CLIENT_SECRET` (this app's own OAuth client, so Google's consent screen shows this app's own domain rather
than `*.supabase.co`) and hands the resulting Google ID token to Supabase via `signInWithIdToken()` to mint the
session — it does not go through Supabase's hosted `/auth/v1/authorize` relay. Both public paths
(`/api/auth-google-start` → `/api/auth-callback`) are one file, dispatched by the `_action` query param that
`vercel.json`'s rewrites inject (a deliberate merge to stay under the function limit). Short-lived return-to and
OAuth-state cookies carry the flow. External redirect-URI settings: [operations.md](operations.md) § External
configuration.

**Identity.** A Supabase Auth uuid is mapped to this app's pre-existing Google-`sub`-as-text identity
(`app_users.id`) through `auth_user_map`; `requireUser()` (`lib/auth.ts`) returns `{ userId, email, accessToken }`.

**Session cookies.** httpOnly Supabase cookies. Only the OAuth pair and sign-out ever write them (`writableCookies`
in `lib/auth.ts`); every other function reads them through a read-only adapter whose `setAll` is a no-op. **There
is no session refresh:** a session expires with Supabase's configured access-token lifetime (default one hour) —
an explicit, approved scope boundary (see the header of `lib/auth.ts` and
`docs/superpowers/specs/2026-09-09-supabase-auth-migration-design.md`). The cookie's lifetime is this app's own
responsibility via `writableCookies`, so QA should include closing and reopening the browser.

**Client side.** `useAuth` asks `/api/auth-session`, keeps an identity *hint* in `grocery.session.v1` for the first
paint, and calls `clearBootCaches()` on sign-out, on a confirmed 401, and when the answer names a different user
("Boot & data loading"). **Account deletion** (`DELETE /api/auth-delete-account`, "Hesabı Sil") deletes the
caller's owned households (cascading their data), their invites into others' households, the `app_users` row
(cascading `personal_plan`, `saved_meals`, `auth_user_map`) and the Supabase Auth user, records an optional
anonymous reason last (`supabase/27`), and expires the cookies; households owned by someone else are left alone.
**Admin** writes use `requireAdmin` and `ADMIN_EMAILS` ("Nutrition"). The local-only agent login is described in
[operations.md](operations.md).

## State & persistence

**`App.tsx` owns the app's state by composing hooks** from `src/hooks/` (`useAuth`, `useTenants`,
`useListSync`, `useRollover`, `useUiPrefs`, …) and passing the results down through props — there is no
global store. List state is one object per tenant, held by `useListSync`. Server-backed meal-plan data
(`useMealPlan`, `useBatches`, `useSavedMeals`, `useFoodCatalog`) goes through TanStack Query
(`QueryClientProvider` in `src/main.tsx`). `src/lib/*.ts` holds pure logic and localStorage I/O;
components stay mostly presentational. To find which component is actually live for a screen, trace
`App.tsx`'s section routing rather than guessing from a component's name. Persistence is split across
several independent layers with different scopes:

| Layer                                          | Key(s) / store                                                                         | Scope             | Synced to server?                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------- |
| Tenants (households)                           | Supabase `households` table, via `/api/households`                                     | shared (Supabase) | yes                                                  |
| List state (`{ lists, activeId, version }`)    | `grocery.state.v1:<tenantId>` (local cache) + Supabase `sync_state` table              | per tenant        | yes, via `api/state.ts`                              |
| Category overlay (renames/hide/reorder/custom) | `grocery.categories.v1`                                                                | device            | no                                                   |
| Item name → category memory                    | `grocery.itemCategories.v1:<tenantId>` (local cache) + Supabase `item_category_memory` | per tenant        | yes, via `api/item-category-memory.ts`               |
| UI prefs (theme, swipe mode)                   | `grocery.theme.v1`, `grocery.swipeMode.v1`                                             | device            | no                                                   |
| Onboarding quick-setup seen?                   | `grocery.onboarding.v1:<userId>`                                                        | device             | no                                                    |
| Personal plan profile | `grocery.personalPlan.v1:<userId>` (local cache) + Supabase `personal_plan` table | per user | yes, via `api/personal-plan.ts` |
| Boot cache (session hint, active tenant) | `grocery.session.v1`, `grocery.activeTenant.v1` (`src/lib/bootCache.ts`, alongside the `grocery.state.v1:` mirror) | device | no |
| Nutrition catalog cache | `grocery.nutrition.v1` (`src/lib/nutrition.ts`) | device | no (cache of `/api/nutrition`) |
| Nutrition browse cache | `grocery.nutrition.browse.v1` (`src/lib/nutrition.ts`, `browseNutritionCached`): first page only, one entry per query, expires after `BROWSE_CACHE_TTL_MS` (5 min); dropped whenever nutrition rows are saved | device | no (cache of `GET /api/nutrition`) |
| Meal-plan / nutrition UI prefs | `grocery.showNutritionValues.v1`, `grocery.shoppingTab.v1`, `grocery.mealPortion.v1` (`src/lib/preferences.ts`) | device | no |

Category customization stays device-local even though it's keyed by tenant. Item category memory
now syncs across devices for the same tenant (NUT-13): the local cache paints instantly, then a
background fetch merges in the server copy (server wins on conflict), and every explicit category
correction pushes to Supabase in addition to localStorage. Starting a new list stamps the old one with
`closedAt` and files it into History rather than deleting it; a list only goes away if the user
explicitly deletes it from History (`deleteList()` in `src/lib/listActions.ts`, undoable like any other
removal). `buildCatalog()` (`src/lib/store.ts`) collapses every item ever added across all *remaining*
lists into a name/count/last-bought table that backs the "Ürün ekle" autocomplete (`AddItem.tsx`) —
so deleting a History entry also drops its items' contribution to that aggregate. There is no
separate "Bul" tab/search view anymore: it was a near-duplicate of the same catalog-backed
suggestion list, so it was folded into `AddItem.tsx` (shows "en çok alınan" on focus even before
typing, with a "Tümünü göster" expand) rather than kept as its own tab.

## Tenants

**Tenants** (`src/lib/store.ts` + `src/lib/households.ts`, driven by the `useTenants` hook) model separate
households. The tenant list isn't device-local: it's rows in Supabase's `households` table,
fetched/created/renamed/deleted through `/api/households` (`api/households.ts`, the caller's own Supabase
session for every verb, including reads). On boot `useTenants` (`src/hooks/useTenants.ts`, composed by
`App.tsx`) calls `listHouseholds()`; only a successful but *empty* answer seeds a first household — "Evim",
with a generated id — via `createHousehold()`, so a fresh project still boots. A `null` answer means the request
itself failed (expired cookie, 502, offline): the hook keeps the optimistic tenant and never seeds.
(`DEFAULT_TENANT_ID = "default"` in `store.ts` is not used anywhere today.) Deleting a household
(`DELETE /api/households?id=`) cascades `lists`/`items`/`item_category_memory`/`sync_state` via Supabase FK
constraints — no manual cleanup needed. Switching tenants tears down and recreates the sync channel: the effect
in `useListSync` (`src/hooks/useListSync.ts`) is keyed on `activeTenantId` and calls `sync.stop()` in its
cleanup, so a push from tenant A can never land on tenant B.

## Supabase RLS

`api/*.ts` (see `docs/superpowers/specs/2026-09-09-supabase-auth-migration-design.md` for the full
migration design) authenticates to PostgREST as **the caller's own Supabase session**
(`lib/auth.ts`'s `userRestHeaders`), not `anon`/`service_role`, so Postgres row-level security policies
on `households`/`lists`/`items`/`item_category_memory`/`meal_entries`/`preparation_batches`/
`sync_state`/`personal_plan`/`household_shares` (`supabase/19-auth-user-map-and-
rls.sql`) and `saved_meals` (`supabase/28-saved-meals.sql`, one per-user policy like `personal_plan`) are a real, independent second authorization layer behind the existing function-layer checks
(`requireUser`/`requireHouseholdAccess`) — not a replacement for them. Three
`security definer` helper functions do the real work so policies don't have to re-implement the same
logic: `current_app_user_id()` maps `auth.uid()` (a Supabase Auth uuid) to this app's pre-existing
Google-`sub`-as-text identity via `auth_user_map`, `has_household_access(hh_id)` checks
owner-or-invited access to a household, and `has_household_share(hh_id)` isolates the invite-lookup
half of that (see the recursion note below). They live in `app_private`, not `public`
(`supabase/22-security-definer-functions-to-private-schema.sql`) — `public` is the only schema
PostgREST exposes as `/rest/v1/rpc/*`, so a schema not on that list is unreachable by anon/authenticated
callers directly while remaining fully callable from RLS policies, which invoke functions via plain
schema-qualified SQL untouched by that setting. (An earlier attempt just revoked `EXECUTE` on the
`public`-schema versions per role — `supabase/21-security-definer-execute-grants.sql` — but Supabase's
linter flags a security-definer function as a warning for *any* role able to reach it via RPC, and
`authenticated` can't lose that grant without breaking every policy that calls it; moving schemas
instead of narrowing grants is what actually clears the warning.)

**Hard rule: a table's own SELECT policy must never re-query that same table.** `households_select` once
delegated to `has_household_access(id)`, whose sub-query back into `households` cannot see a row the same
`INSERT ... RETURNING *` is still creating (`api/households.ts` sends `Prefer: return=representation` on every
write), so every household creation failed with the exact same "new row violates row-level security policy"
message as a genuine `WITH CHECK` failure — even though the insert's own check was correct. The fix
(`supabase/20-households-select-returning-recursion-fix.sql`) compares `owner_id` on the row directly. The naive
alternative, inlining the `household_shares` lookup, recurses (`42P17: infinite recursion detected in policy`,
because `household_shares`'s own policy queries `households`), so that half stays in its own `security definer`
function, `has_household_share()`, which bypasses RLS instead of re-entering it. `households` is the only table
where this applies — every other table's policy checks *upward* into `households`, never its own table — unless a
future policy is written to re-query its own table. The full root-cause writeup is the header comment of migration
`20` (and NUT-53).

## Persistence & schema map

_Verified against code: 2026-09-21 @ 6f93963 (grep of `supabase/*.sql`); confirm a table's current shape in the
migration itself._

**Schema authority.** The schema is the numbered migration files `supabase/01`–`28`, applied by hand in order
(see [operations.md](operations.md) § External configuration). There is **no single canonical schema file**:
`01-schema.sql` holds only the early tables (`lists` and `items` are unused today), `meal_entries` is created in
both `01` and `07`, and the repo has **no `CREATE TABLE` for `nutrition`** (only `ALTER`s and RLS in `14`, `16`,
`24`), so the database cannot be rebuilt from the repo alone. A change is a **new numbered file**, not an edit to an
applied one — `20` fixes `19`'s policy, `18` fixes `17`'s, `22` moves `21`'s functions. For column names and types,
read the migration that creates or alters the table.

| Table | Created / changed in | RLS policies | Served by |
| --- | --- | --- | --- |
| `households` | `01`; policy fix `20` | `19` | `households.ts` |
| `household_shares` (invites) | `05` | `19` | `household-shares.ts` |
| `sync_state` (list blob per tenant) | `06` | `19` | `state.ts` |
| `lists`, `items` | `01` | `19` | none (dead; only `state.ts` hydration reads them) |
| `item_category_memory` | `01` | `19` | `item-category-memory.ts` |
| `meal_entries` | `01` and `07`; `combo_id` `12` | `19` | `meal-entries.ts` |
| `preparation_batches` | `17`; RLS drift fix `18` | `19` | `preparation-batches.ts` |
| `personal_plan` (per user) | `08`, `09`; exclusions `10`, `13`, `15` | `19` | `personal-plan.ts` |
| `saved_meals` (per user) | `28` | `28` | `personal-plan.ts` (`/api/saved-meals`) |
| `nutrition` (global) | no CREATE in repo; `14`, `16` alter | `24` (SELECT only) | `nutrition.ts` |
| `app_users` | `03` | RLS on, no policy (service role only) | `lib/auth.ts`, `auth-google.ts` |
| `auth_user_map` | `19` | RLS on, no policy (service role only) | `lib/auth.ts` |
| `agent_login_tokens` | `25` | RLS on, no policy (service role only) | `agent-login.ts` (local-only) |
| `account_deletion_feedback` | `27` | RLS on, no policy (service role only) | `auth-delete-account.ts` |
| `hidden_households` | `04`; FK index `23`; **dropped in `26`** | — | none |

RLS helper functions (`current_app_user_id()`, `has_household_access()`, `has_household_share()`) live in the
`app_private` schema (`19`, `21`, `22`); "Supabase RLS" explains why.

## Sync

**Sync** (`src/lib/sync/sync.ts` + `api/state.ts`) is a polling + optimistic-concurrency
scheme, not a websocket: the client polls `GET /api/state?tenant=<id>` every `POLL_MS` and on tab focus,
and pushes `PUT` `PUSH_DEBOUNCE_MS` after any local change (both constants sit at the top of
`src/lib/sync/sync.ts` — read them there, not from a number written here); a `PUT` with a stale `version` gets rejected with 409
and the current server state, which the client adopts. Last-write-wins by design — deliberately good
enough for a household of 2-4, not a CRDT. The backing store is the Supabase `sync_state` table
(one row per tenant — `household_id`, `version`, `state jsonb`; see `supabase/06-sync-state.sql`),
with the version check done via a conditional PostgREST `PATCH`. If `sync_state` has nothing for a
tenant yet, `state.ts` tries a one-time hydration from the Supabase `lists`/`items` tables
(`hydrateFromSupabase()`) before falling back to `state: null` — this only fires for a household that
exists via `/api/households` but has never had a first `/api/state` PUT.

A per-row Supabase CRUD path for `lists`/`items` (`supabase/01-schema.sql`) was scaffolded early on
(client wrappers in `src/lib/sync/`, function counterparts) as groundwork for eventually replacing
the single-blob-per-tenant sync with normalized per-row persistence, but nothing ever called it —
it was removed as dead code (the old, now-historical `docs/archive/roadmap.md` #1 sketched this direction; no live roadmap tracks it). `item_category_memory`
(also in `01-schema.sql`) is wired up — see the Categorization section below.

## Boot & data loading

_Verified against code: 2026-09-21 @ 6f93963. Design record and measurements:
[the 2026-09-17-02 checkpoint](session-checkpoints/2026-09-17-02-boot-performance-waterfall.md)._

A reload used to run `/api/auth-session` → (`/api/households`, `/api/personal-plan`, `/api/nutrition`) →
(`/api/state`, `/api/item-category-memory`) as three serial tiers. Now the calls start together and the first
frame paints from local caches.

- **`useTenants`** resolves `activeTenantId` synchronously from `?tenant=` or `grocery.activeTenant.v1`; the
  households fetch then *reconciles*. If the optimistic id is real it hands back the identical string, so no update
  fires — load-bearing, because `useListSync` keys its effect on `[activeTenantId]` and a new value tears down the
  in-flight sync channel. A `null` from `listHouseholds()` (401/502/network) is *not* "empty account": it must never
  trigger the seed-a-household branch.
- **`useAuth`** keeps a session hint (`grocery.session.v1`, `{ email, userId }`) and exposes it as `cachedSession`;
  **`App.tsx`** mounts the shell from `effective = session ?? (checked ? null : cachedSession)`. That expression is
  load-bearing: once the real answer lands the hint stops counting, so a stale cache never outlives a confirmed
  401.
- **`useListSync`** paints from the `grocery.state.v1:<tenantId>` mirror; the first pull still decides via the
  version gate. `createSync` takes `initialState` (presetting `lastSentSerialized`, so a restored cache is not PUT
  straight back) and `onFirstPullSettled` (`useRollover` waits for it). `pull()` rebaselines when the version matches
  but the content differs — the local copy is newer, so it re-pushes rather than stranding an offline edit.
- **`src/lib/bootCache.ts` owns all boot-path keys** so `clearBootCaches()` can wipe them together: on sign-out, on
  account deletion, on a confirmed 401, and when `/api/auth-session` names a different `userId` than the hint.
- **Server side:** `requireUser()` runs its two remote hops concurrently, and `requireHouseholdAccess()` races the
  data read **on GET paths only**; `/api/nutrition` GET answers with `cache-control: private, max-age=300,
  stale-while-revalidate=3600`.

**Invariants — no authorization decision moved.** (1) The `sub` decoded locally (`claimedUid` in `lib/auth.ts`) is
only a speculative key for the `auth_user_map` lookup; its result is discarded unless `getUser()` independently
succeeds *and* returns the identical uuid. (2) The speculative GET reads run under the caller's own token, so RLS
already returns nothing for an unreachable household; `requireHouseholdAccess` was *not* replaced by RLS, and
PUT/POST/PATCH/DELETE still check access strictly first. (3) The session hint is an identity hint, never a token,
and authorizes nothing — every handler still validates the real cookie.

**Known residual:** if user A's cookie expires without a sign-out and user B then signs in on the same browser
profile, A's cached lists can show for the ~1 s until `/api/auth-session` answers and the caches are wiped.
`clearBootCaches` does not clear the older keys (`grocery.nutrition.v1`, onboarding, theme/prefs). **Not done:**
`getClaims()` / custom JWT claims (Phase 4d) and the asset work (self-hosted fonts). Open items:
[CURRENT_STATE.md](CURRENT_STATE.md).

## Categorization

**Categorization** is three layered pieces, in order of precedence when an item is added:

1. `src/lib/categorization/itemCategories.ts` — if this item name was ever manually assigned a category before
   (in this tenant), reuse it. `useItemCategories()` (`src/hooks/`) paints from the local cache
   immediately on tenant switch, then merges in `item_category_memory` from Supabase in the
   background (server wins on conflict); `rememberCategory()` writes both the local cache and a
   best-effort `PUT /api/item-category-memory` on every explicit correction, so a fix on one device
   reaches the others (NUT-13). Auto-guessed categories (layer 2 below) are never pushed — only
   explicit corrections are remembered.
2. `src/lib/categorization/categories.ts` — otherwise, `categorize(name)` guesses from the built-in Turkish grocery
   taxonomy (aisle layout modeled on Migros/CarrefourSA) using Snowball Turkish stemming, curated
   per-category keyword lists, and a head-noun fallback table for compound names like "chia tohumu"
   or "karabuğday ekmeği" that aren't worth enumerating explicitly.
3. `src/lib/categorization/userCategories.ts` — the built-in taxonomy plus per-device renames/hide/reorder/custom
   categories are merged via `mergeCategories()` into the list actually shown in the UI; `diger`
   ("Other") is treated as "uncategorized" everywhere and re-guessed on demand so classifier
   improvements retroactively apply without a data migration.

## Nutrition

**Nutrition is a separate backend**, not part of the synced list state. `src/lib/nutrition.ts` calls
`/api/nutrition` (`api/nutrition.ts`), which
proxies to a Supabase `nutrition` table via PostgREST: reads use the anon key, writes use the
service_role key, both kept server-side so the client never sees them.

**`public.nutrition` is one global table shared by every household — a write changes what every user
sees — so writes are admin-only.** `PUT /api/nutrition` (bulk `{ rows }` upsert, merge-duplicates on
`name_tr`) runs `requireAdmin()` from `lib/auth.ts` after `requireUser()`: the caller's
server-verified email must be in the comma-separated **`ADMIN_EMAILS`** env var, otherwise 403. The
check fails closed — an unset or empty `ADMIN_EMAILS` means nobody can write. Reads (`GET` browse,
`POST` by names) stay open to any signed-in user. RLS on the table also allows `SELECT` only
(`supabase/24-nutrition-rls.sql`), so a direct PostgREST write with the anon/user key is refused too.

There is no per-user edit of nutrition values in the app. Ways to change the data:

- **Hidden maintenance modal** — Settings → tap the page heading in the pause-separated rhythm
  1 · 3 · 2 · 7 (see `src/hooks/useTapSequence.ts`), which opens
  `src/components/dev/NutritionUploadModal.tsx` to paste a JSON array. The tap rhythm only hides the
  UI; it is *not* the security boundary — the endpoint's admin check is.
- **`scripts/upload-nutrition.ts`** — seeds `data/nutrition.json` straight to Supabase with the
  service-role key (no HTTP, no `ADMIN_EMAILS`).

`docs/nutrition-prompt.md` is a copy-paste LLM prompt for turning free-form nutrition text into the
row JSON both expect.

## Personal meal planning

The `Kişisel Plan` section is an additive personalization surface. It stores one adult profile per
signed-in *user*, not per household (a household can have several invited members): a row in the
`personal_plan` table (`supabase/08-personal-plan.sql`, `09-personal-plan-user-scoped.sql`) served by
`api/personal-plan.ts` (`GET`/`PUT`), mirrored in a local cache under `grocery.personalPlan.v1:<userId>`
that paints first while the server copy wins (same pattern as item-category memory); before a session
exists it falls back to a bare device-local key. It does not write meal plans, shopping lists, or the
legacy `meal_entries` API. The profile collects weight, height, age, an explicit sex-specific
equation convention, activity level, goal, and optional waist measurement. Gender identity is not
inferred from the equation convention.

Targets are estimates: Mifflin-St Jeor estimates resting energy, an activity multiplier estimates
maintenance energy, and maintenance/loss/gain targets apply conservative adjustments. BMI and waist
are context signals only, not diagnoses or direct calorie formulas. The first version is limited to
adults and does not provide automated targets for pregnancy, breastfeeding, minors, eating-disorder
recovery, medical conditions, therapeutic diets, or micronutrient adequacy.

The `Kaynakları göster` switch exposes a feature-to-source map. It links profile and energy
planning to the [NIDDK Body Weight Planner](https://www.niddk.nih.gov/bwp) and
[NCBI Endotext](https://www.ncbi.nlm.nih.gov/books/NBK278991/), activity to
[WHO physical activity guidance](https://www.who.int/news-room/fact-sheets/detail/physical-activity),
macro/fiber ranges to the [National Academies DRI tables](https://www.ncbi.nlm.nih.gov/books/NBK545442/)
and Endotext, and BMI/waist context to Endotext. These references support the formulas and
boundaries but do not turn the feature into medical advice.

### Saved meals (Yemeklerim)

A user's own reusable meals live in the `saved_meals` table (`supabase/28-saved-meals.sql`): `id`,
`user_id`, `name`, `items` (jsonb, `[{ food_id, quantity_g }]`, where `food_id` is `nutrition.name_tr`
like `meal_entries.food_id`) and an optional `steps` (jsonb, free text). It is per user, not per
household, like `personal_plan`: RLS is one policy on `user_id =
app_private.current_app_user_id()`, and deleting the `app_users` row cascades, so account deletion
needed no change. A saved meal stores only foods and grams; totals are always derived from the live
nutrition catalog, and one with `steps` counts as a recipe (Tarifler) — there is no recipe table.

There is no `api/saved-meals.ts`. The project is at the 12-function Hobby limit, so `api/personal-plan.ts`
serves a second resource: `vercel.json` rewrites `/api/saved-meals` to
`/api/personal-plan?_resource=saved-meals` (GET list, POST create with a client id, PATCH `?id=`,
DELETE `?id=`; a per-user cap answers 409). The client side is `src/lib/savedMeals.ts` (type,
validation, the `savedMealToCombo` adapter that lets saved meals reuse every `Combo` helper, and the
fetch wrappers) and `src/hooks/useSavedMeals.ts`. The Yemekler sheet is `src/components/MealsSheet.tsx`
(tabs Yemeklerim / Hazır Yemekler / Tarifler).

The limits (name length, item and step counts, characters per step, grams per item, and a per-user cap) are
enforced server-side in `api/personal-plan.ts` and partly mirrored in `SAVED_MEAL_LIMITS` in
`src/lib/savedMeals.ts` — read them there, not from a number written here. A client-side rejection or a server
400/409 shows one neutral Turkish failure message.

"Sana uygun" is `src/lib/mealRecommend.ts`: a pure function (no network, no AI) that filters the meals a
slot accepts, gives the slot a share of the day's remaining macros, picks the best portion tier per
meal with `scoreInstance`, and returns the top few. The per-slot weights (`SLOT_WEIGHT`) are MVP tuning
constants, not derived from a source. Its snack results are only as good as the slot tags in
`data/combos.json`. Product scope: `docs/mvp-scope/meal-construction-mvp.md`.

## Deployment & environment

Running, configuring and deploying the app is in [operations.md](operations.md): the env-var inventory, how
`vercel dev` loads `.env`, agent sessions, `.vercelignore`, manual deploys and the function-count limit. The
boundaries that shape the architecture:

- **Vercel is the sole deploy target, and deploys are manual and developer-run** — pushing or merging to `master`
  never deploys.
- **The project is at the 12-function Hobby limit**, which is why `auth-google.ts` serves two public paths and
  `personal-plan.ts` serves `/api/saved-meals` (rewrites in `vercel.json`).
- **`agent-login.ts` is excluded from every deployment** by `.vercelignore`.
- **All Supabase and Google credentials are server-side env vars**; the frontend bundle reads none.

## Daily rollover

**Daily rollover** (`rolloverIfNeeded` in `store.ts`) is client-triggered, not a cron: it runs on
mount, on tenant switch, and on `visibilitychange`. If the active list was created on a previous
calendar day and has items, it's archived (`closedAt`) and a fresh list opens with unchecked items
carried over under new ids. Offered as an undo via the same `Undo` mechanism as item removal.

## Design tokens & theming

**Design tokens** live in `src/index.css` under `@theme` (Tailwind v4, no `tailwind.config`). Themes use
exactly one accent color (`--color-signal`) for both the progress fill and destructive actions —
`--color-destructive` is set equal to `--color-signal`. That single-accent look was never meant to be a
rule the rest of the palette has to follow, though: a theme is free to give destructive its own hue where
it reads better, so check a theme's own block rather than assuming. Quantities, counts, and dates use the
`.ledger` utility (`tabular-nums`, right-aligned, app's normal sans font) so they read as a stacked ledger
column — deliberately not a monospace font: most monospace stacks render a slashed zero to disambiguate it
from "O" in source code, which reads as a stray mark in a consumer nutrition/shopping context.

**Theming** is a picker, not a light/dark toggle. The available themes are `THEME_OPTIONS` in
`src/lib/preferences.ts` (read the list there; at the time of writing `light`/"Nane" and
`arduvaz`/"Arduvaz"). The picker once offered 9 and was cut back by an explicit product decision;
`loadTheme()` resets a stored retired theme to `light`. The default theme's tokens live on `:root` and
every other theme is a full `:root[data-theme="<id>"]` block in `index.css`. `ThemeSwitcher.tsx` renders the
picker, writes the chosen id to `data-theme` on `<html>`, and persists it via `grocery.theme.v1` in
`localStorage`. `THEME_META_COLOR` (also in `preferences.ts`) mirrors each theme's `--color-background` as
a literal hex for the PWA `theme-color` meta tag, since that can't read a CSS custom property.

### UI patterns (Smooth Pill, bottom sheets)

The two shared UI patterns every new screen must reuse (`CLAUDE.md`'s `## UI patterns` stub points here).

- **Smooth Pill (SP)** — the standard tab style across the app: a light `bg-accent/50` container
  (`rounded-lg p-1`), with the active tab rendered as its own `bg-background` pill
  (`rounded-md shadow-signal-sm`) and inactive tabs as plain
  `text-muted-foreground hover:text-foreground` text, no visible border. `shadow-signal-sm` (defined
  in [src/index.css](../src/index.css)) is the same footprint as Tailwind's `shadow-sm` but tinted with
  `--color-signal` via `color-mix` instead of flat black, so it stays theme-aware.
  Implemented once in [src/components/ui/smooth-pill.tsx](../src/components/ui/smooth-pill.tsx):
  `<SmoothPillTabs value={...} onChange={...} items={[{ value, label }]} />` for the common case
  (a plain button group not already wired to a Radix `Tabs` root — see its usage in
  [src/components/NutritionView.tsx](../src/components/NutritionView.tsx)), plus exported class
  constants (`SP_CONTAINER_CLASS`, `SP_TRIGGER_CLASS`) for a Radix `TabsTrigger` that must also
  drive a `Tabs` root elsewhere in the tree — see the Liste/Geçmiş/Kategoriler tabs in
  [src/components/AppHeader.tsx](../src/components/AppHeader.tsx). `SP_TRIGGER_CLASS` already cancels
  the base `TabsTrigger`'s default `border-b-2`/`data-[state=active]:border-foreground` underline
  (from [src/components/ui/tabs.tsx](../src/components/ui/tabs.tsx)), which otherwise draws a dark
  bottom border through the pill background — if you ever build a new Radix-based SP trigger by
  hand instead of using the constant, remember to cancel that underline yourself.

- **Bottom sheets** — build new ones on
  [src/components/ui/bottom-sheet.tsx](../src/components/ui/bottom-sheet.tsx) (backdrop, dialog, grabber,
  title + close header), not a hand-rolled overlay. It gives you swipe-down-to-dismiss from anywhere on
  the sheet (`useSwipeToDismiss`; mark a region `data-sheet-no-drag` to opt it out) and keyboard-aware
  sizing (the container tracks the visual viewport via the `--visual-vh`/`--visual-top`/`--kb-inset`
  vars that `useVisualViewportVars` publishes from `AppShell`). Give the sheet's scrolling list
  `min-h-0 overflow-y-auto overscroll-contain` so it — not the search field — shrinks under the
  keyboard. For a search whose results render inline below a field, call `useRevealAboveKeyboard`.

## Security boundaries

_Verified against code: 2026-09-21 @ 6f93963 (grep of service-role use)._

- **Browser ↔ `/api/*`:** an httpOnly cookie session. Only `auth-google.ts` (start/callback) is public; every
  other function calls `requireUser()` first, except `auth-logout.ts` (it only clears cookies).
- **Function ↔ PostgREST:** data requests use the caller's own Supabase token so RLS applies. The **service role**
  is used only where RLS cannot express the check: `requireUser`'s `auth_user_map` lookup and
  `requireHouseholdAccess` (`lib/auth.ts`), `meal-entries.ts`'s `mealEntryHouseholdId`, `nutrition.ts` PUT (after
  `requireAdmin`), `auth-google.ts`'s callback (identity linking), `auth-delete-account.ts`, and the two local-only
  login endpoints. Adding a service-role call is a security-relevant change — say why in the function's header.
- **Admin surface:** only `PUT /api/nutrition`, gated by `ADMIN_EMAILS` (fail-closed). The hidden Settings modal that
  calls it is a convenience, not the boundary.
- **Local-only login:** `agent-login` mints a session for a bounded window and exists only in local sessions;
  procedures and the never-merge rule are in [operations.md](operations.md).
- **What Claude may never touch** (env files, secret values, and every route to them) is `CLAUDE.md`'s secrets
  boundary, not restated here.

## Related docs

[operations.md](operations.md) (run, env, deploy) · [knowledge-map.md](knowledge-map.md) (what to read for a task) ·
[superpowers/specs/](superpowers/specs/) and [superpowers/plans/](superpowers/plans/README.md) (why features were
designed as they were — SNAPSHOTs) · [CURRENT_STATE.md](CURRENT_STATE.md) (current state and open items) ·
`supabase/` (the schema, as ordered migrations).
