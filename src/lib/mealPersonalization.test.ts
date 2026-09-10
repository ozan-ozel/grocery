import { describe, expect, it } from "vitest";
import {
  calculateTargets,
  occasionProteinTargetG,
  type PersonalProfile,
} from "./mealPersonalization";

function profile(overrides: Partial<PersonalProfile> = {}): PersonalProfile {
  return {
    name: "Test",
    equationSex: "male",
    ageYears: 30,
    heightCm: 175,
    weightKg: 70,
    activity: "moderate",
    goal: "maintain",
    foodExclusions: [],
    allergenExclusions: [],
    ...overrides,
  };
}

describe("calculateTargets — waterMl (PSM MVP-1 provisional, DEC-046)", () => {
  it("computes baseline fluid as weight * 33 mL/kg", () => {
    const targets = calculateTargets(profile({ weightKg: 70 }));
    expect(targets?.waterMl).toBe(2310);
  });
});

describe("calculateTargets — BMI plausibility warning (PSM MVP-1 provisional, DEC-009)", () => {
  it("does not warn for an ordinary height/weight combination", () => {
    const targets = calculateTargets(profile({ heightCm: 175, weightKg: 70 }));
    expect(targets?.warnings.some(w => w.includes("olağan dışı"))).toBe(false);
  });

  it("warns when height/weight combine into an implausible BMI", () => {
    const targets = calculateTargets(profile({ heightCm: 230, weightKg: 35 }));
    expect(targets?.warnings.some(w => w.includes("olağan dışı"))).toBe(true);
  });
});

describe("occasionProteinTargetG (PSM MVP-1 provisional, DEC-033)", () => {
  it("returns a 0.3-0.4 g/kg band", () => {
    expect(occasionProteinTargetG(70)).toEqual({ min: 21, max: 28 });
  });
});
