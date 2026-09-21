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
| `src/components/MealNutritionDetailSheet.tsx` | A bottom sheet with the day's (or one meal's) macro breakdown plus per-food kcal | `MealPlanView` rendered it but nothing ever opened it | `aa53078` |

## Restoring

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
