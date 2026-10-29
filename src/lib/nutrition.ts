import { normalize } from "./categorization/itemCategories";
import type { AllergenClassMapping } from "./allergenClasses";
import type { Item } from "./store";

export type Nutrition = {
  name_tr: string;
  // Opaque, stable canonical Food identity (Phase 9 Canonical Food Identity
  // implementation — see src/lib/foodIdentity.ts). Optional because it is
  // read-through only: absent until supabase/16-nutrition-food-id.sql has
  // been applied and the response re-fetched. Never client-set — see
  // prepareRow below, which deliberately never includes it in a write.
  food_id?: string;
  kcal_per_100: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  // Optional: only populated on paths that fetch it (browseNutrition now
  // does — see pickNutrition). Lets a catalog built from a browse response
  // resolve alias spellings too, not just exact name_tr (Phase 9 §20.6 C5:
  // previously only the POST-by-name path resolved aliases).
  aliases?: string[];
  source?: string;
  preparation_state?: string;
  is_active?: boolean;
  canonical_name?: string;
  // Reviewed duplicate identities retained for old shopping/exclusion references.
  equivalent_food_ids?: string[];
  equivalent_names?: string[];
  // Türkiye/EU 14 allergen-class relationships for this food (see
  // src/lib/allergenClasses.ts). Snake_case to match every other field on
  // this type, which is a verbatim passthrough of the `nutrition` table's
  // real column names — no camelCase translation happens anywhere in this
  // file. undefined = this food has never been evaluated for ANY class
  // (whole-food unknown); a present array only carries the classes that
  // HAVE been evaluated — a class missing from the array is UNKNOWN for
  // that class specifically, never inferred as confirmed_absent. See
  // allergenClassStatusForFood() and src/lib/foodExclusions.ts for the
  // matching side.
  allergen_classes?: AllergenClassMapping[];
};

export type NutritionMap = Map<string, Nutrition>;

export type NutritionWrite = Nutrition & { aliases?: string[] };

type ApiRow = Nutrition & { aliases?: string[] };

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

const CACHE_KEY = "grocery.nutrition.v2";
const LOOKUP_CACHE_TTL_MS = 5 * 60 * 1000;
type LookupCache = Record<string, { row: Nutrition; ts: number }>;

function loadCache(): LookupCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const entries = JSON.parse(raw) as LookupCache;
    return Object.fromEntries(Object.entries(entries).filter(([, entry]) =>
      entry?.row && Number.isFinite(entry.ts) && Date.now() - entry.ts < LOOKUP_CACHE_TTL_MS));
  } catch {
    return {};
  }
}

function saveCache(cache: LookupCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Best-effort, same as the rest of the app — cache just won't persist.
  }
}

// Device-local, cross-session cache of nutrition lookups (nutrition facts
// aren't tenant-specific, so one shared cache is fine). Entries expire after
// five minutes; fresh lookup misses cannot extend older entries' lifetimes.
export async function fetchNutritionCached(names: string[]): Promise<NutritionMap> {
  const cache = loadCache();
  const map: NutritionMap = new Map(Object.entries(cache).map(([name, entry]) => [name, entry.row]));

  const normalized = Array.from(
    new Set(names.map(normalize).filter((n) => n.length > 0))
  );
  const missing = normalized.filter((n) => !map.has(n));

  if (missing.length > 0) {
    const fresh = await fetchNutrition(missing);
    if (fresh.size > 0) {
      for (const [key, value] of fresh) {
        map.set(key, value);
        cache[key] = { row: value, ts: Date.now() };
      }
      saveCache(cache);
    }
  }

  return map;
}

// Called after a bulk upload so the cache doesn't serve a stale value for a
// name that was just changed.
export function rememberNutrition(rows: Nutrition[]) {
  if (rows.length === 0) return;
  // Drop old aliases too: an alias removed by an upload must not continue
  // resolving to yesterday's row in the device cache.
  const cache: LookupCache = {};
  for (const row of rows) cache[row.name_tr] = { row, ts: Date.now() };
  saveCache(cache);
  // A save can affect any number of cached browse pages (any query whose
  // results include this row) — cheaper to drop them all than to track
  // which pages are affected.
  clearBrowseCache();
}

type BrowseCacheEntry = { rows: Nutrition[]; ts: number };
const BROWSE_CACHE_KEY = "grocery.nutrition.browse.v2";
// Browse-all is read-mostly; a short TTL is enough to stop the same page
// (typically the default alphabetical listing) from refetching on every
// reload or Alışveriş/Besin tab switch, without risking stale-looking data
// for long after an edit elsewhere.
export const BROWSE_CACHE_TTL_MS = 5 * 60 * 1000;

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
  return buildNutritionMap(rows.map(pickNutrition));
}

// Display/nutrient lookup only; safety identity resolution remains in
// foodIdentity.ts. Exact names precede aliases; reviewed duplicate redirects
// follow the database's explicit canonical_name, never fuzzy matching.
export function buildNutritionMap(rows: Nutrition[]): NutritionMap {
  const map: NutritionMap = new Map(rows.map(row => [normalize(row.name_tr), row]));
  for (const row of rows) {
    const canonical = row.canonical_name ? map.get(normalize(row.canonical_name)) : undefined;
    if (canonical) map.set(normalize(row.name_tr), canonical);
  }
  for (const row of rows) {
    const resolved = map.get(normalize(row.name_tr)) ?? row;
    for (const alias of row.aliases ?? []) {
      if (!map.has(normalize(alias))) map.set(normalize(alias), resolved);
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
  // The explicit local cache owns the TTL. Bypass the separate HTTP cache so
  // invalidating after a maintenance upload cannot fetch an old browser copy.
  const res = await fetch(apiUrl(`/api/nutrition?${params.toString()}`), { cache: "no-store" });
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

// Maintenance-only: the server rejects this with 403 unless the caller's email
// is in ADMIN_EMAILS (api/nutrition.ts). The only caller is the hidden upload
// modal in Settings (components/dev/NutritionUploadModal.tsx).
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
    if (res.status === 403) throw new Error("Bu işlem için yetkin yok.");
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
    ...(row.source !== undefined ? { source: row.source } : {}),
    ...(row.preparation_state !== undefined ? { preparation_state: row.preparation_state } : {}),
  };
}

export function lookupNutrition(
  map: NutritionMap,
  name: string
): Nutrition | undefined {
  return map.get(normalize(name));
}

export type ScaledMacros = {
  kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
};

// A list item's nutrition scaled by its own quantity (item.qty, free text —
// "2", "500g", "1 L" — parsed leading-number-only, grams assumed; unparsable
// or absent falls back to 100, matching a single 100g/100ml reference
// serving). Shared by ActiveListRow (per-row display) and ActiveList (the
// list's aggregate total) so the two never compute this differently.
export function scaledNutritionForItem(
  foodsByName: NutritionMap,
  item: Pick<Item, "name" | "qty">
): ScaledMacros | undefined {
  const nutrition = lookupNutrition(foodsByName, item.name);
  if (!nutrition) return undefined;
  const qty = item.qty ? parseFloat(item.qty) : 100;
  const multiplier = Number.isFinite(qty) ? qty / 100 : 1;
  return {
    kcal: nutrition.kcal_per_100 * multiplier,
    protein_g: nutrition.protein_g * multiplier,
    fat_g: nutrition.fat_g * multiplier,
    carbs_g: nutrition.carbs_g * multiplier,
    fiber_g: nutrition.fiber_g * multiplier,
  };
}

function pickNutrition(row: ApiRow): Nutrition {
  return {
    name_tr: row.name_tr,
    // Read-through only — see the Nutrition type above. Never sent back on
    // a write (prepareRow has no food_id field), so the client can never
    // spoof or overwrite the server-assigned value.
    food_id: row.food_id,
    kcal_per_100: row.kcal_per_100,
    protein_g: row.protein_g,
    fat_g: row.fat_g,
    carbs_g: row.carbs_g,
    fiber_g: row.fiber_g,
    // Previously dropped here, which made browseNutrition (and anything
    // built from it, e.g. useFoodCatalog's map) alias-blind while
    // fetchNutrition's POST-by-name path already resolved aliases.
    aliases: row.aliases,
    source: row.source,
    preparation_state: row.preparation_state,
    is_active: row.is_active,
    canonical_name: row.canonical_name,
    equivalent_food_ids: row.equivalent_food_ids,
    equivalent_names: row.equivalent_names,
    // Now sent by api/nutrition.ts's SELECT_COLS (see the
    // Nutrition type above) — carries real curated/regulatory allergen-class
    // data once supabase/14-nutrition-allergen-classes.sql has been applied.
    allergen_classes: row.allergen_classes,
  };
}
