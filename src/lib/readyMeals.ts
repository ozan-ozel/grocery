import readyMealsData from "../../data/ready-meals.json";
import type { Meal } from "./meals";

// The curated ready-made meals shown under "Hazır Yemekler". Their ids are
// stored in meal_entries.combo_id and preparation_batches.source_combo_id
// (column names kept from before the rename), so never change an id.

// data/ready-meals.json is hand-authored with snake_case keys (name_tr/food_id/
// prep_minutes — see data/README.md, matching nutrition.json's convention),
// but this module's Meal type and mealMatch.ts consume camelCase. A bare
// `as Meal[]` cast doesn't even typecheck ("neither type sufficiently
// overlaps with the other"), so this is the one place the raw JSON is
// adapted — every consumer (the Yemekler picker, the DEC-069 batch
// planner) imports ALL_READY_MEALS rather than re-parsing the file itself.
type RawReadyMeal = {
  id: string;
  name_tr: string;
  items: { food_id: string; grams: number }[];
  prep_minutes: number;
  tags: string[];
  prep_note?: string;
};

export const ALL_READY_MEALS: Meal[] = (readyMealsData as RawReadyMeal[]).map((raw) => ({
  id: raw.id,
  nameTr: raw.name_tr,
  items: raw.items.map((item) => ({ foodId: item.food_id, grams: item.grams })),
  prepMinutes: raw.prep_minutes,
  tags: raw.tags,
  prepNote: raw.prep_note,
}));

export const READY_MEAL_BY_ID = new Map(ALL_READY_MEALS.map((c) => [c.id, c]));

