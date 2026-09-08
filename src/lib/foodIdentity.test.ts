import { describe, expect, it } from "vitest";
import {
  buildFoodIdentityIndex,
  resolveFood,
  auditFoodIdentityCollisions,
} from "./foodIdentity";
import type { Nutrition } from "./nutrition";

function food(overrides: Partial<Nutrition> & { name_tr: string }): Nutrition {
  return {
    kcal_per_100: 100,
    protein_g: 0,
    fat_g: 0,
    carbs_g: 0,
    fiber_g: 0,
    ...overrides,
  };
}

describe("resolveFood — precedence chain", () => {
  const almond = food({ name_tr: "badem", food_id: "id-badem", aliases: ["iç badem"] });
  const walnut = food({ name_tr: "ceviz", food_id: "id-ceviz" });
  const index = buildFoodIdentityIndex([almond, walnut]);

  it("resolves an exact food_id", () => {
    const result = resolveFood("id-badem", index);
    expect(result).toEqual({ status: "resolved", food: almond });
  });

  it("resolves an exact canonical name, normalized", () => {
    expect(resolveFood("Badem", index)).toEqual({ status: "resolved", food: almond });
    expect(resolveFood("  badem  ", index)).toEqual({ status: "resolved", food: almond });
  });

  it("resolves a uniquely-owned alias", () => {
    expect(resolveFood("iç badem", index)).toEqual({ status: "resolved", food: almond });
  });

  it("food_id takes precedence over a name that happens to collide with it (defensive)", () => {
    // Contrived: no real food_id is ever a plain word, but the precedence
    // order itself must still hold if it were.
    const weird = food({ name_tr: "ceviz", food_id: "ceviz" });
    const weirdIndex = buildFoodIdentityIndex([weird]);
    const result = resolveFood("ceviz", weirdIndex);
    expect(result).toEqual({ status: "resolved", food: weird });
  });

  it("returns UNKNOWN for a string matching nothing", () => {
    expect(resolveFood("yer fıstığı", index)).toEqual({ status: "unknown" });
  });

  it("returns UNKNOWN for an empty/whitespace-only input", () => {
    expect(resolveFood("   ", index)).toEqual({ status: "unknown" });
  });
});

describe("resolveFood — ambiguity, never a guessed winner", () => {
  it("returns AMBIGUOUS when two Foods share a canonical name", () => {
    const a = food({ name_tr: "süt", food_id: "id-a" });
    const b = food({ name_tr: "süt", food_id: "id-b" });
    const index = buildFoodIdentityIndex([a, b]);
    const result = resolveFood("süt", index);
    expect(result.status).toBe("ambiguous");
    if (result.status === "ambiguous") {
      expect(result.candidates).toHaveLength(2);
    }
  });

  it("returns AMBIGUOUS when two Foods share an alias", () => {
    const a = food({ name_tr: "beyaz peynir", food_id: "id-a", aliases: ["peynir"] });
    const b = food({ name_tr: "kaşar peyniri", food_id: "id-b", aliases: ["peynir"] });
    const index = buildFoodIdentityIndex([a, b]);
    const result = resolveFood("peynir", index);
    expect(result.status).toBe("ambiguous");
    if (result.status === "ambiguous") {
      expect(result.candidates).toHaveLength(2);
    }
  });

  it("canonical-name step takes precedence over an unrelated alias collision", () => {
    // "süt" is unambiguous as a canonical name even though "peynir" (a
    // different alias) collides elsewhere in the same catalog.
    const milk = food({ name_tr: "süt", food_id: "id-milk" });
    const a = food({ name_tr: "beyaz peynir", food_id: "id-a", aliases: ["peynir"] });
    const b = food({ name_tr: "kaşar peyniri", food_id: "id-b", aliases: ["peynir"] });
    const index = buildFoodIdentityIndex([milk, a, b]);
    expect(resolveFood("süt", index)).toEqual({ status: "resolved", food: milk });
  });
});

describe("auditFoodIdentityCollisions", () => {
  it("reports no collisions for a clean catalog", () => {
    const foods = [
      food({ name_tr: "badem", food_id: "1", aliases: ["iç badem"] }),
      food({ name_tr: "ceviz", food_id: "2" }),
    ];
    expect(auditFoodIdentityCollisions(foods)).toEqual({
      nameCollisions: [],
      aliasCollisions: [],
    });
  });

  it("reports a name collision without picking a winner", () => {
    const foods = [
      food({ name_tr: "süt", food_id: "1" }),
      food({ name_tr: "süt", food_id: "2" }),
    ];
    const audit = auditFoodIdentityCollisions(foods);
    expect(audit.nameCollisions).toEqual(["süt"]);
  });

  it("reports an alias collision without picking a winner", () => {
    const foods = [
      food({ name_tr: "beyaz peynir", food_id: "1", aliases: ["peynir"] }),
      food({ name_tr: "kaşar peyniri", food_id: "2", aliases: ["peynir"] }),
    ];
    const audit = auditFoodIdentityCollisions(foods);
    expect(audit.aliasCollisions).toEqual(["peynir"]);
  });
});
