# Architecture

Deep-dive into how the app is put together: state and persistence, tenants, sync,
categorization, the nutrition backend, env vars, daily rollover, and the design/theming system.
`CLAUDE.md` only routes here — this file is the canonical source for the subsystems below.

For the React/Preact interop notes (why shadcn/ui's React source runs unmodified), see
README.md's "How shadcn/ui runs on Preact" section — not repeated here.

`src/lib/` groups multi-file domains into folders (`sync/`, `categorization/`) — the ones that
actually gained from it. `households.ts`, `nutrition.ts`, and `preferences.ts` stay flat at the
`src/lib/` root alongside `store.ts` and `utils.ts`: each is a single-file domain today, so a
folder would only add navigation depth with nothing to group. Promote one to a folder if it ever
grows a second file.

## State & persistence

**All state lives in `App.tsx`**, held as one object and pushed down through props — there is no
global store or context. `src/lib/*.ts` holds pure logic and localStorage I/O; components stay
mostly presentational. Persistence is split across several independent layers with different scopes:

| Layer                                          | Key(s) / store                                                                         | Scope             | Synced to server?                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------- |
| Tenants (households)                           | Supabase `households` table, via `/api/households`                                     | shared (Supabase) | yes                                                  |
| List state (`{ lists, activeId, version }`)    | `grocery.state.v1:<tenantId>` (local cache) + Supabase `sync_state` table              | per tenant        | yes, via `netlify/functions/state.ts`                |
| Category overlay (renames/hide/reorder/custom) | `grocery.categories.v1`                                                                | device            | no                                                   |
| Item name → category memory                    | `grocery.itemCategories.v1:<tenantId>` (local cache) + Supabase `item_category_memory` | per tenant        | yes, via `netlify/functions/item-category-memory.ts` |
| UI prefs (theme, swipe mode)                   | `grocery.theme.v1`, `grocery.swipeMode.v1`                                             | device            | no                                                   |

Category customization stays device-local even though it's keyed by tenant. Item category memory
now syncs across devices for the same tenant (NUT-13): the local cache paints instantly, then a
background fetch merges in the server copy (server wins on conflict), and every explicit category
correction pushes to Supabase in addition to localStorage. Starting a new list stamps the old one with
`closedAt` and files it into History rather than deleting it; a list only goes away if the user
explicitly deletes it from History (`deleteList()` in `src/lib/listActions.ts`, undoable like any other
removal). `buildCatalog()` (`src/lib/store.ts`) collapses every item ever added across all *remaining*
lists into a name/count/last-bought table that backs the "Ürün ekle" autocomplete (`AddItem.tsx`) —
so deleting a History entry also drops its items' contribution to that aggregate. There is no
separate "Bul" tab/search view anymore: it was a near-duplicate of the same catalog-backed
suggestion list, so it was folded into `AddItem.tsx` (shows "en çok alınan" on focus even before
typing, with a "Tümünü göster" expand) rather than kept as its own tab.

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

**Sync** (`src/lib/sync/sync.ts` + `netlify/functions/state.ts`) is a polling + optimistic-concurrency
scheme, not a websocket: the client polls `GET /api/state?tenant=<id>` every 15s and on tab focus,
and pushes `PUT` 500ms after any local change; a `PUT` with a stale `version` gets rejected with 409
and the current server state, which the client adopts. Last-write-wins by design — deliberately good
enough for a household of 2-4, not a CRDT. The backing store is the Supabase `sync_state` table
(one row per tenant — `household_id`, `version`, `state jsonb`; see `supabase/06-sync-state.sql`),
with the version check done via a conditional PostgREST `PATCH`. If `sync_state` has nothing for a
tenant yet, `state.ts` tries a one-time hydration from the Supabase `lists`/`items` tables
(`hydrateFromSupabase()`) before falling back to `state: null` — this only fires for a household that
exists via `/api/households` but has never had a first `/api/state` PUT.

`src/lib/sync/lists.ts` and `src/lib/sync/items.ts` are client wrappers around `netlify/functions/lists.ts` /
`items.ts` (per-row CRUD against the `lists`/`items` tables in `supabase/01-schema.sql`), but
**nothing in the app calls them yet** — no import outside those two files themselves. They read as
scaffolding for eventually replacing the single-blob-per-tenant sync with normalized per-row Supabase
persistence, not a wired-up feature (tracked in `docs/roadmap.md` #1). `item_category_memory` (also
in `01-schema.sql`) is wired up — see the Categorization section below.

## Categorization

**Categorization** is three layered pieces, in order of precedence when an item is added:

1. `src/lib/categorization/itemCategories.ts` — if this item name was ever manually assigned a category before
   (in this tenant), reuse it. `useItemCategories()` (`src/hooks/`) paints from the local cache
   immediately on tenant switch, then merges in `item_category_memory` from Supabase in the
   background (server wins on conflict); `rememberCategory()` writes both the local cache and a
   best-effort `PUT /api/item-category-memory` on every explicit correction, so a fix on one device
   reaches the others (NUT-13). Auto-guessed categories (layer 2 below) are never pushed — only
   explicit corrections are remembered.
2. `src/lib/categorization/categories.ts` — otherwise, `categorize(name)` guesses from the built-in Turkish grocery
   taxonomy (aisle layout modeled on Migros/CarrefourSA) using Snowball Turkish stemming, curated
   per-category keyword lists, and a head-noun fallback table for compound names like "chia tohumu"
   or "karabuğday ekmeği" that aren't worth enumerating explicitly.
3. `src/lib/categorization/userCategories.ts` — the built-in taxonomy plus per-device renames/hide/reorder/custom
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

## Personal meal planning

The `Kişisel Plan` section is an additive, device-local personalization surface. It stores one
adult profile in `grocery.personalPlan.v1` and does not write meal plans, shopping lists, or the
legacy `meal_entries` API. The profile collects weight, height, age, an explicit sex-specific
equation convention, activity level, goal, and optional waist measurement. Gender identity is not
inferred from the equation convention.

Targets are estimates: Mifflin-St Jeor estimates resting energy, an activity multiplier estimates
maintenance energy, and maintenance/loss/gain targets apply conservative adjustments. BMI and waist
are context signals only, not diagnoses or direct calorie formulas. The first version is limited to
adults and does not provide automated targets for pregnancy, breastfeeding, minors, eating-disorder
recovery, medical conditions, therapeutic diets, or micronutrient adequacy.

The `Kaynakları göster` switch exposes a feature-to-source map. It links profile and energy
planning to the [NIDDK Body Weight Planner](https://www.niddk.nih.gov/bwp) and
[NCBI Endotext](https://www.ncbi.nlm.nih.gov/books/NBK278991/), activity to
[WHO physical activity guidance](https://www.who.int/news-room/fact-sheets/detail/physical-activity),
macro/fiber ranges to the [National Academies DRI tables](https://www.ncbi.nlm.nih.gov/books/NBK545442/)
and Endotext, and BMI/waist context to Endotext. These references support the formulas and
boundaries but do not turn the feature into medical advice.

## Deployment

**`git push origin master` auto-deploys to Netlify production** — Netlify's GitHub integration
rebuilds and ships on every push to `master`, with no manual step and no confirmation prompt. There
is no separate "staging" push; merging into `master` and pushing it *is* the production release.
Treat a push to `master` with the same weight as clicking "deploy to prod" — because it is one.

A Vercel project (`grocery`, linked via `.vercel/project.json`) also exists from the in-progress
Netlify→Vercel migration (`docs/netlify-vercel-migration-plan.md`, NUT-29). It is **not** wired to
auto-deploy on push — there's no GitHub App access to this repo under that account, so every deploy
is a manual CLI invocation, run from whatever the local working tree looks like at that moment
(uncommitted changes and all — the CLI deploys the filesystem, not a git ref):

- `npx vercel link` — one-time, links this directory to the Vercel project
- `npx vercel dev` — local dev server running Vite + `api/*.ts` together (Vercel's equivalent of `npm run netlify:dev`)
- `npx vercel` — preview deploy to a throwaway `*.vercel.app` URL, doesn't touch production
- `npx vercel --prod` — deploys to `https://grocery-five-ecru.vercel.app`

Until the migration finishes, Netlify is the one auto-deploying platform; Vercel deploys only happen
when someone runs one of the commands above by hand.

## Environment variables

**Required env vars** (Netlify site settings for production; `.env.local` or `netlify link` for local
dev via `npm run netlify:dev`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
Most `netlify/functions/*.ts` GETs use the anon key and writes use the service_role key;
`households.ts` is the exception and uses service_role for every verb including reads.
`.env.local.example` only lists `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `USDA_API_KEY` because
it's scoped to the one-off `scripts/upload-nutrition.ts` seeding script — it does not cover
`SUPABASE_ANON_KEY`, which the functions also need.

`TEST_LOGIN_SECRET` (local-only, optional) enables `netlify/functions/auth-test-login.ts` — a
Google-OAuth bypass that mints a real session cookie for a synthetic test user, for browser-driven
QA without ever touching a real Google account. It only works when unset in production and when
`CONTEXT !== "production"` (Netlify's own build-context var), so it's inert on the deployed site
even if accidentally left set. **Never set it in the production Netlify site's env vars.**

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
rather than assuming they all match. Quantities, counts, and dates use the `.ledger` utility
(`tabular-nums`, right-aligned, app's normal sans font) so they read as a stacked ledger column —
deliberately not a monospace font: most monospace stacks render a slashed zero to disambiguate it
from "O" in source code, which reads as a stray mark in a consumer nutrition/shopping context.

**Theming** is a 9-way picker (`src/lib/preferences.ts`'s `THEME_OPTIONS`), not a light/dark toggle —
2 original themes (`light`/"Nane", `dark`/"Çam") plus 7 added later: `grafit`, `arduvaz`, `karbon`
(dark group) and `bulut`, `ipek`, `nova`, `parsomen` (light group). Each is a full
`:root[data-theme="<id>"]` token block in `index.css`; `parsomen` additionally applies a faint
`feTurbulence`-generated paper grain to `body`. `ThemeSwitcher.tsx` renders the picker (grouped
Açık/Koyu), writes the chosen id to `data-theme` on `<html>`, and persists it via
`grocery.theme.v1` in `localStorage`. `THEME_META_COLOR` mirrors each theme's `--color-background`
as a literal hex for the PWA `theme-color` meta tag, since that can't read a CSS custom property.
