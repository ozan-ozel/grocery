---
name: session-checkpoint
description: Use when the user runs /session-checkpoint or asks to record a dated session-checkpoint doc - creates a new historical record under docs/session-checkpoints/ for the current task and adds it to that folder's README.md index (never to docs/CURRENT_STATE.md).
---

Create exactly one new file under `docs/session-checkpoints/` documenting the current task or session, then add one row to the index in `docs/session-checkpoints/README.md`.

This is distinct from the `current-state-update` skill: `current-state-update` maintains the single active
`docs/CURRENT_STATE.md` continuation guide (current state only) and must never write under
`docs/session-checkpoints/`. This skill does the opposite — it only ever adds a new dated *historical* record
file and its row in `docs/session-checkpoints/README.md`. A checkpoint records what happened in a session; it is
never a substitute for `docs/CURRENT_STATE.md`, and `docs/CURRENT_STATE.md` is never used as a session log.

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

After writing the file, add exactly one new row at the end of the index table in
`docs/session-checkpoints/README.md` (`| N | [Short title](filename.md) |`, with the next number), linking to the
new file with a short descriptive title. Do not renumber or edit existing rows. Do not add an index or a list of
records to `docs/CURRENT_STATE.md`.

## Rules

- Only create new files under `docs/session-checkpoints/`. Existing records are historical snapshots: never
  rewrite one into a current-state record (a factual or status correction is a separate, deliberate edit, not
  part of this skill).
- Do not write to `docs/CURRENT_STATE.md` — that is the `current-state-update` skill's job. Never recreate a
  checkpoint index there.
- Do not write to `~/vault/<project>/logs/` — that is the separate `session-log` skill's job.
- Do not modify source code or unrelated files.
- Use the current conversation as the primary source; inspect repository files only to verify
  facts (current branch, existing filenames in `docs/session-checkpoints/`) or to determine the
  next sequence number.
- Do not invent information that wasn't established in the session.
- After writing, state the new file's path and the index row you added to `docs/session-checkpoints/README.md`. Do not perform any
  further action.
