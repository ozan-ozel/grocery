import { useCallback, useEffect, useState } from "react";
import {
  loadItemCategories,
  normalize,
  rememberItemCategory,
  saveItemCategories,
  type ItemCategoryMap,
} from "@/lib/categorization/itemCategories";
import { fetchItemCategoryMemory, pushItemCategory } from "@/lib/categorization/itemCategoryMemoryApi";
import type { AnyCategoryId } from "@/lib/categorization/userCategories";

export function useItemCategories(activeTenantId: string | null) {
  const [itemCategories, setItemCategories] = useState<ItemCategoryMap>({});

  // Saves happen explicitly at each mutation point below (load-merge and
  // rememberCategory) rather than via a blanket "save on every change"
  // effect keyed on activeTenantId — that ordering would fire with the
  // stale pre-load map on every tenant switch and wipe the on-disk cache
  // right before the load below reads it back.
  useEffect(() => {
    if (!activeTenantId) return;
    setItemCategories(loadItemCategories(activeTenantId));

    let cancelled = false;
    fetchItemCategoryMemory(activeTenantId).then((server) => {
      if (cancelled || Object.keys(server).length === 0) return;
      // Server is the cross-device source of truth; it wins on conflict.
      // A device with a newer unsynced edit re-pushes it the next time
      // that item is corrected.
      setItemCategories((local) => {
        const merged = { ...local, ...server };
        saveItemCategories(activeTenantId, merged);
        return merged;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [activeTenantId]);

  const rememberCategory = useCallback(
    (name: string, category: AnyCategoryId) => {
      setItemCategories((m) => {
        const next = rememberItemCategory(m, name, category);
        if (activeTenantId) saveItemCategories(activeTenantId, next);
        return next;
      });
      if (activeTenantId) {
        const nameLower = normalize(name);
        if (nameLower) void pushItemCategory(activeTenantId, nameLower, category);
      }
    },
    [activeTenantId]
  );

  return { itemCategories, rememberCategory };
}
