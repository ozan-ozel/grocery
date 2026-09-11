# CLAUDE.md

Guidance for Claude Code when working in this repository. See [README.md](README.md) for what
this project is. This file is a router and behavior layer, not the architecture doc — see
"Where things live" below before diving into a subsystem.

## Where things live

- [docs/claude-interaction-model.md](docs/claude-interaction-model.md) — how Claude approaches every
  task: the doc-reading sequence, skill checks, and decision pipeline. Read this to understand how
  Claude Code makes decisions in this repository.
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

## Session continuity

- `docs/SESSION_CHECKPOINT.md` is the single active project checkpoint. It records the current
  state and what the next agent needs to continue.
- Historical session logs belong outside the repository in `~/vault/grocery/logs/` and are written
  only for meaningful session history, not every conversation.
- Project-specific durable architecture notes belong in `~/vault/grocery/architecture/`.
- Cross-project durable knowledge belongs in `~/vault/permanent/`.
- The Vault is outside the repository and must not be committed to Git. The repository remains the
  source of truth for source code and project files.

## Git shorthand

- **Start every piece of coding work on a new local branch, before writing any code** — not just
  before committing. Never write implementation code with `master` checked out, even if you intend
  to branch later; create and switch to the branch first (named for what the work does), then
  start. This applies whether the work is one file or a multi-task implementation plan (e.g.
  subagent-driven-development executing in this checkout rather than a separate worktree).
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
- **COL** = collaboration checkpoint for the nutrition-curriculum plan/implementation handoff. When
  the user says "COL", follow the resume procedure defined in
  `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` — it checks the tracker and resumes from there.
  Planner/implementer are fluid roles in that system, not fixed people, so `COL` asks which applies
  whenever the continuation point is ambiguous rather than assuming. It is not a git shorthand like
  CMP/BCMP; it never commits/merges/pushes by itself.

## Commands

```bash
npm install
npm run dev          # Vite dev server, client only — /api/* calls will 404 (no functions here)
npm run build         # tsc -b (typecheck src/) && vite build -> dist/
npm run preview       # serve the built dist/ (still no /api/*)
npm run vercel:dev    # vercel dev — the real local stack: Vite + every api/*.ts, proxied on :3000.
                       #   This is what production actually runs. Reads Supabase creds from
                       #   .env.local automatically.
```

There is no test suite and no lint script in this repo — `npm run build`'s `tsc -b` is the only
automated check. Run it after any change to confirm the types still hold.

**Do not add a test suite, a test framework, or test files, and do not propose tests as part of a
plan.** Vitest and its 9 test files were deliberately removed. Verify work by running `tsc -b`/the
build, and by exercising the actual app (`npm run vercel:dev`) when behavior matters. If a change
genuinely needs a check beyond that, write the smallest possible one-off script, run it, and delete
it — do not leave a standing test behind.

All backend logic lives under `api/*` (Vercel functions), with shared helpers in `lib/` (e.g.
`lib/auth.ts`). A former `functions/api/*` Cloudflare Pages path and, later, a parallel
`netlify/functions/*` deploy were both retired (see git history / `docs/roadmap.md`); Vercel is
what's actually deployed now.

One-off nutrition data seeding (bypasses the app, writes straight to Supabase):

```bash
node --env-file=.env.local --experimental-strip-types scripts/upload-nutrition.ts
```

Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (see `.env.local.example`).
Source data lives in `data/nutrition.json`; row shape is documented in `data/README.md`.

## Serena (optional MCP server)

[Serena](https://github.com/oraios/serena) is an optional semantic-code MCP server. Claude Code
picks it up automatically from `.mcp.json`; other MCP-capable clients can point at it themselves.
It's optional — the repo is fully usable without it — but it gives faster and more accurate
symbol-level edits than plain grep/read.

Requirements: [`uvx`](https://docs.astral.sh/uv/) on your `PATH`. First run of `uvx --from
git+https://github.com/oraios/serena serena ...` fetches Serena into the uv cache; nothing to
install manually.

Files in this repo:

- `.mcp.json` — MCP server registration, uses `"."` for the project path so it works from any
  checkout location.
- `.serena/project.yml` — checked-in project config (language server: typescript, etc.).
- `.serena/cache/`, `.serena/memories/`, `.serena/project.local.yml` — per-developer state,
  gitignored.

If you don't want it running, delete or gitignore `.mcp.json` locally.
