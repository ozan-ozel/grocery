# 2026-09-12: Meal Shopping-List and Meal Picker Controls

**Date:** 2026-09-12  
**Branch:** `feature/meal-shopping-list-toggle`  
**Status:** Implementation complete; live interaction remains open

## Current state

The implementation is present in `App.tsx`, `MealContainer.tsx`, `MealItemCard.tsx`,
`MealPlanView.tsx`, `MealTrackingView.tsx`, and the new `MealShoppingConfirmModal.tsx` and
`RecipeSearchModal.tsx`. The existing list-action contract remains the source of truth for
exact-name membership and removal. No backend or database changes are involved.

## Scope

Continued the unfinished meal-plan work identified in the mobile bottom-nav and Yemek Planı UX
checkpoint records. Implemented the item-level shopping cart flow and corrected the meal picker
from
`docs/superpowers/plans/2026-09-12-meal-to-shopping-list-toggle.md`.

## Changes

- Added `MealShoppingConfirmModal` to show resolved food names and gram quantities before an
  add/remove action.
- Added a shopping-cart button to each individual `MealItemCard`, so products and combo ingredients
  can be added to or removed from the shopping list independently.
- Wired add/remove behavior through the existing `createListActions` `isOnList` and
  `removeItemByName` functions.
- Kept the bottom daily meal-plan shopping action as an add/remove toggle for whole-day bulk action.
- Renamed the meal-row `+Kombo` control to `+Yemekler`.
- Added a real meal picker backed by `ALL_COMBOS` and `scoreAllCombos`, instead of the ordinary food
  catalog. Selecting a meal expands its ingredients into meal rows with the combo ID preserved.
- Canonicalized combo ingredient names through the nutrition catalog before persisting rows, so
  aliases resolve to the same meal and shopping identities as ordinary food additions.
- Confirmed the recommended-foods and batch-prep sections are already absent from the current
  `MealPlanView`, so no deletion was needed from that dependent cleanup plan.
- Preserved the unused `MealTrackingView` call sites with explicit no-op handlers so the shared
  component contract remains type-safe.

## Validation

- `npm run build` passes (`tsc -b` and Vite build).
- `data/combos.json` currently contains 16 source combos; the picker filters these through the
  existing catalog and exclusion rules, so the visible count can be lower (approximately 11).
- Live browser verification could not be completed: the shared tab was not stable for interaction,
  and a fresh direct route remained on the app loading skeleton.
- No commit was created.

The current worktree also contains unrelated `public/` output; it is not part of this task.

## Next action

Run the live Yemek Planı flow when the local authenticated app is responsive: add a meal item, press
its cart button, confirm the listed items appear in the shopping list, then press it again and confirm
removal. Also verify the bottom daily action changes to `...listesinden çıkar` once every planned item
is present and changes back after removal.
