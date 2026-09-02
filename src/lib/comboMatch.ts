import { lookupNutrition, type NutritionMap } from "./nutrition";
import { scaleNutrition, sumMacros, type MacroTotals } from "./mealNutrition";
import type { Combo } from "./combos";

export type ScoredCombo = Combo & { totals: MacroTotals };

function comboTotals(combo: Combo, catalog: NutritionMap): MacroTotals | null {
  const parts: MacroTotals[] = [];
  for (const item of combo.items) {
    const nutrition = lookupNutrition(catalog, item.foodId);
    // A combo referencing a food missing from the catalog would otherwise show
    // wrong (partial) totals — skip the whole combo instead.
    if (!nutrition) return null;
    parts.push(scaleNutrition(nutrition, item.grams));
  }
  return sumMacros(parts);
}

// Every combo the catalog can score, excluded foods dropped, ranked by
// protein — no budget filtering. Backs the "Diğer kombinasyonlar" browse
// list, which deliberately shows combos regardless of whether they fit
// today's remaining budget (unlike matchCombos below).
export function scoreAllCombos(
  combos: Combo[],
  excludedFoodIds: string[],
  catalog: NutritionMap
): ScoredCombo[] {
  const scored: ScoredCombo[] = [];
  for (const combo of combos) {
    if (combo.items.some((item) => excludedFoodIds.includes(item.foodId))) continue;
    const totals = comboTotals(combo, catalog);
    if (!totals) continue;
    scored.push({ ...combo, totals });
  }
  scored.sort((a, b) => b.totals.proteinG - a.totals.proteinG);
  return scored;
}

// Deterministic, no AI: filters out anything excluded or over the remaining kcal
// budget, then ranks by protein — the macro this app's target persona finds
// hardest to hit without deliberate planning. Returns at most 5.
export function matchCombos(
  combos: Combo[],
  remaining: MacroTotals,
  excludedFoodIds: string[],
  catalog: NutritionMap
): ScoredCombo[] {
  if (remaining.kcal <= 0) return [];
  return scoreAllCombos(combos, excludedFoodIds, catalog)
    .filter((combo) => combo.totals.kcal <= remaining.kcal)
    .slice(0, 5);
}
