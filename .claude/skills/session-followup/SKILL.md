---
name: session-followup
description: Use when the user runs /session-followup or asks to save session continuation state - creates or updates docs/CURRENT_STATE.md, the current-state continuation guide, with a compact summary of the current objective, state, open items, and next step.
---

Create or update exactly `docs/CURRENT_STATE.md`.

`docs/CURRENT_STATE.md` is the active continuation guide for the current project: where the project stands now,
what remains, and how to continue. It describes only the *current* state. It is not a session transcript,
historical log, architecture document, roadmap or task archive, and it must remain concise.

Capture only the information necessary for another agent or a new session to continue the current work after `/compact` or in a new session.

Use this structure:

# Current State

This file describes the current project state and how to continue from it. It is not a historical session log, architecture document, roadmap, or task archive.

## Current Objective

- What is the current task or objective?

## Current State

- Branch, HEAD versus origin, and working-tree state (verify with git rather than copying old text).
- What is in progress; branches or worktrees that matter; what recently shipped (one line each).

## Open items

- A bounded list of current, actionable items, each with its source and status. Keep it short: resolve or delete
  items rather than letting the list grow. Mark anything not re-verified as "unverified".

## Next Step

- The single concrete next action.

## Constraints and decisions that affect continuation

- At most a handful of requirements, constraints or decisions that still apply. Rules that live in `CLAUDE.md`
  are linked, not restated.

## Where to look

- Links to the docs, and only the one checkpoint needed to continue. Point to
  `docs/session-checkpoints/README.md` for history; do not copy the index here.

Rules:

- Modify only `docs/CURRENT_STATE.md`.
- Treat `docs/CURRENT_STATE.md` as the one active continuation record for the whole project.
- Never resolve a task-specific name, create a task-specific follow-up file, or write under
  `docs/session-checkpoints/`.
- Create the `docs/` directory if it does not yet exist.
- Do not create task-specific follow-up files.
- Do not create session logs when running this skill.
- Do not turn `docs/CURRENT_STATE.md` into a historical session log: no chronological entries, no per-session
  narrative, no "latest session" sections, and no checkpoint index.
- Do not maintain the checkpoint index — `docs/session-checkpoints/README.md` and the historical records belong
  to the `session-checkpoint` skill.
- Do not modify source code or unrelated files.
- Use the current conversation as the primary source.
- Inspect repository files only when necessary to verify important facts.
- Do not perform implementation, testing, builds, installation, broad repository exploration, or unrelated work.
- Keep the follow-up doc concise.
- Remove obsolete or redundant information when updating it.
- Preserve still-valid information from the existing follow-up doc.
- Do not invent missing information.
- If the existing follow-up doc contains information that is still relevant, update it rather than replacing it unnecessarily.
- If there is no meaningful change to the current state, do not add unnecessary detail.

Session logs are separate from this follow-up doc, and so are the dated historical checkpoint records in
`docs/session-checkpoints/` (created by the `session-checkpoint` skill).

Historical session logs belong in:

`~/vault/<project>/logs/`

They should be created or updated only when the session is explicitly ending/pausing or when a meaningful historical record is needed, according to `CLAUDE.md`.

The follow-up doc should contain enough information to reconstruct the current working state without requiring the historical session logs.

After updating the follow-up doc, briefly state which file was updated and the next recommended action. Do not perform that action.
