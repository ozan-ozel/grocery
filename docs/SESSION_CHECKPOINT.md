# Session Checkpoint

_Last updated: 2026-09-09_

**This is the project's single active session-continuity record.** Historical logs live outside the
repository in `~/vault/grocery/logs/`. `nutrition-curriculum/00_PROJECT_CONTROL/PROJECT_STATUS.md`
remains the durable phase/project status source; phase artifacts and `DECISIONS/` records remain the
authoritative technical content. This file references those artifacts rather than duplicating them.

## Current Objective

No task is currently in progress. The last completed unit of work was a DEC-069 implementation-
architecture chain: an implementation-architecture investigation, a follow-up batch-composition audit
that found the proposed data model insufficient (**REVISION REQUIRED**), and a reconciliation that
applied the correction back into the architecture document. **Next authorized task: none formally
queued — git closeout of all pending DEC-069 work is the next mechanical step; DEC-069's actual
implementation remains unauthorized until separately requested.**

```text
DEC-067 decision:         CLOSED (ratified Level 1)
DEC-067 implementation:   CLOSED
DEC-068 decision:         CLOSED — DEFERRED FOR V1 (not implemented; no constraint model built)
DEC-069 decision:         CLOSED — V1 SCOPE RATIFIED (Option 3: household-scale multi-day batch
                          cooking, leftovers, storage-aware planning; restaurant-scale NOT ratified)
DEC-069 architecture:     investigated, audited, and reconciled — PreparationBatch + immutable
                          composition snapshot + MealEntry.batch_id (see Current State)
DEC-069 implementation:   NOT STARTED
DEC-070/DEC-071:          unchanged
Canonical Food Identity:  CLOSED
Phase 9 doc architecture: investigated — no split justified
Next task:                none formally queued (git closeout, then implementation if authorized)
```

Execution status (protocol §48.8 state machine): **`READY`** — no autonomous execution active, no
review gate open. Gate 7 (end of Phase 9) has **not** opened.

## Current State

- **Canonical Food Identity, DEC-067 (Level 1), and the Phase 9 documentation-architecture/stale-
  reference maintenance pass are all settled, merged history** (`master` through `986fcb2`). Full detail:
  `CANONICAL_FOOD_IDENTITY_INVESTIGATION.md`, `DEC-067_*_INVESTIGATION.md`, `PHASE_9_DOCUMENTATION_
  ARCHITECTURE_INVESTIGATION.md`, and `~/vault/grocery/logs/2026-09-08.md`/`2026-09-09.md` — not
  reproduced here.
- **DEC-068 (skill/time/equipment constraint matching)** — investigated, audited (its Inventory
  "Downstream Use: DEC-070" note has no formal graph edge — classified INFORMATIVE/CONTEXTUAL, not an
  error), and human-ratified **deferred for v1**
  (`00_PROJECT_CONTROL/DECISIONS/2026-09-09-dec-068-deferred-v1-ratification.md`). Committed, merged
  `--no-ff` into `master` as `19fda62`, pushed. **`master` == `origin/master`** at `19fda62`.
- **DEC-069 (batch cooking, leftovers, storage)** — full chain completed on branch
  `feature/dec-069-investigation` (branched from `19fda62`):
  1. **Scope investigation** (`DEC-069_INVESTIGATION.md`) — exact definition, two formal dependencies
     (`DEC-066 → DEC-069 → DEC-071`, both `REQUIRED`, no discrepancy), full decision-neighborhood
     analysis, zero existing code capability confirmed.
  2. **Human ratification** — **Option 3: household-scale multi-day batch cooking, leftovers, and
     storage-aware planning** (`00_PROJECT_CONTROL/DECISIONS/2026-09-09-dec-069-v1-scope-ratification.md`).
     Restaurant/professional-scale production explicitly **not** ratified, remains open.
  3. **Implementation-architecture investigation** (`DEC-069_IMPLEMENTATION_ARCHITECTURE_
     INVESTIGATION.md`) — traced the actual meal/combo/shopping model (no `Meal`/`Recipe`/`Batch` entity
     exists; `meal_entries` is flat with no plan-vs-eaten status; `Combo` is a static, unversioned JSON
     template; shopping dedups by existence, never sums quantities) and recommended the smallest
     sufficient architecture: exactly one new concept, `PreparationBatch`, plus one new nullable
     `meal_entries.batch_id` column.
  4. **Batch-composition audit** (`DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md`) — found the
     originally-proposed `PreparationBatch` shape (a singular `total_quantity` scalar + `source_combo_id`
     pointer, no explicit composition) **insufficient**: can't represent a manually-assembled batch at
     all, and can't safely reconstruct a Combo-originated batch's history since `data/combos.json` has no
     versioning and every read path resolves combo data live. Also surfaced a genuine **safety** finding:
     under the pointer-only design, exclusion vetting done at batch creation could go silently stale if
     the source combo were later edited. Result: **REVISION REQUIRED**.
  5. **Reconciliation** — applied back into `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`
     (additive notes + a new "Revised Architecture (Post-Audit)" section, original text preserved).
     **Corrected model:** `PreparationBatch` now carries an immutable
     `composition: {food_id, quantity_g}[]` snapshot captured once at creation (reusing `Combo.items`'
     existing shape), with `source_combo_id` demoted to optional, non-authoritative provenance only.
     `MealEntry.batch_id` (nullable, FK-less) unchanged. No new human decision was required — DEC-069's
     ratified scope is unaffected; only its not-yet-implemented architecture was corrected.
  - **No implementation of any kind was performed at any step** — no schema, code, API, JSON, or UI
    change; `scaleNutrition()`, Food Identity resolution, and exclusion filtering are all untouched.
  - `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §20.13/§20.14 received minimal additive corrections
    noting both `DEC-067`/`DEC-069`'s now-ratified status (original text preserved).
  - **Not yet committed/merged/pushed** — all of this sits uncommitted on `feature/dec-069-investigation`.
    Git closeout is a separate, later step (see Next Steps).

## Files Changed

Uncommitted, on `feature/dec-069-investigation` (branched from `master` at `19fda62`):

- `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_INVESTIGATION.md` — scope investigation (new).
- `nutrition-curriculum/00_PROJECT_CONTROL/DECISIONS/2026-09-09-dec-069-v1-scope-ratification.md` —
  ratification record (new).
- `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` —
  implementation-architecture investigation, since additively corrected by the reconciliation step (new).
- `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md` — the
  composition audit that found REVISION REQUIRED (new).
- `nutrition-curriculum/08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` — §20.13/
  §20.14 additive corrections noting `DEC-067`/`DEC-069`'s ratified status (modified).
- `docs/SESSION_CHECKPOINT.md` — this file (modified).

Already committed/merged into `master` (`19fda62`): DEC-068's investigation, dependency audit, and
ratification record. Earlier settled history (Canonical Food Identity, DEC-067 implementation, Phase 9
doc maintenance) — see git log / `~/vault/grocery/logs/2026-09-08.md` if that detail is ever needed again.

## Important Decisions

- Every set of ready-to-commit changes gets its own short-lived branch before committing, merged
  `--no-ff` into `master` (never squashed) — including doc-only work. **A self-caught exception this
  session:** the DEC-068 closeout commit (`8f26876`) was initially made directly on `master`; corrected
  without data loss by moving it to a branch via `git branch -f` and restoring `master`, then properly
  branching→committing→merging. No `reset --hard`, no force-push were used.
- DEC-068 is ratified **deferred for v1** — no skill/time/equipment constraint matching, filtering, or
  disclosure UI is authorized. `DEC-067`'s `prepMinutes`/`prepNote` must not silently become DEC-068
  signals. Reopening it requires its own future evaluation.
- `DEC-068 → DEC-070` is INFORMATIVE/CONTEXTUAL, not a formal dependency — confirmed by audit; no
  correction to the Dependency Graph or Inventory needed or made.
- DEC-069 is ratified **Option 3 — household-scale multi-day batch cooking, leftovers, and storage-aware
  planning**. Restaurant/professional-scale production is explicitly NOT ratified; pantry/inventory
  reconciliation stays `DEC-065`/`DEC-072`'s territory; no general-purpose recipe-scaling engine beyond
  what the ratified capability needs.
- **DEC-069's architecture is `PreparationBatch` (one new concept) + `MealEntry.batch_id` (one new
  nullable column)**, with `PreparationBatch` holding an **immutable composition snapshot**
  (`{food_id, quantity_g}[]`), not a scalar total or a bare combo pointer. `source_combo_id` is
  provenance-only, never authoritative for reconstructing composition. This correction is binding for
  any future implementation — do not silently revert to the pre-audit, pointer-only shape.
- DEC-069 implementation is **not authorized** by either the scope ratification or the architecture work
  above — all of it is investigation/architecture only. A separate, explicit authorization is required
  before any schema/code/API/UI work begins.

## Constraints

- Do not resolve autonomously: `DEC-099`/`DEC-100`, `DEC-021`/`110`, `DEC-090`, allergen vocabulary,
  unmapped-food default, precedence mechanics, user-vs-household exclusion scope, DEC-069's
  restaurant-scale sub-question.
- Do not begin DEC-069 implementation (schema/code/API/UI) without separate explicit authorization — the
  architecture is settled, but building it is a distinct, unauthorized next step.
- Do not revert `PreparationBatch` to a scalar `total_quantity` or pointer-only `source_combo_id` design
  — proven insufficient and unsafe by the batch-composition audit.
- Do not modify stable IDs (213 topics, 112 decisions), rewrite historical decisions, or reopen Phase 8.
- Do not split, restructure, or reorganize Phase 9's documents.
- Recipe engine, pantry, portion/scaling beyond DEC-069's own needs, substitution, shopping optimization,
  and clinical functionality remain out of scope until their own decisions are made.

## Problems / Unresolved Issues

1. **Live-data alias collision: `"pirinç"`** — aliased by both `"beyaz pirinç"` and `"baldo pirinç"` in
   the live `nutrition` table. Not a live bug; worth a future data-quality pass. Not touched.
2. **70/89 live foods have no curated `allergen_classes` mapping** (only 19/89 do) — existing, unchanged,
   fail-closed B3 behavior.
3. `DEC-069`'s restaurant-scale sub-question remains fully open, untouched.
4. **Git closeout for all of the DEC-069 work above (§ Current State) is not yet done** — everything is
   uncommitted on `feature/dec-069-investigation`.
5. Two narrower open items surfaced by the DEC-069 architecture work, not yet resolved (from
   `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`'s "Requires Human Decision"): whether the
   storage note ships in v1 at all, and whether `listActions.ts`'s existing non-quantity-aggregating
   shopping dedup should ever be improved (orthogonal to DEC-069, belongs to `DEC-071`'s future scope).
6. **Pre-existing documentation discrepancy, unrelated to DEC-068/069, flagged not fixed:** `DEC-065`'s
   own Inventory text claims Grocery "already tracks a household's... pantry" — two independent code
   traces this session confirmed no pantry/inventory mechanism exists anywhere in the codebase.

## Next Steps

1. **Git closeout (BCMP)** for all of the uncommitted DEC-069 work listed under Files Changed — the next
   mechanical step once authorized.
2. **DEC-069 implementation** (schema/API/UI for `PreparationBatch` + `meal_entries.batch_id`, per the
   reconciled architecture) — remains unauthorized; would need its own separate explicit request.
3. The `"pirinç"` alias collision, expanded `allergen_classes` coverage, and DEC-069's restaurant-scale
   sub-question remain unstarted, unscheduled follow-ups.

## Important Context

- Authoritative evidence: `00_PROJECT_CONTROL/DECISIONS/` (ratification records, including
  `2026-09-09-dec-068-deferred-v1-ratification.md` and `2026-09-09-dec-069-v1-scope-ratification.md`),
  `08_APP_TRANSLATION/DEC-067_*_INVESTIGATION.md`, `DEC-068_INVESTIGATION.md`, `DEC-069_INVESTIGATION.md`,
  `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` (read its "Revised Architecture (Post-Audit)"
  section, not the earlier superseded shape), `DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md`,
  `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`, `PROJECT_STATUS.md`.
- Full session narrative and discoveries: `~/vault/grocery/logs/2026-09-08.md` and `2026-09-09.md`.
- A concurrent Copilot-driven process has previously done substantial work on this branch's ancestry
  (the B3 allergen-class implementation) — re-read files before editing if resuming after a gap; do not
  assume this checkpoint's description of a file is current without a fresh read.
