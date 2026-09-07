---
name: checkpoint-and-compact
description: Use when the user runs /checkpoint-and-compact or asks to checkpoint and compact the session - updates docs/SESSION_CHECKPOINT.md with the current session continuation state, then prompts the user to run /compact.
---

Update `docs/SESSION_CHECKPOINT.md` using the same rules and structure defined by the `checkpoint-user` skill.

The checkpoint must be the single active continuity record for the current project.

Do not create task-specific checkpoint files or use `docs/session-checkpoints/`.

Do not create session logs in `~/vault/grocery/logs/` as part of this skill.

Do not create or update Vault session logs as part of this skill.

Do not attempt to invoke `/compact` directly — it is a CLI-native command and cannot be triggered programmatically from within a skill.

After the checkpoint is successfully updated:

1. Tell the user that `docs/SESSION_CHECKPOINT.md` was updated.
2. Tell the user that the session is ready to compact.
3. Explicitly instruct the user to run `/compact` now.
4. Do not perform any other action.
