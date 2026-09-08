import { describe, expect, it } from "vitest";
import { lookupNutrition, type Nutrition, type NutritionMap } from "./nutrition";

// Deterministic canonical Food identity + alias resolution (Phase 9 §20
// Milestone 1, food-identity foundation). name_tr (normalized: trim +
// tr-TR lowercase — see categorization/itemCategories.ts's normalize) is
// the canonical identity; aliases are exact, explicitly-recorded alternate
// spellings mapped to the SAME Nutrition object — never computed by edit
// distance. This is what makes the mechanism safe to reuse for exclusion
// identity: resolution is a deterministic key lookup, not a similarity
// score.

function food(name_tr: string, aliases?: string[]): Nutrition {
  return {
    name_tr,
    kcal_per_100: 100,
    protein_g: 1,
    fat_g: 1,
    carbs_g: 1,
    fiber_g: 1,
    aliases,
  };
}

// Mirrors how fetchNutrition/useFoodCatalog build a NutritionMap: every
// alias points at the identical object as the canonical name_tr, never a
// copy — so `===` identity holds across every spelling of one food.
function buildMap(rows: Nutrition[]): NutritionMap {
  const map: NutritionMap = new Map();
  for (const row of rows) {
    map.set(row.name_tr, row);
    for (const alias of row.aliases ?? []) map.set(alias, row);
  }
  return map;
}

describe("lookupNutrition — canonical identity", () => {
  it("resolves the exact canonical name_tr", () => {
    const map = buildMap([food("süt")]);
    expect(lookupNutrition(map, "süt")?.name_tr).toBe("süt");
  });

  it("is deterministic across whitespace/case — normalize(), not fuzzy matching", () => {
    const map = buildMap([food("süt")]);
    expect(lookupNutrition(map, "  Süt  ")?.name_tr).toBe("süt");
    expect(lookupNutrition(map, "SÜT")?.name_tr).toBe("süt");
  });

  it("does not resolve an unrelated name, even a visually close one", () => {
    // "sut" (no ü) is a different string after normalize() — proving this
    // is exact-normalized-match, not edit-distance tolerant.
    const map = buildMap([food("süt")]);
    expect(lookupNutrition(map, "sut")).toBeUndefined();
  });

  it("returns undefined for a food that was never added", () => {
    const map = buildMap([food("süt")]);
    expect(lookupNutrition(map, "muz")).toBeUndefined();
  });
});

describe("lookupNutrition — alias resolution", () => {
  it("resolves an alias to the same canonical Nutrition object as name_tr", () => {
    const row = food("süt", ["tam yağlı süt"]);
    const map = buildMap([row]);
    const byCanonical = lookupNutrition(map, "süt");
    const byAlias = lookupNutrition(map, "tam yağlı süt");
    expect(byAlias).toBe(byCanonical); // same object, not just equal fields
    expect(byAlias?.name_tr).toBe("süt");
  });

  it("resolves each of several aliases to the same row", () => {
    const row = food("yer fıstığı", ["fıstık ezmesi", "peanut"]);
    const map = buildMap([row]);
    expect(lookupNutrition(map, "fıstık ezmesi")?.name_tr).toBe("yer fıstığı");
    expect(lookupNutrition(map, "peanut")?.name_tr).toBe("yer fıstığı");
  });

  it("does not let an alias collide silently with an unrelated food's canonical name", () => {
    const milk = food("süt");
    const almond = food("badem", ["süt ürünü değil"]); // deliberately not "süt"
    const map = buildMap([milk, almond]);
    expect(lookupNutrition(map, "süt")?.name_tr).toBe("süt");
    expect(lookupNutrition(map, "süt ürünü değil")?.name_tr).toBe("badem");
  });
});
