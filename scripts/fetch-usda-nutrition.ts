// Fetches nutrient values for the fdc_ids curated in scripts/usda-mapping.json
// and upserts them (by name_tr) into data/nutrition.json. Every id in the
// mapping was hand-picked and verified against the USDA FoodData Central API
// in advance — this script does not search, it only resolves ids to values,
// so there's no risk of it silently picking the wrong food.
//
// Run with: node --env-file=.env.local --experimental-strip-types scripts/fetch-usda-nutrition.ts
//
// Writes data/nutrition.json in place. Review the git diff, then upload with
// the existing scripts/upload-nutrition.ts.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

type MappingEntry = { name_tr: string; aliases: string[]; fdc_id: number };

type NutritionRow = {
  name_tr: string;
  aliases: string[];
  kcal_per_100: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  source: string;
};

// USDA nutrient numbers for the five fields our schema needs. SR Legacy foods
// report energy under "208"; newer Foundation Foods entries instead report it
// as "957" (Atwater General Factors) — same meaning, different catalog id.
const NUTRIENT_NUMBERS = {
  kcal_per_100: ["208", "957"],
  protein_g: ["203"],
  fat_g: ["204"],
  carbs_g: ["205"],
  fiber_g: ["291"],
} as const satisfies Record<string, string[]>;

function normalize(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}

async function fetchFood(fdcId: number, apiKey: string) {
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fdc_id ${fdcId}: USDA API returned ${res.status}`);
  }
  return (await res.json()) as {
    description: string;
    foodNutrients: { nutrient: { number: string }; amount?: number }[];
  };
}

function extractRow(
  entry: MappingEntry,
  food: { foodNutrients: { nutrient: { number: string }; amount?: number }[] }
): NutritionRow {
  const amounts: Partial<Record<keyof typeof NUTRIENT_NUMBERS, number>> = {};
  for (const fn of food.foodNutrients) {
    for (const [field, numbers] of Object.entries(NUTRIENT_NUMBERS)) {
      const key = field as keyof typeof NUTRIENT_NUMBERS;
      // First matching number wins; numbers are listed in preference order.
      if (amounts[key] !== undefined) continue;
      if ((numbers as readonly string[]).includes(fn.nutrient.number) && typeof fn.amount === "number") {
        amounts[key] = fn.amount;
      }
    }
  }
  const missing = (Object.keys(NUTRIENT_NUMBERS) as (keyof typeof NUTRIENT_NUMBERS)[]).filter(
    (f) => amounts[f] === undefined
  );
  // Fiber is legitimately absent for many foods (meat, oil, dairy) — default
  // to 0 like the rest of the app does. The other four are load-bearing.
  if (missing.some((f) => f !== "fiber_g")) {
    throw new Error(
      `fdc_id ${entry.fdc_id} (${entry.name_tr}): missing nutrient(s) ${missing.join(", ")}`
    );
  }
  return {
    name_tr: normalize(entry.name_tr),
    aliases: entry.aliases.map(normalize),
    kcal_per_100: round1(amounts.kcal_per_100!),
    protein_g: round1(amounts.protein_g!),
    fat_g: round1(amounts.fat_g!),
    carbs_g: round1(amounts.carbs_g!),
    fiber_g: round1(amounts.fiber_g ?? 0),
    source: `USDA fdc_id ${entry.fdc_id}`,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

async function main() {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    console.error("USDA_API_KEY must be set (see .env.local.example).");
    process.exit(1);
  }

  const here = path.dirname(fileURLToPath(import.meta.url));
  const mappingPath = path.resolve(here, "usda-mapping.json");
  const nutritionPath = path.resolve(here, "..", "data", "nutrition.json");

  const mapping = JSON.parse(await readFile(mappingPath, "utf8")) as MappingEntry[];
  const existing = JSON.parse(await readFile(nutritionPath, "utf8")) as NutritionRow[];

  const byName = new Map(existing.map((row) => [normalize(row.name_tr), row]));

  let fetched = 0;
  let failed = 0;
  for (const entry of mapping) {
    try {
      const food = await fetchFood(entry.fdc_id, apiKey);
      const row = extractRow(entry, food);
      byName.set(row.name_tr, row);
      fetched++;
      console.log(`  ${entry.name_tr} <- ${food.description} (fdc_id ${entry.fdc_id})`);
    } catch (err) {
      failed++;
      console.error(`  FAILED ${entry.name_tr}: ${err instanceof Error ? err.message : err}`);
    }
  }

  const merged = [...byName.values()].sort((a, b) => a.name_tr.localeCompare(b.name_tr, "tr"));
  await writeFile(nutritionPath, JSON.stringify(merged, null, 2) + "\n", "utf8");

  console.log(`\nDone. ${fetched} fetched, ${failed} failed. data/nutrition.json now has ${merged.length} row(s).`);
  console.log("Review the diff, then run scripts/upload-nutrition.ts to push to Supabase.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
