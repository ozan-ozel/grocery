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
- **This file does not feed `00_PROJECT_CONTROL/PROJECT_STATUS.md` on every `DONE`.** The two operate
  at different granularity on purpose: this file is the fast per-DEC operational log, `PROJECT_STATUS.md`
  is the coarse session/milestone narrative. Add a `PROJECT_STATUS.md` entry only at a batch
  checkpoint — several DECs closed, a PSM-style milestone, or a finding worth surfacing at the project
  level — and have it link to this file's Closed table rather than repeat its content. A
  `PROJECT_STATUS.md` entry per individual `DONE` row would drown the project-level log in noise (see
  `PROJECT_AI_PROTOCOL.md` §31 on not duplicating a source of truth).

## Status vocabulary

| Status | Meaning | Set by |
|---|---|---|
| `SPEC_DRAFTING` | Spec is being written; not yet workable | Planner |
| `PUSHED` | Spec is finished and this is the active item | Planner |
| `IN_PROGRESS` | Implementer has started | Implementer |
| `BLOCKED` | Implementer needs planner input — see Notes | Implementer |
| `DONE` | Implemented, self-checked, merged to master | Implementer |

## COL — collaboration checkpoint

`COL` is the resume keyword for this file, said by the planner (see `CLAUDE.md`'s Git shorthand
section — it is not a git operation and does not commit/merge/push anything by itself). On `COL`:

1. **Read the Active table first.**
   - A `BLOCKED` row → stop and surface the Notes/Blockers content to the planner. That's the whole
     point of `COL` in this state: get the blocker in front of the person who can resolve it. Do not
     touch the spec or the row until they respond.
   - A `PUSHED` or `IN_PROGRESS` row → report its status and stop. Only one item may be active; do not
     start drafting the next spec while one is still out.
   - Nothing active → continue to step 2.
2. **Find the last-covered DEC.** The most recent entry in the Closed table below. If Closed is also
   empty, there is no "last DEC" — ask the planner which DEC to start with rather than guessing an
   order from `DEC_REGISTER.md`.
3. **Resume planning from there.** Pick up (or start) the next DEC's spec file in
   `09_HANDOFF_SPECS/`, following `_TEMPLATE.md`. Cross-check it against `DEC_REGISTER.md` (only
   `READY`/`PROVISIONAL` decisions are workable — see that file's vocabulary) and against
   `APP_DECISION_INVENTORY.md` for what the decision actually covers.
4. **Do not flip a row to `PUSHED` as part of `COL` itself.** `COL` gets planning moving again; it
   ends with a spec draft (finished or in progress) reported back to the planner. Pushing a row is a
   separate, deliberate step once the spec is actually done — same as `PUSHED` already requires
   elsewhere in this file.

---

## Active

| DEC | Spec | Status | Pushed | Notes / Blockers |
|---|---|---|---|---|
| _none yet_ | | | | |

## Closed

| DEC | Spec | Pushed | Closed | Notes |
|---|---|---|---|---|
| _none yet_ | | | | |
