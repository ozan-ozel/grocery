import combosData from "../../data/combos.json";

export type Combo = {
  id: string;
  nameTr: string;
  items: { foodId: string; grams: number }[];
  prepMinutes: number;
  tags: string[];
  // Optional concise textual preparation note (DEC-067 Level 1). Informational
  // only — never parsed, never consulted by matching/nutrition/shopping logic.
  prepNote?: string;
  // Ordered preparation steps the USER wrote for their own saved meal (see
  // savedMeals.ts). Built-in combos never set this — they only have prepNote.
  // A meal with either one is a "Tarif" (recipe); see recipeSteps below.
  steps?: string[];
};

// data/combos.json is hand-authored with snake_case keys (name_tr/food_id/
// prep_minutes — see data/README.md, matching nutrition.json's convention),
// but this module's Combo type and comboMatch.ts consume camelCase. A bare
// `as Combo[]` cast doesn't even typecheck ("neither type sufficiently
// overlaps with the other"), so this is the one place the raw JSON is
// adapted — every consumer (TodayView's suggestions, the DEC-069 batch
// planner) imports ALL_COMBOS rather than re-parsing the file itself.
type RawCombo = {
  id: string;
  name_tr: string;
  items: { food_id: string; grams: number }[];
  prep_minutes: number;
  tags: string[];
  prep_note?: string;
};

export const ALL_COMBOS: Combo[] = (combosData as RawCombo[]).map((raw) => ({
  id: raw.id,
  nameTr: raw.name_tr,
  items: raw.items.map((item) => ({ foodId: item.food_id, grams: item.grams })),
  prepMinutes: raw.prep_minutes,
  tags: raw.tags,
  prepNote: raw.prep_note,
}));

export const COMBO_BY_ID = new Map(ALL_COMBOS.map((c) => [c.id, c]));

// A meal is a recipe when it carries preparation text: the user's own ordered
// `steps`, or a built-in combo's single `prepNote` (shown as one step). Empty
// array = not a recipe. One accessor so no caller has to know the two shapes.
export function recipeSteps(combo: Pick<Combo, "steps" | "prepNote">): string[] {
  if (combo.steps && combo.steps.length > 0) return combo.steps;
  return combo.prepNote ? [combo.prepNote] : [];
}

// Meal portion tiers for the "Yemekler" picker (Meal Plan). A portion is one
// uniform multiplier over the combo's authored grams — On Cooking ch. 4's
// recipe/portion conversion factor (every ingredient scaled by the same
// factor), the same mechanism the DEC-069 batch planner's "Kat sayısı" already
// uses. Scaling everything together is what keeps a meal's protein and carb
// portions proportional to each other, instead of letting one drift alone.
//
// The gram values are NOT from On Cooking (its execution record notes it
// supplies no Grocery-specific portion tables and "does not establish
// clinical portions"). They come from this app's own data: `normal` is the
// authored combo as-is, and 2/3 and 4/3 give the round 100 / 150 / 200 g
// protein steps for a 150 g authored portion — the same 25 g grid and
// 100-250 g range eveningRecommend.ts's solver already uses for protein. Note
// `large` takes a rice/bulgur/pasta carb past that solver's 150 g raw-carb
// ceiling (200 g raw) — a deliberate, user-approved tradeoff: the ceiling
// bounds the solver's *recommendations*, not what a person may choose.
export type PortionId = "small" | "normal" | "large";

export const COMBO_PORTIONS: { id: PortionId; label: string; factor: number }[] = [
  { id: "small", label: "Küçük", factor: 2 / 3 },
  { id: "normal", label: "Normal", factor: 1 },
  { id: "large", label: "Büyük", factor: 4 / 3 },
];

export const DEFAULT_PORTION: PortionId = "normal";

const PORTION_STEP_G = 5;

// Scales every item by `factor`, rounded to the nearest 5 g (the scale's
// finest practical step; also keeps 10 g of oil from becoming 6.67 g), never
// below 5 g. A factor of exactly 1 returns the authored grams untouched.
export function scaleComboItems(
  items: Combo["items"],
  factor: number
): Combo["items"] {
  if (factor === 1) return items;
  return items.map((item) => ({
    foodId: item.foodId,
    grams: Math.max(
      PORTION_STEP_G,
      Math.round((item.grams * factor) / PORTION_STEP_G) * PORTION_STEP_G
    ),
  }));
}
