# Session Checkpoint

_Last updated: 2026-09-09_

**This is the project's single active session-continuity record.** Historical logs live outside the
repository in `~/vault/grocery/logs/`. `nutrition-curriculum/00_PROJECT_CONTROL/PROJECT_STATUS.md`
remains the durable phase/project status source; phase artifacts and `DECISIONS/` records remain the
authoritative technical content. This file references those artifacts rather than duplicating them.

## Current Objective

No task is currently in progress. The last completed unit of work was implementing DEC-069 (batch
cooking, leftovers, storage-aware planning) per its ratified scope and reconciled architecture, then
live-validating it against the actual configured Supabase project.

```text
DEC-067 decision:         CLOSED (ratified Level 1)
DEC-067 implementation:   CLOSED
DEC-068 decision:         CLOSED — DEFERRED FOR V1 (not implemented; no constraint model built)
DEC-069 decision:         CLOSED — V1 SCOPE RATIFIED (Option 3: household-scale multi-day batch
                          cooking, leftovers, storage-aware planning; restaurant-scale NOT ratified)
DEC-069 architecture:     investigated, audited, and reconciled — PreparationBatch + immutable
                          composition snapshot + MealEntry.batch_id
DEC-069 implementation:   COMPLETE — live data/API/database validated; browser click-through
                          QA PENDING (tooling unavailable, not an architectural gap)
DEC-070/DEC-071:          unchanged (DEC-069 exposes composition as DEC-071's future input only;
                          DEC-071 itself not implemented)
Canonical Food Identity:  CLOSED
Phase 9 doc architecture: investigated — no split justified
Next task:                none formally queued — interactive browser QA for DEC-069 is the only
                          outstanding validation follow-up; see Next Steps
```

Execution status (protocol §48.8 state machine): **`READY`** — no autonomous execution active, no
review gate open. Gate 7 (end of Phase 9) has **not** opened.

## Current State

- **Canonical Food Identity, DEC-067 (Level 1), DEC-068 (deferred for v1), and the Phase 9
  documentation-architecture/stale-reference maintenance pass are all settled, merged history.** Full
  detail: `CANONICAL_FOOD_IDENTITY_INVESTIGATION.md`, `DEC-067_*_INVESTIGATION.md`,
  `DEC-068_INVESTIGATION.md`, `2026-09-09-dec-068-deferred-v1-ratification.md`,
  `PHASE_9_DOCUMENTATION_ARCHITECTURE_INVESTIGATION.md`, and `~/vault/grocery/logs/2026-09-08.md`/
  `2026-09-09.md` — not reproduced here.
- **DEC-069 scope/architecture chain (investigation → ratification → implementation-architecture
  investigation → batch-composition audit → reconciliation) is settled, merged into `master`
  (commit `9a980c4`).** Full detail: `DEC-069_INVESTIGATION.md`, `2026-09-09-dec-069-v1-scope-
  ratification.md`, `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` (read its "Revised
  Architecture (Post-Audit)" section — authoritative for the `PreparationBatch` shape),
  `DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md` (found the original pointer-only shape
  **REVISION REQUIRED**), `DEC-069_IMPLEMENTATION_PLAN.md`.
- **DEC-069 implementation** — built on `feature/dec-069-batch-implementation` (branched from the
  verified clean `master` at `9a980c4`), two commits:
  - `842aed3` — the implementation itself: `preparation_batches` table (immutable JSONB
    `composition` snapshot, `source_combo_id` as non-authoritative provenance, optional
    `storage_note`) plus a nullable `meal_entries.batch_id`; `src/lib/preparationBatch.ts`'s pure
    `normalizeComposition`/`remainingComposition` (leftover derivation, 16 new passing tests);
    `netlify/functions/preparation-batches.ts` (GET/POST, no PATCH/DELETE — composition is
    write-once); `meal-entries.ts` extended with `batch_id` and a `batchId`-scoped GET; a minimal
    UI (`BatchPlanner.tsx`, mounted in `MealPlanView`) supporting both Combo-originated (scaled,
    reusing `scoreAllCombos`'s existing hard-exclusion filtering) and manually-assembled batches
    (reusing `MealFoodPicker`), plus per-batch remaining-quantity display and a mini
    allocate-to-meal form.
  - `24e58e5` — a live-QA-discovered fix: Supabase silently enabled RLS-with-zero-policies on the
    new `preparation_batches` table (identical drift class to the pre-existing
    `11-fix-anon-read-rls-drift.sql` incident on `meal_entries`/`personal_plan`) — disabled to match
    this app's Netlify-function-layer authorization model. Not an application code defect; no
    `src/` or `netlify/functions/` change was needed.
  - **Critical identity invariant, preserved and live-verified:** `composition[].food_id` uses the
    same value space as `meal_entries.food_id`/`Combo.items[].foodId` (`nutrition.name_tr`) — never
    the separate, opaque `Nutrition.food_id` UUID from Canonical Food Identity. Documented in
    `preparationBatch.ts`'s header comment and `DEC-069_IMPLEMENTATION_PLAN.md` §6.1.
- **Live validation performed** (both migrations `17-preparation-batches.sql` and
  `18-preparation-batches-rls-drift.sql` applied to the real Supabase project via its SQL editor,
  by the user):
  - Live schema confirmed via direct PostgREST queries: exact expected columns on
    `preparation_batches`; `meal_entries.batch_id` present; the pre-existing 42 `meal_entries` rows
    confirmed untouched.
  - Authenticated/unauthenticated/cross-household-isolation behavior all confirmed correct (401 /
    201 / 404 respectively) against the live API.
  - Combo-originated and manually-assembled batches both created and retrieved live, composition
    round-tripping exactly (an initial encoding mismatch was traced to a Windows/Git-Bash `curl -d`
    argv artifact in the verification tooling itself, not the application — confirmed by re-testing
    with a file-based payload).
  - **Leftover derivation worked example reproduced live, exactly**, across two real dates (multi-
    day): 1000/800/500 g batch → two 200/160/100 g allocations → **600/480/300 g remaining**.
  - **Mandatory historical-integrity test performed live and passed:** the real `combos.json`
    entry the test batch was created from was mutated (quantities changed, one ingredient
    swapped), the existing batch was re-fetched, and its `composition` was **provably unchanged**;
    the edit was then reverted via `git checkout`.
  - **Food Identity separation confirmed live:** the actual `Nutrition.food_id` UUID for a food was
    fetched and confirmed distinct from the string stored in that food's `composition[].food_id`.
  - All test data (batches, meal entries, households) created during verification was deleted
    afterward and confirmed gone.
  - 104/104 tests pass (16 new), `tsc -b` clean, `vite build` clean, `netlify/functions/tsconfig.json`
    typecheck clean.
  - **Not performed: interactive rendered-browser QA** (clicking through the actual `BatchPlanner`
    UI, observing exclusion filtering in the rendered picker, checking for React-key/console errors
    during the live flow) — no browser-automation tool was available in that session. This is a
    validation follow-up, not an unresolved architectural or product decision; everything the
    browser pass would exercise at the data/logic level has already been proven correct via the live
    API/DB verification above plus the existing/expanded automated test suite.
  - A minimal additive status note was added to the top of `DEC-069_IMPLEMENTATION_PLAN.md`
    pointing here; the plan's own body (options, invariants, sequence, verdict) is left as historical
    reasoning, unmodified.

## Files Changed

Committed on `feature/dec-069-batch-implementation` (pushed; not yet merged into `master` as of this
checkpoint's own commit — see Next Steps):

- `supabase/17-preparation-batches.sql`, `supabase/18-preparation-batches-rls-drift.sql` — new.
- `src/lib/preparationBatch.ts`, `src/lib/preparationBatch.test.ts` — new.
- `netlify/functions/preparation-batches.ts` — new.
- `src/hooks/useBatches.ts`, `src/components/BatchPlanner.tsx` — new.
- `netlify/functions/meal-entries.ts`, `src/lib/mealPlan.ts`, `src/lib/localMealPlan.ts`,
  `src/hooks/useMealPlan.ts`, `src/components/MealPlanView.tsx` — modified (additive `batchId`
  threading).
- `src/lib/combos.ts` — modified (extracted the existing raw-JSON-to-`Combo[]` loader, already used
  by `TodayView.tsx`, into a shared `ALL_COMBOS`/`COMBO_BY_ID` export so `BatchPlanner` reuses it
  rather than duplicating it).
- `src/components/TodayView.tsx` — modified (consumes the extracted loader; behavior unchanged).
- `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_IMPLEMENTATION_PLAN.md` — additive
  implementation-status note only; original plan body untouched.
- This file.

Already committed/merged into `master` (`9a980c4`): the full DEC-069 investigation/ratification/
architecture/audit/plan document set (see Current State above).

## Important Decisions

- DEC-069's ratified scope (Option 3) and reconciled architecture are unchanged by implementation —
  building it surfaced no need to reopen either.
- **`composition[].food_id` uses the existing `meal_entries.food_id`/`Combo.items[].foodId` value
  space (`nutrition.name_tr`), never `Nutrition.food_id`.** This is binding for any future work
  touching `PreparationBatch` — do not silently "upgrade" it to the opaque Canonical-Food-Identity
  UUID; doing so would break leftover derivation's equality join against `meal_entries.food_id`.
- The `preparation_batches` table has **no PATCH/DELETE endpoint** — `composition` is write-once by
  design (a correction creates a new batch; nothing edits an existing one in place).
- A newly created Supabase table in this project should be assumed to need the same RLS-disable
  treatment as `11-fix-anon-read-rls-drift.sql` already established, until/unless this project's
  Supabase account-level defaults are changed — this is now a second confirmed occurrence of the same
  platform-level drift, not a one-off.
- Interactive browser QA remaining pending is a **tooling-availability gap in this session, not a
  product or architecture question** — do not treat it as blocking further DEC-069-adjacent work, and
  do not reopen DEC-069's scope or architecture because of it.

## Constraints

- Do not resolve autonomously: `DEC-099`/`DEC-100`, `DEC-021`/`110`, `DEC-090`, allergen vocabulary,
  unmapped-food default, precedence mechanics, user-vs-household exclusion scope, DEC-069's
  restaurant-scale sub-question.
- Do not revert `PreparationBatch` to a scalar `total_quantity` or pointer-only `source_combo_id`
  design — proven insufficient and unsafe by the batch-composition audit, and now also the shipped,
  live-validated implementation.
- Do not conflate `composition[].food_id` with `Nutrition.food_id` in any future change.
- Do not modify stable IDs (213 topics, 112 decisions), rewrite historical decisions, or reopen
  Phase 8.
- Do not split, restructure, or reorganize Phase 9's documents.
- Recipe engine, pantry, portion/scaling beyond DEC-069's own needs, substitution, shopping
  optimization (`DEC-071`), and clinical functionality remain out of scope until their own decisions
  are made.

## Problems / Unresolved Issues

1. **Interactive browser QA for DEC-069 remains pending** — no browser-automation tool was available
   in the implementation session. Next step, whenever a working browser-automation environment is
   available: click through batch creation (Combo-originated and manual), confirm exclusion filtering
   renders correctly in the picker, confirm remaining-quantity display, and check for React-key/console
   errors during the live flow.
2. **Live-data alias collision: `"pirinç"`** — aliased by both `"beyaz pirinç"` and `"baldo pirinç"` in
   the live `nutrition` table. Not a live bug; worth a future data-quality pass. Not touched.
3. **70/89 live foods have no curated `allergen_classes` mapping** (only 19/89 do) — existing,
   unchanged, fail-closed B3 behavior.
4. `DEC-069`'s restaurant-scale sub-question remains fully open, untouched.
5. Two narrower open items from `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`'s "Requires
   Human Decision," re-confirmed still open by the implementation plan: whether
   `listActions.ts`'s existing non-quantity-aggregating shopping dedup should ever be improved
   (orthogonal to DEC-069, belongs to `DEC-071`'s future scope), and per-household-member attribution
   of a shared batch's leftovers (pre-existing limitation, unrelated to DEC-069). The storage-note
   depth question was resolved pragmatically during implementation — shipped at the minimum viable
   level (optional free text), not a structured model.
6. **Pre-existing documentation discrepancy, unrelated to DEC-068/069, flagged not fixed:** `DEC-065`'s
   own Inventory text claims Grocery "already tracks a household's... pantry" — confirmed via code
   trace that no pantry/inventory mechanism exists anywhere in the codebase.

## Next Steps

1. **Merge `feature/dec-069-batch-implementation` into `master`** (this checkpoint's own closeout
   commit is the last thing landing on that branch before the merge — see git history for the exact
   sequence).
2. **Interactive browser QA for DEC-069**, whenever a working browser-automation environment is
   available (see Problems/Unresolved Issues, item 1) — a validation follow-up, not a new task with
   its own scope.
3. The `"pirinç"` alias collision, expanded `allergen_classes` coverage, DEC-069's restaurant-scale
   sub-question, and the two orthogonal "Requires Human Decision" items above remain unstarted,
   unscheduled follow-ups — no next Phase 9 milestone is currently queued beyond these.

## Important Context

- Authoritative evidence: `00_PROJECT_CONTROL/DECISIONS/` (ratification records),
  `08_APP_TRANSLATION/DEC-067_*_INVESTIGATION.md`, `DEC-068_INVESTIGATION.md`,
  `DEC-069_INVESTIGATION.md`, `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` (read its
  "Revised Architecture (Post-Audit)" section, not the earlier superseded shape),
  `DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md`, `DEC-069_IMPLEMENTATION_PLAN.md` (read its
  top-of-file implementation-status note for the current state), `PHASE_9_APPLICATION_CAPABILITY_
  ARCHITECTURE.md`, `PROJECT_STATUS.md`.
- Implementation source of truth: `src/lib/preparationBatch.ts`'s header comment states the critical
  Food-Identity value-space invariant directly in code, not just in docs.
- Full session narrative and discoveries: `~/vault/grocery/logs/2026-09-08.md` and `2026-09-09.md`
  (the latter predates this implementation pass — update it via `/session-log` if a durable historical
  record of the implementation itself is wanted).
- A concurrent Copilot-driven process has previously done substantial work on this branch's ancestry
  (the B3 allergen-class implementation) — re-read files before editing if resuming after a gap; do not
  assume this checkpoint's description of a file is current without a fresh read.
