# NUT-24 Stream B — Auth guard + per-user hidden households

Date: 2026-08-25
Branch: `feat/stream-b-auth-guard-hidden-households`
Status: implemented, uncommitted, awaiting Stream A merge

## Scope

Sub-issue of NUT-24. Closes the "anyone with the app URL" hole on existing
data endpoints and adds a per-user hidden-households preference.

## New files

- `supabase/04-hidden-households.sql` — table with FK to `app_users` and
  `households`, primary key `(user_id, household_id)`, idempotent.
- `netlify/functions/_auth.ts` — placeholder throwing 401 unconditionally.
  Contract: `requireUser(request) -> AuthUser` or throws `AuthError`.
  Stream A replaces this file with the real Google-cookie check.
- `netlify/functions/hidden-households.ts` — GET/POST/DELETE, filtered by
  `auth.userId`. POST uses PostgREST `resolution=merge-duplicates` so
  double-hide is idempotent.
- `src/lib/hiddenHouseholds.ts` — client wrapper mirroring
  `src/lib/households.ts` shape.

## Modified files

- 7 netlify functions — `households.ts`, `lists.ts`, `items.ts`,
  `item-category-memory.ts`, `nutrition.ts`, `state.ts`, `meal-entries.ts`.
  Same 2-line change in each: `try { await requireUser(request); } catch
  (err) { return authErrorResponse(err); }` at the top of the default
  dispatcher, plus one import line.
- `src/hooks/useTenants.ts` — loads hidden ids alongside households, exposes
  `visibleTenants`, `hiddenIds`, `toggleHiddenTenant`. Refuses to hide the
  last visible household. Auto-switches when hiding the active tenant.
  Drops from `hiddenIds` when a household is deleted.
- `src/components/TenantSwitcher.tsx` — Eye/EyeOff button per row (lucide),
  dimmed name for hidden. Hidden rows still show in the switcher so the
  user can unhide them; the switcher itself always receives the full
  tenant list.
- `src/components/AppHeader.tsx` — extended `Props` with `hiddenTenantIds`
  and `onToggleHiddenTenant`, forwarded to `TenantSwitcher`. No filtering
  at this layer.
- `src/App.tsx` — passes `hiddenIds` and `toggleHiddenTenant` through to
  the header. Full `tenants` still flows through so the switcher shows
  hidden rows.

## Verification

- `npm run build` — passes (tsc + vite).
- `npx tsc --noEmit -p netlify/functions/tsconfig.json` — passes after
  fixing `./_auth.ts` -> `./_auth` (the netlify tsconfig uses `bundler`
  moduleResolution but does not enable `allowImportingTsExtensions`).
- Manual 401 curl deferred to runtime; the placeholder guarantees any
  `/api/*` call returns 401 today.

## Merge notes for Stream A

- Delete `netlify/functions/_auth.ts` placeholder when Stream A's real
  module lands. The contract is fully compatible: `requireUser(request) ->
  Promise<AuthUser>` where `AuthUser = { userId, email }`, throws
  `AuthError { status, message }` on failure. All 8 call sites already
  translate the throw via `authErrorResponse(err)`.
- `App.tsx` and `AppHeader.tsx` touches are add-only props; rebase should
  be trivial.
- `supabase/04-hidden-households.sql` must run after Stream A's
  `03-app-users.sql` because the FK targets `app_users(id)`.

## Not committed

Working tree left for review per the project's git-write guardrail.
