---
name: checkpoint-user
description: Use when the user runs /checkpoint-user or asks to save session continuation state - creates or updates docs/SESSION_CHECKPOINT.md with a compact summary of the current objective, state, decisions, and next steps.
---

Create or update exactly `docs/SESSION_CHECKPOINT.md`.

The checkpoint is the active continuity record for the current project. It is not a session transcript and must remain concise.

Capture only the information necessary for another agent or a new session to continue the current work after `/compact` or in a new session.

Use this structure:

# Session Checkpoint

## Current Objective

- What is the current task or objective?

## Current State

- What has been completed?
- What is currently in progress?

## Files Changed

- Relevant files that were created, modified, or deleted.
- Include only files relevant to continuing the current work.

## Important Decisions

- Decisions that affect how the work should continue.

## Constraints

- User requirements, technical constraints, or project constraints that still apply.

## Problems / Unresolved Issues

- Known problems, blockers, uncertainties, or questions that remain.

## Failed Approaches

- Approaches that were attempted and should not be repeated.
- Omit this section if there are none.

## Next Steps

- Concrete actions required to continue the work.
- Order them when sequence matters.

## Important Context

- Additional context that is necessary to resume the work but does not fit above.
- Keep this section minimal.

Rules:

- Modify only `docs/SESSION_CHECKPOINT.md`.
- Treat `docs/SESSION_CHECKPOINT.md` as the one active checkpoint for the whole project.
- Never resolve a checkpoint name, create a task-specific checkpoint, or write under
  `docs/session-checkpoints/`.
- Create the `docs/` directory if it does not yet exist.
- Do not create task-specific checkpoint files.
- Do not create session logs when running this skill.
- Do not modify source code or unrelated files.
- Use the current conversation as the primary source.
- Inspect repository files only when necessary to verify important facts.
- Do not perform implementation, testing, builds, installation, broad repository exploration, or unrelated work.
- Keep the checkpoint concise.
- Remove obsolete or redundant information when updating it.
- Preserve still-valid information from the existing checkpoint.
- Do not invent missing information.
- If an existing checkpoint contains information that is still relevant, update it rather than replacing it unnecessarily.
- If there is no meaningful change to the current state, do not add unnecessary detail.

Session logs are separate from this checkpoint.

Historical session logs belong in:

`~/vault/<project>/logs/`

They should be created or updated only when the session is explicitly ending/pausing or when a meaningful historical record is needed, according to `CLAUDE.md`.

The checkpoint should contain enough information to reconstruct the current working state without requiring the historical session logs.

After updating the checkpoint, briefly state which file was updated and the next recommended action. Do not perform that action.
