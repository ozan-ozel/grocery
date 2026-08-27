import { normalize } from "./categorization/itemCategories";

export type Nutrition = {
  name_tr: string;
  kcal_per_100: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
};

export type NutritionMap = Map<string, Nutrition>;

export type NutritionWrite = Nutrition & { aliases?: string[] };

type ApiRow = Nutrition & { aliases?: string[] };

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

const CACHE_KEY = "grocery.nutrition.v1";

function loadCache(): Record<string, Nutrition> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Nutrition>) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, Nutrition>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Best-effort, same as the rest of the app — cache just won't persist.
  }
}

// Device-local, cross-session cache of nutrition lookups (nutrition facts
// aren't tenant-specific, so one shared cache is fine). Only names actually
// missing from the cache hit the network — this is what makes a reload of
// the active list's nutrition table not re-fetch names it already knows.
export async function fetchNutritionCached(names: string[]): Promise<NutritionMap> {
  const cache = loadCache();
  const map: NutritionMap = new Map(Object.entries(cache));

  const normalized = Array.from(
    new Set(names.map(normalize).filter((n) => n.length > 0))
  );
  const missing = normalized.filter((n) => !map.has(n));

  if (missing.length > 0) {
    const fresh = await fetchNutrition(missing);
    if (fresh.size > 0) {
      for (const [key, value] of fresh) {
        map.set(key, value);
        cache[key] = value;
      }
      saveCache(cache);
    }
  }

  return map;
}

// Called after a save/edit/bulk-upload so the cache doesn't serve a stale
// value for a name the user just changed.
export function rememberNutrition(rows: Nutrition[]) {
  if (rows.length === 0) return;
  const cache = loadCache();
  for (const row of rows) cache[row.name_tr] = row;
  saveCache(cache);
  // A save can affect any number of cached browse pages (any query whose
  // results include this row) — cheaper to drop them all than to track
  // which pages are affected.
  clearBrowseCache();
}

type BrowseCacheEntry = { rows: Nutrition[]; ts: number };
const BROWSE_CACHE_KEY = "grocery.nutrition.browse.v1";
// Browse-all is read-mostly; a short TTL is enough to stop the same page
// (typically the default alphabetical listing) from refetching on every
// reload or Alışveriş/Besin tab switch, without risking stale-looking data
// for long after an edit elsewhere.
const BROWSE_CACHE_TTL_MS = 5 * 60 * 1000;

function loadBrowseCache(): Record<string, BrowseCacheEntry> {
  try {
    const raw = localStorage.getItem(BROWSE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, BrowseCacheEntry>) : {};
  } catch {
    return {};
  }
}

function saveBrowseCache(cache: Record<string, BrowseCacheEntry>) {
  try {
    localStorage.setItem(BROWSE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Best-effort, same as the rest of the app — cache just won't persist.
  }
}

function clearBrowseCache() {
  try {
    localStorage.removeItem(BROWSE_CACHE_KEY);
  } catch {
    // Ignored — best-effort.
  }
}

export async function fetchNutrition(names: string[]): Promise<NutritionMap> {
  const map: NutritionMap = new Map();
  const normalized = Array.from(
    new Set(names.map(normalize).filter((n) => n.length > 0))
  );
  if (normalized.length === 0) return map;

  // Let a failed request throw instead of silently returning an empty map —
  // an API outage and "none of these items have nutrition data yet" would
  // otherwise be indistinguishable to the caller.
  const res = await fetch(apiUrl("/api/nutrition"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ names: normalized }),
  });
  if (!res.ok) {
    throw new Error(`nutrition api ${res.status}`);
  }
  const rows = (await res.json()) as ApiRow[];
  for (const row of rows) {
    const nutrition = pickNutrition(row);
    map.set(nutrition.name_tr, nutrition);
    for (const alias of row.aliases ?? []) {
      map.set(alias, nutrition);
    }
  }

  return map;
}

// Browses/searches the whole nutrition table (not just names on the active
// list) — backs the "Tümü" panel. Empty query still returns a page so the
// panel isn't blank before the user types anything. offset pages past the
// first `limit` rows (alphabetical order) — without it, anything past the
// first page silently never renders in list mode, only when searched.
export async function browseNutrition(
  query: string,
  limit = 60,
  offset = 0
): Promise<Nutrition[]> {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) params.set("q", trimmed);
  params.set("limit", String(limit));
  if (offset > 0) params.set("offset", String(offset));

  // Unlike fetchNutrition (which is asked for specific known names, so an
  // empty result is a normal "no match"), a failed browse and a genuinely
  // empty table would otherwise render identically. Let failures throw so
  // the caller can tell the two apart instead of silently showing "no food
  // in the DB" when it's actually the API that's unreachable.
  const res = await fetch(apiUrl(`/api/nutrition?${params.toString()}`));
  if (!res.ok) {
    throw new Error(`browse api ${res.status}`);
  }
  const rows = (await res.json()) as ApiRow[];
  return rows.map(pickNutrition);
}

// Cached wrapper around browseNutrition, keyed by query+limit. Makes the
// "Tümü" panel's default (empty-query) first page — and any repeated search
// — not hit the network again on a page reload or a Besin/Alışveriş tab
// switch within the TTL window. Only the first page (offset 0) is cached;
// "daha fazla göster" pages always hit the network since caching every
// offset would grow the cache unbounded for little benefit.
export async function browseNutritionCached(
  query: string,
  limit = 60,
  offset = 0
): Promise<Nutrition[]> {
  if (offset > 0) return browseNutrition(query, limit, offset);
  const key = `${query.trim().toLocaleLowerCase("tr-TR")}|${limit}`;
  const cache = loadBrowseCache();
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < BROWSE_CACHE_TTL_MS) {
    return entry.rows;
  }
  const rows = await browseNutrition(query, limit, 0);
  cache[key] = { rows, ts: Date.now() };
  saveBrowseCache(cache);
  return rows;
}

export async function saveNutrition(row: NutritionWrite): Promise<Nutrition> {
  const res = await fetch(apiUrl("/api/nutrition"), {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ row: prepareRow(row) }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `save failed: ${res.status}`);
  }
  const saved = (await res.json()) as ApiRow;
  return pickNutrition(saved);
}

export async function saveNutritionBulk(
  rows: NutritionWrite[]
): Promise<Nutrition[]> {
  if (rows.length === 0) return [];
  const res = await fetch(apiUrl("/api/nutrition"), {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ rows: rows.map(prepareRow) }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `save failed: ${res.status}`);
  }
  const { saved } = (await res.json()) as { saved: ApiRow[] };
  return saved.map(pickNutrition);
}

function prepareRow(row: NutritionWrite) {
  return {
    name_tr: normalize(row.name_tr),
    aliases: (row.aliases ?? []).map(normalize).filter((a) => a.length > 0),
    kcal_per_100: row.kcal_per_100,
    protein_g: row.protein_g,
    fat_g: row.fat_g,
    carbs_g: row.carbs_g,
    fiber_g: row.fiber_g,
  };
}

export function lookupNutrition(
  map: NutritionMap,
  name: string
): Nutrition | undefined {
  return map.get(normalize(name));
}

function pickNutrition(row: ApiRow): Nutrition {
  return {
    name_tr: row.name_tr,
    kcal_per_100: row.kcal_per_100,
    protein_g: row.protein_g,
    fat_g: row.fat_g,
    carbs_g: row.carbs_g,
    fiber_g: row.fiber_g,
  };
}
