// "Sana uygun" — deterministic meal recommendations for one meal slot.
//
// No AI, no network: it ranks the meals the picker already shows against the
// share of the day's REMAINING macros that this slot should take. Pure and
// dependency-light on purpose, so a later version can take more candidates,
// return more results, be cached/precomputed, or be replaced by a smarter
// ranker without touching its callers (see RecommendedMeal below).
import type { MealSlot } from "./mealPlan";
import type { MacroTotals } from "./mealNutrition";
import type { NutritionMap } from "./nutrition";
import { COMBO_PORTIONS, type Combo, type PortionId } from "./combos";
import { scaledComboTotals, preferenceTier, type ScoredCombo } from "./comboMatch";
import { scoreInstance } from "./eveningRecommend";

export type RecommendedMeal = {
  combo: ScoredCombo;
  // The portion tier (COMBO_PORTIONS) that fit the slot budget best.
  portionId: PortionId;
  factor: number;
  // Totals at that tier — computed from the same rounded grams that get logged.
  totals: MacroTotals;
  // Lower is better (scoreInstance). Exposed so a future UI/ranker can use it.
  score: number;
};

const ALL_SLOTS: MealSlot[] = ["kahvalti", "ogle", "aksam", "ara"];

// MVP tuning weights, NOT scientifically derived (same status as the constants
// in eveningRecommend.ts): how much of the day's remaining budget each slot
// gets relative to the others still open. A snack takes half a meal.
export const SLOT_WEIGHT: Record<MealSlot, number> = {
  kahvalti: 1,
  ogle: 1,
  aksam: 1,
  ara: 0.5,
};

// The part of the day's remaining macros this slot should take: remaining ×
// (this slot's weight ÷ the weights of every slot still open). A slot counts
// as open when it is empty OR it is the slot being added to. Negative
// remaining values clamp to 0 (a macro already exceeded contributes no room).
export function slotBudget(
  remaining: MacroTotals,
  slot: MealSlot,
  filledSlots: ReadonlySet<MealSlot>
): MacroTotals {
  let openWeight = 0;
  for (const s of ALL_SLOTS) {
    if (s === slot || !filledSlots.has(s)) openWeight += SLOT_WEIGHT[s];
  }
  const share = SLOT_WEIGHT[slot] / openWeight;
  const part = (value: number) => Math.max(0, value) * share;
  return {
    kcal: part(remaining.kcal),
    proteinG: part(remaining.proteinG),
    fatG: part(remaining.fatG),
    carbsG: part(remaining.carbsG),
    fiberG: part(remaining.fiberG),
  };
}

const SNACK_TAGS = ["ara-ogun", "atistirmalik"];

// Only three of combos.json's tags are used for this: "kahvalti", "ara-ogun",
// "atistirmalik". Untagged meals are treated as main meals.
//  - kahvalti slot: breakfast-tagged meals only
//  - ara slot: snack- or breakfast-tagged (light) meals
//  - ogle / aksam: everything that is neither breakfast- nor snack-tagged
// Slot ids are used, never the card labels (two cards read "Ara Öğün").
export function fitsSlot(combo: Pick<Combo, "tags">, slot: MealSlot): boolean {
  const isBreakfast = combo.tags.includes("kahvalti");
  const isSnack = combo.tags.some((tag) => SNACK_TAGS.includes(tag));
  if (slot === "kahvalti") return isBreakfast;
  if (slot === "ara") return isSnack || isBreakfast;
  return !isBreakfast && !isSnack;
}

export type RecommendInput = {
  // Already exclusion-filtered and totalled — pass scoreAllCombos' output.
  combos: ScoredCombo[];
  slot: MealSlot;
  // The whole day's remaining macros (target − consumed) for the day being viewed.
  remaining: MacroTotals;
  // Slots of that day that already have entries.
  filledSlots: ReadonlySet<MealSlot>;
  catalog: NutritionMap;
  limit?: number;
};

export const DEFAULT_RECOMMEND_LIMIT = 4;

// For each meal that fits the slot, picks the portion tier whose totals score
// best (scoreInstance) against the slot budget, then ranks: household
// preference tier, no soft conflict first, then score. [] when nothing is left
// in the day's calorie budget.
export function recommendMeals(input: RecommendInput): RecommendedMeal[] {
  const { combos, slot, remaining, filledSlots, catalog } = input;
  if (remaining.kcal <= 0) return [];

  const budget = slotBudget(remaining, slot, filledSlots);
  const out: RecommendedMeal[] = [];
  for (const combo of combos) {
    if (!fitsSlot(combo, slot)) continue;
    let best: Omit<RecommendedMeal, "combo"> | null = null;
    for (const portion of COMBO_PORTIONS) {
      const totals = scaledComboTotals(combo, portion.factor, catalog);
      if (!totals) continue;
      const score = scoreInstance(totals, budget);
      if (!best || score < best.score) {
        best = { portionId: portion.id, factor: portion.factor, totals, score };
      }
    }
    if (best) out.push({ combo, ...best });
  }

  out.sort(
    (a, b) =>
      preferenceTier(a.combo) - preferenceTier(b.combo) ||
      Number(a.combo.hasSoftConflict) - Number(b.combo.hasSoftConflict) ||
      a.score - b.score
  );
  return out.slice(0, input.limit ?? DEFAULT_RECOMMEND_LIMIT);
}
