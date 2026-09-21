# Knowledge Map

A routing index, not an encyclopedia. It says **what to read for a task** and **how much to trust each
document**; it holds no facts of its own. If a fact seems to be missing here, it belongs in the owner doc,
not in this file.

**Load only what your task's row names.** `CLAUDE.md` is already loaded; most tasks need one section of one
doc, not the whole `docs/` tree. The one exception is an explicit repository/architecture analysis, which has its
own comprehensive row below.

**If multiple routing rows match the task, read the union of their referenced sections.** Do not stop after the
first matching row.

**Finding a section.** `architecture.md` headings are its lookup index: list them with
`grep -n '^## ' docs/architecture.md`, then read only the relevant section (from its heading line to the next
`##`). The same works for `operations.md`.

## Status legend

| Status | Meaning |
| --- | --- |
| **CURRENT** | Maintained; the owner of the facts it covers. Volatile values name a symbol or file to read, not a number. |
| **INDEX** | Routes or tracks status; owns no design facts. |
| **SNAPSHOT** | Dated and accurate as of its date; may be superseded. Read only to learn *why*, never for current behavior. |
| **HISTORICAL** | Retired or superseded. Do not read for current behavior. |

If two documents disagree, the **CURRENT** owner in the registry below wins; a SNAPSHOT never overrides it.

## I need to work on… → read this

| I need to… | Read, in order | Skip |
| --- | --- | --- |
| Do any coding task | `CLAUDE.md` (already loaded), `git status` | Everything below, unless your task matches a row |
| **Explicitly analyze, review or audit the repository or its architecture** ("analyze the repository", "analyze / review the architecture", "create an architecture roadmap", "audit the repository"). This is the **comprehensive** route, for explicit analysis requests **only** — never for ordinary development tasks | 1. `CLAUDE.md`; 2. `knowledge-map.md`; 3. the **full** `architecture.md`, in its Contents order; 4. `operations.md`; 5. `CURRENT_STATE.md` when current/open work matters; 6. `README.md` when project orientation matters; 7. source and config as ground truth, as needed — especially `src/`, `api/`, `supabase/`, `vercel.json` (the code wins over the docs on any volatile detail) | Checkpoints, plans, specs, audits and `archive/`, unless a specific question needs history |
| Change UI (component, screen, sheet, theme) | `architecture.md` § Frontend, § Design tokens & theming; the component's own header comment | UI audits, North Star, checkpoints |
| Add or change an API function | `architecture.md` § API surface, § Auth & session, § Security boundaries; `operations.md` § Deployment (12-function limit) | — |
| Change the database (table, migration, RLS) | `architecture.md` § Persistence & schema map, § Supabase RLS, § Core invariants, and § Tenants when households or tenant scoping are involved; then the migration in `supabase/` that owns the table | Treating `01-schema.sql` as "the schema" |
| Touch login, session, cookies, account deletion | `architecture.md` § Auth & session, § Security boundaries, § Core invariants; `lib/auth.ts` header; `api/auth-*.ts` | The migration plans/specs, unless you need the *why* |
| Touch list state, sync, tenants, boot/offline behavior | `architecture.md` § State & persistence, § Tenants, § Sync, § Boot & data loading; plus § Supabase RLS when the change touches server-side household access | — |
| Change categorization | `architecture.md` § Categorization | — |
| Change nutrition data or the nutrition backend | `architecture.md` § Nutrition; `data/README.md`; `docs/nutrition-prompt.md` | — |
| Build a nutrition-guidance, macros or meal-structure feature | `docs/mvp-scope/README.md` → the domain file → its `DEC` rows in `nutrition-curriculum/DEC_REGISTER.md` (find each row by its exact `DEC` id, e.g. with grep — do not read the whole register); `docs/roadmap_v2.md`; then `CLAUDE.md` § Session continuity (the trio rule) | The curriculum phase folders, unless you need the science |
| Work on meal plan, saved meals, the Yemekler sheet, batch prep | `architecture.md` § Personal meal planning; `docs/mvp-scope/meal-construction-mvp.md` **when the task affects meal structure, meal-construction behavior, nutrition semantics or a clearly related concern** (a pure Meal Plan UI change does not need it) | Plans, unless resuming one |
| Run the app, set env, drive a browser, or deploy | `docs/operations.md`; `CLAUDE.md` § Secrets and § Agent sessions | — |
| Resume earlier work | `docs/CURRENT_STATE.md` (current-only), then only the one plan or checkpoint it links | Every other checkpoint |
| Resume the nutrition-curriculum handoff (`COL`) | `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` — it defines its own procedure | — |
| Commit, merge or push (`CMP`, `BCMP`, `LCMP`, `LBCMP`, `SYNC`) | `CLAUDE.md` § Git shorthand | — |
| Finish or close out a task | `CLAUDE.md` § Close-out checklist; `docs/claude-interaction-model.md` § Lifecycle | — |
| Learn why a past feature was built | `docs/superpowers/plans/README.md` (status) → the plan → its spec → the checkpoint index | Treat all of them as SNAPSHOTs |
| Restore retired code | `archive/README.md` | — |
| See what is planned next | `docs/roadmap_v2.md` (nutrition scope); `docs/CURRENT_STATE.md` § Open items. **There is no app roadmap.** | `docs/archive/roadmap.md` (HISTORICAL) |
| Understand how Claude approaches a task | `docs/claude-interaction-model.md` | — |

## Document registry

| Document | Status | Owns | Read when |
| --- | --- | --- | --- |
| `README.md` | CURRENT | What the project is; how to start it | Product or setup questions |
| `CLAUDE.md` | CURRENT | Working rules: git, secrets boundary, commands, definition of done | Always (auto-loaded) |
| `docs/knowledge-map.md` | INDEX | This routing | Choosing what to read |
| `docs/claude-interaction-model.md` | CURRENT | The task lifecycle and context-loading process | Process questions |
| `docs/architecture.md` | CURRENT | How the app is built: data flow, invariants, API surface, auth, persistence, sync, boot, categorization, nutrition, UI system | The section your task row names |
| `docs/operations.md` | CURRENT | Env, `vercel dev`, agent sessions, `.vercelignore`, deploys, troubleshooting | Running, testing in a browser, or deploying |
| `docs/CURRENT_STATE.md` | CURRENT | Where the project stands now and how to continue: current state, open items, next step (not a session log) | Resuming |
| `supabase/*.sql` | CURRENT | The schema, as ordered numbered migrations | Any database change |
| `data/README.md`, `data/nutrition.json` | CURRENT | Nutrition seed data and its row shape | Seeding or editing nutrition data |
| `docs/nutrition-prompt.md` | CURRENT | LLM prompt that turns nutrition text into row JSON | Preparing nutrition upload JSON |
| `docs/roadmap_v2.md` | CURRENT | The owner's nutrition-scope intake list, annotated with status | Proposing or picking up nutrition-domain work |
| `docs/mvp-scope/README.md` + `*-mvp.md` | CURRENT | Domain-level MVP status (README) and per-domain scope | Implementing one `roadmap_v2` domain |
| `nutrition-curriculum/DEC_REGISTER.md` | CURRENT | The readiness word for each curriculum decision | Before building against a `DEC` |
| `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` | CURRENT | The one in-flight curriculum item and the closed log | `COL` |
| `nutrition-curriculum/` (phase folders, `README.md`) | CURRENT reference | The curriculum and decision science; `01_SOURCE_BOOKS/` is local-only (git-ignored) | Investigation beyond a `DEC` note or scope file |
| `docs/superpowers/plans/README.md` | INDEX | Ship status of each app-feature plan | Starting or resuming a planned feature |
| `docs/superpowers/plans/*.md` | SNAPSHOT | The plan as written (its checkboxes are not status) | The plan you are resuming |
| `docs/superpowers/specs/*.md` | SNAPSHOT | Design rationale (each has its own status note) | Learning why a design was chosen |
| `docs/session-checkpoints/` (index in its `README.md`) | SNAPSHOT | The historical record of past sessions — what one did and believed (not the current state; that is `docs/CURRENT_STATE.md`) | Reconstructing one piece of history |
| `docs/ui-ux-audit-2026-09.md`, `docs/ui-ux-audit-2026-09-16-polish.md`, `docs/v2-north-star-design.md` | SNAPSHOT | The UI audit, its polish pass, and the V2 direction (as of 2026-09) | Understanding a UI decision's origin |
| `docs/archive/` | HISTORICAL | Retired docs (the old app roadmap, the meal-tracking spec, the Netlify→Vercel plan) | Almost never |
| `archive/` (repo root) | HISTORICAL | Retired **code**, not compiled or deployed; index and restore steps in `archive/README.md` | Before rebuilding something that may already have existed |
| `~/vault/grocery/` | outside the repo | Session history and cross-project notes; never committed | Reconstructing history beyond the checkpoints |
| Claude memory (`~/.claude/…/memory/`) | non-canonical | Personal preferences carried between sessions; repo rules live in `CLAUDE.md` | — |

Repo-root tooling and meta files (`.copilot-agent-kit-adaptation.md`, the "Project-Agnostic
Knowledge Architecture" prompt) are prompts, not project knowledge, and are not routed.

## Runtime behavior

The source under `src/` and `api/` is the final authority on what the app does, checked with `tsc -b` and the
running app — there is no test suite by design. Docs describe intent and structure; when one contradicts the
code on a volatile detail, trust the code and fix the doc.

## Escalation

A recurring local problem may become architecture-shaped when repeated evidence shows that local
fixes do not address the underlying constraint. Record the evidence first; create or update a
decision source only when the repository's governance supports it.
