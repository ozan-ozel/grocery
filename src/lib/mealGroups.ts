// src/lib/mealGroups.ts
import type { MealItem } from "@/lib/localMealPlan";

// Where a meal group's name came from — built-in combos, the user's own
// Yemeklerim meals, or an evening-suggestion pattern. Used to give each kind
// its own shade in the group card's background and to gate the edit action
// (only a "saved" group is the user's own, editable meal).
export type MealGroupSource = "saved" | "builtin" | "evening";

export type MealGroupInfo = { name: string; source: MealGroupSource };

// A slot's items, grouped for display. `meal` groups are items added together
// from the Yemekler sheet: same comboId, contiguous, and every food distinct.
// Everything else — a lone item, an item without a comboId, an item whose
// comboId no longer resolves to a name — renders plain. A group only exists
// while it has 2+ items, so deleting down to one dissolves the card with no
// extra state.
export type SlotGroup =
  | { kind: "single"; item: MealItem }
  | { kind: "meal"; comboId: string; name: string; source: MealGroupSource; items: MealItem[] };

type Run = { comboId: string; name: string; source: MealGroupSource; items: MealItem[]; foods: Set<string> };

// A repeated food inside a run starts a new group: that is how "the same meal
// added twice to one slot" is told apart without a per-instance id. It is a
// heuristic — a meal that itself lists one food twice would split.
export function groupSlotItems(
  items: MealItem[],
  infoFor: (comboId: string) => MealGroupInfo | undefined
): SlotGroup[] {
  const groups: SlotGroup[] = [];
  let run: Run | null = null;

  function flush() {
    if (!run) return;
    if (run.items.length >= 2) {
      groups.push({
        kind: "meal",
        comboId: run.comboId,
        name: run.name,
        source: run.source,
        items: run.items,
      });
    } else {
      for (const item of run.items) groups.push({ kind: "single", item });
    }
    run = null;
  }

  for (const item of items) {
    const info = item.comboId ? infoFor(item.comboId) : undefined;
    if (!item.comboId || !info) {
      flush();
      groups.push({ kind: "single", item });
      continue;
    }
    if (run && run.comboId === item.comboId && !run.foods.has(item.foodId)) {
      run.items.push(item);
      run.foods.add(item.foodId);
      continue;
    }
    flush();
    run = {
      comboId: item.comboId,
      name: info.name,
      source: info.source,
      items: [item],
      foods: new Set([item.foodId]),
    };
  }
  flush();
  return groups;
}
