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

export async function fetchNutrition(names: string[]): Promise<NutritionMap> {
  const map: NutritionMap = new Map();
  const normalized = Array.from(
    new Set(names.map(normalize).filter((n) => n.length > 0))
  );
  if (normalized.length === 0) return map;

  try {
    const res = await fetch(apiUrl("/api/nutrition"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ names: normalized }),
    });
    if (!res.ok) {
      console.warn("[nutrition] api", res.status);
      return map;
    }
    const rows = (await res.json()) as ApiRow[];
    for (const row of rows) {
      const nutrition = pickNutrition(row);
      map.set(nutrition.name_tr, nutrition);
      for (const alias of row.aliases ?? []) {
        map.set(alias, nutrition);
      }
    }
  } catch (err) {
    console.warn("[nutrition] fetch threw:", err);
  }

  return map;
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
