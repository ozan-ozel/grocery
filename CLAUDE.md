# CLAUDE.md

Guidance for Claude Code when working in this repository. See [README.md](README.md) for what
this project is. This file is a router and behavior layer, not the architecture doc — see
"Where things live" below before diving into a subsystem.

## Where things live

- [docs/architecture.md](docs/architecture.md) — state & persistence, tenants, sync,
  categorization, the nutrition backend, env vars, daily rollover, design tokens, theming.
  Read the relevant section before touching that subsystem.
- [docs/roadmap.md](docs/roadmap.md) — current status and prioritized next steps; a menu, not a
  schedule. Check here before proposing a new direction so you're not duplicating one already
  weighed.
- [docs/nutrition-prompt.md](docs/nutrition-prompt.md) — copy-paste LLM prompt for turning
  free-form nutrition text into rows for `data/nutrition.json` / the Besin-tab uploader.
- [data/README.md](data/README.md) — row schema and seeding flow for `data/nutrition.json`.
- [supabase/01-schema.sql](supabase/01-schema.sql) — canonical DB schema (`households`, `lists`,
  `items`, `item_category_memory`, `nutrition`). Treat this file, not prose descriptions of it,
  as authoritative for column names/types.
- [docs/superpowers/specs/](docs/superpowers/specs/) — feature specs from past design passes
  (e.g. the nutrition view). Historical rationale; check each spec's own status note before
  trusting implementation details as current.

## Git shorthand

- **Default: never commit straight to `master`.** Every set of ready-to-commit changes gets its
  own branch first, named for what the changes actually do — even if the user just says "commit
  this" without saying BCMP, and even for doc-only changes. Treat every commit request as BCMP
  unless a branch already exists for this work and is currently checked out, in which case plain
  CMP applies from there.
- **CMP** = commit, merge, push. When the user says "CMP" (about a branch with local commits ready),
  commit any outstanding changes, merge that branch into `master`, and push `master` to `origin`.
- **BCMP** = branch, then CMP. When the user says "BCMP" about uncommitted working-tree changes,
  create a new branch named for what the changes actually do, switch to it, then run CMP from there
  (commit on the branch, merge into `master`, push).
- **LCMP** / **LBCMP** = CMP / BCMP, plus a Linear attachment. Run CMP or BCMP as normal, then ask
  the user which Linear issue this belongs to and what to attach (a note/summary, a screenshot, or
  both) before posting it — don't guess the issue or write the note unprompted. See the Linear
  workspace details and branch-naming convention in memory (`linear-github-integration`); the
  `NUT-<n>` issue prefix only does anything once a GitHub PR exists, so plain CMP/BCMP pushes won't
  auto-link regardless.

## Commands

```bash
npm install
npm run dev          # Vite dev server, client only — /api/* calls will 404 (no functions here)
npm run build         # tsc -b (typecheck src/) && vite build -> dist/
npm run preview       # serve the built dist/ (still no /api/*)
npm run netlify:dev   # netlify dev — the real local stack: Vite + every netlify/functions/*
                       #   (households, lists, items, nutrition, state), proxied on :8888. This is
                       #   what production actually runs (see netlify.toml's /api/* redirect).
                       #   Reads Supabase creds from .env.local automatically.
```

There is no test suite and no lint script in this repo — `npm run build`'s `tsc -b` is the only
automated check. Run it after any change to confirm the types still hold.

All backend logic lives under `netlify/functions/*` — a former `functions/api/*` Cloudflare Pages
path was retired (see git history / `docs/roadmap.md`); Netlify is what's actually deployed.

One-off nutrition data seeding (bypasses the app, writes straight to Supabase):
```bash
node --env-file=.env.local --experimental-strip-types scripts/upload-nutrition.ts
```
Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (see `.env.local.example`).
Source data lives in `data/nutrition.json`; row shape is documented in `data/README.md`.
