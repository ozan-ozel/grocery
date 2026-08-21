import { useEffect, useMemo, useState } from "react";
import {
  addCustomCategory,
  loadOverlay,
  mergeCategories,
  moveCategory,
  reorderCategories,
  removeCustomCategory,
  renameCategory,
  saveOverlay,
  setHidden,
  type AnyCategoryId,
  type CategoryOverlay,
} from "@/lib/categorization/userCategories";
import type { CategoryId } from "@/lib/categorization/categories";

export function useCategoryOverlay() {
  const [overlay, setOverlay] = useState<CategoryOverlay>(() => loadOverlay());

  useEffect(() => {
    saveOverlay(overlay);
  }, [overlay]);

  const mergedCategories = useMemo(() => mergeCategories(overlay), [overlay]);

  function renameCat(id: AnyCategoryId, label: string) {
    setOverlay((o) => renameCategory(o, id, label));
  }

  function toggleHidden(id: string, hidden: boolean) {
    setOverlay((o) => setHidden(o, id as CategoryId, hidden));
  }

  function moveCat(id: AnyCategoryId, direction: "up" | "down") {
    setOverlay((o) => moveCategory(o, id, direction));
  }

  function reorderCats(ids: AnyCategoryId[]) {
    setOverlay((o) => reorderCategories(o, ids));
  }

  function addCategory(label: string) {
    setOverlay((o) => {
      const result = addCustomCategory(o, label);
      return result?.overlay ?? o;
    });
  }

  function removeCategory(id: string) {
    setOverlay((o) => removeCustomCategory(o, id));
  }

  return {
    overlay,
    mergedCategories,
    renameCat,
    toggleHidden,
    moveCat,
    reorderCats,
    addCategory,
    removeCategory,
  };
}
