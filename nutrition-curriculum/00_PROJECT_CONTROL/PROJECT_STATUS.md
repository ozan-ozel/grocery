# Project Status

Phase 1: COMPLETE
Phase 2: COMPLETE
Phase 3: NOT STARTED

Current next task:
APP DECISION INVENTORY

Core source books:
7

Current curriculum topic universe:
213 stable IDs

Phase 1 human decisions:
Preserved for later review — see `03_PHASE_1_CURRICULUM_ANALYSIS/PHASE_1_AMBIGUITY_AUDIT.md` ("Human Decisions" list)

Phase 2 human decisions:
Preserved for later review — see `04_PHASE_2_CURRICULUM_ARCHITECTURE/PHASE_2_HUMAN_REVIEW.md`

Git:
Existing repository preserved (the repository root is `D:\CodeSpace\grocery`; this project lives at `nutrition-curriculum/` inside it)

Source books:
Git-ignored (`nutrition-curriculum/01_SOURCE_BOOKS/`)

Project analysis:
Version-controlled

---

## Reorganization Log (this session)

This project was reorganized from a flat working folder (`C:\Users\4D\Desktop\CLAUDE-PROJECT-DOCK\grocery\books\`) into the structure above and merged into the existing `grocery` app's Git repository at `D:\CodeSpace\grocery`, under a new top-level `nutrition-curriculum/` folder, per explicit instruction. No file was deleted, duplicated, or content-modified during this move — see the session's final report for the full file-by-file account.

### Known Broken Relative Reference (not auto-fixed, per instruction)

`02_TOC_AND_SOURCE_ANALYSIS/README.md` contains 7 Markdown links of the form `[01_advanced_sports_nutrition_3e.md](01_advanced_sports_nutrition_3e.md)`, written when that file and the 7 TOC files were siblings in one flat folder. After this reorganization, the 7 TOC files each live in their own per-book subfolder (`02_TOC_AND_SOURCE_ANALYSIS/01_Advanced_Sports_Nutrition_3e/01_advanced_sports_nutrition_3e.md`, etc.), so **all 7 relative links in that README are now broken** (they'd need to be `01_Advanced_Sports_Nutrition_3e/01_advanced_sports_nutrition_3e.md` instead). Per the reorganization instructions, this was recorded rather than silently fixed. The file's content is otherwise unchanged and still accurate; only the 7 hyperlink targets need correcting whenever this is next touched.

### Files Left Outside the Project Structure (Unclassified, Flagged for Review)

- `C:\Users\4D\Desktop\CLAUDE-PROJECT-DOCK\grocery\books\Onaylanmayan 34138.crdownload` (1.9 MB) — an incomplete/partial browser download (the Turkish filename prefix means "unconfirmed/unapproved"). Not one of the 7 source books (all 7 are accounted for and moved), not analysis, not project control. Left in its original location on the C: drive rather than guessed into the new structure or deleted. Needs a human decision: resume the download, identify what it was, or delete it as leftover cruft.

### File Archived (Judgment Call, Reported)

- `desktop_books_inventory.md` → moved to `99_ARCHIVE/`. This was the very first deliverable of the whole project (a raw listing of book files found on the Desktop, before the 7-book corpus was finalized and before TOC extraction began). Its content — filename/format/size/path for candidate books — is now fully superseded by the more authoritative and complete `02_TOC_AND_SOURCE_ANALYSIS/README.md` inventory. Archived as "clearly superseded" per the reorganization instructions' archive criteria, not simply because it's old.
