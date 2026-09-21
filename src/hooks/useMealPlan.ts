// src/hooks/useMealPlan.ts
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/preact-query";
import { defaultTitle, readMealDateFromUrl, writeMealDateToUrl, uid } from "@/lib/store";
import type { NutritionMap } from "@/lib/nutrition";
import {
  MEAL_SLOTS,
  calculateItemsNutrition,
  type MealItem,
  type MealSlot,
} from "@/lib/localMealPlan";
import { sumMacros, type MacroTotals } from "@/lib/mealNutrition";
import {
  createMealEntry,
  deleteMealEntry,
  fetchMealEntries,
  updateMealEntry,
  type MealEntry,
} from "@/lib/mealPlan";
import { popStep, recordChange, type Change } from "@/lib/mealPlanHistory";

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

export function todayDateStr(): string {
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

function toDayPlan(entries: MealEntry[]): DayPlan {
  const plan = emptyDayPlan();
  for (const entry of entries) {
    plan[entry.slot].push({
      id: entry.id,
      foodId: entry.foodId,
      quantityG: entry.quantityG,
      comboId: entry.comboId ?? undefined,
      batchId: entry.batchId ?? undefined,
    });
  }
  return plan;
}

// Persisted per household+date via api/meal-entries.ts (Supabase
// meal_entries table) — see supabase/07-meal-entries.sql. Nutrition is never
// stored server-side, only { foodId, quantityG }; calculateItemsNutrition
// always derives it from the live catalog. Without a household (no tenant
// selected yet) the plan stays in-memory only, same as before this landed.
//
// Backed by TanStack Query rather than a bare useEffect+useState: the
// today-pinned instance (useRemainingToday) and Yemek Planı (browsing today) end up with the exact
// same queryKey when they overlap, so they share one fetch and one cache
// entry — a mutation from either is instantly visible in the other, and
// switching tabs away and back repaints from cache instead of flashing
// empty while a fresh request round-trips.
//
// `options.pinnedDate` opts a caller out of the shared ?date URL param entirely:
// the plan is fixed to that date and never reads or writes the URL. useRemainingToday
// needs this — it must always mean today, while Yemek Planı's prev/next-day navigation
// keeps steering the URL param for its own instance.
//
// Every mutation is recorded in src/lib/mealPlanHistory.ts (5-step undo). The
// apply* cores below do the optimistic write + API call and never record, so
// the public mutators record and undo (which calls the cores) never does.
export function useMealPlan(
  householdId: string | null,
  catalog: NutritionMap,
  options?: { pinnedDate?: string },
) {
  const [date, setDate] = useState<string>(() => options?.pinnedDate ?? initialDate());
  const queryClient = useQueryClient();

  useEffect(() => {
    if (options?.pinnedDate) return;
    writeMealDateToUrl(date);
  }, [date, options?.pinnedDate]);

  // Re-pin when the caller's date moves under us (midnight rollover while mounted).
  useEffect(() => {
    if (options?.pinnedDate && options.pinnedDate !== date) {
      setDate(options.pinnedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.pinnedDate]);

  const queryKeyFor = (d: string) => ["mealEntries", householdId ?? "local", d] as const;
  const queryKey = queryKeyFor(date);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchMealEntries(householdId as string, date, date),
    enabled: !!householdId,
    // Edits happen via this same UI far more often than from elsewhere, so a
    // short staleTime avoids a refetch-flash on every tab switch while still
    // catching a change made on another device within half a minute or so.
    staleTime: 30_000,
  });

  const dayPlan = toDayPlan(householdId ? (query.data ?? []) : []);

  // The viewed date's entries as they are in the cache right now — fresher than
  // `dayPlan`, which is a render-time snapshot (several mutations can land in
  // one tick, e.g. adding a meal's items in a loop).
  function currentEntries(): MealEntry[] {
    return queryClient.getQueryData<MealEntry[]>(queryKey) ?? [];
  }

  function setEntriesFor(entryDate: string, updater: (prev: MealEntry[]) => MealEntry[]) {
    // An undo can target a day that is neither viewed nor cached. Writing
    // updater([]) there would cache a partial day, so skip the optimistic
    // write — undoLast invalidates that date once the server writes settle.
    if (entryDate !== date && queryClient.getQueryData(queryKeyFor(entryDate)) === undefined) {
      return;
    }
    queryClient.setQueryData<MealEntry[]>(queryKeyFor(entryDate), (prev) => updater(prev ?? []));
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

  // Every item across all slots for the pinned date, slot attached — backs
  // MealPlanView's reconstruction of eaten evening combos from real data (grouped
  // by comboId) instead of only component state that resets on reload.
  function allItems(): (MealItem & { slot: MealSlot })[] {
    return MEAL_SLOTS.flatMap(({ slot }) => dayPlan[slot].map((item) => ({ ...item, slot })));
  }

  // DEC-069: an entry linked to a batch changes what's left of that batch.
  // Refetch the batch ledger only AFTER the server write has landed —
  // invalidating earlier would refetch the old allocations and leave the
  // "kaldı" grams stale.
  function refreshBatchLedger() {
    queryClient.invalidateQueries({
      queryKey: ["batchAllocations", householdId ?? "local"],
    });
  }

  // --- apply* cores: optimistic cache write + API call, never recorded -------

  // `at` re-inserts at a cache index (undo of a removal); without it, append.
  function applyAdd(entry: MealEntry, at?: number): Promise<void> {
    setEntriesFor(entry.date, (prev) => {
      if (at === undefined || at >= prev.length) return [...prev, entry];
      return [...prev.slice(0, at), entry, ...prev.slice(at)];
    });
    if (!householdId) return Promise.resolve();
    return createMealEntry({
      id: entry.id,
      householdId,
      date: entry.date,
      slot: entry.slot,
      foodId: entry.foodId,
      quantityG: entry.quantityG,
      position: entry.position,
      comboId: entry.comboId ?? undefined,
      batchId: entry.batchId ?? undefined,
    }).then((saved) => {
      if (!saved) console.warn("[mealPlan] entry created locally but failed to persist:", entry.id);
      else if (entry.batchId) refreshBatchLedger();
    });
  }

  function applyRemove(entries: MealEntry[]): Promise<void> {
    const ids = new Set(entries.map((entry) => entry.id));
    for (const entryDate of new Set(entries.map((entry) => entry.date))) {
      setEntriesFor(entryDate, (prev) => prev.filter((entry) => !ids.has(entry.id)));
    }
    if (!householdId) return Promise.resolve();
    return Promise.all(
      entries.map((entry) =>
        deleteMealEntry(entry.id).then((ok) => {
          if (!ok) console.warn("[mealPlan] entry removed locally but failed to delete remotely:", entry.id);
          else if (entry.batchId) refreshBatchLedger();
        })
      )
    ).then(() => undefined);
  }

  function applyQuantity(entry: MealEntry, quantityG: number): Promise<void> {
    setEntriesFor(entry.date, (prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, quantityG } : e))
    );
    if (!householdId) return Promise.resolve();
    return updateMealEntry(entry.id, { quantityG }).then((saved) => {
      if (!saved) console.warn("[mealPlan] quantity updated locally but failed to persist:", entry.id);
      else if (entry.batchId) refreshBatchLedger();
    });
  }

  // --- recorded mutators ------------------------------------------------------

  const nameOf = (foodId: string) => catalog.get(foodId)?.name_tr ?? foodId;

  function record(label: string, changes: Change[]) {
    if (householdId) recordChange(householdId, label, changes);
  }

  function addItem(
    slot: MealSlot,
    foodId: string,
    quantityG: number,
    comboId?: string,
    batchId?: string
  ): string {
    const id = uid();
    // One past the slot's highest position, read from the live cache: the
    // server orders by (date, slot, position) only, so entries that share a
    // position come back in arbitrary order after a reload. `dayPlan` is a
    // render-time snapshot — every item of a meal added in one loop would
    // otherwise get the same position.
    const slotPositions = currentEntries()
      .filter((e) => e.slot === slot)
      .map((e) => e.position);
    const position = slotPositions.length > 0 ? Math.max(...slotPositions) + 1 : 0;
    const entry: MealEntry = {
      id,
      date,
      slot,
      foodId,
      quantityG,
      position,
      comboId: comboId ?? null,
      batchId: batchId ?? null,
    };
    applyAdd(entry);
    record(`${nameOf(foodId)} eklendi`, [{ kind: "added", entry }]);
    return id;
  }

  function updateItemQuantity(slot: MealSlot, itemId: string, quantityG: number) {
    const entry = currentEntries().find((e) => e.slot === slot && e.id === itemId);
    if (!entry || entry.quantityG === quantityG) return;
    applyQuantity(entry, quantityG);
    record(`${nameOf(entry.foodId)} ${entry.quantityG}g → ${quantityG}g`, [
      { kind: "quantity", entry, from: entry.quantityG, to: quantityG },
    ]);
  }

  function removeItem(slot: MealSlot, itemId: string) {
    const entries = currentEntries();
    const index = entries.findIndex((e) => e.slot === slot && e.id === itemId);
    if (index < 0) return;
    const entry = entries[index];
    applyRemove([entry]);
    record(`${nameOf(entry.foodId)} kaldırıldı`, [{ kind: "removed", entry, index }]);
  }

  // Removes every entry `match` accepts, as ONE undo step. Recorded highest
  // index first, so each recorded index is still right when undo re-inserts
  // them in reverse (lowest first).
  function clearEntries(label: (count: number) => string, match: (entry: MealEntry) => boolean) {
    const targets = currentEntries()
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => match(entry))
      .reverse();
    if (targets.length === 0) return;
    applyRemove(targets.map(({ entry }) => entry));
    record(
      label(targets.length),
      targets.map(({ entry, index }): Change => ({ kind: "removed", entry, index }))
    );
  }

  function clearSlot(slot: MealSlot) {
    const slotLabel = MEAL_SLOTS.find((s) => s.slot === slot)?.label ?? slot;
    clearEntries((count) => `${slotLabel} temizlendi · ${count} ürün`, (entry) => entry.slot === slot);
  }

  function clearDay() {
    clearEntries((count) => `Gün temizlendi · ${count} ürün`, () => true);
  }

  // --- undo -------------------------------------------------------------------

  function applyInverse(change: Change): Promise<void> {
    switch (change.kind) {
      case "added":
        return applyRemove([change.entry]);
      case "removed":
        return applyAdd(change.entry, change.index);
      case "quantity":
        return applyQuantity(change.entry, change.from);
    }
  }

  // Reverses the newest step. If it happened on another day, the view moves
  // there so the change is visible (the today-pinned instance never navigates).
  function undoLast() {
    if (!householdId) return;
    const step = popStep(householdId);
    if (!step) return;
    const day = step.changes[0].entry.date;
    const wasCached = queryClient.getQueryData(queryKeyFor(day)) !== undefined;
    if (!options?.pinnedDate && day !== date) setDate(day);
    Promise.all([...step.changes].reverse().map(applyInverse)).then(() => {
      // A cached day already shows the exact result; only a day that was not
      // cached needs a refetch to be whole.
      if (!wasCached) queryClient.invalidateQueries({ queryKey: queryKeyFor(day) });
    });
  }

  function slotNutrition(slot: MealSlot): MacroTotals {
    return calculateItemsNutrition(dayPlan[slot], catalog);
  }

  function dailyNutrition(): MacroTotals {
    return sumMacros(MEAL_SLOTS.map(({ slot }) => slotNutrition(slot)));
  }

  return {
    date,
    dateLabel: defaultTitle(strToDate(date).getTime()),
    // True only on a cold load (no cached data yet for this household+date).
    // Background revalidation after that never flips this back on, so
    // already-shown data doesn't flash back to a loading state.
    isLoading: !!householdId && query.isLoading,
    goToPrevDay,
    goToNextDay,
    itemsForSlot,
    allItems,
    addItem,
    updateItemQuantity,
    removeItem,
    clearSlot,
    clearDay,
    undoLast,
    slotNutrition,
    dailyNutrition,
  };
}
