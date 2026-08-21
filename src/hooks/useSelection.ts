import { useEffect, useState } from "react";

// Selection is tied to one list's rows; drop it if the active list changes
// out from under it (tenant switch, new list, rollover) so stale ids can't
// linger into a different list.
export function useSelection(activeListId: string | undefined) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [activeListId]);

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function toggleSelectMode() {
    setSelectMode((on) => !on);
    setSelectedIds(new Set());
  }

  function selectAll(ids: string[]) {
    setSelectMode(true);
    setSelectedIds(new Set(ids));
  }

  function selectCategory(ids: string[], selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (selected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((ids) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return {
    selectMode,
    selectedIds,
    exitSelectMode,
    toggleSelectMode,
    selectAll,
    selectCategory,
    toggleSelectItem,
  };
}
