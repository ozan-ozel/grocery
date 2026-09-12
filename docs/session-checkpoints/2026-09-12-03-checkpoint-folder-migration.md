# Session Record: Checkpoint Folder Migration

## Current Objective

Move the large active checkpoint into smaller, date-ordered records while retaining a concise active
index at `docs/SESSION_CHECKPOINT.md`.

## Current State

- Branch: `chore/compact-session-checkpoint`.
- Created `docs/session-checkpoints/` and split the prior checkpoint into date-ordered records.
- Added repository guidance requiring a session file in that folder after creating a branch for a plan
  or task.
- Registered the three repository-local checkpoint/session skills in `.claude/settings.json`.

## Next Steps

Review the generated records and commit the documentation/settings changes when satisfied.
