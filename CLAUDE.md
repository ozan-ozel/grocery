# CLAUDE.md

Guidance for Claude Code when working in this repository. See [README.md](README.md) for what
this project is. This file is a router, a set of hard constraints and a behavior layer — not the
architecture doc or the runbook; see "Where things live" below before diving into a subsystem.

## Project constraints

- **Stack:** Preact (not React — shadcn/ui runs unmodified through `preact/compat`), Tailwind v4, Vite on the
  client; Vercel Functions in `api/*.ts` over Supabase on the backend. User-facing copy is Turkish.
- **The project is at Vercel's 12-function Hobby limit.** A new endpoint must fit inside an existing function
  (see the `vercel.json` rewrites) or displace one — [docs/operations.md](docs/operations.md) § Deployment.
- **No tests, no test framework** (see Commands). **Vercel only; deploys are manual** (see Commands).
- **No worktrees:** plain git branches in the shared checkout only.
- **Ask before installing any skill or plugin** — never install one proactively; propose it and wait.
- **Secrets:** the hard boundary below applies to every task.

## Where things live

- **[docs/knowledge-map.md](docs/knowledge-map.md) is the entry point** — a "what should I read for X" table
  plus a registry marking each doc CURRENT, SNAPSHOT or HISTORICAL. Start there before searching `docs/`
  yourself, and load only the section your task needs.
- [docs/architecture.md](docs/architecture.md) — how the app is built: data flow, invariants, API surface,
  auth/session, state & persistence, tenants & RLS, sync, boot loading, categorization, the nutrition backend,
  UI system. Read the relevant section before touching that subsystem.
- [docs/operations.md](docs/operations.md) — running and deploying: env vars, `vercel dev`, agent sessions,
  `.vercelignore`, the function-count limit, troubleshooting.
- [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) — where the project stands now and how to continue: current
  state, open items, next step. Current state only, not a session log; read it when resuming.
- [docs/claude-interaction-model.md](docs/claude-interaction-model.md) — the task lifecycle (discover → plan →
  implement → validate → promote → checkpoint → close) and skill routing.
- [supabase/](supabase/) — the database schema is the numbered migration files `01`–`28`, applied in order;
  there is no single canonical schema file (`01-schema.sql` only holds the early tables, several of them
  unused today, and the repo has no `CREATE TABLE` for `nutrition`). For column names/types, read the
  migration that creates or alters the table; `docs/architecture.md` (Persistence & schema map) says which
  file that is. Treat the SQL, not prose descriptions of it, as authoritative.

## UI patterns

- **Smooth Pill (SP)** — the app's standard tab style. Use `<SmoothPillTabs>` from
  [src/components/ui/smooth-pill.tsx](src/components/ui/smooth-pill.tsx), or its `SP_CONTAINER_CLASS` /
  `SP_TRIGGER_CLASS` constants for a Radix `TabsTrigger` that must also drive a `Tabs` root (the constant already
  cancels the base trigger's `border-b-2` underline). Don't restyle tabs by hand.
- **Bottom sheets** — build new ones on [src/components/ui/bottom-sheet.tsx](src/components/ui/bottom-sheet.tsx),
  not a hand-rolled overlay (swipe-to-dismiss, keyboard-aware sizing). Give the sheet's scrolling list
  `min-h-0 overflow-y-auto overscroll-contain` so it, not the search field, shrinks under the keyboard.

Full detail (classes, the `shadow-signal-sm` token, the keyboard/visual-viewport hooks, `data-sheet-no-drag`,
`useRevealAboveKeyboard`): [docs/architecture.md](docs/architecture.md) § Design tokens & theming → UI patterns.

## Session continuity

- `docs/CURRENT_STATE.md` is the single active continuation guide — where the project stands now, what remains,
  and how to continue. It holds **current state only** (state, bounded open items, the next step), never a
  session history.
- `docs/session-checkpoints/` is the separate, historical record of what happened in past collaboration sessions;
  it is not a substitute for `CURRENT_STATE.md`, and `CURRENT_STATE.md` is not a log. After creating a branch for
  a plan or task, create a dated session record there and add it to the index in
  `docs/session-checkpoints/README.md`; use an ISO date prefix and sequence number so records sort
  chronologically. Checkpoints are historical snapshots: normally preserved as written, and never rewritten into
  a current-state record (a factual or status correction, e.g. a branch that has since merged, is fine when
  needed).
- Historical session logs belong outside the repository in `~/vault/grocery/logs/` and are written
  only for meaningful session history, not every conversation.
- How the app works today is documented in the repo (`docs/architecture.md`, `docs/operations.md`), not in the
  vault; `~/vault/grocery/architecture/` is for history and cross-project material.
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
3. Is this significant enough to need a `docs/session-checkpoints/` record? → create one and add it to
   `docs/session-checkpoints/README.md`'s index.
4. Did this add or change a durable fact (an endpoint, table, env var, persisted key, invariant, or command)? →
   update its owner in the same commit (`docs/architecture.md` or `docs/operations.md`), and update the current
   state in `docs/CURRENT_STATE.md`.

If none apply, say so explicitly in the session wrap-up rather than silently skipping this section.

## Git shorthand

- **Start every piece of coding work on a new local branch, before writing any code** — not just
  before committing. Never write implementation code with `master` checked out, even if you intend
  to branch later; create and switch to the branch first (named for what the work does), then
  start. This applies whether the work is one file or a multi-task implementation plan (e.g.
  subagent-driven-development executing in this checkout — plain git branches only, no worktrees).
- **Commit only when asked.** Implement and verify, then stop; the user commits (CMP / BCMP / LCMP) after testing
  themselves.
- **Branch names start with a logical prefix** — `feature/`, `fix/`, `refactor/`, `test/`, `chore/`, `docs/`, …
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
  4. **Durable facts** (Close-out item 4): flag any changed endpoint, table/migration, environment variable,
     persisted key, command/script, or other durable repository fact whose owner documentation is not updated
     or whose documented owner is now stale. Owners: `docs/architecture.md` (endpoints, tables, persisted keys,
     invariants) and `docs/operations.md` (env vars, commands, scripts). This is a flag for the human to judge,
     not a proof of semantic correctness.
  5. **`.vercelignore`**: flag a diff that still has the `api/agent-login.ts` line commented out or a
     `#AGENT-SESSION-TEMP#` marker in `.vercelignore` — deploying with it pushes 13+ functions and fails the
     Hobby limit (or ships the login endpoint). See "Agent sessions and browser QA" below for why.
  `SYNC` only reports; it never edits files or stages/commits anything itself. Run it standalone,
  immediately before `CMP`/`BCMP`/`LCMP`/`LBCMP` — never as an automatic step inside them — since it's
  checking the diff that's about to be committed, not something to run before the diff exists.
- **COL** = collaboration checkpoint for the nutrition-curriculum plan/implementation handoff. When
  the user says "COL", follow the resume procedure defined in
  `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md`. That procedure now reads every continuity
  index before resuming — `IMPLEMENTATION_HANDOFF.md`'s own Active/Closed tables,
  `nutrition-curriculum/DEC_REGISTER.md`, `docs/mvp-scope/README.md`'s status column,
  `docs/superpowers/plans/README.md` for any plan touching a nutrition domain, and
  `docs/CURRENT_STATE.md` for unresolved general-app continuity — not `IMPLEMENTATION_HANDOFF.md`
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
                       #   This is what production actually runs (env: see docs/operations.md § Environment).
npm run deploy        # vercel — preview deploy (throwaway URL), manual
npm run deploy:prod   # vercel --prod — production deploy, manual
```

**Local env for `vercel dev`.** It never reads `.env.local`; it uses the repo-root `.env` if one exists (which
replaces the linked project's Development vars entirely). The developer copies `.env.local` to `.env` in their own
terminal; never run bare `vercel env pull`. Details: [docs/operations.md](docs/operations.md) § Environment.

**Deploys are manual only.** Nothing deploys on `git push` or on merging to `master` (no GitHub
integration on this project); a change goes live only when the developer runs `npm run deploy:prod`,
which ships the local filesystem, not a git ref. Claude never runs `deploy`/`deploy:prod` unless
explicitly asked, and doesn't describe a push as a release. Before a deploy, `.vercelignore` must still
list `api/agent-login.ts` as a live line, with no `#AGENT-SESSION-TEMP#` marker (see "Agent sessions" below).

There is no test suite and no lint script in this repo — `npm run build`'s `tsc -b` is the only
automated check. Run it after any change to confirm the types still hold.

**Do not add a test suite, a test framework, or test files, and do not propose tests as part of a
plan.** Vitest and its 9 test files were deliberately removed. Verify work by running `tsc -b`/the
build, and by exercising the actual app (`npm run vercel:dev`) when behavior matters. If a change
genuinely needs a check beyond that, write the smallest possible one-off script, run it, and delete
it — do not leave a standing test behind.

All backend logic lives under `api/*` (Vercel functions), with shared helpers in `lib/` (e.g.
`lib/auth.ts`). A former `functions/api/*` Cloudflare Pages path and, later, a parallel
`netlify/functions/*` deploy were both retired (see git history and
`docs/archive/netlify-vercel-migration-plan.md`); Vercel is what's actually deployed now.

One-off nutrition data seeding (`scripts/upload-nutrition.ts`, which loads `.env.local`) is developer-run only —
Claude never runs it (see "Secrets and environment files" above). Procedure and data shape:
[docs/operations.md](docs/operations.md) § Data seeding and `data/README.md`.

## Agent sessions and browser QA

Driving the app in a browser is allowed only through the split agent-session flow; the full procedure, the
`.vercelignore` mechanics and troubleshooting are in [docs/operations.md](docs/operations.md) § Agent sessions.

- Plain Playwright tools first (`navigate` / `click` / `snapshot` / `screenshot` / read-only `evaluate`);
  `browser_run_code_unsafe` only when nothing else fits.
- Sign in only through `agent-login` mint/redeem against the local `npm run vercel:dev`. **Claude** runs
  `npm run agent-session -- up | down | status` (secret-free; it may start `vercel:dev` this way when a task needs
  it); **the developer** runs `npm run agent-mint` in their own terminal and pastes the redeem URL. Claude never
  reads `.env` / `.env.local`, never sees, generates, writes, prints, copies or compares the secret, and never uses
  `node --env-file` (see "Secrets and environment files" above). The developer rotates the secret by hand.
- Check `:3000` first: if it answers, reuse it and never start a second dev server on top of it. A server Claude did
  not start is never stopped or restarted without the developer's explicit go-ahead (it may be their live session,
  possibly behind ngrok for phone testing); find the exact process listening on `:3000` rather than sweeping
  ports; only stop servers Claude started (`agent-session` enforces this by PID + process start time).
- **Never merge `agent-login` into a deployed function.** `.vercelignore` keeps `api/agent-login.ts` out of
  production (12-function limit) and `vercel dev` honors it too, so `agent-session` comments the line out
  temporarily. **SYNC** (§ Git shorthand, check 5) must flag a diff that still has the line commented out or a
  `#AGENT-SESSION-TEMP#` marker in `.vercelignore` — deploying with it pushes 13+ functions and fails the Hobby
  limit (or ships the login endpoint).
- Leave the test account as found; use a throwaway account (`agent-mint --email x@local.dev`) for anything
  destructive such as `/api/auth-delete-account`; keep screenshots out of the repo root.

## Serena (optional MCP server)

[Serena](https://github.com/oraios/serena) is an optional semantic-code MCP server, picked up automatically from
`.mcp.json`; it gives faster symbol-level edits than plain grep/read but the repo is fully usable without it.
Setup and file layout: [docs/operations.md](docs/operations.md) § Optional tooling. Delete or gitignore
`.mcp.json` locally to disable it.
