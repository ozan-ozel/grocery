import { describe, expect, it } from "vitest";
import {
  hasHardExclusion,
  hasSoftConstraint,
  allergenMappingStatus,
  hasAllergenClassExclusion,
  migrateLegacyExclusions,
  tierOf,
  type ExclusionReason,
} from "./foodExclusions";

describe("tierOf", () => {
  it("classifies allergy, unclear, unclassified, and preference as hard", () => {
    const hard: ExclusionReason[] = ["allergy", "unclear", "unclassified", "preference"];
    for (const reason of hard) {
      expect(tierOf(reason)).toBe("hard");
    }
  });

  it("classifies intolerance as soft — DEC-053's own split", () => {
    expect(tierOf("intolerance")).toBe("soft");
  });
});

describe("hasHardExclusion / hasSoftConstraint", () => {
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

  it("fails closed for a food id with no matching entry", () => {
    expect(hasHardExclusion(entries, "muz")).toBe(false);
    expect(hasSoftConstraint(entries, "muz")).toBe(false);
  });
});

describe("migrateLegacyExclusions", () => {
  it("never produces reason \"preference\" — an allergy must not be silently downgraded", () => {
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

describe("preference vs. safety-tier exclusions (Phase 9 §20 Milestone 1)", () => {
  it("keeps reason distinguishable even though preference and allergy share today's hard tier", () => {
    // Today's shipped behavior gives preference and allergy the same tier
    // (both hard) — foodExclusions.ts documents this as a deliberate,
    // unchanged-from-today choice, not an oversight. What must never
    // regress is that the *reason* stays on the entry regardless, so a
    // later milestone can differentiate them without a data migration.
    const entries = [
      { foodId: "brokoli", reason: "preference" as const, createdAt: new Date().toISOString() },
      { foodId: "yer fıstığı", reason: "allergy" as const, createdAt: new Date().toISOString() },
    ];
    expect(entries.find((e) => e.foodId === "brokoli")?.reason).toBe("preference");
    expect(entries.find((e) => e.foodId === "yer fıstığı")?.reason).toBe("allergy");
    expect(tierOf("preference")).toBe(tierOf("allergy"));
  });
});

describe("allergenMappingStatus — B3 foundation", () => {
  it("reports \"unmapped\" for a food with no allergenClasses field", () => {
    expect(allergenMappingStatus({})).toBe("unmapped");
  });

  it("reports \"mapped\" for a food with a confirmed-empty allergenClasses list", () => {
    // [] is a real, confirmed answer ("checked, carries none") — must not
    // collapse into the same state as "never checked."
    expect(allergenMappingStatus({ allergenClasses: [] })).toBe("mapped");
  });

  it("reports \"mapped\" for a food with populated allergenClasses", () => {
    expect(allergenMappingStatus({ allergenClasses: ["tree_nut"] })).toBe("mapped");
  });
});

describe("hasAllergenClassExclusion — B3 foundation", () => {
  const now = new Date().toISOString();

  it("does not fail open when the food IS mapped and the class is excluded", () => {
    const exclusions = [{ allergenClass: "tree_nut", reason: "allergy" as const, createdAt: now }];
    expect(hasAllergenClassExclusion(exclusions, { allergenClasses: ["tree_nut"] })).toBe(true);
  });

  it("matches on any one of several mapped classes", () => {
    const exclusions = [{ allergenClass: "shellfish", reason: "allergy" as const, createdAt: now }];
    expect(
      hasAllergenClassExclusion(exclusions, { allergenClasses: ["tree_nut", "shellfish"] })
    ).toBe(true);
  });

  it("does not match a mapped food whose classes don't intersect the exclusion", () => {
    const exclusions = [{ allergenClass: "shellfish", reason: "allergy" as const, createdAt: now }];
    expect(hasAllergenClassExclusion(exclusions, { allergenClasses: ["tree_nut"] })).toBe(false);
  });

  it("only matches on hard-tier reasons, same split as tierOf", () => {
    const exclusions = [{ allergenClass: "tree_nut", reason: "intolerance" as const, createdAt: now }];
    expect(hasAllergenClassExclusion(exclusions, { allergenClasses: ["tree_nut"] })).toBe(false);
  });

  it("explicitly handles unmapped allergen data — never matches, and this is not a safety claim", () => {
    const exclusions = [{ allergenClass: "tree_nut", reason: "allergy" as const, createdAt: now }];
    // No allergenClasses field at all — unmapped, not "confirmed clear".
    const unmappedFood = {};
    expect(hasAllergenClassExclusion(exclusions, unmappedFood)).toBe(false);
    // The caller's obligation: check mapping status separately rather than
    // reading the false above as "this food is safe".
    expect(allergenMappingStatus(unmappedFood)).toBe("unmapped");
  });
});
