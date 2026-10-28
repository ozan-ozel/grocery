# Current State

_Last updated: 2026-10-28._

This file describes the current project state and how to continue from it. It is not a historical session log,
architecture document, roadmap, or task archive. The historical record of past sessions is a separate thing:
[`session-checkpoints/`](session-checkpoints/README.md). Rules live in [`CLAUDE.md`](../CLAUDE.md).

## Current Objective

A product relaunch is being prepared. The relaunch audit is merged (`d2adb35`). `refactor/combo-to-ready-meal`
is about to be merged and pushed (CMP). It carries three things: the readyMeal rename, corrected nutrition source
citations, and an MVP safety posture for DEC-012/013/020. A live `QATEST` of that branch comes next, then the
remaining blocked decisions and the food-catalog expansion (decisions pending, see Open items).

## Current State

- **Repo:** `master` and `origin/master` are both at `d2adb35` (verified with git): relaunch audit, example-target
  labelling, DEC-022 note fix, employer README. Before it: `6e65f11` (SN4 citation), `574c9da`, `75abe85`.
  Earlier history: [`session-checkpoints/README.md`](session-checkpoints/README.md).
- **In flight:** `refactor/combo-to-ready-meal`, checked out, branched from `d2adb35`, being committed in this
  CMP. Details: checkpoint
  [10-28-01](session-checkpoints/2026-10-28-01-ready-meal-rename-sources-safety.md). In short:
  - Rename "combo" → Meal / readyMeal in code. DB/API `combo_id` fields and the cache's `comboId` are kept.
  - Kişisel Plan source citations corrected: PAL → FAO/WHO/UNU 2004, water → Krause (now "toplam sıvı"),
    per-meal protein → AS3 + Schoenfeld 2018, food values → USDA FDC + labels.
  - Out-of-scope self-attestation hides all targets (`useScopeAttestation`, browser key
    `grocery.scopeAttestation.v1:<userId>`). The red-flag note and the "starting estimate" note are always
    shown. Copy lives in `src/lib/safetyCopy.ts`.
  - `tsc -b` and the build are clean; not yet browser-verified.
- **Local branches other than `master`:** eleven, all merged into `master` (verified with `git branch --merged`):
  `agents/simple-test-setup`, `chore/current-state-open-items-cleanup`, `chore/remove-dead-code-exports`,
  `docs/fill-copilot-instructions`, `docs/refresh-current-state-after-cleanup`,
  `docs/refresh-current-state-after-dead-code-cleanup`, `docs/refresh-current-state-after-today-cleanup`,
  `docs/refresh-current-state-worktree-removed`, `docs/sync-refreshes-current-state`,
  `feature/meal-plan-cards-clear-undo`, `feature/personal-plan-book-sources` — safe to delete when the owner wants.
  `origin/docs/organize-roadmap-mvp-files` (tip `33c72b8`) is remote-only, unmerged, not examined.
- **Worktree: one exists** — `D:/CodeSpace/grocery.worktrees/simple-test-setup` on `agents/simple-test-setup`
  (`e999c02`), despite the no-worktrees rule. Not created this session; left untouched for the owner to remove.
- **Recently shipped to `master` (all pushed):** relaunch audit (`d2adb35`); SN4 book citation in Kişisel Plan sources (`6e65f11`); meal-plan UI
  polish batch (`75abe85`); MOBILEUP/MOBILEDOWN docs (`3d0dc77`); DEC-033 protein-target consumer (`a1aad83`..`d77c0ef`).
- **Deploy state:** not recorded here. Deploys are manual and developer-run (see [`operations.md`](operations.md)).

## Open items

1. **Live QA of `refactor/combo-to-ready-meal` (pending).** Check the scope checkbox in onboarding and Kişisel
   Plan, the hidden targets on Yemek Planı, the new source badges, and the Hazır Yemekler / "Yedim" flows after
   the rename. Persisting the attestation across devices would need a `personal_plan` column (live migration).
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
4. **`agent-session down` reported "ERROR restoring .vercelignore"** (2026-10-27); the file was restored by hand
   with `git checkout -- .vercelignore` and is clean. Root cause not investigated (`scripts/agent-session.ps1`).
5. **Schema is not reproducible from the repo:** there is no `CREATE TABLE` for `nutrition`; closing this needs a
   schema-only dump of the live table from the developer. See [`architecture.md`](architecture.md) (Persistence &
   schema map).
6. **Meal-plan entries saved before 2026-09-21 may reorder on reload** (shared `position`; no backfill). Source:
   checkpoint [09-21-01](session-checkpoints/2026-09-21-01-meal-plan-cards-clear-undo.md).
7. **Stale pointers in historical records, left alone on purpose** (old `SESSION_FOLLOWUP.md` name, retired
   architecture headings); they are snapshots.

## Next Step

`QATEST` the merged rename/sources/safety work (open item 1). Then the remaining blocked decisions: weight
loop (DEC-027/084), training data (DEC-092), micronutrients (DEC-041), substitutions (DEC-063), pantry (DEC-065).

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
