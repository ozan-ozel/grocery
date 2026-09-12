# Nutrition Curriculum Project

A university-level Human Nutrition, Metabolism, and Sport Nutrition curriculum built from a source-book corpus, then translated into decision logic and application architecture for the Grocery app. This directory is organized in phases, each building on the last.

## Start Here

The corpus-wide navigation index is `../README.md`'s own "Start here" table — that copy is authoritative;
it is not repeated here so the two can't drift out of sync with each other. This section covers only
`00_PROJECT_CONTROL/`'s own contents.

`PROJECT_STATUS.md` is the single status source of truth. It is append-oriented: superseded passages are left in place and marked rather than rewritten, so read it top-down and let later entries override earlier ones.

### This folder's own files

| File / folder | Purpose |
|---|---|
| `README.md` | This file — what the project is, where everything lives. |
| `PROJECT_STATUS.md` | Live, append-only status log: per-phase state, the running maintenance log, current next task. |
| `PROJECT_AI_PROTOCOL.md` | The operating rulebook every agent here follows — phase list, review-gate process, and the hard rules (e.g. §28 no premature implementation, §30 ID stability, §31 document discipline, §32 review gates are hard stops). |
| `CHATGPT_REVIEW_REQUEST.md` | Standing mailbox for escalating an open review gate to ChatGPT/a human — a channel, not a log. Currently idle ("NO REVIEW GATE IS CURRENTLY OPEN"); gets overwritten with a live request only when a gate needs one. |
| `DECISIONS/` | Authoritative record of every review-gate outcome and human ratification, one file per event. |

**Not in this folder, but part of the same control layer:** `../DEC_REGISTER.md` (per-decision readiness)
and `../IMPLEMENTATION_HANDOFF.md` (the active plan ↔ implementation tracker) both live at the
`nutrition-curriculum/` root rather than here, so they're visible without opening a subfolder — see the
root `README.md`'s own Start Here table.

## What This Project Is

The goal is to synthesize a nutrition/metabolism/clinical-nutrition textbook corpus into a structured curriculum, and from there into a specified decision engine and application architecture. Work proceeds in verifiable phases: extract each book's actual table of contents, normalize that into a shared topic taxonomy, map prerequisites and learning levels, design the curriculum architecture, model the application's decisions against it, resolve evidence gaps, specify the decision logic, and translate the result into product architecture and code. No phase invents content beyond what the source material or explicit human decisions establish.

Current scale: **213 stable topic IDs**, **112 application decisions (`DEC-001`–`DEC-112`)**, 7 core source books plus one bounded culinary extension.

## Directory Structure

**Folder numbers do not track phase numbers.** Folders `02_`–`08_` were created up front, when the phase list was shorter; `09_`–`11_` were added later for phases that had no folder in that original layout. Use the mapping below rather than inferring a phase from a folder number.

| Folder | Phase | Contents |
|---|---|---|
| `00_PROJECT_CONTROL/` | — | This README, `PROJECT_STATUS.md`, `PROJECT_AI_PROTOCOL.md` (the operating protocol), `CHATGPT_REVIEW_REQUEST.md` (the standing external-review brief), and `DECISIONS/` — the authoritative records of every review gate and human ratification. |
| `01_SOURCE_BOOKS/` | 0 | The source book files (PDF/EPUB). The 7 core books each have their own subfolder; the eighth, culinary source sits as a loose file at the folder root. **Intentionally excluded from Git** — see below. |
| `02_TOC_AND_SOURCE_ANALYSIS/` | 0–1 | The 7 authoritative table-of-contents extractions (one Markdown file per book, in its own subfolder) plus the extraction-status index (`README.md`). Ground truth for everything downstream. |
| `03_PHASE_1_CURRICULUM_ANALYSIS/` | 1 | The topic taxonomy derived from the TOCs — `MASTER_TOPIC_UNIVERSE.md` (the 213 IDs), book coverage matrix, per-book roles, topic overlaps, apparent gaps, a first-pass architecture sketch, and an ambiguity audit. |
| `04_PHASE_2_CURRICULUM_ARCHITECTURE/` | 2 | Prerequisites, learning levels, the dependency graph, candidate spines, sport/clinical/research architecture notes, progressive reinforcement, candidate exclusions, and the deferred-decision log. |
| `05_PHASE_3_APP_DECISION_MODEL/` | 3 | The application decision model: `APP_DECISION_INVENTORY.md` (the 112 decisions), the dependency graph, the two-way knowledge mapping against the 213 topics, the gap taxonomy, and the integrated decision architecture. |
| `09_PHASE_4_CURRICULUM_DECISION_INTEGRATION/` | 4 | `KNOWLEDGE_DECISION_DEPTH_MAP.md` (required application depth per topic) and `DECISION_KNOWLEDGE_READINESS.md` (knowledge-readiness verdict per decision). |
| `06_EVIDENCE_AND_GAPS/` | 5 | `EVIDENCE_AND_CONTENT_INSPECTION_REGISTER.md` — the source-book content inspections and external current-evidence findings that Phases 1–3 were barred from performing. |
| `07_FINAL_CURRICULUM/` | 6 | `FINAL_CURRICULUM_ARCHITECTURE.md` — all 213 topics sequenced — plus the Phase 6 design decision package that fed Gate 4. |
| `10_PHASE_7_DECISION_ENGINE_SPECIFICATION/` | 7 | `DECISION_LOGIC_SPECIFICATION.md` — the 112 decisions resolved into drafted specifications, `BLOCKED` entries, and judgment items. |
| `11_PHASE_8_PRACTICAL_TRANSLATION/` | 8 | The practical-translation analysis, the Gate 6 culinary corpus extension, and the On Cooking 7e execution record. |
| `08_APP_TRANSLATION/` | 9 | Application/product architecture: `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` (the primary artifact), the per-`DEC` investigations that fed the Phase 9 ratifications, and the PSM Iteration 1 implementation ledger and browser QA. |
| `12_ENERGY_INDIVIDUALIZATION/` | 9 (cross-cutting) | `ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md` — research and specification on moving the energy figure from a population formula to the user's own observed response. Cross-cutting rather than a new phase: it draws on Phases 3, 7 and 9 and amends none of them. Deliberately **not implementation-ready** — no formula, coefficient, threshold or macro percentage is selected, and no `DEC` is created or changed. |
| `99_ARCHIVE/` | — | Superseded or historical files kept for project history — not part of the active analysis. |

Phase 10 (Validation & Iteration) has no folder yet; it has not started.

## Source Material vs. Generated Project Knowledge

`01_SOURCE_BOOKS/` holds the original commercial textbooks this project is built from — they are not this project's output, they're its raw material, and they stay out of version control (see below). Everything from `02_TOC_AND_SOURCE_ANALYSIS/` onward is this project's own generated analysis, written and version-controlled as the project proceeds.

The corpus was fixed at 7 books in Phase 1 and extended exactly once: **Gate 6 (2026-09-07)** admitted one bounded eighth culinary/food-preparation source (*On Cooking: A Textbook of Culinary Fundamentals*, 7th ed.) because the seven-book corpus supports recipe *modification* but not recipe *construction*. The 7-book / 213-topic / 112-decision baseline is preserved unedited; the eighth source is recorded separately as a controlled practical-translation extension in `11_PHASE_8_PRACTICAL_TRANSLATION/`.

## Why Source Books Are Excluded from Git

`01_SOURCE_BOOKS/` contains full copies of copyrighted commercial textbooks (PDFs/EPUBs, several hundred MB total). These are excluded from this repository via `.gitignore` — they aren't this project's intellectual output, and committing full copyrighted books into a Git repository isn't appropriate. The books stay on disk in this folder for reference; only the analysis derived from them is versioned.

## Phases and Review Gates

The phase list itself is defined in `PROJECT_AI_PROTOCOL.md` §7, and the review gates in §21. Gates are hard stops: a phase may not be crossed autonomously, and each gate's outcome is recorded in `DECISIONS/`.

- **Phases 1–8: CLOSED.** Gates 1–6 are all resolved.
- **Phase 9 (Application / Product Architecture): IN PROGRESS.** Architecture complete; implementation has begun under the Progressive Sanding Model. Human ratifications inside Phase 9 (`DEC-067`, `DEC-068`, `DEC-069`, the A1/B3/C2 safety semantics) are recorded in `DECISIONS/` but are **not** review gates.
- **Gate 7 (end of Phase 9) has not been reached.** Phase 10 has not started.

Per-phase status, the current next task, and the running maintenance log live in `PROJECT_STATUS.md` — check there before resuming work.
