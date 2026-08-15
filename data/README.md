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
