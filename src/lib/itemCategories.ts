import type { AnyCategoryId } from "./userCategories";

export type ItemCategoryMap = Record<string, AnyCategoryId>;

const KEY_PREFIX = "grocery.itemCategories.v1:";

function key(tenantId: string) {
  return `${KEY_PREFIX}${tenantId}`;
}

export function normalize(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}

export function loadItemCategories(tenantId: string): ItemCategoryMap {
  try {
    const raw = localStorage.getItem(key(tenantId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ItemCategoryMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveItemCategories(tenantId: string, map: ItemCategoryMap) {
  try {
    localStorage.setItem(key(tenantId), JSON.stringify(map));
  } catch {
    // Best-effort persistence, matches the rest of the app.
  }
}

export function lookupItemCategory(
  map: ItemCategoryMap,
  name: string
): AnyCategoryId | undefined {
  const k = normalize(name);
  if (!k) return undefined;
  return map[k];
}

export function rememberItemCategory(
  map: ItemCategoryMap,
  name: string,
  category: AnyCategoryId
): ItemCategoryMap {
  const k = normalize(name);
  if (!k) return map;
  if (map[k] === category) return map;
  return { ...map, [k]: category };
}
