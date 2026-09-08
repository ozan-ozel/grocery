import { lookupNutrition, type NutritionMap, type Nutrition } from "./nutrition";
import { scaleNutrition, sumMacros, type MacroTotals } from "./mealNutrition";
import type { Combo } from "./combos";
import {
  hasHardExclusion,
  hasSoftConstraint,
  hasHardAllergenClassExclusion,
  hasSoftAllergenClassConstraint,
  type FoodExclusion,
  type AllergenClassExclusion,
} from "./foodExclusions";

export type ScoredCombo = Combo & {
  totals: MacroTotals;
  // True when a soft-tier (intolerance) exclusion — food-level or
  // allergen-class — matches an item. The combo is still offered (DEC-053:
  // intolerance is a soft constraint, not a hard one) but ranked behind
  // combos with no conflict at all.
  hasSoftConflict: boolean;
};

// Resolves every item to its Nutrition row up front; null if any item is
// missing from the catalog (a combo referencing an unknown food shows no
// totals rather than wrong partial ones — same rule as before).
function resolveItems(combo: Combo, catalog: NutritionMap): Nutrition[] | null {
  const rows: Nutrition[] = [];
  for (const item of combo.items) {
    const nutrition = lookupNutrition(catalog, item.foodId);
    if (!nutrition) return null;
    rows.push(nutrition);
  }
  return rows;
}

function comboTotals(items: Nutrition[], grams: number[]): MacroTotals {
  return sumMacros(items.map((n, i) => scaleNutrition(n, grams[i])));
}

// True when ANY item in the combo is hard-excluded — food-level or
// allergen-class. Allergen-class checks use the resolved Nutrition row (not
// just the foodId) because they read allergen_classes; an item with no
// allergen mapping at all is UNKNOWN for every class, so it is blocked by
// any active hard-tier allergen-class exclusion exactly like a confirmed
// match (this milestone's conservative-escalation decision, see
// foodExclusions.ts). A composite combo is blocked the moment any one item
// triggers any one excluded class — "blocked when ANY relevant excluded
// class applies" holds per-item and across the whole combo.
function comboHasHardConflict(
  items: Nutrition[],
  exclusions: FoodExclusion[],
  allergenExclusions: AllergenClassExclusion[]
): boolean {
  return items.some(
    (nutrition) =>
      // Passing the resolved Nutrition object (not just .name_tr) lets a
      // food-level exclusion match by its canonical food_id too, once one
      // exists — Canonical Food Identity decision 6.
      hasHardExclusion(exclusions, nutrition) ||
      hasHardAllergenClassExclusion(allergenExclusions, nutrition)
  );
}

function comboHasSoftConflict(
  items: Nutrition[],
  exclusions: FoodExclusion[],
  allergenExclusions: AllergenClassExclusion[]
): boolean {
  return items.some(
    (nutrition) =>
      hasSoftConstraint(exclusions, nutrition) ||
      hasSoftAllergenClassConstraint(allergenExclusions, nutrition)
  );
}

// Every combo the catalog can score, hard-excluded foods dropped, ranked by
// (no soft conflict first, then) protein — no budget filtering. Backs the
// "Diğer kombinasyonlar" browse list, which deliberately shows combos
// regardless of whether they fit today's remaining budget (unlike
// matchCombos below).
export function scoreAllCombos(
  combos: Combo[],
  exclusions: FoodExclusion[],
  allergenExclusions: AllergenClassExclusion[],
  catalog: NutritionMap
): ScoredCombo[] {
  const scored: ScoredCombo[] = [];
  for (const combo of combos) {
    const items = resolveItems(combo, catalog);
    if (!items) continue;
    // Hard tier (allergy / unclear / unclassified / preference, food-level
    // or allergen-class): the combo is dropped entirely.
    if (comboHasHardConflict(items, exclusions, allergenExclusions)) continue;
    const totals = comboTotals(
      items,
      combo.items.map((i) => i.grams)
    );
    // Soft tier (intolerance): never drops the combo — DEC-053's own split
    // — only de-prioritises it (Phase 9 §20 Milestone 1, A1).
    const hasSoftConflict = comboHasSoftConflict(items, exclusions, allergenExclusions);
    scored.push({ ...combo, totals, hasSoftConflict });
  }
  scored.sort((a, b) => {
    if (a.hasSoftConflict !== b.hasSoftConflict) return a.hasSoftConflict ? 1 : -1;
    return b.totals.proteinG - a.totals.proteinG;
  });
  return scored;
}

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
