# Candidate Exclusions

Material that may reasonably sit outside a core required-teaching pathway — as **reference-only**, **optional**, **elective**, or **outside the core pathway entirely** — based on the topic universe, learning levels, and dependency graph built so far. Per Task 9's explicit instruction: **no topic is deleted, and no topic's presence in a textbook is treated as proof it belongs in the curriculum core.** Every topic named below still exists in `MASTER_TOPIC_UNIVERSE.md`, unchanged; this file only proposes a *role* for it.

Four categories, used consistently:

- **REFERENCE-ONLY** — lookup/appendix material, not meant to be taught sequentially at all (a student consults it when needed, doesn't "learn" it as a lesson).
- **OPTIONAL** — genuinely useful core-adjacent content, but not required for basic competency; a stronger curriculum includes it, a leaner one can skip it without a real gap.
- **ELECTIVE** — meaningful, substantial content, but addressed to a specific practice sub-specialty or student interest rather than every student — a track choice, not a skip.
- **OUTSIDE CORE PATHWAY** — content that, per the dependency graph, has no other topic depending on it and doesn't depend on much itself — structurally peripheral regardless of its intrinsic value.

---

## REFERENCE-ONLY Candidates

| Topic(s) | Basis |
|---|---|
| DRV-02, DRV-03, DRV-04 (Reference Tables — macronutrients, vitamins, minerals) | Explicitly lookup material by nature (RDA/AI/UL tables); `TOPIC_OVERLAPS.md` #10 already concluded their cross-book duplication is "fine to keep" precisely because they're consulted, not sequentially taught. |
| DRV-05 (Individual Nutrient Fact Sheets / Therapeutic Diet References) | KM16's ~26-appendix cluster (single-nutrient fact sheets, named-diet summaries) is structurally reference material — a student looks up "Nutritional Facts on Vitamin D" when needed rather than sitting through it as a lesson. |
| ASSESS-03's appendix-sourced content (KM16 Appendices 3, 5, 6, 8, 9 — growth charts, frame-size tables, BMI tables) | Same logic — tools consulted during assessment practice, not taught as standalone lessons. |
| RESEARCH-05 (Food Composition Data in Research) | NRM's own chapter (Ch.5) is framed around *using* composition databases as a research tool, closer to reference-skill than sequential content. |

## OPTIONAL Candidates

| Topic(s) | Basis |
|---|---|
| NUT-05 (Recognizing Nutrition Misinformation) | FOUNDATION-level and genuinely useful, but a single SN4 subsection (`BOOK_TOPIC_COVERAGE.md`: SN4=M, all others=—) with no dependency graph connections in either direction — a valuable add-on, not a structural requirement. |
| GI-03 (Gut Microbiome and GI Health) | Classified INTERMEDIATE, but its actual depth is an open Phase 1 deferral (item 4, requires book-content inspection — 3 books, 14 total scattered mentions, never a dedicated chapter anywhere). Reasonable to treat as optional-pending-inspection rather than assume it deserves core-required status just because it recurs often. |
| PUBHEALTH-06 (Food Sustainability and Systems) | A single KM16 subsection (`BOOK_TOPIC_COVERAGE.md`: KM16=M, all others=—), the thinnest-rated topic in the entire PUBHEALTH domain. |
| SPECIAL-04 (Cultural Competency in Nutrition Care) | Single-sourced (KM16 subsection within Ch.10), genuinely important professionally but with no REQUIRED dependency edges in `TOPIC_PREREQUISITES.md` in either direction — valuable, structurally peripheral. |
| LIFE-05 (Adulthood) | Already flagged in `TOPIC_LEARNING_LEVELS.md` as "the least specialized of the life-stage topics — broadly overlaps general adult nutrition already covered elsewhere" — the weakest case among LIFE-01 through LIFE-06 for dedicated required teaching time, since its content likely substantially restates NUT/BODY/general content already taught. |

## ELECTIVE (Track-Specific) Candidates

| Topic(s) | Basis |
|---|---|
| The 10 SPECIALIZED CLIN topics — CLIN-15 (HIV/AIDS), CLIN-16 (Critical Care), CLIN-17 (Rheumatic/Musculoskeletal), CLIN-18 (Neurologic), CLIN-19 (Psychiatric/Cognitive), CLIN-21 (LBW/Neonatal), CLIN-22 (Genetic Metabolic Disorders), CLIN-23 (Intellectual/Developmental Disabilities), CLIN-25 (Oral/Dental), CLIN-27 (Transgender Care) | Formally identified as "Layer 6" in `CLINICAL_NUTRITION_ARCHITECTURE.md` — each addresses a specific clinical sub-specialty. A general nutrition curriculum plausibly needs Layer 5's more common disease areas (diabetes, CVD, GI, renal) but not necessarily all ten of these narrower ones; a clinical-dietetics track would want some or all of them. This is the single largest bloc of elective candidates in the whole topic universe. |
| RESEARCH-09 (Biobanks), RESEARCH-13 (Stable Isotope Methods), RESEARCH-14 (Animal and Cellular Models) | The three RESEARCH topics with **zero** cross-domain dependency edges in `TOPIC_PREREQUISITES.md` (confirmed in `RESEARCH_ARCHITECTURE.md`'s Option B discussion) — genuinely useful for a student heading toward a research career, structurally disconnected from everyone else's learning path. |
| RESEARCH-11 (Omics/Systems Biology), RESEARCH-12 (Epigenetics/Nutrient-Gene Interactions) | SPECIALIZED-tier, and the RESEARCH-12 → SPECIAL-01 bridge is itself an unresolved human decision (Phase 1 item 9c) — appropriate as an elective research-track sequence rather than assumed-core content pending that decision. |
| SPORT-11 (Personalized/Precision Sport Nutrition) | SPECIALIZED-tier, SN4-only, and explicitly flagged (`PHASE_1_AMBIGUITY_AUDIT.md` item 8) as needing a currency check before curriculum use — a natural elective/advanced-track topic rather than core content, independent of that currency question. |
| SPECIAL-01 (Nutritional Genomics, Clinical/Applied) | SPECIALIZED-tier, KM16-only chapter; pairs naturally with the RESEARCH-11/12 elective track above rather than the general core sequence. |

## OUTSIDE CORE PATHWAY Candidates

| Topic(s) | Basis |
|---|---|
| CLIN-16 (Critical Care and Metabolic Stress) | Already elective by sub-specialty (above), but additionally: nothing in the dependency graph depends on it, and it depends only loosely (HELPFUL-strength) on MET-08.04 — a genuinely isolated node in the graph, not just a niche topic. |
| RESEARCH-09/13/14 (Biobanks, Stable Isotopes, Animal/Cellular Models) | As noted above, these have zero dependency edges *and* zero topics downstream — true islands in `LEARNING_DEPENDENCY_GRAPH.md`. Listed here as well as under Elective because they satisfy both tests independently (specialized *and* structurally disconnected), which is a stronger case than topics that are only one or the other. |
| PUBHEALTH-06 (Food Sustainability and Systems) | Single subsection, no dependency edges either direction, not built on by anything else in the graph. |
| SPECIAL-05 (Nutrigenetics/Personalization Convergence Point) | By its own definition in `MASTER_TOPIC_UNIVERSE.md`, this is "not a new independent topic" but a flagged seam — it was never meant to be taught as its own unit, only to mark where SPECIAL-01/RESEARCH-12/SPORT-11 might someday connect. Structurally, it sits entirely outside any teachable pathway as defined. |

---

## Explicitly NOT Excluded (Guardrail Notes)

To keep this file honest about what it isn't claiming:

- **CLIN-20 (Eating Disorders, Clinical Management)** was considered for the elective list (it's disease-specific, like the Layer 6 topics) but is **not** included — it's classified ADVANCED, not SPECIALIZED, has a direct cross-domain relationship to SPORT-10 (Female Athlete Triad/RED-S, itself core to sport nutrition), and eating disorders are common enough in general practice that treating it as elective would understate its real relevance. Kept in the core-candidate pool.
- **GI-03 (Gut Microbiome)** is listed OPTIONAL above, not excluded outright — the underlying science is active and relevant; the OPTIONAL designation reflects TOC-visible thinness and an open Phase 1 deferral, not a judgment that the topic itself is unimportant. If book-content inspection (still pending) reveals substantial coverage, this designation should be revisited.
- **Nothing about caffeine, alcohol, or doping content is formally excluded here**, even though all three are TOC-thin (per `PHASE_1_AMBIGUITY_AUDIT.md` items 6, 7, 9d) — they don't exist as standalone MASTER_TOPIC_UNIVERSE topics at all (they're subsections within SPORT-05/NUT-02/CLIN chapters), so there's no topic ID to exclude. This is noted rather than glossed over: thin coverage of a subsection is a different question from whether a whole topic belongs in the core, and this file only makes designations at the topic-ID level established in Phase 1.
- **No DRV-01 (DRI Methodology) exclusion** — despite sitting next to three REFERENCE-ONLY table topics, DRV-01 itself is the *conceptual* content (what an RDA/AI/UL means) that makes the reference tables interpretable at all, and has REQUIRED-strength downstream dependents (VIT-03, MIN-03). Kept in the core pool.

## Summary

| Category | Topic Count |
|---|---|
| REFERENCE-ONLY | 4 topic clusters (DRV-02/03/04/05, plus appendix-sourced ASSESS-03 content, plus RESEARCH-05) |
| OPTIONAL | 5 topics (NUT-05, GI-03, PUBHEALTH-06, SPECIAL-04, LIFE-05) |
| ELECTIVE | 16 topics (10 SPECIALIZED CLIN + 5 RESEARCH + SPORT-11 + SPECIAL-01) |
| OUTSIDE CORE PATHWAY | 5 topics/clusters (CLIN-16, RESEARCH-09/13/14, PUBHEALTH-06, SPECIAL-05) — note some overlap with Elective/Optional above by design, since a topic can satisfy more than one criterion |

No topic was removed from `MASTER_TOPIC_UNIVERSE.md`. These are proposed roles, not decisions — final inclusion/exclusion for any specific curriculum remains a human call, carried into `PHASE_2_HUMAN_REVIEW.md` where relevant.
