import { describe, expect, it } from "vitest";
import { scoreAllCombos } from "./comboMatch";
import type { Combo } from "./combos";
import type { Nutrition, NutritionMap } from "./nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "./foodExclusions";
import type { AllergenClassMapping } from "./allergenClasses";

function food(
  name_tr: string,
  protein_g: number,
  allergen_classes?: AllergenClassMapping[]
): Nutrition {
  return { name_tr, kcal_per_100: 100, protein_g, fat_g: 5, carbs_g: 10, fiber_g: 2, allergen_classes };
}

const present = (cls: AllergenClassMapping["class"]): AllergenClassMapping[] => [
  { class: cls, status: "present", source: "regulatory" },
];

// Every mapped fixture food below carries an EXPLICIT status (present or
// confirmed_absent) for every one of the three classes these tests exercise
// (tree_nuts / milk / gluten_cereals) — deliberately, so a test asserting
// "this combo survives exclusion X" is proving that confirmed_absent lets a
// food through, never accidentally relying on an unrelated class being
// silently UNKNOWN (which would fail closed under this milestone's own
// escalation policy — see the dedicated UNKNOWN-escalation tests below,
// which use "sosis" specifically because it has NO mapping at all).
const CATALOG: NutritionMap = new Map(
  [
    food("tavuk göğsü", 30, [
      { class: "tree_nuts", status: "confirmed_absent", source: "curated" },
      { class: "milk", status: "confirmed_absent", source: "curated" },
      { class: "gluten_cereals", status: "confirmed_absent", source: "curated" },
    ]),
    food("pirinç", 3, [
      { class: "gluten_cereals", status: "confirmed_absent", source: "regulatory" },
      { class: "tree_nuts", status: "confirmed_absent", source: "curated" },
      { class: "milk", status: "confirmed_absent", source: "curated" },
    ]),
    food("badem", 20, present("tree_nuts")),
    food("ceviz", 15, present("tree_nuts")),
    food("yoğurt", 10, [
      { class: "milk", status: "present", source: "curated" },
      { class: "tree_nuts", status: "confirmed_absent", source: "curated" },
      { class: "gluten_cereals", status: "confirmed_absent", source: "curated" },
    ]),
    food("makarna", 12, [
      { class: "gluten_cereals", status: "present", source: "curated" },
      { class: "tree_nuts", status: "confirmed_absent", source: "curated" },
      { class: "milk", status: "confirmed_absent", source: "curated" },
    ]),
    // Composite food carrying TWO allergen classes at once.
    food("peynirli makarna", 14, [
      { class: "gluten_cereals", status: "present", source: "curated" },
      { class: "milk", status: "present", source: "curated" },
      { class: "tree_nuts", status: "confirmed_absent", source: "curated" },
    ]),
    // No allergen_classes field at all — UNKNOWN for every class.
    food("sosis", 11),
  ].map((n) => [n.name_tr, n]),
);

const COMBOS: Combo[] = [
  {
    id: "combo-chicken-rice",
    nameTr: "Tavuk pirinç",
    items: [
      { foodId: "tavuk göğsü", grams: 150 },
      { foodId: "pirinç", grams: 100 },
    ],
    prepMinutes: 15,
    tags: [],
  },
  {
    id: "combo-almonds",
    nameTr: "Badem",
    items: [{ foodId: "badem", grams: 30 }],
    prepMinutes: 0,
    tags: [],
  },
  { id: "combo-walnuts", nameTr: "Ceviz", items: [{ foodId: "ceviz", grams: 30 }], prepMinutes: 0, tags: [] },
  { id: "combo-yogurt", nameTr: "Yoğurt", items: [{ foodId: "yoğurt", grams: 200 }], prepMinutes: 0, tags: [] },
  { id: "combo-pasta", nameTr: "Makarna", items: [{ foodId: "makarna", grams: 100 }], prepMinutes: 10, tags: [] },
  {
    id: "combo-cheese-pasta",
    nameTr: "Peynirli makarna",
    items: [{ foodId: "peynirli makarna", grams: 150 }],
    prepMinutes: 15,
    tags: [],
  },
  { id: "combo-sausage", nameTr: "Sosis", items: [{ foodId: "sosis", grams: 80 }], prepMinutes: 5, tags: [] },
];

function entry(foodId: string, reason: FoodExclusion["reason"]): FoodExclusion {
  return { foodId, reason, createdAt: new Date().toISOString() };
}

function allergenEntry(
  allergenClass: AllergenClassExclusion["allergenClass"],
  reason: AllergenClassExclusion["reason"]
): AllergenClassExclusion {
  return { allergenClass, reason, createdAt: new Date().toISOString() };
}

function idsOf(scored: ReturnType<typeof scoreAllCombos>): string[] {
  return scored.map((c) => c.id);
}

describe("scoreAllCombos — food-level hard tier (unchanged regression behavior)", () => {
  it("drops a combo entirely when any item is allergy-excluded", () => {
    const scored = scoreAllCombos(COMBOS, [entry("badem", "allergy")], [], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-almonds");
    expect(idsOf(scored)).toContain("combo-chicken-rice");
  });

  it("drops a combo entirely when any item is unclear-excluded", () => {
    const scored = scoreAllCombos(COMBOS, [entry("badem", "unclear")], [], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-almonds");
  });

  it("drops a combo entirely when any item is unclassified (legacy)", () => {
    const scored = scoreAllCombos(COMBOS, [entry("badem", "unclassified")], [], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-almonds");
  });

  it("drops a combo entirely on a preference match — unchanged from today", () => {
    const scored = scoreAllCombos(COMBOS, [entry("badem", "preference")], [], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-almonds");
  });
});

describe("scoreAllCombos — food-level soft tier (A1, unchanged)", () => {
  it("keeps a combo with an intolerance match instead of dropping it", () => {
    const scored = scoreAllCombos(COMBOS, [entry("badem", "intolerance")], [], CATALOG);
    expect(idsOf(scored)).toContain("combo-almonds");
  });

  it("flags the soft-conflicted combo and sorts it after clean ones", () => {
    const scored = scoreAllCombos(COMBOS, [entry("badem", "intolerance")], [], CATALOG);
    const almonds = scored.find((c) => c.id === "combo-almonds");
    const chickenRice = scored.find((c) => c.id === "combo-chicken-rice");
    expect(almonds?.hasSoftConflict).toBe(true);
    expect(chickenRice?.hasSoftConflict).toBe(false);
    expect(scored.indexOf(chickenRice!)).toBeLessThan(scored.indexOf(almonds!));
  });
});

describe("scoreAllCombos — no conflicts", () => {
  it("leaves every combo's ranking/flag unaffected when nothing is excluded", () => {
    const scored = scoreAllCombos(COMBOS, [], [], CATALOG);
    expect(scored.length).toBe(COMBOS.length);
    expect(scored.every((c) => c.hasSoftConflict === false)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Allergen-class enforcement (B3) — this milestone's actual new behavior.

describe("scoreAllCombos — allergen-class hard tier", () => {
  it("excluding tree_nuts blocks almond", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("tree_nuts", "allergy")], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-almonds");
  });

  it("excluding tree_nuts blocks walnut", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("tree_nuts", "allergy")], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-walnuts");
  });

  it("excluding tree_nuts does not block unrelated combos", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("tree_nuts", "allergy")], CATALOG);
    expect(idsOf(scored)).toContain("combo-chicken-rice");
    expect(idsOf(scored)).toContain("combo-yogurt");
  });

  it("excluding milk blocks milk-mapped foods", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("milk", "allergy")], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-yogurt");
  });

  it("excluding gluten_cereals blocks wheat-mapped foods", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("gluten_cereals", "allergy")], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-pasta");
  });

  it("excluding gluten_cereals does NOT block a food confirmed_absent for that class (rice)", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("gluten_cereals", "allergy")], CATALOG);
    expect(idsOf(scored)).toContain("combo-chicken-rice");
  });
});

describe("scoreAllCombos — composite food, multiple allergen classes", () => {
  it("is blocked when ANY one of its several mapped classes is excluded (milk)", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("milk", "allergy")], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-cheese-pasta");
  });

  it("is blocked when the OTHER mapped class is excluded (gluten_cereals)", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("gluten_cereals", "allergy")], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-cheese-pasta");
  });

  it("is offered when neither of its mapped classes is excluded", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("tree_nuts", "allergy")], CATALOG);
    expect(idsOf(scored)).toContain("combo-cheese-pasta");
  });
});

describe("scoreAllCombos — UNKNOWN allergen mapping cannot silently bypass a safety exclusion", () => {
  it("blocks an unmapped food when a hard-tier allergen-class exclusion is active", () => {
    // "sosis" carries no allergen_classes at all — UNKNOWN for every class,
    // including milk (Turkish sausage commonly contains dairy additives but
    // this project makes no claim either way — that's exactly the point).
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("milk", "allergy")], CATALOG);
    expect(idsOf(scored)).not.toContain("combo-sausage");
  });

  it("does not block an unmapped food when no allergen-class exclusion is active", () => {
    const scored = scoreAllCombos(COMBOS, [], [], CATALOG);
    expect(idsOf(scored)).toContain("combo-sausage");
  });

  it("only soft-flags (never blocks) an unmapped food under a soft-tier allergen-class exclusion", () => {
    const scored = scoreAllCombos(COMBOS, [], [allergenEntry("milk", "intolerance")], CATALOG);
    const sausage = scored.find((c) => c.id === "combo-sausage");
    expect(sausage).toBeDefined();
    expect(sausage?.hasSoftConflict).toBe(false);
  });
});

describe("allergen-class exclusions cannot be bypassed by a food-level allow", () => {
  it("blocks almond via allergen-class exclusion with zero food-level entries present", () => {
    const scored = scoreAllCombos(
      COMBOS,
      [], // no food-level exclusions at all
      [allergenEntry("tree_nuts", "allergy")],
      CATALOG
    );
    expect(idsOf(scored)).not.toContain("combo-almonds");
  });
});

// ---------------------------------------------------------------------------
// DEC-067 Level 1 — optional textual preparation note. Purely descriptive
// data carried through unchanged; must not affect scoring/matching/totals.

describe("scoreAllCombos — optional prepNote (DEC-067 Level 1)", () => {
  it("scores a combo with no prepNote exactly as before (field absent)", () => {
    const scored = scoreAllCombos(COMBOS, [], [], CATALOG);
    const chickenRice = scored.find((c) => c.id === "combo-chicken-rice");
    expect(chickenRice?.prepNote).toBeUndefined();
  });

  it("carries a combo's prepNote through to the scored result unchanged", () => {
    const withNote: Combo[] = [
      { ...COMBOS[0], id: "combo-with-note", prepNote: "Tavuğu haşlayıp pirinçle servis edin." },
    ];
    const scored = scoreAllCombos(withNote, [], [], CATALOG);
    expect(scored[0]?.prepNote).toBe("Tavuğu haşlayıp pirinçle servis edin.");
  });

  it("does not affect totals or exclusion filtering, present or absent", () => {
    const withoutNote = scoreAllCombos(COMBOS, [], [], CATALOG);
    const withNote: Combo[] = COMBOS.map((c) =>
      c.id === "combo-chicken-rice" ? { ...c, prepNote: "Basit bir not." } : c
    );
    const scored = scoreAllCombos(withNote, [], [], CATALOG);
    const before = withoutNote.find((c) => c.id === "combo-chicken-rice");
    const after = scored.find((c) => c.id === "combo-chicken-rice");
    expect(after?.totals).toEqual(before?.totals);
    expect(after?.hasSoftConflict).toBe(before?.hasSoftConflict);
  });
});
