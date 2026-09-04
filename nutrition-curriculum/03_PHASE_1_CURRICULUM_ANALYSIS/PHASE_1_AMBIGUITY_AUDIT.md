# Phase 1 Ambiguity Audit

Every ambiguity flagged across the Phase 1 files (`MASTER_TOPIC_UNIVERSE.md`, `BOOK_TOPIC_COVERAGE.md`, `BOOK_ROLES.md`, `TOPIC_OVERLAPS.md`, `APPARENT_CURRICULUM_GAPS.md`) is reviewed below and classified. Several of the nine items the task specified turned out, on inspection, to bundle a factual question (resolvable now) with a design question (not resolvable from a TOC, ever) — those are split into lettered sub-issues rather than forced into one classification, since collapsing them would misrepresent what's actually settled versus what isn't.

No original TOC file was modified. No external source was consulted. Nothing here proceeds to curriculum design.

**Classification key:** A = resolvable from existing files (resolved below) · B = structural/extraction limitation (not a curriculum gap) · C = requires book-content inspection (deferred) · D = requires current scientific/clinical evidence (deferred) · E = requires a human curriculum decision

---

## 1. AS3 apparent thinness caused by lack of section-level TOC entries

| Field | Detail |
|---|---|
| **Issue** | AS3 rates lower than ACSM/SN4 across much of `BOOK_TOPIC_COVERAGE.md` — is that a real content gap or a TOC artifact? |
| **Classification** | **B — Structural/extraction limitation** |
| **Evidence** | AS3's own TOC file states directly (Extraction QA): *"this book's Contents lists only Part and Chapter level entries; no sections/subsections are listed in the printed TOC, so none were added."* AS3's Verification section further explains why: it's an Internet Archive scan with **no PDF bookmarks/outline at all** (`pypdf` reports an empty outline), so nothing below chapter level could ever have been recovered from this file, regardless of how much section-level content the physical book actually contains. |
| **Consequence** | Every `P`/`S`/`M` rating for AS3 in the coverage matrix is a floor, not a real depth measurement — AS3 could contain just as much section-level detail as SN4 and this analysis would be structurally incapable of showing it. This is **not evidence that AS3 covers less material**; it is evidence that AS3's *TOC* carries less resolution than the other six. |
| **Resolution** | Documented as a firm structural fact, not a curriculum gap — already stated in `APPARENT_CURRICULUM_GAPS.md` §5 and reconfirmed here. No further action needed at Phase 1. If AS3's actual depth ever needs to inform a real curriculum-weighting decision, that requires reading the physical chapters (see Deferred list, item C-1). |

---

## 2. Overlap between AS3, ACSM and SN4

### 2a. What is the actual *nature/degree* of the overlap?

| Field | Detail |
|---|---|
| **Classification** | **A — Resolvable from existing files** |
| **Evidence** | Chapter-title comparison across the three TOC files, already performed in `BOOK_ROLES.md`: ACSM's 15-chapter sequence (Carbohydrates → Protein → Lipids → Vitamins → Minerals → Hydration → Weight/Body Composition → ... → Supplements → Diet Planning) tracks SN4's chapter sequence closely — this is the closest chapter-order match of any book pair in the set. AS3 diverges structurally in its second half: after four nutrient-style chapters (Energy Nutrients, Vitamins/Minerals, Fluids/Electrolytes, Ergogenic Aids) it switches to organizing by *athlete type* (Travel/Altitude/Gender-Age/Body-Composition, then The Power Athlete / The Endurance Athlete / The Power+Endurance Athlete, each with embedded sample eating plans) — a structure neither ACSM nor SN4 uses. |
| **Resolution** | **Resolved:** ACSM and SN4 overlap the most closely (same organizing principle, similar sequence); AS3 overlaps them in subject matter but not in structure — its athlete-type chapters and embedded sample eating plans are a genuinely distinct pedagogical device (see `BOOK_ROLES.md`, AS3 entry). This factual comparison stands as-is. |

### 2b. What should the curriculum *do* about the overlap (merge, keep all three, sequence them)?

| Field | Detail |
|---|---|
| **Classification** | **E — Human curriculum decision** |
| **Evidence** | `TOPIC_OVERLAPS.md` items #2, #3, #6, #8 already lay out where the applied-nutrient overlap (carbohydrate/protein/hydration/supplements) between these three books is strongest. But "is this redundant waste or deliberate reinforcement" is explicitly a pedagogical judgment call, not a fact recoverable from a TOC. |
| **Consequence** | Left undecided, Phase 2 could either build three parallel sport-nutrition units (safe but possibly repetitive) or attempt to merge them into one spine (efficient but requires someone to judge which book's treatment is authoritative where they conflict). |
| **Resolution** | Deferred — added to Human Decisions list. |

---

## 3. Energy balance/body composition appearing across 6 of 7 books

### 3a. Which books, and what kind of overlap (foundational/clinical/applied/methods)?

| Field | Detail |
|---|---|
| **Classification** | **A — Resolvable from existing files** |
| **Evidence** | Already fully mapped in `TOPIC_OVERLAPS.md` #7 and `BOOK_TOPIC_COVERAGE.md` (BODY-01 through BODY-07 rows): HM4 (mechanistic, Ch.11), Bender3 (obesity-focused, Ch.6), KM16 (clinical, Ch.21 — the largest single weight-management treatment in the set), SN4 (two full chapters), AS3 (Ch.10), ACSM (Ch.8), NRM (methods only, Ch.11–12). Only PUBHEALTH and RESEARCH-adjacent chapters outside this list are silent on it. |
| **Resolution** | **Resolved:** the spread is genuine and wide, split cleanly across four different purposes (mechanism / clinical management / sport application / measurement methodology) rather than being six repeats of the same content. |

### 3b. How many independent "weight management" curriculum units should exist, and how should the mechanistic/clinical/applied/methods material be sequenced relative to each other?

| Field | Detail |
|---|---|
| **Classification** | **E — Human curriculum decision** |
| **Evidence** | `TOPIC_OVERLAPS.md` #7 already flags real title-level duplication risk specifically *within* the sport cluster (AS3/ACSM/SN4) and separately between KM16 Ch.21 and Bender3 Ch.6 — but resolving that into an actual module count is a design choice. |
| **Resolution** | Deferred — added to Human Decisions list. |

---

## 4. Gut microbiome appearing repeatedly without a dedicated chapter

| Field | Detail |
|---|---|
| **Classification** | **A (factual correction) + C (depth) — split** |
| **Evidence (A part)** | `APPARENT_CURRICULUM_GAPS.md` §4 originally stated microbiome content appears in "five different books' TOCs." A fresh grep across all 7 TOC files for this audit found it in only **three** books' TOCs: NRM (Ch.9, one mention, within "Nutrients: Consumption & Metabolism"), SN4 (Ch.5, three mentions: "Gut Microbiota," "Maintaining Gut Health," "Potential Role of Gut Microbiota in Athlete Health and Performance"), and KM16 (ten separate mentions across nine different chapters — Ch.1 GI, Ch.7 inflammation ×2, Ch.15 infancy, Ch.16 childhood, Ch.21 obesity, Ch.25 oral health, Ch.28 IBD, Ch.37 infectious disease, Ch.40 arthritis, plus one appendix reference). AS3, ACSM, HM4, and Bender3 have **zero** TOC mentions of microbiome/microbiota. |
| **Resolution (A part)** | **Corrected:** the pattern is "3 of 7 books, with KM16 alone repeating it 10 times across unrelated disease chapters" — not "5 books." The underlying observation (present everywhere it does appear, never its own chapter anywhere) still holds and is arguably *more* striking now that it's concentrated in fewer, more clinically diverse locations within KM16 specifically. `APPARENT_CURRICULUM_GAPS.md` §4 should be read with this corrected count. |
| **Classification (C part)** | **C — Requires book-content inspection** |
| **Evidence (C part)** | A TOC heading like "Mediation by the Gut Microbiota" (KM16 Ch.37) or "The Microbiome and Probiotics and Prebiotics" (KM16 Ch.15) gives no information about whether that subsection is one paragraph or several pages. |
| **Consequence** | Cannot currently judge whether microbiome content, summed across its ten KM16 appearances plus SN4/NRM, would actually amount to a coherent "gut microbiome and health" curriculum unit if extracted and combined, or whether each mention is too thin/context-specific to stand alone. |
| **Resolution** | Deferred — record exactly what to check later: read each of the ~13 flagged subsections (KM16 ×10, SN4 ×3, NRM ×1) and assess word count/depth before deciding whether a dedicated GI-03 "Gut Microbiome" curriculum module is supportable from these books alone, or would need external material. |

---

## 5. COVID-19 appearing in some material

| Field | Detail |
|---|---|
| **Classification** | **D — Requires current scientific/clinical evidence** (with a B-flavored observation attached) |
| **Evidence** | Confirmed by grep: "COVID" appears **7 times** in KM16's TOC alone, scattered across Ch.21 (obesity), Ch.30 (diabetes complications), Ch.33 (cardiovascular, as its own subsection heading "COVID-19"), Ch.37 (infectious disease, twice — "COVID-19 Disease" and "Dietary Supplement Use During COVID-19"), and Ch.40 (rheumatic disease). No other book's TOC mentions it. KM16 was copyrighted 2023. |
| **Consequence** | This is a textbook example of the task's warned-against confusion: COVID-19 nutrition content is *present* (7 TOC headings) but that presence tells us nothing about whether the guidance is still current, since pandemic-nutrition and post-acute-COVID nutritional science moved fast between 2023 and today. Using this content in a 2026 curriculum without a currency check risks teaching guidance the field has already revised. |
| **Resolution** | Deferred — flagged for the evidence-review phase specifically, not resolved here. Do not treat "appears 7 times" as "adequately covered" or as "safe to teach as-is." |

---

## 6. Caffeine appearing repeatedly without a dedicated major chapter

| Field | Detail |
|---|---|
| **Classification** | **C — Requires book-content inspection** |
| **Evidence** | Confirmed present in two books' TOCs: SN4 (Ch.11, as one of ~35 named supplement subsections under "Nutrition Supplements") and KM16 (scattered — Ch.24 bone health, Ch.33 heart failure MNT, Appendix 25 "Nutritional Facts on Caffeine-Containing Products"). AS3/ACSM/HM4/Bender3/NRM have no TOC mention. |
| **Consequence** | Cannot tell from TOC headings alone whether SN4's caffeine subsection is a substantial ergogenic-aid treatment (plausible, given SN4's demonstrated compound-by-compound depth elsewhere in that chapter — see `BOOK_ROLES.md`) or a short paragraph matching its neighbors. Same uncertainty for KM16's appendix. |
| **Resolution** | Deferred — record what to check: read SN4 Ch.11's caffeine subsection and KM16 Appendix 25 directly; if both prove substantial, caffeine may not need a "dedicated chapter" at all to be adequately covered — the current scatter could already be sufficient. This determination requires content, not TOC, inspection. |

---

## 7. Alcohol appearing repeatedly without a dedicated major chapter

| Field | Detail |
|---|---|
| **Classification** | **C — Requires book-content inspection** |
| **Evidence** | Confirmed present in two books' TOCs: SN4 (Ch.1, listed as one of the core "Nutrients," alongside carbohydrate/fat/protein/water) and KM16 (scattered across at least six chapters: Ch.14 pregnancy food safety, Ch.21 obesity, Ch.24 bone health, Ch.30 diabetes, Ch.33 cardiovascular risk factors and MNT, Ch.36 cancer/carcinogenesis, Ch.42 psychiatric/substance abuse screening, plus Appendix 24 "Nutritional Facts on Alcoholic Beverages"). |
| **Consequence** | Same structural pattern as caffeine and microbiome: real, recurring, never chapter-length. SN4 notably treats alcohol as a peer of carbohydrate/fat/protein/water at the *nutrient classification* level (Ch.1), which is a meaningfully different framing than KM16's disease-risk-factor framing — worth knowing which framing dominates once content is actually read. |
| **Resolution** | Deferred — record what to check: read SN4 Ch.1's alcohol subsection to see whether it's treated with genuine "nutrient" depth or just flagged as present; audit whether the ~7 scattered KM16 mentions, taken together, already constitute adequate coverage of alcohol's nutritional/clinical significance without needing a standalone module. |

---

## 8. KM16 topics requiring scientific currency: GLP-1 agonists, continuous glucose monitoring, personalized nutrition

| Field | Detail |
|---|---|
| **Classification** | **D — Requires current scientific evidence** |
| **Evidence** | Confirmed present in KM16's TOC: Ch.30 ("Medical Nutrition Therapy for Diabetes Mellitus...") names "Glucagon-like Peptide-1 Receptor Agonists" as a medications subsection and separately names "Continuous Glucose Monitoring" under monitoring. SN4 Ch.17 ("Personalized Nutrition") includes "Genetic Influences" and "Turning Science Into Practice" — SN4 is dated 2025 (per its own copyright page, confirmed in its TOC file's Verification section) and its own chapter framing already treats this as an emerging area. |
| **Consequence** | These are three of the fastest-moving subject areas in the entire seven-book set — GLP-1 pharmacology, diabetes technology, and precision/genomic nutrition have all seen major developments on timescales shorter than a textbook's typical revision cycle. Even KM16 (2023) and SN4 (2025), the two newest books, are not guaranteed current on these specific subsections by the time any curriculum built from them reaches a classroom. |
| **Resolution** | Deferred — explicitly marked for the later evidence-review phase, not resolved now, per Task instruction D. No attempt made here to judge whether KM16/SN4's specific claims are still accurate. |

---

## 9. Additional ambiguities identified elsewhere in the Phase 1 files

### 9a. ACSM has no printed page numbers anywhere in the file

| Field | Detail |
|---|---|
| **Classification** | **B — Structural/extraction limitation** |
| **Evidence** | ACSM's TOC file, Verification section: *"This is an EPUB with reflowable text; no printed page numbers are present anywhere in the file (internal `id=\"page_N\"` anchors restart at 1 in every chapter file and are Kindle/calibre location markers, not print page numbers)."* |
| **Consequence** | Any future citation of ACSM content will need to reference chapter/section, never a page number — this is a citation-format constraint, not a topic-coverage gap. |
| **Resolution** | Documented; no action needed unless a physical/PDF copy of ACSM becomes available later (which would make this C — recoverable via content inspection of a different file, not this EPUB). |

### 9b. KM16's page numbers are unavailable below chapter/appendix level

| Field | Detail |
|---|---|
| **Classification** | **B — Structural/extraction limitation** (with a latent **C** escape hatch) |
| **Evidence** | KM16's TOC file, Verification section: *"only the top level (the 45 numbered chapters + 50 appendices + a handful of front-matter items) carries real page-number destinations. All deeper levels...have broken/empty destinations in this particular PDF export."* |
| **Consequence** | The richest, deepest hierarchy in the entire set (2,394 sections/subsections) has no citable page number. This affects citation precision only — it does not affect whether the topics themselves were captured (they were, in full, as titles). |
| **Resolution** | Documented as a file-quality limitation. If page-precise citation of specific KM16 subsections is ever required, that would require manually reading the actual PDF pages to locate them (Classification C, deferred, not attempted here). |

### 9c. Nutrigenomics/epigenetics: no book bridges the research-methods framing (NRM) and the clinical-application framing (KM16)

| Field | Detail |
|---|---|
| **Classification** | **A (the seam itself) + E (what to do about it) — split** |
| **Evidence (A)** | Already explicitly flagged in `MASTER_TOPIC_UNIVERSE.md` as SPECIAL-05 and in `APPARENT_CURRICULUM_GAPS.md` §3: NRM Ch.14–15 ("Epigenetics," "Nutrient–Gene Interactions") treats the topic as a research methodology; KM16 Ch.6 ("Clinical: Nutritional Genomics") treats the same underlying science as a disease-risk/clinical-counseling topic. No third book connects them. |
| **Resolution (A)** | **Resolved as a documented structural seam**, not a gap — both framings exist and are individually well-sourced; they simply don't reference each other in either book's TOC. |
| **Classification (E)** | Whether the curriculum should build an explicit bridging unit connecting "how nutrigenomic research is done" to "how it's used in clinical counseling" is a design decision. |
| **Resolution (E)** | Deferred — added to Human Decisions list. |

### 9d. Doping/performance-enhancing drugs: real content, never its own chapter

| Field | Detail |
|---|---|
| **Classification** | **C — Requires book-content inspection** |
| **Evidence** | KM16 Ch.23 names "Performance Enhancement Substances and Drugs: Doping In Sport" as a subsection (with "Prohormones and Steroids," "Androstenedione" beneath it), distinct from the chapter's legal-ergogenic-aid subsections. No other book's TOC names doping/PEDs as a distinguishable heading. |
| **Consequence** | Cannot tell from the TOC whether this is a substantial ethics/regulation/physiology treatment or a short flagged aside within the larger sports-performance chapter. |
| **Resolution** | Deferred — record what to check: read this specific KM16 subsection to judge whether it could anchor a standalone "sport ethics and anti-doping" module or should remain folded into SPORT-05 (Ergogenic Aids). |

### 9e. Whether Bender3 should sequence *before* HM4 as a bridging/remedial text

| Field | Detail |
|---|---|
| **Classification** | **E — Human curriculum decision** |
| **Evidence** | `BOOK_ROLES.md` (Bender3 entry) already observes both books' TOC-visible depth/pedagogy difference (Bender3: teach-from-scratch, 11 linear chapters; HM4: four-level regulatory depth) and explicitly proposes this sequencing as one option, without deciding it. |
| **Consequence** | Left open, Phase 2 doesn't know whether to treat Bender3 as required prerequisite reading, optional remedial material, or an alternative (not additive) to HM4 for a different student population. |
| **Resolution** | Deferred — added to Human Decisions list. |

### 9f. Whether SN4 should be treated as the primary sport-nutrition spine with AS3/ACSM as supplementary

| Field | Detail |
|---|---|
| **Classification** | **E — Human curriculum decision** |
| **Evidence** | `BOOK_ROLES.md`'s SN4 entry explicitly proposes this ("the most likely candidate for the curriculum's primary sport-nutrition spine, given its recency, granularity, and full page-level verifiability") but stops short of deciding it, consistent with Task 6's instruction not to rank books. |
| **Consequence** | This is the sport-domain analog of issue 2b above and should likely be decided alongside it, not independently. |
| **Resolution** | Deferred — added to Human Decisions list (paired with 2b). |

### 9g. Single-source dependency in RESEARCH, LIFE, and most of CLIN

| Field | Detail |
|---|---|
| **Classification** | **A (the fact) + E (what to do about it) — split** |
| **Evidence (A)** | Quantified precisely in `MASTER_TOPIC_UNIVERSE.md`'s Sources lines and `BOOK_TOPIC_COVERAGE.md`: all 15 RESEARCH topics are NRM-only; all 8 LIFE topics are KM16-only; 27 of KM16's 45 chapters (CLIN-03 through CLIN-27, excluding the handful with HM4 cross-references) have no counterpart anywhere else in the set. |
| **Resolution (A)** | **Resolved and quantified** — this is simply a fact about the 7-book set's composition, already fully documented, not something requiring further investigation. |
| **Classification (E)** | Whether this dependency is acceptable as-is, or whether it should prompt seeking supplementary sources before Phase 2 designs modules that rely entirely on one book, is a curriculum-scope decision. |
| **Resolution (E)** | Deferred — added to Human Decisions list. |

### 9h. DRV reference-table duplication between ACSM and KM16

| Field | Detail |
|---|---|
| **Classification** | **A — Resolvable from existing files (already resolved in Phase 1)** |
| **Evidence** | `TOPIC_OVERLAPS.md` #10 already concluded this duplication is "probably fine to keep as duplication" because reference tables are lookup material, not sequential narrative content, and having the same DRI numbers in two appendices isn't pedagogically wasteful the way overlapping narrative chapters would be. |
| **Resolution** | **Re-confirmed, no open question remains.** Listed here only to show it was audited and is not being silently dropped, not because it needs further work. |

---

## Resolved Now

Issues fully closed by re-examining the existing files — no book content, external evidence, or human decision needed:

1. **Item 1** — AS3's lower coverage ratings are a confirmed TOC-structural artifact (no bookmarks, no section-level Contents entries in the source scan), not a real content gap.
2. **Item 2a** — ACSM and SN4 overlap most closely in structure and sequence; AS3 overlaps in subject matter but diverges structurally (athlete-type organization, embedded sample eating plans).
3. **Item 3a** — The energy-balance/body-composition spread across 6 books is genuine and splits cleanly into four different purposes (mechanistic, clinical, sport-applied, methodological), not six redundant repeats.
4. **Item 4 (count correction)** — Gut microbiome content actually appears in **3** books' TOCs (NRM, SN4, KM16), not 5 as originally stated in `APPARENT_CURRICULUM_GAPS.md` §4; KM16 alone accounts for 10 of the total mentions, spread across 9 unrelated chapters.
5. **Item 9c (the seam itself)** — The nutrigenomics research/clinical framing split between NRM and KM16 is a confirmed, well-documented structural seam with no third book bridging it.
6. **Item 9g (the fact)** — Single-source dependency in RESEARCH (100% NRM), LIFE (100% KM16), and most of CLIN (27/45 KM16 chapters) is precisely quantified and confirmed.
7. **Item 9h** — DRV table duplication between ACSM and KM16 is intentionally low-priority; already resolved in Phase 1 as acceptable, reconfirmed here.

## Deferred

Issues requiring book-content inspection (C) or current scientific/clinical evidence (D) — explicitly not resolved now:

1. **Item 4 (depth)** — Read the ~13 flagged gut-microbiome subsections (KM16 ×10, SN4 ×3, NRM ×1) to judge whether combined they'd support a dedicated curriculum module. *(C)*
2. **Item 5** — COVID-19 content across KM16's 5 chapters (7 headings) needs a currency check against current post-pandemic nutritional guidance before any use in a curriculum. *(D)*
3. **Item 6** — Read SN4 Ch.11's caffeine subsection and KM16 Appendix 25 to judge actual depth of coverage. *(C)*
4. **Item 7** — Read SN4 Ch.1's alcohol subsection and the ~7 scattered KM16 mentions to judge whether combined coverage is already adequate. *(C)*
5. **Item 8** — GLP-1 receptor agonists, continuous glucose monitoring, and SN4's personalized/genomic-nutrition chapter all need a scientific-currency check against present-day evidence before curriculum use. *(D)*
6. **Item 9d** — Read KM16 Ch.23's "Doping In Sport" subsection to judge whether it could anchor a standalone module. *(C)*
7. **(Latent, from 9b)** — If page-precise KM16 citations are ever needed, they would require manually locating them in the actual PDF pages. *(C, not currently blocking anything)*

## Human Decisions

Issues that are fundamentally about educational goals, scope, depth, or sequencing — explicitly not resolved automatically, and paired here where two items are really the same decision viewed from different domains:

1. **Items 2b + 9f (paired)** — Whether to consolidate AS3/ACSM/SN4 into one sport-nutrition spine (with SN4 as the likely primary source, per `BOOK_ROLES.md`) or keep them as three deliberately reinforcing passes.
2. **Item 3b** — How many independent "energy balance / body composition" curriculum units to build, and how to sequence the mechanistic (HM4), clinical (KM16, Bender3), sport-applied (AS3/ACSM/SN4), and methods (NRM) material relative to each other.
3. **Item 9c (the bridge)** — Whether to build an explicit module connecting nutrigenomics research methodology (NRM) to its clinical application (KM16), or leave them as separate units.
4. **Item 9e** — Whether Bender3 sequences before HM4 as prerequisite/remedial reading, or serves as an alternative text for a different student population.
5. **Item 9g (the response)** — Whether the confirmed single-source dependency in RESEARCH, LIFE, and most of CLIN is acceptable as the curriculum's foundation, or should prompt a scope discussion before Phase 2 builds modules that rely entirely on one book each.

---

## Verification

- [x] All 9 task-specified items addressed (items 1–8 individually; item 9 covers "any other ambiguity already explicitly identified in the Phase 1 files," with 8 sub-items: 9a–9h).
- [x] Every issue classified A–E; compound issues split rather than force-fit into a single classification.
- [x] One factual correction made during this audit (gut microbiome book count: 5 → 3), traceable to a fresh grep of the source files, not memory.
- [x] No original TOC file modified; no external source consulted; no curriculum content drafted.
