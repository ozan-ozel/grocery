import { useEffect, useState } from "react";
import {
  loadItemCategories,
  saveItemCategories,
  type ItemCategoryMap,
} from "@/lib/categorization/itemCategories";

export function useItemCategories(activeTenantId: string | null) {
  const [itemCategories, setItemCategories] = useState<ItemCategoryMap>({});

  useEffect(() => {
    if (activeTenantId) saveItemCategories(activeTenantId, itemCategories);
  }, [activeTenantId, itemCategories]);

  useEffect(() => {
    if (activeTenantId) setItemCategories(loadItemCategories(activeTenantId));
  }, [activeTenantId]);

  return { itemCategories, setItemCategories };
}
