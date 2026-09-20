// "Yemeklerim": the user's own reusable meals. One entity for both plain meals
// and recipes — a saved meal with non-empty `steps` IS a recipe (Tarifler), so
// nothing is entered twice and the user never chooses between the two.
//
// Per-USER (api/personal-plan.ts, `saved_meals` table, RLS on user_id), like the
// Personal Plan — not per-household. `items[].foodId` is nutrition.name_tr, the
// same value space as MealEntry.foodId / Combo.items[].foodId — never the
// opaque Nutrition.food_id UUID.
import type { Combo } from "./combos";
import type { ScoredCombo } from "./comboMatch";
import { scoreAllCombos } from "./comboMatch";
import { lookupNutrition, type NutritionMap } from "./nutrition";
import { normalizeComposition, type BatchCompositionItem } from "./preparationBatch";
import type { FoodExclusion, AllergenClassExclusion } from "./foodExclusions";

export type SavedMeal = {
  id: string;
  name: string;
  items: BatchCompositionItem[];
  // Ordered preparation steps. Empty = a plain meal (not a recipe).
  steps: string[];
  createdAt: string;
};

export type NewSavedMeal = {
  id: string;
  name: string;
  items: BatchCompositionItem[];
  steps: string[];
};

export const SAVED_MEAL_LIMITS = {
  nameMax: 60,
  itemsMax: 40,
  stepsMax: 30,
  stepMax: 500,
} as const;

type SavedMealRow = {
  id: string;
  user_id: string;
  name: string;
  items: { food_id: string; quantity_g: number }[];
  steps: string[] | null;
  created_at: string;
};

function fromRow(row: SavedMealRow): SavedMeal {
  return {
    id: row.id,
    name: row.name,
    items: row.items.map((item) => ({ foodId: item.food_id, quantityG: item.quantity_g })),
    steps: row.steps ?? [],
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Pure helpers

// One step per line; blank lines dropped; capped so a paste can't bloat a row.
export function parseSteps(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim().slice(0, SAVED_MEAL_LIMITS.stepMax))
    .filter(Boolean)
    .slice(0, SAVED_MEAL_LIMITS.stepsMax);
}

export function stepsToText(steps: string[]): string {
  return steps.join("\n");
}

// A saved meal wearing the Combo shape, so every existing meal helper
// (scoreAllCombos, scaledComboTotals, MealsSheet's rows, handleComboSelect)
// works on it unchanged. prepMinutes 0 = "unknown", which the UI hides.
export function savedMealToCombo(meal: SavedMeal): Combo {
  return {
    id: meal.id,
    nameTr: meal.name,
    items: meal.items.map((item) => ({ foodId: item.foodId, grams: item.quantityG })),
    prepMinutes: 0,
    tags: [],
    steps: meal.steps.length > 0 ? meal.steps : undefined,
  };
}

export type SavedMealEntry = {
  meal: SavedMeal;
  // Null when the meal can't be offered — see `blocked`.
  scored: ScoredCombo | null;
  // "missing": an ingredient is no longer in the nutrition catalog, so it has
  //   no totals. "excluded": it contains a hard-excluded food (allergy etc.).
  // Never silently dropped: the list shows the row disabled with the reason,
  // because scoreAllCombos would otherwise make a saved meal just vanish.
  blocked: "missing" | "excluded" | null;
};

export function annotateSavedMeals(
  meals: SavedMeal[],
  exclusions: FoodExclusion[],
  allergenExclusions: AllergenClassExclusion[],
  catalog: NutritionMap
): SavedMealEntry[] {
  const scoredById = new Map(
    scoreAllCombos(meals.map(savedMealToCombo), exclusions, allergenExclusions, catalog).map(
      (combo) => [combo.id, combo]
    )
  );
  return meals.map((meal) => {
    const scored = scoredById.get(meal.id) ?? null;
    if (scored) return { meal, scored, blocked: null };
    const allResolve = meal.items.every((item) => lookupNutrition(catalog, item.foodId));
    return { meal, scored: null, blocked: allResolve ? "excluded" : "missing" };
  });
}

// Everything the server also enforces, so the form can explain instead of 400.
export function validateSavedMeal(input: {
  name: string;
  items: BatchCompositionItem[];
  steps: string[];
}): string | null {
  const name = input.name.trim();
  if (!name) return "Yemeğe bir ad ver.";
  if (name.length > SAVED_MEAL_LIMITS.nameMax) {
    return `Ad en fazla ${SAVED_MEAL_LIMITS.nameMax} karakter olabilir.`;
  }
  const items = normalizeComposition(input.items);
  if (items.length === 0) return "En az bir besin ekle.";
  if (items.length > SAVED_MEAL_LIMITS.itemsMax) {
    return `En fazla ${SAVED_MEAL_LIMITS.itemsMax} besin ekleyebilirsin.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Persistence (client <-> api/personal-plan.ts?_resource=saved-meals, exposed
// as /api/saved-meals by a vercel.json rewrite — see that file).

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function fetchSavedMeals(): Promise<SavedMeal[]> {
  try {
    const res = await fetch(apiUrl("/api/saved-meals"), {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) {
      console.warn("[savedMeals] fetch failed:", res.status);
      return [];
    }
    return ((await res.json()) as SavedMealRow[]).map(fromRow);
  } catch (err) {
    console.warn("[savedMeals] fetch threw:", err);
    return [];
  }
}

function toBody(meal: Omit<NewSavedMeal, "id">) {
  return {
    name: meal.name.trim(),
    items: normalizeComposition(meal.items).map((item) => ({
      food_id: item.foodId,
      quantity_g: item.quantityG,
    })),
    steps: meal.steps,
  };
}

export async function createSavedMeal(meal: NewSavedMeal): Promise<SavedMeal | null> {
  try {
    const res = await fetch(apiUrl("/api/saved-meals"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: meal.id, ...toBody(meal) }),
    });
    if (!res.ok) {
      console.warn("[savedMeals] create failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as SavedMealRow);
  } catch (err) {
    console.warn("[savedMeals] create threw:", err);
    return null;
  }
}

export async function updateSavedMeal(
  id: string,
  meal: Omit<NewSavedMeal, "id">
): Promise<SavedMeal | null> {
  try {
    const res = await fetch(apiUrl(`/api/saved-meals?id=${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(meal)),
    });
    if (!res.ok) {
      console.warn("[savedMeals] update failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as SavedMealRow);
  } catch (err) {
    console.warn("[savedMeals] update threw:", err);
    return null;
  }
}

export async function deleteSavedMeal(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/saved-meals?id=${encodeURIComponent(id)}`), {
      method: "DELETE",
    });
    if (!res.ok) {
      console.warn("[savedMeals] delete failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[savedMeals] delete threw:", err);
    return false;
  }
}
