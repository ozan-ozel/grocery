import {
  lookupItemCategory,
  type ItemCategoryMap,
} from "@/lib/categorization/itemCategories";
import type { AnyCategoryId } from "@/lib/categorization/userCategories";
import {
  categorizeItems,
  findCanonicalName,
  newList,
  uid,
  type CatalogEntry,
  type Item,
  type List,
  type State,
} from "@/lib/store";
import { isCloseMatch } from "@/lib/fuzzyMatch";
import { resolveFood, type FoodIdentityIndex } from "@/lib/foodIdentity";
import type { Undo } from "@/hooks/useUndo";

export function createListActions(params: {
  state: State;
  active: List;
  catalog: CatalogEntry[];
  updateState: (fn: (s: State) => State) => void;
  itemCategories: ItemCategoryMap;
  rememberCategory: (name: string, category: AnyCategoryId) => void;
  showUndo: (u: Undo, ttlMs: number) => void;
  selectedIds: Set<string>;
  exitSelectMode: () => void;
  // Optional — treated as "nothing resolves" when omitted, never as "skip
  // the check" (same convention as MealFoodPicker's exclusions prop).
  // Canonical Food Identity implementation: lets addItem attach a stable
  // food_id to a new shopping row whenever its final name resolves exactly.
  foodIdentityIndex?: FoodIdentityIndex;
}) {
  const {
    state,
    active,
    catalog,
    updateState,
    itemCategories,
    rememberCategory,
    showUndo,
    selectedIds,
    exitSelectMode,
    foodIdentityIndex,
  } = params;

  function updateActive(fn: (items: Item[]) => Item[]) {
    updateState((s) => ({
      ...s,
      lists: s.lists.map((l) => (l.id === active.id ? { ...l, items: fn(l.items) } : l)),
    }));
  }

  function addItem(name: string, qty: string, opts?: { exact?: boolean }) {
    // A typo like "maydonoz" resolves to the household's already-established
    // "Maydanoz" instead of minting a new catalog entry; a genuinely new
    // name (no close match) passes through unchanged.
    //
    // opts.exact skips this rewrite entirely — used when `name` already IS
    // a canonical Food identity (e.g. a combo's foodId) rather than
    // free-typed text. Fuzzy-rewriting an already-canonical id would run it
    // through the shopping catalog's fuzzy key space, which is exactly the
    // coupling Phase 9 §20.6 (C1) flags as unsafe for anything beyond human
    // typing — it must not silently rewrite a recipe ingredient's identity
    // to a near-spelling already on this household's list.
    const canonicalName = opts?.exact ? name : findCanonicalName(name, catalog) ?? name;

    // Exact-only resolution (no fuzzy step — see src/lib/foodIdentity.ts) of
    // the final chosen name against the nutrition catalog. Canonical Food
    // Identity implementation: this is what makes a shopping add "prefer
    // Food ID equality where identity matters" without touching free-text
    // UX for anything that doesn't resolve.
    const resolution = foodIdentityIndex
      ? resolveFood(canonicalName, foodIdentityIndex)
      : { status: "unknown" as const };
    const resolvedFoodId =
      resolution.status === "resolved" ? resolution.food.food_id : undefined;

    const existing = active.items.find((i) =>
      // Prefer exact foodId equality when BOTH sides have a resolved
      // identity — this is the fix for the residual bug the investigation
      // flagged: `{ exact: true }` (a combo add) skipped the canonical-name
      // rewrite but this existing-row check still fuzzy-matched against
      // shopping history, so an exact Food ID add could still be silently
      // absorbed into an unrelated near-spelling row. Anything that doesn't
      // resolve on either side keeps today's fuzzy behavior unchanged.
      resolvedFoodId && i.foodId
        ? i.foodId === resolvedFoodId
        : isCloseMatch(
            i.name.toLocaleLowerCase("tr-TR"),
            canonicalName.toLocaleLowerCase("tr-TR")
          )
    );
    // Re-adding something already on the list just un-checks it rather
    // than creating a confusing duplicate row.
    if (existing) {
      updateActive((items) =>
        items.map((i) => (i.id === existing.id ? { ...i, checked: false } : i))
      );
      return;
    }
    const remembered = lookupItemCategory(itemCategories, canonicalName);
    updateActive((items) => [
      ...items,
      {
        id: uid(),
        name: canonicalName,
        qty,
        checked: false,
        addedAt: Date.now(),
        category: remembered,
        foodId: resolvedFoodId,
      },
    ]);
  }

  function toggleItem(id: string) {
    updateActive((items) =>
      items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  }

  function editItem(id: string, name: string, qty: string, category?: AnyCategoryId) {
    if (category !== undefined) {
      rememberCategory(name, category);
    }
    updateActive((items) =>
      items.map((i) => {
        if (i.id !== id) return i;
        // If the user explicitly picked a category in the edit row, that stamp
        // wins and survives even a name change. Otherwise we only wipe the
        // stored category when the name changed, so a qty-only edit doesn't
        // erase a manual assignment.
        const explicit = category !== undefined;
        const nameChanged = i.name !== name;
        return {
          ...i,
          name,
          qty,
          category: explicit ? category : nameChanged ? undefined : i.category,
        };
      })
    );
  }

  function removeItem(id: string) {
    const item = active.items.find((i) => i.id === id);
    if (!item) return;
    updateActive((items) => items.filter((i) => i.id !== id));
    showUndo({ kind: "remove", item, listId: active.id }, 6000);
  }

  function bulkRemove() {
    const items = active.items.filter((i) => selectedIds.has(i.id));
    if (items.length === 0) return;
    updateActive((current) => current.filter((i) => !selectedIds.has(i.id)));
    showUndo({ kind: "bulkRemove", items, listId: active.id }, 6000);
    exitSelectMode();
  }

  function startNewList() {
    // An untouched list isn't worth filing — just keep using it.
    if (active.items.length === 0) return;
    const next = newList();
    updateState((s) => ({
      ...s,
      lists: [
        next,
        ...s.lists.map((l) =>
          l.id === active.id ? { ...l, closedAt: Date.now() } : l
        ),
      ],
      activeId: next.id,
    }));
  }

  function reuseList(listId: string) {
    const source = state.lists.find((l) => l.id === listId);
    if (!source) return;
    const present = new Set(
      active.items.map((i) => i.name.toLocaleLowerCase("tr-TR"))
    );
    const additions = source.items
      .filter((i) => !present.has(i.name.toLocaleLowerCase("tr-TR")))
      .map((i) => ({
        id: uid(),
        name: i.name,
        qty: i.qty,
        checked: false,
        addedAt: Date.now(),
        // Carry the source item's category so manual/custom stamps survive
        // a reuse. Matches the rollover behavior.
        category: i.category,
      }));
    updateActive((items) => [...items, ...additions]);
  }

  function deleteList(listId: string) {
    const target = state.lists.find((l) => l.id === listId);
    if (!target || target.id === active.id) return;
    updateState((s) => ({
      ...s,
      lists: s.lists.filter((l) => l.id !== listId),
    }));
    showUndo({ kind: "deleteList", list: target }, 6000);
  }

  function renameActive(title: string) {
    updateState((s) => ({
      ...s,
      lists: s.lists.map((l) => (l.id === active.id ? { ...l, title } : l)),
    }));
  }

  function toggleGrouping() {
    updateState((s) => ({ ...s, groupByCategory: !(s.groupByCategory ?? false) }));
  }

  function categorizeActive() {
    updateActive((items) => categorizeItems(items));
  }

  const isOnList = (name: string) =>
    active.items.some(
      (i) => i.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR")
    );

  // Same exact-match rule as isOnList, so "is this on the list" and "remove
  // it" always agree on which row they mean.
  function removeItemByName(name: string) {
    const item = active.items.find(
      (i) => i.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR")
    );
    if (item) removeItem(item.id);
  }

  return {
    addItem,
    toggleItem,
    editItem,
    removeItem,
    removeItemByName,
    bulkRemove,
    startNewList,
    reuseList,
    deleteList,
    renameActive,
    toggleGrouping,
    categorizeActive,
    isOnList,
  };
}
