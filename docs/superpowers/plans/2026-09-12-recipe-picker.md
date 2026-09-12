# Recipe ("+Tarif") Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Sonnet 5 — new component plus multi-file wiring, with an existing bug
(wrong data source) to fix correctly rather than paper over.

**Scope:** Frontend only (recipes are static, client-bundled data — no backend changes).

**Goal:** Rename the meal row's "+Kombo" button to "+Tarif" (Recipe), and make pressing it
actually show the real recipe list (`ALL_COMBOS`) instead of the raw food catalog it's
currently — incorrectly — wired to.

**Architecture:** `MealContainer`'s second button already calls an `onSelectRecipe` prop; the bug
is one level up, in `MealPlanView.tsx`, where the "Combo Search Modal" is a `FoodSearchModal`
reused with `foods={foods}` (the nutrition catalog) instead of the actual combo/recipe list. This
plan adds a dedicated `RecipeSearchModal` component backed by `scoreAllCombos(ALL_COMBOS, ...)`
(the same exclusion-aware ranking `BatchPlanner.tsx` already uses) and wires it in place of the
misused `FoodSearchModal` instance. Selecting a recipe adds every one of its ingredient rows to
the target slot in one action, tagged with that recipe's `comboId` — reusing `useMealPlan`'s
existing `addItem(slot, foodId, quantityG, comboId)` signature, so no hook changes are needed.

**Tech Stack:** Preact function components, existing `src/lib/combos.ts` /
`src/lib/comboMatch.ts` (client-bundled, no network fetch required — recipes are static JSON
compiled into the build, per `data/README.md`).

**Spec:** No separate spec doc — derived from the product owner's request (2026-09-12): "Öğün
satırlarında +Kombo kısmını +Tarif olarak değiştir. Artı tarif düğmesine basıldığında tarifler
listesini getir." Ground truth: `src/components/MealContainer.tsx`,
`src/components/MealPlanView.tsx`, `src/components/FoodSearchModal.tsx`, `src/lib/combos.ts`,
`src/lib/comboMatch.ts`, `src/components/BatchPlanner.tsx` (existing precedent for combo +
exclusions).

## Global Constraints

- No test suite exists; verify with `npm run build` and `npm run vercel:dev`.
- Never commit without an explicit request; branch first.
- Combo/recipe ingredient identity (`foodId`) is `nutrition.name_tr`, never the opaque
  `Nutrition.food_id` UUID — same rule `preparationBatch.ts`'s header comment states for
  `MealEntry.foodId`. Don't conflate the two.
- A recipe referencing a `food_id` with no live match in the nutrition catalog is silently
  dropped from that recipe's totals, not shown with wrong numbers — `comboMatch.ts`'s
  `resolveItems` already enforces this; don't bypass it by reading `combo.items` directly for
  totals.

---

## File Structure

- Create: `src/components/RecipeSearchModal.tsx` — recipe list/search + confirm, modeled on
  `FoodSearchModal.tsx`'s bottom-sheet shell but listing `ScoredCombo`s instead of `Nutrition`
  rows, with no per-item gram input (a recipe's gram amounts are fixed per ingredient).
- Modify: `src/components/MealContainer.tsx` — button label "Kombo" → "Tarif".
- Modify: `src/components/MealPlanView.tsx` — replace the misused `FoodSearchModal` "Combo Search
  Modal" instance with `RecipeSearchModal`, and add the multi-item add call.

## Task 1: Rename the button

**Files:**
- Modify: `src/components/MealContainer.tsx:45-51`

- [ ] **Step 1: Change the label**

```diff
         <button
           type="button"
           onClick={onSelectRecipe}
           className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
           <Plus className="size-4" />
-          Kombo
+          Tarif
         </button>
```

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors (label text isn't type-checked, but confirms nothing else broke).

- [ ] **Step 3: Stop for review** — but keep working; Task 2 depends on this file being open in
  the same session, not on a separate commit.

## Task 2: `RecipeSearchModal` component

**Files:**
- Create: `src/components/RecipeSearchModal.tsx`

**Interfaces:**
- Consumes: `ScoredCombo` from `@/lib/comboMatch` (has `id`, `nameTr`, `items: { foodId: string;
  grams: number }[]`, `prepMinutes`, `tags`, `prepNote?`, `totals: MacroTotals`,
  `hasSoftConflict: boolean`).
- Produces: `onSelect: (combo: ScoredCombo) => void` — the caller (Task 3) is responsible for
  turning `combo.items` into meal entries; this component only picks *which* recipe.

- [ ] **Step 1: Write the component**

```tsx
import { useState } from "react";
import { Search, X, Clock } from "lucide-react";
import type { ScoredCombo } from "@/lib/comboMatch";

type Props = {
  title: string;
  combos: ScoredCombo[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (combo: ScoredCombo) => void;
};

export function RecipeSearchModal({ title, combos, isOpen, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const queryLower = query.trim().toLowerCase();
  const results = queryLower
    ? combos.filter((combo) => combo.nameTr.toLowerCase().includes(queryLower))
    : combos;

  function resetModal() {
    setQuery("");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full rounded-t-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={resetModal}
            className="p-1 text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tarif ara..."
            value={query}
            onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
            autoFocus
            className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              "{query.trim()}" ile eşleşen tarif yok
            </div>
          ) : (
            results.map((combo) => (
              <button
                key={combo.id}
                type="button"
                onClick={() => {
                  onSelect(combo);
                  resetModal();
                }}
                className="w-full text-left rounded-lg border border-border bg-background p-3 hover:bg-accent transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-foreground text-sm">{combo.nameTr}</h4>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {combo.prepMinutes} dk
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {combo.items.length} malzeme · {Math.round(combo.totals.kcal)} kcal · P:{" "}
                  {Math.round(combo.totals.proteinG)}g
                </p>
                {combo.hasSoftConflict && (
                  <p className="text-xs text-signal mt-1">
                    İçinde hassasiyet listendeki bir besin var
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Stop for review** — continue to Task 3 in the same session.

## Task 3: Wire the real recipe list into `MealPlanView`

**Files:**
- Modify: `src/components/MealPlanView.tsx`

**Interfaces:**
- Consumes: `ALL_COMBOS` from `@/lib/combos`, `scoreAllCombos` from `@/lib/comboMatch`,
  `RecipeSearchModal` from Task 2, `addItem(slot, foodId, quantityG, comboId?, batchId?): string`
  from `useMealPlan` (already destructured in this file).
- Produces: no new exports.

- [ ] **Step 1: Import the new pieces**

```diff
+import { ALL_COMBOS } from "@/lib/combos";
+import { scoreAllCombos, type ScoredCombo } from "@/lib/comboMatch";
+import { RecipeSearchModal } from "@/components/RecipeSearchModal";
```

- [ ] **Step 2: Rename the modal-open state for clarity and compute the scored recipe list**

```diff
-  const [comboModalOpen, setComboModalOpen] = useState(false);
+  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
```

Right after `targetMacros` is computed, add:

```typescript
  const scoredRecipes: ScoredCombo[] = scoreAllCombos(
    ALL_COMBOS,
    foodExclusions,
    allergenExclusions,
    catalogMap
  );
```

(`foodExclusions`/`allergenExclusions`/`catalogMap` are already in scope in this component —
see the existing `useMealPersonalization`/`useFoodCatalog` destructuring near the top of the
file.)

- [ ] **Step 3: Add the recipe-add handler**

```typescript
  function handleRecipeSelect(combo: ScoredCombo) {
    if (!activeSlot) return;
    for (const item of combo.items) {
      addItem(activeSlot, item.foodId, item.grams, combo.id);
    }
    setRecipeModalOpen(false);
    setActiveSlot(null);
  }
```

- [ ] **Step 4: Update the `onSelectRecipe` callback passed to `MealContainer`**

```diff
                 onSelectRecipe={() => {
                   setActiveSlot(slot);
-                  setComboModalOpen(true);
+                  setRecipeModalOpen(true);
                 }}
```

- [ ] **Step 5: Replace the misused "Combo Search Modal" with the real one**

```diff
-      {/* Combo Search Modal */}
-      <FoodSearchModal
-        title={activeSlot ? "Kombo Seç" : "Kombo Ara"}
-        foods={foods}
-        isOpen={comboModalOpen}
-        onClose={() => {
-          setComboModalOpen(false);
-          setActiveSlot(null);
-        }}
-        onSelect={handleFoodSelect}
-      />
+      {/* Recipe Search Modal */}
+      <RecipeSearchModal
+        title={activeSlot ? "Tarif Seç" : "Tarif Ara"}
+        combos={scoredRecipes}
+        isOpen={recipeModalOpen}
+        onClose={() => {
+          setRecipeModalOpen(false);
+          setActiveSlot(null);
+        }}
+        onSelect={handleRecipeSelect}
+      />
```

- [ ] **Step 6: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors, and no remaining references to `comboModalOpen`/`setComboModalOpen`.

- [ ] **Step 7: Manual verification**

Run: `npm run vercel:dev`, open "Yemek Planı", press "+Tarif" on any meal row.
Expected: a bottom sheet titled "Tarif Seç" opens, listing real recipes from `data/combos.json`
(names, prep time, ingredient count, kcal/protein) — not raw nutrition-catalog foods. Search
narrows the list by name. Selecting a recipe closes the sheet and adds every one of its
ingredients (correct gram amounts) to that meal slot as separate rows; the meal's item list and
daily macro totals update accordingly.

- [ ] **Step 8: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Self-Review Notes

- **Spec coverage:** label rename → Task 1; "artı tarif düğmesine basıldığında tarifler listesini
  getir" → Tasks 2-3 replace the broken food-catalog modal with a real, exclusion-aware recipe
  list and wire selection through to actual meal entries.
- **Placeholder scan:** none — all steps ship runnable code.
- **Type consistency:** `RecipeSearchModal`'s `onSelect: (combo: ScoredCombo) => void` matches
  `handleRecipeSelect(combo: ScoredCombo)` in Task 3; `combo.items[].foodId`/`.grams` match
  `Combo.items` in `src/lib/combos.ts`.
- Note: `MealTrackingView.tsx` has its own stubbed `handleSelectRecipe` (falls through to the
  food picker) but is not imported anywhere in the app today — out of scope for this plan;
  flagged here rather than silently left inconsistent.
