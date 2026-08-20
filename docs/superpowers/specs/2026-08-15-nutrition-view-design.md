# Nutrition view — design

**Status:** shipped
**Author:** Ozan (with Claude)
**Date:** 2026-08-15

> **Historical note (2026-08-20):** This spec predates the Netlify migration.
> The Problem, Non-goals, Architecture, and Data model sections below still
> describe how nutrition actually works and why. The **Deployment** section is
> Cloudflare-Pages-era and no longer accurate — see `CLAUDE.md` for the real
> (Netlify + Supabase) deployment story. The fetch script also never shipped as
> `scripts/build-nutrition.ts` / `pnpm run build:nutrition`; the real file is
> `scripts/fetch-usda-nutrition.ts`, run directly via `node`, same as
> `scripts/upload-nutrition.ts` (see `CLAUDE.md`'s seeding command). Kept as-is
> below for history rather than silently rewritten.

## Problem

The grocery list has no nutritional context. A user filling a weekly cart
has no idea whether the list leans heavy on fat, is short on protein, or
totals a reasonable calorie load. Open Food Facts was considered but its
strength is barcoded products, not generic Turkish ingredients like
"elma" or "süt". We need name-based nutrition, curated for Turkish
grocery vocabulary.

## Non-goals

- Portion math. v1 shows per-100g values only.
- Per-brand or per-SKU nutrition. Generic ingredients only.
- Barcode scanning.
- Offline nutrition. The list itself stays offline; the nutrition
  view requires network.
- Sync of nutrition data per tenant. The table is global read-only.
- Nutrient depth beyond kcal + protein + fat + carbs.
- User-editable nutrition values from the app.

## Users and success criteria

- User opens the new "Besin" tab and, within one network round-trip,
  sees per-item kcal / protein / fat / carbs plus a list total.
- Items missing from the nutrition table render "-" and are logged
  locally so the curator (Ozan) can add them to the source JSON.
- Adding a new food to the curated JSON, re-running the upload script,
  and reloading the app is the only step required to fix a "-".

## Architecture

Three pieces, each independently owned:

1. **Curated JSON dataset** (`data/nutrition.json`, checked into git)
   Source of truth. Draft generated from USDA FoodData Central; Ozan
   reviews and edits.

2. **Supabase table** (`public.nutrition`)
   Runtime store the client queries. Populated by an upload script from
   the JSON. Public read via RLS; writes only via service key.

3. **Client nutrition module + view** (`src/lib/nutrition.ts`,
   `src/components/NutritionView.tsx`)
   Fetches values for the current list on view open, renders rows and
   totals, logs misses.

### Data flow

```
USDA FoodData Central
        │  (one-time, offline)
        ▼
scripts/build-nutrition.ts  ──►  data/nutrition.json  (in repo)
                                       │
                                       │  (manual)
                                       ▼
                        scripts/upload-nutrition.ts
                                       │
                                       ▼
                          Supabase table `nutrition`
                                       │
                                       │  (client, on view open)
                                       ▼
                      src/lib/nutrition.ts fetches
                                       │
                                       ▼
                        src/components/NutritionView.tsx
```

## Data model

### `data/nutrition.json` (repo)

```jsonc
[
  {
    "name_tr": "süt",
    "aliases": ["tam yağlı süt", "yarım yağlı süt", "uht süt"],
    "kcal_per_100": 61,
    "protein_g": 3.2,
    "fat_g": 3.3,
    "carbs_g": 4.8,
    "source": "USDA fdc_id 171265"
  },
  {
    "name_tr": "elma",
    "aliases": [],
    "kcal_per_100": 52,
    "protein_g": 0.3,
    "fat_g": 0.2,
    "carbs_g": 13.8,
    "source": "USDA fdc_id 171688"
  }
]
```

Names are stored lowercased, trimmed, tr-TR normalized (same normalizer
used in `src/lib/itemCategories.ts`). Aliases cover Turkish variants that
map to the same nutritional profile. Aliases carry no extra data — they
just point at the parent row.

### Supabase table

```sql
create table public.nutrition (
  name_tr text primary key,
  aliases text[] not null default '{}',
  kcal_per_100 numeric not null,
  protein_g numeric not null,
  fat_g numeric not null,
  carbs_g numeric not null,
  source text,
  updated_at timestamptz not null default now()
);

create index nutrition_aliases_gin on public.nutrition using gin (aliases);

alter table public.nutrition enable row level security;

create policy "read all" on public.nutrition
  for select
  to anon, authenticated
  using (true);
```

Writes happen only from the upload script using the service_role key
and bypass RLS. No client-side write path exists.

### Client type

```ts
export type Nutrition = {
  name_tr: string;
  kcal_per_100: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};

export type NutritionMap = Map<string, Nutrition>; // key: normalized item name
```

## Components

### `scripts/build-nutrition.ts` (Node)

Input: a seed list of ~500 Turkish grocery names (starts from the
keyword lists in `src/lib/categories.ts`, deduped).
Process:
- For each name, translate to English via a static override map first,
  then fall back to a simple dictionary. Names that can't be mapped are
  written to `scripts/build-nutrition.missing.txt` for manual review.
- Call USDA FoodData Central `/foods/search` with the English name,
  filter to `dataType=Foundation,SR Legacy`, take the top hit.
- Extract kcal (nutrientId 1008), protein (1003), fat (1004), carbs
  (1005) per 100g.
- Emit `data/nutrition.json` sorted by `name_tr`.

USDA API key: developer.nal.usda.gov, free, unlimited. Store in
`.env.local` as `USDA_API_KEY`.

The script is offline tooling. Not shipped, not run at deploy. Rerun
manually when we want to refresh or extend.

### `scripts/upload-nutrition.ts` (Node)

Reads `data/nutrition.json` and upserts every row into Supabase using
the service_role key. Idempotent. Uses `on conflict (name_tr) do update`.

Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

### `src/lib/nutrition.ts`

Public interface:

```ts
export type Nutrition = { … };

export async function fetchNutrition(
  names: string[]
): Promise<Map<string, Nutrition>>;
```

Behavior:
- Normalize each input name (`name.trim().toLocaleLowerCase("tr-TR")`).
- Deduplicate.
- Single Supabase query: `select * from nutrition where name_tr in (…) or aliases && $normalized_names`.
- Build a map keyed by every matched `name_tr` and every alias in each
  matched row, all pointing at the same `Nutrition` object.
- Return the map.

The module owns a Supabase client created from
`import.meta.env.VITE_SUPABASE_URL` and
`import.meta.env.VITE_SUPABASE_ANON_KEY`. If either env is missing at
runtime, `fetchNutrition` returns an empty map and logs a console
warning — the view falls back to all "-".

### `src/components/NutritionView.tsx`

- Consumes `active.items` from the same state hook the other views use.
- On mount and whenever the active list changes, calls `fetchNutrition`
  with the item names.
- Renders a table:
  - One row per item: name, kcal, protein, fat, carbs.
  - Unmatched rows render "-" in all four columns and are collected
    into a local `missing` array logged once per view mount:
    `console.info("[nutrition] missing:", missing)`.
  - Footer row with column totals across matched items only.
- Header disclaimer: "Değerler 100 g / 100 ml içindir." (Values are per
  100 g / 100 ml.)
- Loading state: skeleton rows.
- Empty list: friendly hint to add items first.

### `src/App.tsx` wiring

Add a new `TabsTrigger` "Besin" and a new `TabsContent` rendering
`<NutritionView items={active.items} />`. No other state needed at the
App level — the view is self-contained.

## Error handling

- **Network failure on fetch:** `fetchNutrition` catches and returns an
  empty map. View shows all "-" with a small "Bağlantı hatası" note in
  the footer. No retry loop.
- **Missing env vars:** empty map, console warning, view functions.
- **Malformed row from Supabase:** validated with a light shape check
  (`typeof kcal_per_100 === "number"`), invalid rows dropped from the
  result map.
- **RLS misconfiguration:** manifests as an empty response — treated as
  "no matches". The console warning from the shape check will not fire.
  Acceptable failure mode; the upload script includes a smoke test that
  verifies anon reads work end-to-end.

## Testing

- `scripts/build-nutrition.ts`: unit-test the USDA response parser
  against a fixed sample JSON. No live API in tests.
- `scripts/upload-nutrition.ts`: smoke test against a scratch Supabase
  project (manual, one-time).
- `src/lib/nutrition.ts`: unit-test the normalize + dedupe + map-build
  logic with a mocked Supabase client returning canned rows. Verify
  aliases in the response are indexed into the returned map.
- `src/components/NutritionView.tsx`: no automated tests in v1. Visual
  QA:
  - List with all matched items → totals equal sum of rows.
  - Mixed matched / unmatched → unmatched rows show "-", totals exclude
    them, misses appear in the console.
  - Empty list → empty-state message.
  - Offline / no env → all "-", "Bağlantı hatası" note visible.

## Deployment

- Add `@supabase/supabase-js` to `dependencies`.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Cloudflare
  Pages build-time env vars for both preview and production.
- Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `USDA_API_KEY` to
  `.env.local` (never committed). Script files read them via `dotenv`
  or Node's built-in `--env-file` flag.
- No change to the Cloudflare Pages deploy command.

## Migration / rollout

Fresh feature, no migration. Rollout steps:
1. Ozan creates the Supabase table using the SQL above.
2. `pnpm run build:nutrition` produces `data/nutrition.json` (starter
   set of ~200 items to prove the pipeline; expand to 500 over time).
3. `pnpm run upload:nutrition` populates the table.
4. Deploy. The tab appears on the next release.

## Open items post-approval

- Whether the seed list of 500 names should come from the union of the
  `KEYWORDS` map or from Ozan's actual list history. Seed from KEYWORDS
  for coverage; supplement from history if items are still missing
  after v1 ships.
- Whether misses should be pushed to Supabase (a "missing" table the
  curator inspects) rather than just console-logged. Deferred to v2 if
  the local log turns out to be too easy to lose.
