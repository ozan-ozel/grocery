import type { ItemCategoryMap } from "./itemCategories";

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

// Best-effort, cross-device category memory backed by
// public.item_category_memory. Failures are swallowed — the localStorage
// copy (see itemCategories.ts) is always the fallback of record.

export async function fetchItemCategoryMemory(householdId: string): Promise<ItemCategoryMap> {
  try {
    const res = await fetch(apiUrl(`/api/item-category-memory?household_id=${encodeURIComponent(householdId)}`));
    if (!res.ok) return {};
    const rows = (await res.json()) as Array<{ name_lower: string; category: string }>;
    const map: ItemCategoryMap = {};
    for (const row of rows) {
      map[row.name_lower] = row.category as ItemCategoryMap[string];
    }
    return map;
  } catch {
    return {};
  }
}

export async function pushItemCategory(
  householdId: string,
  nameLower: string,
  category: string
): Promise<void> {
  try {
    await fetch(apiUrl("/api/item-category-memory"), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ household_id: householdId, name_lower: nameLower, category }),
    });
  } catch {
    // Best-effort — the local copy already has this edit.
  }
}
