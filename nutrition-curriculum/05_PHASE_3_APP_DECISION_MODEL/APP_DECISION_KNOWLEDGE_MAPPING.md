# App Decision Knowledge Mapping

Phase 3, Document 3 of 5 (`APP_DECISION_INVENTORY → APP_DECISION_DEPENDENCY_GRAPH →
APP_DECISION_KNOWLEDGE_MAPPING → APP_DECISION_GAPS → APP_DECISION_MODEL`).

---

# 1. Purpose

The first two Phase 3 documents established, in order: *what* the application must decide (112 `DEC`
records) and *how* those decisions depend on each other (203 edges across five dependency types). This
document answers a third question:

> **What scientific knowledge is required to support each application decision?**

```
KNOWLEDGE (213 topic IDs, Phase 1)
    ↓
DECISION (112 DEC records, Phase 3A/3B)
    ↓
APPLICATION OUTPUT
```

This is a **bridge** document between the 213-topic curriculum universe built in Phase 1
(`03_PHASE_1_CURRICULUM_ANALYSIS/MASTER_TOPIC_UNIVERSE.md`) and the 112-decision application model
built in Phase 3A/3B. It is deliberately bidirectional: §5 asks, for every decision, "which knowledge
does this actually need?"; §7 asks the reverse, for every topic, "which decisions actually use this?"
The second direction is not a formality — it is what surfaces knowledge hubs, knowledge islands, and
topics that exist for sound curricular reasons but currently have no consumer-facing decision role.

**What this document does not do:** invent a knowledge topic not already in the 213-topic universe;
delete, rename, merge, or reclassify an existing topic; resolve any open Phase 1/2 curriculum-
architecture question; perform current-evidence research (flags only); design a formula, threshold,
algorithm, database schema, API, or UI; or assume every one of the 213 topics must power the
application — a topic can legitimately be educational, reference-only, specialized, or currently
without a decision-level role, and this document says so explicitly rather than forcing a mapping.

---

# 2. Mapping Principles

**Functional, not keyword, mapping.** A topic is mapped to a decision because understanding that topic
materially contributes to making the decision responsibly — never because a word appears in both the
topic name and the decision text. Worked example, per the governing brief: `DEC-031` (protein
requirement) does not map to `PRO-01, PRO-02, PRO-03` merely because they contain "protein." It maps
to `PRO-04` (Protein Requirements) as `CORE` because that topic *is* the requirement-determination
science; `PRO-03` (protein/amino-acid metabolism) is mapped `SUPPORTING` because it explains *why* the
requirement behaves as it does, which improves but is not strictly necessary for setting the target;
`PRO-01` (protein chemistry) and `PRO-02` (digestion/absorption) are **not** mapped at all — they sit
below the altitude at which any application decision reasons.

**Relationship strength** (§7 of the governing brief), used consistently:

| Strength | Meaning |
|---|---|
| `CORE` | The decision cannot be responsibly made without this knowledge. |
| `SUPPORTING` | The decision can technically proceed without it, but quality/depth is significantly reduced. |
| `CONTEXTUAL` | Useful for interpretation or refinement, not central. |
| `REFERENCE` | Useful for lookup only — not something the decision *reasons about*, just consults. |

**Knowledge roles** (§8 of the governing brief), one or more per relationship: `MECHANISTIC`,
`ASSESSMENT`, `INTERPRETIVE`, `PRESCRIPTIVE`, `APPLICATION`, `SAFETY`, `CONTEXTUAL`,
`EVIDENCE/METHODS`, `TRANSLATION`.

**Knowledge layering — the same subject can appear at multiple layers with different roles**, and this
document does not collapse them. Worked example (the governing brief's own): protein appears as
`PRO-01` (foundation — chemistry, not decision-mapped), `PRO-02` (mechanism — digestion, not
decision-mapped), `PRO-03` (mechanism — metabolism, `SUPPORTING`/`MECHANISTIC` for `DEC-031`), `PRO-04`
(prescription, `CORE`/`PRESCRIPTIVE` for `DEC-031`/`DEC-032`), `PRO-06` (translation/application,
`CORE`/`APPLICATION` for `DEC-033`, and `MECHANISTIC` for `DEC-032`'s training-adjustment reasoning).
One subject, five topic IDs, each doing different structural work.

**Decision-dependency context is respected.** Per `APP_DECISION_DEPENDENCY_GRAPH.md`, a knowledge topic
mapped `CORE` to an *upstream* decision (e.g. `BODY-02` for `DEC-017`/`DEC-018`, initial estimation) is
not automatically re-mapped `CORE` to every *downstream* decision that consumes its output (e.g.
`DEC-060`, food-selection translation, does not need `BODY-02`'s calorimetry-method knowledge — it
needs `NUT-02`/`NUT-04` instead). Each decision's mapping is derived from what *that* decision's own
function requires, not inherited wholesale from its position in the dependency chain.

**Subtopic-granularity rule (methodological choice, stated once here):** the 213-ID topic universe
comprises 142 Level-1 topics and 71 Level-2 subtopics. §5's decision-level mapping is performed at
Level-1 granularity, matching how `APP_DECISION_INVENTORY.md` itself cited topic IDs — except where a
specific subtopic is what a decision differentially needs (e.g. `DEC-035` needs specifically
`CHO-05.01`–`.04`'s timing subtopics, not `CHO-04`'s general intake-pattern content; `DEC-018` needs
specifically `BODY-02.01`–`.03`'s method-class subtopics). Where such a subtopic-specific need exists,
it is named directly in §5. §8's Knowledge Utilization Table nonetheless accounts for all 71 Level-2
IDs explicitly — most inherit their parent topic's application-centrality classification by rule (noted
as such), a minority get independent treatment where §5 already cited them by name. This is a stated
simplification proportionate to scale, not an omission.

**Evidence-dependency distinction is preserved, not conflated:** *existing-corpus support* (the 7-book
corpus meaningfully covers this), *existing-corpus + current evidence* (the books provide a foundation
but contemporary evidence also matters), and *current-evidence-primary* (the topic/decision is too
dynamic to rely on the 7-book corpus alone) are tracked separately per decision in §15, reusing —
never re-deriving — the `Current Evidence Required` flags already recorded in `APP_DECISION_INVENTORY.md`.

**Gap categories are kept separate**, per the governing brief's explicit five-way distinction: `LIKELY
COVERED`, `MAPPING UNCERTAIN`, `LIKELY MISSING`, `CURRENT EVIDENCE GAP`, `APPLICATION TRANSLATION GAP`
(§16). These are never merged into one generic "gap."

---

# 3. Knowledge Universe Summary

From `03_PHASE_1_CURRICULUM_ANALYSIS/MASTER_TOPIC_UNIVERSE.md`, used here as the fixed, authoritative,
unmodified topic set:

- **18 domains**: NUT, DRV, MET, CHO, LIP, PRO, VIT, MIN, FLU, GI, BODY, ASSESS, SPORT, CLIN, LIFE,
  RESEARCH, PUBHEALTH, SPECIAL.
- **142 Level-1 topics**, **71 Level-2 subtopics**, **213 stable IDs total** — exact counts per domain
  reproduced from the inventory's own §3 table for reference: NUT 5/11, DRV 5/0, MET 10/22, CHO 5/4,
  LIP 6/0, PRO 6/8, VIT 4/0, MIN 4/0, FLU 5/0, GI 5/0, BODY 7/9, ASSESS 6/3, SPORT 13/7, CLIN 27/0,
  LIFE 8/0, RESEARCH 15/7, PUBHEALTH 6/0, SPECIAL 5/0 (Level-1/Level-2 counts).
- No topic is added, removed, renamed, merged, or split in this document.

---

# 4. Decision Universe Summary

From `APP_DECISION_INVENTORY.md` and `APP_DECISION_DEPENDENCY_GRAPH.md`, also used unmodified:

- **112 decisions** (`DEC-001`–`DEC-112`) across 20 domains (A–T).
- **10 functional layers** (per the dependency graph's §3): Intent & Scope; Baseline & Data Governance;
  Scientific Estimation; Individualization & Interpretation; Target Setting & Prescription;
  Macro/Micronutrient Allocation; Practical Translation; Monitoring & Feedback; Conditional
  Specialized Pathways; Evidence & Governance.
- **The personalization loop**: `DEC-017/018/019` (initial estimate) → `DEC-020/021` (individualize) →
  `DEC-022/027` (prescribe) → `DEC-081–084` (monitor/interpret/adjust) → `FEEDBACK` edges back into
  `DEC-021/022` and beyond.
- **Major branches**: Goal→Prescription, Baseline→Energy, Observation→Individualization, Macronutrient
  Allocation, Nutrient→Meal, Meal→Shopping, Sport, Clinical, Monitoring→Adjustment,
  Evidence/Uncertainty (dependency graph §5).
- 203 dependency edges (191 forward, 12 `FEEDBACK`); 11 root decisions; DEC-001/DEC-092/DEC-076 as the
  three highest-fan-out hubs; DEC-056/DEC-066 as the two highest-fan-in integration points.

This document takes all of the above as fixed context, not subject to revision here.

---

# 5. Decision → Knowledge Mapping

Complete, domain-grouped. **Columns:** Topic (Level-1 ID, or a named subtopic where the decision
differentially needs that granularity per §2's rule) · Strength · Role · Why Required (functional, not
keyword) · Context (which pipeline stage this knowledge serves) · Confidence (in the *mapping*, not in
the science itself).

## Domain A — Goal Classification

**DEC-001** (classify primary goal category)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-01 | CORE | MECHANISTIC | Energy-balance concept is what makes "weight loss/gain/maintenance" meaningful categories at all, not just labels | Upstream — defines the goal taxonomy | HIGH |
| BODY-04 | SUPPORTING | CONTEXTUAL | Obesity/overweight framing sharpens what a "weight loss" goal category should distinguish (e.g. clinical vs. cosmetic framing) | Upstream | MODERATE |
| BODY-05 | SUPPORTING | CONTEXTUAL | Weight-management treatment-approaches content informs what goal subtypes are meaningfully distinct | Upstream | MODERATE |
| BODY-07 | SUPPORTING | CONTEXTUAL | Athlete body-composition/weight content informs recognition of performance/recomposition-type goals | Upstream | MODERATE |

**DEC-002** (goal clarity/operationalization)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| NUT-01 | CORE | CONTEXTUAL | Framing of nutritional science as a discipline is the conceptual basis for distinguishing an "operational nutrition goal" from a vague wellness statement | Upstream | MODERATE |

**DEC-003** (goal reconciliation, incl. recomposition)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-01 | CORE | MECHANISTIC | Energy-balance reasoning is what actually makes "simultaneous fat loss + muscle gain" a reconcilable-or-not question — can't be evaluated without it | Upstream | HIGH |
| BODY-07 | SUPPORTING | INTERPRETIVE | Athlete recomposition literature is the closest existing content to this specific reconciliation case | Upstream | MODERATE |

**DEC-004** (goal/timeframe safety flag)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-04 | CORE | SAFETY | Definitions/prevalence framing needed to judge whether a stated goal implies an extreme trajectory | Upstream | MODERATE |
| BODY-06 | CORE | SAFETY | Underweight/unintentional-loss/cachexia content is the direct counterpart when a goal combined with profile suggests an already-low-weight trajectory | Upstream | MODERATE |
| CLIN-20 | SUPPORTING | SAFETY | Eating-disorder clinical characteristics inform recognition of a disordered-eating-adjacent goal framing | Upstream | MODERATE |

## Domain B — User Profile and Baseline

**DEC-005** (required-field list)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-02 | CORE | ASSESSMENT | Measurement-of-energy-expenditure content defines what inputs any energy-estimation method-class actually needs | Upstream | HIGH |
| ASSESS-01 | SUPPORTING | ASSESSMENT | General dietary-intake-assessment field requirements | Upstream | MODERATE |
| ASSESS-03 | SUPPORTING | ASSESSMENT | Anthropometric field requirements (height/weight/frame size) | Upstream | MODERATE |

**DEC-006** (profile sufficiency verdict)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| ASSESS-01 | CORE | ASSESSMENT | Directly the discipline of judging whether collected intake/profile data is adequate | Upstream | HIGH |
| ASSESS-05 | SUPPORTING | ASSESSMENT | Nutrition Care Process's own screening/assessment-sufficiency framing | Upstream | MODERATE |

**DEC-007** (prioritize missing fields) — ASSESS-01, SUPPORTING, ASSESSMENT, "General assessment-methodology framing of which fields carry the most diagnostic value," Upstream, MODERATE.

**DEC-008** (refusal handling) — ASSESS-01, CONTEXTUAL, ASSESSMENT, "General assessment-methodology framing of handling incomplete intake data," Upstream, MODERATE.

**DEC-009** (profile plausibility check)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| ASSESS-01 | CORE | ASSESSMENT/EVIDENCE-METHODS | Measurement-error-in-intake-data subtopic is the direct conceptual basis for judging implausibility | Upstream | HIGH |
| ASSESS-03 | SUPPORTING | ASSESSMENT | Anthropometric plausibility bounds (height/weight/BMI interpretation) | Upstream | MODERATE |

**DEC-010** (profile conflict resolution) — ASSESS-01, CORE, ASSESSMENT, "Same measurement-error/reliability framing applied to conflicting rather than merely implausible values," Upstream, MODERATE.

**DEC-011** (staleness trigger) — ASSESS-01, CONTEXTUAL, ASSESSMENT, "General assessment-currency framing," Upstream, LOW (this decision is mostly a UX/governance timer, minimal science content).

## Domain C — Safety, Scope and Escalation

**DEC-012** (scope boundary)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| CLIN-01 | CORE | SAFETY | The Nutrition Care Process's own scope/referral framing defines what "in scope for automated MNT-adjacent guidance" even means | Upstream | HIGH |
| LIFE-01 | CORE | SAFETY | Pregnancy/lactation is a paradigm out-of-automated-scope condition; its physiologic-change content is what makes it one | Upstream | HIGH |
| LIFE-02 | SUPPORTING | SAFETY | Infancy's distinct physiologic requirements are the pediatric counterpart scope trigger | Upstream | MODERATE |

**DEC-013** (red-flag symptom list)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| CLIN-20 | CORE | SAFETY | Eating-disorder clinical characteristics are the direct content defining this red-flag category | Upstream | HIGH |
| SPORT-10 | CORE | SAFETY | Female Athlete Triad/RED-S/LEA content is the direct content defining the athlete-specific red-flag category | Upstream | HIGH |

**DEC-014** (withhold-prescription boundary) — CLIN-01, SUPPORTING, SAFETY, "General MNT/NCP framing of when professional judgment supersedes automated guidance," Upstream, MODERATE (this decision is largely an application/liability boundary; direct science content is thin — noted for §16).

**DEC-015** (clinician coordination) — CLIN-01, SUPPORTING, SAFETY/CONTEXTUAL, "NCP framing of how care coordinates across providers," Upstream, LOW (mostly a workflow decision).

**DEC-016** (ongoing escalation monitoring)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| CLIN-20 | SUPPORTING | SAFETY | Same content as DEC-013, applied longitudinally rather than at a single check | Monitoring/ongoing | MODERATE |
| SPORT-10 | SUPPORTING | SAFETY | Same | Monitoring/ongoing | MODERATE |

## Domain D — Energy

**DEC-017** (baseline sufficiency for energy estimate) — BODY-02, CORE, ASSESSMENT, "Measurement-of-Energy-Expenditure topic literally defines what inputs an estimate needs before it can be attempted," Upstream/Scientific Estimation, HIGH.

**DEC-018** (method-class selection)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-02 (esp. BODY-02.01–.03) | CORE | MECHANISTIC/PRESCRIPTIVE | Direct/indirect calorimetry and prediction-equation subtopics are literally the method-class options being chosen between (without selecting one) | Scientific Estimation | HIGH |

**DEC-019** (initial TEE estimate incorporating activity)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-02 | CORE | MECHANISTIC | TEE synthesis method | Scientific Estimation | HIGH |
| SPORT-01 | CORE | MECHANISTIC | Bioenergetics-of-exercise content is what translates disclosed activity into an expenditure add-on | Scientific Estimation | HIGH |
| SPORT-02 | SUPPORTING | MECHANISTIC | Fuel-source/fiber-type nuance refines the activity-expenditure translation | Scientific Estimation | MODERATE |
| LIP-06 | SUPPORTING | MECHANISTIC | Fat-as-fuel-during-exercise content refines endurance-activity expenditure estimation specifically | Scientific Estimation | LOW |

**DEC-020** (sufficiency for individualization)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-01 | CORE | MECHANISTIC | Energy-balance concept defines what "enough signal of true maintenance" structurally means | Individualization gate | HIGH |
| ASSESS-01 | CORE | EVIDENCE/METHODS | Measurement-error content determines whether logged intake/weight data is trustworthy enough to use | Individualization gate | HIGH |

**DEC-021** (individualized-estimate reconciliation)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-01 | CORE | MECHANISTIC/INTERPRETIVE | Energy-balance regulation explains why the intake/weight relationship behaves as observed, which is what reconciliation is actually reasoning about | Individualization | HIGH |
| ASSESS-01 | CORE | EVIDENCE/METHODS | Weighing model vs. observed data requires understanding the measurement-error bounds on the observed side | Individualization | HIGH |
| RESEARCH-02 | SUPPORTING | EVIDENCE/METHODS | Confounding concepts (from population-study design) are the closest existing framing for "is this individual's apparent signal real or confounded" | Individualization | MODERATE |

**DEC-022** (energy prescription)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-01 | CORE | PRESCRIPTIVE | Energy-balance concept is the direct basis for translating a maintenance figure into a surplus/deficit/maintenance prescription | Prescription | HIGH |
| BODY-05 | CORE | PRESCRIPTIVE | Weight-management treatment-approaches content is directly what/how-to-prescribe-for-weight-change-goals | Prescription | HIGH |
| BODY-04 | SUPPORTING | PRESCRIPTIVE | Obesity/energy-balance-dysregulation framing, when the goal is loss | Prescription | MODERATE |

*Current Evidence Dependency:* existing-corpus + current evidence — contemporary weight-management
standards intersect this decision directly (matches the inventory's own `POSSIBLY` flag on DEC-022).

**DEC-023** (recompute triggers) — BODY-02, CONTEXTUAL, MECHANISTIC, "General EE-measurement framing of when a re-estimate becomes warranted," Monitoring/governance, LOW.

**DEC-024** (energy confidence communication)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| ASSESS-01 | CORE | EVIDENCE/METHODS | Measurement-error framing is the direct basis for a confidence statement | Cross-cutting | HIGH |
| RESEARCH-04 | SUPPORTING | EVIDENCE/METHODS | NRM's parallel research-methods framing of the same dietary-assessment-methodology concept | Cross-cutting | MODERATE |

## Domain E — Weight and Body Composition

**DEC-025** (metric set selection) — BODY-03, CORE, ASSESSMENT, "Body-composition models/measurement-technique content directly determines what can even be tracked (skinfolds, BIA, DEXA, etc.)," Upstream, HIGH.

**DEC-026** (trend vs. noise interpretation)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-01 | CORE | MECHANISTIC/INTERPRETIVE | Energy-balance/weight-regulation content explains normal fluctuation sources (glycogen/water shifts) that must be distinguished from a real trend | Interpretation | HIGH |
| BODY-03 | SUPPORTING | ASSESSMENT | Measurement-technique-specific noise characteristics (e.g. BIA day-to-day variability) | Interpretation | MODERATE |
| ASSESS-03 | SUPPORTING | ASSESSMENT | General anthropometric measurement-reliability framing | Interpretation | MODERATE |

**DEC-027** (target rate/direction)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-04 | CORE | PRESCRIPTIVE | Obesity/weight-management framing is the direct content for rate/direction-of-change reasoning | Target Setting | MODERATE |
| BODY-05 | CORE | PRESCRIPTIVE | Weight-management treatment-approaches content directly addresses pacing considerations | Target Setting | MODERATE |

*Current Evidence Dependency:* **current-evidence-primary** — "target rates of weight change" is named
verbatim in the governing brief's own current-evidence example list; the 7-book corpus provides
conceptual grounding only, not a defensible current rate.

**DEC-028** (reassessment trigger from trend) — BODY-01, SUPPORTING, INTERPRETIVE, "General energy-balance framing of when a sustained trend implies the prescription itself is off," Monitoring, MODERATE.

**DEC-029** (missing weigh-in confidence) — ASSESS-01, CORE, EVIDENCE/METHODS, "Measurement-error/reliability framing generalizes directly to weigh-in irregularity," Interpretation, HIGH.

**DEC-030** (recomposition-specific monitoring routing)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-03 | CORE | ASSESSMENT | Body-composition measurement techniques are precisely what recomposition monitoring needs beyond scale weight | Upstream routing | MODERATE |
| BODY-07 | SUPPORTING | CONTEXTUAL | Athlete recomposition literature | Upstream routing | LOW |

*Current Evidence Dependency:* existing-corpus + current evidence — device-based body-composition
tracking accuracy and recomposition interpretation norms are evolving (matches inventory's `POSSIBLY`).

## Domain F — Macronutrients

**DEC-031** (protein requirement)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| PRO-04 (esp. PRO-04.02) | CORE | PRESCRIPTIVE | Protein Requirements topic, including its exercise/athlete subtopic, is directly the requirement-determination science | Target Setting | HIGH |
| PRO-03 | SUPPORTING | MECHANISTIC | Protein/amino-acid metabolism explains why the requirement varies as it does | Target Setting | MODERATE |
| PRO-05 | CONTEXTUAL | SAFETY | Protein-energy malnutrition content is the boundary case informing why an inadequate protein target is unsafe | Target Setting | LOW |

**DEC-032** (training-load protein adjustment)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| PRO-04 (esp. PRO-04.02) | CORE | PRESCRIPTIVE | Direct athlete-protein-requirement content | Target Setting | HIGH |
| PRO-06 | CORE | MECHANISTIC/PRESCRIPTIVE | Training-adaptation/MPS content directly explains the training-driven adjustment mechanism | Target Setting | HIGH |

**DEC-033** (distribute protein across occasions) — PRO-06, CORE, APPLICATION/TRANSLATION, "Muscle-protein-synthesis-per-meal distribution literature is the direct content for occasion-level allocation," Translation, HIGH.

**DEC-034** (carbohydrate requirement)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| CHO-04 | CORE | PRESCRIPTIVE | Dietary carbohydrate recommendations/intake-pattern content is the direct requirement-determination science | Target Setting | HIGH |
| CHO-05 | SUPPORTING | PRESCRIPTIVE | Carbohydrate-and-exercise-performance content, when training is present | Target Setting | MODERATE |

**DEC-035** (carb timing adjustment around exercise) — CHO-05 (esp. CHO-05.01–.04), CORE, APPLICATION/TRANSLATION, "The pre-/during-/post-exercise and periodized-carbohydrate subtopics are literally this decision's content," Translation, HIGH.

**DEC-036** (fat requirement/remainder)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| LIP-05 | CORE | PRESCRIPTIVE | Dietary fat recommendations is the direct requirement-determination science | Target Setting | HIGH |
| LIP-03 | CONTEXTUAL | MECHANISTIC | Fat metabolism/storage content provides background for why a fat-intake floor matters even as an energy-budget "remainder" | Target Setting | LOW |

**DEC-037** (fiber target) — CHO-04 (fiber/intake-patterns subtopic only), CORE, PRESCRIPTIVE, "The only existing home for fiber-requirement content — a subsection, not a dedicated topic," Target Setting, LOW (matches the inventory's own flagged thinness — see §16).

**DEC-038** (dietary-pattern override) — NUT-03 (esp. NUT-03.03 Named Dietary Patterns), CORE, APPLICATION, "Named-dietary-pattern content (vegan, keto, Mediterranean, etc.) is directly what determines how a pattern overrides default macro allocation," Target Setting, HIGH.

**DEC-039** (macro adjust on observed data)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| PRO-04, CHO-04, LIP-05 | CONTEXTUAL | PRESCRIPTIVE | Same requirement-science reapplied, but the *adjustment logic itself* is application-level, not curriculum content | Adjustment | **NEEDS CONTENT REVIEW** |

**DEC-040** (macro conflict resolution) — NUT-03, SUPPORTING, INTERPRETIVE, "Dietary-pattern content frames what the conflicting constraint actually is," Target Setting, MODERATE; PRO-04, CONTEXTUAL, PRESCRIPTIVE, "Protein-requirement content is typically the constraint being protected in the conflict," Target Setting, LOW.

---

## Domain G — Micronutrients

**DEC-041** (adequacy interpretation given pattern)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| VIT-03 | CORE | ASSESSMENT | Vitamin requirements/reference-intakes/status-assessment content is directly the adequacy-judgment science | Interpretation | HIGH |
| MIN-03 | CORE | ASSESSMENT | Same, for minerals | Interpretation | HIGH |
| NUT-03 | SUPPORTING | CONTEXTUAL | Dietary-pattern content defines what's being screened against | Interpretation | MODERATE |
| ASSESS-02 | CONTEXTUAL | ASSESSMENT | Biochemical/lab assessment would clinically confirm a status the app cannot itself measure — relevant only if the app ever ingests lab data | Interpretation | LOW (future-feature caveat) |

**DEC-042** (deficiency-risk flag)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| VIT-01 | CORE | MECHANISTIC | Fat-soluble-vitamin content explains *why* a given pattern creates risk for a specific vitamin | Interpretation | HIGH |
| VIT-02 | CORE | MECHANISTIC | Same, water-soluble vitamins | Interpretation | HIGH |
| MIN-01 | CORE | MECHANISTIC | Same, macrominerals | Interpretation | HIGH |
| MIN-02 | CORE | MECHANISTIC | Same, trace elements | Interpretation | HIGH |

**DEC-043** (food-source translation)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| NUT-04 | CORE | APPLICATION | Food-composition-data content is directly what translates a risk flag into food-source guidance | Translation | HIGH |
| VIT-01, VIT-02, MIN-01, MIN-02 | SUPPORTING | APPLICATION | Each nutrient's own dietary-sources content | Translation | MODERATE |
| DRV-05 | REFERENCE | APPLICATION | KM16's individual-nutrient fact-sheet appendices are consulted, not reasoned about | Translation | MODERATE |

**DEC-044** (supplementation consideration) — SPECIAL-02, CORE, SAFETY/APPLICATION, "Complementary/Integrative Medicine & Dietary Supplements content directly covers supplement-use assessment, regulation, and quality issues," Translation/Safety, HIGH. *Current Evidence Dependency:* existing-corpus + current evidence (supplement safety guidance benefits from staying current, per inventory's `POSSIBLY`).

**DEC-045** (population-specific micronutrient screening)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| VIT-04 | CORE | APPLICATION | Vitamins-in-athletic-performance content, when the athlete flag is active | Interpretation | HIGH |
| MIN-04 | CORE | APPLICATION | Minerals-in-athletic-performance content, same trigger | Interpretation | HIGH |
| LIFE-01 | CORE | APPLICATION | Pregnancy/lactation-specific nutrient-requirement content | Interpretation | HIGH |

---

## Domain H — Fluid and Hydration

**DEC-046** (baseline fluid needs) — FLU-01, CORE, MECHANISTIC, "Body-water distribution/balance content is the direct basis for a baseline estimate," Scientific Estimation, HIGH.

**DEC-047** (exercise fluid adjustment) — FLU-04, CORE, APPLICATION, "Hydration/fluid-balance-in-exercise content is directly this decision's subject," Translation, HIGH.

**DEC-048** (environment fluid/electrolyte adjustment)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| FLU-04 | CORE | APPLICATION | Same exercise-hydration content, environment-adjusted | Translation | HIGH |
| SPORT-07 | CORE | APPLICATION | Travel/altitude/heat content directly covers environmental hydration modifiers | Translation | HIGH |

**DEC-049** (replacement guidance translation)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| FLU-02 | CORE | MECHANISTIC | Electrolyte physiology is needed to translate sweat loss into replacement guidance, not just water volume | Translation | HIGH |
| FLU-04 | CORE | APPLICATION | Direct application content | Translation | HIGH |

**DEC-050** (fluid/electrolyte escalation boundary) — FLU-05, CORE, SAFETY, "Fluid/electrolyte and heat-related-disorders content literally covers hyponatremia/water-intoxication, the exact escalation trigger," Safety, HIGH.

---

## Domain I — Digestion and GI

**DEC-051** (GI symptom capture/adjustment)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| GI-04 | CORE | APPLICATION | GI-function-and-symptoms-during-exercise content is directly this decision's subject | Translation | HIGH |
| GI-01 | CONTEXTUAL | MECHANISTIC | General GI anatomy/regulation content helps interpret which symptom maps to which mechanism | Translation | LOW |

**DEC-052** (GI escalation boundary) — GI-05 (cross-referencing CLIN-04/CLIN-05), CORE, SAFETY, "Upper/Lower GI disorder content is the actual clinical-escalation-relevant material behind this boundary," Safety, HIGH.

**DEC-053** (intolerance vs. allergy classification) — CLIN-03, CORE, SAFETY/ASSESSMENT, "Food Allergies and Intolerances content is literally this decision's subject," Safety, HIGH.

**DEC-054** (GI adaptation over time)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| GI-04 | CORE | INTERPRETIVE | Same GI-during-exercise content, applied longitudinally | Interpretation | MODERATE |
| SPORT-12 | SUPPORTING | CONTEXTUAL | Athlete GI/health/injury-issues content | Interpretation | MODERATE |

---

## Domain J — Meal Structure and Timing

**DEC-055** (occasion count/structure)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| SPORT-13 | CORE | APPLICATION | Diet-planning-for-athletes content is the direct meal-structure-planning material | Translation | MODERATE |
| SPORT-03 | SUPPORTING | APPLICATION | Nutrient/fluid-timing content, when training is present | Translation | MODERATE |

**DEC-056** (distribute targets across occasions) — SPORT-03, CORE, APPLICATION/TRANSLATION, "Nutrient/fluid-timing content is directly the occasion-distribution material," Translation, HIGH.

**DEC-057** (pre/during/post-exercise timing) — SPORT-03, CORE, APPLICATION/TRANSLATION, "This decision's content is close to a direct restatement of SPORT-03's own subject matter," Translation, HIGH.

**DEC-058** (hunger/satiety-driven structure change) — BODY-01, CORE, MECHANISTIC, "Appetite-regulation content is folded into the energy-intake-regulation subsection of energy balance; no dedicated appetite topic exists separately," Interpretation, **MAPPING UNCERTAIN** (thin — see §16).

**DEC-059** (practical constraint override)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| SPECIAL-04 | CORE | CONTEXTUAL | Cultural-competency-in-nutrition-care content directly addresses this decision's cultural-constraint half | Translation | HIGH |
| NUT-03 | SUPPORTING | CONTEXTUAL | Dietary-pattern content addresses the schedule/access half less directly | Translation | LOW |

---

## Domain K — Food Selection

**DEC-060** (target→candidate-food translation boundary)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| NUT-02 | CORE | MECHANISTIC | Nutrient classification/core-functions content is needed to know which foods deliver which nutrients at all | Translation | HIGH |
| NUT-04 | CORE | APPLICATION | Food-composition-data content is the direct translation mechanism | Translation | HIGH |

**DEC-061** (restriction/allergy filter)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| CLIN-03 | CORE | SAFETY | Allergy/intolerance content directly determines hard-exclusion logic | Translation | HIGH |
| NUT-03 | CORE | APPLICATION | Dietary-pattern-restriction content directly determines soft-preference filtering | Translation | HIGH |

**DEC-062** (nutrient-density ranking) — NUT-04, CORE, APPLICATION, "Food-composition-data content is where the nutrient-density concept itself lives," Translation, HIGH; NUT-02, SUPPORTING, MECHANISTIC, "General nutrient-classification background," Translation, MODERATE.

**DEC-063** (substitution generation) — NUT-04, CORE, APPLICATION, "Food-composition data is required to confirm a substitute preserves the original nutrient contribution," Translation, HIGH.

**DEC-064** (cost/convenience/cultural weighting)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| SPECIAL-04 | CORE | CONTEXTUAL | Cultural-competency content directly addresses the cultural half | Translation | HIGH |
| PUBHEALTH-04 | SUPPORTING | CONTEXTUAL | Food-assistance/nutrition-programs content provides the cost/access-context half | Translation | MODERATE |

**DEC-065** (pantry/grocery-app integration) — **NO TOPIC MAPPED.** This is a pure application/product-integration decision (this app's own household grocery/pantry tracking) with no counterpart anywhere in a nutrition-science corpus. Classified **APPLICATION TRANSLATION GAP** in §16, not forced into a mapping.

---

## Domain L — Meal Planning and Preparation

**DEC-066** (constructed-meal translation) — NUT-03, CORE, APPLICATION, "General healthy-eating-pattern/meal-guideline content is the nearest existing material to 'what a meal should look like,' though it stops well short of actual meal construction," Translation, **MAPPING UNCERTAIN** (see §16 — this is the edge of the Practical Translation Gap, directly confirmed absent by `APPARENT_CURRICULUM_GAPS.md` §1's "food science/culinary technique" finding).

**DEC-067** (preparation-detail level) — **NO TOPIC MAPPED.** Recipe/preparation-detail knowledge has no counterpart in any of the 7 books (`APPARENT_CURRICULUM_GAPS.md` §1, confirmed explicitly, not inferred). **APPLICATION TRANSLATION GAP.**

**DEC-068** (cooking-constraint accounting) — **NO TOPIC MAPPED.** Same gap as DEC-067. **APPLICATION TRANSLATION GAP.**

**DEC-069** (batching/storage) — **NO TOPIC MAPPED.** Same gap. **APPLICATION TRANSLATION GAP.**

**DEC-070** (meal-plan deviation handling) — NUT-03, CONTEXTUAL, APPLICATION, "General dietary-pattern-adherence framing," Translation, LOW; otherwise largely application-level logic — **APPLICATION TRANSLATION GAP** (partial).

---

## Domain M — Shopping

**DEC-071** (shopping-list generation) — **NO TOPIC MAPPED.** Consolidation/quantity logistics has no counterpart in any of the 7 books. **APPLICATION TRANSLATION GAP.**

**DEC-072** (pantry reconciliation) — **NO TOPIC MAPPED.** Same gap; this app's own specific integration point. **APPLICATION TRANSLATION GAP.**

**DEC-073** (budget-adjusted shopping) — PUBHEALTH-04, SUPPORTING, CONTEXTUAL, "Food-assistance/nutrition-programs content is the nearest existing material addressing cost-constrained food access," Translation, LOW. Otherwise **APPLICATION TRANSLATION GAP** (partial).

**DEC-074** (availability-adjusted shopping) — PUBHEALTH-05, CONTEXTUAL, SAFETY, "Food/water-safety content tangentially touches substitution-under-availability-constraint reasoning," Translation, LOW. Otherwise **APPLICATION TRANSLATION GAP** (partial).

**DEC-075** (shopping-frequency minimization) — **NO TOPIC MAPPED.** Pure logistics optimization. **APPLICATION TRANSLATION GAP.**

---

## Domain N — Monitoring

**DEC-076** (what/how often to log)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| ASSESS-01 | CORE | ASSESSMENT | Dietary-intake-assessment-methods content directly defines logging-methodology options | Monitoring | HIGH |
| ASSESS-05 | SUPPORTING | ASSESSMENT | NCP monitoring/evaluation framing | Monitoring | MODERATE |

**DEC-077** (logging-quality assessment)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| ASSESS-01 | CORE | EVIDENCE/METHODS | Measurement-error-in-dietary-intake-data subtopic is exactly this decision's subject | Monitoring | HIGH |
| RESEARCH-04 | CORE | EVIDENCE/METHODS | NRM's parallel research-methods framing of the identical dietary-assessment-methodology concept | Monitoring | HIGH |
| RESEARCH-06 | SUPPORTING | EVIDENCE/METHODS | Biomarkers-of-intake content is an alternate, objective check on self-report reliability | Monitoring | MODERATE |

**DEC-078** (adherence tracking) — ASSESS-01, CORE, ASSESSMENT/MONITORING, "General assessment-methodology framing of tracking engagement with a monitoring protocol," Monitoring, MODERATE.

**DEC-079** (missing-data handling)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| ASSESS-01 | CORE | EVIDENCE/METHODS | Same measurement-error framing, applied to absence rather than error | Monitoring | HIGH |
| RESEARCH-07 | SUPPORTING | EVIDENCE/METHODS | Statistical/data-analysis-methods content covers missing-data handling as a research-methods concept | Monitoring | MODERATE |

**DEC-080** (check-in/escalation trigger) — ASSESS-05, CORE, ASSESSMENT, "NCP monitoring/evaluation framing directly covers when a check-in is warranted," Monitoring, MODERATE.

---

## Domain O — Feedback and Adaptation

**DEC-081** (quantity/duration sufficiency gate)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| ASSESS-01 | CORE | EVIDENCE/METHODS | Assessment-methodology framing of how much data constitutes an adequate sample | Adjustment gate | HIGH |
| RESEARCH-02 | SUPPORTING | EVIDENCE/METHODS | Prospective-cohort/observational-design logic informs how much follow-up time reveals a real effect | Adjustment gate | MODERATE |

**DEC-082** (data-quality gate)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| ASSESS-01 | CORE | EVIDENCE/METHODS | Direct measurement-quality-judgment content | Adjustment gate | HIGH |
| RESEARCH-04 | SUPPORTING | EVIDENCE/METHODS | Parallel research-methods framing | Adjustment gate | MODERATE |

**DEC-083** (consistency interpretation)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-01 | CORE | MECHANISTIC/INTERPRETIVE | Energy-balance-regulation content explains why an observed response should or shouldn't match the prediction | Interpretation | HIGH |
| ASSESS-01 | SUPPORTING | EVIDENCE/METHODS | Data-quality context for the interpretation | Interpretation | MODERATE |

**DEC-084** (adjustment decision)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| BODY-01 | CORE | MECHANISTIC/PRESCRIPTIVE | Same regulation content, now used to decide the adjustment itself | Adjustment | HIGH |
| BODY-05 | SUPPORTING | PRESCRIPTIVE | Weight-management treatment-approaches content, re-applied at adjustment time | Adjustment | MODERATE |
| MET-08 | CONTEXTUAL | MECHANISTIC | Metabolic-adaptation-to-challenges content (incl. adaptive response to sustained restriction) helps explain why repeated adjustment cycles sometimes fail | Adjustment | LOW |

**DEC-085** (macro recompute trigger) — PRO-04, CHO-04, LIP-05, all CONTEXTUAL, PRESCRIPTIVE, "Same requirement science reapplied at recompute time; the recompute-trigger logic itself is application-level," Adjustment, **NEEDS CONTENT REVIEW** (same gap as DEC-039).

**DEC-086** (meal/food regeneration trigger) — **NO INDEPENDENT TOPIC**; reuses DEC-060/DEC-066's mapping when it fires. Application-level trigger logic.

**DEC-087** (wait-vs-adjust decision)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| RESEARCH-02 | CORE | EVIDENCE/METHODS | Confounding/observational-design logic is literally the "is this signal real yet" reasoning | Adjustment gate | HIGH |
| ASSESS-01 | CORE | EVIDENCE/METHODS | Data-quality framing | Adjustment gate | HIGH |

**DEC-088** (full-reassessment trigger) — ASSESS-05, CORE, ASSESSMENT, "NCP re-assessment framing is directly this decision's subject," Adjustment, HIGH.

**DEC-089** (adjustment notification) — SPECIAL-03, CORE, CONTEXTUAL/TRANSLATION, "Nutrition Counseling and Behavioral Change content directly covers how to communicate a plan change effectively," Translation, HIGH.

**DEC-090** (circuit-breaker/escalation) — CLIN-01, CORE, SAFETY, "The Nutrition Care Process's own escalation/referral framing is directly this decision's subject," Safety, HIGH.

**DEC-091** (subjective-feedback integration) — SPECIAL-03, CORE, INTERPRETIVE/CONTEXTUAL, "Behavioral-change/counseling content covers integrating subjective readiness-to-change signals alongside objective data," Interpretation, HIGH.

---

## Domain P — Sport and Exercise

**DEC-092** (training data intake)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| SPORT-01 | CORE | MECHANISTIC | Bioenergetics-of-exercise content defines what training-intensity data physiologically means | Upstream (bridge) | HIGH |
| SPORT-02 | CORE | MECHANISTIC | Fuel-sources/fiber-types content | Upstream (bridge) | HIGH |

**DEC-093** (recreational vs. structured classification) — SPORT-04, CORE, CLASSIFICATION-support, "Sport-specific-strategies/athlete-type framing," Upstream, MODERATE; SPORT-13, SUPPORTING, CLASSIFICATION-support, "Diet-planning-for-athletes content," Upstream, LOW.

**DEC-094** (competition window) — CHO-05 (esp. CHO-05.01 pre-competition loading), CORE, APPLICATION, "Pre-competition carbohydrate-loading content is directly this decision's subject," Translation, HIGH; SPORT-04, SUPPORTING, APPLICATION, "Sport-specific strategy content," Translation, MODERATE.

**DEC-095** (RED-S/overtraining detection)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| SPORT-10 | CORE | SAFETY | Female Athlete Triad/RED-S/LEA content is the exact topic for this detection decision | Safety | HIGH |
| SPORT-06 | SUPPORTING | INTERPRETIVE | Training-adaptation content's overreaching/overtraining subsection | Safety | MODERATE |

*Current Evidence Dependency:* existing-corpus + current evidence — RED-S screening practice continues
to evolve; SN4's SPORT-10 treatment is the strongest available source but is itself single-book-sourced.

**DEC-096** (environment capture) — SPORT-07, CORE, APPLICATION, "Travel/altitude/heat content directly covers this decision's subject," Translation, HIGH.

**DEC-097** (supplement reconciliation)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| SPORT-05 | CORE | SAFETY/APPLICATION | Sports-supplements/ergogenic-aids content is directly this decision's subject | Safety/Translation | HIGH |
| SPECIAL-02 | SUPPORTING | SAFETY | General (non-sport) supplement regulation/quality-issue content | Safety | MODERATE |

*Current Evidence Dependency:* existing-corpus + current evidence (matches inventory's `POSSIBLY`); also
intersects the still-open Phase 2 AS3/ACSM/SN4 supplement-redundancy question (`PHASE_2_HUMAN_REVIEW.md`
item 10) — noted, not resolved.

**DEC-098** (female-athlete track)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| SPORT-09 | CORE | CONTEXTUAL | Athlete-specific-populations (age/sex) content | Upstream routing | MODERATE |
| SPORT-10 | CORE | SAFETY | Female Athlete Triad content, the primary risk this track exists to screen for | Safety | HIGH |
| SPORT-11 | CONTEXTUAL | CONTEXTUAL | Personalized/precision sport-nutrition content is the closest existing material to cycle-phase-specific nutrition, though the source TOC does not confirm that specific depth | Upstream routing | **MAPPING UNCERTAIN** |

*Current Evidence Dependency:* **current-evidence-primary** for the SPORT-11 link specifically —
matches Phase 1's own flag (`PHASE_1_AMBIGUITY_AUDIT.md` item 8) that SPORT-11 needs a currency check
before curriculum use.

---

## Domain Q — Clinical and Special Populations

**DEC-099** (supported-conditions boundary)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| CLIN-01 | CORE | SAFETY | The Nutrition Care Process itself defines what "MNT-adjacent automated support" means and where it stops | Upstream (bridge) | HIGH |
| CLIN-07, CLIN-10, CLIN-12 | SUPPORTING | SAFETY | Diabetes, cardiovascular, and renal disease are the most common Layer-5 "general practice" disease areas per `CLINICAL_NUTRITION_ARCHITECTURE.md`, representative of what a supported-conditions list would plausibly include first | Upstream (bridge) | MODERATE |

*Note:* per `CLINICAL_NUTRITION_ARCHITECTURE.md`'s Layer 5/Layer 6 split, the 23 general Layer-5 topics
are the more plausible "supported" candidates and the 10 Layer-6 SPECIALIZED topics the more plausible
"defer" candidates — see §17's clinical-mapping observation for the full 27-topic treatment; this
document does not adopt that curriculum framing as the application's actual boundary, only notes the
parallel (matching the inventory's own DEC-099 note).

**DEC-100** (clinical condition modifies upstream decisions)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| CLIN-07 | CORE | PRESCRIPTIVE | Diabetes MNT content directly modifies carbohydrate/macro decisions (DEC-034 etc.) | Bridge into Target Setting | HIGH |
| CLIN-10 | CORE | PRESCRIPTIVE | Cardiovascular MNT content directly modifies fat/sodium-relevant decisions (DEC-036 etc.) | Bridge into Target Setting | HIGH |
| CLIN-12 | CORE | PRESCRIPTIVE | Renal MNT content directly modifies protein/electrolyte-relevant decisions (DEC-031, DEC-041) | Bridge into Target Setting | HIGH |
| CLIN-24 | SUPPORTING | PRESCRIPTIVE | Bone-health content modifies calcium/vitamin-D-relevant micronutrient decisions (DEC-041/042) | Bridge into Target Setting | MODERATE |
| MET-10 | SUPPORTING | MECHANISTIC | Diabetes-as-regulatory-disorder content provides the biochemical "why" underneath CLIN-07's clinical application | Bridge | LOW |

**DEC-101** (goal-conflict resolution) — CLIN-01, CORE, INTERPRETIVE, "General MNT/NCP framing of reconciling patient goals against clinical necessity," Interpretation, MODERATE.

**DEC-102** (specialized-pathway routing) — CLIN-01, CORE, CLASSIFICATION-support, "NCP framing of when a condition needs dedicated specialized management vs. an adjustment to standard care," Upstream routing, MODERATE.

---

## Domain R — Life Stages

**DEC-103** (life-stage assignment) — LIFE-01 through LIFE-06 (collectively), CORE, CLASSIFICATION-support, "The six life-stage topics collectively define the taxonomy this decision assigns a user into," Upstream, HIGH.

**DEC-104** (life-stage default adjustment)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| LIFE-01 | CORE | PRESCRIPTIVE | Pregnancy/lactation nutrient-requirement content is the clearest, most consequential example of a life-stage default override | Target Setting | HIGH |
| LIFE-02, LIFE-03, LIFE-04 | SUPPORTING | PRESCRIPTIVE | Infancy/childhood/adolescence nutrient-requirement content | Target Setting | MODERATE |
| LIFE-06 | SUPPORTING | PRESCRIPTIVE | Older-adult nutrient-requirement/physiologic-change content | Target Setting | MODERATE |
| LIFE-05 | CONTEXTUAL | CONTEXTUAL | Adulthood content — the "no special flag" default case; thin by design (see §16) | Target Setting | LOW |

**DEC-105** (mid-use life-stage transition) — LIFE-01, CORE, SAFETY/CLASSIFICATION, "Pregnancy onset is the paradigm mid-use transition case, directly triggering both a life-stage reassignment and a safety-scope re-check," Monitoring, HIGH.

---

## Domain S — Public Health and Food Environment

**DEC-106** (food-access/affordability constraints) — PUBHEALTH-04, CORE, CONTEXTUAL, "Food-assistance/nutrition-programs content is the direct existing material on access/affordability constraints," Translation, MODERATE.

**DEC-107** (align to external food guide)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| PUBHEALTH-03 | CORE | CONTEXTUAL | National-nutrition-guidelines/food-guide content is directly this decision's subject | Governance | HIGH |
| DRV-01 | CORE | MECHANISTIC | DRI methodology is needed to understand what an external guide's numeric targets actually mean | Governance | HIGH |

*Current Evidence Dependency:* existing-corpus + current evidence — named external guides are
periodically revised (matches inventory's `POSSIBLY`).

---

## Domain T — Evidence, Uncertainty and Data Quality

**DEC-108** (evidence-currency flagging mechanism) — RESEARCH-01, CORE, EVIDENCE/METHODS, "Nature/Purpose-of-Nutrition-Research content is the 'how do we know what we know' framing this mechanism operationalizes," Governance, HIGH.

**DEC-109** (general conflict detection)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| ASSESS-01 | CORE | EVIDENCE/METHODS | Generalizes the profile-specific plausibility/measurement-error framing to all collected data | Cross-cutting | HIGH |
| RESEARCH-07 | SUPPORTING | EVIDENCE/METHODS | Statistical/data-analysis-methods content | Cross-cutting | MODERATE |

**DEC-110** (model/observation mismatch)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| RESEARCH-02 | CORE | EVIDENCE/METHODS | Confounding is precisely the concept needed to reason about "both signals look good-quality but disagree" | Cross-cutting | HIGH |
| BODY-01 | CORE | MECHANISTIC | Energy-balance-regulation content, since the mismatch is usually framed in energy-balance terms | Cross-cutting | HIGH |
| ASSESS-01 | CORE | EVIDENCE/METHODS | Data-quality-judgment content on the observation side of the mismatch | Cross-cutting | HIGH |

**DEC-111** (evidence-review governance process) — RESEARCH-15, CORE, EVIDENCE/METHODS, "Translation-of-Nutrition-Research-into-Practice/Policy is the closest available topic, though framed around public-health/policy translation rather than a single application's internal governance — mapping noted as approximate," Governance, **MAPPING UNCERTAIN**. RESEARCH-03, CONTEXTUAL, EVIDENCE/METHODS, "Intervention-study-design literacy underlies judging whether new evidence surfacing in a periodic review is itself trustworthy," Governance, LOW.

**DEC-112** (confidence-communication convention)
| Topic | Strength | Role | Why Required | Context | Confidence |
|---|---|---|---|---|---|
| RESEARCH-04 | CORE | EVIDENCE/METHODS | Direct dietary-assessment-methodology/measurement-validity framing | Cross-cutting | HIGH |
| ASSESS-01 | SUPPORTING | EVIDENCE/METHODS | Same concept from the clinical-assessment side | Cross-cutting | MODERATE |
| RESEARCH-08 | CONTEXTUAL | EVIDENCE/METHODS | Population-diversity-in-research content flags demographic-generalizability uncertainty the corpus itself carries | Cross-cutting | LOW |

**Section 5 totals:** 112 of 112 decisions addressed; 8 decisions (`DEC-065, 067, 068, 069, 071, 072,
075`, plus partial gaps on `070, 073, 074`) carry no meaningful CORE/SUPPORTING topic mapping and are
recorded as **APPLICATION TRANSLATION GAP** rather than forced; 2 decisions (`DEC-039, 085`) are
flagged **NEEDS CONTENT REVIEW** matching the inventory's own `UNKNOWN / NEEDS CONTENT REVIEW` topic
field; 3 decisions (`DEC-058, 066, 098`'s SPORT-11 link, `111`) carry a **MAPPING UNCERTAIN** flag on at
least one relationship.

---

# 6. Complete Decision Coverage Table

Every one of the 112 `DEC` IDs, exactly once. Derived directly from §5.

| DEC | Core | Supporting | Contextual | Reference | Potential Missing Knowledge | Mapping Confidence | Current Evidence Dependency |
|---|---|---|---|---|---|---|---|
| 001 | BODY-01 | BODY-04, BODY-05, BODY-07 | — | — | — | MODERATE | existing-corpus |
| 002 | NUT-01 | — | — | — | — | MODERATE | existing-corpus |
| 003 | BODY-01 | BODY-07 | — | — | Recomposition physiology thin | MODERATE | existing-corpus + current evidence |
| 004 | BODY-04, BODY-06 | CLIN-20 | — | — | — | MODERATE | existing-corpus + current evidence |
| 005 | BODY-02 | ASSESS-01, ASSESS-03 | — | — | — | HIGH | existing-corpus |
| 006 | ASSESS-01 | ASSESS-05 | — | — | — | HIGH | existing-corpus |
| 007 | — | ASSESS-01 | — | — | — | MODERATE | existing-corpus |
| 008 | — | — | ASSESS-01 | — | — | MODERATE | existing-corpus |
| 009 | ASSESS-01 | ASSESS-03 | — | — | — | HIGH | existing-corpus |
| 010 | ASSESS-01 | — | — | — | — | MODERATE | existing-corpus |
| 011 | — | — | ASSESS-01 | — | — | LOW | existing-corpus |
| 012 | CLIN-01, LIFE-01 | LIFE-02 | — | — | Exact out-of-scope condition list undetermined | HIGH | existing-corpus + current evidence |
| 013 | CLIN-20, SPORT-10 | — | — | — | — | HIGH | existing-corpus + current evidence |
| 014 | — | CLIN-01 | — | — | Thin — largely a liability/application boundary | MODERATE | existing-corpus |
| 015 | — | CLIN-01 | — | — | — | LOW | existing-corpus |
| 016 | — | CLIN-20, SPORT-10 | — | — | — | MODERATE | existing-corpus + current evidence |
| 017 | BODY-02 | — | — | — | — | HIGH | existing-corpus |
| 018 | BODY-02 (.01–.03) | — | — | — | — | HIGH | existing-corpus |
| 019 | BODY-02, SPORT-01 | SPORT-02, LIP-06 | — | — | — | HIGH | existing-corpus |
| 020 | BODY-01, ASSESS-01 | — | — | — | — | HIGH | existing-corpus |
| 021 | BODY-01, ASSESS-01 | RESEARCH-02 | — | — | — | HIGH | existing-corpus |
| 022 | BODY-01, BODY-05 | BODY-04 | — | — | — | HIGH | existing-corpus + current evidence |
| 023 | — | — | BODY-02 | — | — | LOW | existing-corpus |
| 024 | ASSESS-01 | RESEARCH-04 | — | — | — | HIGH | existing-corpus |
| 025 | BODY-03 | — | — | — | — | HIGH | existing-corpus |
| 026 | BODY-01 | BODY-03, ASSESS-03 | — | — | — | HIGH | existing-corpus |
| 027 | BODY-04, BODY-05 | — | — | — | Acceptable target rate itself not in corpus | MODERATE | **current-evidence-primary** |
| 028 | — | BODY-01 | — | — | — | MODERATE | existing-corpus |
| 029 | ASSESS-01 | — | — | — | — | HIGH | existing-corpus |
| 030 | BODY-03 | BODY-07 | — | — | — | MODERATE | existing-corpus + current evidence |
| 031 | PRO-04 (.02) | PRO-03 | PRO-05 | — | — | HIGH | existing-corpus |
| 032 | PRO-04 (.02), PRO-06 | — | — | — | — | HIGH | existing-corpus |
| 033 | PRO-06 | — | — | — | — | HIGH | existing-corpus |
| 034 | CHO-04 | CHO-05 | — | — | — | HIGH | existing-corpus |
| 035 | CHO-05 (.01–.04) | — | — | — | — | HIGH | existing-corpus |
| 036 | LIP-05 | — | LIP-03 | — | — | HIGH | existing-corpus |
| 037 | CHO-04 (fiber subsection) | — | — | — | No dedicated fiber topic ID | LOW | existing-corpus |
| 038 | NUT-03 (.03) | — | — | — | — | HIGH | existing-corpus |
| 039 | — | PRO-04, CHO-04, LIP-05 | — | — | Adjustment-trigger logic itself uncovered | **NEEDS CONTENT REVIEW** | existing-corpus |
| 040 | — | NUT-03 | PRO-04 | — | — | MODERATE | existing-corpus |
| 041 | VIT-03, MIN-03 | NUT-03 | ASSESS-02 | — | — | HIGH | existing-corpus |
| 042 | VIT-01, VIT-02, MIN-01, MIN-02 | — | — | — | — | HIGH | existing-corpus |
| 043 | NUT-04 | VIT-01/02, MIN-01/02 | — | DRV-05 | — | HIGH | existing-corpus |
| 044 | SPECIAL-02 | — | — | — | — | HIGH | existing-corpus + current evidence |
| 045 | VIT-04, MIN-04, LIFE-01 | — | — | — | — | HIGH | existing-corpus |
| 046 | FLU-01 | — | — | — | — | HIGH | existing-corpus |
| 047 | FLU-04 | — | — | — | — | HIGH | existing-corpus |
| 048 | FLU-04, SPORT-07 | — | — | — | — | HIGH | existing-corpus |
| 049 | FLU-02, FLU-04 | — | — | — | — | HIGH | existing-corpus |
| 050 | FLU-05 | — | — | — | — | HIGH | existing-corpus |
| 051 | GI-04 | — | GI-01 | — | — | HIGH | existing-corpus |
| 052 | GI-05 (→CLIN-04/05) | — | — | — | — | HIGH | existing-corpus |
| 053 | CLIN-03 | — | — | — | — | HIGH | existing-corpus |
| 054 | GI-04 | SPORT-12 | — | — | — | MODERATE | existing-corpus |
| 055 | SPORT-13 | SPORT-03 | — | — | — | MODERATE | existing-corpus |
| 056 | SPORT-03 | — | — | — | — | HIGH | existing-corpus |
| 057 | SPORT-03 | — | — | — | — | HIGH | existing-corpus |
| 058 | BODY-01 (appetite subsection) | — | — | — | Dedicated appetite-regulation topic thin | **MAPPING UNCERTAIN** | existing-corpus |
| 059 | SPECIAL-04 | NUT-03 | — | — | — | HIGH | existing-corpus |
| 060 | NUT-02, NUT-04 | — | — | — | — | HIGH | existing-corpus |
| 061 | CLIN-03, NUT-03 | — | — | — | — | HIGH | existing-corpus |
| 062 | NUT-04 | NUT-02 | — | — | — | HIGH | existing-corpus |
| 063 | NUT-04 | — | — | — | — | HIGH | existing-corpus |
| 064 | SPECIAL-04 | PUBHEALTH-04 | — | — | — | HIGH | existing-corpus |
| 065 | — | — | — | — | No topic in universe — product-integration decision | **APPLICATION TRANSLATION GAP** | n/a |
| 066 | NUT-03 | — | — | — | Meal-construction knowledge absent from all 7 books | **MAPPING UNCERTAIN** | n/a |
| 067 | — | — | — | — | Recipe/prep-detail knowledge absent from all 7 books | **APPLICATION TRANSLATION GAP** | n/a |
| 068 | — | — | — | — | Same gap | **APPLICATION TRANSLATION GAP** | n/a |
| 069 | — | — | — | — | Same gap | **APPLICATION TRANSLATION GAP** | n/a |
| 070 | — | — | NUT-03 | — | Deviation-handling logic mostly uncovered | **APPLICATION TRANSLATION GAP** (partial) | n/a |
| 071 | — | — | — | — | Shopping-logistics knowledge absent from all 7 books | **APPLICATION TRANSLATION GAP** | n/a |
| 072 | — | — | — | — | Same gap | **APPLICATION TRANSLATION GAP** | n/a |
| 073 | — | — | PUBHEALTH-04 | — | Partial gap | **APPLICATION TRANSLATION GAP** (partial) | n/a |
| 074 | — | — | PUBHEALTH-05 | — | Partial gap | **APPLICATION TRANSLATION GAP** (partial) | n/a |
| 075 | — | — | — | — | Pure logistics optimization | **APPLICATION TRANSLATION GAP** | n/a |
| 076 | ASSESS-01 | ASSESS-05 | — | — | — | HIGH | existing-corpus |
| 077 | ASSESS-01, RESEARCH-04 | RESEARCH-06 | — | — | — | HIGH | existing-corpus |
| 078 | ASSESS-01 | — | — | — | — | MODERATE | existing-corpus |
| 079 | ASSESS-01 | RESEARCH-07 | — | — | — | HIGH | existing-corpus |
| 080 | ASSESS-05 | — | — | — | — | MODERATE | existing-corpus |
| 081 | ASSESS-01 | RESEARCH-02 | — | — | — | HIGH | existing-corpus |
| 082 | ASSESS-01 | RESEARCH-04 | — | — | — | HIGH | existing-corpus |
| 083 | BODY-01 | ASSESS-01 | — | — | — | HIGH | existing-corpus |
| 084 | BODY-01 | BODY-05 | MET-08 | — | — | HIGH | existing-corpus |
| 085 | — | PRO-04, CHO-04, LIP-05 | — | — | Adjustment-trigger logic itself uncovered | **NEEDS CONTENT REVIEW** | existing-corpus |
| 086 | — | — | — | — | Reuses DEC-060/066 mapping when triggered | MODERATE | n/a |
| 087 | RESEARCH-02, ASSESS-01 | — | — | — | — | HIGH | existing-corpus |
| 088 | ASSESS-05 | — | — | — | — | HIGH | existing-corpus |
| 089 | SPECIAL-03 | — | — | — | — | HIGH | existing-corpus |
| 090 | CLIN-01 | — | — | — | — | HIGH | existing-corpus |
| 091 | SPECIAL-03 | — | — | — | — | HIGH | existing-corpus |
| 092 | SPORT-01, SPORT-02 | — | — | — | — | HIGH | existing-corpus |
| 093 | SPORT-04 | SPORT-13 | — | — | — | MODERATE | existing-corpus |
| 094 | CHO-05 (.01) | SPORT-04 | — | — | — | HIGH | existing-corpus |
| 095 | SPORT-10 | SPORT-06 | — | — | — | HIGH | existing-corpus + current evidence |
| 096 | SPORT-07 | — | — | — | — | HIGH | existing-corpus |
| 097 | SPORT-05 | SPECIAL-02 | — | — | — | HIGH | existing-corpus + current evidence |
| 098 | SPORT-09, SPORT-10 | — | SPORT-11 | — | Cycle-phase-specific depth unconfirmed | **MAPPING UNCERTAIN** | **current-evidence-primary** (SPORT-11 link) |
| 099 | CLIN-01 | CLIN-07, CLIN-10, CLIN-12 | — | — | Exact supported-conditions list undetermined | HIGH | existing-corpus + current evidence |
| 100 | CLIN-07, CLIN-10, CLIN-12 | CLIN-24, MET-10 | — | — | — | HIGH | existing-corpus + current evidence |
| 101 | CLIN-01 | — | — | — | — | MODERATE | existing-corpus |
| 102 | CLIN-01 | — | — | — | — | MODERATE | existing-corpus |
| 103 | LIFE-01–06 | — | — | — | — | HIGH | existing-corpus |
| 104 | LIFE-01 | LIFE-02, LIFE-03, LIFE-04, LIFE-06 | LIFE-05 | — | — | HIGH | existing-corpus |
| 105 | LIFE-01 | — | — | — | — | HIGH | existing-corpus |
| 106 | PUBHEALTH-04 | — | — | — | — | MODERATE | existing-corpus |
| 107 | PUBHEALTH-03, DRV-01 | — | — | — | — | HIGH | existing-corpus + current evidence |
| 108 | RESEARCH-01 | — | — | — | — | HIGH | existing-corpus |
| 109 | ASSESS-01 | RESEARCH-07 | — | — | — | HIGH | existing-corpus |
| 110 | RESEARCH-02, BODY-01, ASSESS-01 | — | — | — | — | HIGH | existing-corpus |
| 111 | RESEARCH-15 | — | RESEARCH-03 | — | Framed around policy translation, not app governance | **MAPPING UNCERTAIN** | existing-corpus |
| 112 | RESEARCH-04 | ASSESS-01 | RESEARCH-08 | — | — | HIGH | existing-corpus |

**112 of 112 DEC IDs appear exactly once above.**

---

# 7. Knowledge → Decision Mapping

The reverse direction, organized by the 18 Phase-1 domains — for each topic domain, which decisions
actually consume it, and at what strength. This is where knowledge hubs (§9), islands (§10), and the
"not every topic must power the app" pattern (§2/§10 of the governing brief) become visible.

**NUT** (Foundations of Nutrition) — NUT-01 (DEC-002, CONTEXTUAL); NUT-02 (DEC-060 CORE, DEC-062
SUPPORTING); NUT-03 (DEC-038 CORE; DEC-040, 041, 059, 061, 064, 066, 070 at SUPPORTING/CONTEXTUAL —
the single most cross-domain-utilized NUT topic, since dietary-pattern content touches macro override,
micronutrient interpretation, and food/meal translation alike); NUT-04 (DEC-043, 060, 062, 063 all
CORE — the food-composition-data hub for the entire Translation layer); NUT-05 — **no decision uses
it** (matches its own OPTIONAL/thin classification in `CANDIDATE_EXCLUSIONS.md`).

**DRV** (Dietary Reference Values) — DRV-01 (DEC-107, CORE); DRV-02/03/04/05 used only at `REFERENCE`
strength (DRV-05 → DEC-043), consistent with their own REFERENCE-ONLY classification in
`CANDIDATE_EXCLUSIONS.md` — these are consulted for numeric values once a later implementation phase
picks actual formulas, not reasoned about by any decision here.

**MET** (Energy and Metabolism biochemistry) — MET-08 (DEC-084, CONTEXTUAL); MET-10 (DEC-100,
SUPPORTING). The other 8 MET topics (MET-01, 02, 03, 04, 05, 06, 07, 09) have **no direct decision
dependency** — see §10, this is the single largest coherent knowledge island in the universe.

**CHO** (Carbohydrates) — CHO-04 (DEC-034, 037, 038-adjacent CORE — the requirement/pattern hub);
CHO-05 (DEC-035, 094 CORE; DEC-034 SUPPORTING — the timing/performance hub). CHO-01, 02, 03 have no
direct decision dependency (foundational chemistry/digestion/metabolism, below decision altitude).

**LIP** (Lipids) — LIP-05 (DEC-036, CORE); LIP-03 (DEC-036, CONTEXTUAL); LIP-06 (DEC-019, SUPPORTING);
LIP-04 not directly used (its cardiovascular-relevant content is reached indirectly via CLIN-10 at
DEC-100, not LIP-04 itself — noted as a candidate MODERATE-confidence addition, see §19 open questions).
LIP-01, 02 have no direct decision dependency.

**PRO** (Protein) — PRO-04 (DEC-031, 032, CORE — the requirement hub); PRO-06 (DEC-032, 033, CORE —
the training/timing-application hub); PRO-03 (DEC-031, SUPPORTING); PRO-05 (DEC-031, CONTEXTUAL). PRO-01,
02 have no direct decision dependency.

**VIT** (Vitamins) — all four topics used: VIT-01 (DEC-042, 043 CORE/SUPPORTING); VIT-02 (same pattern);
VIT-03 (DEC-041, CORE); VIT-04 (DEC-045, CORE). Full domain utilization — no VIT topic is an island.

**MIN** (Minerals) — same full-utilization pattern as VIT: MIN-01 (DEC-042 CORE), MIN-02 (DEC-042 CORE),
MIN-03 (DEC-041 CORE), MIN-04 (DEC-045 CORE).

**FLU** (Fluid/Hydration) — FLU-01 (DEC-046 CORE), FLU-02 (DEC-049 CORE), FLU-04 (DEC-047, 048, 049
CORE — the domain's clear hub), FLU-05 (DEC-050 CORE). FLU-03 (Acid-Base Balance) has no direct
decision dependency — a genuinely clinical-specialized topic no consumer-facing decision currently
reaches.

**GI** (Digestion/GI Physiology) — GI-04 (DEC-051, 054 CORE — the domain's hub); GI-05 (DEC-052 CORE,
cross-referencing CLIN-04/05); GI-01 (DEC-051, CONTEXTUAL). GI-02 has no direct decision dependency
(general absorptive-mechanism detail below decision altitude). GI-03 (Gut Microbiome) has **no current
decision dependency** — flagged `MAPPING UNCERTAIN` rather than zero, since its own Phase-1 status is
itself an open content-inspection deferral (see §16).

**BODY** (Energy Balance/Body Composition/Weight Management) — **the single highest-utilization domain
in the entire universe.** BODY-01 alone is used at CORE strength by 8 different decisions across 4
different functional layers (DEC-001, 003, 020, 021, 022, 026, 058, 083, 084, 110 — MECHANISTIC role in
early layers, INTERPRETIVE in Layer 4, PRESCRIPTIVE in Layer 5). BODY-02 (DEC-005, 017, 018, 019, 023),
BODY-03 (DEC-025, 026, 030), BODY-04 (DEC-001, 004, 022, 027), BODY-05 (DEC-001, 022, 027, 084), BODY-06
(DEC-004), BODY-07 (DEC-001, 003, 030) — every one of the 7 BODY topics is used, several at multiple
decisions and multiple roles. See §9.

**ASSESS** (Nutrition Assessment) — ASSESS-01 is the **single most-utilized topic in the entire 213-ID
universe** (used at CORE or SUPPORTING strength by at least 20 different decisions spanning Domains
B, D, E, N, O, T — see §9). ASSESS-03 (DEC-005, 009, 026), ASSESS-05 (DEC-006, 076, 080, 088) also
well-utilized. ASSESS-02 used once, at low confidence/future-feature caveat (DEC-041). ASSESS-04 and
ASSESS-06 have **no direct decision dependency** — both are clinical/professional-administered
assessment techniques (physical exam, lab-biomarker interpretation) the application does not itself
perform or ingest data for, at least not in the current decision set (see §16, §18).

**SPORT** (Exercise and Sport Nutrition) — 11 of 13 topics used, several at CORE strength across
multiple decisions (SPORT-01/02 → DEC-092 bridge; SPORT-03 → DEC-055/056/057; SPORT-05 → DEC-097;
SPORT-07 → DEC-048/096; SPORT-10 → DEC-013/016/095/098, the domain's safety hub). SPORT-08 (Exercise
Immunology) has **no current decision dependency** — a real, legitimate gap in the current decision
set rather than an oversight (see §18). SPORT-11 (Personalized/Precision Sport Nutrition) used only at
CONTEXTUAL/`MAPPING UNCERTAIN` strength (DEC-098) with an explicit current-evidence-primary flag.

**CLIN** (Clinical Nutrition) — 9 of 27 topics concretely mapped to a named decision (CLIN-01 the
domain's clear hub, used by 6 decisions across Domains C, I, O, Q; CLIN-03, 04/05, 07, 10, 12, 20, 24).
The remaining 18 CLIN topics are not mapped to any *specific* decision by name, because `DEC-099` itself
explicitly leaves the exact supported-conditions list undetermined (per the inventory's own note) —
see §16/§17 for the full treatment. One topic, CLIN-02 (Nutrition Support: Enteral/Parenteral), is
classified **no direct application dependency, outside consumer-app scope entirely** rather than
merely "pending" — inpatient tube-feeding/IV-nutrition management is not a home-nutrition-app decision
under any plausible future scope.

**LIFE** (Life Course) — LIFE-01 the domain's clear hub (DEC-012, 045, 103, 104, 105 — spanning Safety,
Micronutrients, and Life-Stage domains); LIFE-02, 03, 04, 06 supporting DEC-104; LIFE-05 (Adulthood)
CONTEXTUAL only, matching its own flagged thinness in `CANDIDATE_EXCLUSIONS.md`. LIFE-07 and LIFE-08 are
themselves cross-reference-only entries in `MASTER_TOPIC_UNIVERSE.md` (pointing to CLIN-27 and SPORT-09
respectively) and are treated the same way here — no independent mapping, consistent with their own
definition.

**RESEARCH** (Research Methods) — a genuinely bimodal domain. RESEARCH-01, 02, 04, 06, 07, 15 (6 of 15)
are used across the Evidence/Uncertainty and Monitoring/Feedback layers — RESEARCH-02 (confounding) and
RESEARCH-04 (dietary-assessment methodology) are particularly load-bearing, each feeding 4+ decisions.
RESEARCH-03, 08, 10 used at low-confidence CONTEXTUAL strength. RESEARCH-05, 09, 11, 12, 13, 14 (6 of 15)
have **no current decision dependency** — RESEARCH-09/13/14 exactly matching Phase 2's own finding that
these three are zero-cross-domain-edge islands in `LEARNING_DEPENDENCY_GRAPH.md`; RESEARCH-11/12 flagged
`MAPPING UNCERTAIN`/future-feature (personalized-nutrition/genomics frontier, current-evidence-primary);
RESEARCH-05 no direct dependency (its own REFERENCE-tier classification in `CANDIDATE_EXCLUSIONS.md`
already anticipated this).

**PUBHEALTH** (Public Health and Population Nutrition) — PUBHEALTH-03 (DEC-107), PUBHEALTH-04 (DEC-064,
073, 106), PUBHEALTH-05 (DEC-074) all used at CORE/CONTEXTUAL strength. PUBHEALTH-01, 02, 06 have **no
direct decision dependency** — PUBHEALTH-06 consistent with its own OUTSIDE-CORE-PATHWAY classification
in `CANDIDATE_EXCLUSIONS.md`; PUBHEALTH-01/02 are population-surveillance/program-administration
knowledge, not individual-user-decision knowledge.

**SPECIAL** (Cross-Cutting Topics) — SPECIAL-02 (DEC-044, 097), SPECIAL-03 (DEC-089, 091), SPECIAL-04
(DEC-059, 064) all used at CORE strength. SPECIAL-01 (Nutritional Genomics) has no current decision
dependency, flagged future-feature/current-evidence-primary, paired with RESEARCH-11/12/SPORT-11 at the
SPECIAL-05 convergence point — SPECIAL-05 itself is, by its own definition in `MASTER_TOPIC_UNIVERSE.md`,
not an independent topic and is treated here the same way LIFE-07/08 are: a marked seam, not mapped
independently.

---

# 8. Complete Knowledge Utilization Table

All 213 topic IDs, exactly once. **Level-1 topics** (142) get full independent treatment. **Level-2
subtopics** (71) inherit their parent's classification by the stated rule in §2 unless §5 already named
them independently (noted as "differentiated" below) — listed compactly in a second table beneath the
main one, grouped by parent, per §2's stated subtopic-granularity methodology.

## 8a. Level-1 Topics (142)

| Topic | Domain | Used By Decisions | Primary Roles | Strength Seen | Application Centrality | Notes |
|---|---|---|---|---|---|---|
| NUT-01 | NUT | DEC-002 | CONTEXTUAL | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | Thin single-decision use |
| NUT-02 | NUT | DEC-060, 062 | MECHANISTIC | CORE, SUPPORTING | IMPORTANT | Feeds the food-translation boundary |
| NUT-03 | NUT | DEC-038, 040, 041, 059, 061, 064, 066, 070 | APPLICATION, CONTEXTUAL | CORE, SUPPORTING, CONTEXTUAL | CORE APPLICATION | Highest cross-domain reuse of any NUT topic |
| NUT-04 | NUT | DEC-043, 060, 062, 063 | APPLICATION | CORE, SUPPORTING | CORE APPLICATION | Food-composition hub for the whole Translation layer |
| NUT-05 | NUT | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| DRV-01 | DRV | DEC-107 | MECHANISTIC | CORE | IMPORTANT | DRI methodology, needed to interpret external guides |
| DRV-02 | DRV | DEC-031, 034, 036 (implicit, numeric lookup only) | REFERENCE | REFERENCE | REFERENCE/EDUCATIONAL | Lookup table, not reasoned about |
| DRV-03 | DRV | DEC-041, 042 (implicit) | REFERENCE | REFERENCE | REFERENCE/EDUCATIONAL | Same |
| DRV-04 | DRV | DEC-041, 042 (implicit) | REFERENCE | REFERENCE | REFERENCE/EDUCATIONAL | Same |
| DRV-05 | DRV | DEC-043 | REFERENCE | REFERENCE | REFERENCE/EDUCATIONAL | Individual nutrient/diet fact sheets |
| MET-01 | MET | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| MET-02 | MET | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| MET-03 | MET | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| MET-04 | MET | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| MET-05 | MET | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| MET-06 | MET | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| MET-07 | MET | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — candidate CONTEXTUAL link to DEC-058/083 not adopted (see §18) |
| MET-08 | MET | DEC-084 | MECHANISTIC | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | Adaptive-response-to-restriction background |
| MET-09 | MET | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| MET-10 | MET | DEC-100 | MECHANISTIC | SUPPORTING | SUPPORTING/CROSS-CUTTING | Diabetes regulatory-biochemistry background |
| CHO-01 | CHO | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| CHO-02 | CHO | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| CHO-03 | CHO | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| CHO-04 | CHO | DEC-034, 037, 038(adj), 040(adj), 060(adj) | PRESCRIPTIVE | CORE | CORE APPLICATION | Requirement/pattern hub |
| CHO-05 | CHO | DEC-034, 035, 094 | APPLICATION | CORE, SUPPORTING | CORE APPLICATION | Timing/performance hub |
| LIP-01 | LIP | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| LIP-02 | LIP | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| LIP-03 | LIP | DEC-036 | MECHANISTIC | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | — |
| LIP-04 | LIP | — (reached indirectly via CLIN-10) | — | — | SPECIALIZED (indirect) | Candidate direct link to DEC-100 not adopted — see §18 |
| LIP-05 | LIP | DEC-036 | PRESCRIPTIVE | CORE | CORE APPLICATION | Fat-requirement hub |
| LIP-06 | LIP | DEC-019 | MECHANISTIC | SUPPORTING | SUPPORTING/CROSS-CUTTING | — |
| PRO-01 | PRO | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| PRO-02 | PRO | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| PRO-03 | PRO | DEC-031 | MECHANISTIC | SUPPORTING | SUPPORTING/CROSS-CUTTING | — |
| PRO-04 | PRO | DEC-031, 032, 039(adj), 085(adj) | PRESCRIPTIVE | CORE, SUPPORTING | CORE APPLICATION | Requirement hub |
| PRO-05 | PRO | DEC-031 | SAFETY | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | Boundary-case safety framing |
| PRO-06 | PRO | DEC-032, 033 | APPLICATION | CORE | CORE APPLICATION | Training/timing-application hub |
| VIT-01 | VIT | DEC-042, 043 | MECHANISTIC, APPLICATION | CORE, SUPPORTING | CORE APPLICATION | — |
| VIT-02 | VIT | DEC-042, 043 | MECHANISTIC, APPLICATION | CORE, SUPPORTING | CORE APPLICATION | — |
| VIT-03 | VIT | DEC-041 | ASSESSMENT | CORE | CORE APPLICATION | Adequacy-judgment hub |
| VIT-04 | VIT | DEC-045 | APPLICATION | CORE | IMPORTANT | Athlete-specific |
| MIN-01 | MIN | DEC-042 | MECHANISTIC | CORE | CORE APPLICATION | — |
| MIN-02 | MIN | DEC-042 | MECHANISTIC | CORE | CORE APPLICATION | — |
| MIN-03 | MIN | DEC-041 | ASSESSMENT | CORE | CORE APPLICATION | Adequacy-judgment hub |
| MIN-04 | MIN | DEC-045 | APPLICATION | CORE | IMPORTANT | Athlete-specific |
| FLU-01 | FLU | DEC-046 | MECHANISTIC | CORE | CORE APPLICATION | — |
| FLU-02 | FLU | DEC-049 | MECHANISTIC | CORE | CORE APPLICATION | — |
| FLU-03 | FLU | — | — | — | SPECIALIZED/REFERENCE | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — clinical acid-base content |
| FLU-04 | FLU | DEC-047, 048, 049 | APPLICATION | CORE | CORE APPLICATION | Domain hub |
| FLU-05 | FLU | DEC-050 | SAFETY | CORE | CORE APPLICATION | — |
| GI-01 | GI | DEC-051 | MECHANISTIC | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | — |
| GI-02 | GI | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED |
| GI-03 | GI | — | — | — | SPECIALIZED (pending review) | MAPPING UNCERTAIN — own Phase 1 content-inspection deferral still open |
| GI-04 | GI | DEC-051, 054 | APPLICATION, INTERPRETIVE | CORE | CORE APPLICATION | Domain hub |
| GI-05 | GI | DEC-052 | SAFETY | CORE | IMPORTANT | Cross-refs CLIN-04/05 |
| BODY-01 | BODY | DEC-001, 003, 020, 021, 022, 026, 058, 083, 084, 110 | MECHANISTIC, INTERPRETIVE, PRESCRIPTIVE | CORE | CORE APPLICATION | **Single highest-reuse topic outside ASSESS-01** |
| BODY-02 | BODY | DEC-005, 017, 018, 019, 023 | ASSESSMENT, MECHANISTIC | CORE, CONTEXTUAL | CORE APPLICATION | Energy-estimation hub |
| BODY-03 | BODY | DEC-025, 026, 030 | ASSESSMENT | CORE, SUPPORTING | CORE APPLICATION | — |
| BODY-04 | BODY | DEC-001, 004, 022, 027 | CONTEXTUAL, SAFETY, PRESCRIPTIVE | CORE, SUPPORTING | CORE APPLICATION | — |
| BODY-05 | BODY | DEC-001, 022, 027, 084 | CONTEXTUAL, PRESCRIPTIVE | CORE, SUPPORTING | CORE APPLICATION | — |
| BODY-06 | BODY | DEC-004 | SAFETY | CORE | IMPORTANT | — |
| BODY-07 | BODY | DEC-001, 003, 030 | CONTEXTUAL | SUPPORTING | IMPORTANT | — |
| ASSESS-01 | ASSESS | DEC-005–011, 017, 020, 021, 024, 026, 029, 076–082, 087, 109, 110, 112 | ASSESSMENT, EVIDENCE/METHODS | CORE, SUPPORTING, CONTEXTUAL | CORE APPLICATION | **The single highest-utilization topic in the entire 213-ID universe** |
| ASSESS-02 | ASSESS | DEC-041 | ASSESSMENT | CONTEXTUAL | SUPPORTING/CROSS-CUTTING (future-feature caveat) | App has no current lab-data ingestion |
| ASSESS-03 | ASSESS | DEC-005, 009, 026 | ASSESSMENT | SUPPORTING | IMPORTANT | — |
| ASSESS-04 | ASSESS | — | — | — | SPECIALIZED/REFERENCE | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — clinical physical-exam technique |
| ASSESS-05 | ASSESS | DEC-006, 076, 080, 088 | ASSESSMENT | SUPPORTING, CORE | IMPORTANT | NCP screening/monitoring hub |
| ASSESS-06 | ASSESS | — | — | — | SPECIALIZED/REFERENCE | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — lab-biomarker interpretation |
| SPORT-01 | SPORT | DEC-019, 092 | MECHANISTIC | CORE | CORE APPLICATION | Bridge topic (see dependency graph §14) |
| SPORT-02 | SPORT | DEC-019, 092 | MECHANISTIC | CORE, SUPPORTING | CORE APPLICATION | — |
| SPORT-03 | SPORT | DEC-055, 056, 057 | APPLICATION | CORE, SUPPORTING | CORE APPLICATION | Timing-translation hub |
| SPORT-04 | SPORT | DEC-093, 094 | CLASSIFICATION-support, APPLICATION | CORE, SUPPORTING | IMPORTANT | — |
| SPORT-05 | SPORT | DEC-097 | SAFETY, APPLICATION | CORE | CORE APPLICATION | — |
| SPORT-06 | SPORT | DEC-095 | INTERPRETIVE | SUPPORTING | SUPPORTING/CROSS-CUTTING | — |
| SPORT-07 | SPORT | DEC-048, 096 | APPLICATION | CORE | CORE APPLICATION | — |
| SPORT-08 | SPORT | — | — | — | SPECIALIZED | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — no current DEC addresses immune-function-specific guidance |
| SPORT-09 | SPORT | DEC-098 | CONTEXTUAL | CORE | IMPORTANT | — |
| SPORT-10 | SPORT | DEC-013, 016, 095, 098 | SAFETY | CORE | CORE APPLICATION | Domain safety hub |
| SPORT-11 | SPORT | DEC-098 | CONTEXTUAL | CONTEXTUAL | SPECIALIZED (elective/future) | MAPPING UNCERTAIN, current-evidence-primary |
| SPORT-12 | SPORT | DEC-054 | CONTEXTUAL | SUPPORTING | SUPPORTING/CROSS-CUTTING | — |
| SPORT-13 | SPORT | DEC-055, 093 | APPLICATION | CORE, SUPPORTING | IMPORTANT | — |
| CLIN-01 | CLIN | DEC-012, 014, 015, 090, 099, 101, 102 | SAFETY | CORE, SUPPORTING | CORE APPLICATION | Clinical-domain entry-point hub |
| CLIN-02 | CLIN | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — outside consumer-app scope entirely (inpatient nutrition support) |
| CLIN-03 | CLIN | DEC-053, 061 | SAFETY | CORE | CORE APPLICATION | — |
| CLIN-04 | CLIN | DEC-052 (cross-ref via GI-05) | SAFETY | CORE | IMPORTANT | — |
| CLIN-05 | CLIN | DEC-052 (cross-ref via GI-05) | SAFETY | CORE | IMPORTANT | — |
| CLIN-06 | CLIN | — (candidate, pending DEC-099 scope) | — | — | IMPORTANT (candidate) | See §16/§17 clinical-mapping note |
| CLIN-07 | CLIN | DEC-099, 100 | SAFETY, PRESCRIPTIVE | SUPPORTING, CORE | CORE APPLICATION | — |
| CLIN-08 | CLIN | — (candidate, pending DEC-099 scope) | — | — | IMPORTANT (candidate) | — |
| CLIN-09 | CLIN | — (candidate, pending DEC-099 scope) | — | — | IMPORTANT (candidate) | — |
| CLIN-10 | CLIN | DEC-099, 100 | SAFETY, PRESCRIPTIVE | SUPPORTING, CORE | CORE APPLICATION | — |
| CLIN-11 | CLIN | — (candidate, pending DEC-099 scope) | — | — | IMPORTANT (candidate) | — |
| CLIN-12 | CLIN | DEC-099, 100 | SAFETY, PRESCRIPTIVE | SUPPORTING, CORE | CORE APPLICATION | — |
| CLIN-13 | CLIN | — (candidate, pending DEC-099 scope) | — | — | IMPORTANT (candidate) | — |
| CLIN-14 | CLIN | — (candidate, pending DEC-099 scope) | — | — | IMPORTANT (candidate) | — |
| CLIN-15 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | — |
| CLIN-16 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | — |
| CLIN-17 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | — |
| CLIN-18 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | — |
| CLIN-19 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | — |
| CLIN-20 | CLIN | DEC-004, 013, 016 | SAFETY | CORE, SUPPORTING | CORE APPLICATION | — |
| CLIN-21 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | — |
| CLIN-22 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | — |
| CLIN-23 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | — |
| CLIN-24 | CLIN | DEC-100 | PRESCRIPTIVE | SUPPORTING | IMPORTANT | — |
| CLIN-25 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | — |
| CLIN-26 | CLIN | — (candidate, pending DEC-099 scope) | — | — | IMPORTANT (candidate) | Cross-cutting inflammation framework |
| CLIN-27 | CLIN | — (candidate, pending DEC-099 scope) | — | — | SPECIALIZED (elective, Layer 6) | See also LIFE-07 |
| LIFE-01 | LIFE | DEC-012, 045, 103, 104, 105 | SAFETY, APPLICATION, PRESCRIPTIVE | CORE | CORE APPLICATION | Domain hub |
| LIFE-02 | LIFE | DEC-012, 103, 104 | SAFETY, PRESCRIPTIVE | SUPPORTING, CORE | IMPORTANT | — |
| LIFE-03 | LIFE | DEC-103, 104 | PRESCRIPTIVE | SUPPORTING, CORE | IMPORTANT | — |
| LIFE-04 | LIFE | DEC-103, 104 | PRESCRIPTIVE | SUPPORTING, CORE | IMPORTANT | — |
| LIFE-05 | LIFE | DEC-104 | CONTEXTUAL | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | Matches own thin classification |
| LIFE-06 | LIFE | DEC-103, 104 | PRESCRIPTIVE | SUPPORTING, CORE | IMPORTANT | — |
| LIFE-07 | LIFE | — (cross-ref to CLIN-27) | — | — | SPECIALIZED (elective, via CLIN-27) | Covered via cross-reference, no independent mapping, per own definition |
| LIFE-08 | LIFE | — (cross-ref to SPORT-09) | — | — | IMPORTANT (via SPORT-09) | Covered via cross-reference, per own definition |
| RESEARCH-01 | RESEARCH | DEC-108 | EVIDENCE/METHODS | CORE | IMPORTANT | — |
| RESEARCH-02 | RESEARCH | DEC-021, 081, 087, 110 | EVIDENCE/METHODS | SUPPORTING, CORE | CORE APPLICATION | Confounding/observational-design hub |
| RESEARCH-03 | RESEARCH | DEC-111 | EVIDENCE/METHODS | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | — |
| RESEARCH-04 | RESEARCH | DEC-024, 077, 082, 112 | EVIDENCE/METHODS | SUPPORTING, CORE | CORE APPLICATION | Dietary-assessment-methodology hub |
| RESEARCH-05 | RESEARCH | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — matches own REFERENCE-tier classification |
| RESEARCH-06 | RESEARCH | DEC-077 | EVIDENCE/METHODS | SUPPORTING | SUPPORTING/CROSS-CUTTING | — |
| RESEARCH-07 | RESEARCH | DEC-079, 109 | EVIDENCE/METHODS | SUPPORTING | SUPPORTING/CROSS-CUTTING | — |
| RESEARCH-08 | RESEARCH | DEC-112 | EVIDENCE/METHODS | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | — |
| RESEARCH-09 | RESEARCH | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — zero-edge island per `LEARNING_DEPENDENCY_GRAPH.md` |
| RESEARCH-10 | RESEARCH | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — candidate link to DEC-058/091 not adopted, see §18 |
| RESEARCH-11 | RESEARCH | — | — | — | SPECIALIZED (elective/future) | MAPPING UNCERTAIN, current-evidence-primary; SPECIAL-05 convergence |
| RESEARCH-12 | RESEARCH | — | — | — | SPECIALIZED (elective/future) | Same |
| RESEARCH-13 | RESEARCH | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — zero-edge island |
| RESEARCH-14 | RESEARCH | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — zero-edge island |
| RESEARCH-15 | RESEARCH | DEC-111 | EVIDENCE/METHODS | CORE | IMPORTANT | Mapping noted as approximate |
| PUBHEALTH-01 | PUBHEALTH | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — population-level, not individual-decision |
| PUBHEALTH-02 | PUBHEALTH | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — surveillance methodology |
| PUBHEALTH-03 | PUBHEALTH | DEC-107 | CONTEXTUAL | CORE | IMPORTANT | — |
| PUBHEALTH-04 | PUBHEALTH | DEC-064, 073, 106 | CONTEXTUAL | SUPPORTING, CORE | IMPORTANT | Cost/access hub |
| PUBHEALTH-05 | PUBHEALTH | DEC-074 | SAFETY | CONTEXTUAL | SUPPORTING/CROSS-CUTTING | — |
| PUBHEALTH-06 | PUBHEALTH | — | — | — | REFERENCE/EDUCATIONAL | NO DIRECT APPLICATION DEPENDENCY IDENTIFIED — matches own thinnest-topic classification |
| SPECIAL-01 | SPECIAL | — | — | — | SPECIALIZED (elective/future) | MAPPING UNCERTAIN, current-evidence-primary; SPECIAL-05 convergence |
| SPECIAL-02 | SPECIAL | DEC-044, 097 | SAFETY, APPLICATION | CORE, SUPPORTING | CORE APPLICATION | — |
| SPECIAL-03 | SPECIAL | DEC-089, 091 | CONTEXTUAL, INTERPRETIVE | CORE | CORE APPLICATION | Counseling/adherence hub |
| SPECIAL-04 | SPECIAL | DEC-059, 064 | CONTEXTUAL | CORE | CORE APPLICATION | Cultural-competency hub |
| SPECIAL-05 | SPECIAL | — (convergence marker only) | — | — | n/a | Not an independent topic per its own definition — covered via SPECIAL-01/RESEARCH-12/SPORT-11 |

**142 of 142 Level-1 topics accounted for above.**

## 8b. Level-2 Subtopics (71) — Compact Table

Per §2's stated rule: unless independently differentiated in §5 (noted below), a subtopic inherits its
parent's application-centrality and decision-usage classification in full.

| Subtopic Range | Parent | Independently Differentiated in §5? | Classification |
|---|---|---|---|
| NUT-02.01–.05 | NUT-02 | No | Inherits NUT-02 (IMPORTANT) |
| NUT-03.01–.03 | NUT-03 | Yes — NUT-03.03 (Named Dietary Patterns) independently cited at DEC-038, DEC-107(via governance) | NUT-03.03: CORE APPLICATION (see DEC-038); NUT-03.01/.02 inherit NUT-03 (CORE APPLICATION) |
| MET-01.01–.02 | MET-01 | No | Inherits MET-01 (NO DIRECT APPLICATION DEPENDENCY IDENTIFIED) |
| MET-02.01–.03 | MET-02 | No | Inherits MET-02 (NO DIRECT APPLICATION DEPENDENCY IDENTIFIED) |
| MET-03.01–.03 | MET-03 | No | Inherits MET-03 (NO DIRECT APPLICATION DEPENDENCY IDENTIFIED) |
| MET-04.01–.03 | MET-04 | No | Inherits MET-04 (NO DIRECT APPLICATION DEPENDENCY IDENTIFIED) |
| MET-05.01–.03 | MET-05 | No | Inherits MET-05 (NO DIRECT APPLICATION DEPENDENCY IDENTIFIED) |
| MET-06.01–.04 | MET-06 | No | Inherits MET-06 (NO DIRECT APPLICATION DEPENDENCY IDENTIFIED) |
| MET-08.01–.04 | MET-08 | No (parent-level use only, at DEC-084) | Inherits MET-08 (SUPPORTING/CROSS-CUTTING) |
| CHO-05.01–.04 | CHO-05 | Yes — all four independently cited at DEC-035 (nutrient timing), DEC-094 (.01 specifically, pre-competition) | CHO-05.01–.04: CORE APPLICATION (see DEC-035/094) |
| BODY-02.01–.03 | BODY-02 | Yes — independently cited at DEC-018 (method-class selection) | BODY-02.01–.03: CORE APPLICATION (see DEC-018) |
| BODY-03 (no subtopics per universe) | — | — | n/a |
| BODY-04.01–.02 | BODY-04 | No | Inherits BODY-04 (CORE APPLICATION) |
| BODY-05.01–.04 | BODY-05 | No | Inherits BODY-05 (CORE APPLICATION) |
| ASSESS-01.01–.03 | ASSESS-01 | Yes — ASSESS-01.03 (measurement error) independently cited at DEC-009, 020, 021, 024, 077, 082, 087, 109, 110, 112 | ASSESS-01.03: CORE APPLICATION, the single most-cited subtopic in the universe; ASSESS-01.01/.02 inherit ASSESS-01 (CORE APPLICATION) |
| PRO-03.01–.03 | PRO-03 | No | Inherits PRO-03 (SUPPORTING/CROSS-CUTTING) |
| PRO-04.01–.02 | PRO-04 | Yes — PRO-04.02 (exercise/athlete protein requirements) independently cited at DEC-031/032 | PRO-04.02: CORE APPLICATION; PRO-04.01 inherits PRO-04 (CORE APPLICATION) |
| PRO-05.01–.03 | PRO-05 | No | Inherits PRO-05 (SUPPORTING/CROSS-CUTTING) |
| SPORT-01.01–.02 | SPORT-01 | No | Inherits SPORT-01 (CORE APPLICATION) |
| SPORT-04.01–.03 | SPORT-04 | No | Inherits SPORT-04 (IMPORTANT) |
| SPORT-09.01–.02 | SPORT-09 | No | Inherits SPORT-09 (IMPORTANT) |
| RESEARCH-02.01–.05 | RESEARCH-02 | No (parent-level use only) | Inherits RESEARCH-02 (CORE APPLICATION) |
| RESEARCH-11.01–.02 | RESEARCH-11 | No | Inherits RESEARCH-11 (SPECIALIZED, elective/future) |

**71 of 71 Level-2 subtopics accounted for above** (by direct listing where independently differentiated,
by explicit parent-inheritance rule otherwise). **213 of 213 total topic IDs accounted for** across §8a
and §8b combined.

---

# 9. Knowledge Hubs

Derived directly from §7/§8's utilization counts, not assumed in advance.

| Topic | Decisions Using It | Why It's a Hub |
|---|---|---|
| **ASSESS-01** | 20+ (spanning Domains B, D, E, N, O, T) | The single highest-utilization topic in the universe. Its own internal subtopic ASSESS-01.03 (measurement error in dietary intake data) alone is cited by 10 decisions — every decision anywhere in the graph that reasons about data quality, adherence, or confidence ultimately traces back to this one subtopic. |
| **BODY-01** | 10 (DEC-001, 003, 020, 021, 022, 026, 058, 083, 084, 110) | The energy-balance concept is the single piece of knowledge doing the most *conceptual* work across the widest span of functional layers — it appears as MECHANISTIC framing in Layer 1 (goal classification), INTERPRETIVE framing in Layer 4, and PRESCRIPTIVE framing in Layer 5, without ever being reduced to one fixed role. |
| **NUT-03** | 8 (DEC-038, 040, 041, 059, 061, 064, 066, 070) | The dietary-pattern-content hub — every decision that must respect a disclosed pattern (vegan, keto, restriction) touches this topic, spanning Macro Allocation, Micronutrients, and the entire Practical Translation layer. |
| **BODY-02** | 5 (DEC-005, 017, 018, 019, 023) | The energy-estimation-methodology hub — every decision in the initial Scientific Estimation stage of the loop routes through it. |
| **CLIN-01** | 7 (DEC-012, 014, 015, 090, 099, 101, 102) | The clinical-domain's single entry point — per `CLINICAL_NUTRITION_ARCHITECTURE.md`'s own Layer 3 framing, this is architecturally the *only* node the entire 27-topic CLIN domain funnels through before reaching any application decision. |
| **SPORT-10** | 4 (DEC-013, 016, 095, 098) | The sport-safety hub — Female Athlete Triad/RED-S content is the single topic underlying every athlete-specific safety/escalation decision. |
| **RESEARCH-02** | 4 (DEC-021, 081, 087, 110) | The confounding/observational-design concept is the single piece of research-methods knowledge doing the most work in the entire Uncertainty layer — it is what makes "is this individual's signal real" a reasoned judgment rather than a guess. |
| **NUT-04** | 4 (DEC-043, 060, 062, 063) | The food-composition-data hub for the entire target→food translation boundary. |

**Cross-domain hub pattern:** four of these eight hubs (ASSESS-01, BODY-01, NUT-03, CLIN-01) each span
**three or more** of the ten functional layers defined in `APP_DECISION_DEPENDENCY_GRAPH.md` §3 — no
single-domain topic reaches that breadth. This mirrors the dependency graph's own finding that DEC-001,
DEC-021, and DEC-084 are the decision-level bottlenecks (§17 of that document); the knowledge feeding
those exact decisions is what constitutes the knowledge-level hubs here. The two structures are
consistent with each other, not coincidentally.

---

# 10. Knowledge Islands

Topics with narrow, specialized, or currently-absent decision utilization — not a case for removal,
only a description of limited or specialized application role.

**The largest coherent island: foundational biochemistry.** MET-01 through MET-06 and MET-09 (7 of
MET's 10 topics), plus the chemistry/digestion subtopics of CHO (CHO-01/02/03), LIP (LIP-01/02), and
PRO (PRO-01/02) — roughly 14 topics collectively — have **no direct decision dependency** anywhere in
the 112-decision inventory. This is not an oversight: these topics teach the mechanistic biochemistry
*underneath* BODY/CHO/LIP/PRO/VIT/MIN's prescriptive content (why an energy estimate behaves as it
does, why a macro requirement exists at all), but no consumer-facing application decision reasons at
that depth — DEC-018 needs to know a resting-EE method-class exists, not the TCA cycle. This island
exists precisely because the curriculum was built for human learners who benefit from understanding
mechanism, while the application reasons at the level the mechanism *produces* (BODY-02's prediction
equations, not MET-03's ATP transduction chemistry).

**Clinical specialization islands.** 18 of CLIN's 27 topics (§7/§8) are not mapped to any *named*
decision, because `DEC-099` itself leaves the exact supported-conditions boundary undetermined — these
are candidates for that eventual list, not confirmed unused. Within that set, the 10 topics
`CLINICAL_NUTRITION_ARCHITECTURE.md` itself classifies Layer 6/SPECIALIZED (CLIN-15, 16, 17, 18, 19,
21, 22, 23, 25, 27) are the strongest candidates for staying elective/deferred even once DEC-099 is
resolved, consistent with that document's own reasoning. One CLIN topic — CLIN-02 (enteral/parenteral
nutrition support) — is a genuine, confirmed island: inpatient tube-feeding/IV-nutrition management is
outside any plausible scope for a home nutrition/grocery app, not merely deferred pending a scope
decision.

**Research-methods islands.** RESEARCH-09 (Biobanks), RESEARCH-13 (Stable Isotopes), RESEARCH-14
(Animal/Cellular Models) have zero decision dependency — and this matches, rather than newly
discovers, Phase 2's own finding in `LEARNING_DEPENDENCY_GRAPH.md` that these three are zero-cross-
domain-edge structural islands even *within the curriculum itself*. RESEARCH-05 (food-composition data
as a research tool) is unused here for the same reason `CANDIDATE_EXCLUSIONS.md` already classified it
REFERENCE-ONLY — the application's actual food-composition need is served by NUT-04, a different topic
with a different framing.

**Reference-only islands (by design, not oversight).** DRV-02/03/04/05 (RDA/AI/UL tables, nutrient
fact sheets) are used only at `REFERENCE` strength — consulted for numeric values once formulas are
chosen in a later phase, never reasoned about by a decision. This matches `CANDIDATE_EXCLUSIONS.md`'s
own REFERENCE-ONLY classification for these exact topics.

**Population-surveillance islands.** PUBHEALTH-01/02 (community-practice needs assessment, national
nutrition surveys) are population-level program-administration/surveillance knowledge — legitimately
outside the scope of any *individual*-user decision, however central they might be to public-health
practice generally.

**Clinical-professional-technique islands.** ASSESS-04 (nutrition-focused physical examination) and
ASSESS-06 (functional/inflammation lab biomarkers) both require professional physical assessment or lab
data the application does not currently collect — genuinely specialized, with a plausible future-feature
path (§18) rather than a permanent island, should the application ever integrate lab-result ingestion.

**Currently-unaddressed-decision islands.** SPORT-08 (Exercise Immunology) has no current decision
mapping — not because the knowledge lacks application value, but because no `DEC` record in the
inventory currently addresses illness/immune-function-aware nutrition guidance. This is flagged as a
genuine potential decision-inventory gap (§18), distinct from the intentional islands above.

---

# 11. Decision Knowledge Bottlenecks

Decisions where multiple knowledge topics converge, mapping confidence is low, current evidence
matters, or specialized knowledge is required — potential high-value targets for later curriculum/
evidence work, not redesigned here.

| DEC | Why It's a Bottleneck |
|---|---|
| **DEC-021** (individualized estimate reconciliation) | Three CORE topics converge (BODY-01, ASSESS-01, RESEARCH-02) across three different knowledge domains (mechanistic physiology, clinical assessment methodology, research-design methodology) — the highest knowledge-convergence of any single decision, matching its role as one of the dependency graph's three central bottlenecks. |
| **DEC-110** (model/observation mismatch) | Same three-domain convergence as DEC-021, at CORE strength for all three — confirming the dependency graph's own assessment of this as "arguably the single hardest decision in the whole inventory." |
| **DEC-027** (target rate/direction) | Current-evidence-primary — the 7-book corpus provides conceptual grounding (BODY-04/05) but explicitly not a defensible current rate; this is the *only* decision in the entire inventory carrying a `YES` (not merely `POSSIBLY`) current-evidence flag. |
| **DEC-098** (female-athlete track) | Combines a confirmed-strength safety topic (SPORT-10) with a `MAPPING UNCERTAIN` contextual link (SPORT-11) whose own depth the source TOC does not confirm — a decision resting partly on unverified content depth. |
| **DEC-039 / DEC-085** (macro-adjustment logic) | Both flagged `NEEDS CONTENT REVIEW` — no curriculum topic covers the *adjustment-trigger logic itself*, only the underlying requirement science it reapplies; a structural gap in translation from static requirement-setting to dynamic adjustment. |
| **DEC-058** (hunger/satiety-driven structure change) | Appetite-regulation content is folded into a BODY-01 subsection rather than existing as its own topic — thin support for a HIGH-personalization, longitudinal decision. |
| **DEC-066** (constructed-meal translation) | Sits exactly at the confirmed edge of the Practical Translation Gap (§14) — the nearest topic (NUT-03) stops well short of actual meal construction, confirmed absent from all seven books by `APPARENT_CURRICULUM_GAPS.md` §1. |
| **DEC-099 / DEC-100** (clinical scope and modification) | High knowledge convergence (CLIN-01 plus multiple disease-specific topics) *and* an explicitly undetermined scope boundary — the decision most dependent on a human choice (which conditions to support) before its knowledge mapping can be finalized. |

---

# 12. Personalization Knowledge Structure

Per the governing brief, tracing what knowledge actually *enables* personalization for the decisions
classified `HIGH`/`VERY HIGH` in the inventory — not designing the personalization mechanism itself.

**VERY HIGH-personalization decisions and their enabling knowledge:**

```
DEC-021 (individualized estimate)  ← BODY-01 (mechanistic) + ASSESS-01 (data-quality) + RESEARCH-02 (confounding)
DEC-022 (energy prescription)      ← BODY-01 + BODY-05 (goal-specific treatment approaches)
DEC-027 (target rate)              ← BODY-04 + BODY-05 (current-evidence-primary — see §15)
DEC-061 (restriction/allergy filter) ← CLIN-03 (safety) + NUT-03 (pattern)
DEC-084 (adjustment decision)      ← BODY-01 + BODY-05 + MET-08 (adaptive-response context)
DEC-100 (clinical upstream modification) ← CLIN-07/10/12/24 (disease-specific) + MET-10
DEC-110 (model/observation mismatch) ← RESEARCH-02 + BODY-01 + ASSESS-01
```

**Pattern:** every VERY HIGH-personalization decision is enabled by a *combination* of (a) one
mechanistic/physiological topic providing the "why," (b) one assessment/measurement topic providing
the "how reliable is what we know," and, where relevant, (c) one goal- or condition-specific
prescriptive topic providing the "what to actually do about it." No VERY HIGH-personalization decision
in this inventory is enabled by a single topic alone — personalization here is structurally always a
convergence, matching the inventory's own repeated worked example (`BODY COMPOSITION + TRAINING + GOAL
+ ENERGY + ASSESSMENT → INDIVIDUALIZED PRESCRIPTION`).

**HIGH-personalization decisions** (a representative sample, not exhaustive — see §5/§6 for the full
per-decision mapping): DEC-020, 026, 031, 032, 034, 035, 038, 039, 040, 041, 042, 044, 045, 051, 054,
057, 058, 059, 065, 068, 070, 083, 088, 090, 091, 092, 095, 098, 101, 104 all draw on at least one CORE
topic plus at least one CONTEXTUAL/SUPPORTING topic that adjusts the CORE topic's application to the
individual's specific goal, pattern, condition, or training context — the same convergence pattern at
one tier lower.

---

# 13. Longitudinal / Feedback Knowledge Structure

Per the governing brief's explicit instruction, longitudinal *data* is an input, not a knowledge topic
in its own right — this section traces the knowledge needed to *interpret* that data, kept separate
from the *decision* knowledge needed to act on the interpretation.

```
Knowledge needed to INTERPRET the observation:
    BODY-01 (energy-balance regulation — why the observed weight/intake relationship behaves as it does)
    ASSESS-01 (measurement error — is the observed data itself trustworthy)
    RESEARCH-02 (confounding — is an apparent signal real or an artifact)
        ↓ feeds DEC-021 (individualized estimate), DEC-026 (trend classification), DEC-083 (consistency interpretation)
        ↓
Knowledge needed to ACT on the interpretation (the adjustment decision itself):
    BODY-05 (weight-management treatment approaches — what changing the plan should look like)
    MET-08 (metabolic adaptation to sustained restriction — why repeated cycles sometimes plateau)
    CLIN-01 (Nutrition Care Process — when to stop adjusting and escalate instead)
        ↓ feeds DEC-084 (adjustment), DEC-090 (circuit-breaker), DEC-088 (full reassessment)
```

**The interpretation-knowledge set (BODY-01, ASSESS-01, RESEARCH-02) is reused identically across
every longitudinal decision in the inventory** — DEC-020, 021, 026, 028, 054, 078–084, 088, 090, 091,
095, 105, 110 (the inventory's own §8 longitudinal list) all draw on some combination of these three
topics for the *interpretation* half of their reasoning, even when their *action* half draws on
decision-specific prescriptive knowledge (protein/carb/fat topics for DEC-085, clinical topics for
DEC-100's longitudinal reapplication, sport topics for DEC-095). This is the single clearest structural
finding in this section: **interpretation knowledge is general-purpose and reused; action knowledge is
domain-specific and decision-particular.**

---

# 14. Practical Translation Knowledge Structure

The governing brief's central concern for this document — explicitly traced, per its own required
chain:

```
NUTRIENT TARGET               → NUT-02 (CORE), NUT-04 (CORE)                         LIKELY COVERED
        ↓
FOOD SELECTION                 → NUT-04 (CORE), CLIN-03 (CORE, safety filter)         LIKELY COVERED
        ↓
PORTION / QUANTITY              → NUT-04 (CORE, composition data) — but no topic covers
                                   *portioning methodology* (converting a gram-target into
                                   a purchasable/servable quantity) specifically             MAPPING UNCERTAIN
        ↓
MEAL (construction)             → NUT-03 (CORE, general eating-pattern guidance only —
                                   stops well short of actual meal construction)              MAPPING UNCERTAIN
        ↓
RECIPE / PREPARATION            → NO TOPIC                                                    LIKELY MISSING
        ↓
SHOPPING                        → NO TOPIC (PUBHEALTH-04/05 touch cost/availability only,
                                   not list-generation/consolidation logistics)                LIKELY MISSING
```

**Explicit finding:** the existing 213-topic universe supports the **first two links** of this chain
solidly (Target → Food Selection is well-covered by NUT-02/NUT-04/CLIN-03). The **third and fourth
links** (Portion and Meal) are only partially supported — the *nutrient* side of portioning is covered
(NUT-04's composition data), but the *practical* side (how much of a food constitutes one serving in a
constructed meal, how meals are actually assembled) is not represented by any topic more specific than
NUT-03's general eating-guideline content. The **fifth and sixth links** (Recipe/Preparation and
Shopping) have **no topic support at all** — and this is not a mapping failure on this document's
part: `APPARENT_CURRICULUM_GAPS.md` §1 independently and explicitly confirms "food science / culinary
technique" is absent as a heading from all seven source books' tables of contents, stating plainly that
none of the seven books "covers cooking methods, recipe development, or food preparation science as a
subject." This document's mapping and Phase 1's independent gap analysis corroborate each other.

**Implication carried to §16/§19, not resolved here:** roughly one-third of the DEC-060-through-075
practical-translation decision cluster (specifically DEC-065, 067, 068, 069, 071, 072, 075, plus
partial gaps on 070, 073, 074, 086) has no supporting knowledge topic anywhere in the 213-ID universe.
This is this application's single largest **APPLICATION TRANSLATION GAP**, and — notably — it is also
precisely the cluster of decisions where this grocery app's own product surface (existing pantry/
grocery-list data) is the actual asset the app would draw on instead of curriculum knowledge. That
asset is out of scope for a knowledge-mapping document to design, but its existence is why this
translation gap is more tractable in practice than the mapping alone would suggest.

---

# 15. Evidence-Dependent Knowledge

Reusing, not re-deriving, the `Current Evidence Required` flags already recorded in
`APP_DECISION_INVENTORY.md` §9, now attached to the specific knowledge relationships that carry them.

**Current-evidence-primary (the corpus alone cannot be relied on):**
- `DEC-027` (target rate/direction) — BODY-04/BODY-05 provide conceptual grounding only.
- `DEC-098`'s SPORT-11 link (menstrual-cycle-aware sport nutrition) — matches Phase 1's own flag that
  SPORT-11 needs a currency check before curriculum use.
- SPORT-11, RESEARCH-11/12, SPECIAL-01 generally (the SPECIAL-05 personalization-convergence point) —
  none currently mapped to a concrete decision, all flagged as a coherent current-evidence-primary
  frontier rather than individually resolved.

**Existing-corpus + current evidence (the books provide a foundation, contemporary evidence also
matters):** `DEC-004` (goal-timeframe plausibility), `DEC-012`/`DEC-099`/`DEC-100` (clinical scope and
modification — matches the still-evolving nature of clinical nutrition recommendations generally),
`DEC-013`/`DEC-016` (red-flag/escalation criteria), `DEC-022` (energy prescription — contemporary
weight-management standards), `DEC-030` (recomposition monitoring), `DEC-044`/`DEC-097` (supplement
consideration and reconciliation), `DEC-095` (RED-S/overtraining screening), `DEC-107` (external
food-guide alignment).

**Existing-corpus support (no current-evidence flag):** the remaining ~100 decisions — the large
majority of the inventory rests on knowledge the 7-book corpus is judged (by the inventory's own
per-decision flags, not re-litigated here) to cover adequately without a currency caveat.

This distinction feeds `06_EVIDENCE_AND_GAPS/` directly; **no evidence review is performed in this
document**, consistent with the explicit no-web-research instruction.

---

# 16. Potential Knowledge Gaps

Classified per the governing brief's exact five-way taxonomy. No gap here is escalated to a confirmed
curriculum gap or resolved by adding a topic.

**LIKELY COVERED:** the large majority of CORE-mapped relationships in §5/§6 — Energy (BODY-01/02),
Macronutrients (PRO-04/06, CHO-04/05, LIP-05), Micronutrients (VIT-01–04, MIN-01–04), Fluid (FLU-01/02/
04/05), clinical modification for the three most common disease areas (CLIN-07/10/12), and the
target→food-selection translation boundary (NUT-02/04, CLIN-03).

**MAPPING UNCERTAIN:** `DEC-058` (appetite/satiety regulation, thin BODY-01 subsection); `DEC-066`
(meal construction, NUT-03 stops short of actual meal-building); `DEC-098`'s SPORT-11 link
(cycle-phase-specific depth unconfirmed by the source TOC); `DEC-111` (evidence-governance process,
RESEARCH-15 framed around public-health/policy translation rather than internal app governance);
GI-03 (gut microbiome, pending Phase 1's own still-open content-inspection deferral).

**LIKELY MISSING:** the bulk of the Meal Planning/Preparation/Shopping cluster — `DEC-065, 067, 068,
069, 071, 072, 075` have no supporting topic anywhere in the 213-ID universe, independently confirmed
by `APPARENT_CURRICULUM_GAPS.md` §1's explicit finding that food science/culinary technique is absent
from all seven source books.

**CURRENT EVIDENCE GAP:** `DEC-027` (target rate — current-evidence-primary); the SPORT-11/RESEARCH-11/
12/SPECIAL-01 personalized-nutrition frontier generally; the four items `PHASE_2_HUMAN_REVIEW.md`
already deferred (GLP-1 receptor agonists, continuous glucose monitoring, COVID-19 material, SN4's
personalized-nutrition chapter) — none newly discovered here, all restated consistently with their
existing Phase 1/2 status.

**APPLICATION TRANSLATION GAP:** the full Meal Planning→Shopping practical chain (§14) — this is the
single largest gap category in this document, spanning roughly 15 of the 112 decisions, concentrated
almost entirely in Domains L and M plus DEC-065/086.

**No gap in this section is treated as resolved, and no new topic ID is proposed for any of them** —
per the governing brief, this is explicitly deferred to `APP_DECISION_GAPS.md`.

---

# 17. Application Centrality Summary

Aggregated from §8's per-topic classifications (an application-use classification, not a curriculum
deletion judgment):

| Centrality | Approx. Topic Count | Representative Topics |
|---|---|---|
| CORE APPLICATION KNOWLEDGE | ~35 | ASSESS-01, BODY-01–07, NUT-02–04, CHO-04/05, LIP-05, PRO-04/06, VIT-01–04, MIN-01–04, FLU-01/02/04/05, GI-04, CLIN-01/03, SPORT-01–03/05/07/10, SPECIAL-02–04, RESEARCH-02/04 |
| IMPORTANT APPLICATION KNOWLEDGE | ~25 | DRV-01, ASSESS-03/05, GI-05, SPORT-04/09/13, CLIN-04/05/24, LIFE-01–04/06, PUBHEALTH-03/04, RESEARCH-01/15, plus 8 candidate CLIN Layer-5 topics pending DEC-099's scope decision |
| SPECIALIZED APPLICATION KNOWLEDGE | ~20 | GI-03, SPORT-08/11, 10 CLIN Layer-6 topics, SPECIAL-01, RESEARCH-11/12, ASSESS-02/04/06 |
| SUPPORTING / CROSS-CUTTING KNOWLEDGE | ~20 | NUT-01, MET-08/10, LIP-03/06, PRO-03/05, RESEARCH-03/06/07/08, PUBHEALTH-05, LIFE-05, GI-01, SPORT-06/12 |
| REFERENCE / EDUCATIONAL KNOWLEDGE | ~30 | NUT-05, DRV-02–05, RESEARCH-05/09/10/13/14, PUBHEALTH-01/02/06, ASSESS-04/06 (see also SPECIALIZED note), CLIN-02 |
| NO DIRECT APPLICATION DEPENDENCY IDENTIFIED | ~14 | MET-01/02/03/04/05/06/09, CHO-01/02/03, LIP-01/02, PRO-01/02, GI-02 |

**Total across all six bands ≈ 142** (Level-1 topics; Level-2 subtopics inherit per §8b and are not
double-counted here). Band boundaries are approximate by design — several topics (e.g. ASSESS-04/06,
the 18 pending-scope CLIN topics) plausibly sit across two adjacent bands depending on how a future
implementation phase resolves DEC-099's scope question, and this is stated rather than forced to a
single number.

---

# 18. Structural Observations

1. **Two topics — ASSESS-01 and BODY-01 — carry structurally outsized weight.** Together they are
   cited by roughly 30 of the 112 decisions. This mirrors, and is caused by, the dependency graph's own
   finding that DEC-001 and DEC-021 are central bottlenecks: the knowledge *feeding* a bottleneck
   decision is itself necessarily heavily reused. A future implementation or evidence-review phase
   should treat ASSESS-01 (measurement-error/data-quality reasoning) and BODY-01 (energy-balance
   regulation) as the two single highest-leverage knowledge areas to get right, ahead of any specific
   nutrient-requirement topic.

2. **Interpretation knowledge is general-purpose; action knowledge is domain-specific** (§13) — a clean
   structural split that emerged from the mapping rather than being assumed going in.

3. **The Practical Translation layer is the one place the 213-topic universe was never designed to
   reach**, and this document's own mapping independently corroborates Phase 1's `APPARENT_CURRICULUM_
   GAPS.md` finding on the same point (§14). This is not a defect in either Phase 1's work or this
   document's mapping — a nutrition-science curriculum was never scoped to include culinary/logistics
   knowledge, and this application's decision to sit inside a grocery app is precisely what makes that
   gap tractable via product data rather than curriculum content.

4. **Personalization is structurally a convergence, never a single topic** (§12) — every VERY HIGH-
   personalization decision draws on a mechanistic-physiology topic, an assessment/measurement topic,
   and a goal/condition-specific prescriptive topic together. No amount of depth in any one of these
   alone would substitute for the combination.

5. **The clinical domain's 27 topics resist premature closure by design, not oversight** — 18 of them
   remain candidate-only because `DEC-099` (the supported-conditions boundary) is explicitly left open
   in the inventory itself. This document does not force a resolution; it shows exactly where one would
   need to happen (§16, §19) once a human makes that scope decision.

6. **A coherent ~14-topic foundational-biochemistry island exists below the application's decision
   altitude** (§10) — MET's mechanistic core, plus the chemistry/digestion subtopics of CHO/LIP/PRO.
   This is evidence the curriculum was built with a broader (human-learner) purpose than this specific
   application needs, which is exactly the possibility the governing brief's §10 anticipated rather
   than a flaw in either the curriculum or this mapping.

7. **Knowledge hubs and decision bottlenecks are the same underlying phenomenon viewed from two
   directions** — every decision-level bottleneck identified in `APP_DECISION_DEPENDENCY_GRAPH.md` §17
   (DEC-001, DEC-021, DEC-084) is fed by a knowledge-level hub identified independently in this
   document's §9 (BODY-01, ASSESS-01). The two documents' analyses were derived from different data
   (edge counts vs. topic-citation counts) and converge on the same three decisions, which is
   corroborating rather than circular.

---

# 19. Open Questions

Unresolved mapping questions, left open rather than silently decided.

1. **Should LIP-04 (lipoprotein/cholesterol/atherosclerosis) be mapped directly to `DEC-100` alongside
   CLIN-10**, rather than reached only indirectly through the clinical topic? Not adopted here to avoid
   over-mapping a mechanistic topic onto a decision it doesn't obviously *need* beyond what CLIN-10
   already provides — flagged as a candidate for reconsideration in `APP_DECISION_GAPS.md`.

2. **Should MET-07 (fed/fasting integration) or RESEARCH-10 (food-related-behaviour methods) be
   promoted from "no direct dependency"/"low-confidence contextual" to a confirmed CONTEXTUAL mapping
   for DEC-058/DEC-083/DEC-091** (appetite, interpretation, subjective-feedback decisions)? Considered
   and not adopted at CORE/SUPPORTING strength in this pass, since the connection, while plausible, is
   thinner than this document's own bar for a recorded relationship — left open rather than forced.

3. **How should the 18 pending-scope CLIN topics (§10, §17) actually resolve once `DEC-099`'s supported-
   conditions list is decided** — does each of the 8 general-practice-tier topics get an individual
   `DEC-100`-style modification decision, or does one shared mechanism suffice for all of them? Not an
   application-decision question this document can answer; carried to `APP_DECISION_GAPS.md` and
   ultimately `APP_DECISION_MODEL.md`.

4. **Does the current 213-topic universe need a genuinely new domain for Practical Translation
   knowledge (meal construction, recipe/preparation, shopping logistics)**, or is this permanently and
   correctly out of curriculum scope, with the application expected to source this knowledge elsewhere
   (product data, a future non-curriculum content source)? This document only establishes that the gap
   exists and is corroborated independently by Phase 1's own gap analysis (§14) — the *disposition* of
   that gap is explicitly a `APP_DECISION_GAPS.md` question, not decided here.

5. **Is ASSESS-02/ASSESS-06's "future-feature" framing (lab-data ingestion) realistic for this specific
   grocery/nutrition app**, or should these two topics simply remain permanent islands? Left open — a
   product-scope question, not a knowledge-mapping question.

6. **Should ASSESS-01.03 (measurement error) be treated as its own de facto Level-1-equivalent topic**
   given it alone is cited by 10 different decisions — more than most full Level-1 topics — even though
   §2's stated rule keeps it nested under ASSESS-01? Noted as a possible refinement for a future
   revision of the topic universe itself (a Phase 1/2 question, explicitly not resolved or acted on
   here).

---

# 20. Validation Summary

Checked against the governing brief's 38-item validation checklist (§35):

1–8. All 112 DEC IDs present and mapped in §5/§6 (verified programmatically — 112 unique, sequential,
no duplicates); all 213 knowledge topic IDs accounted for in §8a (142) + §8b (71) (verified
programmatically — 142 Level-1 rows confirmed); no new DEC IDs created; no new topic IDs created; no
existing topic IDs renamed; no existing topics deleted; no duplicate mappings created (each §5 table is
keyed by decision, each row a distinct topic); keyword-only mappings avoided (§2's worked PRO-01/02/03
example applied consistently — see decision-type-of-relationship rationale on every §5 row). ✓

9–14. Functional knowledge relationships explained in every §5 "Why Required" cell, never generic;
CORE/SUPPORTING/CONTEXTUAL/REFERENCE distinguished throughout §5/§6/§8; knowledge roles recorded on
every relationship; mapping confidence recorded on every §5 relationship and rolled up in §6; decision-
dependency context respected (§2's explicit principle, applied — e.g. DEC-060 not re-mapped BODY-02's
calorimetry content just because it's downstream of DEC-017/018 in the dependency graph); shared inputs
and shared knowledge not mistaken for decision dependency (no §5 row justifies a mapping by input/
knowledge-domain overlap alone — every row states a specific functional reason). ✓

15–20. Personalization decisions explicitly mapped (§12, all VERY HIGH/HIGH decisions traced to
enabling knowledge); longitudinal decisions explicitly mapped (§13, interpretation vs. action knowledge
kept separate); feedback/adjustment decisions explicitly mapped (§13, DEC-084/090/088 traced); practical
translation explicitly mapped (§14, full six-link chain traced with per-link gap classification); food
selection examined (§5 Domain K, §14 links 1–2); meal planning examined (§5 Domain L, §14 links 3–4);
preparation examined (§5 DEC-067/068/069, §14 link 5); shopping examined (§5 Domain M, §14 link 6). ✓

21–29. Clinical pathways represented (§5 Domain Q, §9/§10/§17's CLIN treatment); sport pathways
represented (§5 Domain P, §9's SPORT-10 hub); research/evidence knowledge represented where appropriate
(§9's RESEARCH-02/04 hubs, §13, §15) without assuming every RESEARCH topic is directly required for
everyday recommendations (§10's RESEARCH-island treatment); current-evidence requirements flagged, not
researched (§15, reusing not re-deriving inventory flags); potential knowledge gaps classified into the
exact required five categories (§16); knowledge gaps not silently turned into new curriculum topics (no
`DEC-###` gap in §16 proposes a new topic ID — every gap is described, not filled); no curriculum-
architecture decision silently resolved (§9/§10/§16/§17/§19 each explicitly restate open Phase 1/2 items
— DEC-099's clinical scope, SPORT-11's currency need, the RESEARCH single-source question — without
closing any of them); no Phase 1/2 files modified (read-only access throughout this session); no source
books modified. ✓

30–38. No formulas invented (DEC-018's method-class treatment stops at "a method-class exists," per
§2's worked PRO example applied to energy estimation too); no numerical thresholds invented (DEC-027's
target-rate treatment stops at "a rate must be determined," flagged current-evidence-primary rather
than given a number); no algorithms designed; no UI designed; no software architecture designed
(§14/§16's translation-gap discussion stays at the conceptual knowledge level throughout); no web
research performed; document saved at exactly
`05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_KNOWLEDGE_MAPPING.md`. ✓

---

**Knowledge Mapping Status: COMPLETE**

112 of 112 decisions mapped to knowledge (§5/§6); 213 of 213 knowledge topics accounted for (§8a/§8b);
knowledge hubs, islands, and decision-knowledge bottlenecks identified directly from the mapping data
rather than assumed in advance; personalization, longitudinal/feedback, and practical-translation
knowledge structures traced explicitly per the governing brief's own required chains; evidence-
dependent knowledge flagged (not researched) and kept in the required five-category gap taxonomy; no
curriculum-architecture question resolved, no topic added/removed/renamed, no formula or threshold
invented, no implementation designed. Ready for `05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_GAPS.md` as
the next Phase 3 document — not started in this session, per the governing brief's explicit instruction
to stop after this document.
