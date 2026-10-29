# Current State

_Last updated: 2026-10-29._

This file describes the current project state and how to continue from it. It is not a historical session log,
architecture document, roadmap, or task archive. The historical record of past sessions is a separate thing:
[`session-checkpoints/`](session-checkpoints/README.md). Rules live in [`CLAUDE.md`](../CLAUDE.md).

## Current Objective

A product relaunch is being prepared. The nutrition catalog, portion and planning-macro polish is finished
on `fix/catalog-portions-polish`, verified live locally, and is being merged to `master` (with the
account-isolation fix `d822122`) and deployed to production at the owner's request. Migration 29 has been
applied by the owner. Next is the owner's own production test.

## Current State

- **Repo (verified with git):** `master` and `origin/master` are both at `1ebe9b4`. The account-isolation fix
  is committed locally as `d822122` on `fix/account-switch-profile-isolation`. It is not merged or pushed.
  The current branch `fix/catalog-portions-polish` is based on `d822122`; its commit carries this file, and
  merging it into `master` also brings that fix. Recorded before that commit.
- **In flight (catalog polish):**
  - **Code:** the catalog code was written by a Codex session and reviewed here. `npm run build` passes.
  - **Data:** `supabase/29-nutrition-catalog-polish.sql` is applied live (103 rows, 98 active, 35 with
    allergen mappings). `data/ready-meals.json` has dry-weight portions and new canned and snack meals.
  - **Planning macros:** `src/lib/planningMacros.ts` replaces the range midpoints.
  - **Docs:** the docs and the roadmap/mvp-scope/DEC trio (DEC-056/061/066) are updated.
  - Evidence: [10-29-02](session-checkpoints/2026-10-29-02-catalog-portions-polish.md). Data decisions:
    [`data/catalog-review-2026-10-29.md`](../data/catalog-review-2026-10-29.md).
- **QA environment:** the local server was stopped via `agent-session down`. `.vercelignore` was restored by
  hand and has no git diff.
- **Other local branches:** left untouched. The remote-only `origin/docs/organize-roadmap-mvp-files` branch
  remains unexamined.
- **Worktree: one exists** — `D:/CodeSpace/grocery.worktrees/simple-test-setup` on `agents/simple-test-setup`
  (`e999c02`), despite the no-worktrees rule. Not created by these sessions; left for the owner to remove.
- **Recently shipped to `master` (all pushed):** rename/sources/safety (`1ebe9b4`); relaunch audit (`d2adb35`); SN4 book citation in Kişisel Plan sources (`6e65f11`); meal-plan UI
  polish batch (`75abe85`); MOBILEUP/MOBILEDOWN docs (`3d0dc77`); DEC-033 protein-target consumer (`a1aad83`..`d77c0ef`).
- **Deploy state:** a production deploy of this merge was requested on 2026-10-29. Its result is not recorded
  here. Deploys are manual (see [`operations.md`](operations.md)).

## Open items

1. **Catalog polish + account-isolation fix: owner production test pending.** Isolation-fix gaps from its QA: "Bitir" onboarding submission, concurrent switching in another tab, mobile and
   production were not tested ([10-29-01](session-checkpoints/2026-10-29-01-qatest-account-isolation.md)).
   Cross-device scope attestation still needs a `personal_plan` column (live migration), not implemented.
2. **Catalog data follow-ups** (from the review): baldo brand record, eski kaşar and karabuğday ekmeği labels
   are unverified. Tomato-sauce sardines and canned corn are not seeded without a Turkish primary label.
   DEC-061 allergen coverage stays `PARTIAL` (35/103).
3. **Owner decisions awaiting approval from the audit** (`docs/product-relaunch/00-current-state.md`):
   - PAL re-anchoring.
   - An eaten flag on `meal_entries` (live migration).
   - A "Bugün ne pişirsem?" section.
   - The owner's profile (age 25, male equation) used in the audit is unconfirmed.
   - The macro-consistency item (default macro grams summing to ~2740 kcal against 2470) is now handled in the
     Meal Plan by `planningMacros`. Whether the audit item is closed is the owner's call.
4. **Ignore restoration fails repeatedly.** `agent-session down` reported "ERROR restoring .vercelignore" again
   on 2026-10-29 (second time that day; earlier a `File.Replace` file-in-use error). Both times it was fixed by
   hand. The locking process is unidentified.
5. **Schema is not reproducible from the repo:** there is no `CREATE TABLE` for `nutrition`; closing this needs a
   schema-only dump of the live table from the developer. See [`architecture.md`](architecture.md) (Persistence &
   schema map).
6. **Meal-plan entries saved before 2026-09-21 may reorder on reload** (shared `position`; no backfill). Source:
   checkpoint [09-21-01](session-checkpoints/2026-09-21-01-meal-plan-cards-clear-undo.md).
7. **Stale pointers in historical records, left alone on purpose** (old `SESSION_FOLLOWUP.md` name, retired
   architecture headings); they are snapshots.

## Next Step

The owner tests the production deploy: catalog, portions, snack slot, planning macros and account switching.
Report any failures as new open items.

## Constraints and decisions that affect continuation

- **No live app roadmap.** `docs/archive/roadmap.md` is historical. Nutrition scope is `docs/roadmap_v2.md`;
  actionable debt goes in the Open items above.
- **Batch-preparation UI is out of MVP scope** (owner decision, 2026-09-21); hidden behind
  `BATCH_PREP_VISIBLE = false` in `src/components/MealPlanView.tsx`.
- **Food data rule (owner decision, 2026-10-27):** fresh, raw and dry foods from USDA via the hand-picked
  `scripts/usda-mapping.json` (no machine translation); canned/packaged goods from Turkish labels as sold; all
  gram amounts are dry/raw weights.
- **Catalog identity (migration 29):** catalog rows are retired with `is_active = false`, never deleted.
  Equivalence groups and allergen mappings come only from migration, not from a seed upload. Allergen
  mappings are added as known PRESENT only.
- **Checkpoints are historical snapshots, not the current state.** Route around them from
  [`knowledge-map.md`](knowledge-map.md) and the checkpoint index.
- The secrets boundary in `CLAUDE.md` is unchanged and applies to every task.

## Where to look

- What to read for a task: [`knowledge-map.md`](knowledge-map.md).
- How the app works: [`architecture.md`](architecture.md); how to run/deploy/QA it: [`operations.md`](operations.md).
- The relaunch audit: [`product-relaunch/00-current-state.md`](product-relaunch/00-current-state.md).
- History of a specific piece of work: the index in [`session-checkpoints/README.md`](session-checkpoints/README.md).
