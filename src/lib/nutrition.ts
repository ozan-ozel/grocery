import { normalize } from "./itemCategories";

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
// panel isn't blank before the user types anything.
export async function browseNutrition(
  query: string,
  limit = 60
): Promise<Nutrition[]> {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) params.set("q", trimmed);
  params.set("limit", String(limit));

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
