import {
  lookupItemCategory,
  type ItemCategoryMap,
} from "@/lib/categorization/itemCategories";
import type { AnyCategoryId } from "@/lib/categorization/userCategories";
import { categorizeItems, newList, uid, type Item, type List, type State } from "@/lib/store";
import type { Undo } from "@/hooks/useUndo";

export function createListActions(params: {
  state: State;
  active: List;
  updateState: (fn: (s: State) => State) => void;
  itemCategories: ItemCategoryMap;
  rememberCategory: (name: string, category: AnyCategoryId) => void;
  showUndo: (u: Undo, ttlMs: number) => void;
  selectedIds: Set<string>;
  exitSelectMode: () => void;
}) {
  const { state, active, updateState, itemCategories, rememberCategory, showUndo, selectedIds, exitSelectMode } =
    params;

  function updateActive(fn: (items: Item[]) => Item[]) {
    updateState((s) => ({
      ...s,
      lists: s.lists.map((l) => (l.id === active.id ? { ...l, items: fn(l.items) } : l)),
    }));
  }

  function addItem(name: string, qty: string) {
    const existing = active.items.find(
      (i) => i.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR")
    );
    // Re-adding something already on the list just un-checks it rather
    // than creating a confusing duplicate row.
    if (existing) {
      updateActive((items) =>
        items.map((i) => (i.id === existing.id ? { ...i, checked: false } : i))
      );
      return;
    }
    const remembered = lookupItemCategory(itemCategories, name);
    updateActive((items) => [
      ...items,
      {
        id: uid(),
        name,
        qty,
        checked: false,
        addedAt: Date.now(),
        category: remembered,
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

  return {
    addItem,
    toggleItem,
    editItem,
    removeItem,
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
