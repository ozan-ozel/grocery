# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev          # Vite dev server, client only — /api/* calls will 404 (no Pages Functions here)
npm run build         # tsc -b (typecheck src/) && vite build -> dist/
npm run preview       # serve the built dist/ (still no /api/*)
npm run pages:dev     # wrangler pages dev dist --kv STATE — serves dist/ AND functions/api/* locally
                       #   with a local KV binding. Run `npm run build` first. Needs .dev.vars
                       #   (copy .dev.vars.example) for /api/nutrition's Supabase calls.
npm run deploy        # build && wrangler pages deploy dist
```

There is no test suite and no lint script in this repo — `npm run build`'s `tsc -b` is the only
automated check. Run it after any change to confirm the types still hold.

One-off nutrition data seeding (bypasses the app, writes straight to Supabase):
```bash
node --env-file=.env.local --experimental-strip-types scripts/upload-nutrition.ts
```
Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (see `.env.local.example`).
Source data lives in `data/nutrition.json`; row shape is documented in `data/README.md`.

## Architecture

**Preact standing in for React.** `@preact/preset-vite` aliases `react`/`react-dom`/`react/jsx-runtime`
to `preact/compat` (mirrored in `tsconfig.json` `paths` for the type checker), which is what lets
shadcn/ui components — plain React source using Radix — run unmodified from `src/components/ui/`.
When adding a new shadcn component with the CLI, watch for ref-type mismatches on Radix `Slot`
(`asChild`); see the workaround in `ui/button.tsx`.

**All state lives in `App.tsx`**, held as one object and pushed down through props — there is no
global store or context. `src/lib/*.ts` holds pure logic and localStorage I/O; components stay
mostly presentational. Persistence is split across several independent layers with different scopes:

| Layer | Key(s) | Scope | Synced to server? |
|---|---|---|---|
| Tenants (households) | `grocery.tenants.v1`, `grocery.activeTenant.v1` | device | no |
| List state (`{ lists, activeId, version }`) | `grocery.state.v1:<tenantId>` | per tenant | yes, via `functions/api/state.ts` |
| Category overlay (renames/hide/reorder/custom) | `grocery.categories.v1` | device | no |
| Item name → category memory | `grocery.itemCategories.v1:<tenantId>` | device, per tenant | no |
| UI prefs (theme, swipe mode) | `grocery.theme.v1`, `grocery.swipeMode.v1` | device | no |

Only list state syncs across devices; category customization and per-item category memory are
device-local even though they're keyed by tenant, so they don't currently follow a household across
phones. Lists are never deleted — starting a new list stamps the old one with `closedAt` and files
it into History; `buildCatalog()` (`src/lib/store.ts`) collapses every item ever added across all
lists into a name/count/last-bought table that backs both the add-field autocomplete and the Find tab.

**Tenants** (`src/lib/store.ts`) model separate households ("Evim" is the default, id `"default"`,
stable across devices so two phones sharing the pre-tenant global blob keep sharing after upgrade).
Switching tenants tears down and recreates the sync channel (see `App.tsx`'s sync `useEffect`) so a
push from tenant A can never land on tenant B.

**Sync** (`src/lib/sync.ts` + `functions/api/state.ts`) is a polling + optimistic-concurrency
scheme, not a websocket: the client polls `GET /api/state?tenant=<id>` every 15s and on tab focus,
and pushes `PUT` 500ms after any local change. The server keeps one Cloudflare KV entry per tenant
holding `{ version, state }`; a `PUT` with a stale `version` gets rejected with 409 and the current
server state, which the client adopts. This is last-write-wins by design — deliberately good enough
for a household of 2-4, not a CRDT. `functions/api/state.ts` has a one-time legacy fallback: the
pre-tenant client wrote to a single `state:global` key, and the `"default"` tenant transparently
reads (and later writes over) that key on its first sync.

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

**Nutrition is a separate backend**, not part of the synced list state. `src/lib/nutrition.ts` calls
`functions/api/nutrition.ts`, a Cloudflare Pages Function that proxies to a Supabase `nutrition`
table via PostgREST: reads use the anon key, writes use the service_role key, both kept server-side
so the client never sees them. `docs/nutrition-prompt.md` is a copy-paste LLM prompt for turning
free-form nutrition text into the row JSON the uploader/bulk-paste UI expects.

**Daily rollover** (`rolloverIfNeeded` in `store.ts`) is client-triggered, not a cron: it runs on
mount, on tenant switch, and on `visibilitychange`. If the active list was created on a previous
calendar day and has items, it's archived (`closedAt`) and a fresh list opens with unchecked items
carried over under new ids. Offered as an undo via the same `Undo` mechanism as item removal.

**Design tokens** live in `src/index.css` under `@theme` (Tailwind v4, no `tailwind.config`):
a cool paper-white/pine-black palette with exactly one accent color (`--color-signal`) reserved for
the progress fill and destructive actions. Quantities, counts, and dates use the `.ledger` utility
(DM Mono, tabular-nums, right-aligned) so they read as a stacked ledger column. Dark mode is a
second token block under `:root[data-theme="dark"]`, toggled by writing `data-theme` on `<html>`.
