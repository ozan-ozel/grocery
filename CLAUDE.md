# CLAUDE.md

Guidance for Claude Code when working in this repository. See [README.md](README.md) for what
this project is. This file is a router and behavior layer, not the architecture doc — see
"Where things live" below before diving into a subsystem.

## Where things live

- **[docs/knowledge-map.md](docs/knowledge-map.md) is the entry point** — a routing table of every
  canonical doc in this repo, what it's for, and when to load it. Start there before searching `docs/`
  yourself; only the two exceptions below are worth keeping inline here.
- [docs/claude-interaction-model.md](docs/claude-interaction-model.md) — how Claude approaches every
  task: the doc-reading sequence, skill checks, and decision pipeline. Read this to understand how
  Claude Code makes decisions in this repository.
- [docs/architecture.md](docs/architecture.md) — state & persistence, tenants, sync,
  categorization, the nutrition backend, env vars, daily rollover, design tokens, theming.
  Read the relevant section before touching that subsystem.
- [supabase/01-schema.sql](supabase/01-schema.sql) — canonical DB schema (`households`, `lists`,
  `items`, `item_category_memory`, `nutrition`). Treat this file, not prose descriptions of it,
  as authoritative for column names/types.

## UI patterns

- **Smooth Pill (SP)** — the standard tab style across the app: a light `bg-accent/50` container
  (`rounded-lg p-1`), with the active tab rendered as its own `bg-background` pill
  (`rounded-md shadow-signal-sm`) and inactive tabs as plain
  `text-muted-foreground hover:text-foreground` text, no visible border. `shadow-signal-sm` (defined
  in [src/index.css](src/index.css)) is the same footprint as Tailwind's `shadow-sm` but tinted with
  `--color-signal` via `color-mix` instead of flat black, so it stays theme-aware.
  Implemented once in [src/components/ui/smooth-pill.tsx](src/components/ui/smooth-pill.tsx):
  `<SmoothPillTabs value={...} onChange={...} items={[{ value, label }]} />` for the common case
  (a plain button group not already wired to a Radix `Tabs` root — see its usage in
  [src/components/NutritionView.tsx](src/components/NutritionView.tsx)), plus exported class
  constants (`SP_CONTAINER_CLASS`, `SP_TRIGGER_CLASS`) for a Radix `TabsTrigger` that must also
  drive a `Tabs` root elsewhere in the tree — see the Liste/Geçmiş/Kategoriler tabs in
  [src/components/AppHeader.tsx](src/components/AppHeader.tsx). `SP_TRIGGER_CLASS` already cancels
  the base `TabsTrigger`'s default `border-b-2`/`data-[state=active]:border-foreground` underline
  (from [src/components/ui/tabs.tsx](src/components/ui/tabs.tsx)), which otherwise draws a dark
  bottom border through the pill background — if you ever build a new Radix-based SP trigger by
  hand instead of using the constant, remember to cancel that underline yourself.

- **Bottom sheets** — build new ones on
  [src/components/ui/bottom-sheet.tsx](src/components/ui/bottom-sheet.tsx) (backdrop, dialog, grabber,
  title + close header), not a hand-rolled overlay. It gives you swipe-down-to-dismiss from anywhere on
  the sheet (`useSwipeToDismiss`; mark a region `data-sheet-no-drag` to opt it out) and keyboard-aware
  sizing (the container tracks the visual viewport via the `--visual-vh`/`--visual-top`/`--kb-inset`
  vars that `useVisualViewportVars` publishes from `AppShell`). Give the sheet's scrolling list
  `min-h-0 overflow-y-auto overscroll-contain` so it — not the search field — shrinks under the
  keyboard. For a search whose results render inline below a field, call `useRevealAboveKeyboard`.

## Session continuity

- `docs/SESSION_FOLLOWUP.md` is the single active project checkpoint. It records the current
  state and what the next agent needs to continue.
- After creating a branch for a plan or task, create a dated session record under
  `docs/session-checkpoints/` and link it from `docs/SESSION_FOLLOWUP.md`; use an ISO date prefix
  and sequence number so records sort chronologically.
- Historical session logs belong outside the repository in `~/vault/grocery/logs/` and are written
  only for meaningful session history, not every conversation.
- Project-specific durable architecture notes belong in `~/vault/grocery/architecture/`.
- Cross-project durable knowledge belongs in `~/vault/permanent/`.
- The Vault is outside the repository and must not be committed to Git. The repository remains the
  source of truth for source code and project files.
- **Before starting any task that touches nutrition guidance, macros, meal structure, or another
  domain covered by `docs/roadmap_v2.md`, check whether it maps to a `docs/mvp-scope/*-mvp.md` file
  or a `nutrition-curriculum` `DEC` — do not wait for the task to arrive already framed that way.**
  The trio rule below only fires once that mapping is recognized, and a feature built without ever
  opening `roadmap_v2.md` or the relevant `mvp-scope` file slips past it entirely. If in doubt, check
  `docs/mvp-scope/README.md`'s domain table before writing code, not after.
- **When implementing something scoped by a `docs/mvp-scope/*-mvp.md` file (a `roadmap_v2.md` domain
  doc) or a `nutrition-curriculum` `DEC`, update all of these together, not just the code:** the
  `*-mvp.md` file's own status note, the corresponding line in `docs/roadmap_v2.md`, the DEC's row note
  in `nutrition-curriculum/DEC_REGISTER.md` (link back to the `*-mvp.md` file from that note, e.g. "see
  docs/mvp-scope/macros-mvp.md"), and the session-checkpoint record for the work. These currently drift
  apart silently — this project has already hit a stale checkpoint describing a merged branch as still
  active, and an `IMPLEMENTATION_HANDOFF.md` Closed table that sat empty for four decisions
  `DEC_REGISTER.md` already marked done. Treat a `*-mvp.md`/`DEC_REGISTER.md`/`roadmap_v2.md` update as
  one unit of work, not three optional follow-ups.
- **When a `docs/superpowers/plans/*.md` file's feature ships, flip its row in
  `docs/superpowers/plans/README.md` to `SHIPPED` in the same commit** — that index is the only thing
  tracking these plans' status, and it stays accurate only if this happens at ship time, not as a
  later cleanup pass. Same for `docs/mvp-scope/README.md`'s status column when an MVP-scope item ships.

### Close-out checklist

Run this before reporting any coding session's work as done — don't skip it because the change felt
small; small, unframed changes are exactly what slip past the rules above:

1. Did this touch anything under a `docs/roadmap_v2.md` domain, an `mvp-scope/*-mvp.md` file, or a
   `nutrition-curriculum` `DEC` — even if the task didn't start from one of those files? → update the
   roadmap line, the `mvp-scope` file's status note, `docs/mvp-scope/README.md`'s status column, and
   the `DEC_REGISTER.md` row note together, in the same commit.
2. Did this ship a feature that has (or should have had) a `docs/superpowers/plans/*.md` entry? → flip
   its `docs/superpowers/plans/README.md` row to `SHIPPED` in the same commit.
3. Is this significant enough to need a `docs/session-checkpoints/` record? → create one and link it
   from `docs/SESSION_FOLLOWUP.md`.

If none apply, say so explicitly in the session wrap-up rather than silently skipping this section.

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
- **SYNC** = pre-commit doc-sync check. When the user says "SYNC", check the diff about to be
  committed (`git status --short` / `git diff --name-only` against the merge-base with `master`, plus
  `git diff --stat` for size) against the Close-out checklist above:
  1. **Trio rule**: if any of `docs/roadmap_v2.md`, `docs/mvp-scope/*-mvp.md`, or
     `nutrition-curriculum/DEC_REGISTER.md` is in the diff, all three must be — report which are
     missing rather than proceeding silently.
  2. **Plans index**: if anything under `docs/superpowers/plans/` is in the diff, remind the user to
     check whether the corresponding `docs/superpowers/plans/README.md` row needs a `SHIPPED` flip —
     this is a reminder, not a hard check, since intent can't be read from a filename.
  3. **Session-checkpoint**: flag, from the diff's size/paths, whether this looks significant enough
     to warrant a `docs/session-checkpoints/` record — a judgment call to surface, not to decide.
  `SYNC` only reports; it never edits files or stages/commits anything itself. Run it standalone,
  immediately before `CMP`/`BCMP`/`LCMP`/`LBCMP` — never as an automatic step inside them — since it's
  checking the diff that's about to be committed, not something to run before the diff exists.
- **COL** = collaboration checkpoint for the nutrition-curriculum plan/implementation handoff. When
  the user says "COL", follow the resume procedure defined in
  `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md`. That procedure now reads every continuity
  index before resuming — `IMPLEMENTATION_HANDOFF.md`'s own Active/Closed tables,
  `nutrition-curriculum/DEC_REGISTER.md`, `docs/mvp-scope/README.md`'s status column,
  `docs/superpowers/plans/README.md` for any plan touching a nutrition domain, and
  `docs/SESSION_FOLLOWUP.md` for unresolved general-app continuity — not `IMPLEMENTATION_HANDOFF.md`
  in isolation, so a stale row elsewhere doesn't get missed. Planner/implementer are fluid roles in
  that system, not fixed people, so `COL` asks which applies whenever the continuation point is
  ambiguous rather than assuming. It is not a git shorthand like CMP/BCMP; it never
  commits/merges/pushes by itself.

## Secrets and environment files (hard boundary)

**Claude must never read, inspect, parse, print, compare, expand, source, load, copy, generate, write,
expose or otherwise handle the contents or values of `.env`, `.env.local`, any other `.env*` file (e.g.
`.env.development.local`, anything under `.vercel/` that holds env values), or any other local
environment/secrets file** — nor any value that lives in one, such as `AGENT_LOGIN_SECRET` or
`SUPABASE_SECRET_KEY` (equally `SUPABASE_ANON_KEY`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS` and any future
secret). This holds for direct access and for every indirect route:

- **Loaders:** `node --env-file[=...]`, dotenv (`dotenv`, `process.loadEnvFile`), `vercel env pull`, or any
  script or one-liner that loads an env file and hands the values on.
- **Reading the files:** `cat` / `type` / `Get-Content` / `grep` / `rg` / the Read and Grep tools pointed at
  them, an editor or IDE view driven by Claude, and shell expansion or sourcing (`$VAR`, `$env:X`, `%VAR%`,
  `source`, dot-sourcing).
- **Copying or moving them:** `cp` / `Copy-Item` / `mv`, hardlinks, symlinks — the developer's own local
  copy step (e.g. `.env.local` to `.env` for `vercel dev`) is theirs to run in their own terminal, never Claude's.
- **Runtime state:** inspecting `process.env`, `Get-ChildItem Env:`, `printenv`, `set`, or a process's
  environment block for a secret's value *or* metadata about it (its length, prefix, hash, or whether two
  values are equal) — including Claude's own environment and the `vercel dev` server's.
- **Clipboard:** `Set-Clipboard` / `Get-Clipboard` or any clipboard step that involves a secret.
- **Transfer or exposure helpers:** scripts, hooks or commands whose purpose is to reveal, move or transform
  env values, and anything that would surface one in a log, screenshot, artifact, doc, memory or commit.

The developer generates, rotates and copies secrets by hand in their own terminal; Claude writes no secret
anywhere. If a step seems to need a secret value, stop and ask the developer to do that step themselves —
never work around it, and if a permission check blocks such an action, treat the block as final.

Still fine: reading code that *consumes* env vars (`process.env.X` references), listing env file *names*
(never opening them), `vercel env ls` (names only, values masked), and clearly synthetic placeholder values
(e.g. `TEST_ONLY_NOT_A_REAL_SECRET`) for negative-path tests.

## Commands

```bash
npm install
npm run dev          # Vite dev server, client only — /api/* calls will 404 (no functions here)
npm run build         # tsc -b (typecheck src/) && vite build -> dist/
npm run preview       # serve the built dist/ (still no /api/*)
npm run vercel:dev    # vercel dev — the real local stack: Vite + every api/*.ts, proxied on :3000.
                       #   This is what production actually runs. Function env = the linked project's
                       #   Development vars, or a repo-root `.env` if present — NOT `.env.local`
                       #   (see "Local env for `vercel dev`" below).
npm run deploy        # vercel — preview deploy (throwaway URL), manual
npm run deploy:prod   # vercel --prod — production deploy, manual
```

**Local env for `vercel dev` (Vercel CLI 59.7.0).** `vercel dev` never reads `.env.local`. Function env is
the linked project's Development variables, unless a repo-root `.env` exists — then `.env` replaces them
entirely (all-or-nothing), so it must hold every var the functions need: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AGENT_LOGIN_SECRET` (and `ADMIN_EMAILS` if
used). `AGENT_LOGIN_SECRET` is local-only and deliberately **not** in Vercel Development — never add it
there. `.env.local` stays the developer-managed source of truth; the developer copies it to `.env` in their own
terminal (`Copy-Item .env.local .env -Force`) before an agent session, and `agent-session up` fails its
readiness check without it. `.env` is gitignored and in `.vercelignore`. Never run bare `vercel env pull` (its
default target is `.env.local`).

**Deploys are manual only.** Nothing deploys on `git push` or on merging to `master` (no GitHub
integration on this project); a change goes live only when the developer runs `npm run deploy:prod`,
which ships the local filesystem, not a git ref. Claude never runs `deploy`/`deploy:prod` unless
explicitly asked, and doesn't describe a push as a release. Before a deploy, `.vercelignore` must still
list `api/agent-login.ts` as a live line, with no `#AGENT-SESSION-TEMP#` marker (see the Playwright note below).

There is no test suite and no lint script in this repo — `npm run build`'s `tsc -b` is the only
automated check. Run it after any change to confirm the types still hold.

**Do not add a test suite, a test framework, or test files, and do not propose tests as part of a
plan.** Vitest and its 9 test files were deliberately removed. Verify work by running `tsc -b`/the
build, and by exercising the actual app (`npm run vercel:dev`) when behavior matters. If a change
genuinely needs a check beyond that, write the smallest possible one-off script, run it, and delete
it — do not leave a standing test behind.

All backend logic lives under `api/*` (Vercel functions), with shared helpers in `lib/` (e.g.
`lib/auth.ts`). A former `functions/api/*` Cloudflare Pages path and, later, a parallel
`netlify/functions/*` deploy were both retired (see git history / `docs/archive/roadmap.md`); Vercel
is what's actually deployed now.

**Driving the app with Playwright** (ground rule — the full version is in Claude's memory): plain tools
first (`navigate`/`click`/`snapshot`/`screenshot`/read-only `evaluate`), `browser_run_code_unsafe` only
when nothing else fits; sign in only via the `agent-login` mint/redeem flow against the local
`npm run vercel:dev` (the split `agent-session` / `agent-mint` procedure below — Claude never reads `.env` / `.env.local`
or the secret; see "Secrets and environment files" above); Claude may start `npm run vercel:dev` itself via `agent-session` when a task needs it (changed
since 2026-09-19 — it used to be developer-only). Check `:3000` first: if it answers, reuse it and never start a
second dev server on top of it; a server Claude did not start is never stopped or restarted without the
developer's explicit go-ahead (it may be their live session, possibly behind ngrok for phone testing); find
the exact process listening on `:3000` rather than sweeping ports; only stop servers Claude started
(`agent-session` enforces this by PID + process start time); leave the test account as found; use a throwaway
account (`agent-mint --email x@local.dev`) for anything destructive such as
`/api/auth-delete-account`; keep screenshots out of the repo root.

**`agent-login` and `.vercelignore` (standing procedure, SYNC-checked).** `.vercelignore` lists
`api/agent-login.ts` to keep production within the 12-function Hobby limit, but `vercel dev` honors that
file too — while the line is active, `/api/agent-login` 404s locally. The mint call requires the caller to
present `AGENT_LOGIN_SECRET`, and **Claude never reads `.env` / `.env.local`, never sees, generates, writes,
prints, copies or compares that secret, and never uses `node --env-file`** (full rule: "Secrets and
environment files" above) — the developer rotates it by hand. So an agent
session is split by who may know the secret (never merge `agent-login` into a deployed function instead):
(0) the developer makes sure the repo-root `.env` is current (a copy of `.env.local`, see "Local env for
`vercel dev`" above); (1) Claude runs `npm run agent-session -- up` — starts the local server (or reuses one that already answers
`{"ready":true}`) and *temporarily* comments the `.vercelignore` line out (marker `#AGENT-SESSION-TEMP#`); it
refuses, touching nothing, if `:3000` is held by a server without the endpoint, and never stops a process it
did not start; (2) **the developer** runs `npm run agent-mint` in their own terminal — masked prompt for the
secret, never through Claude Code — and pastes the printed redeem URL (a single-use, 10-minute bearer token) to
Claude; (3) Claude opens it once in the isolated in-memory Playwright browser (no storage-state file) and
tests; (4) Claude runs `npm run agent-session -- down`, which restores the line and stops only the server it
started. Details, the experimental `-EarlyRestore` option and the `*@local.dev` email guard (script-side
only, not an auth boundary) are in [docs/architecture.md](docs/architecture.md). **SYNC** must flag a diff
that still has the line commented out or a `#AGENT-SESSION-TEMP#` marker in `.vercelignore` — deploying with
it pushes 13+ functions and fails the Hobby limit (or ships the login endpoint).

One-off nutrition data seeding (bypasses the app, writes straight to Supabase):

```bash
node --env-file=.env.local --experimental-strip-types scripts/upload-nutrition.ts
```

The developer runs this in their own terminal — Claude never runs it (it loads `.env.local`, see "Secrets
and environment files" above). Requires `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env.local` (see
`.env.local.example`).
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
