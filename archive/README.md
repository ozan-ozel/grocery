# archive/

Retired code that is **not compiled, not bundled and not deployed**, kept because it may be worth
restoring. It is safe to leave here: nothing in `src/`, `api/` or `lib/` imports it.

How it stays out of the way:

- `tsconfig.json` only includes `src` and `vite.config.ts`, so `npm run build` / `tsc -b` never see it.
- Vite bundles only what `index.html` imports.
- `.vercelignore` lists `archive`, so `npm run deploy` / `deploy:prod` don't upload it.
- `src/index.css` has `@source not "../archive";`, so Tailwind doesn't emit CSS for its class names.

Paths mirror the original location under `src/`, so restoring is a `git mv` back. **Archived code
rots**: it is not typechecked, so expect small fixes when you bring it back. Each entry below records
the last commit it compiled at, and `git log --follow <file>` shows its history.

Rule for adding to this folder: only code with real future value that would be tedious to rewrite. Small
or fully superseded code is deleted instead — git history is the archive for that.

## Index

| File | What it was | Why archived | Last compiled at |
| --- | --- | --- | --- |
| `src/components/TodayView.tsx` | The "Bugün" screen: today's remaining budget, `matchCombos` suggestions, "Diğer kombinasyonlar" (with an over-budget hint), evening suggestions, "Bugün yediklerin" reconstructed from `combo_id`, per-combo add-to-shopping-list | Nothing mounted it any more; Meal Plan's evening section covers the useful parts | `aa53078` |
| `src/lib/matchCombos.ts` | Was `matchCombos` in `src/lib/comboMatch.ts`: budget-filtered top-5 combos by protein | Only `TodayView` used it; the "Sana uygun" recommender replaces it for new work | `aa53078` |
| `src/components/MealNutritionDetailSheet.tsx` | A bottom sheet with the day's (or one meal's) macro breakdown plus per-food kcal | `MealPlanView` rendered it but nothing ever opened it | `aa53078` |

## Restoring

**TodayView** (a screen, so it also needs mounting):

1. `git mv archive/src/components/TodayView.tsx src/components/TodayView.tsx` and
   `git mv archive/src/lib/matchCombos.ts src/lib/matchCombos.ts`.
2. Delete the two-line `// ARCHIVED` banner at the top of each file.
3. Re-add `overBudgetBy` to `src/components/ui/suggestion-card.tsx` (it was removed with `TodayView`):

   ```tsx
   // destructured props: add `overBudgetBy,`
   // prop types:
   // Only set for "Diğer kombinasyonlar" entries that don't fit today's
   // remaining kcal — how far over, so it reads as an honest heads-up
   // rather than hiding why it wasn't in the top suggestions.
   overBudgetBy?: number;
   // in the JSX, after the prepNote paragraph:
   {!!overBudgetBy && overBudgetBy > 0 && (
     <p className="mt-1 text-xs text-signal">
       Kalan makronun {Math.round(overBudgetBy)} kcal üzerinde
     </p>
   )}
   ```

4. Mount it (it was the "Bugün" section; `App.tsx` no longer has that section). It needs
   `userId`, `householdId`, `onAddItem(name, qty, { exact })`, `isOnList`, `onRemoveItemByName` from the
   shopping-list state.
5. `npm run build` and fix whatever drifted.

**MealNutritionDetailSheet**: don't move it as-is. It predates `src/components/ui/bottom-sheet.tsx`
(hand-rolled overlay + `useSwipeToDismiss` + `SheetDragHandle`). Re-implement the body on `BottomSheet`
(see CLAUDE.md § UI patterns) and re-add in `MealPlanView`: an open-state `useState`, something that
sets it to true (nothing did), and

```tsx
<MealNutritionDetailSheet
  title="Günlük toplam"
  macros={totals}
  items={MEAL_SLOTS.flatMap(({ slot }) => itemsForSlot(slot))}
  catalog={catalogMap}
  onClose={() => setOpen(false)}
/>
```

## Note on comments in `src/`

Several comments in live code still say "TodayView" (`suggestion-card.tsx`, `useRemainingToday.ts`,
`eveningRecommend.ts`, `localMealPlan.ts`, `combos.ts`, `preparationBatch.ts`, `MealPlanView.tsx`).
They describe history and refer to `archive/src/components/TodayView.tsx`; they were left as they are
to avoid comment churn.
