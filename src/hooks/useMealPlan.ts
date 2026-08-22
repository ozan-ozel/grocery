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
