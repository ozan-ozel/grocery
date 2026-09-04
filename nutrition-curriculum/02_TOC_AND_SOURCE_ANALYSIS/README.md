# TOC Extraction Inventory

| # | Book | Edition | Year | Authors | TOC File |
|---|------|---------|------|---------|----------|
| 1 | Advanced Sports Nutrition | 3rd Edition | 2021 | Dan Benardot | [01_advanced_sports_nutrition_3e.md](01_advanced_sports_nutrition_3e.md) |
| 2 | ACSM's Nutrition for Exercise Science | 1st Edition | 2018 | Dan Benardot (ACSM-branded) | [02_acsm_nutrition_for_exercise_science_1e.md](02_acsm_nutrition_for_exercise_science_1e.md) |
| 3 | Human Metabolism: A Regulatory Perspective | 4th Edition | 2019 | Keith N. Frayn & Rhys D. Evans | [03_human_metabolism_regulatory_perspective_4e.md](03_human_metabolism_regulatory_perspective_4e.md) |
| 4 | Introduction to Nutrition and Metabolism | 3rd Edition | 2002 | David A Bender | [04_introduction_to_nutrition_and_metabolism_3e.md](04_introduction_to_nutrition_and_metabolism_3e.md) |
| 5 | Nutrition Research Methodologies | Not separately numbered (2015 Wiley edition; predecessor 1e 2005 under Harlan Davidson) | 2015 | Julie A. Lovegrove, Leanne Hodson, Sangita Sharma & Susan A. Lanham-New (Editor-in-Chief) | [05_nutrition_research_methodologies_2015.md](05_nutrition_research_methodologies_2015.md) |
| 6 | Sport Nutrition | 4th Edition | 2025 *(copyright page; filename says 2024 — see file for discrepancy note)* | Asker Jeukendrup & Michael Gleeson | [06_sport_nutrition_4e.md](06_sport_nutrition_4e.md) |
| 7 | Krause and Mahan's Food and the Nutrition Care Process | 16th Edition | 2023 *(copyright page; filename says 2022 — see file for discrepancy note)* | Janice L. Raymond & Kelly Morrow | [07_krause_mahan_food_nutrition_care_process_16e.md](07_krause_mahan_food_nutrition_care_process_16e.md) |

## Extraction Status

- **01 — Complete.** Clean extraction. This PDF is an Internet Archive scan with no PDF bookmarks and a garbled OCR text layer on the printed Contents pages; every Part/Chapter title and page number was independently verified against each chapter's actual (clean) opening page, using a confirmed constant page offset. No content gaps.
- **02 — Complete, with a caveat.** Born-digital EPUB, clean text, `toc.ncx` matches the book's own printed Contents exactly. However, this EPUB contains **no printed page numbers anywhere** (it's a Kindle/calibre conversion with no real pagination data), so every entry is marked `Page: —` rather than invented.
- **03 — Complete.** Born-digital, publisher-produced PDF (Adobe InDesign) with a full, rich bookmark outline (309 entries, 4 levels deep) that was cross-checked against the printed Contents page and matches exactly. This is the highest-confidence extraction of the six.
- **04 — Complete.** The previously broken/placeholder file (a 1-page download-error PDF) has been replaced with a proper, complete copy of the book. It's a clean, born-digital PDF (Acrobat Distiller, not a scan) whose bookmarks are minimal (front matter only), so the TOC was extracted from the book's own printed Contents pages instead — these give page numbers down to section level, and every chapter/section page number was independently cross-checked against the actual opening text at 6 separate points in the book, all matching exactly. Two minor wording discrepancies are flagged: the filename says "An Introduction to..." but the book's own title page omits "An," and the filename says "CRC Press" while the copyright page names "Taylor & Francis" (a sibling imprint under the same publishing group).
- **05 — Complete.** The file has been replaced (previously an EPUB whose actual content was an unrelated book, *30-Second Nutrition*; now a PDF) and its identity was fully re-verified against its own title and copyright pages: editors Julie A. Lovegrove, Leanne Hodson, Sangita Sharma, and Editor-in-Chief Susan A. Lanham-New all confirmed by name, publisher John Wiley & Sons/Wiley-Blackwell confirmed, and "This edition first published 2015" confirmed — this is now the correct book. It's a clean, born-digital PDF with a fully intact bookmark outline (465 entries, 3 levels deep) where **every single entry resolves to a real page number** (no broken destinations anywhere) — the highest-confidence extraction in the whole set alongside book 03.
- **06 — Complete.** Modern, publisher-produced, accessible EPUB3 (Human Kinetics) with both a full navigation outline and a complete embedded print-page-break map (`doc-pagelist`), giving exact page numbers for all 244 TOC entries across 17 chapters — the second-highest-confidence extraction after book 3. One minor discrepancy is flagged: the filename says "2024," but the book's own copyright page states 2025.
- **07 — Complete, with a caveat.** Large (1214-page) born-digital PDF with a very rich bookmark outline (2,772 raw entries, 7 levels deep), giving verified, real page numbers for all 45 chapters and all 50 appendices. However, every level below chapter/appendix (sections, subsections, and deeper — 2,394 + 181 entries) has a broken page destination in this specific PDF export, so those are marked `Page: —` rather than invented. Two duplicate "wrapper" bookmark patterns were detected and cleaned up programmatically (see the file's Verification section for details), and two appendices with corrupted titles (both literally just "Appendix") were identified and labeled from their actual page content. One discrepancy is flagged: the filename says "2022," but the book's own copyright page states 2023.

## Summary

- **7 of 7** local files now yield a complete, verifiable, high-confidence TOC extraction of the book they claim to be.
- Both previously-critical issues have since been resolved with proper replacement files: **04** (was a corrupted, content-free placeholder PDF) and **05** (was an EPUB whose actual content was an unrelated book, *30-Second Nutrition*, despite matching filename/metadata). Both were re-verified from scratch against their own title and copyright pages before being marked complete.

## Phase 1 Status — Topic Mapping

TOC extraction is complete and closed. Phase 1 (topic normalization) has also been completed on top of these 7 files, producing:

- `MASTER_TOPIC_UNIVERSE.md` — 18-domain, 142-topic, 64-subtopic hierarchical taxonomy with provenance back to every source TOC entry
- `BOOK_TOPIC_COVERAGE.md` — P/S/M/— coverage matrix across all 7 books
- `BOOK_ROLES.md` — per-book specialization, strengths, redundancy, and limitations
- `TOPIC_OVERLAPS.md` — 11 identified cross-book overlap clusters
- `APPARENT_CURRICULUM_GAPS.md` — apparent (TOC-visible-only) gaps, single-sourced domains, and currency risks
- `CURRICULUM_ARCHITECTURE.md` — high-level domain diagram (no lessons/curriculum yet)

Phase 1 does not modify or supersede the 7 TOC files above, which remain the authoritative source for all downstream phases. Curriculum design (Phase 2+) has not started.
