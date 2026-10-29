# Nutrition seed dataset

**Supabase is now the source of truth.** `nutrition.json` is a seed file
you can use to bootstrap or backfill the DB. Day-to-day edits go through the
hidden maintenance upload in Settings, which writes to Supabase via
`/api/nutrition` (PUT, admin accounts only — see `docs/architecture.md`
§ Nutrition). Ordinary users cannot edit nutrition values.

Row schema:

```jsonc
{
  "name_tr": "süt",                 // lowercase, trimmed, tr-TR normalized
  "aliases": ["tam yağlı süt"],     // extra names that map to the same row
  "kcal_per_100": 61,
  "protein_g": 3.2,
  "fat_g": 3.3,
  "carbs_g": 4.8,
  "fiber_g": 0,                     // optional in JSON, defaults to 0
  "source": "USDA fdc_id 171265",   // optional provenance note
  "preparation_state": "çiğ",       // optional: what the grams weigh (raw, dry, drained…)
  "is_active": true,                // optional: false retires a row from new choices, never deletes it
  "canonical_name": "ceviz"         // optional: retired duplicate → its active twin's name_tr
}
```

The last three need `supabase/29-nutrition-catalog-polish.sql` applied first. Equivalence id groups and
allergen-class mappings are set by migration, not by this file. Decisions behind the 2026-10-29 catalog:
`catalog-review-2026-10-29.md`.

Bulk-seed flow (rare):
1. Edit this file.
2. Run `node --env-file=.env.local --experimental-strip-types scripts/upload-nutrition.ts`
   with `SUPABASE_URL` and `SUPABASE_SECRET_KEY` set in `.env.local`.
3. The upload upserts by `name_tr`, so re-running is safe.

## `ready-meals.json`

Hand-authored ready-made meals ("Hazır Yemekler") used by the Meal Plan's Yemekler picker. Loaded by
`src/lib/readyMeals.ts`, scored by `src/lib/mealMatch.ts`. Their ids are stored in `meal_entries.combo_id` and
`preparation_batches.source_combo_id` (column names predate the rename), so never change an existing id. Each row:

- `id` — stable string id.
- `name_tr` — display name.
- `items` — `{ food_id, grams }[]`. `food_id` is checked at suggestion time against the
  live Supabase `nutrition` table (fetched via `/api/nutrition`, looked up with
  `lookupNutrition`), not directly against this repo's `nutrition.json` — that file only
  seeds the table and can drift from it. A meal whose `food_id` has no live match is
  silently skipped rather than shown with wrong totals, so a name that's correct in
  `nutrition.json` but was later renamed/removed in Supabase would quietly drop that meal.
- `prep_minutes` — rough hands-on time.
- `tags` — only `kahvalti`, `ara-ogun` and `atistirmalik` are used (the "Sana uygun" slot filter in
  `src/lib/mealRecommend.ts`); leave the array empty for a main meal. Other tags are not read by anything.
- `prep_note` — optional, concise textual preparation note (DEC-067 Level 1). Plain descriptive
  text only — not structured steps, not a recipe. Omit the key entirely for meals with no note.

Unlike `nutrition.json`, this file is not uploaded to Supabase — it's bundled directly into
the client build and edited by hand.
