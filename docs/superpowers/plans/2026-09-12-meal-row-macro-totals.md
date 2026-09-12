# Meal Row Macro Totals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Haiku 4.5 — a small, fully-specified addition reusing an existing utility.

**Scope:** Frontend only.

**Goal:** Show each meal row's (Kahvaltı/Öğle/Akşam/Ara) summed macro totals — not just each
item's own line — so a user can see a meal's overall kcal/protein/carbs/fat at a glance.

**Architecture:** `calculateItemsNutrition(items, catalog): MacroTotals` already exists in
`src/lib/localMealPlan.ts` and is exactly what's needed — it sums scaled macros across a list of
`MealItem`s, skipping any not yet resolvable against the catalog. `MealContainer` already
receives `items` and `catalog` as props, so this is a render-only addition: compute the total and
show it next to the meal's title.

**Tech Stack:** Preact function components, existing `src/lib/localMealPlan.ts` /
`src/lib/mealNutrition.ts`.

**Spec:** No separate spec doc — derived from the product owner's request (2026-09-12): "Öğün
satırlarına makro değerlerini toplamlarını ekle." Ground truth: `src/components/MealContainer.tsx`,
`src/lib/localMealPlan.ts`'s `calculateItemsNutrition`.

## Global Constraints

- No test suite exists; verify with `npm run build` and `npm run vercel:dev`.
- Never commit without an explicit request; branch first.
- Reuse `calculateItemsNutrition` rather than re-summing macros inline — it already handles the
  "item not yet in catalog" skip case consistently with the rest of the app (`useMealPlan`'s
  `slotNutrition`/`dailyNutrition` use the same function).

---

## File Structure

- Modify: `src/components/MealContainer.tsx` — compute and render the per-meal total.

## Task 1: Render the meal's summed macros

**Files:**
- Modify: `src/components/MealContainer.tsx`

**Interfaces:**
- Consumes: `calculateItemsNutrition(items: MealItem[], catalog: NutritionMap): MacroTotals` from
  `@/lib/localMealPlan`.
- Produces: no new exports; no prop changes (the component already receives `items` and
  `catalog`).

- [ ] **Step 1: Import the calculator**

```diff
 import { Plus } from "lucide-react";
 import type { MealItem } from "@/lib/localMealPlan";
+import { calculateItemsNutrition } from "@/lib/localMealPlan";
 import type { NutritionMap } from "@/lib/nutrition";
 import { MealItemCard } from "./MealItemCard";
```

- [ ] **Step 2: Compute the total and only show it when the meal has items**

Inside the component body, right after `const label = MEAL_LABELS[mealType];`:

```typescript
  const totals = items.length > 0 ? calculateItemsNutrition(items, catalog) : null;
```

- [ ] **Step 3: Render it next to the meal title**

```diff
-      <h3 className="font-semibold text-foreground">{label.tr}</h3>
+      <div className="flex items-baseline justify-between gap-2">
+        <h3 className="font-semibold text-foreground">{label.tr}</h3>
+        {totals && (
+          <p className="text-xs text-muted-foreground">
+            {Math.round(totals.kcal)} kcal · P: {Math.round(totals.proteinG)}g · K:{" "}
+            {Math.round(totals.carbsG)}g · Y: {Math.round(totals.fatG)}g
+          </p>
+        )}
+      </div>
```

- [ ] **Step 4: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run: `npm run vercel:dev`, open "Yemek Planı", add two or more items to one meal slot (via
"+Ürünler" or "+Tarif" — see the recipe-picker plan). Expected: that meal's header row now shows
"NNN kcal · P: Ng · K: Ng · Y: Ng" reflecting the sum of its items, and it disappears again if all
items are removed. Cross-check the number against the meal's items' own per-item macro lines
(`MealItemCard`'s existing `macroString`) — they should add up.

- [ ] **Step 6: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Self-Review Notes

- **Spec coverage:** "Öğün satırlarına makro değerlerini toplamlarını ekle" → Task 1 fully covers
  this with the existing summation utility.
- **Placeholder scan:** none.
- **Type consistency:** `calculateItemsNutrition`'s signature matches exactly what
  `MealContainer` already has in scope (`items: MealItem[]`, `catalog: NutritionMap`).
