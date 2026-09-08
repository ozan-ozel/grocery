import type { PersonalProfile } from "./mealPersonalization";
import {
  migrateLegacyExclusions,
  type FoodExclusion,
  type AllergenClassExclusion,
} from "./foodExclusions";

type PersonalPlanRow = {
  user_id: string;
  name: string;
  equation_sex: string;
  age_years: number;
  height_cm: number;
  weight_kg: number;
  activity: string;
  goal: string;
  waist_cm: number | null;
  excluded_food_ids: string[] | null;
  food_exclusions: FoodExclusion[] | null;
  // Absent on a row saved before supabase/15-personal-plan-allergen-exclusions.sql
  // ran — no legacy predecessor to migrate from, unlike food_exclusions.
  allergen_class_exclusions: AllergenClassExclusion[] | null;
};

function fromRow(row: PersonalPlanRow): PersonalProfile {
  return {
    name: row.name,
    equationSex: row.equation_sex as PersonalProfile["equationSex"],
    ageYears: row.age_years,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    activity: row.activity as PersonalProfile["activity"],
    goal: row.goal as PersonalProfile["goal"],
    waistCm: row.waist_cm ?? undefined,
    // food_exclusions is authoritative once present. A row saved before the
    // 13-personal-plan-food-exclusions.sql migration ran (or backfilled but
    // not yet re-fetched) falls back to migrating the legacy column —
    // same no-silent-downgrade rule as everywhere else this migration
    // touches (Phase 9 §20.11 invariant 10).
    foodExclusions:
      row.food_exclusions ?? migrateLegacyExclusions(row.excluded_food_ids ?? []),
    allergenExclusions: row.allergen_class_exclusions ?? [],
  };
}

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

// Scoped server-side to the logged-in session (no id to pass) — see
// api/personal-plan.ts / netlify/functions/personal-plan.ts.
export async function fetchPersonalPlan(): Promise<PersonalProfile | null> {
  try {
    const res = await fetch(apiUrl("/api/personal-plan"), {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) {
      console.warn("[personalPlan] fetch failed:", res.status);
      return null;
    }
    const row = (await res.json()) as PersonalPlanRow | null;
    return row ? fromRow(row) : null;
  } catch (err) {
    console.warn("[personalPlan] fetch threw:", err);
    return null;
  }
}

export async function savePersonalPlan(profile: PersonalProfile): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/personal-plan"), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        equation_sex: profile.equationSex,
        age_years: profile.ageYears,
        height_cm: profile.heightCm,
        weight_kg: profile.weightKg,
        activity: profile.activity,
        goal: profile.goal,
        waist_cm: profile.waistCm ?? null,
        food_exclusions: profile.foodExclusions,
        allergen_class_exclusions: profile.allergenExclusions,
      }),
    });
    if (!res.ok) {
      console.warn("[personalPlan] save failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[personalPlan] save threw:", err);
    return false;
  }
}
