# Lazy-load the Turkish categorization engine (perf follow-up, item 3)

_2026-09-16 — branch `refactor/manual-chunk-vendor-deps`_

Follow-up to [2026-09-16-05](2026-09-16-05-defer-food-catalog-fetch.md), continuing the
first-load-time investigation. The original item 3 was framed as "split the main chunk further
via `manualChunks`" — investigation found a bigger, more specific win instead.

## Investigation

Bisected the 564 KB main chunk by temporarily stubbing out `snowball-stemmers` and rebuilding:
main chunk dropped to 238 KB. `snowball-stemmers` — a single monolithic 848 KB file bundling
every Snowball language (not just Turkish, the only one this app uses), with no way to
tree-shake unused languages — was ~325 KB raw / ~38 KB gzip of the main chunk on its own, pulled
in eagerly via `src/lib/store.ts`'s static `import { categorize } from "./categorization/categories"`
(store.ts is itself imported unconditionally by `App.tsx`).

Traced `categorize()`'s actual call sites:
- `src/lib/store.ts` `categorizeItems()` — only called from `categorizeActive()` (the "Otomatik
  kategorize et" button, explicit user action).
- `src/lib/categorization/groupItems.ts` — fallback when an item has no stored/remembered
  category, only reached when the "group by category" view is on (default: off).
- `src/components/ActiveListRow.tsx` — initial guess for an edit-row's category dropdown, only
  reached when a user opens an item's edit row.

None of these are on the default initial-paint path — a returning user's shopping list mostly
shows items with an already-stored `category` (`lookupItemCategory` server memory), so
`categorize()` itself rarely even runs; the cost was purely from eagerly *loading* the module.

Also found `userCategories.ts` (imported eagerly by `store.ts`, `listActions.ts`,
`ActiveList.tsx`, etc. — core, always-loaded files) statically imported `CATEGORIES`/
`CATEGORY_BY_ID` (taxonomy data: labels, icons, ids) from the same `categories.ts` file as the
stemmer — this is genuinely needed eagerly (category names/icons show up immediately in pickers),
so it was pinning the whole file, stemmer included, into the eager graph regardless of any
`lazy()`/dynamic-import wrapper elsewhere.

## Plan

1. Split `categories.ts` into two files:
   - `categoryTaxonomy.ts` (new) — `CategoryId`, `CategoryDef`, `CATEGORIES`, `CATEGORY_BY_ID`,
     `categoryLabel()`. No `snowball-stemmers` import. Stays eager.
   - `categories.ts` — keeps only the matching engine (`newStemmer`, `KEYWORDS`, `HEAD_NOUNS`,
     `RULES`, `categorize()`, `groupByCategory()`), importing taxonomy data from the new file.
2. Point `userCategories.ts` and `useCategoryOverlay.ts`'s type import at `categoryTaxonomy.ts`
   instead of `categories.ts`, so nothing in the eager graph touches the stemmer anymore.
3. Add `src/lib/categorization/categorizeLazy.ts`: dynamically `import("./categories")` once
   (kicked off as soon as this module loads), exposing `categorizeSync()` (returns `"diger"`
   until loaded — same as the app's existing "couldn't classify" fallback) for the two
   render-path call sites, and `categorizeAsync()` for the button-triggered one.
4. Update the three call sites (`store.ts`, `groupItems.ts`, `ActiveListRow.tsx`) to use the lazy
   wrapper instead of the direct import. `categorizeItems()`/`categorizeActive()` become async
   (safe — button click handlers, no render-path constraint); `categorizeActive()` re-merges
   results by item id in case list state changed while the async classify was in flight.

## Result

`npm run build`:
- Main chunk: 564 KB (115.85 KB gzip) → **221 KB (71.33 KB gzip)**.
- New `categories-*.js` chunk: 342.59 KB (43.67 KB gzip) — the stemmer + taxonomy matcher,
  loaded via dynamic import in the background, off the critical render path.
- Vite's "chunk larger than 500 kB" warning is gone.
- `tsc -b` passes clean.

Manually verified via the running `vercel dev` + Playwright, on a real tenant:
- Added a fresh item ("Domates", no stored/remembered category) — no console errors.
- Toggled "Kategorilere göre grupla" (group-by-category, default off) — item correctly bucketed
  under "Meyve & Sebze" via `categorizeSync()`.
- Clicked "Otomatik kategorize et" — async `categorizeActive()` ran without error, category
  persisted.
- Opened the item's edit row — category dropdown correctly defaulted to "Meyve & Sebze" via
  `categorizeSync()`.
- Cleaned up the test item afterward.

Not committed — implemented and verified, left for the user's own review/commit.

## Cumulative first-load result across items 1–3

| | Main chunk (raw / gzip) |
|---|---|
| Before any of this work | 667 KB / 141 KB |
| After item 1 (route-split sections) | 564 KB / 115.85 KB |
| After item 2 (defer catalog fetch on Settings) | 564 KB / 115.85 KB (no bundle-size effect — network-call timing only) |
| After item 3 (lazy-load categorizer) | **221 KB / 71.33 KB** |

Net: the critical-path JS payload is now roughly a third of where it started, plus four
section chunks and the categorizer chunk all load on demand instead of upfront.
