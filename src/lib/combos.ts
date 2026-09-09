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
