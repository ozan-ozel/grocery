# Current State

_Last updated: 2026-09-21._

This file describes the current project state and how to continue from it. It is not a historical session log,
architecture document, roadmap, or task archive. The historical record of past sessions is a separate thing:
[`session-checkpoints/`](session-checkpoints/README.md). Rules live in [`CLAUDE.md`](../CLAUDE.md).

## Current Objective

Nothing is in flight. The documentation architecture migration (goal: Claude loads the smallest set of current,
authoritative, non-conflicting docs for a task) is landed on `master`, along with its follow-ups (see Current
State). **Not started (planned only):** the plans/specs/audits lifecycle cleanup and the process-optimization
phase (single checklist, nutrition-status ownership headers, `kill-ports` treatment).

## Current State

- **Repo:** `master` and `origin/master` were both at `b6750fc` when this was written (before the commit that
  refreshes this file), with a clean working tree. The migration (`8b03bd1`, then `ffc5d19`), the `SYNC` fix
  (`09dea3d`), the previous refresh of this file (`4ab264b`) and the interaction-model alignment (`b6750fc`) are
  merged and pushed, all as fast-forwards (no merge commits). The migration was docs-only apart from the
  comment-only `.vercelignore`, one skill-name line in `.claude/settings.json` and the four session skills.
- **Verifier:** the migration verifier (a scratch script kept outside the repo) passes every check except check
  10, which flags only the earlier-approved one-line `COL` pointer change in
  `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` (the check predates that approval). Not a new problem.
- **In flight:** nothing. No local branch was unmerged into `master` (checked 2026-09-21 at `b6750fc`, before the
  branch carrying this refresh). The merged docs branches (`docs/documentation-architecture-migration`,
  `docs/sync-durable-facts-check`, `docs/refresh-current-state-after-landing`, `docs/refine-interaction-model`)
  still exist locally and on `origin`; the owner decides when to delete them.
  `origin/docs/organize-roadmap-mvp-files` (tip `33c72b8`, "Organize roadmap and MVP files into docs/roadmap
  folder") exists only on the remote and is not merged into `master`; its contents were not examined.
- **Worktree:** `D:/CodeSpace/grocery.worktrees/simple-test-setup` on `agents/simple-test-setup` (that branch
  is merged). Not touched by this work; the owner decides whether it stays.
- **Recently shipped to `master` (all pushed):** the Yemekler sheet with saved meals (`1595798`, merged
  `7a04dfe`); admin-only `PUT /api/nutrition` (`3169b10`); `agent-login` `_debug` gate (`ce01c20`);
  `agent-session` / `agent-mint` (`5663fcf`), reported working end-to-end by the developer on 2026-09-21;
  the secrets boundary extended to `.env` (`9a4678b`); the documentation architecture migration (`8b03bd1`,
  `ffc5d19`); the `SYNC` durable-facts and `.vercelignore` checks (`09dea3d`); the refresh of this file after that
  landing (`4ab264b`); the Claude interaction model aligned with the current workflow (`b6750fc`).
- **Deploy state:** not recorded here. Deploys are manual and developer-run (see
  [`operations.md`](operations.md)).

## Open items

Bounded list of actionable technical debt while there is no app roadmap. Each names its source; "unverified"
means it was recorded as pending and has not been re-checked.

1. **Real-phone checks recorded as pending, none recorded as done** — Yemekler sheet (swipe-to-dismiss on a
   scrolled list, soft keyboard in the name/food/steps fields, three-pill tab row at 360 px, delete
   confirmation above the keyboard); batch-preparation create form keyboard; the 2026-09-19 UI refinement
   keyboard behavior and a look at Supabase Auth users after an account deletion; nutrition-upload header drag
   and tap rhythm. Sources: checkpoints
   [09-19-01](session-checkpoints/2026-09-19-01-ui-ux-refinement-pass.md),
   [09-19-02](session-checkpoints/2026-09-19-02-batch-preparation-ui.md),
   [09-20-01](session-checkpoints/2026-09-20-01-nutrition-write-lockdown.md),
   [09-20-03](session-checkpoints/2026-09-20-03-meals-sheet-yemeklerim-tarifler.md).
2. **`supabase/28-saved-meals.sql`** is recorded as applied to the developer's Supabase project only (checkpoint
   09-20-03) — apply it anywhere else the app's database lives. Unverified whether another database exists.
3. **`ADMIN_EMAILS`** must be set for the hidden nutrition upload to work (local repo-root `.env` for
   `vercel dev`, and Vercel production) — see [`operations.md`](operations.md) and checkpoint 09-20-01. Whether it
   has been set is unverified.
4. **Manual rotation of `AGENT_LOGIN_SECRET`** by the developer was recorded as a remaining step (checkpoint
   09-20-04). Only the developer can confirm it. `agent-session up -EarlyRestore` is also still unverified.
5. **Batch-preparation UI is hidden:** `BATCH_PREP_VISIBLE = false` in `src/components/MealPlanView.tsx` (line 41,
   verified 2026-09-21) until batch prep is re-wired to the Yemekler sheet.
6. **Vestigial `today` tab:** `Tab` in `src/hooks/useUiPrefs.ts` still includes `"today"` and it is the fallback
   tab (lines 22-37, verified 2026-09-21). Left deliberately so old `?tab=today` links keep working
   (checkpoint 09-20-02).
7. **Boot-performance leftovers** (checkpoint
   [09-17-02](session-checkpoints/2026-09-17-02-boot-performance-waterfall.md), plan in
   [`superpowers/plans/`](superpowers/plans/README.md)): Phase 4d (`getClaims()` / custom JWT claims) and the
   asset work were out of scope by the plan's own decision; the server-side gain was structural, not measured
   in ms (a preview-deploy measurement is still open); `MealPlanView` was reported to fire duplicate
   `/api/personal-plan` calls on boot. All unverified since 2026-09-17.
8. **Schema is not reproducible from the repo:** no `CREATE TABLE` for `nutrition`, and `meal_entries` is
   created in both `supabase/01-schema.sql` and `07-meal-entries.sql` (grep-verified 2026-09-21). See
   [`architecture.md`](architecture.md) (Persistence & schema map).

9. **Stale pointers deliberately left alone:** the root `.copilot-agent-kit-adaptation.md` (a tooling prompt) still
   names `docs/SESSION_FOLLOWUP.md`, the old name of this file. A few historical checkpoints, plans and specs
   likewise use the old name and cite architecture headings that no longer exist ("Deployment", "Environment
   variables" — now in [`operations.md`](operations.md)); they are snapshots, so leave them.

## Next Step

Nothing is in flight. The owner decides whether to start the deferred phases (not started): the
plans/specs/audits lifecycle cleanup, and process optimization (a single close-out checklist,
nutrition-status ownership headers, `kill-ports` treatment); and whether to delete the merged branches and the
worktree above. Otherwise pick work from the Open items.

## Constraints and decisions that affect continuation

- **No live app roadmap.** `docs/archive/roadmap.md` is historical. Nutrition scope is `docs/roadmap_v2.md`;
  actionable debt goes in the Open items above.
- **Checkpoints are historical snapshots, not the current state.** They are normally preserved as written and are
  never rewritten into current-state records; a factual or status correction may be made when necessary. Route
  around them from [`knowledge-map.md`](knowledge-map.md) and the checkpoint index.
- **Architecture is documented in the repo** (`docs/architecture.md`, `docs/operations.md`); `~/vault` is for
  history and cross-project notes.
- The secrets boundary in `CLAUDE.md` is unchanged and applies to every task.

## Where to look

- What to read for a task: [`knowledge-map.md`](knowledge-map.md).
- How the app works: [`architecture.md`](architecture.md); how to run/deploy/QA it: [`operations.md`](operations.md).
- History of a specific piece of work: the index in [`session-checkpoints/README.md`](session-checkpoints/README.md).
  Nothing there needs to be read to resume — checkpoints are the separate historical record, not a substitute for
  this file.
- Older records refer to this file by its former name, `SESSION_FOLLOWUP.md`.
