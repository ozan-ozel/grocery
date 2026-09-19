# Batch Preparation ("Toplu Hazırlıklar") UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Haiku 4.5 — every task below carries its complete code, so no design
decisions are left to the implementer. If a step's code doesn't typecheck, fix the code to satisfy
`tsc`, don't redesign.

**Scope:** Frontend only. The API (`api/preparation-batches.ts`, `api/meal-entries.ts`), the
`preparation_batches` table, and the pure logic in `src/lib/preparationBatch.ts` are already built
and live-validated (DEC-069 is `SHIPPED`). This plan only puts a real UI in front of them.

**Goal:** Let a person cook once, record it as a batch, and spread its portions across meals on
any day — from the Yemek Planı screen — with the leftover grams always visible.

**Architecture:** The orphaned `BatchPlanner.tsx` (removed from Yemek Planı on 2026-09-12 as
clutter, never re-homed) is replaced by three focused pieces that use the app's standard bottom
sheet: a **management sheet** (list batches + create one), an **allocate sheet** (add batch food
into one meal slot of the day being viewed), and a small **"Partiden" button + origin chip** in the
existing meal cards. Allocation reuses `useMealPlan.addItem(..., batchId)` — already batch-aware and
optimistic — so a batch portion shows up in the day's macros instantly with no new persistence
path. Leftovers are derived (never stored) by one shared ledger hook.

**Tech Stack:** Preact (via `react` alias), TanStack Query (`@tanstack/preact-query`), Tailwind v4
tokens, existing `BottomSheet` / `SmoothPillTabs` / `Button` / `Input` / `MealFoodPicker`.

**Spec:** No separate spec. Derived from `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_IMPLEMENTATION_PLAN.md`
§13 (multi-day = shared `batch_id`, no new planning concept), §18 (UI surface inventory) and
`docs/mvp-scope/meal-construction-mvp.md`. Ground truth for the existing code:
`src/components/BatchPlanner.tsx` (being replaced), `src/hooks/useBatches.ts`,
`src/lib/preparationBatch.ts`, `src/hooks/useMealPlan.ts`, `src/components/MealPlanView.tsx`.

## Global Constraints

- **No test suite, no test files, no test framework — ever** (CLAUDE.md). Verify with
  `npm run build` (`tsc -b && vite build`) and by exercising the app.
- **Do not commit, merge or push.** Implement and verify, then stop; the user commits (CMP) after
  testing. You are already on branch `feature/batch-preparation-ui` — do not switch branches, do not
  create worktrees.
- `composition[].foodId` / `MealEntry.foodId` is `nutrition.name_tr`, **never** the opaque
  `Nutrition.food_id` UUID (`src/lib/preparationBatch.ts` header). Always look foods up with
  `catalog.get(foodId)`.
- Batches are **immutable**: no edit, no delete anywhere in this UI. A correction = a new batch.
- Hard-tier exclusions (allergy / unclear / unclassified / preference) must never be *offered*:
  batch creation reuses `scoreAllCombos` and `MealFoodPicker` (already filter them); the allocate
  sheet filters them itself (Task 4).
- Over-allocation is allowed and shown as a raw negative number in `text-signal` — the app's
  existing convention (`remainingComposition` never clamps). Do not block it.
- All user-visible copy is Turkish. Match the strings given in this plan exactly.
- Use only existing design tokens/classes (`bg-card`, `border-border`, `text-muted-foreground`,
  `text-signal`, `ledger`, `tabular-nums`, `bg-accent/50` …). No new colors, no new CSS.
- Bottom sheets are built on `src/components/ui/bottom-sheet.tsx` and mounted **only while open**
  (`{open && <Sheet … />}`), because its swipe hook binds on mount. Scrolling regions inside get
  `min-h-0 overflow-y-auto overscroll-contain` (see `RecipeSearchModal.tsx:120`).
- Buttons that mutate must be double-tap safe (a batch is immutable, so an accidental duplicate is
  permanent).
- `tsconfig` has `noUnusedLocals` + `noUnusedParameters`: leave no unused imports or params.

---

## File Structure

- Modify: `src/lib/preparationBatch.ts` — two tiny pure helpers (`batchDateLabel`, `hasRemaining`).
- Modify: `src/hooks/useBatches.ts` — add `useBatchLedger` (batches + remaining, one hook).
- Modify: `src/hooks/useMealPlan.ts` — refresh the ledger after a batch-linked entry is
  written/changed/removed on the server.
- Create: `src/components/BatchCreateForm.tsx` — create-a-batch form (from a meal, or by hand).
- Create: `src/components/BatchSheet.tsx` — "Toplu Hazırlıklar" management sheet.
- Create: `src/components/BatchAllocateSheet.tsx` — "Partiden ekle" sheet for one slot + day.
- Modify: `src/components/MealItemCard.tsx` — small origin chip ("Parti · 12 Eyl").
- Modify: `src/components/MealContainer.tsx` — optional "Partiden" third button + chip plumbing;
  export `MEAL_LABELS`.
- Modify: `src/components/MealPlanView.tsx` — mount everything.
- Delete: `src/components/BatchPlanner.tsx` and `useBatchAllocations` (Task 7, only after nothing
  imports them).
- Docs close-out (Task 8).

Data flow, so each task's interface makes sense:

```
MealPlanView ── useBatchLedger(householdId) ──► ledger: BatchWithRemaining[], createBatch
   │  "Toplu Hazırlıklar" row ─► BatchSheet(ledger, createBatch, foods, catalog, exclusions…)
   │                               └─ BatchCreateForm ─► createBatch(...) ─► back to list
   │  meal card "Partiden" ─► BatchAllocateSheet(ledger, slot label, date label)
   │                               └─ onAdd(batchId, foodId, grams) ─► useMealPlan.addItem(slot, foodId, grams, undefined, batchId)
   └─ meal cards show "Parti · <date>" chip via batchLabelFor(item)
useMealPlan.addItem/updateItemQuantity/removeItem ─► after server write, invalidate ["batchAllocations", householdId]
```

---

## Task 1: Ledger plumbing (pure helpers + hook + cache refresh)

**Files:**
- Modify: `src/lib/preparationBatch.ts` (append after `remainingComposition`, before the
  "Persistence" section comment at ~line 128)
- Modify: `src/hooks/useBatches.ts` (whole file replaced below)
- Modify: `src/hooks/useMealPlan.ts:143-186`

**Interfaces:**
- Produces (`preparationBatch.ts`):
  - `batchDateLabel(dateStr: string): string` — `"2026-09-12"` → `"12 Eyl"`; returns the input
    unchanged if it isn't a valid `YYYY-MM-DD`.
  - `hasRemaining(remaining: RemainingItem[]): boolean` — true if any food has `remainingG > 0`.
- Produces (`useBatches.ts`):
  - `type BatchWithRemaining = { batch: PreparationBatch; remaining: RemainingItem[] }`
  - `useBatchLedger(householdId: string | null): { ledger: BatchWithRemaining[]; isLoading: boolean; createBatch: (input: NewPreparationBatch) => Promise<PreparationBatch | null> }`
  - existing `useBatches` and `useBatchAllocations` stay exported until Task 7.
- Produces (`useMealPlan.ts`): behavior only — after any successful server write for an entry that
  has a `batchId`, the query prefix `["batchAllocations", householdId ?? "local"]` is invalidated.

- [ ] **Step 1: Add the two helpers to `src/lib/preparationBatch.ts`**

Insert directly after the closing brace of `remainingComposition` (the line `}` before the
`// -----` "Persistence" banner):

```ts
// Short Turkish label for a YYYY-MM-DD prepared date, e.g. "12 Eyl". Built
// from local date parts (not `new Date("YYYY-MM-DD")`, which parses as UTC and
// can land on the previous day in the evening for UTC+ timezones).
export function batchDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

// True while at least one food in the batch still has grams left to allocate.
export function hasRemaining(remaining: RemainingItem[]): boolean {
  return remaining.some((item) => item.remainingG > 0);
}
```

- [ ] **Step 2: Replace `src/hooks/useBatches.ts` entirely**

```ts
// DEC-069: household-scoped PreparationBatch list + creation, mirroring
// useMealPlan.ts's TanStack Query pattern. Kept separate from useMealPlan
// (a different query key, a different lifecycle — a batch list isn't pinned
// to one date) rather than folded into it.
import { useQueries, useQuery, useQueryClient } from "@tanstack/preact-query";
import {
  createPreparationBatch,
  fetchPreparationBatches,
  remainingComposition,
  type MealAllocation,
  type NewPreparationBatch,
  type PreparationBatch,
  type RemainingItem,
} from "@/lib/preparationBatch";
import { fetchMealEntriesForBatch } from "@/lib/mealPlan";

export function useBatches(householdId: string | null) {
  const queryKey = ["preparationBatches", householdId ?? "local"] as const;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => fetchPreparationBatches(householdId as string),
    enabled: !!householdId,
    staleTime: 30_000,
  });

  async function createBatch(input: NewPreparationBatch): Promise<PreparationBatch | null> {
    const created = await createPreparationBatch(input);
    if (created) {
      queryClient.setQueryData<PreparationBatch[]>(queryKey, (prev) => [created, ...(prev ?? [])]);
    }
    return created;
  }

  return {
    batches: query.data ?? [],
    isLoading: !!householdId && query.isLoading,
    createBatch,
  };
}

// Every allocation (meal_entries row with this batch_id) ever drawn from one
// batch, as the plain { foodId, quantityG } pairs remainingComposition needs.
async function fetchBatchAllocations(
  householdId: string,
  batchId: string
): Promise<MealAllocation[]> {
  const entries = await fetchMealEntriesForBatch(householdId, batchId);
  return entries.map((entry) => ({ foodId: entry.foodId, quantityG: entry.quantityG }));
}

// Allocations (meal_entries rows) drawn from one specific batch — a separate
// query key per batch id. Invalidated by useMealPlan whenever a batch-linked
// entry is created, edited or removed (see useMealPlan.ts).
export function useBatchAllocations(householdId: string | null, batchId: string) {
  const query = useQuery({
    queryKey: ["batchAllocations", householdId ?? "local", batchId] as const,
    queryFn: () => fetchBatchAllocations(householdId as string, batchId),
    enabled: !!householdId,
    staleTime: 15_000,
  });
  return { allocations: query.data ?? [], isLoading: !!householdId && query.isLoading };
}

export type BatchWithRemaining = {
  batch: PreparationBatch;
  remaining: RemainingItem[];
};

// The one place batches and their leftovers are combined: the newest-first
// batch list, each with its derived remaining grams. Uses the SAME query keys
// as useBatchAllocations, so one invalidation refreshes both. While a batch's
// allocations are still loading, its remaining shows the full composition
// (nothing allocated yet) rather than blocking the whole list.
export function useBatchLedger(householdId: string | null) {
  const { batches, isLoading: batchesLoading, createBatch } = useBatches(householdId);

  const allocationQueries = useQueries({
    queries: batches.map((batch) => ({
      queryKey: ["batchAllocations", householdId ?? "local", batch.id] as const,
      queryFn: () => fetchBatchAllocations(householdId as string, batch.id),
      enabled: !!householdId,
      staleTime: 15_000,
    })),
  });

  const ledger: BatchWithRemaining[] = batches.map((batch, index) => ({
    batch,
    remaining: remainingComposition(batch, allocationQueries[index]?.data ?? []),
  }));

  return { ledger, isLoading: batchesLoading, createBatch };
}
```

- [ ] **Step 3: Refresh the ledger from `useMealPlan.ts`**

In `src/hooks/useMealPlan.ts`, add this helper directly above `function addItem(` (line ~143):

```ts
  // DEC-069: an entry linked to a batch changes what's left of that batch.
  // Refetch the batch ledger only AFTER the server write has landed —
  // invalidating earlier would refetch the old allocations and leave the
  // "kaldı" grams stale.
  function refreshBatchLedger() {
    queryClient.invalidateQueries({
      queryKey: ["batchAllocations", householdId ?? "local"],
    });
  }

```

Then replace the three mutation functions' persistence blocks. `addItem`'s `if (householdId) {…}`
block becomes:

```ts
    if (householdId) {
      createMealEntry({ id, householdId, date, slot, foodId, quantityG, position, comboId, batchId }).then(
        (saved) => {
          if (!saved) console.warn("[mealPlan] entry created locally but failed to persist:", id);
          else if (batchId) refreshBatchLedger();
        }
      );
    }
```

`updateItemQuantity` becomes:

```ts
  function updateItemQuantity(slot: MealSlot, itemId: string, quantityG: number) {
    // Read before the optimistic write below, while the entry is still in cache.
    const batchId = (query.data ?? []).find((entry) => entry.id === itemId)?.batchId;
    setEntries((prev) =>
      prev.map((entry) =>
        entry.slot === slot && entry.id === itemId ? { ...entry, quantityG } : entry
      )
    );
    if (householdId) {
      updateMealEntry(itemId, { quantityG }).then((saved) => {
        if (!saved) console.warn("[mealPlan] quantity updated locally but failed to persist:", itemId);
        else if (batchId) refreshBatchLedger();
      });
    }
  }
```

`removeItem` becomes:

```ts
  function removeItem(slot: MealSlot, itemId: string) {
    const batchId = (query.data ?? []).find((entry) => entry.id === itemId)?.batchId;
    setEntries((prev) => prev.filter((entry) => !(entry.slot === slot && entry.id === itemId)));
    if (householdId) {
      deleteMealEntry(itemId).then((ok) => {
        if (!ok) console.warn("[mealPlan] entry removed locally but failed to delete remotely:", itemId);
        else if (batchId) refreshBatchLedger();
      });
    }
  }
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc -b`
Expected: no errors. (`useBatchLedger` is unused so far — exported symbols don't trip
`noUnusedLocals`.)

---

## Task 2: `BatchCreateForm` — create a batch

**Files:**
- Create: `src/components/BatchCreateForm.tsx`

**Interfaces:**
- Consumes: `normalizeComposition`, `isValidComposition`, `BatchCompositionItem`
  (`@/lib/preparationBatch`); `ALL_COMBOS`, `scaleComboItems` (`@/lib/combos`);
  `scoreAllCombos` (`@/lib/comboMatch`); `MealFoodPicker`; `SmoothPillTabs`.
- Produces: `BatchCreateForm(props)` where

```ts
type BatchCreateData = {
  preparedDate: string;          // YYYY-MM-DD
  storageNote?: string;
  sourceComboId?: string;
  composition: BatchCompositionItem[];
};
type Props = {
  foods: Nutrition[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  defaultDate: string;           // YYYY-MM-DD — the day currently shown in Yemek Planı
  onSubmit: (data: BatchCreateData) => Promise<boolean>; // true = saved
  onCancel: () => void;
};
```

Design notes (why it differs from the old inline form): the composition preview is always visible
(so "Kat sayısı" is never a blind number), submit is double-tap-safe, a failed save shows an error
instead of silently closing, and the mode switch uses the standard Smooth Pill tabs.

- [ ] **Step 1: Create the file**

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmoothPillTabs } from "@/components/ui/smooth-pill";
import { MealFoodPicker } from "@/components/MealFoodPicker";
import { ALL_COMBOS, scaleComboItems } from "@/lib/combos";
import { scoreAllCombos } from "@/lib/comboMatch";
import { scaleNutrition, sumMacros } from "@/lib/mealNutrition";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import {
  normalizeComposition,
  isValidComposition,
  type BatchCompositionItem,
} from "@/lib/preparationBatch";

export type BatchCreateData = {
  preparedDate: string;
  storageNote?: string;
  sourceComboId?: string;
  composition: BatchCompositionItem[];
};

type Props = {
  foods: Nutrition[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  defaultDate: string;
  onSubmit: (data: BatchCreateData) => Promise<boolean>;
  onCancel: () => void;
};

type Mode = "combo" | "manual";

// Same sane range the Yemekler picker's custom multiplier uses — a typo can't
// create a 50 kg batch.
const MULTIPLIER_MIN = 0.5;
const MULTIPLIER_MAX = 20;

export function BatchCreateForm({
  foods,
  catalog,
  exclusions,
  allergenExclusions,
  defaultDate,
  onSubmit,
  onCancel,
}: Props) {
  const [mode, setMode] = useState<Mode>("combo");
  const [preparedDate, setPreparedDate] = useState(defaultDate);
  const [storageNote, setStorageNote] = useState("");
  const [multiplierText, setMultiplierText] = useState("4");
  // Hard-excluded combos are already dropped by scoreAllCombos — a batch can
  // never be created from a combo containing a hard-excluded food.
  const allowedCombos = scoreAllCombos(ALL_COMBOS, exclusions, allergenExclusions, catalog);
  const [comboId, setComboId] = useState(allowedCombos[0]?.id ?? "");
  const [manualItems, setManualItems] = useState<BatchCompositionItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  const multiplier = Number(multiplierText);
  const multiplierValid =
    Number.isFinite(multiplier) && multiplier >= MULTIPLIER_MIN && multiplier <= MULTIPLIER_MAX;

  function buildComposition(): BatchCompositionItem[] {
    if (mode === "manual") return normalizeComposition(manualItems);
    const combo = allowedCombos.find((c) => c.id === comboId);
    if (!combo || !multiplierValid) return [];
    return normalizeComposition(
      scaleComboItems(combo.items, multiplier).map((item) => ({
        foodId: item.foodId,
        quantityG: item.grams,
      }))
    );
  }

  const composition = buildComposition();
  const totals = sumMacros(
    composition.flatMap((item) => {
      const nutrition = catalog.get(item.foodId);
      return nutrition ? [scaleNutrition(nutrition, item.quantityG)] : [];
    })
  );
  const canSubmit = isValidComposition(composition) && !!preparedDate && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setFailed(false);
    try {
      const saved = await onSubmit({
        preparedDate,
        storageNote: storageNote.trim() ? storageNote.trim() : undefined,
        sourceComboId: mode === "combo" ? comboId : undefined,
        composition,
      });
      // On success the parent swaps this form out, so there is nothing to
      // reset here; only a failure needs to stay visible.
      if (!saved) setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <SmoothPillTabs<Mode>
        value={mode}
        onChange={setMode}
        items={[
          { value: "combo", label: "Yemekten" },
          { value: "manual", label: "Elle seç" },
        ]}
      />

      {mode === "combo" ? (
        <div className="grid grid-cols-[1fr_6rem] gap-3">
          <label className="text-xs text-muted-foreground">
            Yemek
            <select
              value={comboId}
              onChange={(event) => setComboId((event.target as HTMLSelectElement).value)}
              className="mt-1 h-11 w-full rounded-md border border-input bg-card px-2 text-base text-foreground">
              {allowedCombos.length === 0 && <option value="">Uygun yemek yok</option>}
              {allowedCombos.map((combo) => (
                <option key={combo.id} value={combo.id}>
                  {combo.nameTr}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Kaç porsiyon
            <Input
              type="number"
              inputMode="decimal"
              min={MULTIPLIER_MIN}
              max={MULTIPLIER_MAX}
              step="0.5"
              value={multiplierText}
              onInput={(event: Event) =>
                setMultiplierText((event.target as HTMLInputElement).value)
              }
              className="mt-1 ledger text-right tabular-nums"
            />
          </label>
        </div>
      ) : (
        <div>
          {manualItems.length > 0 && (
            <ul className="space-y-1">
              {manualItems.map((item, index) => (
                <li
                  key={`${item.foodId}-${index}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>
                    {item.foodId} — {item.quantityG}g
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setManualItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-xs text-muted-foreground hover:text-foreground active:text-foreground">
                    Kaldır
                  </button>
                </li>
              ))}
            </ul>
          )}
          <MealFoodPicker
            foods={foods}
            exclusions={exclusions}
            allergenExclusions={allergenExclusions}
            onAdd={(foodId, quantityG) =>
              setManualItems((prev) => [...prev, { foodId, quantityG }])
            }
          />
        </div>
      )}

      {mode === "combo" && !multiplierValid && (
        <p className="text-xs text-signal">
          Porsiyon sayısı {MULTIPLIER_MIN} ile {MULTIPLIER_MAX} arasında olmalı.
        </p>
      )}

      {composition.length > 0 && (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Parti içeriği
          </p>
          <ul className="mt-2 space-y-1">
            {composition.map((item) => (
              <li key={item.foodId} className="flex items-center justify-between text-sm">
                <span>{item.foodId}</span>
                <span className="ledger tabular-nums text-xs text-muted-foreground">
                  {Math.round(item.quantityG)}g
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
            Toplam {Math.round(totals.kcal)} kcal · P: {Math.round(totals.proteinG)}g · K:{" "}
            {Math.round(totals.carbsG)}g · Y: {Math.round(totals.fatG)}g
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-muted-foreground">
          Hazırlanma tarihi
          <Input
            type="date"
            value={preparedDate}
            onInput={(event: Event) =>
              setPreparedDate((event.target as HTMLInputElement).value)
            }
            className="mt-1"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Saklama notu (isteğe bağlı)
          <Input
            type="text"
            value={storageNote}
            onInput={(event: Event) =>
              setStorageNote((event.target as HTMLInputElement).value)
            }
            placeholder="Örn. Buzdolabında 3 gün"
            className="mt-1"
          />
        </label>
      </div>

      {failed && (
        <p className="text-xs text-signal">Parti kaydedilemedi. Bağlantını kontrol edip tekrar dene.</p>
      )}

      <div className="flex gap-2">
        <Button type="button" className="flex-1" disabled={!canSubmit} onClick={submit}>
          {submitting ? "Kaydediliyor…" : "Partiyi oluştur"}
        </Button>
        <Button type="button" variant="quiet" onClick={onCancel} disabled={submitting}>
          Vazgeç
        </Button>
      </div>
    </div>
  );
}
```

Notes for the implementer: manual-mode list rows show `item.foodId` directly because `foodId` *is*
the Turkish food name (`name_tr`) — that is intentional, not a bug. `MealFoodPicker`'s "Besin ekle"
button renders its own inline picker; do not wrap it.

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors. If `SmoothPillTabs<Mode>` complains about the generic call syntax in `.tsx`,
drop the explicit `<Mode>` and cast instead: `onChange={(value) => setMode(value as Mode)}`.

---

## Task 3: `BatchSheet` — the "Toplu Hazırlıklar" management sheet

**Files:**
- Create: `src/components/BatchSheet.tsx`

**Interfaces:**
- Consumes: `BottomSheet` (`title`, `titleId`, `onClose`, `children`); `BatchCreateForm` +
  `BatchCreateData` (Task 2); `BatchWithRemaining` (Task 1); `batchDateLabel`, `hasRemaining`
  (Task 1); `COMBO_BY_ID` (`@/lib/combos`); `uid` (`@/lib/store`).
- Produces:

```ts
type Props = {
  householdId: string;                     // non-null: the entry row only renders with a household
  ledger: BatchWithRemaining[];
  catalog: NutritionMap;
  foods: Nutrition[];
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  defaultDate: string;                     // YYYY-MM-DD
  createBatch: (input: NewPreparationBatch) => Promise<PreparationBatch | null>;
  onClose: () => void;
};
```

- [ ] **Step 1: Create the file**

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BatchCreateForm, type BatchCreateData } from "@/components/BatchCreateForm";
import { COMBO_BY_ID } from "@/lib/combos";
import { uid } from "@/lib/store";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import {
  batchDateLabel,
  hasRemaining,
  type NewPreparationBatch,
  type PreparationBatch,
} from "@/lib/preparationBatch";
import type { BatchWithRemaining } from "@/hooks/useBatches";

type Props = {
  householdId: string;
  ledger: BatchWithRemaining[];
  catalog: NutritionMap;
  foods: Nutrition[];
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  defaultDate: string;
  createBatch: (input: NewPreparationBatch) => Promise<PreparationBatch | null>;
  onClose: () => void;
};

export function BatchSheet({
  householdId,
  ledger,
  catalog,
  foods,
  exclusions,
  allergenExclusions,
  defaultDate,
  createBatch,
  onClose,
}: Props) {
  const [creating, setCreating] = useState(false);

  async function handleSubmit(data: BatchCreateData): Promise<boolean> {
    const created = await createBatch({
      id: uid(),
      householdId,
      preparedDate: data.preparedDate,
      storageNote: data.storageNote,
      sourceComboId: data.sourceComboId,
      composition: data.composition,
    });
    if (created) setCreating(false);
    return created !== null;
  }

  return (
    <BottomSheet
      title={creating ? "Yeni parti" : "Toplu Hazırlıklar"}
      titleId="batch-sheet-title"
      onClose={onClose}>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-2">
        {creating ? (
          <BatchCreateForm
            foods={foods}
            catalog={catalog}
            exclusions={exclusions}
            allergenExclusions={allergenExclusions}
            defaultDate={defaultDate}
            onSubmit={handleSubmit}
            onCancel={() => setCreating(false)}
          />
        ) : (
          <>
            <Button type="button" className="w-full" onClick={() => setCreating(true)}>
              Yeni parti
            </Button>

            {ledger.length === 0 && (
              <p className="py-2 text-sm text-muted-foreground">
                Henüz toplu hazırlık yok. Bir kere pişirip birkaç güne yaydığın yemekleri
                buraya ekle; her öğüne ne kadarını yediğini sonra Yemek Planı'ndaki
                “Partiden” düğmesiyle eklersin.
              </p>
            )}

            <ul className="space-y-2">
              {ledger.map(({ batch, remaining }) => {
                const title = batch.sourceComboId
                  ? (COMBO_BY_ID.get(batch.sourceComboId)?.nameTr ?? "Parti")
                  : "Elle hazırlanan parti";
                const depleted = !hasRemaining(remaining);
                return (
                  <li
                    key={batch.id}
                    className={`rounded-lg border border-border bg-background p-3 ${depleted ? "opacity-60" : ""}`}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-foreground">{title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {depleted ? "Tükendi · " : ""}
                        {batchDateLabel(batch.preparedDate)}
                      </span>
                    </div>
                    {batch.storageNote && (
                      <p className="mt-1 text-xs text-muted-foreground">{batch.storageNote}</p>
                    )}
                    <ul className="mt-2 space-y-1">
                      {remaining.map((item) => (
                        <li
                          key={item.foodId}
                          className="flex items-center justify-between text-sm">
                          <span>{catalog.get(item.foodId)?.name_tr ?? item.foodId}</span>
                          <span className="ledger tabular-nums text-xs text-muted-foreground">
                            {Math.round(item.quantityG)}g hazırlandı ·{" "}
                            <span className={item.remainingG < 0 ? "text-signal" : ""}>
                              {Math.round(item.remainingG)}g kaldı
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors.

---

## Task 4: `BatchAllocateSheet` — "Partiden ekle" for one meal slot

**Files:**
- Create: `src/components/BatchAllocateSheet.tsx`

**Interfaces:**
- Consumes: `BottomSheet`; `BatchWithRemaining`; `batchDateLabel`, `hasRemaining`;
  `COMBO_BY_ID`; `hasHardExclusion`, `hasHardAllergenClassExclusion`,
  `FoodExclusion`, `AllergenClassExclusion` (`@/lib/foodExclusions`).
- Produces:

```ts
type Props = {
  subtitle: string;                        // e.g. "12 Eylül Cumartesi · İlk Öğün" — passed in by MealPlanView
  ledger: BatchWithRemaining[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  onAdd: (batchId: string, foodId: string, quantityG: number) => void; // synchronous, optimistic
  onClose: () => void;
};
```

Behavior spec:
- Lists only batches that still have grams left, and within a batch only foods with
  `remainingG > 0` that are not hard-excluded for this person now.
- Each food row: name, "N g kaldı", a gram input prefilled with the rounded remaining, chips
  "½" and "Tümü", and an "Ekle" button.
- The sheet **stays open** after adding (rice + chicken are usually added back to back). The row
  shows "Eklendi ✓" for ~1.5 s and can't be double-tapped meanwhile.
- The prefilled gram value resets to the new "Tümü" whenever that row's `remainingG` changes
  (i.e. after the ledger refreshes following an add).
- Asking for more than remains is allowed; the input shows a `text-signal` hint.

- [ ] **Step 1: Create the file**

```tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { COMBO_BY_ID } from "@/lib/combos";
import type { NutritionMap } from "@/lib/nutrition";
import {
  hasHardExclusion,
  hasHardAllergenClassExclusion,
  type FoodExclusion,
  type AllergenClassExclusion,
} from "@/lib/foodExclusions";
import { batchDateLabel, hasRemaining } from "@/lib/preparationBatch";
import type { BatchWithRemaining } from "@/hooks/useBatches";

type Props = {
  subtitle: string;
  ledger: BatchWithRemaining[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  onAdd: (batchId: string, foodId: string, quantityG: number) => void;
  onClose: () => void;
};

export function BatchAllocateSheet({
  subtitle,
  ledger,
  catalog,
  exclusions,
  allergenExclusions,
  onAdd,
  onClose,
}: Props) {
  // A food the person can no longer eat (hard-tier exclusion added after the
  // batch was cooked) is not offered — same rule as every other logging
  // surface. Foods missing from the catalog are kept so nothing silently
  // vanishes; they fall through the exclusion check because it needs the row.
  function isOffered(foodId: string): boolean {
    const food = catalog.get(foodId);
    if (!food) return true;
    return !hasHardExclusion(exclusions, food) && !hasHardAllergenClassExclusion(allergenExclusions, food);
  }

  const offered = ledger
    .filter(({ remaining }) => hasRemaining(remaining))
    .map(({ batch, remaining }) => ({
      batch,
      rows: remaining.filter((item) => item.remainingG > 0 && isOffered(item.foodId)),
    }))
    .filter(({ rows }) => rows.length > 0);

  return (
    <BottomSheet title="Partiden ekle" titleId="batch-allocate-sheet-title" onClose={onClose}>
      <p className="-mt-2 mb-3 shrink-0 text-xs text-muted-foreground">{subtitle}</p>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-2">
        {offered.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground">
            Eklenecek kalan parti yok. Yemek Planı'ndaki “Toplu Hazırlıklar” satırından yeni
            bir parti oluşturabilirsin.
          </p>
        )}
        {offered.map(({ batch, rows }) => {
          const title = batch.sourceComboId
            ? (COMBO_BY_ID.get(batch.sourceComboId)?.nameTr ?? "Parti")
            : "Elle hazırlanan parti";
          return (
            <section key={batch.id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-foreground">{title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {batchDateLabel(batch.preparedDate)}
                </span>
              </div>
              {batch.storageNote && (
                <p className="mt-1 text-xs text-muted-foreground">{batch.storageNote}</p>
              )}
              <ul className="mt-2 divide-y divide-border">
                {rows.map((item) => (
                  <AllocationRow
                    key={item.foodId}
                    name={catalog.get(item.foodId)?.name_tr ?? item.foodId}
                    remainingG={item.remainingG}
                    onAdd={(quantityG) => onAdd(batch.id, item.foodId, quantityG)}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function AllocationRow({
  name,
  remainingG,
  onAdd,
}: {
  name: string;
  remainingG: number;
  onAdd: (quantityG: number) => void;
}) {
  const full = Math.max(1, Math.round(remainingG));
  const [gramsText, setGramsText] = useState(String(full));
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  // After an add the ledger refetches and `remainingG` shrinks — snap the
  // prefill to the new "Tümü" so the next tap is sensible, and any over-
  // allocation hint disappears on its own.
  useEffect(() => {
    setGramsText(String(full));
  }, [full]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const grams = Number(gramsText);
  const valid = Number.isFinite(grams) && grams > 0;
  const over = valid && grams > remainingG;

  function add() {
    if (!valid || justAdded) return;
    onAdd(grams);
    setJustAdded(true);
    timerRef.current = window.setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <li className="space-y-2 py-2 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-foreground">{name}</span>
        <span className="ledger tabular-nums text-xs text-muted-foreground">
          {Math.round(remainingG)}g kaldı
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          value={gramsText}
          aria-label={`${name} miktarı (gram)`}
          onInput={(event: Event) => setGramsText((event.target as HTMLInputElement).value)}
          className="ledger h-9 w-20 px-2 text-right tabular-nums"
        />
        <span className="text-xs text-muted-foreground">g</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setGramsText(String(Math.max(1, Math.round(remainingG / 2))))}>
          ½
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setGramsText(String(full))}>
          Tümü
        </Button>
        <Button
          type="button"
          size="sm"
          className="ml-auto"
          disabled={!valid || justAdded}
          onClick={add}>
          {justAdded ? "Eklendi ✓" : "Ekle"}
        </Button>
      </div>
      {over && (
        <p className="text-xs text-signal">Partide kalandan fazla ({Math.round(remainingG)}g).</p>
      )}
    </li>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors.

---

## Task 5: Origin chip + "Partiden" button in the meal cards

**Files:**
- Modify: `src/components/MealItemCard.tsx:7-23` (props) and `:103-105` (quantity line)
- Modify: `src/components/MealContainer.tsx`

**Interfaces:**
- Produces (`MealItemCard`): new optional prop `batchLabel?: string` — when set, a small chip is
  rendered next to the gram count (non-editing state only).
- Produces (`MealContainer`): `export const MEAL_LABELS` (was file-private) and two new optional
  props: `onSelectBatch?: () => void` (when provided, a third "Partiden" button appears and the
  button grid becomes 3 columns) and `batchLabelFor?: (item: MealItem) => string | undefined`.

- [ ] **Step 1: `MealItemCard` — add the prop**

In the `Props` type add, after `onToggleShoppingList: () => void;`:

```ts
  // DEC-069: e.g. "Parti · 12 Eyl" when this entry was drawn from a batch.
  batchLabel?: string;
```

In the component's destructured props add `batchLabel,` after `onToggleShoppingList,`.

Replace the non-editing quantity paragraph (currently
`<p className="mt-0.5 text-xs text-muted-foreground">{item.quantityG}g</p>`) with:

```tsx
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{item.quantityG}g</span>
                {batchLabel && (
                  <span className="rounded-full bg-accent/50 px-2 py-0.5 text-[10px] font-medium text-foreground">
                    {batchLabel}
                  </span>
                )}
              </p>
```

- [ ] **Step 2: `MealContainer` — export labels, add prop + button + chip plumbing**

Change `const MEAL_LABELS` to `export const MEAL_LABELS`.

Add to `Props` (after `onToggleShoppingList`):

```ts
  // DEC-069: shown only when there is batch food left to add.
  onSelectBatch?: () => void;
  batchLabelFor?: (item: MealItem) => string | undefined;
```

Add both to the destructured parameters.

Replace the button grid opening `<div className="grid grid-cols-2 gap-2">` with:

```tsx
      <div className={`grid gap-2 ${onSelectBatch ? "grid-cols-3" : "grid-cols-2"}`}>
```

After the existing "Yemekler" `</button>` (still inside that grid div), add:

```tsx
        {onSelectBatch && (
          <button
            type="button"
            onClick={onSelectBatch}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary active:border-primary hover:text-primary active:text-primary">
            <span aria-hidden="true">+</span>
            Partiden
          </button>
        )}
```

In the `<MealItemCard … />` element add one prop: `batchLabel={batchLabelFor?.(item)}`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b`
Expected: no errors.

---

## Task 6: Wire it into `MealPlanView`

**Files:**
- Modify: `src/components/MealPlanView.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces: the finished feature.

- [ ] **Step 1: Imports**

The lucide import (`ChevronLeft, ChevronRight`) already exists and is enough — leave it. Add:

```ts
import { useBatchLedger } from "@/hooks/useBatches";
import { BatchSheet } from "@/components/BatchSheet";
import { BatchAllocateSheet } from "@/components/BatchAllocateSheet";
import { MealContainer, MEAL_LABELS } from "@/components/MealContainer";
import { batchDateLabel, hasRemaining } from "@/lib/preparationBatch";
```

and **remove** the old `import { MealContainer } from "@/components/MealContainer";` line so it isn't
imported twice.

- [ ] **Step 2: State and derived values**

Directly after the existing `const [shoppingConfirm, setShoppingConfirm] = useState<…>(null);`
block, add:

```ts
  // DEC-069 batch preparation. One ledger for the whole screen; the two
  // sheets and the origin chips below are all presentation over it.
  const { ledger, createBatch } = useBatchLedger(householdId);
  const [batchSheetOpen, setBatchSheetOpen] = useState(false);
  const [allocateSlot, setAllocateSlot] = useState<MealSlot | null>(null);
  const activeBatchCount = ledger.filter(({ remaining }) => hasRemaining(remaining)).length;
  const batchById = new Map(ledger.map(({ batch }) => [batch.id, batch]));

  function batchLabelFor(item: MealItem): string | undefined {
    if (!item.batchId) return undefined;
    const batch = batchById.get(item.batchId);
    return batch ? `Parti · ${batchDateLabel(batch.preparedDate)}` : "Parti";
  }

  function handleBatchAllocate(batchId: string, foodId: string, quantityG: number) {
    if (!allocateSlot) return;
    addItem(allocateSlot, foodId, quantityG, undefined, batchId);
  }
```

- [ ] **Step 3: Pass the new props to each `MealContainer`**

In the `MEAL_SLOTS.map` render, after `onToggleShoppingList={requestShoppingToggle}` add:

```tsx
                onSelectBatch={
                  activeBatchCount > 0 ? () => setAllocateSlot(slot) : undefined
                }
                batchLabelFor={batchLabelFor}
```

- [ ] **Step 4: The "Toplu Hazırlıklar" entry row**

Directly after the closing `</div>` of the `<div className="space-y-3">` meal-containers block
(and before the `{(visibleEveningSuggestions.length > 0 || …` block), add:

```tsx
          {householdId && (
            <button
              type="button"
              onClick={() => setBatchSheetOpen(true)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary active:border-primary">
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  Toplu Hazırlıklar
                </span>
                <span className="block text-xs text-muted-foreground">
                  {ledger.length === 0
                    ? "Bir kere pişir, birkaç güne yay"
                    : activeBatchCount > 0
                      ? `${activeBatchCount} aktif parti`
                      : "Tüm partiler tükendi"}
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )}
```

- [ ] **Step 5: Mount the sheets**

Directly after the `{shoppingConfirm && ( … )}` block, add:

```tsx
      {batchSheetOpen && householdId && (
        <BatchSheet
          householdId={householdId}
          ledger={ledger}
          catalog={catalogMap}
          foods={foods}
          exclusions={personalizationProfile.foodExclusions}
          allergenExclusions={personalizationProfile.allergenExclusions}
          defaultDate={date}
          createBatch={createBatch}
          onClose={() => setBatchSheetOpen(false)}
        />
      )}

      {allocateSlot && (
        <BatchAllocateSheet
          subtitle={`${dateLabel} · ${MEAL_LABELS[getMealType(allocateSlot)].tr}`}
          ledger={ledger}
          catalog={catalogMap}
          exclusions={personalizationProfile.foodExclusions}
          allergenExclusions={personalizationProfile.allergenExclusions}
          onAdd={handleBatchAllocate}
          onClose={() => setAllocateSlot(null)}
        />
      )}
```

(`getMealType` is the existing function at the bottom of the file — reuse it, don't redefine.)

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: `tsc -b` clean, Vite build succeeds.

---

## Task 7: Remove the orphan, then verify in the real app

**Files:**
- Delete: `src/components/BatchPlanner.tsx`
- Modify: `src/hooks/useBatches.ts` (remove `useBatchAllocations`)

- [ ] **Step 1: Confirm nothing else imports the old pieces**

Run (Grep tool, not shell grep): pattern `BatchPlanner|useBatchAllocations|defaultBatchDate` in
`src/`. Expected: matches only in `BatchPlanner.tsx` itself and the definition in `useBatches.ts`
(plus comments in `docs/`). If anything else imports them, stop and report — don't delete.

- [ ] **Step 2: Delete and clean up**

Delete `src/components/BatchPlanner.tsx`. In `src/hooks/useBatches.ts` delete the whole
`useBatchAllocations` function **and** the comment block directly above it (starting "Allocations
(meal_entries rows) drawn from one specific batch"); keep `fetchBatchAllocations` (the ledger uses
it). Leave comments in other files that merely mention "the batch planner" (e.g.
`src/lib/combos.ts`) as they are.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: clean. (`noUnusedLocals` will flag any leftover import.)

- [ ] **Step 4: Exercise the feature (per CLAUDE.md's Playwright ground rule)**

Use `http://localhost:3000` (`npm run vercel:dev`). If `:3000` already answers it is the
developer's own server — reuse it; never start a second one or kill by port. Sign in only via the
`agent-login` mint/redeem flow. Leave the test account as found: delete any batch-linked meal
entries you add (batches themselves can't be deleted — say so in your report). If Playwright is
unavailable, stop after Step 3 and hand the checklist below to the user instead of claiming it
passed.

Checklist (Yemek Planı tab, phone-width ≈ 390 px viewport, then desktop):

1. "Toplu Hazırlıklar" row appears under the meal cards; with no batches it reads "Bir kere pişir,
   birkaç güne yay" and **no meal card has a "Partiden" button** (two-column grid unchanged).
2. Open the row → sheet with "Yeni parti". Create from a meal at **4 porsiyon**: composition preview
   shows scaled grams + a kcal/P/K/Y total; "Partiyi oluştur" is disabled until valid; tapping it
   returns to the list showing the new batch with every food "Ng hazırlandı · Ng kaldı".
3. Create a second batch with **Elle seç** (add two foods via "Besin ekle"), a storage note, and a
   different prepared date. It lists as "Elle hazırlanan parti" with the note.
4. Every meal card now shows a third **"Partiden"** button. Tap it on "İlk Öğün": the subtitle reads
   `<date label> · İlk Öğün`; foods show "kaldı" grams; tap "½" then "Ekle" on one food.
5. The sheet stays open, the row shows "Eklendi ✓" for ~1.5 s, and can't be double-added. Close
   the sheet: the meal card shows that food with a **"Parti · <date>"** chip and the day's macro
   card totals include it.
6. Reopen "Toplu Hazırlıklar": that food's "kaldı" dropped by exactly the added grams (the ledger
   refreshed after the server write). Edit that entry's grams via the pencil → "kaldı" changes
   accordingly. Remove the entry → "kaldı" returns to the prepared amount.
7. Navigate to another day with the chevrons; "Partiden" still offers the same leftovers; adding
   there lands on that day only.
8. Over-allocation: type a gram value larger than "kaldı" → red hint under the row; adding is
   still allowed and the ledger later shows a negative "kaldı" in red.
9. Swipe-down dismisses both sheets; with the soft keyboard open (manual mode date/note fields) the
   sheet's list shrinks, not the header.
10. Dark theme: both sheets and the chip stay legible (they only use existing tokens).

Report each item's outcome plainly; note any that couldn't be exercised.

---

## Task 8: Docs close-out (CLAUDE.md trio rule — one unit of work)

**Files:**
- Modify: `docs/mvp-scope/meal-construction-mvp.md` (add an "Update" paragraph under the table)
- Modify: `docs/roadmap_v2.md` (the "Meal Construction/Prep" section, ~line 60-66)
- Modify: `nutrition-curriculum/DEC_REGISTER.md` (the `DEC-069` row's note cell)
- Modify: `docs/mvp-scope/README.md` (status text of the `meal-construction-mvp.md` row)
- Modify: `docs/superpowers/plans/README.md` (this plan's row → `SHIPPED`)
- Modify: `docs/session-checkpoints/2026-09-19-02-batch-preparation-ui.md` and
  `docs/SESSION_FOLLOWUP.md` (already created on the branch — update "Next Steps" / status)

- [ ] **Step 1: `docs/mvp-scope/meal-construction-mvp.md`**

Directly after the "**Update 2026-09-19 — portion tiers shipped.**" paragraph add:

```md
**Update 2026-09-19 — batch preparation UI re-surfaced.** DEC-069 was already `SHIPPED` in the
backend, but its only UI (`BatchPlanner.tsx`) had been taken off Yemek Planı on 2026-09-12 and left
orphaned, so batches were unreachable in the app. Yemek Planı now has a "Toplu Hazırlıklar" sheet
(create a batch from a meal at N portions, or by hand; see prepared / remaining grams per food) and
a per-meal "Partiden" button that adds a batch food into that day's slot at a chosen gram amount,
with a "Parti · <date>" chip on the resulting entry. Leftovers stay derived, never stored; batches
stay immutable (no edit/delete). Plan:
`docs/superpowers/plans/2026-09-19-batch-preparation-ui.md`. Still open: batch ingredients are not
part of the shopping consolidation (DEC-071) — the day's "Bu günü alışveriş listesine ekle" adds
allocated foods like any other entry.
```

- [ ] **Step 2: `docs/roadmap_v2.md`** — in the Meal Construction/Prep section append one line
after the first item's line:

```
	Batch cooking / leftovers (DEC-069): backend shipped earlier; Yemek Planı UI ("Toplu Hazırlıklar" sheet + per-meal "Partiden" allocation) shipped 2026-09-19, see docs/mvp-scope/meal-construction-mvp.md
```

- [ ] **Step 3: `nutrition-curriculum/DEC_REGISTER.md`** — in the `DEC-069` row, change the last
cell `Fully implemented, live-validated` to
`Fully implemented, live-validated; UI re-surfaced in Yemek Planı 2026-09-19 (see docs/mvp-scope/meal-construction-mvp.md)`.

- [ ] **Step 4: `docs/mvp-scope/README.md`** — in the `meal-construction-mvp.md` row, extend the
status text: `… portion tiers on the Yemekler picker added 2026-09-19; batch-preparation UI re-surfaced 2026-09-19`.
Status word stays `DONE`.

- [ ] **Step 5: `docs/superpowers/plans/README.md`** — flip this plan's row (already added as
`NOT_STARTED` when the plan was written) to:

```
| [2026-09-19-batch-preparation-ui.md](2026-09-19-batch-preparation-ui.md) | 2026-09-19 | `SHIPPED` | `BatchSheet.tsx` / `BatchAllocateSheet.tsx` mounted in `MealPlanView.tsx`; `BatchPlanner.tsx` removed |
```

- [ ] **Step 6: checkpoint + follow-up** — in
`docs/session-checkpoints/2026-09-19-02-batch-preparation-ui.md` set "Status" to implemented and
list which checklist items (Task 7 Step 4) were actually exercised vs. left for the user. In
`docs/SESSION_FOLLOWUP.md` update the checkpoint link's one-line description the same way. Bump its
`_Last updated:_` date if needed.

- [ ] **Step 7: Final report to the user** must state the close-out checklist outcome explicitly
(all three items apply here: trio updated, plans index flipped, session checkpoint written) and
that nothing was committed — the user runs CMP.

---

## Self-Review (done at plan-writing time)

- **Spec coverage** (DEC-069 plan §18 inventory): create batch from combo ✔ (Task 2) / manually ✔
  (Task 2); view batch composition + prepared date + storage note ✔ (Task 3); allocate batch food
  to meals, writing `batchId` ✔ (Tasks 4, 6); remaining quantities ✔ (Tasks 1, 3, 4); multi-day ✔
  via navigating days + shared `batch_id`, no new concept (Task 6, checklist 7); storage note
  ✔ shown/entered (Tasks 2–4; the DEC-069 §21 "storage-note depth for v1" decision is treated as
  "ship free text", which is what the already-built column and old form did — flag if the product
  owner disagrees); "from batch prepared on `<date>`" rendering ✔ (chip, Task 5).
- **Explicitly not built:** batch edit/delete (immutability), batch → shopping consolidation
  (DEC-071, orthogonal), per-member attribution, a dedicated multi-day/week screen, pantry/inventory.
- **Placeholder scan:** none; every code step carries full code.
- **Type consistency:** `BatchWithRemaining` (Task 1) is the type used in Tasks 3, 4; `BatchCreateData`
  (Task 2) is what Task 3's `handleSubmit` accepts; `onAdd(batchId, foodId, quantityG)` (Task 4)
  matches `handleBatchAllocate` (Task 6); `MEAL_LABELS` export (Task 5) is imported in Task 6;
  `batchLabelFor?: (item: MealItem) => string | undefined` matches its Task 6 definition;
  ledger query key `["batchAllocations", householdId ?? "local", batchId]` is identical in
  `useBatchLedger`, `useBatchAllocations` and the prefix invalidation in `useMealPlan`.
- **Known limitations to leave alone:** (1) `useBatchLedger` runs one small request per batch and
  batches can't be deleted, so the list grows forever — fine at household scale; if it ever hurts,
  add a batch-scoped date window server-side rather than changing this UI. (2) `position` for a
  batch allocation is appended like any other entry (`addItem` computes it), unlike the old form's
  hard-coded `0`.
