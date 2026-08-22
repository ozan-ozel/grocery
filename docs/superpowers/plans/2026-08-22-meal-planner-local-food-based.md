# Local Food-Based Meal Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Meal Planner's manual free-text/manual-macro entry with a
food-database-driven, purely local (no DB writes) meal composition UI, with
exactly one Snack slot and derived nutrition totals.

**Architecture:** Two new pure-logic modules (`mealNutrition.ts` for
per-100g→per-quantity macro math, `localMealPlan.ts` for the local
MealItem/slot domain model) sit under a rewritten `useMealPlan` hook that
holds all state in React (no network I/O). A new `useFoodCatalog` hook loads
the existing ~64-row `nutrition` catalog once via the unmodified
`browseNutritionCached`. `MealPlanView` is rewritten to render four uniform
meal sections (Breakfast/Lunch/Dinner/Snack, one each) with a food-search
"+ Add Food" picker and a compact nutrition row; a new bottom-sheet component
shows the read-only per-meal detail. The old DB-backed `lib/mealPlan.ts`
module, its Netlify function, and the `meal_entries` Supabase table are left
completely untouched and unused, ready for a future persistence phase.

**Tech Stack:** React/Preact function components + hooks, existing Tailwind
design tokens, existing `Button`/`Input` UI primitives, existing
`src/lib/nutrition.ts` data layer. No new dependencies.

**Spec:** The full spec is the user's message that opened this task (not a
committed file) — "Local Meal Planner UI & Food Selection Revision". Two
clarifications were resolved with the user before this plan was written and
are captured as constraints below.

## Global Constraints

- **Local only, no DB writes:** adding/editing/removing a food item, or
  changing quantity, must never call `fetch` against `/api/*`. The existing
  DB-backed `src/lib/mealPlan.ts`, `netlify/functions/meal-entries.ts`, and
  the `meal_entries` Supabase table are preserved unmodified but unused —
  do not delete or edit them.
- **Exactly one Snack:** the four meal slots (`kahvalti`/`ogle`/`aksam`/`ara`,
  i.e. Breakfast/Lunch/Dinner/Snack) are fixed, one section each, rendered
  uniformly. No "add another snack" affordance.
- **No manual nutrition entry:** the user picks a food from the existing
  nutrition catalog (`src/lib/nutrition.ts`, `data/nutrition.json` seed,
  Supabase `nutrition` table — 64 rows today) and a quantity in grams.
  Calories/protein/fat/carbs/fiber are always derived, never typed in.
- **Nutrient scope resolved:** the codebase has no 61-nutrient-per-food
  dataset — only `kcal_per_100`, `protein_g`, `fat_g`, `carbs_g`, `fiber_g`
  exist per food. Per user decision, the detail sheet renders exactly those
  5 fields (dynamically, from one shared field descriptor, not copy-pasted
  JSX) plus a per-food breakdown. Nothing is hardcoded or invented beyond
  what `Nutrition` actually carries.
- **No test framework:** per user decision, do not add Vitest or any test
  runner. Each task's verification step is `npm run build` (the repo's only
  automated check, per CLAUDE.md) plus a manual exercise of that slice
  through `npm run netlify:dev` (needed because `/api/nutrition` — used by
  the food catalog — 404s under plain `npm run dev`).
- **No auto-commit:** per standing user preference, do not run `git commit`
  as part of these tasks. Implement and verify each task, then stop; the
  user commits manually after testing themselves. (This overrides the
  "Commit" step that would normally close out each task below.)
- **Existing branch:** work happens on the already-checked-out
  `feature/meal-planner` branch — do not create a new branch.
- **Household scoping preserved:** `MealPlanView`'s existing
  `{ householdId: string | null }` prop and its call site in `App.tsx`
  (`<MealPlanView householdId={activeTenantId} />`) are unchanged. Local
  state is keyed by `householdId` (falling back to `"local"` when null) so
  switching tenants mid-session doesn't bleed one household's meal plan into
  another's view.
- **Date navigation preserved:** the existing prev/next-day header and
  `readMealDateFromUrl`/`writeMealDateToUrl`/`defaultTitle` reuse from
  `src/lib/store.ts` are kept as-is; local state is additionally keyed by
  date string.

---

## File Structure

- Create `src/lib/mealNutrition.ts` — pure macro math, food-shape agnostic
  of the meal plan (`MacroTotals`, `scaleNutrition`, `sumMacros`).
- Create `src/lib/localMealPlan.ts` — local domain model (`MealItem`,
  `MEAL_SLOTS`, `createMealItem`, `calculateItemsNutrition`). Re-exports
  `MealSlot` from the untouched `src/lib/mealPlan.ts` rather than
  redefining it.
- Create `src/hooks/useFoodCatalog.ts` — loads the full food list once via
  the existing `browseNutritionCached`, exposes a `NutritionMap`.
- Rewrite `src/hooks/useMealPlan.ts` — local-only state (was DB-backed),
  same exported hook name, new return shape.
- Create `src/components/MealFoodPicker.tsx` — the "+ Add Food"
  search-then-quantity flow.
- Create `src/components/MealNutritionDetailSheet.tsx` — read-only bottom
  sheet for one meal's (or the day's) detailed nutrition.
- Rewrite `src/components/MealPlanView.tsx` — four uniform meal sections +
  daily total, composing the hooks and new components above.
- Unchanged (verify, don't touch): `src/lib/mealPlan.ts`,
  `netlify/functions/meal-entries.ts`, `supabase/01-schema.sql`,
  `src/lib/nutrition.ts`, `src/components/NutritionAllFoodsBrowser.tsx`,
  `src/components/NutritionView.tsx`, `src/components/NutritionTableCell.tsx`
  (its `format` helper is reused), `src/components/ui/*`, `src/lib/store.ts`
  (`uid`, `defaultTitle`, `readMealDateFromUrl`, `writeMealDateToUrl`
  reused as-is), `src/App.tsx`.

---

### Task 1: Macro math module

**Files:**
- Create: `src/lib/mealNutrition.ts`

**Interfaces:**
- Consumes: `Nutrition` type from `src/lib/nutrition.ts` (`kcal_per_100`,
  `protein_g`, `fat_g`, `carbs_g`, `fiber_g` — all `number`).
- Produces: `MacroTotals` type `{ kcal, proteinG, fatG, carbsG, fiberG }`
  (all `number`), `ZERO_MACROS`, `scaleNutrition(nutrition, quantityG)`,
  `sumMacros(list)` — used by Task 2 and the detail sheet in Task 6.

- [ ] **Step 1: Write the module**

```ts
// src/lib/mealNutrition.ts
import type { Nutrition } from "./nutrition";

export type MacroTotals = {
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
};

export const ZERO_MACROS: MacroTotals = {
  kcal: 0,
  proteinG: 0,
  fatG: 0,
  carbsG: 0,
  fiberG: 0,
};

// Nutrition rows are per 100g/100ml (see data/README.md); scale linearly to
// the meal item's actual quantity.
export function scaleNutrition(nutrition: Nutrition, quantityG: number): MacroTotals {
  const factor = quantityG / 100;
  return {
    kcal: nutrition.kcal_per_100 * factor,
    proteinG: nutrition.protein_g * factor,
    fatG: nutrition.fat_g * factor,
    carbsG: nutrition.carbs_g * factor,
    fiberG: nutrition.fiber_g * factor,
  };
}

export function sumMacros(list: MacroTotals[]): MacroTotals {
  return list.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      proteinG: acc.proteinG + m.proteinG,
      fatG: acc.fatG + m.fatG,
      carbsG: acc.carbsG + m.carbsG,
      fiberG: acc.fiberG + m.fiberG,
    }),
    { ...ZERO_MACROS }
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run build`
Expected: succeeds (this file has no callers yet, so it can't break
anything else — just confirm no syntax/type errors in the new file).

---

### Task 2: Local meal-plan domain model

**Files:**
- Create: `src/lib/localMealPlan.ts`

**Interfaces:**
- Consumes: `MealSlot` type from `src/lib/mealPlan.ts` (unchanged,
  `"kahvalti" | "ogle" | "aksam" | "ara"`); `uid` from `src/lib/store.ts`;
  `NutritionMap`/`Nutrition` from `src/lib/nutrition.ts`; `scaleNutrition`,
  `sumMacros`, `MacroTotals` from Task 1's `src/lib/mealNutrition.ts`.
- Produces: `MealItem` type `{ id, foodId, quantityG }`, `MEAL_SLOTS`
  (ordered `{ slot, label }[]` covering all four slots once each),
  `createMealItem(foodId, quantityG)`, `calculateItemsNutrition(items,
  catalog)` — used by Task 4 (`useMealPlan`) and Task 7 (`MealPlanView`).

- [ ] **Step 1: Write the module**

```ts
// src/lib/localMealPlan.ts
import type { MealSlot } from "./mealPlan";
import type { Nutrition, NutritionMap } from "./nutrition";
import { uid } from "./store";
import { scaleNutrition, sumMacros, type MacroTotals } from "./mealNutrition";

export type { MealSlot };

// What the user actually controls per spec: a food and a quantity. Nutrition
// is always derived (see calculateItemsNutrition), never stored here.
export type MealItem = {
  id: string;
  foodId: string; // Nutrition.name_tr
  quantityG: number;
};

// Exactly one section per slot, rendered in this order — no "add another
// snack" affordance exists anywhere that consumes this list.
export const MEAL_SLOTS: { slot: MealSlot; label: string }[] = [
  { slot: "kahvalti", label: "Kahvaltı" },
  { slot: "ogle", label: "Öğle" },
  { slot: "aksam", label: "Akşam" },
  { slot: "ara", label: "Ara öğün" },
];

export function createMealItem(foodId: string, quantityG: number): MealItem {
  return { id: uid(), foodId, quantityG };
}

// Items whose foodId isn't in the catalog (e.g. catalog still loading) are
// skipped rather than throwing — the UI shows partial totals until the
// catalog is ready.
export function calculateItemsNutrition(
  items: MealItem[],
  catalog: NutritionMap
): MacroTotals {
  const perItem: MacroTotals[] = [];
  for (const item of items) {
    const nutrition: Nutrition | undefined = catalog.get(item.foodId);
    if (!nutrition) continue;
    perItem.push(scaleNutrition(nutrition, item.quantityG));
  }
  return sumMacros(perItem);
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run build`
Expected: succeeds.

---

### Task 3: Food catalog hook

**Files:**
- Create: `src/hooks/useFoodCatalog.ts`

**Interfaces:**
- Consumes: `browseNutritionCached` from `src/lib/nutrition.ts` (existing,
  unmodified — the reused search/data layer).
- Produces: `useFoodCatalog()` returning `{ foods: Nutrition[], catalogMap:
  NutritionMap, status: "idle"|"loading"|"ready"|"error" }` — used by
  Task 4 and Task 7.

- [ ] **Step 1: Write the hook**

```ts
// src/hooks/useFoodCatalog.ts
import { useEffect, useMemo, useState } from "react";
import { browseNutritionCached, type Nutrition, type NutritionMap } from "@/lib/nutrition";

type Status = "idle" | "loading" | "ready" | "error";

// There are ~64 rows total, so loading them all once (rather than the
// debounced server-side search AllFoodsBrowser uses) and filtering
// client-side — same pattern as SearchView.tsx — is simpler and avoids a
// network round trip per keystroke in the Add Food picker.
const CATALOG_LIMIT = 200;

export function useFoodCatalog() {
  const [foods, setFoods] = useState<Nutrition[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    browseNutritionCached("", CATALOG_LIMIT)
      .then((rows) => {
        if (cancelled) return;
        setFoods(rows);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          "[mealPlan] food catalog fetch failed — if you're running locally, npm run netlify:dev serves /api/*, npm run dev does not:",
          err
        );
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const catalogMap: NutritionMap = useMemo(
    () => new Map(foods.map((f) => [f.name_tr, f])),
    [foods]
  );

  return { foods, catalogMap, status };
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run build`
Expected: succeeds.

---

### Task 4: Rewrite `useMealPlan` for local-only state

**Files:**
- Modify: `src/hooks/useMealPlan.ts` (full rewrite of the body; same file,
  same exported hook name)

**Interfaces:**
- Consumes: `defaultTitle`, `readMealDateFromUrl`, `writeMealDateToUrl` from
  `src/lib/store.ts` (unchanged); `MEAL_SLOTS`, `MealItem`, `MealSlot`,
  `createMealItem`, `calculateItemsNutrition` from Task 2's
  `src/lib/localMealPlan.ts`; `sumMacros`, `MacroTotals` from Task 1's
  `src/lib/mealNutrition.ts`; `NutritionMap` from `src/lib/nutrition.ts`.
- Produces: `useMealPlan(householdId: string | null, catalog: NutritionMap)`
  returning `{ dateLabel, goToPrevDay, goToNextDay, itemsForSlot(slot),
  addItem(slot, foodId, quantityG), updateItemQuantity(slot, itemId,
  quantityG), removeItem(slot, itemId), slotNutrition(slot),
  dailyNutrition() }` — used by Task 7 (`MealPlanView`).

- [ ] **Step 1: Replace the file contents**

```ts
// src/hooks/useMealPlan.ts
import { useEffect, useState } from "react";
import { defaultTitle, readMealDateFromUrl, writeMealDateToUrl } from "@/lib/store";
import type { NutritionMap } from "@/lib/nutrition";
import {
  MEAL_SLOTS,
  calculateItemsNutrition,
  createMealItem,
  type MealItem,
  type MealSlot,
} from "@/lib/localMealPlan";
import { sumMacros, type MacroTotals } from "@/lib/mealNutrition";

function dateToStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function strToDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDaysStr(dateStr: string, delta: number): string {
  const dt = strToDate(dateStr);
  dt.setDate(dt.getDate() + delta);
  return dateToStr(dt);
}

function todayDateStr(): string {
  return dateToStr(new Date());
}

function initialDate(): string {
  const fromUrl = readMealDateFromUrl();
  return fromUrl && /^\d{4}-\d{2}-\d{2}$/.test(fromUrl) ? fromUrl : todayDateStr();
}

type DayPlan = Record<MealSlot, MealItem[]>;

function emptyDayPlan(): DayPlan {
  return { kahvalti: [], ogle: [], aksam: [], ara: [] };
}

// Local-only for this phase: nothing here ever calls the network. Plans are
// keyed by household (so switching tenants doesn't bleed one household's
// plan into another's view) and by date (so the existing prev/next-day
// navigation keeps working) — but they live only in this component tree's
// state and are lost on reload, matching "Meal Plan = local only" and the
// explicit "do not implement saving Meal Plans" instruction for this phase.
export function useMealPlan(householdId: string | null, catalog: NutritionMap) {
  const [date, setDate] = useState<string>(initialDate);
  const [plans, setPlans] = useState<Record<string, DayPlan>>({});

  useEffect(() => {
    writeMealDateToUrl(date);
  }, [date]);

  const planKey = `${householdId ?? "local"}|${date}`;
  const dayPlan = plans[planKey] ?? emptyDayPlan();

  function updateDayPlan(updater: (plan: DayPlan) => DayPlan) {
    setPlans((prev) => ({
      ...prev,
      [planKey]: updater(prev[planKey] ?? emptyDayPlan()),
    }));
  }

  function goToPrevDay() {
    setDate((d) => addDaysStr(d, -1));
  }

  function goToNextDay() {
    setDate((d) => addDaysStr(d, 1));
  }

  function itemsForSlot(slot: MealSlot): MealItem[] {
    return dayPlan[slot];
  }

  function addItem(slot: MealSlot, foodId: string, quantityG: number) {
    const item = createMealItem(foodId, quantityG);
    updateDayPlan((plan) => ({ ...plan, [slot]: [...plan[slot], item] }));
  }

  function updateItemQuantity(slot: MealSlot, itemId: string, quantityG: number) {
    updateDayPlan((plan) => ({
      ...plan,
      [slot]: plan[slot].map((item) => (item.id === itemId ? { ...item, quantityG } : item)),
    }));
  }

  function removeItem(slot: MealSlot, itemId: string) {
    updateDayPlan((plan) => ({
      ...plan,
      [slot]: plan[slot].filter((item) => item.id !== itemId),
    }));
  }

  function slotNutrition(slot: MealSlot): MacroTotals {
    return calculateItemsNutrition(dayPlan[slot], catalog);
  }

  function dailyNutrition(): MacroTotals {
    return sumMacros(MEAL_SLOTS.map(({ slot }) => slotNutrition(slot)));
  }

  return {
    dateLabel: defaultTitle(strToDate(date).getTime()),
    goToPrevDay,
    goToNextDay,
    itemsForSlot,
    addItem,
    updateItemQuantity,
    removeItem,
    slotNutrition,
    dailyNutrition,
  };
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run build`
Expected: fails at this point — `src/components/MealPlanView.tsx` still
imports the old shape (`fixedEntry`, `araEntries`, `NutritionValues`, etc.)
from this hook. Confirm the *only* errors reported are in
`MealPlanView.tsx`, not in `useMealPlan.ts` itself — that isolates the
rewrite as correct on its own and defers the consumer fix to Task 7.

---

### Task 5: Add-food picker component

**Files:**
- Create: `src/components/MealFoodPicker.tsx`

**Interfaces:**
- Consumes: `Nutrition` type from `src/lib/nutrition.ts`; `Button`, `Input`
  from `src/components/ui/*` (unchanged).
- Produces: `MealFoodPicker({ foods, onAdd })` where `onAdd: (foodId:
  string, quantityG: number) => void` — used by Task 7.

- [ ] **Step 1: Write the component**

```tsx
// src/components/MealFoodPicker.tsx
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Nutrition } from "@/lib/nutrition";

type Props = {
  foods: Nutrition[];
  onAdd: (foodId: string, quantityG: number) => void;
};

// Search-then-quantity flow: "+ Add Food" opens a panel (same visual idiom
// as AddItem.tsx's suggestion dropdown), the user picks a food, then enters
// a gram quantity and confirms. Filtering is plain case-insensitive
// substring match on the already-loaded catalog — same algorithm
// SearchView.tsx uses — since there are only ~64 foods to search.
export function MealFoodPicker({ foods, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Nutrition | null>(null);
  const [quantity, setQuantity] = useState("100");

  const q = query.trim().toLocaleLowerCase("tr-TR");
  const results = q
    ? foods.filter((f) => f.name_tr.toLocaleLowerCase("tr-TR").includes(q))
    : foods.slice(0, 30);

  function reset() {
    setOpen(false);
    setQuery("");
    setSelected(null);
    setQuantity("100");
  }

  function confirmAdd() {
    if (!selected) return;
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;
    onAdd(selected.name_tr, qty);
    reset();
  }

  if (!open) {
    return (
      <Button type="button" variant="quiet" size="sm" onClick={() => setOpen(true)} className="mt-2">
        <Plus className="size-3.5" />
        Besin ekle
      </Button>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-border bg-card p-2 shadow-sm">
      {selected ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 text-sm">{selected.name_tr}</span>
          <Input
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            value={quantity}
            aria-label={`${selected.name_tr} miktarı (gram)`}
            onInput={(e: Event) => setQuantity((e.target as HTMLInputElement).value)}
            className="ledger h-9 w-20 px-2 text-right tabular-nums"
          />
          <span className="text-xs text-muted-foreground">g</span>
          <Button type="button" size="sm" onClick={confirmAdd}>
            Ekle
          </Button>
          <Button type="button" variant="quiet" size="sm" onClick={reset}>
            Vazgeç
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              autoFocus
              placeholder="Besin ara"
              aria-label="Besin ara"
              className="pl-9"
              onInput={(e: Event) => setQuery((e.target as HTMLInputElement).value)}
            />
          </div>
          <ul className="mt-1 max-h-56 overflow-y-auto">
            {results.length === 0 && (
              <li className="px-2 py-3 text-sm text-muted-foreground">
                "{query.trim()}" ile eşleşen besin yok.
              </li>
            )}
            {results.map((food) => (
              <li key={food.name_tr}>
                <button
                  type="button"
                  onClick={() => setSelected(food)}
                  className="flex w-full items-center justify-between px-2 py-2 text-left text-sm hover:bg-accent"
                >
                  <span>{food.name_tr}</span>
                  <span className="ledger text-xs text-muted-foreground">
                    {Math.round(food.kcal_per_100)} kcal/100g
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="quiet" size="sm" onClick={reset} className="mt-1">
            Kapat
          </Button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run build`
Expected: succeeds (component has no callers yet, so any errors are
self-contained).

---

### Task 6: Nutrition detail bottom sheet

**Files:**
- Create: `src/components/MealNutritionDetailSheet.tsx`

**Interfaces:**
- Consumes: `format` from `src/components/NutritionTableCell.tsx`
  (existing, unmodified); `Button` from `src/components/ui/button.tsx`;
  `Nutrition`, `NutritionMap` from `src/lib/nutrition.ts`; `MealItem` from
  Task 2's `src/lib/localMealPlan.ts`; `scaleNutrition`, `MacroTotals` from
  Task 1's `src/lib/mealNutrition.ts`.
- Produces: `MealNutritionDetailSheet({ title, macros, items, catalog,
  onClose })` — used by Task 7.

- [ ] **Step 1: Write the component**

```tsx
// src/components/MealNutritionDetailSheet.tsx
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "@/components/NutritionTableCell";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { MealItem } from "@/lib/localMealPlan";
import { scaleNutrition, type MacroTotals } from "@/lib/mealNutrition";

type Props = {
  title: string;
  macros: MacroTotals;
  items: MealItem[];
  catalog: NutritionMap;
  onClose: () => void;
};

// The Nutrition model only carries these 5 fields per food (no
// vitamin/mineral dataset exists in this codebase) — rendered from one
// shared descriptor rather than hardcoded per-field JSX, so a future
// addition to the Nutrition type only needs a new entry here.
const MACRO_FIELDS: { key: keyof MacroTotals; label: string; unit: string }[] = [
  { key: "kcal", label: "Kalori", unit: "kcal" },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "fatG", label: "Yağ", unit: "g" },
  { key: "carbsG", label: "Karbonhidrat", unit: "g" },
  { key: "fiberG", label: "Lif", unit: "g" },
];

// Mobile-first bottom sheet (no hover involved) — this codebase has no
// existing Dialog/Sheet primitive to reuse (grepped for Dialog/Modal/Sheet
// across src/, no matches), so this is a minimal, single-purpose one built
// from the app's existing card/border/shadow tokens rather than a new
// generic modal system.
export function MealNutritionDetailSheet({ title, macros, items, catalog, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20"
      />
      <div className="relative z-10 max-h-[80vh] w-full max-w-[30rem] overflow-y-auto rounded-t-xl border-t border-border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-sm font-semibold">{title} · Besin değerleri</h2>
          <Button type="button" variant="quiet" size="icon" onClick={onClose} aria-label="Kapat">
            <X className="size-4" />
          </Button>
        </div>

        <ul className="divide-y divide-border/60">
          {MACRO_FIELDS.map(({ key, label, unit }) => (
            <li key={key} className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="ledger tabular-nums">
                {format(macros[key])} {unit}
              </span>
            </li>
          ))}
        </ul>

        {items.length > 0 && (
          <>
            <p className="ledger pb-1 pt-4 text-xs uppercase tracking-widest text-muted-foreground">
              Besinler
            </p>
            <ul className="divide-y divide-border/60">
              {items.map((item) => {
                const food: Nutrition | undefined = catalog.get(item.foodId);
                const itemMacros = food ? scaleNutrition(food, item.quantityG) : null;
                return (
                  <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                    <span>
                      {food?.name_tr ?? item.foodId} · {item.quantityG} g
                    </span>
                    <span className="ledger text-xs text-muted-foreground tabular-nums">
                      {itemMacros ? `${format(itemMacros.kcal)} kcal` : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run build`
Expected: succeeds.

---

### Task 7: Rewrite `MealPlanView`

**Files:**
- Modify: `src/components/MealPlanView.tsx` (full rewrite; same file, same
  exported component name and prop shape `{ householdId: string | null }`)

**Interfaces:**
- Consumes: `useMealPlan` (Task 4), `useFoodCatalog` (Task 3), `MEAL_SLOTS`/
  `MealItem` (Task 2), `MacroTotals` (Task 1), `MealFoodPicker`
  (Task 5), `MealNutritionDetailSheet` (Task 6), `format` from
  `NutritionTableCell.tsx`, `Nutrition`/`NutritionMap` from
  `src/lib/nutrition.ts`, `Button`/`Input` from `src/components/ui/*`.
- Produces: `MealPlanView({ householdId })` — same public shape `App.tsx`
  already calls at `src/App.tsx:125`, so no changes needed there.

- [ ] **Step 1: Replace the file contents**

```tsx
// src/components/MealPlanView.tsx
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { MEAL_SLOTS, type MealItem } from "@/lib/localMealPlan";
import type { MacroTotals } from "@/lib/mealNutrition";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import { format } from "@/components/NutritionTableCell";
import { MealFoodPicker } from "@/components/MealFoodPicker";
import { MealNutritionDetailSheet } from "@/components/MealNutritionDetailSheet";

type Props = {
  householdId: string | null;
};

export function MealPlanView({ householdId }: Props) {
  const { foods, catalogMap, status } = useFoodCatalog();
  const {
    dateLabel,
    goToPrevDay,
    goToNextDay,
    itemsForSlot,
    addItem,
    updateItemQuantity,
    removeItem,
    slotNutrition,
    dailyNutrition,
  } = useMealPlan(householdId, catalogMap);

  const totals = dailyNutrition();
  const hasTotals =
    totals.kcal > 0 || totals.proteinG > 0 || totals.fatG > 0 || totals.carbsG > 0;
  const [dailyDetailOpen, setDailyDetailOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <Button type="button" variant="quiet" size="icon" onClick={goToPrevDay} aria-label="Önceki gün">
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-lg font-semibold tracking-tight">{dateLabel}</span>
        <Button type="button" variant="quiet" size="icon" onClick={goToNextDay} aria-label="Sonraki gün">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {status === "error" && (
        <p className="px-1 pb-3 text-xs text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {MEAL_SLOTS.map(({ slot, label }) => (
          <MealSection
            key={slot}
            label={label}
            items={itemsForSlot(slot)}
            foods={foods}
            catalog={catalogMap}
            macros={slotNutrition(slot)}
            onAddItem={(foodId, quantityG) => addItem(slot, foodId, quantityG)}
            onUpdateQuantity={(itemId, quantityG) => updateItemQuantity(slot, itemId, quantityG)}
            onRemoveItem={(itemId) => removeItem(slot, itemId)}
          />
        ))}
      </div>

      {hasTotals && (
        <div className="mt-6 rounded-lg border border-border px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Günlük toplam
            </span>
            <div className="flex items-center gap-2">
              <MacroSummary macros={totals} />
              <button
                type="button"
                onClick={() => setDailyDetailOpen(true)}
                aria-label="Günlük besin detayı"
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <Info className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {dailyDetailOpen && (
        <MealNutritionDetailSheet
          title="Günlük toplam"
          macros={totals}
          items={MEAL_SLOTS.flatMap(({ slot }) => itemsForSlot(slot))}
          catalog={catalogMap}
          onClose={() => setDailyDetailOpen(false)}
        />
      )}
    </div>
  );
}

function MealSection({
  label,
  items,
  foods,
  catalog,
  macros,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
}: {
  label: string;
  items: MealItem[];
  foods: Nutrition[];
  catalog: NutritionMap;
  macros: MacroTotals;
  onAddItem: (foodId: string, quantityG: number) => void;
  onUpdateQuantity: (itemId: string, quantityG: number) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border p-3">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>

      {items.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">Henüz besin eklenmedi.</p>
      ) : (
        <ul className="mt-1">
          {items.map((item) => (
            <MealItemRow
              key={item.id}
              item={item}
              food={catalog.get(item.foodId)}
              onUpdateQuantity={(qty) => onUpdateQuantity(item.id, qty)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </ul>
      )}

      <MealFoodPicker foods={foods} onAdd={onAddItem} />

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <MacroSummary macros={macros} />
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          aria-label={`${label} besin detayı`}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <Info className="size-4" />
        </button>
      </div>

      {detailOpen && (
        <MealNutritionDetailSheet
          title={label}
          macros={macros}
          items={items}
          catalog={catalog}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}

function MealItemRow({
  item,
  food,
  onUpdateQuantity,
  onRemove,
}: {
  item: MealItem;
  food: Nutrition | undefined;
  onUpdateQuantity: (quantityG: number) => void;
  onRemove: () => void;
}) {
  // Local text state + commit-on-blur, same pattern the old manual
  // NutritionFields used — a directly-controlled numeric input would snap
  // back to the last valid value while the field is mid-edit (e.g. briefly
  // empty while retyping), which onBlur-commit avoids.
  const [text, setText] = useState(String(item.quantityG));

  useEffect(() => {
    setText(String(item.quantityG));
  }, [item.quantityG]);

  function commit() {
    const v = Number(text);
    if (Number.isFinite(v) && v > 0) {
      onUpdateQuantity(v);
    } else {
      setText(String(item.quantityG));
    }
  }

  return (
    <li className="flex items-center gap-2 border-b border-border py-2">
      <span className="flex-1 text-[0.975rem]">{food?.name_tr ?? item.foodId}</span>
      <Input
        type="number"
        inputMode="decimal"
        min="1"
        step="1"
        value={text}
        aria-label={`${food?.name_tr ?? item.foodId} miktarı (gram)`}
        onInput={(e: Event) => setText((e.target as HTMLInputElement).value)}
        onBlur={commit}
        className="ledger h-9 w-16 px-2 text-right tabular-nums"
      />
      <span className="text-xs text-muted-foreground">g</span>
      <button
        type="button"
        aria-label={`${food?.name_tr ?? item.foodId} kaldır`}
        onClick={onRemove}
        className="rounded p-1 text-muted-foreground hover:text-signal"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}

function MacroSummary({ macros }: { macros: MacroTotals }) {
  return (
    <span className="ledger tabular-nums text-sm">
      {Math.round(macros.kcal)} kcal · P {format(macros.proteinG)} · Y {format(macros.fatG)} · K{" "}
      {format(macros.carbsG)}
    </span>
  );
}
```

- [ ] **Step 2: Verify it typechecks clean**

Run: `npm run build`
Expected: succeeds with zero errors — this is the consumer that closes out
the type errors expected at the end of Task 4.

---

### Task 8: End-to-end manual verification

**Files:** none (verification only, per the "No test framework" global
constraint).

- [ ] **Step 1: Start the real local stack**

Run: `npm run netlify:dev`
Expected: serves Vite + `/api/*` on :8888 (plain `npm run dev` won't serve
`/api/nutrition`, so the food catalog would never load — this is why
netlify:dev is required for this check, per CLAUDE.md).

- [ ] **Step 2: Exercise the golden path in a browser**

Navigate to the "Yemek" (meal planner) section and confirm, in order:
1. Exactly four sections render: Kahvaltı, Öğle, Akşam, Ara öğün — one each,
   no way to add a second Ara öğün.
2. Each empty section shows "Henüz besin eklenmedi." rather than looking
   broken.
3. "Besin ekle" on Kahvaltı opens a search box; typing filters the list
   case-insensitively (e.g. "yum" should surface "yumurta" if present in
   `data/nutrition.json`).
4. Picking a food shows a quantity field defaulting to 100; changing it and
   clicking "Ekle" adds the row as "`<food>` `<qty>` g" and closes the
   picker.
5. The compact row under the section immediately shows non-zero
   `kcal · P · Y · K`, matching quantity/100 × the food's per-100 values.
6. Editing the quantity input on that row updates the compact summary
   immediately (no page reload, no network tab activity).
7. Clicking the ⓘ opens a bottom sheet from the bottom of the screen (not a
   hover tooltip) showing Kalori/Protein/Yağ/Karbonhidrat/Lif and the
   per-food breakdown; closing it makes no changes.
8. Removing the food (X) empties the section back to the empty state and
   its compact summary returns to zero.
9. Adding one item to each of the other three sections makes "Günlük
   toplam" appear at the bottom with the sum across all four sections; its
   own ⓘ opens a detail sheet listing every item across all meals.
10. Prev/next-day chevrons switch dates and each date keeps its own
    independent, empty-by-default plan.

- [ ] **Step 3: Confirm no persistence**

With the browser devtools Network tab open, repeat steps 4/6/8 above and
confirm zero requests to `/api/meal-entries` fire (there should be
`/api/nutrition` traffic only, from the catalog load and cache). Reload the
page and confirm the meal plan is gone (expected — local-only, in-memory
for this phase) while switching back to the "Besin" tab still shows the
full nutrition catalog unaffected.

- [ ] **Step 4: Confirm unrelated features are untouched**

Switch to the "Alışveriş" (shopping list) tabs and the "Besin" tab's
"Tümü"/"Listedeki ürünler" toggle; confirm both behave exactly as before
(no visual or functional change — this task didn't touch `lib/nutrition.ts`,
`NutritionView.tsx`, or the shopping-list components).

- [ ] **Step 5: Final typecheck**

Run: `npm run build`
Expected: succeeds with zero errors across the whole project (not just the
meal-planner files touched in this plan).

Do not run `git commit` — stop here per the "No auto-commit" global
constraint and report results to the user.
