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

export function hasHardExclusion(
  entries: FoodExclusion[],
  foodId: string,
): boolean {
  return entries.some(e => e.foodId === foodId && tierOf(e.reason) === "hard");
}

export function hasSoftConstraint(
  entries: FoodExclusion[],
  foodId: string,
): boolean {
  return entries.some(e => e.foodId === foodId && tierOf(e.reason) === "soft");
}

// A pre-existing entry from the old `excluded_food_ids text[]` mechanism
// carries no reason at all. Migrating it to "unclassified" preserves
// exactly today's behavior (hard-filtered from suggestions) rather than
// guessing a reason or defaulting to the weakest one.
export function migrateLegacyExclusions(ids: string[]): FoodExclusion[] {
  const createdAt = new Date().toISOString();
  return ids.map(foodId => ({ foodId, reason: "unclassified", createdAt }));
}

// ---------------------------------------------------------------------------
// B3 (allergen-class exclusion) — live enforcement.
//
// Human decisions now authoritative (this milestone, superseding the earlier
// foundation-only pass): the vocabulary is fixed to the Türkiye/EU 14
// (src/lib/allergenClasses.ts), and UNKNOWN mapping status escalates
// conservatively — an allergen-class exclusion at hard tier (allergy/
// unclear/unclassified) blocks a food whose status for that class is either
// PRESENT or UNKNOWN, and only lets it through when a curator has actively
// confirmed CONFIRMED_ABSENT. This is the one rule that makes B3's binding
// invariant real: an unmapped food must never silently bypass a
// safety-relevant allergen-class exclusion.
//
// Soft tier (intolerance, A1) only escalates on a confirmed PRESENT match —
// UNKNOWN doesn't need the same conservatism for a restriction the user
// already chose as non-hard.

import {
  allergenClassStatusForFood,
  type AllergenClassId,
} from "./allergenClasses";

export type AllergenClassExclusion = {
  allergenClass: AllergenClassId;
  reason: ExclusionReason;
  createdAt: string;
};

// A class-level exclusion is a set-like choice: re-adding a class replaces
// its existing entry, while entries for other classes remain independent.
export function upsertAllergenClassExclusion(
  exclusions: AllergenClassExclusion[],
  entry: AllergenClassExclusion,
): AllergenClassExclusion[] {
  return [
    ...exclusions.filter(
      exclusion => exclusion.allergenClass !== entry.allergenClass,
    ),
    entry,
  ];
}

type AllergenAwareFood = Parameters<typeof allergenClassStatusForFood>[0];

// Blocks on PRESENT or UNKNOWN, never on CONFIRMED_ABSENT — the
// conservative-escalation rule stated above. This is the function that
// makes "an allergen-class safety exclusion must not be defeated by a
// food-level allow or omission" (the B3 binding rule) actually hold: a food
// with no mapping data at all is UNKNOWN for every class, so it is blocked
// by any active hard-tier class exclusion exactly like a confirmed match.
export function hasHardAllergenClassExclusion(
  exclusions: AllergenClassExclusion[],
  food: AllergenAwareFood,
): boolean {
  return exclusions
    .filter(e => tierOf(e.reason) === "hard")
    .some(
      e =>
        allergenClassStatusForFood(food, e.allergenClass) !==
        "confirmed_absent",
    );
}

// Only a confirmed PRESENT match flags a soft conflict.
export function hasSoftAllergenClassConstraint(
  exclusions: AllergenClassExclusion[],
  food: AllergenAwareFood,
): boolean {
  return exclusions
    .filter(e => tierOf(e.reason) === "soft")
    .some(e => allergenClassStatusForFood(food, e.allergenClass) === "present");
}
