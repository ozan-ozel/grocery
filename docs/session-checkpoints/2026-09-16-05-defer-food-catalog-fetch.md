# Defer unconditional food-catalog fetch (perf follow-up)

_2026-09-16 — branch `refactor/defer-food-catalog-fetch`_

Follow-up to [2026-09-16-04](2026-09-16-04-lazy-load-app-sections.md) (item 2 of its "out of
scope" list): `useFoodCatalog()` in `AppShell` ([src/App.tsx](../../src/App.tsx)) fetches the full
~1000-row nutrition catalog unconditionally on every mount, feeding `foodIdentityIndex` into
`createListActions`' `addItem`.

## Investigation

`foodIdentityIndex` is optional in `createListActions` (`src/lib/listActions.ts:34,75`) — when
absent, `addItem` just skips Food Identity resolution rather than breaking. And the default
landing section is `"yemek"` (`initialSection()` in `useUiPrefs.ts`), which itself needs the
catalog for `onAddShoppingItem`/its own food data — so most sessions need this fetch almost
immediately regardless. The one section that never needs it is `"ayarlar"` (Settings): no add-item
flow, no food data shown.

## Plan

Add an `enabled` option to `useFoodCatalog()` (thin wrapper around TanStack Query's own `enabled`),
defaulting to `true`, and pass `enabled: section !== "ayarlar"` from `AppShell`. Skips the fetch
only for the one section that provably never uses it; every other section already needs the
catalog for its own function, so no further gating is worth the complexity.

## Result

Implemented. `tsc -b` + `npm run build` clean. Manually verified via the running `vercel dev` +
Playwright: opening directly on `?section=ayarlar` no longer fires `/api/nutrition`; switching to
any other section fires it on demand and Food Identity resolution still works when adding items.

Not committed — implemented and verified, left for the user's own review/commit.
