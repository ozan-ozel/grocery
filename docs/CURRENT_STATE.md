# Current State

_Last updated: 2026-09-24._

This file describes the current project state and how to continue from it. It is not a historical session log,
architecture document, roadmap, or task archive. The historical record of past sessions is a separate thing:
[`session-checkpoints/`](session-checkpoints/README.md). Rules live in [`CLAUDE.md`](../CLAUDE.md).

## Current Objective

A small Kişisel Plan source-citation addition is finishing on `feature/personal-plan-book-sources` (about to be
committed/merged via SYNC → CMP). **Not started (planned only):** the plans/specs/audits lifecycle cleanup and
the process-optimization phase (single checklist, nutrition-status ownership headers, `kill-ports` treatment).

## Current State

- **Repo:** `master` and `origin/master` are both at `574c9da` (verified with git). Recent history: `574c9da`
  (session checkpoint for the polish batch) on `75abe85` (meal-plan UI polish batch — collapse/expand toggle + edit
  shortcut on saved-meal `MealGroup` cards; "Listem" sub-tab removed from Besin Değerleri, its grouped/macro totals
  embedded directly in Alışveriş's own "Besin değerleri" toggle via a new shared `scaledNutritionForItem` helper in
  `src/lib/nutrition.ts`; save-button spinner fix in `SavedMealForm`; delete-spinner on Yemeklerim's trash-icon
  buttons; per-source background tinting on `MealGroup` cards; `SmoothPillTabs` `surface="card"` prop fixing the
  Yemekler-sheet/Batch-sheet active-tab color mismatch — see the SP `surface` rule in `CLAUDE.md` § UI patterns) on
  `3d0dc77` (MOBILEUP/MOBILEDOWN docs) on `74c8a4e`/`d77c0ef`/`a6850f9`/`a1aad83`/`28851a0`/`19757c8` (DEC-033
  protein-target consumer, via subagent-driven-development) on `dca29db` (previous refresh of this file) on
  `d6ff51e` (dead-code exports removed) on `78a6143` (meal-plan cards/clear/undo feature).
- **In flight:** `feature/personal-plan-book-sources`, currently checked out with uncommitted changes (about to
  be committed by this SYNC → CMP). Contents: a book citation added to Kişisel Plan's "Kaynakları göster" list —
  `Source.href` made optional, and a new SN4 source (Jeukendrup & Gleeson, *Sport Nutrition* 4e) cites the
  protein-tier hypertrophy-plateau correction (`DEC-031`, `nutrition-curriculum` Gate 6 §7) in the
  protein/carb/fat/fiber group in `src/components/PersonalPlanView.tsx`. Scoped down from an initial "add the
  curriculum's 7 books" idea to just this one source, since it's the only book that traces to a `SHIPPED`
  decision (ACSM's textbook only backs `DEC-047`/`DEC-049`, both still `BLOCKED`). `npx tsc -b` clean;
  live-verified via `QATEST` (badge renders correctly, no broken-link affordance for the href-less book row).
  Also carries this file's own SYNC refresh and the `docs/superpowers/plans/README.md` cleanup from earlier in
  the session (four stale `UNCLEAR` rows resolved to `SHIPPED`).
- **Local branches other than `master`:** `feature/meal-plan-ui-polish-batch` no longer exists locally (merged
  and deleted). Ten branches remain, all merged into `master` (verified with `git branch --merged`):
  `agents/simple-test-setup`, `chore/current-state-open-items-cleanup`, `chore/remove-dead-code-exports`,
  `docs/fill-copilot-instructions`, `docs/refresh-current-state-after-cleanup`,
  `docs/refresh-current-state-after-dead-code-cleanup`, `docs/refresh-current-state-after-today-cleanup`,
  `docs/refresh-current-state-worktree-removed`, `docs/sync-refreshes-current-state`,
  `feature/meal-plan-cards-clear-undo` — safe to delete when the owner wants. `origin/docs/organize-roadmap-mvp-files`
  (tip `33c72b8`) still exists only on the remote and is not merged into `master`; its contents were not examined.
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

1. **Real-phone checks: reported done by the owner (2026-09-24), not independently re-verified here.** Previously
   pending — Yemekler sheet (swipe-to-dismiss, soft keyboard, three-pill tab row at 360px, delete confirmation
   above the keyboard); batch-preparation create form keyboard; the 2026-09-19 UI refinement keyboard behavior;
   nutrition-upload header drag/tap; Yemek Planı meal cards and the undo-toast swipe; the meal-plan/shopping-list
   toast stacking; and the meal-plan UI polish batch's new `MealGroup` collapse/edit/tint, Alışveriş totals
   footer, and two spinners. Sources: checkpoints
   [09-19-01](session-checkpoints/2026-09-19-01-ui-ux-refinement-pass.md),
   [09-19-02](session-checkpoints/2026-09-19-02-batch-preparation-ui.md),
   [09-20-01](session-checkpoints/2026-09-20-01-nutrition-write-lockdown.md),
   [09-20-03](session-checkpoints/2026-09-20-03-meals-sheet-yemeklerim-tarifler.md),
   [09-21-01](session-checkpoints/2026-09-21-01-meal-plan-cards-clear-undo.md).
2. **Boot-performance leftovers** (checkpoint
   [09-17-02](session-checkpoints/2026-09-17-02-boot-performance-waterfall.md), plan in
   [`superpowers/plans/`](superpowers/plans/README.md)): Phase 4d (`getClaims()` / custom JWT claims) and the
   asset work were out of scope by the plan's own decision, and the server-side gain was structural, not measured
   in ms (a preview-deploy measurement is still open). The duplicate boot `GET /api/personal-plan` dedup
   (`fetchPersonalPlan` in `src/lib/personalPlan.ts`) is now confirmed in the browser too — `QATEST` on
   2026-09-24 saw exactly one `GET /api/personal-plan` per view across boot, `MealPlanView`, and Kişisel Plan.
3. **Duplicate `PUT /api/personal-plan` on boot: checked via `QATEST`, not reproduced (2026-09-24).** Watched
   network traffic across boot (Alışveriş tab), `MealPlanView`, and Kişisel Plan, each with a 2-3s wait for the
   debounced save effect — zero `PUT /api/personal-plan` requests fired in any of the three, only the expected
   one `GET` per view. Single test account, single session — doesn't rule out a race under different conditions
   (slow network, multiple tabs), but the suspected steady-state bug does not reproduce.
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

The meal-plan UI polish batch is landed, real-phone checks are reported done, and both the boot `GET` dedup and
the suspected duplicate `PUT /api/personal-plan` are now checked (open items 1-3 closed this session, 2026-09-24).
Remaining open items: the schema dump for `nutrition` (item 4, needs the developer), stale historical pointers
(item 5, left alone on purpose), and the meal-plan entry reorder bug for pre-2026-09-21 entries (item 6). The
owner decides whether to start the deferred phases (not started): the plans/specs/audits lifecycle cleanup, and
process optimization (a single close-out checklist, nutrition-status ownership headers, `kill-ports` treatment);
and whether to delete the remaining merged branches.

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
