# Current State

_Last updated: 2026-09-21._

This file describes the current project state and how to continue from it. It is not a historical session log,
architecture document, roadmap, or task archive. The historical record of past sessions is a separate thing:
[`session-checkpoints/`](session-checkpoints/README.md). Rules live in [`CLAUDE.md`](../CLAUDE.md).

## Current Objective

Nothing is in flight once branch `feature/meal-plan-cards-clear-undo` (Yemek Planı meal cards, slot/day clear and a
5-step undo) is merged; that merge carries this refresh. The documentation architecture migration (goal: Claude
loads the smallest set of current, authoritative, non-conflicting docs for a task) is landed on `master`, along
with its follow-ups (see Current State). **Not started (planned only):** the plans/specs/audits lifecycle cleanup and the process-optimization
phase (single checklist, nutrition-status ownership headers, `kill-ports` treatment).

## Current State

- **Repo:** `master` and `origin/master` were both at `70c581b` when this was written (before the commit that
  refreshes this file); the working tree held only the meal-plan work described above, on branch
  `feature/meal-plan-cards-clear-undo` (verified in a desktop browser, build passing). The migration (`8b03bd1`, then `ffc5d19`), the `SYNC` fix
  (`09dea3d`), the previous refresh of this file (`4ab264b`) and the interaction-model alignment (`b6750fc`) are
  merged and pushed, all as fast-forwards (no merge commits). The migration was docs-only apart from the
  comment-only `.vercelignore`, one skill-name line in `.claude/settings.json` and the four session skills.
- **Verifier:** the migration verifier (a scratch script kept outside the repo) passes every check except check
  10, which flags only the earlier-approved one-line `COL` pointer change in
  `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` (the check predates that approval). Not a new problem.
- **In flight:** the meal-plan branch above, which is the only local branch not yet merged into `master` (checked
  2026-09-21 at `70c581b`). The 49 merged local branches were deleted that day (`git branch -d`, so nothing
  unmerged was lost). Locally besides it only `master`, `agents/simple-test-setup` and six merged branches
  (`docs/sync-refreshes-current-state`, `docs/fill-copilot-instructions`,
  `docs/refresh-current-state-after-cleanup`, `docs/refresh-current-state-worktree-removed`,
  `docs/refresh-current-state-after-today-cleanup`, `chore/current-state-open-items-cleanup`) remain; 8 merged
  branches still exist on `origin`. The owner decides when to delete the rest.
  `origin/docs/organize-roadmap-mvp-files` (tip `33c72b8`, "Organize roadmap and MVP files into docs/roadmap
  folder") exists only on the remote and is not merged into `master`; its contents were not examined.
- **Worktree:** none. The `simple-test-setup` worktree was removed on 2026-09-21 (its only uncommitted change
  was Serena's regenerated `.serena/project.yml` template); its merged branch `agents/simple-test-setup` still
  exists locally.
- **Recently shipped to `master` (all pushed):** the Yemekler sheet with saved meals (`1595798`, merged
  `7a04dfe`); admin-only `PUT /api/nutrition` (`3169b10`); `agent-login` `_debug` gate (`ce01c20`);
  `agent-session` / `agent-mint` (`5663fcf`), reported working end-to-end by the developer on 2026-09-21;
  the secrets boundary extended to `.env` (`9a4678b`); the documentation architecture migration (`8b03bd1`,
  `ffc5d19`); the `SYNC` durable-facts and `.vercelignore` checks (`09dea3d`); the refresh of this file after that
  landing (`4ab264b`); the Claude interaction model aligned with the current workflow (`b6750fc`); the refresh of
  this file (`a819601`); Claude permissions tightened to the `CLAUDE.md` boundaries (`226ec83`); the checkpoint
  policy aligned on significant-work-only (`e1a6e35`); session skill names normalized (`7cc7ce6`) and
  `current-state-and-compact` retired (`cf2ae77`); dead source files and exports removed (`7796181`); the dead
  `_auth-test-login` endpoint retired (`1105466`); legacy Cloudflare/Deno ignore rules and `opencode.json` removed
  (`708cd57`); the status docs refreshed (`6e3c657`); the UI options mockup moved from `public/` to
  `docs/mockups/` so it no longer ships (`ce0a28f` — it leaves production only on the next manual deploy);
  `SYNC` made to refresh this file before its checks (`52df6c4`); the Copilot instructions template filled in
  (`7e5f547`); the refreshes of this file after that (`67ce9fb`, `e1a59e7`); the vestigial `today` tab and the archived
  Bugün screen removed, and the boot `GET /api/personal-plan` deduped (`82ab8d4`); the refresh of this file after
  that (`70c581b`). Not yet on `master`: Yemek Planı meal cards, slot/day clear and the 5-step undo (this branch).
- **Deploy state:** not recorded here. Deploys are manual and developer-run (see
  [`operations.md`](operations.md)).

## Open items

Bounded list of actionable technical debt while there is no app roadmap. Each names its source; "unverified"
means it was recorded as pending and has not been re-checked.

1. **Real-phone checks recorded as pending, none recorded as done** — Yemekler sheet (swipe-to-dismiss on a
   scrolled list, soft keyboard in the name/food/steps fields, three-pill tab row at 360 px, delete
   confirmation above the keyboard); batch-preparation create form keyboard; the 2026-09-19 UI refinement
   keyboard behavior and a look at Supabase Auth users after an account deletion; nutrition-upload header drag
   and tap rhythm; Yemek Planı meal cards (layout on a phone — the spec has a header-only fallback if the box is
   too busy) and the undo-toast swipe; the meal-plan toast stacking above the shopping-list toast
   (`shoppingUndoVisible`), not exercised even in a browser. Sources: checkpoints
   [09-19-01](session-checkpoints/2026-09-19-01-ui-ux-refinement-pass.md),
   [09-19-02](session-checkpoints/2026-09-19-02-batch-preparation-ui.md),
   [09-20-01](session-checkpoints/2026-09-20-01-nutrition-write-lockdown.md),
   [09-20-03](session-checkpoints/2026-09-20-03-meals-sheet-yemeklerim-tarifler.md),
   [09-21-01](session-checkpoints/2026-09-21-01-meal-plan-cards-clear-undo.md).
2. **Boot-performance leftovers** (checkpoint
   [09-17-02](session-checkpoints/2026-09-17-02-boot-performance-waterfall.md), plan in
   [`superpowers/plans/`](superpowers/plans/README.md)): Phase 4d (`getClaims()` / custom JWT claims) and the
   asset work were out of scope by the plan's own decision, and the server-side gain was structural, not measured
   in ms (a preview-deploy measurement is still open). The duplicate boot `GET /api/personal-plan` is fixed in
   code (concurrent calls share one request, `fetchPersonalPlan` in `src/lib/personalPlan.ts`), but that was
   found by reading the code and not yet confirmed in the browser's network tab.
3. **Possible duplicate `PUT /api/personal-plan` on boot (unverified):** in `useMealPersonalization`, applying
   the server copy replaces `profile`, which fires the debounced save effect, so each mounted instance (App,
   `MealPlanView`, `useRemainingToday`) may write the profile straight back. Confirm in the network tab before
   changing it — the save path guards against losing a failed persist, so it is not a one-line dedupe.
4. **Schema is not reproducible from the repo:** there is no `CREATE TABLE` for `nutrition`. Its columns are
   visible in `api/nutrition.ts` but not their types or constraints, so closing this needs a schema-only dump of the
   live table from the developer (Claude has no database access). `meal_entries` in both `01` and `07` is
   intentional (`07` drops and recreates). See [`architecture.md`](architecture.md) (Persistence & schema map).
5. **Stale pointers in historical records, left alone on purpose:** a few checkpoints, plans and specs use the
   old name `SESSION_FOLLOWUP.md` and cite architecture headings that no longer exist ("Deployment", "Environment
   variables" — now in [`operations.md`](operations.md)); they are snapshots.
6. **Meal-plan entries saved before 2026-09-21 may reorder on reload:** their items of one meal share a
   `position`, and the server orders by `(date, slot, position)` only. New entries get distinct positions; no
   backfill was written. Source: checkpoint [09-21-01](session-checkpoints/2026-09-21-01-meal-plan-cards-clear-undo.md).

## Next Step

Check the meal-plan changes on a real phone (open item 1), then confirm in the browser that boot makes a single
`GET /api/personal-plan` and check for a duplicate `PUT` (open items 2-3). The owner decides whether to start the deferred phases (not started): the
plans/specs/audits lifecycle cleanup, and process optimization (a single close-out checklist,
nutrition-status ownership headers, `kill-ports` treatment); and whether to delete the remaining merged branches.
Otherwise pick work from the Open items.

## Constraints and decisions that affect continuation

- **No live app roadmap.** `docs/archive/roadmap.md` is historical. Nutrition scope is `docs/roadmap_v2.md`;
  actionable debt goes in the Open items above.
- **Batch-preparation UI is out of MVP scope** (owner decision, 2026-09-21). It stays hidden behind
  `BATCH_PREP_VISIBLE = false` in `src/components/MealPlanView.tsx`; re-wiring it to the Yemekler sheet is not
  planned.
- **Applied by the owner (2026-09-21):** `supabase/28-saved-meals.sql`, `ADMIN_EMAILS` (local and production), and
  the `AGENT_LOGIN_SECRET` rotation.
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
