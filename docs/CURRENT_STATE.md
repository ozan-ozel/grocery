# Current State

_Last updated: 2026-10-29._

This file describes the current project state and how to continue from it. It is not a historical session log,
architecture document, roadmap, or task archive. The historical record of past sessions is a separate thing:
[`session-checkpoints/`](session-checkpoints/README.md). Rules live in [`CLAUDE.md`](../CLAUDE.md).

## Current Objective

A product relaunch is being prepared. The readyMeal rename, corrected source citations and DEC-012/013/020
MVP safety posture are merged and pushed (`1ebe9b4`). Live QA verified their main existing-account flows but
found a profile-copy bug during account switching. Its fix builds cleanly and passed the fresh-account
regression and onboarding ScopeCheck checks locally. The fix is ready for owner review, still uncommitted.

## Current State

- **Repo:** `master` and `origin/master` are both at `1ebe9b4` (verified with git). The current branch is
  `fix/account-switch-profile-isolation`, based on that commit, with uncommitted code and documentation changes.
  Earlier history: [`session-checkpoints/README.md`](session-checkpoints/README.md).
- **In flight:** App now waits for `/api/auth-session` before mounting user-scoped hooks and keys AppShell by
  the confirmed user id. Previously a stale cached identity could cause an old profile to be saved into a
  newly signed-in account. `useAuth`, boot-cache comments and `architecture.md` are updated together.
  Build passes; existing-account reload and fresh-account isolation checks pass locally. Full evidence:
  [10-29-01](session-checkpoints/2026-10-29-01-qatest-account-isolation.md).
- **QA environment:** the owned server on `localhost:3000` and the Chrome QA tab remain open at the user's
  explicit request. `.vercelignore` is restored with no git diff; the app still responds. Agent login is
  excluded again. No commit, push or deploy was performed for the isolation fix.
- **Other local branches:** left untouched; the rename and audit branches are merged. The remote-only
  `origin/docs/organize-roadmap-mvp-files` branch remains unexamined.
- **Worktree: one exists** — `D:/CodeSpace/grocery.worktrees/simple-test-setup` on `agents/simple-test-setup`
  (`e999c02`), despite the no-worktrees rule. Not created this session; left untouched for the owner to remove.
- **Recently shipped to `master` (all pushed):** rename/sources/safety (`1ebe9b4`); relaunch audit (`d2adb35`); SN4 book citation in Kişisel Plan sources (`6e65f11`); meal-plan UI
  polish batch (`75abe85`); MOBILEUP/MOBILEDOWN docs (`3d0dc77`); DEC-033 protein-target consumer (`a1aad83`..`d77c0ef`).
- **Deploy state:** not recorded here. Deploys are manual and developer-run (see [`operations.md`](operations.md)).

## Open items

1. **Account-isolation fix: owner review / commit pending.** Local QA passed for fresh-account onboarding,
   scope toggling/persistence, hidden targets/recommendations, source badges, water copy, ready-meal addition
   and "Yedim" persistence/undo. New-account `/api/personal-plan` stayed `null`; onboarding was skipped after
   checking all steps, so "Bitir" submission was not tested. Concurrent account switching in another mounted
   tab, mobile and production were not tested. See checkpoint [10-29-01](session-checkpoints/2026-10-29-01-qatest-account-isolation.md).
   Cross-device scope attestation still needs a `personal_plan` column (live migration), not implemented.
2. **Food-catalog expansion: proposal drafted, owner decisions pending.** The draft table (outside the repo, a
   private Artifact, now with a separate "Öneriler ve değişiklikler" tab) adds canned fish and turkey from Turkish label medians (Migros, 2026-10-27) and a whole-wheat
   pasta row (USDA 169738). Decided: all foods and meal grams are dry/raw; canned and packaged goods use label
   values as sold. Pending: converting 8 ready-made meals that use 100–150 g of dry grains/pulses to dry portions;
   merging duplicate rows (`pirinç` ×3, `ceviz`/`ceviz içi`, `soğan`/`kuru soğan`, `kıyma`/`dana kıyma`); removing
   the cooked `bulgur pilavı` row. This touches the macros/meal-construction scope, so the trio rule applies.
3. **Owner decisions awaiting approval from the audit** (`docs/product-relaunch/00-current-state.md`): macro
   consistency (DEC-034/036 — the default profile's macro grams sum to ~2740 kcal against a 2470 target), PAL
   re-anchoring, an eaten flag on `meal_entries` (live migration), and a "Bugün ne pişirsem?" section. The owner's
   profile (age 25, male equation) used in the audit is unconfirmed.
4. **Ignore restoration can fail with a file lock.** `Restore-Ignore` in `scripts/agent-session.ps1` failed at
   `File.Replace` with a file-in-use error on 2026-10-29 while the server was running; replacing only its exact
   marker in place succeeded. `.vercelignore` is clean. The locking process is unidentified; whether this also
   explains the earlier 2026-10-27 restore error is unverified. See checkpoint [10-29-01](session-checkpoints/2026-10-29-01-qatest-account-isolation.md).
5. **Schema is not reproducible from the repo:** there is no `CREATE TABLE` for `nutrition`; closing this needs a
   schema-only dump of the live table from the developer. See [`architecture.md`](architecture.md) (Persistence &
   schema map).
6. **Meal-plan entries saved before 2026-09-21 may reorder on reload** (shared `position`; no backfill). Source:
   checkpoint [09-21-01](session-checkpoints/2026-09-21-01-meal-plan-cards-clear-undo.md).
7. **Stale pointers in historical records, left alone on purpose** (old `SESSION_FOLLOWUP.md` name, retired
   architecture headings); they are snapshots.

## Next Step

Owner review of the uncommitted account-isolation fix on `fix/account-switch-profile-isolation` is next.
Commit/push requires a separate request. Keep the local server and QA tab open as requested.

## Constraints and decisions that affect continuation

- **No live app roadmap.** `docs/archive/roadmap.md` is historical. Nutrition scope is `docs/roadmap_v2.md`;
  actionable debt goes in the Open items above.
- **Batch-preparation UI is out of MVP scope** (owner decision, 2026-09-21); hidden behind
  `BATCH_PREP_VISIBLE = false` in `src/components/MealPlanView.tsx`.
- **Food data rule (owner decision, 2026-10-27):** fresh, raw and dry foods from USDA via the hand-picked
  `scripts/usda-mapping.json` (no machine translation); canned/packaged goods from Turkish labels as sold; all
  gram amounts are dry/raw weights.
- **Checkpoints are historical snapshots, not the current state.** Route around them from
  [`knowledge-map.md`](knowledge-map.md) and the checkpoint index.
- The secrets boundary in `CLAUDE.md` is unchanged and applies to every task.

## Where to look

- What to read for a task: [`knowledge-map.md`](knowledge-map.md).
- How the app works: [`architecture.md`](architecture.md); how to run/deploy/QA it: [`operations.md`](operations.md).
- The relaunch audit: [`product-relaunch/00-current-state.md`](product-relaunch/00-current-state.md).
- History of a specific piece of work: the index in [`session-checkpoints/README.md`](session-checkpoints/README.md).
