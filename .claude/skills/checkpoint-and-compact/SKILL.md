---
name: checkpoint-and-compact
description: Use when the user runs /checkpoint-and-compact or asks to checkpoint and compact the session - updates docs/CURRENT_STATE.md with the current session continuation state, then prompts the user to run /compact.
---

Update `docs/CURRENT_STATE.md` using the same rules and structure defined by the `session-followup` skill.

The follow-up doc must be the single active continuity record for the current project.

Do not create task-specific follow-up files or use `docs/session-checkpoints/`.

Do not create session logs in `~/vault/grocery/logs/` as part of this skill.

Do not create or update Vault session logs as part of this skill.

Do not attempt to invoke `/compact` directly — it is a CLI-native command and cannot be triggered programmatically from within a skill.

After the follow-up doc is successfully updated:

1. Tell the user that `docs/CURRENT_STATE.md` was updated.
2. Tell the user that the session is ready to compact.
3. Explicitly instruct the user to run `/compact` now.
4. Do not perform any other action.
