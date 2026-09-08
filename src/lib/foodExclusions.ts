// Food-exclusion reason taxonomy — Phase 9 §20 Milestone 1 (post-A1/B3/C2
// ratification). DEC-053 already specifies allergy -> hard exclusion,
// intolerance -> soft constraint, unclear -> safer hard-exclusion treatment;
// DEC-061 adds preference as a weaker, later filter. This module is the one
// place that turns those specified outputs into a concrete tier.
//
// Deliberately NOT included here (Phase 9 §20.12 — still open):
// allergen classes/vocabulary, precedence rules, validity windows. Adding
// any of those is a later milestone, not a reason to touch this file lightly.

export type ExclusionReason =
  | "allergy"
  | "intolerance"
  | "unclear"
  | "preference"
  | "unclassified"; // legacy entry migrated from the old flat list — no
  // reason was ever collected for it, so it is treated exactly as strictly
  // as an allergy until the user reclassifies it. Never auto-resolved to
  // "preference" — that would silently downgrade what might be a real
  // allergy (Phase 9 §20.11 invariant 10).

export type FoodExclusion = {
  foodId: string;
  reason: ExclusionReason;
  createdAt: string;
};

export type ExclusionTier = "hard" | "soft";

// allergy/unclear/unclassified -> hard (filtered out entirely from any
// surface that suggests or logs food for consumption). intolerance -> soft
// (DEC-053's own "soft constraint" — de-prioritise, never disappear).
// preference stays hard: today's shipped behavior already drops a
// preference-excluded food from suggestions, and nothing in this milestone
// requires loosening it — only intolerance's tier is actually changing.
export function tierOf(reason: ExclusionReason): ExclusionTier {
  return reason === "intolerance" ? "soft" : "hard";
}

export function hasHardExclusion(entries: FoodExclusion[], foodId: string): boolean {
  return entries.some((e) => e.foodId === foodId && tierOf(e.reason) === "hard");
}

export function hasSoftConstraint(entries: FoodExclusion[], foodId: string): boolean {
  return entries.some((e) => e.foodId === foodId && tierOf(e.reason) === "soft");
}

// A pre-existing entry from the old `excluded_food_ids text[]` mechanism
// carries no reason at all. Migrating it to "unclassified" preserves
// exactly today's behavior (hard-filtered from suggestions) rather than
// guessing a reason or defaulting to the weakest one.
export function migrateLegacyExclusions(ids: string[]): FoodExclusion[] {
  const createdAt = new Date().toISOString();
  return ids.map((foodId) => ({ foodId, reason: "unclassified", createdAt }));
}

// ---------------------------------------------------------------------------
// B3 (allergen-class exclusion) — data-structure/matching FOUNDATION only.
//
// Phase 9 §20.2's B3 row and the ratification record §7/§8 leave three
// things explicitly open: an allergen vocabulary, per-food allergen
// mapping, and the unmapped-food default policy. None of the three exists
// in this project (checked: the nutrition table's columns, the
// data/nutrition.json row schema, and every supabase/*.sql migration carry
// macros/fiber/provenance only — no allergen field anywhere). Fabricating
// a taxonomy here would misrepresent B3 as enforced when it structurally
// isn't yet.
//
// What follows is deliberately NOT wired into comboMatch.ts, MealFoodPicker,
// or PersonalPlanView: there is no UI to create an AllergenClassExclusion
// and no food ever carries `allergenClasses` today, so wiring it into a
// live filtering path would add complexity for zero real effect while
// implying a protection this milestone cannot yet deliver. This exists so a
// later milestone — once the vocabulary, the mapping data, and the
// unmapped-default decision all exist — has a correct, already-tested shape
// to build on rather than a schema decision made under time pressure then.

export type AllergenClassExclusion = {
  // Opaque — no vocabulary is established. Not validated against a fixed
  // enum on purpose: inventing one here is exactly what this seam must not
  // do.
  allergenClass: string;
  reason: ExclusionReason;
  createdAt: string;
};

// "unmapped" must stay distinct from "confirmed no known allergen classes"
// — the whole point of B3's "make unmapped status explicit" requirement.
// A caller that only checks hasAllergenClassExclusion() and ignores this
// would silently treat every food today as if it were confirmed allergen-
// free, which is the fail-open outcome B3 exists to prevent.
export type AllergenMappingStatus = "mapped" | "unmapped";

export function allergenMappingStatus(
  food: { allergenClasses?: string[] }
): AllergenMappingStatus {
  return food.allergenClasses === undefined ? "unmapped" : "mapped";
}

// True only when the food IS mapped and that mapping intersects a
// hard-tier excluded class. Proven not to fail open when mapping data is
// present (foodExclusions.test.ts); an unmapped food always returns false
// here because there is nothing to match against — callers MUST consult
// allergenMappingStatus separately rather than reading false as "confirmed
// safe" (the unmapped-food default is a human decision this function does
// not make).
export function hasAllergenClassExclusion(
  exclusions: AllergenClassExclusion[],
  food: { allergenClasses?: string[] }
): boolean {
  if (!food.allergenClasses || food.allergenClasses.length === 0) return false;
  const excludedClasses = new Set(
    exclusions
      .filter((e) => tierOf(e.reason) === "hard")
      .map((e) => e.allergenClass)
  );
  return food.allergenClasses.some((c) => excludedClasses.has(c));
}
