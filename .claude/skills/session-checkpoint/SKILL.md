---
name: session-checkpoint
description: Use when the user runs /session-checkpoint or asks to record a dated session-checkpoint doc - creates a new file under docs/session-checkpoints/ for the current task and links it from docs/SESSION_FOLLOWUP.md's index.
---

Create exactly one new file under `docs/session-checkpoints/` documenting the current task or session, then add it to the index in `docs/SESSION_FOLLOWUP.md`.

This is distinct from the `session-followup` skill: `session-followup` maintains the single active
`docs/SESSION_FOLLOWUP.md` continuity summary and must never write under
`docs/session-checkpoints/`. This skill does the opposite — it only ever adds a new dated record
file, and makes the smallest possible index edit to `docs/SESSION_FOLLOWUP.md` to link it.

## Filename

`docs/session-checkpoints/YYYY-MM-DD-NN-slug.md`

- `YYYY-MM-DD`: today's date.
- `NN`: two-digit sequence number, scoped to that date only.
  - List existing files under `docs/session-checkpoints/` first.
  - If no file already starts with today's `YYYY-MM-DD-`, use `01`.
  - Otherwise take the highest existing `NN` for today's date and increment it.
  - Never reuse or overwrite an existing date+sequence pair — if a couple of changes happen on
    the same day, they keep the same date and get different sequence numbers and different slugs,
    never the same file.
- `slug`: a short kebab-case description of this specific record's topic (e.g.
  `mobile-bottom-nav-redesign`). Two records on the same day must have different slugs, since they
  cover different work.

## Content structure

# YYYY-MM-DD: <Title>

**Date:** YYYY-MM-DD
**Branch:** `<current branch, if any>`
**Status:** <one line — in progress / ready to begin / blocked / done>

## Current Objective

- What task or objective this record covers.

## Current State

- What has been completed.
- What is currently in progress.

## Files Changed

- Relevant files created, modified, or deleted. Omit if not yet applicable.

## Important Decisions

- Decisions that affect how the work should continue.

## Constraints

- Requirements or constraints that still apply. Omit if none.

## Problems / Unresolved Issues

- Known problems, blockers, or open questions. Omit if none.

## Next Steps

- Concrete actions required to continue. Order them when sequence matters.

Omit any section with nothing meaningful to say rather than padding it. Keep the whole record
concise — it should let another agent resume the work without re-reading the conversation.

## Updating the index

After writing the file, add exactly one new entry to the end of the numbered list in
`docs/SESSION_FOLLOWUP.md` (under "Detailed records are split into..."), linking to the new
file with a short descriptive title, and refresh the `_Last updated: YYYY-MM-DD_` line at the top
if the date changed. Do not renumber or edit existing entries.

## Rules

- Only create new files under `docs/session-checkpoints/`; never edit an existing dated record.
- Never touch the "Current Objective/State/..." body of `docs/SESSION_FOLLOWUP.md` itself —
  only append the one new index line and the last-updated date.
- Do not write to `~/vault/<project>/logs/` — that is the separate `session-log` skill's job.
- Do not modify source code or unrelated files.
- Use the current conversation as the primary source; inspect repository files only to verify
  facts (current branch, existing filenames in `docs/session-checkpoints/`) or to determine the
  next sequence number.
- Do not invent information that wasn't established in the session.
- After writing, state the new file's path and the index line you added. Do not perform any
  further action.
