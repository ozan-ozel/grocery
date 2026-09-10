// Canonical Food Identity resolver — Phase 9 implementation of
// nutrition-curriculum/08_APP_TRANSLATION/CANONICAL_FOOD_IDENTITY_INVESTIGATION.md
// §17's six approved decisions.
//
// This is the one place that answers "which Food is this?" with an explicit
// outcome instead of a guess. It is deliberately NOT a replacement for the
// existing display/search catalog map (useFoodCatalog's NutritionMap) —
// that map stays exact-but-silently-overwriting for display/lookup UX. This
// module additionally DETECTS collisions (a name or alias owned by more
// than one Food) rather than picking a winner, which the existing map never
// needed to do.
//
// Hard rule — this module must never reach for the shopping-catalog's
// edit-distance matcher to establish identity. Only exact,
// Turkish-normalized string equality does. See fuzzyMatch.ts for the
// matcher this rule excludes.
//
// This rule is NOT enforced automatically. It was previously guarded by a
// source-text scan in foodIdentitySafety.test.ts, removed along with the
// rest of the test suite. Breaking it silently reconnects fuzzy matching to
// the allergy/exclusion safety path, so check it by hand when editing here.

import { normalize } from "./categorization/itemCategories";
import type { Nutrition } from "./nutrition";

export type FoodResolution =
  | { status: "resolved"; food: Nutrition }
  | { status: "ambiguous"; candidates: Nutrition[] }
  | { status: "unknown" };

export type FoodIdentityIndex = {
  byId: Map<string, Nutrition>;
  // Multimaps, not Map<string, Nutrition> — a normalized name/alias with
  // more than one owner is exactly the collision decision 4 requires this
  // module to detect and report as AMBIGUOUS, not silently overwrite.
  byName: Map<string, Nutrition[]>;
  byAlias: Map<string, Nutrition[]>;
};

function pushInto(map: Map<string, Nutrition[]>, key: string, food: Nutrition) {
  if (!key) return;
  const list = map.get(key);
  if (list) list.push(food);
  else map.set(key, [food]);
}

// Built from a full food list (useFoodCatalog's browse fetch already
// returns the whole catalog — see CATALOG_LIMIT — so this needs no new
// network call). Cheap enough to rebuild whenever the underlying food list
// changes; callers are expected to memoize per that list, same as
// useFoodCatalog already memoizes its own NutritionMap.
export function buildFoodIdentityIndex(foods: Nutrition[]): FoodIdentityIndex {
  const byId = new Map<string, Nutrition>();
  const byName = new Map<string, Nutrition[]>();
  const byAlias = new Map<string, Nutrition[]>();
  for (const food of foods) {
    if (food.food_id) byId.set(food.food_id, food);
    pushInto(byName, normalize(food.name_tr), food);
    for (const alias of food.aliases ?? []) {
      pushInto(byAlias, normalize(alias), food);
    }
  }
  return { byId, byName, byAlias };
}

// Exact precedence chain, no fuzzy step anywhere:
//   exact food_id -> exact canonical name -> exact uniquely-owned alias
//   -> AMBIGUOUS (more than one owner at whichever step matched)
//   -> UNKNOWN (no match at all).
// A raw, unnormalized `input` is tried as a food_id first (ids are opaque
// and never normalized), then normalized for the name/alias steps.
export function resolveFood(input: string, index: FoodIdentityIndex): FoodResolution {
  const byId = index.byId.get(input);
  if (byId) return { status: "resolved", food: byId };

  const normalized = normalize(input);
  if (!normalized) return { status: "unknown" };

  const nameMatches = index.byName.get(normalized);
  if (nameMatches) {
    if (nameMatches.length === 1) return { status: "resolved", food: nameMatches[0] };
    return { status: "ambiguous", candidates: nameMatches };
  }

  const aliasMatches = index.byAlias.get(normalized);
  if (aliasMatches) {
    if (aliasMatches.length === 1) return { status: "resolved", food: aliasMatches[0] };
    return { status: "ambiguous", candidates: aliasMatches };
  }

  return { status: "unknown" };
}

// Reports every canonical name or alias currently owned by more than one
// Food — the audit decision 4 requires before alias writes are trusted.
// Never picks a winner; that is exactly what this function refuses to do.
export function auditFoodIdentityCollisions(foods: Nutrition[]): {
  nameCollisions: string[];
  aliasCollisions: string[];
} {
  const index = buildFoodIdentityIndex(foods);
  const nameCollisions = [...index.byName.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([key]) => key);
  const aliasCollisions = [...index.byAlias.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([key]) => key);
  return { nameCollisions, aliasCollisions };
}
