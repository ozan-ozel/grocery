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
    });
  }
  return plan;
}

// Persisted per household+date via netlify/functions/meal-entries.ts (Supabase
// meal_entries table) — see supabase/07-meal-entries.sql. Nutrition is never
// stored server-side, only { foodId, quantityG }; calculateItemsNutrition
// always derives it from the live catalog. Without a household (no tenant
// selected yet) the plan stays in-memory only, same as before this landed.
//
// Backed by TanStack Query rather than a bare useEffect+useState: Bugün
// (pinned to today) and Yemek Planı (browsing today) end up with the exact
// same queryKey when they overlap, so they share one fetch and one cache
// entry — a mutation from either is instantly visible in the other, and
// switching tabs away and back repaints from cache instead of flashing
// empty while a fresh request round-trips.
//
// `options.pinnedDate` opts a caller out of the shared ?date URL param entirely:
// the plan is fixed to that date and never reads or writes the URL. Bugün needs
// this — it must always mean today, while Yemek Planı's prev/next-day navigation
// keeps steering the URL param for its own instance.
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

  const queryKey = ["mealEntries", householdId ?? "local", date] as const;

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

  function setEntries(updater: (prev: MealEntry[]) => MealEntry[]) {
    queryClient.setQueryData<MealEntry[]>(queryKey, (prev) => updater(prev ?? []));
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
  // TodayView's reconstruction of "Bugün yediklerin" from real data (grouped
  // by comboId) instead of only component state that resets on reload.
  function allItems(): (MealItem & { slot: MealSlot })[] {
    return MEAL_SLOTS.flatMap(({ slot }) => dayPlan[slot].map((item) => ({ ...item, slot })));
  }

  function addItem(slot: MealSlot, foodId: string, quantityG: number, comboId?: string): string {
    const id = uid();
    const position = dayPlan[slot].length;
    setEntries((prev) => [
      ...prev,
      { id, date, slot, foodId, quantityG, position, comboId: comboId ?? null },
    ]);
    if (householdId) {
      createMealEntry({ id, householdId, date, slot, foodId, quantityG, position, comboId }).then(
        (saved) => {
          if (!saved) console.warn("[mealPlan] entry created locally but failed to persist:", id);
        }
      );
    }
    return id;
  }

  function updateItemQuantity(slot: MealSlot, itemId: string, quantityG: number) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.slot === slot && entry.id === itemId ? { ...entry, quantityG } : entry
      )
    );
    if (householdId) {
      updateMealEntry(itemId, { quantityG }).then((saved) => {
        if (!saved) console.warn("[mealPlan] quantity updated locally but failed to persist:", itemId);
      });
    }
  }

  function removeItem(slot: MealSlot, itemId: string) {
    setEntries((prev) => prev.filter((entry) => !(entry.slot === slot && entry.id === itemId)));
    if (householdId) {
      deleteMealEntry(itemId).then((ok) => {
        if (!ok) console.warn("[mealPlan] entry removed locally but failed to delete remotely:", itemId);
      });
    }
  }

  function slotNutrition(slot: MealSlot): MacroTotals {
    return calculateItemsNutrition(dayPlan[slot], catalog);
  }

  function dailyNutrition(): MacroTotals {
    return sumMacros(MEAL_SLOTS.map(({ slot }) => slotNutrition(slot)));
  }

  return {
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
    slotNutrition,
    dailyNutrition,
  };
}
