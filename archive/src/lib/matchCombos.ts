// ARCHIVED — companion of archive/src/components/TodayView.tsx. Not compiled,
// not deployed. See archive/README.md for how to restore.
//
// Was `matchCombos` in src/lib/comboMatch.ts (removed from there when TodayView
// was archived). Restore by moving this file to src/lib/matchCombos.ts.
import type { MacroTotals } from "@/lib/mealNutrition";
import type { NutritionMap } from "@/lib/nutrition";
import type { Combo } from "@/lib/combos";
import { scoreAllCombos, type ScoredCombo } from "@/lib/comboMatch";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";

// Deterministic, no AI: filters out anything hard-excluded or over the
// remaining kcal budget, then ranks by (no soft conflict first, then)
// protein — the macro this app's target persona finds hardest to hit
// without deliberate planning. Returns at most 5.
export function matchCombos(
  combos: Combo[],
  remaining: MacroTotals,
  exclusions: FoodExclusion[],
  allergenExclusions: AllergenClassExclusion[],
  catalog: NutritionMap
): ScoredCombo[] {
  if (remaining.kcal <= 0) return [];
  return scoreAllCombos(combos, exclusions, allergenExclusions, catalog)
    .filter((combo) => combo.totals.kcal <= remaining.kcal)
    .slice(0, 5);
}
