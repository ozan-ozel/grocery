import type { PersonalTargets } from "./mealPersonalization";
import type { MacroTotals } from "./mealNutrition";

export const INCOMPATIBLE_TARGETS_MESSAGE =
  "Makro aralıkları bu kalori hedefiyle birlikte karşılanamıyor. Otomatik hedef dağılımı ve öneriler için Kişisel Plan bilgilerini bir diyetisyenle gözden geçir. Yemeklerini kaydetmeye devam edebilirsin.";

// Select an energy-consistent point inside existing ranges; no new prescription.
// An impossible intersection returns null instead of inventing grams outside
// the ranges. 4/4/9 is the planning convention; food calories stay source-based.
export function planningMacros(targets: PersonalTargets): MacroTotals | null {
  const { targetKcal: energy, proteinG: p, fatG: f, carbsG: c } = targets;
  const bands = [p, f, c];
  if (!Number.isFinite(energy) || energy <= 0 || bands.some(b =>
    !Number.isFinite(b.min) || !Number.isFinite(b.max) || b.min < 0 || b.min > b.max)) return null;
  const minEnergy = 4 * p.min + 9 * f.min + 4 * c.min;
  const maxEnergy = 4 * p.max + 9 * f.max + 4 * c.max;
  if (energy < minEnergy || energy > maxEnergy) return null;
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const protein = clamp((p.min + p.max) / 2,
    Math.max(p.min, (energy - 9 * f.max - 4 * c.max) / 4),
    Math.min(p.max, (energy - 9 * f.min - 4 * c.min) / 4));
  const fat = clamp((f.min + f.max) / 2,
    Math.max(f.min, (energy - 4 * protein - 4 * c.max) / 9),
    Math.min(f.max, (energy - 4 * protein - 4 * c.min) / 9));
  return {
    kcal: energy, proteinG: protein, fatG: fat,
    carbsG: (energy - 4 * protein - 9 * fat) / 4,
    fiberG: (targets.fiberG.min + targets.fiberG.max) / 2,
  };
}
