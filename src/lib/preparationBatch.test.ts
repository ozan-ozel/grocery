import { describe, expect, it } from "vitest";
import {
  normalizeComposition,
  isValidComposition,
  remainingComposition,
  type BatchCompositionItem,
  type PreparationBatch,
} from "./preparationBatch";

describe("normalizeComposition", () => {
  it("passes through a clean multi-food composition unchanged", () => {
    const items: BatchCompositionItem[] = [
      { foodId: "tavuk göğsü", quantityG: 1000 },
      { foodId: "pirinç", quantityG: 800 },
      { foodId: "brokoli", quantityG: 500 },
    ];
    expect(normalizeComposition(items)).toEqual(items);
  });

  it("merges duplicate foodId entries by summing quantities (exact match only)", () => {
    const items: BatchCompositionItem[] = [
      { foodId: "tavuk göğsü", quantityG: 600 },
      { foodId: "pirinç", quantityG: 800 },
      { foodId: "tavuk göğsü", quantityG: 400 },
    ];
    expect(normalizeComposition(items)).toEqual([
      { foodId: "tavuk göğsü", quantityG: 1000 },
      { foodId: "pirinç", quantityG: 800 },
    ]);
  });

  it("does not merge similar-looking but distinct food references (no fuzzy matching)", () => {
    const items: BatchCompositionItem[] = [
      { foodId: "pirinç", quantityG: 500 },
      { foodId: "Pirinç", quantityG: 500 }, // different casing — a distinct string
    ];
    expect(normalizeComposition(items)).toEqual(items);
  });

  it("drops entries with a non-positive quantity", () => {
    const items: BatchCompositionItem[] = [
      { foodId: "tavuk göğsü", quantityG: 1000 },
      { foodId: "pirinç", quantityG: 0 },
      { foodId: "brokoli", quantityG: -50 },
    ];
    expect(normalizeComposition(items)).toEqual([
      { foodId: "tavuk göğsü", quantityG: 1000 },
    ]);
  });

  it("drops entries with an empty foodId", () => {
    const items: BatchCompositionItem[] = [
      { foodId: "", quantityG: 100 },
      { foodId: "pirinç", quantityG: 100 },
    ];
    expect(normalizeComposition(items)).toEqual([{ foodId: "pirinç", quantityG: 100 }]);
  });

  it("returns an empty array for an all-invalid input", () => {
    expect(normalizeComposition([{ foodId: "", quantityG: -1 }])).toEqual([]);
  });
});

describe("isValidComposition", () => {
  it("rejects an empty composition", () => {
    expect(isValidComposition([])).toBe(false);
  });

  it("accepts a composition with at least one item", () => {
    expect(isValidComposition([{ foodId: "pirinç", quantityG: 100 }])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// remainingComposition — the required worked example and its edge cases.

const BATCH_A: Pick<PreparationBatch, "composition"> = {
  composition: [
    { foodId: "tavuk göğsü", quantityG: 1000 },
    { foodId: "pirinç", quantityG: 800 },
    { foodId: "brokoli", quantityG: 500 },
  ],
};

describe("remainingComposition — required worked example", () => {
  it("computes 600/480/300 remaining after two 200/160/100g allocations", () => {
    const remaining = remainingComposition(BATCH_A, [
      { foodId: "tavuk göğsü", quantityG: 200 },
      { foodId: "pirinç", quantityG: 160 },
      { foodId: "brokoli", quantityG: 100 },
      { foodId: "tavuk göğsü", quantityG: 200 },
      { foodId: "pirinç", quantityG: 160 },
      { foodId: "brokoli", quantityG: 100 },
    ]);
    expect(remaining).toEqual([
      { foodId: "tavuk göğsü", quantityG: 1000, remainingG: 600 },
      { foodId: "pirinç", quantityG: 800, remainingG: 480 },
      { foodId: "brokoli", quantityG: 500, remainingG: 300 },
    ]);
  });
});

describe("remainingComposition — edge cases", () => {
  it("returns the full composition when there are no allocations", () => {
    const remaining = remainingComposition(BATCH_A, []);
    expect(remaining.map((r) => r.remainingG)).toEqual([1000, 800, 500]);
  });

  it("handles a single allocation against one food only", () => {
    const remaining = remainingComposition(BATCH_A, [
      { foodId: "pirinç", quantityG: 300 },
    ]);
    const rice = remaining.find((r) => r.foodId === "pirinç");
    const chicken = remaining.find((r) => r.foodId === "tavuk göğsü");
    expect(rice?.remainingG).toBe(500);
    expect(chicken?.remainingG).toBe(1000);
  });

  it("reaches exactly zero on full consumption", () => {
    const remaining = remainingComposition(BATCH_A, [
      { foodId: "tavuk göğsü", quantityG: 1000 },
      { foodId: "pirinç", quantityG: 800 },
      { foodId: "brokoli", quantityG: 500 },
    ]);
    expect(remaining.every((r) => r.remainingG === 0)).toBe(true);
  });

  it("does not clamp or hide over-allocation — surfaces a negative remainder", () => {
    const remaining = remainingComposition(BATCH_A, [
      { foodId: "tavuk göğsü", quantityG: 1200 },
    ]);
    const chicken = remaining.find((r) => r.foodId === "tavuk göğsü");
    expect(chicken?.remainingG).toBe(-200);
  });

  it("ignores allocations for a food not in this batch's composition", () => {
    const remaining = remainingComposition(BATCH_A, [
      { foodId: "somon", quantityG: 200 }, // unrelated to Batch A entirely
    ]);
    expect(remaining.map((r) => r.remainingG)).toEqual([1000, 800, 500]);
  });

  it("sums many allocations across what would be multiple dates/meal entries", () => {
    const many = Array.from({ length: 5 }, () => ({
      foodId: "tavuk göğsü",
      quantityG: 150,
    }));
    const remaining = remainingComposition(BATCH_A, many);
    const chicken = remaining.find((r) => r.foodId === "tavuk göğsü");
    expect(chicken?.remainingG).toBe(1000 - 5 * 150);
  });

  it("handles an empty composition (no batch content) without throwing", () => {
    expect(remainingComposition({ composition: [] }, [{ foodId: "x", quantityG: 1 }])).toEqual([]);
  });
});
