# Nutrition comparison sub-tab — plan

Tracks [NUT-31](https://linear.app/nutrition-grocery-planner/issue/NUT-31/nutrition-comparison-sub-tab-under-besin-degerleri).
Bounded task (brainstorming skill classification) — design agreed in chat, no separate spec
document; this file is the short implementation plan the user asked to have committed.

## What

Add a third `Scope` to `NutritionView.tsx` — `"compare"`, alongside the existing `"list"` /
`"all"` — that lets the user pick exactly two foods and see their nutrition values side by side,
per 100g, with the higher value per row highlighted in the theme's secondary color.

## Why this shape

- NUT-31 already scoped this as a client-side-only extension of the existing scope toggle — no
  new backend/schema needed, since `useFoodCatalog()` (built for the meal planner, NUT-33) already
  loads the full nutrition catalog client-side.
- Exactly 2 items (not N) keeps the table a fixed 3-column layout (nutrient name + 2 values) —
  inherently mobile-friendly with no horizontal scroll, whatever the screen width.
- Per-100g only (no serving-size input) matches every other nutrition table already in the app
  (`NutritionView`'s list table, `AllFoodsBrowser`) — introducing a serving-size concept here
  would be new complexity this feature doesn't need.

## Steps

1. **`NutritionCompareView.tsx`** (new component)
   - Uses `useFoodCatalog()` for the catalog (same hook `MealPlanView`/`MealFoodPicker` already
     use).
   - Two independent search-and-pick slots (Food A / Food B) — same search-input-plus-list
     interaction as `MealFoodPicker.tsx`, minus the quantity field (not needed at fixed 100g).
   - Once both are picked, render a table: one row per nutrient (kcal, P, Y, K, L — same labels/
     order as the rest of the app), two value columns. The higher value per row gets
     `bg-secondary text-secondary-foreground` on that cell; equal values get no highlight.
   - Empty/partial states: prompt to pick the second food if only one is selected; no crash if
     `useFoodCatalog()` is still loading or errors (reuse the same loading/error copy pattern as
     `AllFoodsBrowser`).

2. **`NutritionView.tsx`**
   - Widen `Scope` to `"list" | "all" | "compare"`.
   - Add a third button to the existing `scopeToggle` JSX: "Karşılaştır".
   - `scope` continues to sync to the URL via the existing `readNutritionScopeFromUrl`/
     `writeNutritionScopeToUrl` helpers in `src/lib/store` (need a small update there to accept/
     round-trip `"compare"` alongside `"list"`/`"all"`).
   - When `scope === "compare"`, render `<NutritionCompareView />` the same way `"all"` renders
     `<AllFoodsBrowser />` today.
   - The two selected foods are local component state, not URL-persisted (YAGNI, per NUT-31's
     settled scope note — can add later if it turns out to matter).

3. **Verify**: `npm run build` (this feature touches no `netlify/functions/*` or `api/*` code, so
   no backend typecheck needed this time).

## Out of scope (deliberately)

- More than 2 items at once.
- Per-serving / custom quantity comparison basis.
- URL-persisting the two selected foods.
- Any backend/schema change.
