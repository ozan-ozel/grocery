# Implementation Handoff — Plan/Spec ↔ Implementation Tracker

**Bootstrapping a new collaborator or agent onto this system?** Send them
`IMPLEMENTATION_HANDOFF_STARTER.md` first — a short paste-able pointer to this file, not a copy of it.

**What this file is:** the live tracker for decisions currently moving between planning and
implementation. One side writes plans/specs; the other implements — see **Roles** below for who that
is at any given moment. This file is how the two sides — and any agent working on either side — stay
in sync without a live conversation.

**What this file is not:** it is not `DEC_REGISTER.md`. The register answers "which of the 112
decisions can be worked on at all" — a standing readiness index for the whole curriculum. This file
answers "what is actively in flight right now, and whose court is it in" — a small, fast-moving
operational log. A row only appears here once its DEC has a written spec and is being actively pushed
through implementation; most `BLOCKED`/`DEFERRED`/`COVERED` decisions in the register will never appear
here at all.

---

## Roles

**Planner** and **implementer** are roles, not fixed identities. Either collaborator — or their
agent — may act as either one, and which one can change from session to session or even within the
same day. This file never records *who* is playing which role, only *what state* a DEC is in. Work out
your own role from what you're about to do, not from habit or from who did what last time:

- About to write or finish a spec, with nothing of yours currently `PUSHED`/`IN_PROGRESS`/`BLOCKED` →
  you're acting as **planner** right now.
- About to build, get blocked on, or close out a `PUSHED` item → you're acting as **implementer** right
  now.

If it's genuinely unclear which one applies — see `COL` below, which asks rather than guesses.

## For any agent reading this file

- **Check this file before starting any nutrition-curriculum-linked implementation work.** If a row is
  `PUSHED`, `IN_PROGRESS`, or `BLOCKED`, that is the one active item — do not start a different one.
- **Only one row may be active (`PUSHED` / `IN_PROGRESS` / `BLOCKED`) at a time.** Whoever is acting as
  planner pushes one item; whoever is acting as implementer finishes or blocks it before the next is
  pushed. This is a hard rule, not a default — do not push or pick up a second item while one is
  active.
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

## If you are implementing

Picking up a `PUSHED` row (see **Roles** above — this is whoever is doing this right now, not a fixed
person):

1. Read the row's linked spec in `09_HANDOFF_SPECS/` in full before touching code.
2. Flip the row to `IN_PROGRESS`.
3. Build **only** what the spec's "Build this" section says. Hit an ambiguity, a missing prerequisite,
   or something the spec didn't anticipate → set the row to `BLOCKED`, write exactly what's blocking
   you in **Notes**, and stop. Do not guess or resolve it yourself — see the no-premature-implementation
   rule above.
4. This repo's own git rules apply to your work too (root `CLAUDE.md`): a new branch named for the
   change before writing any code, never a commit straight to `master`.
5. Before closing, run the spec's own "Self-close checklist" in full.
6. Move the row to the Closed table with status `DONE`. There's no review gate — this is
   self-certified, so the checklist is the bar.

If the Active table is empty, there's nothing pushed yet — check back later, don't start on something
unlisted.

## COL — collaboration checkpoint

`COL` is the resume keyword for this file (see `CLAUDE.md`'s Git shorthand section — it is not a git
operation and does not commit/merge/push anything by itself). Because **roles are fluid** (see
**Roles** above), `COL` does not assume who is asking or which role they're about to play — it reads
the state and, whenever more than one continuation is plausible, **asks instead of guessing.**

1. **Read the Active table first.**
   - A `BLOCKED` row → stop and surface the Notes/Blockers content to whoever invoked `COL`. Don't
     touch the spec or the row — this state needs a human answer, not an assumption about who that
     human is.
   - A `PUSHED` row → a spec is finished and waiting on an implementer. **Ask which is happening**:
     is the invoker picking this up to implement (→ hand off to "If you are implementing" above), or
     is something else going on? Do not silently assume either.
   - An `IN_PROGRESS` row → similarly ask whether the invoker is continuing that same implementation,
     before resuming it on their behalf. Either way, only one item may be active — do not start
     drafting a new spec while one is still out.
   - Nothing active → continue to step 2.
2. **Find the last-covered DEC.** The most recent entry in the Closed table below.
   - If exactly one plausible next DEC follows from it (e.g. the corpus/roadmap makes the sequence
     obvious), say so and confirm before drafting.
   - If Closed is empty, or more than one next DEC is plausible, or it's otherwise unclear — **ask
     which DEC to start with** rather than guessing an order from `DEC_REGISTER.md`.
3. **Resume planning from there**, once the invoker has confirmed they're acting as planner. Pick up
   (or start) the next DEC's spec file in `09_HANDOFF_SPECS/`, following `_TEMPLATE.md`. Cross-check
   it against `DEC_REGISTER.md` (only `READY`/`PROVISIONAL` decisions are workable — see that file's
   vocabulary) and against `APP_DECISION_INVENTORY.md` for what the decision actually covers.
4. **Do not flip a row to `PUSHED` as part of `COL` itself.** `COL` gets planning moving again; it
   ends with a spec draft (finished or in progress) reported back. Pushing a row is a separate,
   deliberate step once the spec is actually done — same as `PUSHED` already requires elsewhere in
   this file.

---

## Active

| DEC | Spec | Status | Pushed | Notes / Blockers |
|---|---|---|---|---|
| _none yet_ | | | | |

## Closed

| DEC | Spec | Pushed | Closed | Notes |
|---|---|---|---|---|
| _none yet_ | | | | |
