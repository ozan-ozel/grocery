# Final Curriculum Architecture — Phase 6

**Phase:** Phase 6 — Final Curriculum Design (`PROJECT_AI_PROTOCOL.md` §14)
**Status:** Built from the 15 Gate 4 decisions (`00_PROJECT_CONTROL/DECISIONS/2026-09-06-gate-4-phase-6-
decisions.md`). Sequences all 213 stable topic IDs. No topic ID renamed, created, or deleted.
**Built on (read-only, not modified):** `MASTER_TOPIC_UNIVERSE.md`, `TOPIC_LEARNING_LEVELS.md`,
`TOPIC_PREREQUISITES.md`, `CANDIDATE_EXCLUSIONS.md`, `CLINICAL_NUTRITION_ARCHITECTURE.md`,
`SPORT_NUTRITION_ARCHITECTURE.md`, `RESEARCH_ARCHITECTURE.md`, `CURRICULUM_SPINE_CANDIDATES.md` (Phase
2); `APP_DECISION_MODEL.md` (Phase 3); `KNOWLEDGE_DECISION_DEPTH_MAP.md` (Phase 4);
`EVIDENCE_AND_CONTENT_INSPECTION_REGISTER.md` (Phase 5).
**Preserved exactly as documented (per Gate 4 §15):** `DEC-099`/`DEC-100` remain scope-pending for the
application. The three flagged bookkeeping/citation discrepancies remain flagged, not fixed. The eight
Phase 5 recommendations remain recommendations only. No Phase 1–5 source-of-truth document is modified.

---

## 1. Spine: Option D (Hybrid) — Three Acts

Per Gate 4 decision #1. Act boundaries below extend Phase 2's own Option D topic assignment
(`CURRICULUM_SPINE_CANDIDATES.md`: "(1) NUT + basic macronutrient/micronutrient classification and
chemistry only... (2) the full MET spine... plus metabolism-level nutrient topics... (3) GI, BODY,
ASSESS, DRV... (4) the four applied branches... (5) RESEARCH/SPECIAL as parallel/elective") with the
human's more granular act descriptions, reconciled explicitly where the two sources split a topic
differently (noted inline, not hidden).

**One reconciliation made explicit here:** the human's Act descriptions place "nutrition assessment and
interpretation" in Act 3 and "relevant assessment... mechanisms" in Act 2. This document reads that as:
`BODY-02`/`BODY-03` (energy-expenditure and body-composition *measurement techniques*, mechanistic) sit
in Act 2; the `ASSESS` domain (clinical/dietary assessment *methodology and interpretation*) sits in
Act 3. This is a judgment call, flagged in §7's self-audit, not silently absorbed.

**A second reconciliation:** Gate 4 decision #9 (Research Architecture Option D) pulls `RESEARCH-01`
early "close to `NUT-01`," while the human's Act list places "research/evidence literacy" under Act 3.
Resolved by pulling `RESEARCH-01` alone into Act 1 (as the orienting-frame exception Option D's own text
specifies), keeping every other `RESEARCH` topic in Act 3. This satisfies both instructions rather than
picking one over the other.

---

## 2. Act 1 — Nutrition Foundations (16 topics)

| Topic | Level | Note |
|---|---|---|
| `NUT-01` | FOUNDATION | Opens the curriculum |
| `NUT-02` | FOUNDATION | Nutrient classification |
| `NUT-03` | FOUNDATION | Dietary patterns (reused again in Act 3 practical translation, §6.8 — progressive reinforcement, not a repeat) |
| `NUT-04` | FOUNDATION | Food composition/labeling (reused in Act 3 translation) |
| `NUT-05` | FOUNDATION | Misinformation — `CANDIDATE_EXCLUSIONS.md` OPTIONAL, taught here as a short unit |
| `CHO-01` | FOUNDATION | Classification/chemistry only — metabolism deferred to Act 2 |
| `LIP-01` | FOUNDATION | Same |
| `PRO-01` | FOUNDATION | Same |
| `VIT-01` | FOUNDATION | Fat-soluble vitamins, classification only |
| `VIT-02` | FOUNDATION | Water-soluble vitamins, classification only |
| `MIN-01` | FOUNDATION | Macrominerals, classification only |
| `MIN-02` | FOUNDATION | Trace elements, classification only |
| `FLU-01` | FOUNDATION | Body water |
| `FLU-02` | FOUNDATION | Electrolyte physiology |
| `DRV-01` | INTERMEDIATE | DRI methodology — "energy and requirement concepts"; REQUIRED prerequisite for `VIT-03`/`MIN-03` (Act 3) |
| `RESEARCH-01` | FOUNDATION | Pulled early per Gate 4 decision #9 / Research Architecture Option D — "how do we know what we know," reinforced again at the start of Act 3's research block |

**Internal order:** `NUT-01→05`, then `RESEARCH-01` (orienting frame), then `CHO-01`/`LIP-01`/`PRO-01`/
`VIT-01,02`/`MIN-01,02` (parallel, order-agnostic — no prerequisite edges among them), then `DRV-01`,
then `FLU-01,02`.

---

## 3. Act 2 — Human Metabolism and Systems (27 topics)

Per Gate 4 decisions #3/#4. Internal order below was checked against every `TOPIC_PREREQUISITES.md`
`REQUIRED` edge touching these topics (§6.2) — no edge is violated.

| Stage | Topics | Level(s) | Rationale |
|---|---|---|---|
| 1. Core biochemistry | `MET-01, 02, 03, 04, 05` | FOUND./INTERM. | The MET spine's first half — chemistry→enzymes→ATP→cellular regulation→whole-body coordination. `MET-02→MET-03→MET-04` are `REQUIRED` in this exact order. |
| 2. GI physiology | `GI-01, 02` | FOUNDATION | `REQUIRED` prerequisite for nutrient-specific digestion (stage 3) |
| 3. Macronutrient metabolism | `CHO-02,03`, `LIP-02,03,04`, `PRO-02,03` | FOUND./INTERM./ADV. | "How the body handles what you just classified" — `LIP-04` (lipoprotein/cholesterol) grouped here with `LIP-03`, alongside `MET-09` below, rather than deferred to Act 3 — both are the same mechanistic subject as `MET-09`, just domain-tagged under `LIP` |
| 4. Organ/integration | `MET-06, 07, 08` | ADVANCED | Organ-specific metabolism → daily-life integration → adaptation to physiological/pathological challenges |
| 5. Specialized regulatory extensions | `MET-09`, `MET-10` | ADVANCED | Lipoprotein/atherosclerosis (needs `LIP-03`, stage 3 ✓); diabetes as regulatory failure (needs `CHO-03` + `MET-05`, both ✓) |
| 6. Energy balance mechanics | `BODY-01, 02, 03, 04, 06` | FOUND./INTERM./ADV. | `BODY-01` needs `CHO-03`/`LIP-03`/`PRO-03` (stage 3 ✓, `STRONGLY_RECOMMENDED`); `BODY-02`/`03` = measurement-technique mechanics (§1's reconciliation); `BODY-04`/`06` = obesity/underweight as energy-balance-dysregulation states, needing `BODY-01` (`REQUIRED`) |
| 7. Acid-base | `FLU-03` | INTERMEDIATE | Needs `FLU-01,02` (Act 1, `STRONGLY_RECOMMENDED`) |
| 8. Exercise metabolism | `SPORT-01, 02` | INTERMEDIATE | Bioenergetics/fuel-type *mechanism* only — needs `MET-03` (`REQUIRED`, stage 1 ✓); practical sport-nutrition application (timing, supplements, planning) deferred to Act 3's Sport branch |

---

## 4. Act 3 — Applied Nutrition (99 topics)

Per Gate 4 decisions #2, #5–#12. Organized into branches, in teaching-sequence order.

### 4a. Requirements Cluster (8 topics)

`CHO-04`, `LIP-05`, `PRO-04`, `PRO-05` (extends `PRO-04`, `STRONGLY_RECOMMENDED`), `VIT-03`, `MIN-03`
(both need `DRV-01`, Act 1, `REQUIRED`), `BODY-05` (applied weight-management/treatment
decision-making — needs `BODY-04`, Act 2, `REQUIRED`; the general, non-athlete-specific half of Gate 4
decision #3's "applied/decision-making" energy-balance unit — its athlete-specific counterpart, `BODY-
07`, is placed in the Sport Branch, §4d, immediately below). Reference material available throughout,
not sequenced as lessons: `DRV-02, 03, 04, 05` (per `CANDIDATE_EXCLUSIONS.md`'s REFERENCE-ONLY
designation, ratified — Gate 4 decision #11).

### 4b. Nutrition Assessment Cluster (6 topics)

`ASSESS-01, 02, 03, 04, 05, 06`, in that order (`01/02/03→05` `REQUIRED`; `02→06` `REQUIRED`). This
cluster is the `REQUIRED` prerequisite gateway into the Clinical branch (4c) and feeds `PUBHEALTH-02`
(4f) and `SPECIAL-03` (4c's Layer 4 cluster).

### 4c. Clinical Branch (27 CLIN topics + 5 cross-cutting Layer-4 topics)

Per Gate 4 decisions #7/#8/#14 — **curriculum-scope decisions only; `DEC-099`/`DEC-100`'s application-
scope boundary is untouched and not implied by anything below.**

1. **Entry point:** `CLIN-01` (needs `ASSESS-01/02/03/05`, 4b, `REQUIRED`).
2. **Layer 4 — cross-cutting clinical skills, CORE, taught centrally** (per `CLINICAL_NUTRITION_
   ARCHITECTURE.md`'s own Layer-4 definition, which already groups these five topics): `CLIN-02`
   (Nutrition Support — curriculum-CORE despite being confirmed outside the *application's* scope, §1's
   distinction), `CLIN-26` (Inflammation/Chronic Disease framework), `SPECIAL-02` (Complementary/
   Integrative Medicine, general/non-sport), `SPECIAL-03` (Counseling — needs `ASSESS-05`, 4b,
   `STRONGLY_RECOMMENDED`), `SPECIAL-04` (Cultural Competency). Per Gate 4 decision #8: reinforced
   briefly and contextually within Layer 5's disease units, not fully re-taught per chapter.
   **`SPECIAL-04` note:** `CANDIDATE_EXCLUSIONS.md` originally tagged this OPTIONAL; `CLINICAL_
   NUTRITION_ARCHITECTURE.md`'s own Layer-4 framing already treats it as clinical cross-cutting core,
   and Phase 4 separately overrode it to `FULL` application-tier (Gate 1 §7.3) for application-decision
   reasons. Per Gate 4 decision #11, that override is preserved as a documented exception here — this
   curriculum places `SPECIAL-04` as CORE (via Layer 4), consistent with, not caused by, that override.
3. **Layer 5 — general-practice tier, CORE** (14 topics — the corrected 24-topic Layer 5 minus its
   10-topic Layer-6 subset, per the Gate 1 decision record's validated 24/14 figures): `CLIN-03, 04, 05,
   06, 07, 08, 09, 10, 11, 12, 13, 14, 20, 24`. Cross-reference: `GI-05` (Act 2's `GI-01/02` feed both
   `CLIN-04`/`05` directly, `REQUIRED`); `MET-09`/`LIP-04` (Act 2) feed `CLIN-10` (`REQUIRED`); `MET-10`
   (Act 2) feeds `CLIN-07` (`REQUIRED`); `MIN-02`/`VIT-02` (Act 1) feed `CLIN-09` (`REQUIRED`).
4. **Layer 6 — SPECIALIZED tier, ELECTIVE/ADVANCED module** (10 topics, taught after the CORE sequence,
   for students continuing toward a clinical-dietetics track): `CLIN-15, 16, 17, 18, 19, 21, 22, 23, 25,
   27`. `LIFE-07` (a cross-reference to `CLIN-27` per its own definition in `MASTER_TOPIC_UNIVERSE.md`)
   is taught here, not separately.

**Explicit, per Gate 4 decision #14:** none of the above resolves which conditions the *application*
supports. `DEC-099`/`DEC-100` remain exactly as scope-pending as at Gates 1–3.

### 4d. Sport Branch (21 topics)

Per Gate 4 decision #2 — **topic-by-topic role assignment**, reusing `SPORT_NUTRITION_ARCHITECTURE.md`'s
own working table verbatim (not re-derived):

| Topic | Role(s) across AS3/ACSM/SN4 |
|---|---|
| `SPORT-03` Nutrient/Fluid Timing | AS3 PRIMARY, SN4 REINFORCEMENT (genuinely different granularities) |
| `SPORT-04` Sport-Specific Strategies | AS3 PRIMARY (unique athlete-type framing), ACSM REINFORCEMENT |
| `SPORT-05` Supplements/Ergogenic Aids | AS3/ACSM FOUNDATION, SN4 PRIMARY — **Phase 5 confirmed complementary, not redundant** (§4j) |
| `SPORT-06` Training Adaptation | SN4 PRIMARY (no counterpart) |
| `SPORT-07` Travel/Altitude/Heat | AS3 PRIMARY, ACSM REINFORCEMENT — strongest genuine two-book overlap case |
| `SPORT-08` Exercise Immunology | SN4 PRIMARY, ACSM REINFORCEMENT (combined chapter) |
| `SPORT-09` Athlete Populations | AS3 PRIMARY, ACSM REINFORCEMENT, SN4 REFERENCE |
| `SPORT-10` Female Athlete Triad/RED-S | SN4 PRIMARY (no counterpart) — see §4j for evidence-currency note |
| `SPORT-12` Athlete GI/Health/Injury | ACSM PRIMARY |
| `SPORT-13` Diet Planning | ACSM PRIMARY, AS3 REINFORCEMENT (embedded plans) |

Plus the practical/applied macronutrient-and-exercise topics (deferred from Act 2, §1): `CHO-05`,
`LIP-06`, `PRO-06`; hydration application: `FLU-04`, `FLU-05`; exercise-GI: `GI-04`; athlete
micronutrients: `VIT-04`, `MIN-04` (both need Act 1's `VIT-01/02`/`MIN-01/02`, `REQUIRED`); athlete
body-composition/weight-management application: `BODY-07` (needs `BODY-01`/`BODY-03`, Act 2,
`STRONGLY_RECOMMENDED` — the athlete-specific counterpart to `BODY-05`, §4a).
`LIFE-08` (cross-reference to `SPORT-09`) taught here, not separately.

**`SPORT-11` is deliberately not in this branch** — see §4h.

### 4e. Life Stages Branch (7 taught topics + 1 integrated)

`LIFE-01, 02, 03, 04, 06` in natural life-course order (`HELPFUL`-only internal edges — pedagogical
convenience, not a hard dependency). `LIFE-05` (Adulthood) is **not** a standalone unit per Gate 4
decision #12 — its content is integrated as a brief bridging note between `LIFE-04` and `LIFE-06`,
cross-referencing general `NUT`/`BODY` content already taught. Topic ID and provenance retained; no
deletion.

### 4f. Public Health Branch (6 topics)

`PUBHEALTH-01, 02, 03, 04, 05, 06`, in that order (`PUBHEALTH-02` needs `ASSESS-01`, 4b,
`STRONGLY_RECOMMENDED`; `PUBHEALTH-03` needs `NUT-03`, Act 1, `STRONGLY_RECOMMENDED`).

### 4g. Research & Evidence Branch — Core (9 topics)

Per Gate 4 decision #9 (Research Architecture Option D): `RESEARCH-02, 03, 04, 06, 07, 08, 10, 15`, in
that order (`02/03→07` `REQUIRED`; `04→06` `STRONGLY_RECOMMENDED`; `02/03/07→15` `STRONGLY_
RECOMMENDED`, placed last as this block's synthesis/translation capstone). `RESEARCH-05` (Food
Composition Data in Research) is **reference material**, per `CANDIDATE_EXCLUSIONS.md`'s REFERENCE-ONLY
designation — not sequenced as a lesson, available for consultation alongside `NUT-04`.

### 4h. Advanced/Elective Frontier Module (8 topics)

Per Gate 4 decisions #5/#9/#11 — this groups everything `CANDIDATE_EXCLUSIONS.md` itself classified as
the "personalized-nutrition frontier" and research-track electives, taught together as one coherent
advanced module for students continuing past the core sequence: `RESEARCH-09, 11, 12, 13, 14`,
`SPECIAL-01`, `SPORT-11`, `SPECIAL-05`. Internal order: `RESEARCH-11→RESEARCH-12` (`STRONGLY_
RECOMMENDED`) `→SPECIAL-01` (`STRONGLY_RECOMMENDED` from `RESEARCH-12`) — this is the nutrigenomics
bridge (Gate 4 decision #5), built here, at advanced/elective depth, not distorting the main spine.
`RESEARCH-09/13/14` (zero-cross-domain-edge islands) and `SPORT-11` (evidence-currency caveat — §4j) sit
alongside without hard sequencing constraints. `SPECIAL-05` is taught last, as the explicit "convergence
marker" tying `SPECIAL-01`/`RESEARCH-12`/`SPORT-11` together — consistent with its own definition in
`MASTER_TOPIC_UNIVERSE.md` as a marked seam, not an independent lesson.

### 4i. Practical Translation (reapplication, not new topics)

Per the human's Act 3 description and the confirmed Practical Translation Gap (`APP_DECISION_GAPS.md`
§9/§14/§19 — `GAP-A` for recipe/preparation content, `GAP-D` for shopping logistics, neither resolved by
Phase 5 nor by this document). This unit **reapplies** `NUT-03`/`NUT-04` (Act 1) toward meal
construction and food selection, and includes `GI-03` (Gut Microbiome — Phase 5 confirmed adequately
covered overall, §4j) as a general-health application topic. **It does not introduce new topic IDs for
recipe/preparation/shopping content** — that gap is explicitly carried forward, not manufactured a
resolution, consistent with `APP_DECISION_GAPS.md`'s own finding that this is better handled as
product/application logic than curriculum content.

### 4j. Provenance Flags Carried Into This Architecture

Per Gate 4 decision #6 (explicit three-way distinction, maintained here):

- **Single-source-but-adequately-supported:** `RESEARCH` domain (100% NRM) — accepted per decision #6;
  `GI-03` (gut microbiome) — Phase 5 confirmed `SN4` and `KM16`-Ch.1 both substantive independently (not
  single-source in practice, though `NRM`'s portion is thin — §4.4 of the Phase 5 register).
- **Single-source-and-thin:** `CHO-04`'s fiber content — confirmed genuinely thin on inspection (Phase 5
  register §3.5, a negative control, not overturned).
- **Genuinely missing from the corpus:** recipe/preparation/shopping-logistics content (§4i) — `GAP-A`/
  `GAP-D`, not a single-source question at all, a true absence.
- **Evidence-currency notes, not curriculum gaps:** `SPORT-10`/`SPORT-11`'s cycle-phase-tailoring
  question is **resolved** (Phase 5: current evidence does not support cycle-phase-specific tailoring —
  a scientific finding, kept separate from any product implication, per instruction); `SPORT-05`'s
  AS3/ACSM/SN4 relationship is **resolved** (Phase 5: complementary, not redundant, closing Phase 2 item
  10 — Gate 4 decision #10).
- **Still genuinely unresolved, carried forward, not manufactured:** KM16's dedicated "Doping In Sport"
  subsection; COVID-19 material (Gate 4 decision #13). The hydration-chapter AS3/ACSM/SN4 overlap
  question (Phase 6's own preparatory package, §3 item 1) remains an open validation item, not resolved
  by adopting the topic-by-topic sport architecture (Gate 4 decision #2's own instruction).

---

## 5. Reinforcement Map (progressive reinforcement, per Gate 4 decision #1)

Explicit, not incidental — each entry adds a new layer, not a repeat:

| Topic | First taught | Reinforced | New layer added |
|---|---|---|---|
| `NUT-03` | Act 1 (concept) | Act 3 §4i (practical translation) | From "what a dietary pattern is" to "constructing a meal within one" |
| `NUT-04` | Act 1 (concept) | Act 3 §4i | From "what food-composition data is" to "using it for substitution/portioning" |
| `CLIN-26` (inflammation) | Act 3 §4c Layer 4 (framework) | Contextually within `CLIN-07/10/17` | From general framework to disease-specific application (per Gate 4 decision #8) |
| `RESEARCH-01` | Act 1 (orienting frame) | Act 3 §4g (full methods block) | From "why research matters" to "how to actually evaluate a study" |
| `BODY-01` | Act 2 (mechanism) | Act 3 §4d (`BODY-05`/`07`, applied) | From energy-balance concept to weight-management/athlete decision-making |

---

## 6. Validation

### 6.1 Topic Count

142 Level-1 topics: Act 1 = 16, Act 2 = 27, Act 3 = 99 (16+27+99 = 142 ✓, cross-checked against
`MASTER_TOPIC_UNIVERSE.md`'s own 18-domain count table). 71 Level-2 subtopics inherit their parent
topic's Act placement (same rule Phase 3/4 used), except where independently sequenced below — none are;
no subtopic needed independent placement, since Phase 3/4's own subtopic differentiations (`NUT-03.03`,
`CHO-05.01–.04`, `BODY-02.01–.03`, `ASSESS-01.03`, `PRO-04.02`) all sit inside topics already placed as a
whole. **213 of 213 topic IDs accounted for.**

**This check was performed programmatically** (a script cross-referencing every topic ID mentioned in
§2–§4 against the full 142-topic list), **not just visually** — and it caught a genuine drafting gap:
`BODY-05`/`BODY-07` were designed into the architecture (per Gate 4 decision #3) and referenced in §5's
reinforcement map, but had been omitted from the actual §4a/§4d topic lists in the first draft. Both were
added (§4a, §4d) before this validation section was finalized — recorded here for transparency rather
than silently corrected without a trace.

### 6.2 Prerequisite Graph (`TOPIC_PREREQUISITES.md`, 86 edges)

Every `REQUIRED` edge (35 total) was checked against this architecture's Act/sequence placement — see
the rationale notes inline in §2–§4 for each one touching a placement decision. **No `REQUIRED` edge is
violated** (every prerequisite is taught at or before its dependent, either within the same Act's
internal sequence or in an earlier Act). `STRONGLY_RECOMMENDED` and `HELPFUL` edges were checked
similarly; all are satisfied by this ordering. The one edge spanning the widest gap — `RESEARCH-01`
(Act 1) → `RESEARCH-02/03` (Act 3) — is intentional, per Research Architecture Option D's own design
(§1), not an oversight.

### 6.3 Learning Levels (`TOPIC_LEARNING_LEVELS.md`)

Act 1 is 100% FOUNDATION-or-`DRV-01`-INTERMEDIATE, matching its "orientation, low cognitive load" design
intent (Gate 4 decision #1's Act 1 description). Act 2 concentrates the bulk of ADVANCED-tier MET/BODY
content, matching the "committed mechanism block" intent. Act 3's Advanced/Elective module (§4h)
concentrates 5 of the corpus's 19 SPECIALIZED-tier topics not otherwise placed in Act 3's core clusters
(`RESEARCH-11/12/13/14`, `SPECIAL-01`) plus `SPORT-11` — consistent with `CANDIDATE_EXCLUSIONS.md`'s own
elective framing.

### 6.4 `CANDIDATE_EXCLUSIONS.md` Cross-Check

Every one of `CANDIDATE_EXCLUSIONS.md`'s ~30 designated topics is placed consistently with its
designation in this architecture (REFERENCE-ONLY → reference material, not sequenced as a lesson;
OPTIONAL → taught but flagged short/skippable; ELECTIVE → the two advanced/elective modules, §4c Layer 6
and §4h; OUTSIDE-CORE-PATHWAY → the same elective placements). The one documented override
(`SPECIAL-04`) is preserved and explained (§4c), not silently reverted, per Gate 4 decision #11. **No
topic was deleted from the corpus or topic universe.**

### 6.5 Phase 3 Decision Model Cross-Check

Spot-checked: every topic Phase 3/4 tiered `CORE APPLICATION`/`FULL` (e.g. `BODY-01`, `ASSESS-01`,
`NUT-03/04`, `CLIN-01`) sits in a substantively-taught position in this architecture (not deferred to a
skippable elective module) — consistent, though this cross-check is confirmatory, not load-bearing,
since Phase 4's lens is application-centric and this architecture's lens is curriculum-pedagogical (§1
of the preparatory package). No application decision, dependency, or gap classification is referenced
for resolution here — Phase 3's artifacts are cited only as confirmatory context.

### 6.6 Phase 4/5 Findings Cross-Check

Every Phase 5 content-inspection finding that bears on curriculum placement is incorporated explicitly
(§4j): `SPORT-05` redundancy (resolved), `SPORT-10`/`11` cycle-phase evidence (resolved, kept separate
from product implication), `CHO-04` fiber (confirmed thin, not overturned), `GI-03` (confirmed
adequately covered). Phase 4's application-depth tiers were **not** used as curriculum-placement inputs,
per §1's explicit scope distinction — confirmed by re-checking that no Act/branch assignment above cites
a `KNOWLEDGE_DECISION_DEPTH_MAP.md` tier as its stated reason.

### 6.7 Stable ID Integrity

No topic ID was renamed, merged, split, or deleted. `LIFE-05`'s non-standalone-unit treatment (§4e) and
`SPECIAL-05`'s convergence-marker treatment (§4h) are sequencing/scoping decisions, explicitly not
deletions — both retain their IDs and provenance in `MASTER_TOPIC_UNIVERSE.md`, unmodified.

---

## 7. Self-Audit (per `PROJECT_AI_PROTOCOL.md` §19 Step 6)

- **What could be wrong:** the Act 2/Act 3 split for `BODY-02`/`BODY-03` (mechanism) vs. the `ASSESS`
  domain (interpretation) is a judgment call reconciling two slightly different phrasings in the human's
  own Act descriptions (§1) — a reasonable reading, not the only possible one. Similarly, `SPECIAL-02`/
  `03`/`04`'s placement in the Clinical Layer-4 cluster (rather than scattered near their most-related
  general topics) follows `CLINICAL_NUTRITION_ARCHITECTURE.md`'s own Layer-4 definition exactly, but a
  curriculum designer might reasonably prefer teaching `SPECIAL-03` (counseling) as a general skill
  before the Clinical branch begins, not folded into it.
- **What was assumed:** that `LIP-04` (omitted from every prior phase's Act/depth discussion without
  incident) belongs in Act 2 alongside `MET-09` — the same subject, different domain tag; not previously
  stated anywhere in Phase 1–5, but directly supported by `TOPIC_PREREQUISITES.md`'s own `LIP-04/MET-09
  → CLIN-10` `REQUIRED` edge, which treats them as a pair.
- **What was silently resolved:** nothing beyond the 15 Gate 4 decisions themselves. `DEC-099`/`DEC-100`
  untouched. The AS3/ACSM/SN4 hydration-chapter question remains open, explicitly flagged (§4j), not
  quietly assumed resolved by adopting the topic-by-topic sport architecture.
- **What changed from Phase 1–5:** no source document changed. This is Phase 6's own new artifact.
- **What the next phase depends on:** Phase 7 (Decision Engine Specification) is explicitly barred from
  starting until this architecture passes its own review gate — and Phase 7's formulas/thresholds/rules
  must not be confused with this curriculum's pedagogical sequencing, per `PROJECT_AI_PROTOCOL.md`
  §15/§28's premature-implementation rule, unaffected by anything in this document.

---

## 8. Status

Phase 6's final curriculum architecture is built and validated against all seven required cross-checks
(§6). `DEC-099`/`DEC-100` remain scope-pending; three bookkeeping/citation discrepancies remain flagged;
eight Phase 5 recommendations remain recommendations; no Phase 1–5 source document was modified; no
topic ID was changed. See `AI_SESSION_STATE.md` for the Gate 4 completion package and next action.
