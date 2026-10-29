import { lookupNutrition, type NutritionMap, type Nutrition } from "./nutrition";
import { scaleNutrition, sumMacros, type MacroTotals } from "./mealNutrition";
import { scaleMealItems, type Meal } from "./meals";
import {
  hasHardExclusion,
  hasSoftConstraint,
  hasHardAllergenClassExclusion,
  hasSoftAllergenClassConstraint,
  type FoodExclusion,
  type AllergenClassExclusion,
} from "./foodExclusions";

export type ScoredMeal = Meal & {
  totals: MacroTotals;
  // True when a soft-tier (intolerance) exclusion — food-level or
  // allergen-class — matches an item. The meal is still offered (DEC-053:
  // intolerance is a soft constraint, not a hard one) but ranked behind
  // meals with no conflict at all.
  hasSoftConflict: boolean;
};

// Resolves every item to its Nutrition row up front; null if any item is
// missing from the catalog (a meal referencing an unknown food shows no
// totals rather than wrong partial ones — same rule as before).
function resolveItems(meal: Meal, catalog: NutritionMap): Nutrition[] | null {
  const rows: Nutrition[] = [];
  for (const item of meal.items) {
    const nutrition = lookupNutrition(catalog, item.foodId);
    if (!nutrition || nutrition.is_active === false) return null;
    rows.push(nutrition);
  }
  return rows;
}

function mealTotals(items: Nutrition[], grams: number[]): MacroTotals {
  return sumMacros(items.map((n, i) => scaleNutrition(n, grams[i])));
}

// Macro totals for a meal at a portion `factor` (see MEAL_PORTIONS in
// meals.ts) — computed from the same rounded gram values that get logged, not
// by multiplying the authored totals, so what the picker shows is exactly what
// gets added. null if any item is missing from the catalog, like resolveItems.
export function scaledMealTotals(
  meal: Meal,
  factor: number,
  catalog: NutritionMap
): MacroTotals | null {
  const items = resolveItems(meal, catalog);
  if (!items) return null;
  return mealTotals(
    items,
    scaleMealItems(meal.items, factor).map((i) => i.grams)
  );
}

// True when ANY item in the meal is hard-excluded — food-level or
// allergen-class. Allergen-class checks use the resolved Nutrition row (not
// just the foodId) because they read allergen_classes; an item with no
// allergen mapping at all is UNKNOWN for every class, so it is blocked by
// any active hard-tier allergen-class exclusion exactly like a confirmed
// match (this milestone's conservative-escalation decision, see
// foodExclusions.ts). A composite meal is blocked the moment any one item
// triggers any one excluded class — "blocked when ANY relevant excluded
// class applies" holds per-item and across the whole meal.
function mealHasHardConflict(
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

function mealHasSoftConflict(
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

// Every meal the catalog can score, hard-excluded foods dropped, ranked by
// (no soft conflict first, then) protein — no budget filtering. Backs the
// Yemekler picker's full list, which deliberately shows meals regardless of
// whether they fit the day's remaining budget.
export function scoreAllMeals(
  meals: Meal[],
  exclusions: FoodExclusion[],
  allergenExclusions: AllergenClassExclusion[],
  catalog: NutritionMap
): ScoredMeal[] {
  const scored: ScoredMeal[] = [];
  for (const meal of meals) {
    const items = resolveItems(meal, catalog);
    if (!items) continue;
    // Hard tier (allergy / unclear / unclassified / preference, food-level
    // or allergen-class): the meal is dropped entirely.
    if (mealHasHardConflict(items, exclusions, allergenExclusions)) continue;
    const totals = mealTotals(
      items,
      meal.items.map((i) => i.grams)
    );
    // Soft tier (intolerance): never drops the meal — DEC-053's own split
    // — only de-prioritises it (Phase 9 §20 Milestone 1, A1).
    const hasSoftConflict = mealHasSoftConflict(items, exclusions, allergenExclusions);
    scored.push({ ...meal, totals, hasSoftConflict });
  }
  scored.sort((a, b) => {
    // Household preference overrides, checked before the nutritional
    // ranking: hindi (turkey) meals sink to the very bottom (nobody here
    // eats turkey regularly), and bone-in chicken thigh sinks low too, just
    // not as low as turkey.
    const tierDiff = preferenceTier(a) - preferenceTier(b);
    if (tierDiff !== 0) return tierDiff;
    if (a.hasSoftConflict !== b.hasSoftConflict) return a.hasSoftConflict ? 1 : -1;
    return b.totals.proteinG - a.totals.proteinG;
  });
  return scored;
}

// Higher tier sorts later. 0 = normal ranking, 1 = deprioritized (bone-in
// chicken thigh), 2 = sunk to the bottom (turkey). Exported so mealRecommend.ts
// ranks with the same household preference.
export function preferenceTier(meal: Meal): number {
  if (hasTurkey(meal)) return 2;
  if (hasBoneInChickenThigh(meal)) return 1;
  return 0;
}

function hasTurkey(meal: Meal): boolean {
  return meal.items.some((i) => i.foodId.toLocaleLowerCase("tr-TR").startsWith("hindi"));
}

function hasBoneInChickenThigh(meal: Meal): boolean {
  return meal.items.some(
    (i) => i.foodId.toLocaleLowerCase("tr-TR") === "tavuk but (kemikli)"
  );
}
