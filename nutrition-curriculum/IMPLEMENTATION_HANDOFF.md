# Implementation Handoff — Plan/Spec ↔ Implementation Tracker

**What this file is:** the live tracker for decisions currently moving between planning and
implementation. One person (or their agent) writes plans/specs; the other implements. This file is
how the two sides — and any agent working on either side — stay in sync without a live conversation.

**What this file is not:** it is not `DEC_REGISTER.md`. The register answers "which of the 112
decisions can be worked on at all" — a standing readiness index for the whole curriculum. This file
answers "what is actively in flight right now, and whose court is it in" — a small, fast-moving
operational log. A row only appears here once its DEC has a written spec and is being actively pushed
through implementation; most `BLOCKED`/`DEFERRED`/`COVERED` decisions in the register will never appear
here at all.

---

## For any agent reading this file

- **Check this file before starting any nutrition-curriculum-linked implementation work.** If a row is
  `PUSHED`, `IN_PROGRESS`, or `BLOCKED`, that is the one active item — do not start a different one.
- **Only one row may be active (`PUSHED` / `IN_PROGRESS` / `BLOCKED`) at a time.** The planner pushes one
  item; the implementer finishes or blocks it before the next is pushed. This is a hard rule, not a
  default — do not push or pick up a second item while one is active.
- **Build only what the linked spec file says.** Hit an ambiguity, a missing prerequisite, or something
  the spec didn't anticipate → set the row to `BLOCKED`, write exactly what's blocking it in **Notes**,
  and stop. Do not resolve the ambiguity yourself and keep going — this mirrors
  `00_PROJECT_CONTROL/PROJECT_AI_PROTOCOL.md` §28's no-premature-implementation rule, applied to this
  handoff specifically.
- **This repo's own git discipline still applies to implementation work**: a new branch named for the
  change before writing code, never a commit straight to `master` (see the root `CLAUDE.md`).
- **Closing a row is self-certified.** There is no review gate — the implementer runs the closing
  checklist in the spec file themselves, merges, and flips the row to `DONE`. The checklist is the bar,
  not someone else's sign-off.
- **This table is append-only for closed rows.** Move a finished row to the Closed archive below rather
  than deleting it — history stays visible, same as `PROJECT_STATUS.md`'s pattern elsewhere in this
  corpus.

## Status vocabulary

| Status | Meaning | Set by |
|---|---|---|
| `SPEC_DRAFTING` | Spec is being written; not yet workable | Planner |
| `PUSHED` | Spec is finished and this is the active item | Planner |
| `IN_PROGRESS` | Implementer has started | Implementer |
| `BLOCKED` | Implementer needs planner input — see Notes | Implementer |
| `DONE` | Implemented, self-checked, merged to master | Implementer |

---

## Active

| DEC | Spec | Status | Pushed | Notes / Blockers |
|---|---|---|---|---|
| _none yet_ | | | | |

## Closed

| DEC | Spec | Pushed | Closed | Notes |
|---|---|---|---|---|
| _none yet_ | | | | |
