---
name: session-log
description: Use when the user runs /session-log or asks to save a historical record of the current session - writes a concise session log to ~/vault/<project>/logs/YYYY-MM-DD.md.
---

Create or update the current session's historical log in:

`~/vault/<project>/logs/YYYY-MM-DD.md`

Determine `<project>` from the current repository/project context.

The session log is a historical record of meaningful work completed during the session. It is not the active continuation checkpoint.

The active continuation state belongs in:

`docs/SESSION_CHECKPOINT.md`

The project name for this repository is `grocery`, so the default Vault log path is
`~/vault/grocery/logs/YYYY-MM-DD.md`.

Capture the meaningful events from the current session, including:

- What was done
- Important decisions
- Problems encountered
- Approaches that failed or were abandoned
- Important discoveries or insights
- What remains unresolved
- Relevant next steps

Use this structure:

---

date: YYYY-MM-DD
project: <name>
status: <in-progress | blocked | completed>

---

## What was done

-

## Decisions made

-

## Next steps

-

## Open questions

-

Rules:

- Write the log to `~/vault/<project>/logs/YYYY-MM-DD.md`.
- Create the required Vault directory if it does not exist.
- Do not modify source code.
- Do not modify `docs/SESSION_CHECKPOINT.md` unless explicitly requested.
- Do not modify architecture documents.
- Do not modify unrelated files.
- Use the current conversation as the primary source.
- Inspect repository state only when necessary to verify important facts.
- Do not perform implementation, testing, builds, installation, or unrelated work.
- Do not record every conversational message.
- Summarize meaningful work, decisions, discoveries, and outcomes.
- Do not invent missing information.
- Preserve important historical information already present in the same day's log when updating it.
- If a log for the current date already exists, update it rather than creating a duplicate.
- Keep the log concise enough to be useful as historical context.
- Do not copy the entire `docs/SESSION_CHECKPOINT.md` into the session log.
- The session log may contain information that is no longer current; that is expected because it is historical.

When recording decisions, distinguish between:

- decisions actually made during the session
- possible ideas or suggestions that were not adopted

Only record adopted decisions under `## Decisions made`.

After writing the log, briefly state the Vault log path that was updated. Do not perform any additional work.
