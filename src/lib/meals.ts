// The shared shape of every meal the app can add to a plan: the ready-made
// meals in data/ready-meals.json (readyMeals.ts), the user's saved meals
// (savedMeals.ts adapts them with savedMealToMeal) and evening suggestion
// patterns (eveningRecommend.ts). Scoring lives in mealMatch.ts.
export type Meal = {
  id: string;
  nameTr: string;
  items: { foodId: string; grams: number }[];
  prepMinutes: number;
  tags: string[];
  // Optional concise textual preparation note (DEC-067 Level 1). Informational
  // only — never parsed, never consulted by matching/nutrition/shopping logic.
  prepNote?: string;
  // Ordered preparation steps the USER wrote for their own saved meal (see
  // savedMeals.ts). Built-in meals never set this — they only have prepNote.
  // A meal with either one is a "Tarif" (recipe); see recipeSteps below.
  steps?: string[];
};

// A meal is a recipe when it carries preparation text: the user's own ordered
// `steps`, or a built-in meal's single `prepNote` (shown as one step). Empty
// array = not a recipe. One accessor so no caller has to know the two shapes.
export function recipeSteps(meal: Pick<Meal, "steps" | "prepNote">): string[] {
  if (meal.steps && meal.steps.length > 0) return meal.steps;
  return meal.prepNote ? [meal.prepNote] : [];
}

// Meal portion tiers for the "Yemekler" picker (Meal Plan). A portion is one
// uniform multiplier over the meal's authored grams — On Cooking ch. 4's
// recipe/portion conversion factor (every ingredient scaled by the same
// factor), the same mechanism the DEC-069 batch planner's "Kat sayısı" already
// uses. Scaling everything together is what keeps a meal's protein and carb
// portions proportional to each other, instead of letting one drift alone.
//
// The gram values are NOT from On Cooking (its execution record notes it
// supplies no Grocery-specific portion tables and "does not establish
// clinical portions"). They come from this app's own data: `normal` is the
// authored meal as-is, and 2/3 and 4/3 give the round 100 / 150 / 200 g
// protein steps for a 150 g authored portion — the same 25 g grid and
// 100-250 g range eveningRecommend.ts's solver already uses for protein. Note
// `large` takes a rice/bulgur/pasta carb past that solver's 150 g raw-carb
// ceiling (200 g raw) — a deliberate, user-approved tradeoff: the ceiling
// bounds the solver's *recommendations*, not what a person may choose.
export type PortionId = "small" | "normal" | "large";

export const MEAL_PORTIONS: { id: PortionId; label: string; factor: number }[] = [
  { id: "small", label: "Küçük", factor: 2 / 3 },
  { id: "normal", label: "Normal", factor: 1 },
  { id: "large", label: "Büyük", factor: 4 / 3 },
];

const PORTION_STEP_G = 5;

// Scales every item by `factor`, rounded to the nearest 5 g (the scale's
// finest practical step; also keeps 10 g of oil from becoming 6.67 g), never
// below 5 g. A factor of exactly 1 returns the authored grams untouched.
export function scaleMealItems(
  items: Meal["items"],
  factor: number
): Meal["items"] {
  if (factor === 1) return items;
  return items.map((item) => ({
    foodId: item.foodId,
    grams: Math.max(
      PORTION_STEP_G,
      Math.round((item.grams * factor) / PORTION_STEP_G) * PORTION_STEP_G
    ),
  }));
}
