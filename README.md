# Grocery

A minimal grocery list app. Preact + shadcn/ui + Tailwind v4, no backend.

```bash
npm install
npm run dev
```

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
  lib/store.ts        types, localStorage, quantity parsing, item catalogue
  components/ui/      shadcn: button, input, checkbox, tabs
  components/         AddItem, ActiveList, HistoryView, SearchView
  App.tsx             all state lives here
```

State is one object — `{ lists, activeId }` — held in `App` and written to
`localStorage` on every change. Lists are never deleted; starting a new list
stamps the old one with `closedAt` and files it into History.

`buildCatalog()` collapses every item ever added into a name/count/last-bought
record. That single derivation backs both the add-field autocomplete and the
Find tab, which is why searching and suggesting stay consistent for free.

## Design notes

Cool paper white, pine-black ink, one accent (`--color-signal`, price-sticker
red) reserved for the tally and destructive actions — nothing else may use it.
Quantities, counts and dates are set in DM Mono and right-aligned so they stack
into a ledger column down the right edge. The hairline under the header fills in
red as you check things off; it's the only moving part.

Tokens are in `src/index.css` under `@theme`.

## Worth adding next

- Offline install (PWA) — this app is used in a shop with bad signal
- Aisle grouping, learned from where you tend to check items off
- Shared lists (needs a backend; everything above is local-only)
