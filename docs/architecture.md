# Architecture

Deep-dive into how the app is put together: state and persistence, tenants, sync,
categorization, the nutrition backend, env vars, daily rollover, and the design/theming system.
`CLAUDE.md` only routes here — this file is the canonical source for the subsystems below.

For the React/Preact interop notes (why shadcn/ui's React source runs unmodified), see
README.md's "How shadcn/ui runs on Preact" section — not repeated here.

## State & persistence

**All state lives in `App.tsx`**, held as one object and pushed down through props — there is no
global store or context. `src/lib/*.ts` holds pure logic and localStorage I/O; components stay
mostly presentational. Persistence is split across several independent layers with different scopes:

| Layer | Key(s) / store | Scope | Synced to server? |
|---|---|---|---|
| Tenants (households) | Supabase `households` table, via `/api/households` | shared (Supabase) | yes |
| List state (`{ lists, activeId, version }`) | `grocery.state.v1:<tenantId>` (local cache) + Netlify Blobs `state:<tenantId>` | per tenant | yes, via `netlify/functions/state.ts` |
| Category overlay (renames/hide/reorder/custom) | `grocery.categories.v1` | device | no |
| Item name → category memory | `grocery.itemCategories.v1:<tenantId>` | device, per tenant | no |
| UI prefs (theme, swipe mode) | `grocery.theme.v1`, `grocery.swipeMode.v1` | device | no |

Category customization and per-item category memory are still device-local even though they're keyed
by tenant, so they don't follow a household across phones. Lists are never deleted — starting a new
list stamps the old one with `closedAt` and files it into History; `buildCatalog()` (`src/lib/store.ts`)
collapses every item ever added across all lists into a name/count/last-bought table that backs both
the add-field autocomplete and the Find tab.

## Tenants

**Tenants** (`src/lib/store.ts` + `src/lib/households.ts`) model separate households ("Evim" is the
default, id `"default"`). The tenant list isn't device-local: it's rows in Supabase's `households`
table, fetched/created/renamed/deleted through `/api/households` (`netlify/functions/households.ts`,
service_role key for every verb, including reads). On boot `App.tsx` calls `listHouseholds()`; if
Supabase has none yet, it seeds `"default"`/"Evim" via `createHousehold()` so a fresh project still
boots. Deleting a household (`DELETE /api/households?id=`) cascades `lists`/`items`/
`item_category_memory` via Supabase FK constraints and separately clears its `state:<id>` Blob.
Switching tenants tears down and recreates the sync channel (see `App.tsx`'s sync `useEffect`) so a
push from tenant A can never land on tenant B.

## Sync

**Sync** (`src/lib/sync.ts` + `netlify/functions/state.ts`) is a polling + optimistic-concurrency
scheme, not a websocket: the client polls `GET /api/state?tenant=<id>` every 15s and on tab focus,
and pushes `PUT` 500ms after any local change; a `PUT` with a stale `version` gets rejected with 409
and the current server state, which the client adopts. Last-write-wins by design — deliberately good
enough for a household of 2-4, not a CRDT. The backing store is **Netlify Blobs**
(`getStore({ name: "state", consistency: "strong" })`), one key per tenant (`state:<tenantId>`), with
a legacy `state:global` fallback for `"default"` on its first sync. If Blobs has nothing for a tenant
yet, `state.ts` tries a one-time hydration from the Supabase `lists`/`items` tables
(`hydrateFromSupabase()`) before falling back to `state: null` — this only fires for a household that
exists via `/api/households` but has never had a first `/api/state` PUT.

`src/lib/lists.ts` and `src/lib/items.ts` are client wrappers around `netlify/functions/lists.ts` /
`items.ts` (per-row CRUD against the `lists`/`items` tables in `supabase/01-schema.sql`), but
**nothing in the app calls them yet** — no import outside those two files themselves. They read as
scaffolding for eventually replacing the single-blob-per-tenant sync with normalized per-row Supabase
persistence, not a wired-up feature (tracked in `docs/roadmap.md` #1). `supabase/01-schema.sql` also
defines an `item_category_memory` table that likewise has no reader/writer anywhere yet (`docs/roadmap.md` #2).

## Categorization

**Categorization** is three layered pieces, in order of precedence when an item is added:
1. `src/lib/itemCategories.ts` — if this item name was ever manually assigned a category before
   (in this tenant, on this device), reuse it.
2. `src/lib/categories.ts` — otherwise, `categorize(name)` guesses from the built-in Turkish grocery
   taxonomy (aisle layout modeled on Migros/CarrefourSA) using Snowball Turkish stemming, curated
   per-category keyword lists, and a head-noun fallback table for compound names like "chia tohumu"
   or "karabuğday ekmeği" that aren't worth enumerating explicitly.
3. `src/lib/userCategories.ts` — the built-in taxonomy plus per-device renames/hide/reorder/custom
   categories are merged via `mergeCategories()` into the list actually shown in the UI; `diger`
   ("Other") is treated as "uncategorized" everywhere and re-guessed on demand so classifier
   improvements retroactively apply without a data migration.

## Nutrition

**Nutrition is a separate backend**, not part of the synced list state. `src/lib/nutrition.ts` calls
`/api/nutrition`, proxied to `netlify/functions/nutrition.ts` in production, which
proxies to a Supabase `nutrition` table via PostgREST: reads use the anon key, writes use the
service_role key, both kept server-side so the client never sees them. `docs/nutrition-prompt.md` is
a copy-paste LLM prompt for turning free-form nutrition text into the row JSON the uploader/bulk-paste
UI expects.

## Environment variables

**Required env vars** (Netlify site settings for production; `.env.local` or `netlify link` for local
dev via `npm run netlify:dev`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
Most `netlify/functions/*.ts` GETs use the anon key and writes use the service_role key;
`households.ts` is the exception and uses service_role for every verb including reads.
`.env.local.example` only lists `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `USDA_API_KEY` because
it's scoped to the one-off `scripts/upload-nutrition.ts` seeding script — it does not cover
`SUPABASE_ANON_KEY`, which the functions also need.

## Daily rollover

**Daily rollover** (`rolloverIfNeeded` in `store.ts`) is client-triggered, not a cron: it runs on
mount, on tenant switch, and on `visibilitychange`. If the active list was created on a previous
calendar day and has items, it's archived (`closedAt`) and a fresh list opens with unchecked items
carried over under new ids. Offered as an undo via the same `Undo` mechanism as item removal.

## Design tokens & theming

**Design tokens** live in `src/index.css` under `@theme` (Tailwind v4, no `tailwind.config`). The
original two themes (`light`/"Nane", `dark`/"Çam") use exactly one accent color (`--color-signal`)
for both the progress fill and destructive actions — `--color-destructive` is set equal to
`--color-signal` there. That single-accent look was never meant to be a rule the rest of the palette
has to follow, though: newer themes are free to give destructive its own hue where it reads better
(a red "Sil" against a blue or violet primary accent, for instance) — check each theme's own block
rather than assuming they all match. Quantities, counts, and dates use the `.ledger` utility (DM
Mono, tabular-nums, right-aligned) so they read as a stacked ledger column.

**Theming** is a 9-way picker (`src/lib/preferences.ts`'s `THEME_OPTIONS`), not a light/dark toggle —
2 original themes (`light`/"Nane", `dark`/"Çam") plus 7 added later: `grafit`, `arduvaz`, `karbon`
(dark group) and `bulut`, `ipek`, `nova`, `parsomen` (light group). Each is a full
`:root[data-theme="<id>"]` token block in `index.css`; `parsomen` additionally applies a faint
`feTurbulence`-generated paper grain to `body`. `ThemeSwitcher.tsx` renders the picker (grouped
Açık/Koyu), writes the chosen id to `data-theme` on `<html>`, and persists it via
`grocery.theme.v1` in `localStorage`. `THEME_META_COLOR` mirrors each theme's `--color-background`
as a literal hex for the PWA `theme-color` meta tag, since that can't read a CSS custom property.
