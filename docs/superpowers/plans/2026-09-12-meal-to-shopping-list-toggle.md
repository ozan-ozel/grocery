# Meal-to-Shopping-List Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Sonnet 5 — new confirmation dialog plus prop-chain changes across
`App.tsx`, `MealPlanView.tsx`, and `MealContainer.tsx`.

**Scope:** Frontend only (reuses existing `listActions.ts` functions — no backend changes).

**Goal:** Add a third button to each meal row (next to "+Ürünler" and "+Tarif") with a shopping
cart icon that adds that meal's items to the active shopping list — or removes them, if they're
already all on it — after showing the user exactly what will be added and getting confirmation.

**Architecture:** A meal's `items` array already holds fully-resolved `{ foodId, quantityG }`
rows regardless of whether they came from "+Ürünler" or "+Tarif" (a recipe add already expands
into individual `MealItem` rows tagged with `comboId` — see the recipe-picker plan — so this
button never needs to re-expand a recipe itself). Membership-on-the-shopping-list and removal
already exist in `src/lib/listActions.ts` (`isOnList(name)`, `removeItemByName(name)`); adding
uses the existing `addItem(name, qty)`. This plan is: (1) thread `isOnList`/`removeItemByName`
down to `MealPlanView` alongside the existing `onAddShoppingItem`, (2) compute per-meal "already
on list?" state in `MealContainer`, (3) add the button + a small confirmation dialog listing the
items about to move.

**Tech Stack:** Preact function components, existing `src/lib/listActions.ts` functions, a new
lightweight confirmation dialog modeled on `src/components/ConfirmModal.tsx`.

**Spec:** No separate spec doc — derived from the product owner's request (2026-09-12):
"Öğünlerin içine +Ürünler, +Tarifler dışında Alışveriş Sepeti ikonu içerecek şekilde bir button
daha ekle. Bu button öğün içeriğini alışveriş listesine eklesin/çıkarsın (ürünleri ve/veya
tarifin içindeki ürünleri). Eklemeden önce eklenecek ürünlerin listesini kullanıcıya göster
onayını al." Ground truth: `src/lib/listActions.ts` (`addItem`, `isOnList`, `removeItemByName`),
`src/App.tsx` (owns `createListActions` and passes callbacks down to section views),
`src/components/MealContainer.tsx`, `src/components/MealPlanView.tsx`,
`src/components/ConfirmModal.tsx`.

## Global Constraints

- No test suite exists; verify with `npm run build` and `npm run vercel:dev`.
- Never commit without an explicit request; branch first.
- `isOnList`/`removeItemByName` match by exact-lowercased name (`toLocaleLowerCase("tr-TR")`),
  same as the rest of `listActions.ts` — use the food's `name_tr` (via the nutrition catalog),
  not the raw `foodId` string, since `foodId` here already *is* `name_tr` for meal items (see
  `MealItem.foodId`'s comment in `src/lib/localMealPlan.ts`), so no extra resolution step is
  needed beyond a catalog lookup for display purposes.
- This plan depends on the meal-row-macro-totals plan only for shared visual context (the totals
  line sits in the same row); no code dependency between them.

---

## File Structure

- Create: `src/components/MealShoppingConfirmModal.tsx` — shows the resolved item list before
  adding/removing, Confirm/Cancel.
- Modify: `src/components/MealContainer.tsx` — add the cart button + confirmation flow, compute
  "already on list" state.
- Modify: `src/components/MealPlanView.tsx` — accept and forward `isOnList`/`removeItemByName`.
- Modify: `src/App.tsx` — pass `isOnList` and `removeItemByName` into `MealPlanView` (only
  `onAddShoppingItem` is passed today).

## Task 1: Confirmation dialog

**Files:**
- Create: `src/components/MealShoppingConfirmModal.tsx`

**Interfaces:**
- Produces:
  ```typescript
  type MealShoppingConfirmModalProps = {
    mode: "add" | "remove";
    items: Array<{ name: string; qty: string }>;
    onConfirm: () => void;
    onCancel: () => void;
  };
  ```

- [ ] **Step 1: Write the component**

```tsx
import { Button } from "@/components/ui/button";

type Props = {
  mode: "add" | "remove";
  items: Array<{ name: string; qty: string }>;
  onConfirm: () => void;
  onCancel: () => void;
};

export function MealShoppingConfirmModal({ mode, items, onConfirm, onCancel }: Props) {
  const title =
    mode === "add" ? "Alışveriş listesine eklensin mi?" : "Alışveriş listesinden çıkarılsın mı?";
  const confirmLabel = mode === "add" ? "Listeye ekle" : "Listeden çıkar";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="Vazgeç"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/20"
      />
      <div className="relative z-10 w-full max-w-[22rem] rounded-xl border border-border bg-card p-5 shadow-lg">
        <h2 className="text-base font-semibold">{title}</h2>
        <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm">
          {items.map((item) => (
            <li key={item.name} className="flex items-baseline justify-between gap-2">
              <span className="truncate">{item.name}</span>
              <span className="ledger shrink-0 text-xs text-muted-foreground">{item.qty}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="quiet" size="sm" onClick={onCancel}>
            Vazgeç
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

## Task 2: Cart button + per-meal state in `MealContainer`

**Files:**
- Modify: `src/components/MealContainer.tsx`

**Interfaces:**
- Produces: new props `isOnShoppingList: (foodId: string) => boolean`,
  `onToggleShoppingList: (items: MealItem[], allOnList: boolean) => void` added to `Props`.

- [ ] **Step 1: Add the new props and the shopping-cart icon import**

```diff
-import { Plus } from "lucide-react";
+import { Plus, ShoppingCart } from "lucide-react";
 import type { MealItem } from "@/lib/localMealPlan";
 import { calculateItemsNutrition } from "@/lib/localMealPlan";
 import type { NutritionMap } from "@/lib/nutrition";
 import { MealItemCard } from "./MealItemCard";

 type Props = {
   mealType: MealType;
   items: MealItem[];
   catalog: NutritionMap;
   onSelectFood: () => void;
   onSelectRecipe: () => void;
   onRemoveItem: (itemId: string) => void;
   onUpdateItemQuantity: (itemId: string, quantityG: number) => void;
+  isOnShoppingList: (foodId: string) => boolean;
+  onToggleShoppingList: (items: MealItem[], allOnList: boolean) => void;
 };
```

- [ ] **Step 2: Compute whether the whole meal is already on the shopping list**

```diff
 export function MealContainer({
   mealType,
   items,
   catalog,
   onSelectFood,
   onSelectRecipe,
   onRemoveItem,
   onUpdateItemQuantity,
+  isOnShoppingList,
+  onToggleShoppingList,
 }: Props) {
   const label = MEAL_LABELS[mealType];
   const totals = items.length > 0 ? calculateItemsNutrition(items, catalog) : null;
+  const allOnList = items.length > 0 && items.every((item) => isOnShoppingList(item.foodId));
```

- [ ] **Step 3: Add the third button, in a three-column grid instead of two**

```diff
-      <div className="grid grid-cols-2 gap-2">
+      <div className="grid grid-cols-3 gap-2">
         <button
           type="button"
           onClick={onSelectFood}
           className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
           <Plus className="size-4" />
           Ürünler
         </button>
         <button
           type="button"
           onClick={onSelectRecipe}
           className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
           <Plus className="size-4" />
           Tarif
         </button>
+        <button
+          type="button"
+          disabled={items.length === 0}
+          onClick={() => onToggleShoppingList(items, allOnList)}
+          aria-label={allOnList ? "Alışveriş listesinden çıkar" : "Alışveriş listesine ekle"}
+          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">
+          <ShoppingCart className={`size-4 ${allOnList ? "text-signal" : ""}`} />
+        </button>
       </div>
```

- [ ] **Step 4: Run the typecheck**

Run: `npx tsc -b`
Expected: errors at every `<MealContainer>` call site missing the two new props — expected;
Task 3 fixes `MealPlanView.tsx` (see the note at the end of this plan for `MealTrackingView.tsx`).

## Task 3: Wire it in `MealPlanView` (confirm dialog + add/remove)

**Files:**
- Modify: `src/components/MealPlanView.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `isOnList(name: string): boolean` and `removeItemByName(name: string): void` from
  `src/lib/listActions.ts`, already returned by `createListActions` in `App.tsx` (add
  `removeItemByName` to that destructuring — `isOnList` is already there).
- Produces: `MealPlanView`'s `Props` type grows two fields:
  `isOnShoppingList: (name: string) => boolean` and `onRemoveShoppingItem: (name: string) => void`.

- [ ] **Step 1: Extend `MealPlanView`'s props**

```diff
 type Props = {
   userId: string | null;
   householdId: string | null;
   onAddShoppingItem: (name: string, qty: string) => void;
+  isOnShoppingList: (name: string) => boolean;
+  onRemoveShoppingItem: (name: string) => void;
 };

-export function MealPlanView({ userId, householdId, onAddShoppingItem }: Props) {
+export function MealPlanView({
+  userId,
+  householdId,
+  onAddShoppingItem,
+  isOnShoppingList,
+  onRemoveShoppingItem,
+}: Props) {
```

- [ ] **Step 2: Add confirmation-dialog state and the resolve/toggle handler**

```typescript
  const [shoppingConfirm, setShoppingConfirm] = useState<{
    slot: MealSlot;
    mode: "add" | "remove";
    items: MealItem[];
  } | null>(null);

  function requestShoppingToggle(slot: MealSlot, items: MealItem[], allOnList: boolean) {
    setShoppingConfirm({ slot, mode: allOnList ? "remove" : "add", items });
  }

  function confirmShoppingToggle() {
    if (!shoppingConfirm) return;
    for (const item of shoppingConfirm.items) {
      const food = catalogMap.get(item.foodId);
      const name = food?.name_tr ?? item.foodId;
      if (shoppingConfirm.mode === "add") {
        onAddShoppingItem(name, `${item.quantityG}g`);
      } else {
        onRemoveShoppingItem(name);
      }
    }
    setShoppingConfirm(null);
  }
```

(`MealItem`/`MealSlot` types are already imported in this file via `@/lib/localMealPlan`.)

- [ ] **Step 3: Pass the new props to `MealContainer` and render the dialog**

```diff
               <MealContainer
                 key={slot}
                 mealType={getMealType(slot)}
                 items={itemsForSlot(slot)}
                 catalog={catalogMap}
                 onSelectFood={() => { ... }}
                 onSelectRecipe={() => { ... }}
                 onRemoveItem={itemId => removeItem(slot, itemId)}
                 onUpdateItemQuantity={(itemId, quantityG) =>
                   updateItemQuantity(slot, itemId, quantityG)
                 }
+                isOnShoppingList={(foodId) => isOnShoppingList(catalogMap.get(foodId)?.name_tr ?? foodId)}
+                onToggleShoppingList={(items, allOnList) =>
+                  requestShoppingToggle(slot, items, allOnList)
+                }
               />
```

And near the other modals rendered at the bottom of `MealPlanView`:

```tsx
      {shoppingConfirm && (
        <MealShoppingConfirmModal
          mode={shoppingConfirm.mode}
          items={shoppingConfirm.items.map((item) => ({
            name: catalogMap.get(item.foodId)?.name_tr ?? item.foodId,
            qty: `${item.quantityG}g`,
          }))}
          onConfirm={confirmShoppingToggle}
          onCancel={() => setShoppingConfirm(null)}
        />
      )}
```

Add the import: `import { MealShoppingConfirmModal } from "@/components/MealShoppingConfirmModal";`

- [ ] **Step 4: Wire `App.tsx` to supply the two new props**

In `src/App.tsx`, add `removeItemByName` to the existing `createListActions` destructuring:

```diff
   const {
     addItem,
     toggleItem,
     editItem,
     removeItem,
+    removeItemByName,
     bulkRemove,
     startNewList,
     reuseList,
     deleteList,
     renameActive,
     toggleGrouping,
     categorizeActive,
     isOnList,
   } = createListActions({ ... });
```

Then pass both into `MealPlanView`:

```diff
           <MealPlanView
             userId={currentUserId}
             householdId={activeTenantId}
             onAddShoppingItem={addItem}
+            isOnShoppingList={isOnList}
+            onRemoveShoppingItem={removeItemByName}
           />
```

- [ ] **Step 5: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Run: `npm run vercel:dev`, open "Yemek Planı", add a couple of items to a meal (mix of a plain
"+Ürünler" add and a "+Tarif" add if that plan has landed). Press the cart button on that meal.
Expected: a confirmation dialog lists every resolved item name + its gram quantity; confirming
adds them all to the active shopping list (check the "Alışveriş" tab). Press the cart button
again on the same meal — expected: the dialog now offers to *remove* those same items (cart icon
should also visually flip to the "on list" state, e.g. the `text-signal` tint), and confirming
removes them from the shopping list. Cancel should leave the shopping list untouched either way.

- [ ] **Step 7: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Self-Review Notes

- **Spec coverage:** third button with a cart icon → Task 2 Step 3; toggles add/remove of the
  meal's products and/or recipe ingredients → Task 3 (recipe ingredients need no special-casing
  since they're already flattened `MealItem` rows, per Architecture); confirmation before adding
  → Task 1 + Task 3 Step 2/3.
- **Placeholder scan:** none.
- **Type consistency:** `isOnShoppingList: (foodId: string) => boolean` (Task 2) is fed a
  catalog-resolved name at the `MealPlanView` call site (Task 3 Step 3) so it always receives a
  real shopping-list-comparable name, matching `isOnList`'s own `name: string` parameter in
  `listActions.ts`.
- Note: like the two prior meal-item plans, `MealTrackingView.tsx` (unused today) will also need
  no-op values for the two new `MealContainer` props to keep `tsc -b` green if it's still present
  when this lands — e.g. `isOnShoppingList={() => false}` and `onToggleShoppingList={() => {}}`.
