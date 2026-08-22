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
