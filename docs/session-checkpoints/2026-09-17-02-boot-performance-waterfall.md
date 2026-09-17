# Boot performance: collapse the three-tier API waterfall

_2026-09-17 — branch `perf/boot-waterfall`_

Implements [`docs/superpowers/plans/2026-09-17-boot-performance-waterfall.md`](../superpowers/plans/2026-09-17-boot-performance-waterfall.md).
Phases 0-3 (client) and 4a/4b/4c (server) are done. Phase 4d (`getClaims()` / custom JWT claims)
and the asset work were out of scope by the plan's own decision and remain undone.

## What was wrong

Reloads ran six API calls in three strictly serial tiers, ~7.9s of waterfall:

1. `/api/auth-session` gated the entire component tree.
2. `/api/households` + `/api/personal-plan` + `/api/nutrition`.
3. `/api/state` + `/api/item-category-memory`, gated on `/api/households` resolving a tenant id
   that was *already sitting in the URL*.

Independently, every endpoint paid `requireUser()`'s two serial remote hops (`getUser()`
re-verification, then an `auth_user_map` REST lookup), plus `requireHouseholdAccess()` ahead of the
data fetch.

## What changed

**Phase 0 — `listHouseholds()` returns `Household[] | null`** (`src/lib/households.ts`).
It used to return `[]` on 401/502/network throw, indistinguishable from a genuinely empty account,
and `useTenants` reads empty as "fresh Supabase, seed a household". Phases 1-2 remove the auth gate
that mostly hid this, so an expired cookie would have reliably minted a spurious "Evim" — and since
there is deliberately no session refresh (`lib/auth.ts` header), a 401 here is routine. `useTenants`
now bails out of the auto-create branch entirely on `null`.

**Phase 1 — tenant gate removed** (`src/hooks/useTenants.ts`, `src/App.tsx`).
`activeTenantId` resolves synchronously at mount from `?tenant=` or the new
`grocery.activeTenant.v1` key, so `/api/state` starts at t≈0. The `listHouseholds()` effect now
*reconciles* instead of resolving: if the optimistic id is real it hands back the identical string
so React bails out of the update, which is load-bearing — `useListSync` keys its effect on
`[activeTenantId]`, and any new value would tear down the in-flight sync channel. `tenants` dropped
out of `App.tsx`'s render guard; `SettingsView` is its only consumer and now shows its own section
fallback while the list is still null.

**Phase 2 — auth gate removed** (`src/hooks/useAuth.ts`, `src/App.tsx`).
`grocery.session.v1` remembers `{ email, userId }` so `App()` can mount `AppShell` immediately.
`session ?? (checked ? null : cachedSession)` is the load-bearing expression: the moment the real
answer lands the hint stops counting, so a stale cache can never outlive a confirmed 401.

**Phase 3 — local-state-first paint** (`src/hooks/useListSync.ts`, `src/lib/sync/sync.ts`,
`src/hooks/useRollover.ts`). State mirrors to `grocery.state.v1:<tenantId>`. `createSync` gained
`initialState` (presets `lastSentSerialized` so a restored cache isn't PUT straight back) and
`onFirstPullSettled`.

**Phase 4a** — `requireUser()`'s two remote hops now run concurrently (`lib/auth.ts`).
**Phase 4b** — `requireHouseholdAccess()` races the data read on the three GET paths.
**Phase 4c** — `/api/nutrition` GET/browse success responses get
`cache-control: private, max-age=300, stale-while-revalidate=3600`.

## Security notes — read before changing any of this

The optimizations are deliberately arranged so that **no authorization decision moved**. Three
places look risky and are not, for specific reasons that must survive future edits:

1. **Phase 4a's `claimedUid`.** The `sub` decoded locally from the cookie by `getSession()` is used
   *only* as a speculative cache key to start the `auth_user_map` lookup early. Its result is
   discarded unless `getUser()` independently succeeds **and** returns the identical uuid — there is
   an explicit `userData.user.id !== claimedUid` guard. `fetchAuthUserMap` deliberately never
   throws, returning an `AuthError` instead, so a `Promise.all` rejection can't reorder 401-before-502
   error precedence.
2. **Phase 4b's speculative reads.** Safe on two independent counts: nothing derived from the read
   is touched before the access check resolves successfully, and the read runs under the caller's own
   Supabase token (`userRestHeaders`), so RLS already returns zero rows for an unreachable household.
   `requireHouseholdAccess` was **not** removed in favour of RLS alone — it is the documented first
   layer and, parallelized, costs nothing. Only GETs are speculative; PUT/POST/PATCH/DELETE still
   check access strictly before mutating. `/api/state`'s unsupported-method branch now returns 405
   without a lookup, which removes a weak existence oracle (it used to answer 404 for an inaccessible
   tenant and 405 for an accessible one).
3. **Phase 2's session hint.** It is an identity hint, never a token, and authorizes nothing —
   every handler still validates the real httpOnly cookie. Because it renders *cached* data,
   `src/lib/bootCache.ts` owns the whole key set so `clearBootCaches()` can wipe all three together;
   it is called on sign-out, on account deletion, on a confirmed 401, and when `/api/auth-session`
   returns a different `userId` than the hint claimed. The key names live in one module for exactly
   this reason — this is the deliberate deviation from the plan's "don't extract a shared storage
   module" instruction.

**Known residual:** if user A's cookie expires *without* a sign-out and user B then signs in on the
same browser profile, A's cached lists can be on screen for the ~1s until `/api/auth-session`
answers, at which point the caches are wiped. Closing that window entirely would mean waiting on the
auth round trip, which is the thing being removed. Pre-existing localStorage (`grocery.nutrition.*`,
`grocery.onboarding.*`, theme/prefs) is untouched by `clearBootCaches` and was already not cleared
on sign-out — out of scope here, but worth a decision later.

## A gap in the plan as written, and its fix

The plan said unsynced offline edits "get pushed on mount". They would not have: `initialState`
presets `lastSentSerialized` to the restored cache, so the mount push sees no diff and skips, and
the version gate then sees matching versions and skips too — leaving the edit stranded locally.
`sync.ts`'s `pull()` gained an `else if`: same version but different content means nobody else
advanced the row, so the local copy is newer — rebaseline on the server's serialization and
`requestPush()`. Verified end to end (below).

## Measurements (ms)

All figures below are local `npm run vercel:dev` on :3000, authenticated hard reload via a Playwright
session. "Before" is the measurement recorded in the plan doc from the investigation session;
"after" is the post-implementation run — **different runs on the same local stack, so durations carry
run-to-run noise**. Local absolutes are inflated and mean nothing on their own; the structure is what
transfers to production.

### Boot API start times (ms from navigation)

| Call | Before | After |
| --- | --- | --- |
| `/api/auth-session` | 1700 | 1217 |
| `/api/households` | 3470 | 1215 |
| `/api/personal-plan` | 3470 | 1216 |
| `/api/nutrition` | 3470 | served from localStorage |
| `/api/state` | 5680 | 1216 |
| `/api/item-category-memory` | 5680 | 1216 |
| **Spread, first to last start** | **3980** | **2** |

The 3980 → 2 ms spread is the cleanest number here: it measures client-side serialization only and
is unaffected by how slow the server happens to be that run.

### Derived totals (ms)

| Metric | Before | After | Delta |
| --- | --- | --- | --- |
| List content in DOM | 7880 | 1208 | −6672 |
| Last boot API resolved | 7880 | 4727 | −3153 |
| API wall (first start to last end) | 6180 | 3512 | −2668 |
| Boot skeleton visible | ~7880 | 0 (never rendered) | — |

The 4727 figure is pessimistic. Per-call duration rose from ~2200 ms to ~3440-3511 ms purely because
five concurrent function invocations contend on a single local `vercel dev` process; on real Vercel
those are separate instances. Holding per-call at the previously measured 2200 ms, last-API-resolved
would be ~3420 ms (−4460 ms).

### Phase 4, in round trips (not measured in ms)

Production still ran the pre-optimization `master` when these were taken, and `vercel dev` is far too
noisy for server-side timing, so this is structural, not measured. Per endpoint:

- Before: `getUser()` -> `auth_user_map` -> `requireHouseholdAccess` -> data fetch = **4 serial hops**
- After: (getUser ∥ map) -> (access ∥ data) = **2 serial hops**

Critical path overall: 3 tiers × 4 hops = **12 sequential round trips** -> 1 tier × 2 = **2**.

Converting that to ms requires assuming a per-hop latency, so the following are arithmetic on an
assumption, not data. At a warm-production Supabase round trip of ~50-150 ms:

- Before: ~600-1800 ms of API critical path
- After: ~100-300 ms
- Cold-cache saving: ~500-1500 ms
- Warm cache: the whole 600-1800 ms leaves the *perceived* path entirely, because the list paints
  from localStorage before any request is dispatched

**To replace these estimates with real numbers**, deploy this branch to a Vercel preview and re-run
the same `performance.getEntriesByType('resource')` capture there.

### Also measured, and NOT addressed by this work

`MealPlanView`'s lazy section fires a second wave at 3500-3501 ms containing **three duplicate
`/api/personal-plan` calls** (at 1216, 3500 and 3501 ms) plus `/api/meal-entries`. Pre-existing,
untouched here, and worth its own investigation.

## Verification

`npm run build` (`tsc -b` + vite) clean. `api/` and `lib/` are **not** covered by the root
`tsconfig.json` (`include: ["src", "vite.config.ts"]`), so they were typechecked with a one-off
`npx tsc --noEmit --strict --module nodenext --moduleResolution nodenext` over the five changed
files — clean, no file left behind.

Live against `npm run vercel:dev` on :3000 with a Playwright session (`/api/agent-login` mint/redeem):

- **Waterfall collapsed.** The five boot calls now start within **2ms** of each other (1215-1217ms)
  instead of 1.7s / 3.5s / 5.7s.
- **First-frame paint.** With a `MutationObserver` installed before app code runs: the boot skeleton
  **never rendered at all**, and real list content was in the DOM at 1208ms — 10ms *before*
  `/api/state` was dispatched and 2.4s before it resolved.
- **Cross-tenant isolation (4b negative path).** Second agent account + a household containing a
  marker list: attacker session got `404 {"error":"not found"}` with no body leak on
  `/api/state`, `/api/item-category-memory`, and `/api/households?id=`; an attacker `PUT` also 404'd
  and left the victim's row byte-identical. No-cookie request still 401s.
- **Cache headers.** GET/browse returns `private, max-age=300, stale-while-revalidate=3600`; the POST
  read path, the write path, and 401 responses all still return `no-store`.
- **Phase 0.** Garbage `?tenant=` recovered to a valid household, list rendered, household count
  stayed at 1. With cookies cleared server-side but localStorage intact, every call 401'd,
  `[households] list failed: 401` logged, and **no `POST /api/households` was issued at all**.
- **Phase 2.** Signed-out reload issues exactly one request, `GET /api/auth-session`, and no data
  calls. Sign-out button wiped all three boot caches and left pre-existing keys alone.
- **Tenant switch.** Created a second household, confirmed its cache stayed `[]` while the first
  kept its own items (the cross-tenant cache-write bug described below), switch-back showed items in
  110ms.
- **Offline edits.** With `/api/state` aborted: edit persisted to cache, survived a reload while
  still unreachable, and reached the server (version 7 → 8) once the 30s poll fired after reconnect.

Test data created during verification (a second household, a marker household, a stray item, and a
list title clobbered by a mis-targeted `fill()`) was all cleaned up; the tenant's state was restored
and re-verified to contain no trace.

## Bug found and fixed during implementation

The persist effect in `useListSync` originally read `[activeTenantId, state]` directly. On the
single render where `activeTenantId` flips, the rendered `state` is still the *outgoing* tenant's —
so it would have filed one household's lists under another household's cache key. It now reads
`stateRef.current`, which the sync effect re-points at the new tenant's seed earlier in the same
commit. Confirmed empirically via the tenant-switch test above.

## Close-out (CLAUDE.md)

- Trio rule does **not** fire: this is app infrastructure and touches no `roadmap_v2.md` domain, no
  `mvp-scope/*-mvp.md` file, and no `nutrition-curriculum` DEC.
- `docs/superpowers/plans/README.md`'s row for this plan is still `NOT_STARTED` and **must be flipped
  to `SHIPPED` in the commit that ships this work** — left unflipped deliberately because the code is
  implemented and verified but not yet committed or merged.
- An untracked `docs/superpowers/plans/2026-09-17-boot-performance-waterfall-SIMPLIFIED.md`
  (a plain-English restatement of the same plan, from an earlier session) is sitting in the working
  tree. Not created or modified by this session; decide whether to commit or delete it.
