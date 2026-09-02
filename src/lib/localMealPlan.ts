import type { MealSlot } from "./mealPlan";
import type { Nutrition, NutritionMap } from "./nutrition";
import { uid } from "./store";
import { scaleNutrition, sumMacros, type MacroTotals } from "./mealNutrition";

export type { MealSlot };

// What the user actually controls per spec: a food and a quantity. Nutrition
// is always derived (see calculateItemsNutrition), never stored here.
// `comboId` is set only when this item was logged via Bugün's "Yedim" —
// TodayView groups by it to reconstruct "Bugün yediklerin" after a reload.
export type MealItem = {
  id: string;
  foodId: string; // Nutrition.name_tr
  quantityG: number;
  comboId?: string;
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
