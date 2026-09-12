# Recent/Favorites Quick-Add Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Sonnet 5 — new ranking logic, a new hook, and a multi-step dialog
component wired together correctly.

**Scope:** Frontend only (reuses the existing `meal-entries` read API — no backend changes).

**Goal:** A single "Son Kullanılanlar" (Recent/Frequently Used) button that opens a searchable
dialog of the household's most recently-added and most-frequently-used foods and recipes, letting
the user add a chosen item to one or more meal slots at once.

**Architecture:** This is cross-meal (not scoped to one slot the way "+Ürünler"/"+Tarif" are), so
it needs its own history query, wider than the single-day window `useMealPlan` already fetches.
`fetchMealEntries(householdId, from, to)` (`src/lib/mealPlan.ts`) already supports an arbitrary
date range — a new hook fetches the last 30 days once and derives two ranked lists client-side: a
food-frequency table (group by `foodId`, most recent `date` wins ties) and a recipe-frequency
table (group by non-null `comboId`, resolved to its `Combo` via `COMBO_BY_ID`). The dialog itself
follows `FoodSearchModal`'s search-input pattern, but its result rows can be either a food or a
recipe, and selecting one opens a slot-picker (checkboxes for the four `MEAL_SLOTS`) instead of
immediately adding — since the whole point of this button is "into one or more meals."

**Tech Stack:** Preact function components, TanStack Query, existing `src/lib/mealPlan.ts` /
`src/lib/combos.ts` / `src/lib/localMealPlan.ts`.

**Spec:** No separate spec doc — derived from the product owner's request (2026-09-12): "(Son
eklenen/Sık kullanılanlar) N ürün/tarif için bir button yarat, bu button bir dialog açsın. Dialog
taki listede arama olsun. Aramanın sonucunda seçilen ürün/tarif bir veya birden fazla öğüne
eklenebilsin." Ground truth: `src/lib/mealPlan.ts` (`fetchMealEntries`), `src/lib/combos.ts`
(`ALL_COMBOS`, `COMBO_BY_ID`), `src/lib/localMealPlan.ts` (`MEAL_SLOTS`), `useMealPlan`'s
`addItem` signature, `src/components/FoodSearchModal.tsx` (search-input precedent).

## Global Constraints

- No test suite exists; verify with `npm run build` and `npm run vercel:dev`.
- Never commit without an explicit request; branch first.
- The 30-day history fetch is a read-only, best-effort ranking signal — on fetch failure
  (`fetchMealEntries` already swallows errors and returns `[]`), the dialog should show an empty
  state, never throw.
- Adding a recipe from this dialog must expand its ingredients exactly like the recipe-picker
  plan's `handleRecipeSelect` does (loop `addItem(slot, item.foodId, item.grams, combo.id)` per
  ingredient) — don't add a second, divergent code path for "add a recipe to a slot." If the
  recipe-picker plan (`2026-09-12-recipe-picker.md`) has landed, reuse its handler; if not,
  duplicate the same three-line loop rather than inventing a different shape.

---

## File Structure

- Create: `src/lib/mealFrequency.ts` — pure ranking functions over `MealEntry[]`.
- Create: `src/hooks/useMealFrequency.ts` — 30-day history fetch + derived rankings.
- Create: `src/components/RecentFavoritesModal.tsx` — search + result list + slot picker.
- Modify: `src/components/MealPlanView.tsx` — add the button and wire the modal.

## Task 1: Ranking logic

**Files:**
- Create: `src/lib/mealFrequency.ts`

**Interfaces:**
- Produces:
  ```typescript
  export type FoodUsage = { foodId: string; count: number; lastDate: string };
  export type RecipeUsage = { comboId: string; count: number; lastDate: string };
  export function rankFoodUsage(entries: MealEntry[]): FoodUsage[];
  export function rankRecipeUsage(entries: MealEntry[]): RecipeUsage[];
  ```

- [ ] **Step 1: Write the module**

```typescript
import type { MealEntry } from "./mealPlan";

export type FoodUsage = { foodId: string; count: number; lastDate: string };
export type RecipeUsage = { comboId: string; count: number; lastDate: string };

// Groups every meal_entries row by foodId, counting occurrences and tracking
// the most recent date it was logged. Sorted most-recent-first, then
// highest-count — same tie-break order as store.ts's mergeNearDuplicates
// uses for the shopping catalog ("recency first reads as 'what have I been
// eating lately', not just 'what do I eat most often'").
export function rankFoodUsage(entries: MealEntry[]): FoodUsage[] {
  const byFood = new Map<string, FoodUsage>();
  for (const entry of entries) {
    const existing = byFood.get(entry.foodId);
    if (!existing) {
      byFood.set(entry.foodId, { foodId: entry.foodId, count: 1, lastDate: entry.date });
      continue;
    }
    existing.count += 1;
    if (entry.date > existing.lastDate) existing.lastDate = entry.date;
  }
  return [...byFood.values()].sort(
    (a, b) => (b.lastDate > a.lastDate ? 1 : b.lastDate < a.lastDate ? -1 : 0) || b.count - a.count,
  );
}

// Same grouping, but by comboId (recipes) — entries with no comboId (a plain
// food add, not a recipe add) are excluded entirely.
export function rankRecipeUsage(entries: MealEntry[]): RecipeUsage[] {
  const byCombo = new Map<string, RecipeUsage>();
  for (const entry of entries) {
    if (!entry.comboId) continue;
    const existing = byCombo.get(entry.comboId);
    if (!existing) {
      byCombo.set(entry.comboId, { comboId: entry.comboId, count: 1, lastDate: entry.date });
      continue;
    }
    existing.count += 1;
    if (entry.date > existing.lastDate) existing.lastDate = entry.date;
  }
  return [...byCombo.values()].sort(
    (a, b) => (b.lastDate > a.lastDate ? 1 : b.lastDate < a.lastDate ? -1 : 0) || b.count - a.count,
  );
}
```

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

## Task 2: History hook

**Files:**
- Create: `src/hooks/useMealFrequency.ts`

**Interfaces:**
- Produces: `useMealFrequency(householdId: string | null)` →
  `{ foods: FoodUsage[], recipes: RecipeUsage[], isLoading: boolean }`.

- [ ] **Step 1: Write the hook**

```typescript
import { useQuery } from "@tanstack/preact-query";
import { fetchMealEntries } from "@/lib/mealPlan";
import { rankFoodUsage, rankRecipeUsage } from "@/lib/mealFrequency";

const HISTORY_WINDOW_DAYS = 30;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useMealFrequency(householdId: string | null) {
  const query = useQuery({
    queryKey: ["mealFrequency", householdId ?? "local"] as const,
    queryFn: () => fetchMealEntries(householdId as string, daysAgoStr(HISTORY_WINDOW_DAYS), todayStr()),
    enabled: !!householdId,
    staleTime: 60_000,
  });

  const entries = query.data ?? [];
  return {
    foods: rankFoodUsage(entries),
    recipes: rankRecipeUsage(entries),
    isLoading: !!householdId && query.isLoading,
  };
}
```

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

## Task 3: Dialog component

**Files:**
- Create: `src/components/RecentFavoritesModal.tsx`

**Interfaces:**
- Consumes: `FoodUsage[]`/`RecipeUsage[]` from Task 1, `NutritionMap` (to resolve a food's
  display name/macros), `Combo`/`COMBO_BY_ID` from `@/lib/combos`, `MEAL_SLOTS` from
  `@/lib/localMealPlan`.
- Produces: `onAddFood: (foodId: string, slots: MealSlot[]) => void` and
  `onAddRecipe: (combo: Combo, slots: MealSlot[]) => void` — the caller (Task 4) owns turning
  these into real `addItem` calls, so this component has no knowledge of `useMealPlan` at all.

- [ ] **Step 1: Write the component**

```tsx
import { useState } from "react";
import { Search, X } from "lucide-react";
import type { NutritionMap } from "@/lib/nutrition";
import type { FoodUsage, RecipeUsage } from "@/lib/mealFrequency";
import { COMBO_BY_ID, type Combo } from "@/lib/combos";
import { MEAL_SLOTS, type MealSlot } from "@/lib/localMealPlan";

type ResultRow =
  | { kind: "food"; foodId: string; label: string }
  | { kind: "recipe"; combo: Combo; label: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodUsage[];
  recipes: RecipeUsage[];
  catalog: NutritionMap;
  onAddFood: (foodId: string, slots: MealSlot[]) => void;
  onAddRecipe: (combo: Combo, slots: MealSlot[]) => void;
};

export function RecentFavoritesModal({
  isOpen,
  onClose,
  foods,
  recipes,
  catalog,
  onAddFood,
  onAddRecipe,
}: Props) {
  const [query, setQuery] = useState("");
  const [picking, setPicking] = useState<ResultRow | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Set<MealSlot>>(new Set());

  const rows: ResultRow[] = [
    ...foods
      .map((usage) => {
        const nutrition = catalog.get(usage.foodId);
        return nutrition ? { kind: "food" as const, foodId: usage.foodId, label: nutrition.name_tr } : null;
      })
      .filter((row): row is ResultRow => row !== null),
    ...recipes
      .map((usage) => {
        const combo = COMBO_BY_ID.get(usage.comboId);
        return combo ? { kind: "recipe" as const, combo, label: combo.nameTr } : null;
      })
      .filter((row): row is ResultRow => row !== null),
  ];

  const queryLower = query.trim().toLowerCase();
  const results = queryLower
    ? rows.filter((row) => row.label.toLowerCase().includes(queryLower))
    : rows.slice(0, 20);

  function resetAndClose() {
    setQuery("");
    setPicking(null);
    setSelectedSlots(new Set());
    onClose();
  }

  function toggleSlot(slot: MealSlot) {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }

  function confirmAdd() {
    if (!picking || selectedSlots.size === 0) return;
    const slots = [...selectedSlots];
    if (picking.kind === "food") onAddFood(picking.foodId, slots);
    else onAddRecipe(picking.combo, slots);
    resetAndClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full rounded-t-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Son Kullanılanlar</h2>
          <button type="button" onClick={resetAndClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {picking ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">{picking.label}</h3>
            <p className="text-xs text-muted-foreground">Hangi öğün(ler)e eklensin?</p>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_SLOTS.map(({ slot, label }) => (
                <label
                  key={slot}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedSlots.has(slot)}
                    onChange={() => toggleSlot(slot)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={selectedSlots.size === 0}
                onClick={confirmAdd}
                className="flex-1 rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setPicking(null)}
                className="flex-1 rounded-lg border border-border px-3 py-2 font-medium text-foreground hover:bg-accent">
                Geri
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ürün veya tarif ara..."
                value={query}
                onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
                autoFocus
                className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Henüz geçmiş yok — bir öğün ekledikçe burada görünecek.
                </div>
              ) : (
                results.map((row) => (
                  <button
                    key={row.kind === "food" ? `food-${row.foodId}` : `recipe-${row.combo.id}`}
                    type="button"
                    onClick={() => setPicking(row)}
                    className="w-full text-left rounded-lg border border-border bg-background p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{row.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {row.kind === "recipe" ? "Tarif" : "Ürün"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

## Task 4: Wire the button into `MealPlanView`

**Files:**
- Modify: `src/components/MealPlanView.tsx`

- [ ] **Step 1: Import and mount the hook + modal**

```typescript
  const { foods: usedFoods, recipes: usedRecipes } = useMealFrequency(householdId);
  const [recentModalOpen, setRecentModalOpen] = useState(false);
  const quickAddCount = usedFoods.length + usedRecipes.length;
```

- [ ] **Step 2: Add the button**, placed directly above the meal containers list (below
  `MacroSummaryCard`, so it reads as a cross-meal action rather than belonging to any one slot):

```tsx
      {quickAddCount > 0 && (
        <Button
          type="button"
          variant="quiet"
          size="sm"
          className="w-full"
          onClick={() => setRecentModalOpen(true)}>
          Son Kullanılanlar ({quickAddCount})
        </Button>
      )}
```

- [ ] **Step 3: Handle food/recipe selection**

```typescript
  function handleQuickAddFood(foodId: string, slots: MealSlot[]) {
    const nutrition = catalogMap.get(foodId);
    if (!nutrition) return;
    for (const slot of slots) addItem(slot, foodId, 100);
  }

  function handleQuickAddRecipe(combo: Combo, slots: MealSlot[]) {
    for (const slot of slots) {
      for (const item of combo.items) addItem(slot, item.foodId, item.grams, combo.id);
    }
  }
```

(100g is the same default quantity `FoodSearchModal` starts new picks at — see its `quantity`
state's initial value — kept consistent rather than inventing a different default here.)

- [ ] **Step 4: Render the modal**

```tsx
      <RecentFavoritesModal
        isOpen={recentModalOpen}
        onClose={() => setRecentModalOpen(false)}
        foods={usedFoods}
        recipes={usedRecipes}
        catalog={catalogMap}
        onAddFood={handleQuickAddFood}
        onAddRecipe={handleQuickAddRecipe}
      />
```

Add the imports: `useMealFrequency` from `@/hooks/useMealFrequency`, `RecentFavoritesModal` from
`@/components/RecentFavoritesModal`, `Combo` type from `@/lib/combos`.

- [ ] **Step 5: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Run: `npm run vercel:dev`. Add a few foods and (if the recipe-picker plan has landed) a recipe
across different meals/days over a couple of test dates. Open "Son Kullanılanlar" — expected: the
list shows those items, most-recently-used first; typing in the search box filters it; picking an
item shows the four-slot checkbox picker; selecting two slots and confirming adds the item (or
every ingredient of a recipe) to both.

- [ ] **Step 7: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Self-Review Notes

- **Spec coverage:** single button opening a dialog → Task 4 Step 2 + Task 3; search inside the
  dialog → Task 3 Step 1's query filter; multi-meal add → Task 3's slot-picker step + Task 4's
  `handleQuickAddFood`/`handleQuickAddRecipe` looping over `slots`.
- **Placeholder scan:** none.
- **Type consistency:** `ResultRow`'s two variants (`food`/`recipe`) match
  `onAddFood(foodId, slots)`/`onAddRecipe(combo, slots)`'s parameter shapes exactly, and
  `FoodUsage`/`RecipeUsage` (Task 1) match what `useMealFrequency` (Task 2) returns and what
  `RecentFavoritesModal` (Task 3) consumes.
