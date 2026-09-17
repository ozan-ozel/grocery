# Boot performance: collapse the API waterfall

**Date:** 2026-09-17
**Status:** `NOT_STARTED` — see `docs/superpowers/plans/README.md` for the authoritative row.
**Branch:** `perf/boot-waterfall`

## Context

Reloads are slow. Measured live via Playwright against `npm run vercel:dev` (authenticated hard
reload), six API calls fire in **three strictly serial tiers** before the shopping list renders:

| tier | starts | calls | duration |
| --- | --- | --- | --- |
| 1 | t=1.70s | `/api/auth-session` | 1.76s |
| 2 | t=3.47s | `/api/households`, `/api/personal-plan`, `/api/nutrition?limit=1000` | ~2.2s each |
| 3 | t=5.68s | `/api/state?tenant=X`, `/api/item-category-memory?household_id=X` | ~2.2s each |

~7.9s of API waterfall. Local `vercel dev` inflates the absolute numbers, but the structure is real
in production. Two independent causes:

1. **Client serialization.** Nothing mounts until `/api/auth-session` resolves, and `/api/state`
   can't start until `/api/households` resolves — even though the active tenant id is already sitting
   in the URL (`?tenant=`) and readable synchronously at mount.
2. **Server per-call cost.** `requireUser()` runs on every endpoint and makes two *serial* remote
   round trips (`getUser()` re-verification + an `auth_user_map` REST lookup), then
   `requireHouseholdAccess()` adds another before the data fetch even starts.

Intended outcome: one parallel tier instead of three, ~1s of API waterfall instead of ~7.9s, and a
real list on screen in the first frame for returning users.

**Scope decision:** client-side phases plus the zero-security-tradeoff server work. Explicitly **out
of scope**: `getClaims()` / custom JWT claims (needs a Supabase project-level migration to asymmetric
signing keys and trades away revocation checking — revisit only if prod per-call latency is still
dominated by the `getUser()` hop after Phase 4).

Each phase is independently shippable.

---

## Phase 0 — Prerequisite bug fix (must land with Phase 1)

`listHouseholds()` (`src/lib/households.ts:13-28`) returns `[]` on *any* failure — 401, 502, network
throw — which is indistinguishable from "genuinely empty". `src/hooks/useTenants.ts:50` reads `[]` as
"fresh Supabase" and calls `createHousehold(uid(), "Evim")`. Today the auth gate mostly hides this.
Phases 1 and 2 remove that gate, so an expired cookie would reliably mint a spurious household — and
because `lib/auth.ts:7-14` documents that there is deliberately **no session refresh**, cookies die on
Supabase's 1h default and this case is common, not exotic.

- Change `listHouseholds` to return `Household[] | null` (`null` = request failed).
- In `useTenants`, bail out of the auto-create branch entirely on `null` — keep the optimistic tenant
  and try again later. Only a real, successful, empty response may seed a household.

---

## Phase 1 — Remove the tenant gate (tier 3 → tier 1)

**Win ~2.2s. Low risk. Touches no auth code.**

Files: `src/hooks/useTenants.ts`, `src/lib/households.ts`, `src/App.tsx`.

`activeTenantId` gets a synchronous lazy initializer, the same shape `useMealPersonalization` already
uses for its profile:

```ts
const [activeTenantId, setActiveTenantId] = useState<string | null>(
  () => readTenantFromUrl() ?? loadLastTenant()
);
```

`readTenantFromUrl()` already exists at `src/lib/store.ts:95-103`. `loadLastTenant()` reads a new
`grocery.activeTenant.v1` key; write it alongside the existing `writeTenantToUrl(activeTenantId)`
effect at `src/hooks/useTenants.ts:85-87`. URL wins over cache, so shared links still open the right
household.

The `listHouseholds()` effect becomes **reconciliation, not resolution**. After mapping to `Tenant[]`:

```ts
setActiveTenantId(current =>
  current && effective.some(t => t.id === current)
    ? current                                  // same string → React bails, sync is NOT torn down
    : (effective.find(t => t.id === readTenantFromUrl()) ?? effective[0])?.id ?? null
);
```

Returning the identical `current` string is load-bearing: `useListSync`'s effect keys on
`[activeTenantId]` (`src/hooks/useListSync.ts:49`), so an unchanged id means the in-flight sync
channel is never torn down and re-pulled.

**Render guard.** `src/App.tsx:639` is `if (!tenants || !activeTenantId || !state)`. `tenants` is
consumed at exactly one other place — `tenants={tenants}` on the lazy `SettingsView`
(`src/App.tsx:753`). So drop `!tenants` from the guard and, in the `section === "ayarlar"` branch,
render the existing section suspense fallback while `tenants === null`.

Failure modes: a stale/revoked cached tenant makes `/api/state` 404, which `sync.pull()` already
swallows (`if (!res.ok) return`, `src/lib/sync/sync.ts:53`); reconciliation then switches to a valid
one — same wall-clock as today, never wrong state. Tenant switch and `addTenant`/`freshTenantIdRef`
paths are unchanged.

---

## Phase 2 — Remove the auth gate (tier 2 → tier 1)

**Win ~1.8s; composes with Phase 1 so all six calls land at t≈0. Medium risk — touches the
signed-out path.** Requires Phase 0.

Files: `src/hooks/useAuth.ts`, `src/App.tsx:43-65`.

We can't read the httpOnly cookie, but we can remember that we *had* a session. Add
`grocery.session.v1` holding `{ email, userId }` — an identity hint, **never a token**:

- written on every successful `/api/auth-session`
- cleared on any non-ok response, on the catch branch, and in `signOut()` / `deleteAccount()`

`useAuth` reads it in a lazy initializer; `App()` becomes:

```tsx
const effective = session ?? (checked ? null : cached);
if (!effective) return checked ? <LoginGate onSignIn={signInWithGoogle} />
                               : <AppBootSkeleton section={bootSection} />;
return <AppShell currentUserId={effective.userId} ... />;
```

`session` keeps its tri-state (`null` = checking, `undefined` = signed out, `Session` = signed in);
the `checked ? null : cached` arm is what stops a stale cache from outliving a confirmed 401.

**Security posture:** this is purely *rendering* optimism. The cached pair authorizes nothing — every
`/api/*` handler still calls `requireUser(request)` against the real cookie. Worst case for an expired
session is a ~1s skeleton while requests 401, then `LoginGate`. No unauthorized data is ever rendered.

---

## Phase 3 — Local-state-first paint

**Win: the remaining ~2.2s of *perceived* wait disappears for returning users. Medium risk.**

Files: `src/hooks/useListSync.ts`, `src/lib/sync/sync.ts`.

Cache synced state per tenant in `grocery.state.v1:<tenantId>`, including its `version`. Seed
`useState(() => loadCachedState(activeTenantId))`, and replace the `setState(freshSeed)` at
`src/hooks/useListSync.ts:30` with `setState(freshSeed ?? loadCachedState(...))` so tenant switches
are instant too. Persist in the existing `[state]` effect at line 51.

The version gate at `src/lib/sync/sync.ts:69` (`if (local.version !== version)`) does exactly the
right thing here and must not be touched: an unchanged server version skips `setState` (no re-render,
no flash), a changed one overwrites wholesale.

Three things to handle:

1. **Spurious push on every reload.** `lastSentSerialized` starts `""` (`src/lib/sync/sync.ts:35`), so
   the restored cache gets PUT straight back. Add an `initialState?: State | null` option to
   `createSync` that presets `lastSentSerialized`, and pass the same object `useListSync` seeded state
   with.
2. **`onEmpty`** (`src/hooks/useListSync.ts:41`) should return the cached state when one exists rather
   than `emptyState()` — if the server row is genuinely missing but we hold a cache, seeding from cache
   and letting the next push restore the row beats discarding lists.
3. **`useRollover`** now runs its mount `check()` against cached state instead of `null`, so an
   overnight reload can fire a rollover + toast, then a differing server version can overwrite and fire
   a second one. `rolloverIfNeeded` is idempotent so state stays correct, but the double toast is ugly
   — gate the mount check (or just the toast) on a first-pull-confirmed flag threaded from
   `useListSync`. Decide the exact shape during implementation.

**Accepted behavior change:** unsynced offline edits now survive a reload instead of being silently
dropped. They get pushed on mount; if the server moved on, the existing 409 branch
(`src/lib/sync/sync.ts:98-107`) adopts the server copy. This is an improvement over today's silent data
loss, but it is a real semantic change — test it deliberately.

---

## Phase 4 — Server per-call cost (zero-tradeoff subset)

**Win: ~2.2s → ~1.0-1.2s per call. No security tradeoff.** Ship as one commit.

### 4a. Parallelize `requireUser`'s two hops — `lib/auth.ts:161-211`

`getSession()` (line 171, local decode, free) already yields the same `sub` uuid that `getUser()`
returns, so the `auth_user_map` lookup doesn't need to wait:

```ts
const claimedUid = sessionData.session?.user?.id;   // local decode — NOT trusted
const [userResult, mapRows] = await Promise.all([
  supabase.auth.getUser(),
  fetchAuthUserMap(claimedUid),
]);
// then verify getUser() succeeded AND userData.user.id === claimedUid
// before using mapRows for anything at all.
```

The security property is preserved exactly: the decoded `sub` is used only as a *speculative cache
key*, and the result is discarded unless `getUser()` independently verifies and returns the identical
uuid. 2 serial RTTs → 1. Keep the warning comment at lines 175-177 accurate to the new flow.

### 4b. Parallelize `requireHouseholdAccess` with the data fetch

In `api/state.ts:74-81`, `api/item-category-memory.ts`, and `api/households.ts`'s by-id path, run the
access check concurrently with the data read and check access **before** touching the result:

```ts
const [access, row] = await Promise.allSettled([
  requireHouseholdAccess(tenantId, user),
  fetchRow(supabaseUrl, userRestHeaders(user), tenantId),
]);
if (access.status === "rejected") return authErrorResponse(access.reason);
```

No leak: the body is only constructed after the check passes, and the speculative read runs under the
caller's own token (`userRestHeaders`, `lib/auth.ts:219-227`) so RLS already returns nothing for an
inaccessible household. Do **not** remove `requireHouseholdAccess` in favor of RLS alone — it's the
documented first layer (`lib/auth.ts:232-234`) and once parallelized it costs nothing.

### 4c. Cache the food catalog — `api/nutrition.ts:53`

`JSON_HEADERS` is shared by every response including errors, so don't edit it in place — add a separate
header set for the GET/browse success path only:

```
"cache-control": "private, max-age=300, stale-while-revalidate=3600"
```

`private` is essential: the endpoint sits behind `requireUser` and must never land in a shared CDN
cache. Modest win, since `browseNutritionCached` (`src/lib/nutrition.ts:203-219`) already has a 5-min
localStorage TTL over the same data — this covers TTL misses and the `offset > 0` bypass. The 5-min
staleness window after a macro edit exactly matches that existing TTL, so nothing new is introduced.

**Not doing:** optimizing `hydrateFromSupabase`. `api/state.ts:114` returns early whenever the
`sync_state` row exists, so the serial lists→items path is a one-time bridge for tenants that have
never PUT. Near-zero value.

---

## Deliberately not in this plan

- **Trimming `/api/nutrition` and `/api/personal-plan` from boot.** After Phases 1-2 they're already
  parallel and non-blocking, and `initialSection()` defaults to `"yemek"` (`src/hooks/useUiPrefs.ts:24-32`)
  — the meal plan, which genuinely needs both. `useMealPersonalization` is already localStorage-first
  and its fetch drives the onboarding gate that renders in every section. Not worth the risk.
- **Asset work** — self-hosting fonts to kill the render-blocking Google Fonts round trips
  (`index.html:15-20`), and making the 43.7KB-gzip categorizer chunk at
  `src/lib/categorization/categorizeLazy.ts:19` load on `requestIdleCallback` instead of eagerly at
  module scope. Worth a few hundred ms at near-zero risk, but out of the chosen scope — easy standalone
  follow-up branch.

---

## Storage convention

Three new keys: `grocery.session.v1`, `grocery.activeTenant.v1`, `grocery.state.v1:<tenantId>`.
Follow the existing hand-rolled convention (try/catch at each site, silent best-effort fallback,
`grocery.<thing>.v1` with a `:<scopeId>` suffix) — see `src/hooks/useMealPersonalization.ts:57-86`,
`src/hooks/useOnboarding.ts:16-29`, `src/lib/nutrition.ts:113-136`, `src/lib/preferences.ts`. **Do not
extract a shared storage module in this pass** — three sites don't justify it, and it would bloat a diff
whose correctness needs to stay reviewable.

---

## Verification

No tests — `tsc -b` plus the real app, per `CLAUDE.md`. After each phase: `npm run build`, then
`npm run vercel:dev` on :3000 with a Playwright session (mint via `/api/agent-login`).

**Timing:** hard reload, then read `performance.getEntriesByType('resource')` filtered to `/api/` and
confirm the tier structure collapsed — after Phases 1-2 all six calls should start within ~100ms of
each other instead of at 1.7s / 3.5s / 5.7s.

**Per phase:**

- **0+1** — switch households in Settings (list must swap); delete the household you're on; hand-edit
  `?tenant=` to garbage and reload (must recover to a valid household, not hang, **not create one**);
  confirm no spurious row appears in the Supabase `households` table.
- **2** — sign out, clear `grocery.session.v1`, reload → `LoginGate`, zero API calls. Sign in, reload →
  all six at t≈0. Then delete the `sb-*` cookies in devtools but leave `grocery.session.v1` → brief
  skeleton, then `LoginGate`, and no household created.
- **3** — reload with a populated list → real list in the first frame, no skeleton. Edit on device A,
  reload B → B paints its cache instantly then updates within the pull. Go offline, add an item, reload
  while offline → item survives; back online → it pushes. Switch tenants → instant swap.
- **4** — `vercel dev` timing is too noisy for server work; measure on a preview deploy. For 4b test the
  negative path explicitly: `/api/state?tenant=<someone else's household>` must 404 with an empty body,
  not a leaked state blob.

## Close-out

App-infrastructure work — it does not touch a `docs/roadmap_v2.md` domain, an
`docs/mvp-scope/*-mvp.md` file, or a `nutrition-curriculum` DEC, so the trio rule does not fire.
Confirm that at wrap-up rather than silently skipping it. It **is** significant enough to warrant a
`docs/session-checkpoints/` record linked from `docs/SESSION_FOLLOWUP.md`, and this plan's row in
`docs/superpowers/plans/README.md` must be flipped to `SHIPPED` in the same commit that ships the work.
