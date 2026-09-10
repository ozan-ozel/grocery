# DEC Register & Readiness Vocabulary — Design

**Date:** 2026-09-10
**Status:** Approved for planning
**Scope:** `nutrition-curriculum/` navigation and implementation-readiness status. No application code.

## Problem

`nutrition-curriculum/` holds 54 files and ~24,000 lines across twelve phase folders. Two things are
hard for a reader or an agent arriving cold:

1. **There is no entry point.** The corpus has no top-level `README.md`; the actual orientation
   document is one level down at `00_PROJECT_CONTROL/README.md`. Folder numbers do not track phase
   numbers (`09_` is Phase 4, `08_` is Phase 9), so the layout misleads on first contact.
2. **There is no way to answer "what can I work on?"** The 112 application decisions
   (`DEC-001`–`DEC-112`) do carry an implementation triage, but it lives inside §3 of
   `08_APP_TRANSLATION/PSM_ITERATION_1_IMPLEMENTATION_LEDGER.md`, is keyed by opaque single letters
   (`A`–`H`), and is partly expressed as ranges (`012–016`, `025–030`) rather than per-decision rows.
   Answering the question today means reading a long document and decoding a legend.

This blocks collaboration: work is to be split between specs written in this repo and execution by a
second party (including their AI agents), all in git. A collaborator cannot pick up work they cannot
find, and cannot be trusted to distinguish "build this for real" from "build a deliberate placeholder"
if both are labelled the same.

## Goals

- A single authoritative, scannable answer to "what is executable now?"
- Status words a newcomer understands without a legend.
- A real entry point into the corpus.
- No re-decision of any `DEC`, and no second source of truth for anything that already has one.

## Non-Goals

Explicitly out of scope, and not to be done incidentally:

- Re-triaging any decision. The register **transcribes** the existing triage; it does not revisit it.
- Amending, closing, reopening, or renaming any `DEC` (`PROJECT_AI_PROTOCOL.md` §30).
- Resolving anything currently `BLOCKED`, or supplying any deferred numerical parameter.
- Fixing the P0 exclusion-persistence regression or the P1 `combo_id`/`batch_id` regression. Those are
  separate work, tracked in `PROJECT_STATUS.md`.
- Splitting, merging, or renumbering any existing document (`PROJECT_AI_PROTOCOL.md` §31, and the
  2026-09-08 structural-maintenance finding that the corpus is not oversized).
- Any Linear integration. Collaboration is git-only; this was decided during design.

## Design

### 1. Readiness vocabulary

Six words, mapped one-to-one from the ledger's existing `A`–`H` categories. The mapping is mechanical;
no decision changes category as a result of this work.

| Ledger | Word | Means | Count today |
|---|---|---|---|
| A | `SHIPPED` | Implemented in the app and verified | 13 |
| B | `READY` | Ratified — implement it as specified | 0 |
| C | `PROVISIONAL` | Implement a deliberately temporary MVP choice, tagged `MVP-N PROVISIONAL` | 5 |
| D | `DEFERRED` | Deliberately out of scope for v1 | 7 |
| E | `BLOCKED` | Waiting on a named missing subsystem or a human safety decision | 72 |
| F, G, H | `COVERED` | The app already does something adequate here; no work needed now | 15 |

`READY` and `PROVISIONAL` must remain distinct. Collapsing them would let an implementer harden a
provisional choice into a permanent one — the exact failure the ledger's own
`MVP-1 PROVISIONAL / REVISIT AFTER QA-1` tagging convention exists to prevent. A `DEC` only becomes
`READY` through its own ratification process, never by an implementer's judgement.

`F` (reference/scientific) and `H` (other) are both empty today — no decision was ever filed under
either — so all 15 `COVERED` rows are `G`. They fold together because none of the three is actionable
for an implementer; if a future triage populates `F`, it stays `COVERED`.

`COVERED` is deliberately not `DONE`. `SHIPPED` means the decision was implemented as specified;
`COVERED` means the app has something adequate in that space and the curriculum's fuller version is a
later refinement, not a gap. `DEC-022` is the clearest case — the app applies ±400/−250 kcal where the
curriculum says ±500, which the ledger calls "a numeric-tuning question for a human, not an
architecture gap. Left as-is." A `COVERED` row is a candidate for later sanding, not a closed item.

**Note for readers:** `READY` is currently zero. Every executable decision today is `PROVISIONAL`. This
is a true and load-bearing fact about the project's state, not a gap in the register.

### 2. `nutrition-curriculum/DEC_REGISTER.md`

A new file at the top level of `nutrition-curriculum/`. **Authoritative for implementation readiness**
and for nothing else.

One row per decision, 112 rows, ranges expanded:

| Column | Source | Notes |
|---|---|---|
| `DEC` | — | `DEC-001`–`DEC-112`, one row each. No ranges. |
| `Domain` | `APP_DECISION_INVENTORY.md` (`**Domain:**`) | Letter A–T. |
| `Label` | Condensed from the inventory's `**Decision:**` field | **Navigational only.** The inventory's prose remains authoritative for what the decision *is*. |
| `Readiness` | `PSM_ITERATION_1_IMPLEMENTATION_LEDGER.md` §3, via the §1 mapping | One of the six words. |
| `Note` | Ledger §3 rationale column | For `BLOCKED`/`DEFERRED`: a short phrase naming the missing subsystem or the deferring authority. For `PROVISIONAL`: whether it is already implemented and where. Empty where the ledger says nothing beyond the category. |
| `Spec` | `10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md` | Section reference where a drafted specification exists. |
| `Ratification` | `00_PROJECT_CONTROL/DECISIONS/` | Filename where one exists. |

The file's header must state explicitly what it does and does not own:

- **Owns:** the readiness word for each decision.
- **Does not own:** the decisions themselves (`APP_DECISION_INVENTORY.md`), their specifications
  (`DECISION_LOGIC_SPECIFICATION.md`), their ratifications (`DECISIONS/`), or project phase status
  (`PROJECT_STATUS.md`).

Ranges in the ledger expand to individual rows carrying that range's category and rationale. Where the
ledger annotates a row beyond its bare letter (e.g. `C — IMPLEMENTED`, `C — not built, carried to
Iteration 2`), that distinction is preserved in `Note` rather than discarded — a `PROVISIONAL`
decision already implemented is materially different from one still waiting.

### 3. Precedence banner on the ledger

`PSM_ITERATION_1_IMPLEMENTATION_LEDGER.md` §3 gains a one-line banner naming `DEC_REGISTER.md` as
authoritative for readiness. **Its content is not rewritten** — the same mechanism already applied to
the `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` superseded sections on 2026-09-08, and consistent
with `PROJECT_AI_PROTOCOL.md` §31's preference for marking precedence over deleting a restatement. The
ledger keeps its per-decision rationale, which the register summarises but does not replace.

### 4. Navigation

- **New `nutrition-curriculum/README.md`** — the corpus entry point, deliberately short. Routes to:
  `DEC_REGISTER.md` (what is executable), `00_PROJECT_CONTROL/README.md` (structure and the
  folder↔phase mapping), `PROJECT_STATUS.md` (current state), `PROJECT_AI_PROTOCOL.md` (the rules any
  agent working here must follow, especially §28 no premature implementation, §30 ID stability, §31
  document discipline). It restates none of their content.
- **`00_PROJECT_CONTROL/README.md`** gains a pointer to the register in its "Start Here" table.
- **`02_TOC_AND_SOURCE_ANALYSIS/README.md`** — repair the 7 broken relative links recorded in
  `PROJECT_STATUS.md`'s reorganization log. Each `[NN_book.md](NN_book.md)` becomes
  `[NN_book.md](NN_Book_Subfolder/NN_book.md)`. Link targets only; no other content changes.

### 5. Checking the register

**There is no standing validator.** This project does not carry a test suite, and none is to be added
(see `CLAUDE.md`). An earlier draft of this section specified one; it was written, then removed along
with the rest of the suite.

What replaces it is a **one-off check, run by hand when the register is edited** — write it, run it,
read the result, delete it. What such a check should confirm:

1. The register contains exactly `DEC-001`–`DEC-112` — no gaps, no duplicates.
2. Every `Readiness` value is one of the six words.
3. Every row's readiness word is consistent with its own `A`–`H` category, under the §1 mapping.
4. The per-word row totals match the counts the register declares in its own vocabulary table.
5. Every `DEC` ID in the register exists in `APP_DECISION_INVENTORY.md`.

Checks 3 and 4 are the useful pair: together they catch a row edited without its legend count, or a
word edited away from its category. Check 4 deliberately compares the register **against itself**, not
against the ledger — tying the totals to the ledger permanently would make the ledger authoritative in
practice, contradicting the decision that the register owns readiness, and it would fail the first time
the two legitimately diverge.

The **ledger comparison was run once, at bootstrap**, and matched on all six buckets (13/0/5/7/72/15).
That is what establishes the transcription was faithful; it is not a check to repeat.

**Accepted risk:** with no automated guard, a hand-edit that changes a row without its legend count
will go unnoticed until someone runs the check. That is the deliberate trade for not carrying a suite.

## Maintenance rule

Any change to a decision's readiness updates `DEC_REGISTER.md` **in the same commit** as the change
that caused it. A new PSM iteration updates the register as part of closing the iteration, and reruns
the validator. Because the register is authoritative, a disagreement between it and the ledger is
resolved in the register's favour — but the validator should fail first, so the disagreement is
noticed rather than inherited.

## Risks

- **Transcription error.** 112 rows joined across two documents, with ranges expanded and labels
  condensed by hand, is the main correctness risk. Mitigated by validator assertions 1, 3 and 4;
  assertion 4 in particular catches a miscategorised row that a spot-check would miss.
- **Authored labels drift from the inventory's prose.** Mitigated by marking the `Label` column
  navigational-only in the header, so it is never cited as the decision's content.
- **The register goes stale.** Mitigated by the maintenance rule and the validator; not eliminated.
- **A reader mistakes `PROVISIONAL` for `READY`.** Mitigated by the vocabulary table and the explicit
  note that `READY` is zero — but this is ultimately a discipline the collaborator must hold.

## Verification

- The one-off check in §5 was run and passed. No test file, config change, or dependency is left behind
  by it.
- `npm run build` (`tsc -b`) stays clean. No build-config change is needed — this work touches
  documentation only.
- Register row count is exactly 112; per-word totals equal 13 / 0 / 5 / 7 / 72 / 15.
- Every link in the three touched README files resolves to a file that exists.
- No file under `03_`–`07_`, `09_`–`11_` is modified. No `DEC` ID added, removed, or renamed.
