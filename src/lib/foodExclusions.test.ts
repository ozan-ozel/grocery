import { describe, expect, it } from "vitest";
import {
  hasHardExclusion,
  hasSoftConstraint,
  hasHardAllergenClassExclusion,
  hasSoftAllergenClassConstraint,
  migrateLegacyExclusions,
  upsertAllergenClassExclusion,
  tierOf,
  type ExclusionReason,
  type AllergenClassExclusion,
} from "./foodExclusions";
import {
  allergenClassStatusForFood,
  type AllergenClassMapping,
} from "./allergenClasses";

describe("tierOf", () => {
  it("classifies allergy, unclear, unclassified, and preference as hard", () => {
    const hard: ExclusionReason[] = [
      "allergy",
      "unclear",
      "unclassified",
      "preference",
    ];
    for (const reason of hard) {
      expect(tierOf(reason)).toBe("hard");
    }
  });

  it("classifies intolerance as soft — DEC-053's own split", () => {
    expect(tierOf("intolerance")).toBe("soft");
  });
});

describe("hasHardExclusion / hasSoftConstraint (food-level)", () => {
  const now = new Date().toISOString();
  const entries = [
    { foodId: "yer fıstığı", reason: "allergy" as const, createdAt: now },
    { foodId: "süt", reason: "intolerance" as const, createdAt: now },
    { foodId: "brokoli", reason: "preference" as const, createdAt: now },
  ];

  it("reports a hard match for an allergy entry", () => {
    expect(hasHardExclusion(entries, "yer fıstığı")).toBe(true);
    expect(hasSoftConstraint(entries, "yer fıstığı")).toBe(false);
  });

  it("reports a soft match for an intolerance entry, never hard", () => {
    expect(hasSoftConstraint(entries, "süt")).toBe(true);
    expect(hasHardExclusion(entries, "süt")).toBe(false);
  });

  it("reports a hard match for a preference entry (unchanged from today)", () => {
    expect(hasHardExclusion(entries, "brokoli")).toBe(true);
  });

  it("does not exclude an unrelated food with no matching entry", () => {
    expect(hasHardExclusion(entries, "muz")).toBe(false);
    expect(hasSoftConstraint(entries, "muz")).toBe(false);
  });
});

describe("migrateLegacyExclusions", () => {
  it('never produces reason "preference" — an allergy must not be silently downgraded', () => {
    const migrated = migrateLegacyExclusions(["yer fıstığı", "süt", "brokoli"]);
    for (const entry of migrated) {
      expect(entry.reason).toBe("unclassified");
    }
  });

  it("preserves today's hard-exclusion behavior for every migrated id", () => {
    const migrated = migrateLegacyExclusions(["yer fıstığı"]);
    expect(hasHardExclusion(migrated, "yer fıstığı")).toBe(true);
  });

  it("stamps a real createdAt on every entry", () => {
    const migrated = migrateLegacyExclusions(["süt"]);
    expect(migrated[0].createdAt).toBeTruthy();
    expect(() => new Date(migrated[0].createdAt)).not.toThrow();
  });
});

describe("preference vs. safety-tier exclusions — existing semantics preserved", () => {
  it("keeps reason distinguishable even though preference and allergy share today's hard tier", () => {
    const entries = [
      {
        foodId: "brokoli",
        reason: "preference" as const,
        createdAt: new Date().toISOString(),
      },
      {
        foodId: "yer fıstığı",
        reason: "allergy" as const,
        createdAt: new Date().toISOString(),
      },
    ];
    expect(entries.find(e => e.foodId === "brokoli")?.reason).toBe(
      "preference",
    );
    expect(entries.find(e => e.foodId === "yer fıstığı")?.reason).toBe(
      "allergy",
    );
    expect(tierOf("preference")).toBe(tierOf("allergy"));
  });

  it("intolerance stays soft, allergy stays hard — A1 unchanged", () => {
    expect(tierOf("intolerance")).toBe("soft");
    expect(tierOf("allergy")).toBe("hard");
    expect(tierOf("unclear")).toBe("hard");
  });
});

// ---------------------------------------------------------------------------
// Allergen-class (B3) — canonical vocabulary, tri-state status, conservative
// UNKNOWN escalation.

function mapping(entries: AllergenClassMapping[]) {
  return { allergen_classes: entries };
}

describe("allergenClassStatusForFood — tri-state", () => {
  it('reports "unknown" for a food with no allergen_classes field at all', () => {
    expect(allergenClassStatusForFood({}, "tree_nuts")).toBe("unknown");
  });

  it('reports "unknown" for a class not present in an otherwise-populated array', () => {
    const food = mapping([
      { class: "milk", status: "present", source: "curated" },
    ]);
    expect(allergenClassStatusForFood(food, "tree_nuts")).toBe("unknown");
  });

  it('reports "present" for an explicitly present class', () => {
    const food = mapping([
      { class: "tree_nuts", status: "present", source: "regulatory" },
    ]);
    expect(allergenClassStatusForFood(food, "tree_nuts")).toBe("present");
  });

  it('reports "confirmed_absent" only when explicitly recorded, never inferred', () => {
    const food = mapping([
      {
        class: "gluten_cereals",
        status: "confirmed_absent",
        source: "regulatory",
      },
    ]);
    expect(allergenClassStatusForFood(food, "gluten_cereals")).toBe(
      "confirmed_absent",
    );
  });
});

describe("hasHardAllergenClassExclusion — conservative UNKNOWN escalation", () => {
  const now = new Date().toISOString();

  it("blocks a food whose class status is PRESENT (does not fail open)", () => {
    const exclusions: AllergenClassExclusion[] = [
      { allergenClass: "tree_nuts", reason: "allergy", createdAt: now },
    ];
    const almond = mapping([
      { class: "tree_nuts", status: "present", source: "regulatory" },
    ]);
    expect(hasHardAllergenClassExclusion(exclusions, almond)).toBe(true);
  });

  it("blocks a food with UNKNOWN status for the excluded class — cannot silently bypass", () => {
    const exclusions: AllergenClassExclusion[] = [
      { allergenClass: "tree_nuts", reason: "allergy", createdAt: now },
    ];
    // No mapping data at all for this food — must not be treated as safe.
    expect(hasHardAllergenClassExclusion(exclusions, {})).toBe(true);
  });

  it("lets through only a food explicitly confirmed_absent for the excluded class", () => {
    const exclusions: AllergenClassExclusion[] = [
      { allergenClass: "gluten_cereals", reason: "allergy", createdAt: now },
    ];
    const rice = mapping([
      {
        class: "gluten_cereals",
        status: "confirmed_absent",
        source: "regulatory",
      },
    ]);
    expect(hasHardAllergenClassExclusion(exclusions, rice)).toBe(false);
  });

  it("blocks on unclear/unclassified reasons the same as allergy (hard tier)", () => {
    const unclear: AllergenClassExclusion[] = [
      { allergenClass: "milk", reason: "unclear", createdAt: now },
    ];
    expect(hasHardAllergenClassExclusion(unclear, {})).toBe(true);
  });

  it("does not block on a soft-tier (intolerance) allergen-class entry", () => {
    const soft: AllergenClassExclusion[] = [
      { allergenClass: "milk", reason: "intolerance", createdAt: now },
    ];
    const yogurt = mapping([
      { class: "milk", status: "present", source: "curated" },
    ]);
    expect(hasHardAllergenClassExclusion(soft, yogurt)).toBe(false);
  });

  it("does not exclude a food explicitly confirmed_absent for the excluded class, even if other classes are unrelated", () => {
    const exclusions: AllergenClassExclusion[] = [
      { allergenClass: "peanuts", reason: "allergy", createdAt: now },
    ];
    // Rice must carry an EXPLICIT confirmed_absent for "peanuts" itself to
    // pass — a confirmed_absent entry for a DIFFERENT class (gluten_cereals)
    // says nothing about peanuts, which is UNKNOWN and therefore correctly
    // blocks (see the UNKNOWN-escalation test above). This is the same
    // per-class granularity in action, just proving the opposite corner.
    const rice = mapping([
      {
        class: "gluten_cereals",
        status: "confirmed_absent",
        source: "regulatory",
      },
      { class: "peanuts", status: "confirmed_absent", source: "curated" },
    ]);
    expect(hasHardAllergenClassExclusion(exclusions, rice)).toBe(false);
  });
});

describe("hasSoftAllergenClassConstraint — intolerance stays soft, A1 unchanged", () => {
  const now = new Date().toISOString();

  it("flags only a confirmed PRESENT match", () => {
    const exclusions: AllergenClassExclusion[] = [
      { allergenClass: "milk", reason: "intolerance", createdAt: now },
    ];
    const yogurt = mapping([
      { class: "milk", status: "present", source: "curated" },
    ]);
    expect(hasSoftAllergenClassConstraint(exclusions, yogurt)).toBe(true);
  });

  it("does not flag UNKNOWN — soft tier doesn't need hard tier's escalation", () => {
    const exclusions: AllergenClassExclusion[] = [
      { allergenClass: "milk", reason: "intolerance", createdAt: now },
    ];
    expect(hasSoftAllergenClassConstraint(exclusions, {})).toBe(false);
  });

  it("does not flag confirmed_absent", () => {
    const exclusions: AllergenClassExclusion[] = [
      {
        allergenClass: "gluten_cereals",
        reason: "intolerance",
        createdAt: now,
      },
    ];
    const rice = mapping([
      {
        class: "gluten_cereals",
        status: "confirmed_absent",
        source: "regulatory",
      },
    ]);
    expect(hasSoftAllergenClassConstraint(exclusions, rice)).toBe(false);
  });

  it("ignores hard-tier entries — a soft check never reports a hard-tier match", () => {
    const exclusions: AllergenClassExclusion[] = [
      { allergenClass: "tree_nuts", reason: "allergy", createdAt: now },
    ];
    const almond = mapping([
      { class: "tree_nuts", status: "present", source: "regulatory" },
    ]);
    expect(hasSoftAllergenClassConstraint(exclusions, almond)).toBe(false);
  });
});

describe("food-level vs. allergen-class exclusions are not interchangeable", () => {
  it("a food-level exclusion on one food does not exclude a different food via its class", () => {
    const now = new Date().toISOString();
    const foodLevel = [
      { foodId: "badem", reason: "allergy" as const, createdAt: now },
    ];
    // "ceviz" (walnut) is a different food, also a tree nut, but was never
    // itself excluded at the food level.
    expect(hasHardExclusion(foodLevel, "ceviz")).toBe(false);
  });

  it("an allergen-class exclusion does not require a matching food-level entry to block", () => {
    const now = new Date().toISOString();
    const classLevel: AllergenClassExclusion[] = [
      { allergenClass: "tree_nuts", reason: "allergy", createdAt: now },
    ];
    const walnut = mapping([
      { class: "tree_nuts", status: "present", source: "regulatory" },
    ]);
    // No food-level exclusion exists for "ceviz" at all — the class-level
    // one is sufficient and independent (B3's binding rule).
    expect(hasHardAllergenClassExclusion(classLevel, walnut)).toBe(true);
  });
});

describe("allergen-class exclusion updates", () => {
  it("replaces a removed-and-re-added class without collapsing other classes", () => {
    const first: AllergenClassExclusion = {
      allergenClass: "tree_nuts",
      reason: "allergy",
      createdAt: "2026-09-08T00:00:00.000Z",
    };
    const milk: AllergenClassExclusion = {
      allergenClass: "milk",
      reason: "intolerance",
      createdAt: "2026-09-08T00:01:00.000Z",
    };
    const readded: AllergenClassExclusion = {
      allergenClass: "tree_nuts",
      reason: "unclear",
      createdAt: "2026-09-08T00:02:00.000Z",
    };

    const afterAdd = upsertAllergenClassExclusion([], first);
    const withMilk = upsertAllergenClassExclusion(afterAdd, milk);
    const afterRemove = withMilk.filter(
      entry => entry.allergenClass !== "tree_nuts",
    );
    const afterReadd = upsertAllergenClassExclusion(afterRemove, readded);

    expect(afterReadd).toEqual([milk, readded]);
    expect(
      afterReadd.filter(entry => entry.allergenClass === "tree_nuts"),
    ).toHaveLength(1);
    expect(
      afterReadd.filter(entry => entry.allergenClass === "milk"),
    ).toHaveLength(1);
  });
});
