# 2026-09-15: Active-work tracker removal and docs/ classification pass

**Date:** 2026-09-15
**Branch:** `chore/remove-active-work-vscode-tracker`
**Status:** Done — pending user review/commit (no-auto-commit rule)

## Current Objective

Classify `docs/` for organization, and remove the standalone `ACTIVE-WORK-vscode.md` tracker and
every reference to it, since it was an orphaned handoff mechanism separate from the documented
`docs/SESSION_CHECKPOINT.md` system.

## Current State

- Surveyed the full `docs/` tree by filename/path only (no content reads) and proposed a
  classification: canonical router-referenced docs, active session-continuity docs, historical
  `superpowers/plans|specs` records, and a handful of root-level docs not referenced anywhere in
  `CLAUDE.md`'s router (`knowledge-map.md`, `netlify-vercel-migration-plan.md`,
  `MEAL_TRACKING_IMPLEMENTATION.md`, `v2-north-star-design.md`) — none of these were touched.
- Identified `docs/superpowers/plans/ACTIVE-WORK-vscode.md` as an anomaly (only non-dated file in
  a strictly dated folder) and, per the user's explicit request, removed it:
  - `git rm docs/superpowers/plans/ACTIVE-WORK-vscode.md`
  - Edited `.copilot-agent-kit-adaptation.md` (the only other file referencing it repo-wide) to
    drop the "review ACTIVE-WORK-vscode.md" step and repoint its "active handoff record" language
    at `docs/SESSION_CHECKPOINT.md`.
- Confirmed with a repo-wide grep that no references to `ACTIVE-WORK` remain.
- Created a new project skill, `.claude/skills/session-checkpoint/SKILL.md`, for generating dated
  records under `docs/session-checkpoints/` (a gap — the existing `checkpoint-user` skill
  explicitly refuses to write there). This file is that skill's first real-world test run.

## Files Changed

- `docs/superpowers/plans/ACTIVE-WORK-vscode.md` — deleted (staged).
- `.copilot-agent-kit-adaptation.md` — modified (staged).
- `.claude/skills/session-checkpoint/SKILL.md` — new skill file.
- `docs/session-checkpoints/2026-09-15-02-active-work-tracker-removal.md` — this file.
- `docs/SESSION_CHECKPOINT.md` — index entry added by this same skill run.

## Important Decisions

- Root-level docs not in `CLAUDE.md`'s router (`knowledge-map.md`,
  `netlify-vercel-migration-plan.md`, `MEAL_TRACKING_IMPLEMENTATION.md`, `v2-north-star-design.md`)
  were flagged but deliberately left unclassified/untouched — no action approved on them yet.
- `docs/session-checkpoints/` stays a flat, date-sorted folder (no subfolders) — only 11 files,
  and CLAUDE.md's ISO-date + sequence-number convention already exists specifically to keep it
  flat-sortable.

## Next Steps

- User reviews and commits the staged `chore/remove-active-work-vscode-tracker` branch (no
  auto-commit per project rule).
- Decide whether/how to reclassify the four unrouted root-level docs (link into `CLAUDE.md`'s
  router, move under `superpowers/specs|plans`, or archive).
- Optional: decide if `docs/v2-north-star-design.md` and the matching
  `2026-09-12-09-version-2-north-star-ui.md` checkpoint should be cross-linked, since they were
  identified as the only filename-confirmed V2/"North Star" pair.
