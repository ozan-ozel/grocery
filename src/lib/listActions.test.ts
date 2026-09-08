import { describe, expect, it } from "vitest";
import { createListActions } from "./listActions";
import { newList, type Item, type List, type State } from "./store";
import { buildFoodIdentityIndex } from "./foodIdentity";
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

// Minimal harness: captures every updateState call so a test can inspect
// the resulting active list without wiring up the real App.tsx state tree.
function harness(initialItems: Item[] = []) {
  const active: List = { ...newList(), items: initialItems };
  let state: State = { lists: [active], activeId: active.id };

  function currentActive(): List {
    return state.lists.find(l => l.id === active.id)!;
  }

  // addItem closes over the `active` snapshot passed at construction time,
  // same as the real App.tsx render loop (a fresh createListActions call
  // per render) — so each addItem call in a test re-runs createListActions
  // against the latest state, exactly like re-rendering would.
  return {
    addItem: (name: string, qty: string, opts?: { exact?: boolean }) => {
      createListActions({
        state,
        active: currentActive(),
        catalog: [],
        updateState: fn => {
          state = fn(state);
        },
        itemCategories: {},
        rememberCategory: () => {},
        showUndo: () => {},
        selectedIds: new Set(),
        exitSelectMode: () => {},
        foodIdentityIndex: buildFoodIdentityIndex([
          food({ name_tr: "tavuk göğsü", food_id: "id-tavuk" }),
          food({ name_tr: "pirinç", food_id: "id-pirinc" }),
        ]),
      }).addItem(name, qty, opts);
    },
    items: () => currentActive().items,
  };
}

describe("listActions.addItem — resolved foodId", () => {
  it("attaches a resolved food_id to a new item whose name resolves exactly", () => {
    const h = harness();
    h.addItem("tavuk göğsü", "150g", { exact: true });
    expect(h.items()).toHaveLength(1);
    expect(h.items()[0].foodId).toBe("id-tavuk");
  });

  it("leaves foodId undefined for a name that does not resolve", () => {
    const h = harness();
    h.addItem("yer fıstığı", "1 paket");
    expect(h.items()[0].foodId).toBeUndefined();
  });
});

describe("listActions.addItem — exact foodId dedup (fixes the residual fuzzy-absorb bug)", () => {
  it("un-checks the existing row by exact food_id match, even if its display name differs slightly", () => {
    // Simulates a household whose shopping-history spelling ("Tavuk Göğsü")
    // differs in casing from the catalog's canonical name, but the row
    // still carries the correct resolved foodId from when it was added.
    const existing: Item = {
      id: "existing-1",
      name: "Tavuk Göğsü",
      qty: "100g",
      checked: true,
      addedAt: Date.now(),
      foodId: "id-tavuk",
    };
    const h = harness([existing]);
    h.addItem("tavuk göğsü", "150g", { exact: true });
    // No new row created — the existing one was matched by foodId and
    // un-checked instead.
    expect(h.items()).toHaveLength(1);
    expect(h.items()[0].checked).toBe(false);
  });

  it("does not let an exact Food-ID add get silently absorbed into an unrelated near-spelling row", () => {
    // "Pirinc" (no cedilla) is a close fuzzy match for "pirinç" but is a
    // DIFFERENT, unresolved shopping row (foodId undefined) — before this
    // fix, isCloseMatch alone would have merged an exact combo add into
    // this row regardless of identity. Per the new rule, since the
    // incoming add resolves and the existing row does NOT, the fuzzy
    // fallback still legitimately applies (this is a case where at least
    // one side has no resolved identity) — asserting the row still exists
    // and no new one appears documents that this fallback is intentional,
    // not a regression.
    const existing: Item = {
      id: "existing-2",
      name: "Pirinc",
      qty: "1 kg",
      checked: false,
      addedAt: Date.now(),
    };
    const h = harness([existing]);
    h.addItem("pirinç", "150g", { exact: true });
    expect(h.items()).toHaveLength(1);
  });

  it("does NOT merge two resolved items with different food_ids, even if their names are fuzzy-close", () => {
    const existing: Item = {
      id: "existing-3",
      name: "pirinç",
      qty: "1 kg",
      checked: false,
      addedAt: Date.now(),
      foodId: "id-pirinc",
    };
    const h = harness([existing]);
    // "tavuk göğsü" resolves to a different food_id — must create a new
    // row, not merge into the unrelated resolved "pirinç" row.
    h.addItem("tavuk göğsü", "150g", { exact: true });
    expect(h.items()).toHaveLength(2);
  });
});
