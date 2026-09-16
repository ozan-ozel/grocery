// Evening-meal recommendation engine — extends DEC-060 (Domain K, Food
// Selection, SHIPPED, implemented by comboMatch.ts's scoreAllCombos) with a
// quantity-aware variant. Unlike comboMatch.ts's combos (fixed grams,
// authored by hand), a CandidatePattern names two foods only; grams are
// solved per call against the caller's actual `remaining` macros via a
// small bounded discrete search — see matchEveningCombos below.
//
// Deliberately does not touch comboMatch.ts: this is an additive path that
// happens to produce the same ScoredCombo shape so the existing
// SuggestionCard/RecipeSearchModal/shopping-list/log-as-eaten UI in
// TodayView.tsx needs no changes to render it.
import { lookupNutrition, type NutritionMap, type Nutrition } from "./nutrition";
import { scaleNutrition, sumMacros, type MacroTotals } from "./mealNutrition";
import type { ScoredCombo } from "./comboMatch";
import {
  hasHardExclusion,
  hasSoftConstraint,
  hasHardAllergenClassExclusion,
  hasSoftAllergenClassConstraint,
  type FoodExclusion,
  type AllergenClassExclusion,
} from "./foodExclusions";

export type CandidatePattern = {
  id: string;
  nameTr: string;
  proteinFoodId: string;
  carbFoodId: string;
  prepMinutes: number;
};

// Every foodId below is confirmed present in data/nutrition.json (the seed
// for the live Supabase `nutrition` table this app actually reads through
// /api/nutrition). Live-catalog access needs an authenticated session this
// environment doesn't have credentials for, so antrikot/bonfile/kontrfile/
// chicken thigh are deliberately left out rather than guessed — add them
// only once their exact live name_tr is confirmed (e.g. via the Besin tab).
export const EVENING_CANDIDATE_PATTERNS: CandidatePattern[] = [
  {
    id: "aksam-tavuk-pirinc",
    nameTr: "Tavuk göğsü ve pirinç",
    proteinFoodId: "tavuk göğsü",
    carbFoodId: "pirinç",
    prepMinutes: 20,
  },
  {
    id: "aksam-tavuk-bulgur",
    nameTr: "Tavuk göğsü ve bulgur",
    proteinFoodId: "tavuk göğsü",
    carbFoodId: "bulgur",
    prepMinutes: 20,
  },
  {
    id: "aksam-tavuk-makarna",
    nameTr: "Tavuk göğsü ve makarna",
    proteinFoodId: "tavuk göğsü",
    carbFoodId: "makarna",
    prepMinutes: 20,
  },
  {
    id: "aksam-kiyma-pirinc",
    nameTr: "Dana kıyma ve pirinç",
    proteinFoodId: "dana kıyma",
    carbFoodId: "pirinç",
    prepMinutes: 25,
  },
  {
    id: "aksam-kiyma-bulgur",
    nameTr: "Dana kıyma ve bulgur",
    proteinFoodId: "dana kıyma",
    carbFoodId: "bulgur",
    prepMinutes: 25,
  },
  {
    id: "aksam-kiyma-makarna",
    nameTr: "Dana kıyma ve makarna",
    proteinFoodId: "dana kıyma",
    carbFoodId: "makarna",
    prepMinutes: 25,
  },
  {
    id: "aksam-hindi-bulgur",
    nameTr: "Hindi göğsü ve bulgur",
    proteinFoodId: "hindi göğsü",
    carbFoodId: "bulgur",
    prepMinutes: 20,
  },
];

// Lookup for TodayView's "Bugün yediklerin" reconstruction — an evening
// suggestion, once eaten, is logged with its pattern id as comboId (same
// convention combos.ts's COMBO_BY_ID already serves for authored combos),
// but patterns live in this module, not combos.ts, so that lookup needs a
// second map to find them again after a reload.
export const EVENING_PATTERN_BY_ID = new Map(
  EVENING_CANDIDATE_PATTERNS.map((p) => [p.id, p])
);

type GramBounds = { minG: number; maxG: number; stepG: number };

// Every nutrition.json row involved here matches USDA raw/uncooked density
// (pirinç 365 kcal/100g, bulgur 342, makarna 371 — all raw/dry; cooked
// versions of these run roughly a third of that per gram). Grams are
// therefore raw/dry ingredient weight throughout — the same convention
// data/combos.json's existing 16 combos already use (e.g. tavuk-pirinc-
// brokoli's "pirinç": 150g, paired with the prep_note "pirinci pişirin" —
// cook the rice — confirming the logged grams are pre-cooking). Bounds
// below are calibrated on that basis: a dry-grain ceiling of 150g is
// already a generous single portion (cooks up to roughly 400-450g), not
// the 300g the initial planning draft proposed before this was checked.
const HIGHER_FAT_PROTEIN_IDS = new Set(["dana kıyma"]);

const LEAN_PROTEIN_BOUNDS: GramBounds = { minG: 100, maxG: 250, stepG: 25 };
const HIGHER_FAT_PROTEIN_BOUNDS: GramBounds = { minG: 100, maxG: 200, stepG: 25 };
const CARB_BOUNDS: GramBounds = { minG: 50, maxG: 150, stepG: 25 };

function proteinBoundsFor(foodId: string): GramBounds {
  return HIGHER_FAT_PROTEIN_IDS.has(foodId) ? HIGHER_FAT_PROTEIN_BOUNDS : LEAN_PROTEIN_BOUNDS;
}

function gridRange(bounds: GramBounds): number[] {
  const out: number[] = [];
  for (let g = bounds.minG; g <= bounds.maxG; g += bounds.stepG) out.push(g);
  return out;
}

// Asymmetric scoring weights — MVP tuning parameters, not scientifically
// derived. Excess/shortfall are penalized differently per macro:
// fat excess is the worst outcome (over-budget fat from a fatty protein
// portion is the concrete failure mode this solver exists to avoid),
// protein shortfall is worse than protein excess (this app already ranks
// combos by protein as the hardest macro to hit), kcal excess is worse
// than kcal shortfall, and carbs are treated symmetrically since nothing
// in this app singles out carb excess or shortfall as worse.
const KCAL_EXCESS_WEIGHT = 1.5;
const KCAL_SHORTFALL_WEIGHT = 0.5;
const PROTEIN_EXCESS_WEIGHT = 0.3;
const PROTEIN_SHORTFALL_WEIGHT = 1.0;
const CARB_EXCESS_WEIGHT = 0.5;
const CARB_SHORTFALL_WEIGHT = 0.5;
const FAT_EXCESS_WEIGHT = 2.0;
const FAT_SHORTFALL_WEIGHT = 0.3;

// Top-level per-macro weights — how much each macro's (already-weighted)
// error contributes to the final score. kcal and protein dominate, matching
// what TodayView/SuggestionCard already surface most prominently today.
const SCORE_WEIGHT_KCAL = 0.35;
const SCORE_WEIGHT_PROTEIN = 0.3;
const SCORE_WEIGHT_CARBS = 0.2;
const SCORE_WEIGHT_FAT = 0.15;

// Lower is better. `Math.max(Math.abs(target), 1)` keeps this finite when
// remaining is at or near zero (verification scenario G) instead of
// dividing by zero or by a tiny denominator that would blow the score up.
function macroError(
  actual: number,
  target: number,
  excessWeight: number,
  shortfallWeight: number
): number {
  const diff = actual - target;
  const denom = Math.max(Math.abs(target), 1);
  return diff > 0 ? (diff / denom) * excessWeight : (Math.abs(diff) / denom) * shortfallWeight;
}

// Pure, deterministic distance from `remaining` — does not require using
// up every remaining calorie/macro (a instance well under target on every
// macro scores near zero, not poorly; see macroError's shortfall weights,
// all well below their excess counterparts).
export function scoreInstance(totals: MacroTotals, remaining: MacroTotals): number {
  const kcalErr = macroError(totals.kcal, remaining.kcal, KCAL_EXCESS_WEIGHT, KCAL_SHORTFALL_WEIGHT);
  const proteinErr = macroError(
    totals.proteinG,
    remaining.proteinG,
    PROTEIN_EXCESS_WEIGHT,
    PROTEIN_SHORTFALL_WEIGHT
  );
  const carbErr = macroError(totals.carbsG, remaining.carbsG, CARB_EXCESS_WEIGHT, CARB_SHORTFALL_WEIGHT);
  const fatErr = macroError(totals.fatG, remaining.fatG, FAT_EXCESS_WEIGHT, FAT_SHORTFALL_WEIGHT);
  return (
    kcalErr * SCORE_WEIGHT_KCAL +
    proteinErr * SCORE_WEIGHT_PROTEIN +
    carbErr * SCORE_WEIGHT_CARBS +
    fatErr * SCORE_WEIGHT_FAT
  );
}

type RecommendationInstance = {
  proteinG: number;
  carbG: number;
  totals: MacroTotals;
};

// Evaluates every (proteinG, carbG) grid point for one pattern — a full
// nutrition total per point, never a sequential "size protein, then spend
// whatever kcal is left on carbs" shortcut. That sequential shortcut is
// exactly what fails to notice a fatty protein source blowing the fat
// budget before carbs are even considered; evaluating every point and
// scoring the whole MacroTotals is what catches it instead.
function generateInstances(
  proteinFoodId: string,
  protein: Nutrition,
  carb: Nutrition
): RecommendationInstance[] {
  const proteinGrid = gridRange(proteinBoundsFor(proteinFoodId));
  const carbGrid = gridRange(CARB_BOUNDS);
  const instances: RecommendationInstance[] = [];
  for (const proteinG of proteinGrid) {
    for (const carbG of carbGrid) {
      const totals = sumMacros([scaleNutrition(protein, proteinG), scaleNutrition(carb, carbG)]);
      instances.push({ proteinG, carbG, totals });
    }
  }
  return instances;
}

function bestInstance(
  instances: RecommendationInstance[],
  remaining: MacroTotals
): RecommendationInstance | null {
  let best: RecommendationInstance | null = null;
  let bestScore = Infinity;
  for (const instance of instances) {
    const score = scoreInstance(instance.totals, remaining);
    if (score < bestScore) {
      bestScore = score;
      best = instance;
    }
  }
  return best;
}

// Deterministic, no AI: for each pattern, resolves both foods against the
// live catalog (silently skipped if either is missing, same convention
// comboMatch.ts's resolveItems uses), drops hard-excluded patterns
// entirely, solves the best-fitting quantities via bounded discrete search,
// and ranks survivors by (no soft conflict first, then) fit score.
// Returns ScoredCombo[] so every existing consumer — SuggestionCard,
// "Listeye ekle", "Yedim", gram editing after logging — works unmodified.
export function matchEveningCombos(
  patterns: CandidatePattern[],
  remaining: MacroTotals,
  exclusions: FoodExclusion[],
  allergenExclusions: AllergenClassExclusion[],
  catalog: NutritionMap,
  maxResults = 8
): ScoredCombo[] {
  if (remaining.kcal <= 0) return [];

  const scored: ScoredCombo[] = [];
  for (const pattern of patterns) {
    const protein = lookupNutrition(catalog, pattern.proteinFoodId);
    const carb = lookupNutrition(catalog, pattern.carbFoodId);
    if (!protein || !carb) continue;

    const items = [protein, carb];
    const hasHardConflict = items.some(
      (n) => hasHardExclusion(exclusions, n) || hasHardAllergenClassExclusion(allergenExclusions, n)
    );
    if (hasHardConflict) continue;

    const instance = bestInstance(generateInstances(pattern.proteinFoodId, protein, carb), remaining);
    if (!instance) continue;

    const hasSoftConflict = items.some(
      (n) => hasSoftConstraint(exclusions, n) || hasSoftAllergenClassConstraint(allergenExclusions, n)
    );

    scored.push({
      id: pattern.id,
      nameTr: pattern.nameTr,
      items: [
        { foodId: pattern.proteinFoodId, grams: instance.proteinG },
        { foodId: pattern.carbFoodId, grams: instance.carbG },
      ],
      prepMinutes: pattern.prepMinutes,
      tags: ["aksam"],
      totals: instance.totals,
      hasSoftConflict,
    });
  }

  scored.sort((a, b) => {
    if (a.hasSoftConflict !== b.hasSoftConflict) return a.hasSoftConflict ? 1 : -1;
    return scoreInstance(a.totals, remaining) - scoreInstance(b.totals, remaining);
  });

  return scored.slice(0, maxResults);
}
