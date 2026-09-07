# Session Checkpoint

_Last updated: 2026-09-07_

## Current Objective

Implement and maintain the project's session-continuity system around one active checkpoint:
`docs/SESSION_CHECKPOINT.md`, with historical logs and durable knowledge stored outside the repository
in the Vault.

The nutrition-curriculum project is also paused at its current review gate and must remain resumable.

## Current State

- The continuity instructions and skills now use the single-checkpoint architecture.
- Phases 1-7 of the nutrition-curriculum project are closed.
- Phase 8 (Practical Translation) is in progress and blocked at Gate 6, opened 2026-09-07.
- `nutrition-curriculum/00_PROJECT_CONTROL/AI_SESSION_STATE.md` reports `WAITING_FOR_REVIEW`.
- Gates 1-5 resolved GO; Gate 6 requires the decision about culinary/food-preparation knowledge.

## Files Changed

Continuity work in this session:

- `CLAUDE.md`
- `.claude/skills/checkpoint-user/SKILL.md`
- `.claude/skills/checkpoint-and-compact/SKILL.md`
- `.claude/skills/session-log/SKILL.md`
- `docs/SESSION_CHECKPOINT.md`
- The former task-specific checkpoint `docs/session-checkpoints/SESSION_CHECKPOINT_nutrition_curriculum.md`
  was migrated here and removed.

Relevant existing nutrition-curriculum state:

- `nutrition-curriculum/00_PROJECT_CONTROL/AI_SESSION_STATE.md`
- `nutrition-curriculum/00_PROJECT_CONTROL/PROJECT_STATUS.md`
- `nutrition-curriculum/00_PROJECT_CONTROL/CHATGPT_REVIEW_REQUEST.md`
- `nutrition-curriculum/10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md`
- `nutrition-curriculum/11_PHASE_8_PRACTICAL_TRANSLATION/PRACTICAL_TRANSLATION_ANALYSIS.md`

## Important Decisions

- `docs/SESSION_CHECKPOINT.md` is the only active project checkpoint.
- Historical session logs belong in `~/vault/grocery/logs/`, not in the repository.
- Project-specific durable architecture notes belong in `~/vault/grocery/architecture/`.
- Cross-project durable knowledge belongs in `~/vault/permanent/`.
- The Vault is outside the repository and must not be committed.
- Do not resolve `DEC-099`/`DEC-100` or the Gate 6 knowledge-source question autonomously.
- Preserve all 213 stable topic IDs and all 112 `DEC` IDs.
- Do not close Phase-8-deferred numerical parameters by selecting plausible values.
- No production code, schema, UI, or executable algorithms until Phase 9.

## Constraints

- Do not modify application/source code for the continuity-system work.
- Preserve unrelated user changes in the working tree.
- Do not create task-specific checkpoint files or use `docs/session-checkpoints/` for active state.
- Do not create historical session logs unless explicitly requested or a meaningful historical record is
  needed; checkpoint updates do not create logs.
- Do not fabricate history or populate the Vault with invented historical information.
- Validate programmatically where possible.

## Problems / Unresolved Issues

1. Gate 6: decide whether culinary/food-preparation knowledge is admitted, excluded from v1, or handled
   only as a translation-layer capability. This blocks `DEC-066`, `DEC-067`-`069`, and usability analysis.
2. Domain C criteria remain blocked behind the unresolved clinical scope decisions `DEC-099`/`DEC-100`.
3. Open Gate 5 evidence tasks include the `DEC-021`/`110` deviation cap and `DEC-090` circuit-breaker
   parameters.
4. Non-blocking rulings remain on the `DEC-048` form correction and three provenance nuances.

## Failed Approaches

- The prior task-specific checkpoint under `docs/session-checkpoints/` was not suitable as the single
  active checkpoint. Its useful project state was migrated here instead of being discarded.
- The old continuity design mixed active checkpoint state with project-specific control files. Those files
  remain authoritative for their nutrition-curriculum workflow, while this file records the resume pointer.

## Next Steps

1. Keep `docs/SESSION_CHECKPOINT.md` current as the sole active checkpoint.
2. Await the Gate 6 decision; do not begin Phase 9.
3. Once supplied, record the decision in `nutrition-curriculum/00_PROJECT_CONTROL/DECISIONS/` and apply it
   to the Phase 8 practical-translation artifacts.

## Important Context

- The last nutrition-curriculum commit was `85cec9e` (Phase 3-6 checkpoint); do not rewrite or amend it.
- Existing uncommitted nutrition-curriculum and application changes predate or are outside this continuity
  task and must be preserved.
- Source-of-truth project files remain in the repository. This checkpoint is a concise continuation aid,
  not a replacement for those files.
