# Current State

_Last updated: 2026-09-23._

This file describes the current project state and how to continue from it. It is not a historical session log,
architecture document, roadmap, or task archive. The historical record of past sessions is a separate thing:
[`session-checkpoints/`](session-checkpoints/README.md). Rules live in [`CLAUDE.md`](../CLAUDE.md).

## Current Objective

A meal-plan UI polish batch is finishing on `feature/meal-plan-ui-polish-batch` (about to be committed/merged via
SYNC → CMP). **Not started (planned only):** the plans/specs/audits lifecycle cleanup and the process-optimization
phase (single checklist, nutrition-status ownership headers, `kill-ports` treatment).

## Current State

- **Repo:** `master` and `origin/master` are both at `3d0dc77` (verified with git). Recent history: `3d0dc77`
  (MOBILEUP/MOBILEDOWN docs) on `74c8a4e`/`d77c0ef`/`a6850f9`/`a1aad83`/`28851a0`/`19757c8` (DEC-033 protein-target
  consumer, via subagent-driven-development) on `dca29db` (previous refresh of this file) on `d6ff51e` (dead-code
  exports removed) on `78a6143` (meal-plan cards/clear/undo feature).
- **In flight:** `feature/meal-plan-ui-polish-batch`, currently checked out with uncommitted changes (about to be
  committed by this SYNC → CMP). Contents: a collapse/expand toggle + edit shortcut on saved-meal `MealGroup`
  cards; the "Listem" sub-tab removed from Besin Değerleri and its grouped/macro totals embedded directly in
  Alışveriş's own "Besin değerleri" toggle (`ActiveList.tsx`, via a new shared `scaledNutritionForItem` helper in
  `src/lib/nutrition.ts`); a save-button spinner fix in `SavedMealForm` (the wrong button was showing the loading
  label); a delete-spinner on Yemeklerim's trash-icon buttons; per-source background tinting on `MealGroup` cards
  (saved/builtin/evening, same primary-color family); and a `SmoothPillTabs` `surface="card"` prop fixing the
  Yemekler-sheet (and Batch-sheet) active-tab color mismatch against their `bg-card` surface — see the new SP
  `surface` rule in `CLAUDE.md` § UI patterns. Live-verified via `QATEST` (Playwright against `agent-mint`/
  `agent-login`): all items confirmed working, including the tab-color fix (active pill now measures the same
  `#121822` as the sheet's own background).
- **Local branches other than `master`:** `feature/meal-plan-ui-polish-batch` (above, in flight); everything else
  listed previously (`chore/remove-dead-code-exports`, `feature/meal-plan-cards-clear-undo`,
  `agents/simple-test-setup`, five `docs/`/`chore/` branches) is merged and not re-verified this session, safe to
  delete when the owner wants. `origin/docs/organize-roadmap-mvp-files` (tip `33c72b8`) still exists only on the
  remote and is not merged into `master`; its contents were not examined.
- **Worktree:** none.
- **Recently shipped to `master` (all pushed):** DEC-033 `occasionProteinTargetG` wired into the meal-slot header
  (`P: Xg / min-max g hedef` text in `MealContainer.tsx`/`MealPlanView.tsx`), trio-synced across
  `macros-mvp.md`/`roadmap_v2.md`/`DEC_REGISTER.md` (`a1aad83`..`d77c0ef`); MOBILEUP/MOBILEDOWN phone-testing
  shorthand documented in `CLAUDE.md`/`operations.md` (`3d0dc77`); dead-code exports removed —
  `auditFoodIdentityCollisions` (`src/lib/foodIdentity.ts`), `DEFAULT_TENANT_ID` (`src/lib/store.ts`) (`d6ff51e`);
  Yemek Planı meal cards, slot/day clear and a 5-step undo (`78a6143`); the vestigial `today` tab and archived
  Bugün screen removed, boot `GET /api/personal-plan` deduped (`82ab8d4`). Earlier history is unchanged from prior
  refreshes — see [`session-checkpoints/README.md`](session-checkpoints/README.md) for the full list.
- **`QATEST` shorthand added** this session: one-off live browser verification via the `agent-mint`/`agent-login`
  + Playwright flow, documented in `CLAUDE.md` and `operations.md` § Agent sessions (not a git operation).
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
   [09-21-01](session-checkpoints/2026-09-21-01-meal-plan-cards-clear-undo.md). The meal-plan UI polish batch
   (`feature/meal-plan-ui-polish-batch`, see Current State) was `QATEST`-verified against a desktop-viewport
   Playwright browser only — a real-phone pass on the new `MealGroup` collapse/edit/tint, the Alışveriş totals
   footer, and the two spinners is still open.
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

Finish landing `feature/meal-plan-ui-polish-batch` (SYNC → CMP, in progress as this file is written), then check
the meal-plan UI polish batch and the earlier meal-plan changes on a real phone (open item 1), and confirm in the
browser that boot makes a single `GET /api/personal-plan` and check for a duplicate `PUT` (open items 2-3). The
owner decides whether to start the deferred phases (not started): the plans/specs/audits lifecycle cleanup, and
process optimization (a single close-out checklist, nutrition-status ownership headers, `kill-ports` treatment);
and whether to delete the remaining merged branches. Otherwise pick work from the Open items.

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
