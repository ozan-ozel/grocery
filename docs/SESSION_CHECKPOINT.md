# Session Checkpoint

_Last updated: 2026-09-07_

**This is the project's single active session-continuity record.** Historical logs live outside the
repository in `~/vault/grocery/logs/`. `nutrition-curriculum/00_PROJECT_CONTROL/PROJECT_STATUS.md`
remains the durable phase/project status source; phase artifacts and `DECISIONS/` records remain the
authoritative technical content. This file references those artifacts rather than duplicating them.

## Current Objective

Phase 9 (Application / Product Architecture) architecture work is **complete through the post-ratification
reconciliation**. The next substantive task is the **first actual implementation task**, bounded exactly by
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §20.12. **Implementation has not started.**

Execution status (protocol §48.8 state machine): **`READY`** — milestones checkpointed, no autonomous
execution active, no review gate open. Gate 7 (end of Phase 9) has **not** opened.

## Current State

- **Phase 8: CLOSED.** Gate 6 resolved GO (2026-09-07). Gates 1–6 all GO.
- **Phase 9: active, architecture-only.** All work lives in one artifact —
  `nutrition-curriculum/08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` (2,256 lines):
  - **§0–11** capability architecture (five-layer boundary model, `DEC-060`–`075` capability map).
  - **§12–13** dependency analysis across 13 areas.
  - **§14–15** domain-boundary + implementation-readiness analysis.
  - **§16** Human Decision Package (canonical Food identity; safety/exclusion taxonomy; recipe depth).
  - **§17** decision-to-implementation safety reconciliation (`DEC-038`/`053`/`061` traced into code).
  - **§18** human safety decision review package.
  - **§19** **RATIFICATION — A1 · B3 · C2** (2026-09-07). Record:
    `00_PROJECT_CONTROL/DECISIONS/2026-09-07-phase-9-safety-decisions-ratification.md`.
  - **§20** **post-ratification implementation readiness & architectural reconciliation** — the 26-capability
    readiness map, the implementation dependency order, the first milestone, the safety invariants, and the
    implementation boundary. **This is what the next session should read first.**
- **No implementation has begun** — no code, schema, API, or UI has been changed at any point.

### Ratified safety semantics (detail in §19 and §20.2; record in `DECISIONS/`)

- **A1 — intolerance stays a soft constraint.** Affirms `DEC-053` unchanged: allergy → hard exclusion;
  unclear → safer hard treatment/confirmation; intolerance → soft; preference → weaker filtering.
  The product has **no soft channel today**; A1 makes building one a requirement.
- **B3 — hybrid exclusion unit**: food-level *and* allergen-class-level. **Invariant: a safety-level
  allergen-class exclusion must not be defeated by a food-level "allow" or omission.** The decision model
  is **silent** on granularity — B3 supplies it; do not claim `DEC-053`/`061` already specified it.
- **C2 — validity window** on exclusions. **Invariant: expiry must not silently remove a safety-relevant
  exclusion**; flow is `active → review trigger → user confirmation → retain/modify/remove`. Neither
  `DEC-011` nor `DEC-054` reaches `DEC-061` — do not claim they already provide this.
- No `DEC` was amended and no `DEC` ID created.

### ⚠ Label collision (see §20.0)

The ratified **A1/B3/C2 are §18/§19's options**, never §16's. §16.2's "B3" means *"do nothing now"* and is
marked "Not recommended" — reading the ratification against §16 inverts it. §16.1's identity options
A1/A2/A3 are a different, still-**open** question.

### Current implementation reality (authoritative detail in §17 and §20.6)

- `comboMatch.ts:30` is the **only** consumer of `excluded_food_ids` in the whole codebase. Allergy
  enforcement: absent. Intolerance enforcement: absent. `MealFoodPicker`, the food browser and the shopping
  list apply no exclusion at all.
- `excluded_food_ids` is semantically overloaded (dislike / "cannot eat" / allergy) and item-level only.
- `DEC-038` dietary pattern is not collected anywhere; `combos.json` `tags` are parsed and never read.
- Exclusions are per user; the shopping list they populate is per household.
- **New in §20.6:** alias resolution exists only on the `POST /api/nutrition` path (the browse/catalog path
  drops `aliases`); `addItem`'s fuzzy canonicalisation and `isOnList`'s exact match can disagree; a failed
  exclusion save is only a `console.warn`, leaving it device-local.

## Files Changed

This session (all uncommitted, working tree only, on `master`):

- `nutrition-curriculum/08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` — new; extended
  in place through **§20**. §§0–19 verified byte-identical after the §20 append.
- `nutrition-curriculum/00_PROJECT_CONTROL/DECISIONS/2026-09-07-phase-9-safety-decisions-ratification.md`
  — new; the A1/B3/C2 ratification record.
- `nutrition-curriculum/00_PROJECT_CONTROL/DECISIONS/README.md` — stale "this folder is empty / no decisions
  have been made yet" text corrected. Governance rules unchanged.
- `nutrition-curriculum/11_PHASE_8_PRACTICAL_TRANSLATION/*` — Phase 8 closure records (earlier; read-only now).
- Session-continuity migration: this file, `PROJECT_AI_PROTOCOL.md` (§48 retargeted), `PROJECT_STATUS.md`
  and `CHATGPT_REVIEW_REQUEST.md` (stale pointers), and **`AI_SESSION_STATE.md` deleted**.

## Important Decisions

- Session continuity is this checkpoint plus `~/vault/grocery/logs/`; `AI_SESSION_STATE.md` was retired
  2026-09-07 and protocol §48 now points here.
- Phase 9 is extended **in place** in its one artifact — do not create new Phase 9 documents (§31).
- Corrections are recorded forward, never by rewriting earlier sections (§0.1, §12.1, §17, §20.0).

## Constraints

- **Do not reverse or reinterpret the ratified A1/B3/C2 semantics autonomously**, and do not amend
  `DEC-053`/`061`/`011`/`054`.
- Do not resolve autonomously: canonical Food identity's **anchor** (§16.1 A1/A2/A3), user-vs-household
  scope, allergen vocabulary, unmapped-food default, precedence mechanics, `DEC-067`, `DEC-069`,
  `DEC-099`/`DEC-100`, `DEC-021`/`110`, `DEC-090`.
- Do not modify stable IDs (213 topics, 112 decisions), rewrite historical decisions, or reopen Phase 8.
- **`excluded_food_ids` is still preference-grade in code.** Nothing shipped enforces allergy safety.
- Implementation may start **only** within §20.12's boundary. Everything under its
  "IMPLEMENTATION MUST NOT START YET" list stays closed.
- Everything is uncommitted on `master` (`origin/master` at `eae7811`); no git operation has been requested.

### Work that must not be repeated

- On Cooking 7e content inspection (`ON_COOKING_7E_EXECUTION_RECORD.md`) and the Phase 8 closure audit
  (`~/vault/grocery/logs/2026-09-07.md`).
- The `DEC-060`–`075` capability map (§2), the 13-area dependency inventory (§12), the domain-boundary pass
  (§14), the Human Decision Package (§16), the code trace (§17), the review package (§18), the ratification
  (§19), and the readiness/dependency/milestone reconciliation (§20). Extend; do not recreate.

## Problems / Unresolved Issues

1. **Canonical Food identity anchor** (§16.1 A1/A2/A3) — the *resolver seam* is buildable now and pre-empts
   neither; the anchor choice is open.
2. **Allergen vocabulary, mapping completeness, unmapped-food default, precedence mechanics** — B3's own
   carve-outs. A fail-open unmapped default would negate B3.
3. **User-vs-household exclusion scope** (§18.4, §20.7) — collision mapped, seam identified
   (`netlify/functions/_auth.ts` `assertHouseholdAccess`), decision preserved.
4. **No test suite exists** (`npm run build`'s `tsc -b` is the only check) — the first milestone introduces
   safety-relevant behavior with nothing to protect it. Test tooling is a user decision.

Lower priority: `DEC-067`; `DEC-069`; `DEC-099`/`DEC-100`; `DEC-021`/`110` and `DEC-090` values; the Linear
update the user requested but never specified.

## Next Steps

1. **First implementation task — Milestone 1 (§20.5): "Food resolution + exclusion-reason foundation."**
   One alias-aware, exact, fail-closed Food resolver; an exclusion entry carrying its `DEC-053`/`DEC-061`
   reason; consistent enforcement across food-presenting surfaces; honest labeling that claims no allergy
   safety. Files, unchanged-behavior list, safety properties and out-of-scope list are all in §20.5.
2. Get the user's call on test tooling before or alongside step 1.
3. Then Stage 1 safety semantics (§20.4): soft tier → unclear handling → *then* the blocked allergen work.
4. `DEC-067` gates all recipe work; `DEC-069` gates only restaurant-scale batching, **not** household
   batch preparation (§20.8).
5. Start every piece of coding work on a new branch before writing code (`CLAUDE.md`), and do not commit
   without being asked.

## Important Context

- Authoritative evidence: the Phase 9 artifact (technical content), `PROJECT_STATUS.md` (phase status),
  `00_PROJECT_CONTROL/DECISIONS/` (gate and ratification records), `APP_DECISION_INVENTORY.md`,
  `DECISION_LOGIC_SPECIFICATION.md`, `APP_DECISION_DEPENDENCY_GRAPH.md`.
- A concurrent Copilot-driven process previously edited files in `00_PROJECT_CONTROL/` — re-read files
  before editing if resuming after a gap.
