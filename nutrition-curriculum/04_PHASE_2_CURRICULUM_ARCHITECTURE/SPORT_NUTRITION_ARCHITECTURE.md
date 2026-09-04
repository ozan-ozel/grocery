# Sport Nutrition Architecture

Analyzes how AS3, ACSM, and SN4 could relate to each other within the SPORT domain (13 topics, `MASTER_TOPIC_UNIVERSE.md` DOMAIN 13). Per the Phase 1 audit's confirmed findings: AS3's apparent thinness in `BOOK_TOPIC_COVERAGE.md` is partly a TOC-structural artifact (no section-level Contents entries survive in that scan — Phase 1 item 1, classification B, not a real content gap), and ACSM/SN4 are the closest-overlapping pair of any two books in the whole seven-book set (Phase 1 item 2a, resolved). Raw coverage-matrix counts are **not** treated as equivalent to actual depth anywhere below.

---

## The Three Books, Restated

| | AS3 | ACSM | SN4 |
|---|---|---|---|
| Organizing principle | Nutrient chapters (1–4), then **by athlete type** (Power/Endurance/Combined, with embedded sample eating plans) | Nutrient-by-nutrient, closely mirroring SN4's own sequence | Nutrient-by-nutrient, most granular and current (2025) |
| Chapters | 13 | 15 | 17 |
| TOC resolution | Chapter-level only (no bookmarks, no printed section entries — confirmed structural, Phase 1 item 1) | Chapter + section level (no page numbers — EPUB limitation) | Chapter + section level, full page-accurate mapping |
| Distinctive feature | Athlete-type chapters with sample eating plans (no counterpart elsewhere) | Complete 7-appendix DRI reference set; single embedded case study | ~35-compound supplement chapter; dedicated training-adaptation and immune-function chapters; personalized-nutrition chapter |

---

## Three Architecture Possibilities

### A. One Primary Spine + Supporting Sources

SN4 becomes the primary sequence for all 13 SPORT topics; AS3 and ACSM contribute only where they add something SN4's TOC doesn't show (AS3's athlete-type case studies; ACSM's DRI appendix set as the domain's reference-table resource).

**When this fits:** If the curriculum wants one coherent, non-redundant sport-nutrition track with a single authoritative sequence a student follows start to finish, and treats the other two as supplementary/reference material rather than parallel teaching content.

**Risk:** SN4's chapter-title depth advantage (documented in `BOOK_ROLES.md` — its supplement chapter alone names ~35 compounds vs. AS3/ACSM's undifferentiated single chapters) is a TOC-visible fact, but *actual* prose depth in AS3/ACSM chapters hasn't been inspected (Phase 1 items are silent on this specifically — worth noting as a fresh C-type deferral, not resolved here: whether AS3/ACSM's thinner-looking chapters are truly thinner or just less granularly indexed is unverified).

### B. Three Progressively Deeper/Reinforcing Passes

Each SPORT topic is taught three times at increasing depth: AS3 introduces it (broadest, most applied/case-based framing), ACSM reinforces it at intermediate depth, SN4 delivers the deepest/most current treatment.

**When this fits:** If deliberate spaced repetition across sources is judged pedagogically valuable — three independently-written treatments of "carbohydrate and exercise," for instance, could genuinely deepen retention rather than waste time, the same way `TOPIC_OVERLAPS.md` #2 flagged this as *possibly* reinforcement rather than duplication.

**Risk:** This is the architecture most exposed to `TOPIC_OVERLAPS.md`'s #6 finding — AS3/ACSM/SN4's hydration chapters look close to identical at the TOC-title level (all three name near-identical subsections: thermoregulation, dehydration effects, fluid replacement, electrolyte losses). If the actual prose in those three chapters really does say the same thing three times, "reinforcement" becomes "waste." This can't be resolved without reading the actual chapters — flagged, not decided.

### C. Split by Topic Role (Hybrid — Neither Pure Spine Nor Pure Repetition)

Rather than choosing one posture for the whole domain, assign each of the 13 SPORT topics its own role (FOUNDATION/PRIMARY/ADVANCED-REINFORCEMENT/REFERENCE, see table below) based on which book's TOC shows the most distinctive or complete treatment *for that specific topic* — some topics get a single-book PRIMARY treatment (Option A logic), others get a genuine two-or-three-book reinforcement pass (Option B logic) where the overlap looks most like real complementary depth rather than restatement.

**When this fits:** If the curriculum is willing to make topic-by-topic judgment calls rather than adopt one uniform posture across all 13 SPORT topics — likely the most defensible option given how unevenly the overlap risk is distributed (some topics, like supplements, show one book far outpacing the others; other topics, like hydration, show near-total three-way overlap).

---

## Candidate Role Assignment Per SPORT Topic

This is the working table for Option C, and is informative regardless of which of the three overall architectures is eventually chosen — it shows where each book earns a distinct role versus where the books are functionally redundant. **FOUNDATION** = introduces the topic first/most accessibly; **PRIMARY** = the fullest, most current treatment; **ADVANCED/REINFORCEMENT** = adds depth or a second pass once PRIMARY is covered; **REFERENCE** = lookup/appendix material rather than sequential teaching content.

| Topic | AS3 Role | ACSM Role | SN4 Role | Basis |
|---|---|---|---|---|
| SPORT-01 Bioenergetics of Exercise | — | — | PRIMARY | Only SN4 gives this chapter-length treatment (Ch.3); AS3/ACSM don't chapter it separately. |
| SPORT-02 Fuel Sources/Fiber Types | — | — | PRIMARY | Same — SN4-only chapter-level content. |
| SPORT-03 Nutrient/Fluid Timing | PRIMARY | — | REINFORCEMENT | AS3 dedicates a full chapter (Ch.6) to this specifically; SN4 covers it as an integrated subsection within CHO/protein chapters — genuinely two different granularities, not restatement. |
| SPORT-04 Sport-Specific Strategies | PRIMARY (athlete-type framing, unique) | REINFORCEMENT (single combined chapter) | — | AS3's three-chapter athlete-type structure with sample eating plans has no counterpart in ACSM (one chapter) or SN4 (not chaptered this way at all) — AS3 is uniquely PRIMARY here, the one topic where AS3, not SN4, is the strongest source. |
| SPORT-05 Supplements/Ergogenic Aids | FOUNDATION | FOUNDATION | PRIMARY | SN4's ~35-compound chapter is dramatically more granular (per `BOOK_ROLES.md`); AS3/ACSM's single undifferentiated chapters work well as an introductory pass before SN4's depth. |
| SPORT-06 Training Adaptation | — | — | PRIMARY | SN4-only (Ch.12); no counterpart. |
| SPORT-07 Travel/Altitude/Heat | PRIMARY | REINFORCEMENT | — (minor mention only) | AS3 and ACSM both chapter this fully; SN4 does not — the two-book overlap here is the strongest genuine reinforcement case among all 13 topics (near-identical scope, both worth keeping). |
| SPORT-08 Exercise Immunology | — | REINFORCEMENT (combined with recovery) | PRIMARY | SN4 gives it a standalone chapter (Ch.13); ACSM folds it into a combined oxygen-transport/recovery chapter (Ch.9) — complementary framings, not pure repetition. |
| SPORT-09 Athlete Populations (Age/Sex) | PRIMARY | REINFORCEMENT | REFERENCE (subsection only) | AS3 and ACSM both chapter this fully; SN4 treats it as a subsection within its personalized-nutrition chapter. |
| SPORT-10 Female Athlete Triad/RED-S | — | — | PRIMARY | SN4-only chapter-length treatment (Ch.16); AS3/ACSM don't chapter this at all (see `APPARENT_CURRICULUM_GAPS.md` §2). |
| SPORT-11 Personalized Nutrition | — | — | PRIMARY | SN4-only (Ch.17); genuinely novel content not present elsewhere in the set. |
| SPORT-12 Athlete GI/Health/Injury | — | PRIMARY | — (folded into Ch.5 GI content) | ACSM's Ch.14 is the only dedicated chapter combining health/disease/injury for athletes. |
| SPORT-13 Diet Planning for Athletes | REINFORCEMENT (embedded plans) | PRIMARY | — | ACSM's Ch.15 is a dedicated diet-planning chapter; AS3 embeds sample plans within its athlete-type chapters rather than teaching planning as its own topic. |

**Reading the table:** Only 2 of 13 topics (SPORT-07 Travel/Altitude/Heat, and arguably SPORT-05 Supplements as a foundation→primary progression) show a genuinely strong case for the reinforcement architecture (Option B). 5 of 13 topics are effectively single-sourced to SN4 with no real alternative-book depth to reinforce against (Bioenergetics, Fuel Sources, Training Adaptation, Female Athlete Triad, Personalized Nutrition) — for these, Option A's "primary spine" logic is the only one that makes sense, because there's nothing to triangulate against. AS3 earns exactly one topic (SPORT-04) where it, not SN4, is the strongest source — its athlete-type organizing structure is a genuine asset, not a weakness, for that specific topic only.

---

## Recommendation Framing (Not a Final Decision)

The evidence above doesn't cleanly support either pure Option A or pure Option B for the whole domain — it supports **Option C (topic-by-topic role assignment)** as the architecture best supported by what the TOCs actually show, because the overlap pattern is genuinely uneven across the 13 topics (from "one book owns it entirely" to "three books say nearly the same thing"). Whether to adopt Option C's granularity, or simplify to Option A or B anyway for implementation ease, remains a **human curriculum decision** (carried to `PHASE_2_HUMAN_REVIEW.md` as item 1, alongside the already-open AS3/ACSM/SN4 question from Phase 1).

No claim is made here about the *scientific quality* of any book's treatment — only about structural coverage and TOC-visible granularity, consistent with Task 5's instruction not to make final scientific-quality judgments.
