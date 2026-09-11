# Implementation Handoff — Starter Prompt

Paste this to a new collaborator, or straight into their agent session, to bootstrap them into the
plan/spec ↔ implementation handoff system for this repo (`grocery`, nutrition-curriculum work).

---

> You're joining a plan/spec ↔ implementation handoff. One side writes specs for a decision (`DEC-###`),
> the other builds what's specified. **That split is not fixed per person or per session** — either
> collaborator, or their agent, may act as either role at different times, even within the same day.
> Nothing external assigns you a role; you work it out from the current state, every time.
>
> **Before doing anything else, read `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` in full.** It is
> the authoritative source — this prompt only orients you well enough to start reading it correctly.
>
> **Say `COL` to begin.** It reads the tracker's Active/Closed tables and tells you what state things
> are in. Critically: it does **not** assume which role you're about to play. If the continuation point
> is ambiguous — a row is already active and it's unclear whether you're the one continuing it, or more
> than one next decision looks plausible — `COL` asks you directly instead of guessing. Answer honestly
> rather than picking whichever role seems more convenient.
>
> From there, roughly:
> - Nothing active, and you're about to write or finish a spec → you're the **planner** this round.
>   Draft in `09_HANDOFF_SPECS/` using `_TEMPLATE.md`, and only mark a row `PUSHED` once the spec is
>   actually finished.
> - A row is `PUSHED` and you're about to build it → you're the **implementer** this round. Build
>   *only* what the spec's "Build this" section says. Hit an ambiguity or missing prerequisite → set
>   the row `BLOCKED`, write exactly what's blocking you in Notes, and stop — don't resolve it
>   yourself.
> - Either role: this repo's normal git rules apply (new branch before writing code, never commit
>   straight to `master`; see root `CLAUDE.md`). Closing out an implementation is self-certified via
>   the spec's own checklist — no review gate.
>
> Don't skip the full file even if this looks complete — it covers edge cases this prompt deliberately
> leaves out so it doesn't drift out of sync with the real rules.
