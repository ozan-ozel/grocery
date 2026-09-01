# Nutrition seed dataset

**Supabase is now the source of truth.** `nutrition.json` is a seed file
you can use to bootstrap or backfill the DB. Day-to-day edits happen in the
Besin tab, which writes straight to Supabase via `/api/nutrition` (PUT).

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
  "source": "USDA fdc_id 171265"    // optional provenance note
}
```

Bulk-seed flow (rare):
1. Edit this file.
2. Run `node --env-file=.env.local --experimental-strip-types scripts/upload-nutrition.ts`
   with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local`.
3. The upload upserts by `name_tr`, so re-running is safe.

## `combos.json`

Hand-authored meal-combo suggestions used by the "Bugün" recommendation engine
(`src/lib/comboMatch.ts`). Each row:

- `id` — stable string id.
- `name_tr` — display name.
- `items` — `{ food_id, grams }[]`. `food_id` must be an existing `name_tr` value in
  `nutrition.json` (checked at suggestion time via `lookupNutrition`; a combo with an
  unmatched `food_id` is silently skipped rather than shown with wrong totals).
- `prep_minutes` — rough hands-on time.
- `tags` — free-form, not filtered on yet; informational only for now.

Unlike `nutrition.json`, this file is not uploaded to Supabase — it's bundled directly into
the client build and edited by hand.
