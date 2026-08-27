// src/hooks/useMealPlan.ts
import { useEffect, useState } from "react";
import { defaultTitle, readMealDateFromUrl, writeMealDateToUrl, uid } from "@/lib/store";
import type { NutritionMap } from "@/lib/nutrition";
import {
  MEAL_SLOTS,
  calculateItemsNutrition,
  type MealItem,
  type MealSlot,
} from "@/lib/localMealPlan";
import { sumMacros, type MacroTotals } from "@/lib/mealNutrition";
import { createMealEntry, deleteMealEntry, fetchMealEntries, updateMealEntry } from "@/lib/mealPlan";

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

// Persisted per household+date via netlify/functions/meal-entries.ts (Supabase
// meal_entries table) — see supabase/07-meal-entries.sql. Nutrition is never
// stored server-side, only { foodId, quantityG }; calculateItemsNutrition
// always derives it from the live catalog. Without a household (no tenant
// selected yet) the plan stays in-memory only, same as before this landed.
export function useMealPlan(householdId: string | null, catalog: NutritionMap) {
  const [date, setDate] = useState<string>(initialDate);
  const [plans, setPlans] = useState<Record<string, DayPlan>>({});

  useEffect(() => {
    writeMealDateToUrl(date);
  }, [date]);

  const planKey = `${householdId ?? "local"}|${date}`;
  const dayPlan = plans[planKey] ?? emptyDayPlan();

  useEffect(() => {
    if (!householdId) return;
    let cancelled = false;
    fetchMealEntries(householdId, date, date).then((entries) => {
      if (cancelled) return;
      const plan = emptyDayPlan();
      for (const entry of entries) {
        plan[entry.slot].push({ id: entry.id, foodId: entry.foodId, quantityG: entry.quantityG });
      }
      setPlans((prev) => ({ ...prev, [`${householdId}|${date}`]: plan }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [householdId, date]);

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
    const id = uid();
    const position = dayPlan[slot].length;
    updateDayPlan((plan) => ({ ...plan, [slot]: [...plan[slot], { id, foodId, quantityG }] }));
    if (householdId) {
      createMealEntry({ id, householdId, date, slot, foodId, quantityG, position }).then((saved) => {
        if (!saved) console.warn("[mealPlan] entry created locally but failed to persist:", id);
      });
    }
  }

  function updateItemQuantity(slot: MealSlot, itemId: string, quantityG: number) {
    updateDayPlan((plan) => ({
      ...plan,
      [slot]: plan[slot].map((item) => (item.id === itemId ? { ...item, quantityG } : item)),
    }));
    if (householdId) {
      updateMealEntry(itemId, { quantityG }).then((saved) => {
        if (!saved) console.warn("[mealPlan] quantity updated locally but failed to persist:", itemId);
      });
    }
  }

  function removeItem(slot: MealSlot, itemId: string) {
    updateDayPlan((plan) => ({
      ...plan,
      [slot]: plan[slot].filter((item) => item.id !== itemId),
    }));
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
