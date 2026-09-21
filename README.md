# Grocery

A grocery list and nutrition-tracking app for Turkish households — shopping lists, meal
planning, and macro/nutrition guidance in one place. Preact + shadcn/ui + Tailwind v4 on the
client, synced per household across devices via Supabase + Vercel Functions.

```bash
npm install
npm run vercel:dev   # real local stack — Vite + every api/*.ts, proxied on :3000
```

`npm run dev` also works for client-only UI work, but `/api/*` calls 404 without `vercel:dev`.
See [CLAUDE.md](./CLAUDE.md) for the command reference and working rules,
[docs/knowledge-map.md](./docs/knowledge-map.md) for a "what should I read for X" routing table,
and [docs/architecture.md](./docs/architecture.md) for the architecture — persistence layers,
tenants, sync, categorization, the nutrition backend, theming.

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
  lib/            store.ts, utils.ts, households.ts, nutrition.ts, preferences.ts, mealPlan.ts,
                  personalPlan.ts, ... (single-file domains, flat) + sync/, categorization/
                  (multi-file domains, folders)
  components/ui/  shadcn primitives (button, input, checkbox, tabs) and shared app UI
                  (bottom-sheet, smooth-pill, suggestion-card, ...)
  components/     AddItem, ActiveList, HistoryView, NutritionView, MealPlanView,
                  PersonalPlanView, SettingsView, ...
  hooks/          state and side-effect hooks (useListSync, useTenants, useAuth, ...)
  App.tsx         composes the hooks and routes between the app's sections
api/             backend — one Vercel function per file (the project is at the
                  12-function Hobby limit); see docs/architecture.md for the list
```

Starting a new list stamps the old one with `closedAt` and files it into History; a list is only
deleted when the user removes it from History. `buildCatalog()` collapses every item ever added
into a name/count/last-bought record, backing the add-field autocomplete. Full architecture,
including the sync/tenant model, lives in `docs/architecture.md`.

## Design notes

Cool paper white, pine-black ink by default, with other themes to choose from (the canonical list is
`THEME_OPTIONS` in `src/lib/preferences.ts`). Quantities, counts and dates use tabular figures (the
`.ledger` utility) and are right-aligned so they stack into a ledger column down the right
edge. The hairline under the header fills in with the
theme's accent as you check things off — it's the only moving part.

Tokens are in `src/index.css` under `@theme`.

## What's next

See [docs/roadmap_v2.md](./docs/roadmap_v2.md) for the nutrition-curriculum MVP scope — a menu, not a
commitment — and [docs/CURRENT_STATE.md](./docs/CURRENT_STATE.md) for current work and open
items. There is no separate app-engineering roadmap; the old one in
[docs/archive/roadmap.md](./docs/archive/roadmap.md) is historical.
