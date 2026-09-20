# 2026-09-20-02 — Archive unused meal code

Branch: `chore/archive-unused-meal-code` — implemented, build-verified, committed and merged to `master` on
2026-09-20 (BCMP). It was cut from a working tree that also held the nutrition-lockdown work
([2026-09-20-01](2026-09-20-01-nutrition-write-lockdown.md)) and some UI tweaks, which are committed separately;
only the archive files below went into this commit.

## What changed

Created `archive/`: a folder of retired code that is not typechecked (`tsconfig` includes only `src`), not
bundled, not deployed (`.vercelignore` lists `archive`) and not scanned by Tailwind (`@source not
"../archive";` in `src/index.css` — measured 57,434 → 57,267 bytes of CSS). Index, rationale and restore
steps: `archive/README.md`.

Archived with `git mv` (paths mirror `src/`):

- `TodayView.tsx` — the retired "Bugün" screen (nothing imported it).
- `MealNutritionDetailSheet.tsx` — nothing ever opened it; its dead render block, import and open-state were
  removed from `MealPlanView.tsx`.
- `matchCombos` — extracted from `src/lib/comboMatch.ts` into `archive/src/lib/matchCombos.ts` (only
  `TodayView` used it). The archived `TodayView` import was re-pointed at it so restore is two `git mv`s.
- `SuggestionCard`'s `overBudgetBy` prop was removed with `TodayView` (its only caller); the snippet to re-add
  it is in the archive README.

Docs: `docs/knowledge-map.md` row for `archive/`; `docs/mvp-scope/food-selection-mvp.md` and
`shopping-mvp.md` no longer claim the evening section / `addComboToList()` live in `TodayView` (they were
already stale — the mounted equivalents are in `MealPlanView.tsx`).

## Deliberately not done (still "to be removed", next step)

`MealTrackingView.tsx` (fully superseded by Meal Plan, not worth archiving), `FoodSearchModal`'s unused
`recommendationTags` / `onSelectTag` props, the unused tag values in `data/combos.json` + `data/README.md`,
`useRemainingToday`'s `target` / `consumed` / `isEstimated` fields (only `TodayView` read them), and the
vestigial `Tab = "today"` default in `useUiPrefs.ts` (touching it risks old `?tab=today` links, so it needs
its own look). Comments in live code that mention `TodayView` were left alone.

## Files in this change set

`archive/**` (new), `.vercelignore`, `src/index.css` (only the `@source not` line), `src/components/MealPlanView.tsx`, `src/components/ui/suggestion-card.tsx`, `src/lib/comboMatch.ts`, `docs/knowledge-map.md`, `docs/mvp-scope/food-selection-mvp.md`, `docs/mvp-scope/shopping-mvp.md`, `docs/SESSION_FOLLOWUP.md`, this file.

## Verification

`npm run build` (`tsc -b` + vite) clean after the moves; `noUnusedLocals` confirms no imports were orphaned.
The archived files were not compiled, by design.
