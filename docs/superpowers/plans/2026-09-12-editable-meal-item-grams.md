# Editable Meal Item Grams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Sonnet 5 — state threaded across three components; needs care to keep
prop signatures consistent end to end.

**Scope:** Frontend only (backend PATCH endpoint and hook method already exist and are unused).

**Goal:** Let a user edit a meal item's gram quantity in place, instead of only being able to
remove and re-add it.

**Architecture:** The backend and hook support for this already exists and is unused by the UI:
`useMealPlan.ts` exports `updateItemQuantity(slot, itemId, quantityG)`, which both updates the
local TanStack Query cache optimistically and calls `updateMealEntry(id, { quantityG })` (already
wired to `PATCH /api/meal-entries?id=`, which already validates `quantity_g` server-side). This
plan is purely UI: turn `MealItemCard`'s static `{item.quantityG}g` text into an editable number
input, and thread an `onUpdateQuantity` callback down through `MealContainer` from
`MealPlanView`.

**Tech Stack:** Preact function components, existing `useMealPlan` hook — no new API or DB work.

**Spec:** No separate spec doc — derived from the product owner's request (2026-09-12): "Öğünlerin
içindeki ürünlerin gram bilgisini düzenlemek mümkün olmalı." Ground truth:
`src/components/MealItemCard.tsx`, `src/components/MealContainer.tsx`,
`src/components/MealPlanView.tsx`, `src/hooks/useMealPlan.ts:166-177`, `api/meal-entries.ts:263-281`
(server-side validation: `quantity_g` must be a positive number).

## Global Constraints

- No test suite exists; verify with `npm run build` and `npm run vercel:dev`.
- Never commit without an explicit request; branch first.
- Client-side validation must match the server's: quantity must be a finite positive number, or
  the PATCH request will fail with a 400 (see `api/meal-entries.ts:271-274`). Reject/ignore
  invalid input before calling `updateItemQuantity`, don't rely on the server round-trip alone.
- This plan depends on nothing else in this batch and nothing else depends on it, but pairs
  naturally with the gram-unit-conversion UX proposal
  (`2026-09-12-gram-unit-conversion-ux.md`) — that plan's helper text attaches to the same input
  this plan creates. Implement this one first; the conversion helper is additive on top of it.

---

## File Structure

- Modify: `src/components/MealItemCard.tsx` — replace the static gram text with an editable
  number input.
- Modify: `src/components/MealContainer.tsx` — thread `onUpdateQuantity` through to
  `MealItemCard`.
- Modify: `src/components/MealPlanView.tsx` — wire `MealContainer`'s new prop to
  `useMealPlan`'s existing `updateItemQuantity`.

## Task 1: Editable input in `MealItemCard`

**Files:**
- Modify: `src/components/MealItemCard.tsx`

**Interfaces:**
- Produces: new prop `onUpdateQuantity: (quantityG: number) => void`, added to this component's
  existing `Props` type (alongside `item`, `nutrition`, `onRemove`).

- [ ] **Step 1: Add the prop and local editing state**

```diff
 import { X } from "lucide-react";
+import { useState } from "react";
 import type { MealItem } from "@/lib/localMealPlan";
 import type { Nutrition } from "@/lib/nutrition";
 import { scaleNutrition } from "@/lib/mealNutrition";

 type Props = {
   item: MealItem;
   nutrition: Nutrition | undefined;
   onRemove: () => void;
+  onUpdateQuantity: (quantityG: number) => void;
 };

-export function MealItemCard({ item, nutrition, onRemove }: Props) {
+export function MealItemCard({ item, nutrition, onRemove, onUpdateQuantity }: Props) {
   if (!nutrition) return null;

   const scaled = scaleNutrition(nutrition, item.quantityG);
   const macroString = `P: ${Math.round(scaled.proteinG)}g K: ${Math.round(scaled.carbsG)}g Y: ${Math.round(scaled.fatG)}g ${Math.round(scaled.kcal)} kcal`;
+
+  const [draft, setDraft] = useState(String(item.quantityG));
+
+  function commit() {
+    const parsed = Number(draft);
+    if (Number.isFinite(parsed) && parsed > 0) {
+      onUpdateQuantity(Math.round(parsed));
+    } else {
+      // Invalid entry (empty, zero, negative, non-numeric) — revert rather
+      // than send a request the server will reject anyway.
+      setDraft(String(item.quantityG));
+    }
+  }
```

- [ ] **Step 2: Keep `draft` synced when the item's quantity changes from elsewhere**

A recipe re-add, an external sync pull, or another device's edit can change `item.quantityG`
without this input having been touched. Add:

```typescript
  useEffect(() => {
    setDraft(String(item.quantityG));
  }, [item.quantityG]);
```

(add `useEffect` to the `react`/`preact` import alongside `useState`).

- [ ] **Step 3: Replace the static gram text with the input**

```diff
             <p className="text-xs text-muted-foreground mt-0.5">
-              {item.quantityG}g
+              <input
+                type="number"
+                inputMode="decimal"
+                min="1"
+                step="1"
+                value={draft}
+                onChange={(e) => setDraft((e.target as HTMLInputElement).value)}
+                onBlur={commit}
+                onKeyDown={(e: KeyboardEvent) => {
+                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
+                }}
+                aria-label={`${nutrition.name_tr} miktarı (gram)`}
+                className="ledger w-14 rounded border border-transparent bg-transparent px-1 py-0 text-xs text-muted-foreground hover:border-border focus:border-border focus:outline-none"
+              />
+              g
             </p>
```

- [ ] **Step 4: Run the typecheck**

Run: `npx tsc -b`
Expected: an error at every call site that constructs `<MealItemCard>` without the new
`onUpdateQuantity` prop — expected at this point; Task 2 fixes it.

## Task 2: Thread the callback through `MealContainer`

**Files:**
- Modify: `src/components/MealContainer.tsx`

**Interfaces:**
- Consumes: nothing new from outside.
- Produces: new prop `onUpdateItemQuantity: (itemId: string, quantityG: number) => void`, added
  to `MealContainer`'s existing `Props` type.

- [ ] **Step 1: Add the prop and pass it down**

```diff
 type Props = {
   mealType: MealType;
   items: MealItem[];
   catalog: NutritionMap;
   onSelectFood: () => void;
   onSelectRecipe: () => void;
   onRemoveItem: (itemId: string) => void;
+  onUpdateItemQuantity: (itemId: string, quantityG: number) => void;
 };
```

```diff
 export function MealContainer({
   mealType,
   items,
   catalog,
   onSelectFood,
   onSelectRecipe,
   onRemoveItem,
+  onUpdateItemQuantity,
 }: Props) {
```

```diff
             <MealItemCard
               key={item.id}
               item={item}
               nutrition={catalog.get(item.foodId)}
               onRemove={() => onRemoveItem(item.id)}
+              onUpdateQuantity={(quantityG) => onUpdateItemQuantity(item.id, quantityG)}
             />
```

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc -b`
Expected: an error at every call site that constructs `<MealContainer>` without the new
`onUpdateItemQuantity` prop — `MealPlanView.tsx` and `MealTrackingView.tsx`. Task 3 fixes
`MealPlanView.tsx`; see the note at the end of this plan for `MealTrackingView.tsx`.

## Task 3: Wire it in `MealPlanView`

**Files:**
- Modify: `src/components/MealPlanView.tsx`

**Interfaces:**
- Consumes: `updateItemQuantity(slot: MealSlot, itemId: string, quantityG: number): void` — already
  destructured from `useMealPlan(...)` in this file today (confirm it's in the destructuring list
  near the top of the component; add it if the current code doesn't already pull it out).

- [ ] **Step 1: Ensure `updateItemQuantity` is destructured from `useMealPlan`**

```diff
   const {
     date,
     dateLabel,
     isLoading,
     goToPrevDay,
     goToNextDay,
     itemsForSlot,
     allItems,
     addItem,
+    updateItemQuantity,
     removeItem,
     dailyNutrition,
   } = useMealPlan(householdId, catalogMap);
```

- [ ] **Step 2: Pass it to `MealContainer`**

```diff
               <MealContainer
                 key={slot}
                 mealType={getMealType(slot)}
                 items={itemsForSlot(slot)}
                 catalog={catalogMap}
                 onSelectFood={() => {
                   setActiveSlot(slot);
                   setFoodModalOpen(true);
                 }}
                 onSelectRecipe={() => {
                   setActiveSlot(slot);
                   setRecipeModalOpen(true);
                 }}
                 onRemoveItem={itemId => removeItem(slot, itemId)}
+                onUpdateItemQuantity={(itemId, quantityG) =>
+                  updateItemQuantity(slot, itemId, quantityG)
+                }
               />
```

(`onSelectRecipe`/`setRecipeModalOpen` reflect the rename from the recipe-picker plan; if that
plan hasn't landed yet in this checkout, keep whatever the current handler name is — only the new
`onUpdateItemQuantity` line matters here.)

- [ ] **Step 3: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run vercel:dev`, open "Yemek Planı", add an item to a meal. Click into its gram field,
change the number, and either press Enter or click away. Expected: the item's macro line
(`P:/K:/Y:/kcal`) recalculates immediately, the meal's total (if the meal-row-totals plan has
landed) updates too, and reloading the page shows the new quantity persisted (confirms the PATCH
round-trip succeeded). Try entering `0`, a negative number, and empty — expected: the field
reverts to the last valid quantity instead of sending a request.

- [ ] **Step 5: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Self-Review Notes

- **Spec coverage:** "Öğünlerin içindeki ürünlerin gram bilgisini düzenlemek mümkün olmalı" → all
  three tasks together deliver this end to end, reusing existing persistence.
- **Placeholder scan:** none.
- **Type consistency:** `onUpdateQuantity: (quantityG: number) => void` (Task 1) →
  `onUpdateItemQuantity: (itemId: string, quantityG: number) => void` (Task 2, wraps it with the
  item id) → `updateItemQuantity(slot, itemId, quantityG)` (Task 3, the real hook function) all
  line up.
- Note: `MealTrackingView.tsx` also renders `MealContainer` and will fail `tsc -b` after Task 2
  until it's given an `onUpdateItemQuantity` prop too. As noted in the recipe-picker plan, this
  component is not imported anywhere in the app today (dead code) — the smallest correct fix is a
  one-line no-op prop (e.g. `onUpdateItemQuantity={() => {}}`) purely to keep the build green,
  called out here so the implementer doesn't skip it and break `tsc -b`.
