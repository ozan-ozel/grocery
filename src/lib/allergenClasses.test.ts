import { describe, expect, it } from "vitest";
import { ALLERGEN_CLASS_IDS, ALLERGEN_CLASS_LABEL_TR } from "./allergenClasses";

// Türkiye/EU 14 — the vocabulary itself. Verified against Turkish Food
// Codex Etiketleme Yönetmeliği (26.01.2017) and EU Regulation 1169/2011
// Annex II, both cross-checked against Turkey's Ministry of Agriculture and
// Forestry's own published list (see the implementation-readiness report).
// This exact set of 14 must never silently grow, shrink, or substitute the
// FDA's 9-major-allergen list.

const EXPECTED_IDS = [
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

describe("ALLERGEN_CLASS_IDS — Türkiye/EU 14, stable and closed", () => {
  it("contains exactly 14 classes", () => {
    expect(ALLERGEN_CLASS_IDS.length).toBe(14);
  });

  it("matches the verified regulatory set exactly, no more, no less", () => {
    expect([...ALLERGEN_CLASS_IDS].sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it("has no duplicate IDs", () => {
    expect(new Set(ALLERGEN_CLASS_IDS).size).toBe(ALLERGEN_CLASS_IDS.length);
  });

  it("does not substitute or include the FDA 9-major-allergen list's distinguishing terms", () => {
    // The FDA's list names "wheat" and "tree nuts" similarly, but also
    // "peanuts" as a distinct top-level item like the EU list — the real
    // discriminator is that FDA has no celery, mustard, sesame(*), sulphites,
    // lupin, or molluscs as one unified category the way the EU/Turkey list
    // does, and folds soybeans/milk/eggs/fish/crustaceans differently.
    // (*FDA added sesame as a 9th major allergen in 2023, which is why count
    // alone can't distinguish the lists — the celery/mustard/sulphites/lupin
    // classes are the load-bearing check: none of these four exist in the
    // FDA list at all.)
    for (const fdaOnly of ["celery", "mustard", "sulphites", "lupin"]) {
      expect(ALLERGEN_CLASS_IDS).toContain(fdaOnly);
    }
  });
});

describe("ALLERGEN_CLASS_LABEL_TR", () => {
  it("has a non-empty Turkish label for every one of the 14 classes", () => {
    for (const id of ALLERGEN_CLASS_IDS) {
      expect(ALLERGEN_CLASS_LABEL_TR[id]).toBeTruthy();
    }
  });

  it("carries no label for a class outside the 14 (no stray/typo keys)", () => {
    expect(Object.keys(ALLERGEN_CLASS_LABEL_TR).length).toBe(14);
  });
});
