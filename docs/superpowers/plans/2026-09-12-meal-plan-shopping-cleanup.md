# Meal Plan Shopping Actions Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Haiku 4.5 — mostly deletion, plus a small, fully-specified toggle change.

**Scope:** Frontend only.

**Goal:** On the "Yemek Planı" screen, remove the "Alışveriş Listesine Ekle" (recommended-foods)
section and the "Toplu Hazırlıklar" (batch prep) section entirely, keeping only the bottom "Bugünü
alışveriş listesine ekle/çıkar" button — and make that one button a real add/remove toggle instead
of an add-only action.

**Architecture:** Two whole sections come out of `MealPlanView.tsx`: the collapsible "recommended
foods" block (state: `recommendedModalOpen`/`recommendedExpanded`, plus its `FoodSearchModal`
instance) and the `<BatchPlanner>` mount. The bottom button's existing `addDayToShoppingList`
becomes a toggle using the same `isOnList`/`removeItemByName` plumbing the meal-to-shopping-list
toggle plan (`2026-09-12-meal-to-shopping-list-toggle.md`) already threads into this component —
this plan reuses those same two props rather than adding a third way to reach the shopping list.

**Tech Stack:** Preact function components — this plan is almost entirely deletion, plus reusing
props already added by a sibling plan.

**Spec:** No separate spec doc — derived from the product owner's request (2026-09-12): "En
alttaki 'Bugünü alışveriş listesine ekle/çıkar' buton u kalsın, onun dışında alışveriş listesine
ekle ve toplu hazırlıklar kısmını kaldır." Ground truth: `src/components/MealPlanView.tsx`,
`src/components/BatchPlanner.tsx` (removed from this screen, not deleted from the repo — see
constraints below).

## Global Constraints

- No test suite exists; verify with `npm run build` and `npm run vercel:dev`.
- Never commit without an explicit request; branch first.
- **Depends on** `2026-09-12-meal-to-shopping-list-toggle.md` having landed first: this plan's
  Task 2 needs `MealPlanView`'s `isOnShoppingList`/`onRemoveShoppingItem` props (added by that
  plan) to make the bottom button a toggle. If that plan hasn't landed yet, do Task 1 (deletions)
  only and stop — don't invent a second, divergent add/remove mechanism.
- Do **not** delete `src/components/BatchPlanner.tsx`, `src/lib/preparationBatch.ts`,
  `api/preparation-batches.ts`, or the `preparation_batches` table — the request removes this
  section from the Yemek Planı screen, not the batch-cooking feature from the codebase. If no
  other screen mounts `BatchPlanner` after this change, flag that as dead code for the repo owner
  to decide on separately, rather than deleting it as part of this plan.
- Do not remove `FoodSearchModal`'s "Ürün Seç / Ara" instance (used by "+Ürünler") — only the
  "Recommended Foods Modal for Shopping" instance goes.

---

## File Structure

- Modify: `src/components/MealPlanView.tsx` — remove two sections, retarget the bottom button.

## Task 1: Remove the recommended-foods section and the batch planner

**Files:**
- Modify: `src/components/MealPlanView.tsx`

- [ ] **Step 1: Remove the "Recommended Foods for Shopping" block**

Delete this whole block (the collapsible header button + the 12-food grid):

```tsx
          {/* Recommended Foods for Shopping */}
          <div className="space-y-3 mt-6 pt-4 border-t border-border">
            <button ...>Alışveriş Listesine Ekle ...</button>
            {recommendedExpanded && ( ... )}
          </div>
```

- [ ] **Step 2: Remove the "Recommended Foods Modal for Shopping" instance**

Delete:

```tsx
      {/* Recommended Foods Modal for Shopping */}
      <FoodSearchModal
        title="Alışveriş Listesine Ekle"
        foods={foods}
        isOpen={recommendedModalOpen}
        onClose={() => setRecommendedModalOpen(false)}
        onSelect={(food, quantityG) => {
          onAddShoppingItem(food.name_tr, `${quantityG}g`);
          setRecommendedModalOpen(false);
        }}
      />
```

- [ ] **Step 3: Remove the now-unused state**

```diff
-  const [recommendedModalOpen, setRecommendedModalOpen] = useState(false);
-  const [recommendedExpanded, setRecommendedExpanded] = useState(false);
```

- [ ] **Step 4: Remove the `<BatchPlanner>` mount and its now-unused import/props**

```diff
-      <BatchPlanner
-        householdId={householdId}
-        foods={foods}
-        catalog={catalogMap}
-        exclusions={foodExclusions}
-        allergenExclusions={allergenExclusions}
-        defaultDate={date}
-      />
```

```diff
-import { BatchPlanner } from "@/components/BatchPlanner";
```

Check whether `foodExclusions`/`allergenExclusions` (from `useMealPersonalization`) are still
used elsewhere in this file after removing `BatchPlanner` — if this was their only consumer here,
either remove the now-unused destructuring or leave it if the recipe-picker plan's
`scoreAllCombos` call also needs them (it does, if that plan has landed — check before deleting).

- [ ] **Step 5: Remove the `ChevronDown` import if it's now unused**

`recommendedExpanded`'s chevron icon was the only user of `ChevronDown` in this file if nothing
else in `MealPlanView.tsx` uses it — grep the file before removing the import.

- [ ] **Step 6: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors, and no "declared but never read" warnings for anything touched above.

- [ ] **Step 7: Manual verification**

Run: `npm run vercel:dev`, open "Yemek Planı". Expected: no "Alışveriş Listesine Ekle" collapsible
section and no "Toplu Hazırlıklar" section appear anywhere on the page; the meal containers and
the bottom "Bu günü alışveriş listesine ekle" button (still add-only at this point) remain.

## Task 2: Make the bottom button a real add/remove toggle

**Files:**
- Modify: `src/components/MealPlanView.tsx`

**Interfaces:**
- Consumes: `isOnShoppingList: (name: string) => boolean` and
  `onRemoveShoppingItem: (name: string) => void` — both added to this component's `Props` by
  `2026-09-12-meal-to-shopping-list-toggle.md`. Do not proceed with this task until that plan's
  changes are present in this file.

- [ ] **Step 1: Compute whether today's plan is already fully on the shopping list**

```typescript
  const dayItems = allItems();
  const dayAlreadyOnList =
    dayItems.length > 0 &&
    dayItems.every((item) => isOnShoppingList(catalogMap.get(item.foodId)?.name_tr ?? item.foodId));
```

- [ ] **Step 2: Replace `addDayToShoppingList` with a toggle**

```diff
-  function addDayToShoppingList() {
-    for (const item of allItems()) {
-      const food = catalogMap.get(item.foodId);
-      onAddShoppingItem(food?.name_tr ?? item.foodId, `${item.quantityG}g`);
-    }
-  }
+  function toggleDayShoppingList() {
+    for (const item of allItems()) {
+      const name = catalogMap.get(item.foodId)?.name_tr ?? item.foodId;
+      if (dayAlreadyOnList) {
+        onRemoveShoppingItem(name);
+      } else {
+        onAddShoppingItem(name, `${item.quantityG}g`);
+      }
+    }
+  }
```

- [ ] **Step 3: Update the button**

```diff
       {hasTotals && (
         <Button
           type="button"
           variant="default"
           size="sm"
           className="w-full"
-          onClick={addDayToShoppingList}>
-          Bu günü alışveriş listesine ekle
+          onClick={toggleDayShoppingList}>
+          {dayAlreadyOnList ? "Bu günü alışveriş listesinden çıkar" : "Bu günü alışveriş listesine ekle"}
         </Button>
       )}
```

- [ ] **Step 4: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run: `npm run vercel:dev`, open "Yemek Planı" with at least one item planned for today. Expected:
the button reads "Bu günü alışveriş listesine ekle"; pressing it adds every planned item to the
active shopping list and the button label flips to "...listesinden çıkar"; pressing it again
removes them and the label flips back. If only some (not all) of today's items are on the list,
the button should still read "ekle" (per `dayAlreadyOnList`'s `.every(...)`), since "remove" only
makes sense once everything it would have added is actually present.

- [ ] **Step 6: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Self-Review Notes

- **Spec coverage:** "onun dışında alışveriş listesine ekle ve toplu hazırlıklar kısmını
  kaldır" → Task 1; "'Bugünü alışveriş listesine ekle/çıkar' butonu kalsın" (its `/çıkar` phrasing
  read literally as a toggle, consistent with the per-meal cart toggle requested in the same
  message) → Task 2.
- **Placeholder scan:** none.
- **Type consistency:** `toggleDayShoppingList`'s use of `isOnShoppingList`/`onRemoveShoppingItem`
  matches the prop names and signatures defined in `2026-09-12-meal-to-shopping-list-toggle.md`'s
  Task 3.
