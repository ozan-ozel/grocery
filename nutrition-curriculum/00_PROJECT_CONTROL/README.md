# Nutrition Curriculum Project

A university-level Human Nutrition, Metabolism, and Sport Nutrition curriculum being built from a 7-book source corpus. This directory is organized in phases, each building on the last.

## What This Project Is

The goal is to synthesize seven nutrition/metabolism/clinical-nutrition textbooks into a structured curriculum. Work proceeds in verifiable phases: extract each book's actual table of contents, normalize that into a shared topic taxonomy, map prerequisites and learning levels, design candidate curriculum architectures, and — in later phases not yet started — resolve open questions, translate the result into an application, and produce the final curriculum. No phase invents content beyond what the source material or explicit human decisions establish.

## Directory Structure

| Folder | Contents |
|---|---|
| `00_PROJECT_CONTROL/` | This README, `PROJECT_STATUS.md`, and `DECISIONS/` — a log for curriculum decisions made by a human as the project proceeds. |
| `01_SOURCE_BOOKS/` | The 7 original book files (PDF/EPUB), one subfolder per book. **Intentionally excluded from Git** — see below. |
| `02_TOC_AND_SOURCE_ANALYSIS/` | The 7 authoritative table-of-contents extractions (one Markdown file per book, in its own subfolder) plus the extraction-status index (`README.md`). These are the ground-truth source analysis everything downstream is built from. |
| `03_PHASE_1_CURRICULUM_ANALYSIS/` | Phase 1: the topic taxonomy derived from the 7 TOCs — topic universe, book coverage matrix, per-book roles, topic overlaps, apparent gaps, a first-pass curriculum architecture sketch, and an ambiguity audit. |
| `04_PHASE_2_CURRICULUM_ARCHITECTURE/` | Phase 2: prerequisite relationships, learning levels, the dependency graph, candidate curriculum spines, domain-specific architecture notes (sport/clinical/research), progressive-reinforcement analysis, candidate exclusions, and a running log of decisions deferred to a human. |
| `05_PHASE_3_APP_DECISION_MODEL/` | Reserved for future work (not started). |
| `06_EVIDENCE_AND_GAPS/` | Reserved for future work (not started) — where the currently-deferred book-content-inspection and current-evidence questions get resolved. |
| `07_FINAL_CURRICULUM/` | Reserved for future work (not started). |
| `08_APP_TRANSLATION/` | Reserved for future work (not started). |
| `99_ARCHIVE/` | Superseded or historical files kept for project history — not part of the active analysis. |

## Source Material vs. Generated Project Knowledge

`01_SOURCE_BOOKS/` holds the original commercial textbooks this project is built from — they are not this project's output, they're its raw material, and they stay out of version control (see below). Everything from `02_TOC_AND_SOURCE_ANALYSIS/` onward is this project's own generated analysis, written and version-controlled as the project proceeds.

## Why Source Books Are Excluded from Git

`01_SOURCE_BOOKS/` contains full copies of copyrighted commercial textbooks (PDFs/EPUBs, several hundred MB total). These are excluded from this repository via `.gitignore` — they aren't this project's intellectual output, and committing full copyrighted books into a Git repository isn't appropriate. The books stay on disk in this folder for reference; only the analysis derived from them is versioned.

## Phases

Each numbered folder from `02_` through `08_` corresponds to one project phase. Phase completion status, the current topic-ID count, and the next task are tracked in `PROJECT_STATUS.md` in this folder — check there before resuming work.
