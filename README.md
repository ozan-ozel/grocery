# Grocery

A grocery list app for Turkish households. Preact + shadcn/ui + Tailwind v4 on the client,
synced per household across devices via Supabase + Netlify Functions.

```bash
npm install
npm run netlify:dev   # real local stack — Vite + every netlify/functions/*, proxied on :8888
```

`npm run dev` also works for client-only UI work, but `/api/*` calls 404 without `netlify:dev`.
See [CLAUDE.md](./CLAUDE.md) for the full command reference and
[docs/architecture.md](./docs/architecture.md) for the architecture — persistence layers,
tenants, sync, categorization, nutrition, theming.

## How shadcn/ui runs on Preact

shadcn/ui components are React source files built on Radix. `@preact/preset-vite`
aliases `react`, `react-dom`, and `react/jsx-runtime` to `preact/compat`, so they
run unmodified. The `tsconfig.json` `paths` entry mirrors that for the type checker.

Two things to know when adding more components:

- The shadcn CLI (`npx shadcn@latest add dialog`) writes plain React files into
  `src/components/ui/` — that works fine here. You may need to install the Radix
  package it depends on yourself.
- Components that use `asChild` (Radix `Slot`) can hit a ref type mismatch under
  `preact/compat`. See the one-line workaround in `ui/button.tsx`.

## Structure

```
src/
  lib/            store.ts, utils.ts (shared) + one folder per domain:
                  tenants/, sync/, categorization/, nutrition/, theming/
  components/ui/  shadcn primitives — button, input, checkbox, tabs
  components/     AddItem, ActiveList, HistoryView, SearchView, NutritionView, ...
  App.tsx         all state lives here
netlify/functions/  backend — households, lists, items, nutrition, state
```

Lists are never deleted; starting a new list stamps the old one with `closedAt` and files it
into History. `buildCatalog()` collapses every item ever added into a name/count/last-bought
record, backing both the add-field autocomplete and the Find tab. Full architecture, including
the sync/tenant model, lives in `docs/architecture.md`.

## Design notes

Cool paper white, pine-black ink by default (`light`/"Nane"), with eight other themes to
choose from. Quantities, counts and dates are set in DM Mono and right-aligned so they stack
into a ledger column down the right edge. The hairline under the header fills in with the
theme's accent as you check things off — it's the only moving part.

Tokens are in `src/index.css` under `@theme`.

## What's next

See [docs/roadmap.md](./docs/roadmap.md) for the current list of directions under
consideration — it's a menu, not a commitment.
