// Türkiye/EU 14 regulatory allergen vocabulary — Grocery's sole allergen-class
// taxonomy (human decision, Phase 9 B3 follow-up). Verified against Turkish
// Food Codex Etiketleme Yönetmeliği (26.01.2017, harmonized with EU) and EU
// Regulation 1169/2011 Annex II. Deliberately NOT the FDA 9-major-allergen
// list — do not substitute it.
//
// This is the single source of truth for the 14 canonical IDs. Both
// nutrition.ts (food -> allergen-class mapping) and foodExclusions.ts (user
// allergen-class exclusions) import from here rather than each declaring
// their own vocabulary, so there is exactly one place these 14 values exist.

export type AllergenClassId =
  | "gluten_cereals"
  | "crustaceans"
  | "eggs"
  | "fish"
  | "peanuts"
  | "soybeans"
  | "milk"
  | "tree_nuts"
  | "celery"
  | "mustard"
  | "sesame"
  | "sulphites"
  | "lupin"
  | "molluscs";

export const ALLERGEN_CLASS_IDS: readonly AllergenClassId[] = [
  "gluten_cereals",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soybeans",
  "milk",
  "tree_nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
];

export const ALLERGEN_CLASS_LABEL_TR: Record<AllergenClassId, string> = {
  gluten_cereals: "Gluten içeren tahıllar",
  crustaceans: "Kabuklu deniz ürünleri",
  eggs: "Yumurta",
  fish: "Balık",
  peanuts: "Yer fıstığı",
  soybeans: "Soya",
  milk: "Süt",
  tree_nuts: "Sert kabuklu yemişler",
  celery: "Kereviz",
  mustard: "Hardal",
  sesame: "Susam",
  sulphites: "Kükürt dioksit / sülfitler",
  lupin: "Acı bakla (lupin)",
  molluscs: "Yumuşakçalar",
};

// ---------------------------------------------------------------------------
// Food <-> allergen-class relationship
//
// PRESENT / CONFIRMED_ABSENT / UNKNOWN must stay distinguishable (this
// milestone's own human decision, §3). Represented as: an explicit array
// entry for a class means it was evaluated (present or confirmed_absent);
// the ABSENCE of an entry for a class means UNKNOWN for that class — never
// collapsed into "confirmed absent". A food with no allergen_classes array
// at all is UNKNOWN for all 14 classes, by the same rule.

export type AllergenClassStatus = "present" | "confirmed_absent";

// "regulatory": the food IS (or is a directly-named member of) a class the
// regulation itself names as an example (e.g. almond is named as a tree nut
// in Annex II / the Turkish Codex list) — no inference step.
// "curated": Grocery's own reasonable inference from food composition/
// standard recipe convention (e.g. "beyaz ekmek" is wheat bread) — high
// confidence, but not a literal reading of the regulatory text.
export type AllergenMappingSource = "regulatory" | "curated";

export type AllergenClassMapping = {
  class: AllergenClassId;
  status: AllergenClassStatus;
  source: AllergenMappingSource;
};

export type AllergenClassFoodStatus = AllergenClassStatus | "unknown";

// The one place that reads "does this food's allergen data say anything
// about this class". Absence of a matching entry is UNKNOWN, never inferred
// as confirmed_absent — this is the function every hard/soft enforcement
// check in foodExclusions.ts is built on.
export function allergenClassStatusForFood(
  food: { allergen_classes?: AllergenClassMapping[] },
  allergenClass: AllergenClassId
): AllergenClassFoodStatus {
  const entry = food.allergen_classes?.find((m) => m.class === allergenClass);
  return entry ? entry.status : "unknown";
}
