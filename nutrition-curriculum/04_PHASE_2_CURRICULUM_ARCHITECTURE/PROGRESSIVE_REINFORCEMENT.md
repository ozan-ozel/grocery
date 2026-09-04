# Progressive Reinforcement

Identifies topics that recur across multiple books and asks a specific question for each: does the recurrence show *increasing depth or a different purpose* at each appearance (useful progressive reinforcement — spaced repetition with genuine added value), or does it show the *same depth and purpose repeated* (unnecessary duplication)? Per Task 8's explicit warning, repeated TOC appearance is **not** assumed to mean reinforcement is automatically desirable — each topic below is checked against what's actually knowable from the TOCs (purpose, framing, granularity) before being classified.

**Classification key:**
- **PROGRESSIVE** — each appearance has a different purpose, depth, or framing; recurrence likely adds value.
- **FLAT** — appearances look like the same purpose/depth repeated; recurrence is a duplication risk.
- **MIXED** — some pairs in the recurrence are progressive, others are flat; can't be resolved as a single verdict for the whole topic.
- **UNVERIFIABLE** — the TOCs don't contain enough information to tell; would need book-content inspection (flagged, not resolved).

---

## 1. Energy Balance

**Appears in:** HM4 (Ch.11, mechanistic — energy intake/expenditure regulation), Bender3 (Ch.6, obesity-focused), SN4 (Ch.4, exercise-applied), KM16 (Ch.21, clinical/treatment-focused), AS3/ACSM (sport-applied, body composition chapters), NRM (Ch.11–12, measurement methodology).

**Verdict: PROGRESSIVE.** This is the clearest case of genuine reinforcement in the whole set. Per `TOPIC_OVERLAPS.md` #7, the four/five appearances split cleanly across four *different purposes* — mechanism (HM4), clinical pathology/treatment (KM16, Bender3), sport application (SN4/AS3/ACSM), and measurement methodology (NRM) — not four books saying the same thing. A student encountering "energy balance" in each of these contexts is learning a different facet each time, which is textbook spaced reinforcement with added value at each pass.

## 2. Body Composition

**Appears in:** NRM (Ch.11, methods), SN4 (Ch.14, dedicated full chapter — models, measurement techniques), ACSM (Ch.8, combined with weight management), AS3 (Ch.10, combined with weight), KM16 (Ch.5, assessment methodology).

**Verdict: MIXED.** The methods-vs-application split (NRM measurement methodology vs. everyone else's applied treatment) is clearly progressive, matching the Energy Balance pattern above. But *within* the applied cluster, SN4/ACSM/AS3's three treatments (all combining body composition with weight/weight-management content, per their TOC structures) look close enough in scope that they may restate rather than deepen each other — same open question flagged in `TOPIC_OVERLAPS.md` #7 and unresolved by the TOCs alone.

## 3. Carbohydrate

**Appears in:** HM4/Bender3 (mechanistic, pathways of glucose metabolism), SN4 (Ch.6, full chapter, exercise-applied — loading, during-exercise, recovery, "train low compete high"), ACSM (Ch.2, exercise-applied), AS3 (Ch.1, as part of "Energy Nutrients"), KM16 (Ch.23, exercise-applied within the broader sports-performance chapter).

**Verdict: MIXED.** Mechanism-vs-application (HM4/Bender3 vs. the rest) is progressive by the same logic as Energy Balance. But within the *applied, exercise-specific* cluster, SN4 Ch.6 and ACSM Ch.2 in particular are flagged in `TOPIC_OVERLAPS.md` #2 as potentially covering "nearly identical ground" — pre-exercise, during-exercise, and recovery carbohydrate strategy appear as parallel subsection structures in both books' TOCs. This specific pair is the strongest FLAT candidate within an otherwise progressive topic.

## 4. Protein

**Appears in:** HM4/Bender3 (mechanistic — amino acid metabolism, nitrogen balance), SN4 (Ch.8, full chapter — requirements, muscle protein synthesis, timing, hypertrophy), ACSM (Ch.3, requirements), KM16 (Ch.23, subsection — "Protein for Muscle Hypertrophy"), Bender3 (Ch.8, uniquely, protein-energy malnutrition as its own chapter).

**Verdict: MIXED**, same pattern as Carbohydrate — mechanism vs. application is progressive; SN4 Ch.8 vs. ACSM Ch.3's applied-requirements content is a plausible FLAT pair (per `TOPIC_OVERLAPS.md` #3), though less certain than the carbohydrate case since ACSM's chapter title ("Protein," undifferentiated) gives less TOC-visible structure to compare against SN4's more granular subsection breakdown.

## 5. Hydration

**Appears in:** AS3 (Ch.3, full chapter), ACSM (Ch.7, full chapter), SN4 (Ch.9, full chapter), KM16 (Ch.3, general clinical fluid/electrolyte physiology — not exercise-specific — plus a Ch.23 exercise-applied subsection).

**Verdict: MIXED, leaning FLAT for the sport-book cluster specifically.** KM16 Ch.3 vs. the sport-applied content is clearly progressive (general physiology vs. exercise application — different purpose, per `TOPIC_OVERLAPS.md` #6). But the AS3/ACSM/SN4 three-way overlap is explicitly identified in Phase 1 (`TOPIC_OVERLAPS.md` #6) as **"the single strongest candidate for redundancy in the entire sport-nutrition portion of the set"** — all three name a dedicated chapter with near-identical subsection structure (thermoregulation, dehydration effects, fluid replacement, electrolyte losses). This is the clearest FLAT-leaning case in the whole reinforcement analysis; it is restated here as a finding carried forward, not newly discovered.

## 6. Exercise Metabolism

**Appears in:** HM4 (§8.2 "Exercise" — anaerobic/aerobic regulation, mechanistic), SN4 (Ch.3, full chapter — bioenergetics, fuel sources, fiber types), KM16 (Ch.23 §"Bioenergetics of Physical Activity").

**Verdict: PROGRESSIVE.** HM4's mechanistic treatment and SN4's sport-applied treatment are complementary in the same pattern as Energy Balance/Carbohydrate — different purpose, different depth. KM16's subsection appears to be a condensed restatement of SN4-level content for clinical/sport-performance-counseling purposes rather than a third independent depth level, but with only one subsection's worth of TOC evidence, this specific claim is closer to UNVERIFIABLE than confidently MIXED.

## 7. Nutrient Timing

**Appears in:** AS3 (Ch.6, full chapter, general nutrient/fluid timing), SN4 (distributed across CHO/protein chapters as "Food Timing" subsections), KM16 (Ch.23 §"Food Timing").

**Verdict: MIXED.** AS3's dedicated chapter treats timing as a unified topic across all nutrients; SN4 treats it as an integrated subsection within each macronutrient's own chapter (a genuinely different pedagogical structure, not just relocated content); KM16's subsection is much shorter. Whether AS3's unified treatment adds value beyond SN4's integrated-but-distributed treatment, or whether they simply organize the same content two different ways, cannot be determined from TOC structure alone — leaning UNVERIFIABLE for the AS3/SN4 pair specifically.

## 8. Nutrition Assessment

**Appears in:** NRM (Ch.4, 6, 11 — research-methodology framing: validity, reproducibility, measurement error), KM16 (Ch.4, 5, 9 — clinical-practice framing: what to ask a patient, how to interpret labs, how to act on findings).

**Verdict: PROGRESSIVE.** Already established in `TOPIC_OVERLAPS.md` #9 as complementary rather than duplicative — same underlying measurement problem (how do you know what someone ate, and what it did to them), addressed for two genuinely different purposes (study validity vs. patient care). This is one of the cleanest PROGRESSIVE cases in the set precisely because the *purpose* difference is structural (research vs. clinical), not just a difference in depth.

## 9. Supplements

**Appears in:** AS3 (Ch.4, "Ergogenic Aids," single undifferentiated chapter), ACSM (Ch.13, "Dietary Supplements, Foods, and Ergogenic Aids...Myths and Realities," single chapter with an explicit myth-busting framing), SN4 (Ch.11, ~35 individually named compounds — by far the most granular treatment in the set, per `BOOK_ROLES.md`), KM16 (Ch.23 subsection, sport-specific; Ch.11, separately, general/non-sport supplement regulation).

**Verdict: PROGRESSIVE, with one likely-FLAT pair.** AS3 and ACSM's single-chapter treatments plausibly function as an introductory FOUNDATION pass before SN4's compound-by-compound PRIMARY depth (matching the SPORT-05 role assignment already made in `SPORT_NUTRITION_ARCHITECTURE.md`) — genuinely progressive if AS3/ACSM's chapters are shallower overviews rather than restatements of the same 35 compounds at lower resolution. AS3 vs. ACSM specifically (both single, undifferentiated chapters, similar apparent scope) is the pair most likely to be FLAT rather than progressive relative to each other, though — as with several pairs above — actual chapter content would need inspection to confirm (see `PHASE_1_AMBIGUITY_AUDIT.md`; this specific AS3-vs-ACSM comparison was not previously flagged as a deferred item and is a **new observation** surfaced during this Phase 2 analysis, carried to `PHASE_2_HUMAN_REVIEW.md`). KM16's general-vs-sport supplement split (Ch.11 vs. Ch.23) is clearly progressive by purpose, consistent with pattern #1/#6/#8 above.

---

## Summary Table

| Topic | Verdict | Strongest PROGRESSIVE pair | Strongest FLAT-risk pair |
|---|---|---|---|
| Energy Balance | PROGRESSIVE | HM4 (mechanism) ↔ KM16 (clinical) ↔ SN4 (applied) ↔ NRM (methods) | none identified |
| Body Composition | MIXED | NRM (methods) ↔ applied cluster | SN4 ↔ ACSM ↔ AS3 (applied, all three) |
| Carbohydrate | MIXED | HM4/Bender3 (mechanism) ↔ applied cluster | SN4 Ch.6 ↔ ACSM Ch.2 |
| Protein | MIXED | HM4/Bender3 (mechanism) ↔ applied cluster | SN4 Ch.8 ↔ ACSM Ch.3 (less certain) |
| Hydration | MIXED, leaning FLAT | KM16 Ch.3 (general) ↔ sport cluster | AS3 ↔ ACSM ↔ SN4 (all three — strongest FLAT case in the set) |
| Exercise Metabolism | PROGRESSIVE | HM4 (mechanism) ↔ SN4 (applied) | none confidently identified |
| Nutrient Timing | MIXED, leaning UNVERIFIABLE | — | AS3 (unified) vs. SN4 (distributed) — different structure, unclear if different value |
| Nutrition Assessment | PROGRESSIVE | NRM (research) ↔ KM16 (clinical) | none identified |
| Supplements | PROGRESSIVE, one FLAT pair | AS3/ACSM (foundation) ↔ SN4 (primary depth) | AS3 ↔ ACSM (new observation, not previously flagged) |

## What This Means for Phase 3

Three topics (Energy Balance, Exercise Metabolism, Nutrition Assessment) show clean, TOC-supportable evidence for deliberate reinforcement design — safe to build spaced-repetition teaching sequences around these without further verification. Hydration is the one topic where the evidence actively points *away* from reinforcement and toward consolidation (or a deliberate choice to pick one of AS3/ACSM/SN4's three near-identical chapters as canonical). The remaining five topics are genuinely mixed or unverifiable from TOC structure alone — a defensible Phase 3 default would be to treat their cross-book pairs as progressive *where* a clear mechanism-vs-application or research-vs-clinical purpose split exists, and as duplication risks requiring human judgment everywhere else. This determination is not made here.
