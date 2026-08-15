// Upserts data/nutrition.json into Supabase's `public.nutrition` table.
// Run with: node --env-file=.env.local --experimental-strip-types scripts/upload-nutrition.ts
// or via `npx tsx scripts/upload-nutrition.ts` after loading .env.local.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type Row = {
  name_tr: string;
  aliases?: string[];
  kcal_per_100: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g?: number;
  source?: string;
};

function normalize(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}

function assertRow(row: unknown, index: number): asserts row is Row {
  if (!row || typeof row !== "object") {
    throw new Error(`row ${index}: not an object`);
  }
  const r = row as Record<string, unknown>;
  if (typeof r.name_tr !== "string" || r.name_tr.length === 0) {
    throw new Error(`row ${index}: name_tr missing`);
  }
  for (const field of ["kcal_per_100", "protein_g", "fat_g", "carbs_g"]) {
    if (typeof r[field] !== "number" || !Number.isFinite(r[field])) {
      throw new Error(`row ${index} (${r.name_tr}): ${field} must be a finite number`);
    }
  }
  if (r.fiber_g !== undefined && (typeof r.fiber_g !== "number" || !Number.isFinite(r.fiber_g))) {
    throw new Error(`row ${index} (${r.name_tr}): fiber_g must be a finite number`);
  }
  if (r.aliases !== undefined) {
    if (!Array.isArray(r.aliases) || r.aliases.some((a) => typeof a !== "string")) {
      throw new Error(`row ${index} (${r.name_tr}): aliases must be string[]`);
    }
  }
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.local).");
    process.exit(1);
  }

  const here = path.dirname(fileURLToPath(import.meta.url));
  const jsonPath = path.resolve(here, "..", "data", "nutrition.json");
  const raw = await readFile(jsonPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("data/nutrition.json must be a JSON array");
  }

  const rows: Row[] = parsed.map((row, i) => {
    assertRow(row, i);
    return {
      name_tr: normalize(row.name_tr),
      aliases: (row.aliases ?? []).map(normalize),
      kcal_per_100: row.kcal_per_100,
      protein_g: row.protein_g,
      fat_g: row.fat_g,
      carbs_g: row.carbs_g,
      fiber_g: row.fiber_g ?? 0,
      source: row.source,
    };
  });

  if (rows.length === 0) {
    console.log("data/nutrition.json is empty; nothing to upload.");
    return;
  }

  const client = createClient(url, key, { auth: { persistSession: false } });

  const { error } = await client
    .from("nutrition")
    .upsert(rows, { onConflict: "name_tr" });

  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }

  console.log(`Upserted ${rows.length} row(s) into public.nutrition.`);

  const { data: sample, error: readErr } = await client
    .from("nutrition")
    .select("name_tr")
    .limit(1);
  if (readErr) {
    console.warn("Smoke read failed:", readErr.message);
  } else {
    console.log(`Smoke read OK (${sample?.length ?? 0} row visible via service key).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
