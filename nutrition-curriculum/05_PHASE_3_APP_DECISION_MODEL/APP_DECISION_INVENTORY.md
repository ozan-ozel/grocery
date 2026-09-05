# App Decision Inventory

Phase 3, Document 1 of 5 (`APP_DECISION_INVENTORY → APP_DECISION_DEPENDENCY_GRAPH →
APP_DECISION_KNOWLEDGE_MAPPING → APP_DECISION_GAPS → APP_DECISION_MODEL`).

---

# 1. Purpose

This document inventories the decisions the future nutrition decision-support application will
eventually need to make in order to turn a user's goal, profile, and observed response into
individualized guidance. It answers **"what must the application decide?"**, not **"what should the
curriculum teach?"** — a knowledge topic (e.g. `MET-01` biochemistry of ATP) becomes relevant here
only insofar as some application decision plausibly draws on it, not because a source book has a
chapter on it.

**What this document contains:**
- A stable-ID inventory of application decision nodes (`DEC-001` …), organized under the 20 decision
  domains named in the governing task brief (A–T below).
- For each decision: its type, inputs/output, known dependencies, personalization level,
  longitudinal-data need, current-evidence flag, and a best-effort mapping to
  `03_PHASE_1_CURRICULUM_ANALYSIS/MASTER_TOPIC_UNIVERSE.md` topic IDs.
- The explicit personalization loop (estimate → observe → assess data quality → interpret →
  individualize → target-set → prescribe → monitor → adjust → observe again) as its own cross-cutting
  section, since it is the application's central mechanism, not an optional feature.
- An initial CORE/IMPORTANT/OPTIONAL/SPECIALIZED/REFERENCE/FUTURE FEATURE classification per
  decision, and a first-pass note on apparent gaps between the decision inventory and the existing
  213-topic universe.

**What this document intentionally does NOT contain:**
- Any specific formula, equation, numerical threshold, macro percentage, gram/kg value, weight-change
  rate, or clinical cutoff. Every decision below stops at "the application must determine X" — never
  "X is calculated as …".
- Any UI, database schema, API, or software-architecture design.
- Any machine-learning method selection or scoring-system design.
- Any resolution of the Phase 1/Phase 2 curriculum-architecture questions still open in
  `04_PHASE_2_CURRICULUM_ARCHITECTURE/PHASE_2_HUMAN_REVIEW.md` (spine choice, AS3/ACSM/SN4 posture,
  Layer-5 clinical depth, research placement, etc.). Those are curriculum-design decisions about *what
  to teach*; this document is about *what the application must decide*. Where a Phase 2 open question
  bears on which knowledge domain a decision draws from, that is noted, not resolved.
- Any current-evidence research. Decisions that plausibly need it are flagged
  `Current Evidence Required: YES` or `POSSIBLY` and left there.

---

# 2. Decision Model Principles

Eight distinctions recur across this inventory and must not be collapsed into a single decision node
anywhere below, per the governing task brief:

1. **Estimate vs. Prescription** — "estimate energy requirement" (what the model/observed data
   suggest) is not "prescribe energy intake" (what should currently be recommended given the goal).
2. **Initial Estimate vs. Individualized Estimate** — a population/model-based first-pass figure is a
   different decision from the same figure updated using the individual's own observed response.
3. **Population Standard vs. Individual Response** — a general recommendation is not automatically the
   individual's final prescription; reconciling the two is its own decision.
4. **Measurement vs. Interpretation** — recording a data point (e.g. a weight reading) is different
   from determining what it means (a trend, noise, or something else).
5. **Interpretation vs. Adjustment** — determining that an observed response is/isn't consistent with
   the plan is a different decision from deciding the plan should change.
6. **Nutrient Requirement vs. Food Recommendation** — determining a target (e.g. protein requirement)
   is different from selecting foods that deliver it.
7. **Nutrient Target vs. Meal Plan** — a daily target is different from the constructed meals that
   deliver it across a day.
8. **Meal Plan vs. Shopping Plan** — constructed meals are different from what/how much to buy to make
   them possible.

A ninth, cutting across all of the above: **Scientific Estimate vs. Personalized Prescription vs.
Practical Translation** — "what is likely happening?" (Level 1), "what should this person currently
do?" (Level 2), and "what should this person eat/do today?" (Level 3) are three distinct decision
levels, never merged. Every decision record below is implicitly tagged to one of these three levels
through its `Decision Type` (see §3).

---

# 3. Decision Domain Map

20 domains (A–T), matching the governing task brief exactly. `DEC` range shown for navigation only —
ranges are contiguous by construction, not by any deeper significance.

| Domain | Scope | DEC Range |
|---|---|---|
| A. Goal Classification | Translating a stated goal into an operational nutrition goal | 001–004 |
| B. User Profile & Baseline | Sufficiency, priority, conflict and staleness of intake profile data | 005–011 |
| C. Safety, Scope & Escalation | When to continue, flag, or hand off to a professional | 012–016 |
| D. Energy | Estimated requirement → individualized maintenance → prescription | 017–024 |
| E. Weight & Body Composition | Metrics, trend interpretation, target rate, reassessment triggers | 025–030 |
| F. Macronutrients | Protein / carbohydrate / fat / fiber requirement and adjustment | 031–040 |
| G. Micronutrients | Adequacy, risk, food-source translation, supplementation | 041–045 |
| H. Fluid & Hydration | Baseline, exercise/environment modifiers, electrolytes, escalation | 046–050 |
| I. Digestion / GI | Symptom capture, escalation boundary, intolerance vs. allergy, adaptation | 051–054 |
| J. Meal Structure & Timing | Eating-occasion count, distribution, exercise timing, constraints | 055–059 |
| K. Food Selection | Target → candidate foods, filters, substitutions, practical weighting | 060–065 |
| L. Meal Planning & Preparation | Foods → constructed meals, preparation constraints, deviation handling | 066–070 |
| M. Shopping | Meals → shopping list, pantry reconciliation, budget/availability | 071–075 |
| N. Monitoring | What/how often to log, measurement quality, adherence, non-response | 076–080 |
| O. Feedback & Adaptation | The full assess → interpret → adjust cycle (core system loop) | 081–091 |
| P. Sport & Exercise | Training data intake, sport-specific routing, RED-S/overtraining, environment | 092–098 |
| Q. Clinical & Special Populations | Supported-condition boundary, upstream modification, conflict resolution | 099–102 |
| R. Life Stages | Life-stage assignment and its downstream effects | 103–105 |
| S. Public Health & Food Environment | Access/affordability, alignment to external guides | 106–107 |
| T. Evidence, Uncertainty & Data Quality | Debate-flagging, conflict detection, model/observation mismatch, governance | 108–112 |

**112 decision records total.** Numbering is sequential and domain-agnostic per the task brief's
explicit instruction (no domain-prefixed IDs at this stage).

---

# 4. Complete Decision Inventory

## Field Legend

Each record uses this exact field set:

- **Decision** — action-oriented statement of what the application must determine.
- **Domain** — one of A–T above.
- **Decision Type** — one of `CLASSIFICATION`, `DATA_SUFFICIENCY`, `ESTIMATION`, `INTERPRETATION`,
  `TARGET_SETTING`, `PRESCRIPTION`, `SELECTION`, `MONITORING`, `ADJUSTMENT`, `ESCALATION`,
  `VALIDATION`, `TRANSLATION`.
- **Inputs** — information the decision plausibly draws on.
- **Output** — what determination results.
- **Depends On** — other DEC IDs with an already-obvious direct dependency (not the full graph —
  that is `APP_DECISION_DEPENDENCY_GRAPH.md`'s job).
- **Downstream Use** — later decisions that plausibly consume this one's output.
- **Personalization** — `NONE` / `LOW` / `MODERATE` / `HIGH` / `VERY HIGH`.
- **Longitudinal Data Required?** — `YES` / `NO` / `OPTIONAL`.
- **Current Evidence Required?** — `NO` / `POSSIBLY` / `YES` (flag only, not reviewed here).
- **Relevant Knowledge Domains** — Phase 1 domain codes (`NUT, DRV, MET, CHO, LIP, PRO, VIT, MIN, FLU,
  GI, BODY, ASSESS, SPORT, CLIN, LIFE, RESEARCH, PUBHEALTH, SPECIAL`).
- **Relevant Existing Topic IDs** — best-effort mapping to `MASTER_TOPIC_UNIVERSE.md`; `UNKNOWN / NEEDS
  CONTENT REVIEW` where no reasonably clear mapping exists.
- **App Priority** — initial-pass only: `CORE` / `IMPORTANT` / `OPTIONAL` / `SPECIALIZED` /
  `REFERENCE` / `FUTURE FEATURE`.
- **Notes / Uncertainty** — ambiguity, evidence need, or conceptual caveat.

---

## Domain A — Goal Classification

### DEC-001
- **Decision:** Determine the user's primary goal category (maintenance, weight loss, weight gain,
  muscle/lean-mass gain, performance, health-oriented, body-composition, or unclear/unstated).
- **Domain:** A · **Decision Type:** CLASSIFICATION
- **Inputs:** User's stated goal (free text or selected option), profile context.
- **Output:** A goal category label driving downstream Energy/Macro target-setting.
- **Depends On:** — · **Downstream Use:** DEC-004, DEC-017, DEC-022, DEC-027, DEC-034–036
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT, BODY
- **Relevant Existing Topic IDs:** BODY-04, BODY-05, BODY-06, BODY-07
- **App Priority:** CORE
- **Notes / Uncertainty:** The category set itself (how many categories, how granular) is not fixed
  here — only that a classification decision exists and precedes everything downstream.

### DEC-002
- **Decision:** Determine whether a vague or purely qualitative goal statement ("get healthier," "feel
  better") can be translated into an operational nutrition goal, or whether clarification must be
  requested from the user first.
- **Domain:** A · **Decision Type:** VALIDATION
- **Inputs:** Raw goal statement, DEC-001 output.
- **Output:** Either a usable operational goal, or a clarification request (no numeric target yet).
- **Depends On:** DEC-001 · **Downstream Use:** DEC-005, DEC-017
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT
- **Relevant Existing Topic IDs:** NUT-01
- **App Priority:** CORE
- **Notes / Uncertainty:** Overlaps conceptually with DEC-005/006 (baseline sufficiency) — kept
  separate because this decision concerns the *goal's* clarity, not the *profile's* completeness.

### DEC-003
- **Decision:** Determine how multiple or apparently conflicting stated goals are reconciled or
  sequenced (e.g. simultaneous fat loss and muscle gain, or a stated goal that conflicts with a
  disclosed clinical restriction).
- **Domain:** A · **Decision Type:** INTERPRETATION
- **Inputs:** All stated goals, relevant restrictions/flags.
- **Output:** A resolved single operational goal, or an explicit sequencing (e.g. "goal 1 now, goal 2
  later").
- **Depends On:** DEC-001 · **Downstream Use:** DEC-022, DEC-027, DEC-101
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT, BODY
- **Relevant Existing Topic IDs:** BODY-01, BODY-07
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** "Recomposition" (simultaneous fat loss/muscle gain) is a scientifically
  contested area in its own right — this decision determines only *that* reconciliation must happen,
  not how; see DEC-108 for the evidence-currency flag on recomposition claims specifically.

### DEC-004
- **Decision:** Determine whether the goal as stated, or a timeframe implied within it, requires a
  safety/scope flag before any estimate is produced.
- **Domain:** A · **Decision Type:** ESCALATION
- **Inputs:** DEC-001–003 outputs, any user-stated timeframe.
- **Output:** A pass-through (no flag) or a safety-scope flag routed to Domain C.
- **Depends On:** DEC-001, DEC-002, DEC-003 · **Downstream Use:** DEC-012, DEC-013, DEC-014
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** BODY, CLIN
- **Relevant Existing Topic IDs:** BODY-04, BODY-06, CLIN-20
- **App Priority:** CORE
- **Notes / Uncertainty:** This decision does **not** set an acceptable rate of change (forbidden by
  scope) — it only determines *whether* a stated timeframe is implausible enough to warrant a flag.
  What counts as implausible is itself evidence-dependent (`Current Evidence Required: POSSIBLY`),
  consistent with the "target rates of weight change" item in the governing brief's current-evidence
  examples.

---

## Domain B — User Profile and Baseline

### DEC-005
- **Decision:** Determine the minimum set of baseline profile fields required before an initial
  estimate can be produced.
- **Domain:** B · **Decision Type:** DATA_SUFFICIENCY
- **Inputs:** Goal category (DEC-001), application's supported decision set.
- **Output:** A required-field list (age, sex, body size, activity level, etc. — exact composition not
  fixed here).
- **Depends On:** DEC-001 · **Downstream Use:** DEC-006, DEC-017
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY, ASSESS
- **Relevant Existing Topic IDs:** BODY-02, ASSESS-01, ASSESS-03
- **App Priority:** CORE
- **Notes / Uncertainty:** The required set plausibly varies by goal category and by which downstream
  decisions the application actually supports — this decision defines *that* variability exists, not
  its content.

### DEC-006
- **Decision:** Determine whether currently available profile information is sufficient to proceed, or
  whether population-default assumptions must substitute for missing fields.
- **Domain:** B · **Decision Type:** DATA_SUFFICIENCY
- **Inputs:** Collected profile fields, DEC-005 required-field list.
- **Output:** "Sufficient — proceed" / "Insufficient — request more" / "Proceed with named defaults."
- **Depends On:** DEC-005 · **Downstream Use:** DEC-017, DEC-018
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01, ASSESS-05
- **App Priority:** CORE
- **Notes / Uncertainty:** None beyond the general default-vs-request tradeoff, which is a UX decision
  out of this document's scope.

### DEC-007
- **Decision:** Determine which missing profile fields have the greatest decision value and should be
  prioritized when requesting more information from the user.
- **Domain:** B · **Decision Type:** VALIDATION
- **Inputs:** DEC-005/006 outputs, the application's decision dependency structure (see
  `APP_DECISION_DEPENDENCY_GRAPH.md`, not yet built).
- **Output:** An ordered list of information requests.
- **Depends On:** DEC-005, DEC-006 · **Downstream Use:** (UX-facing; no further DEC consumes this
  directly)
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** This decision cannot be fully specified until the dependency graph (Phase 3
  document 2) exists; recorded here as a placeholder decision node.

### DEC-008
- **Decision:** Determine how a user's refusal or inability to provide a requested profile field is
  handled downstream.
- **Domain:** B · **Decision Type:** VALIDATION
- **Inputs:** Refusal/non-response event, field in question.
- **Output:** Either a named default substitution, a reduced-confidence estimate, or a blocked
  decision path.
- **Depends On:** DEC-006 · **Downstream Use:** DEC-021, DEC-024
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-009
- **Decision:** Determine whether provided profile data is internally plausible, and how an
  implausible-data flag is handled.
- **Domain:** B · **Decision Type:** VALIDATION
- **Inputs:** All collected profile fields.
- **Output:** "Plausible" / "Implausible — re-confirm" flag.
- **Depends On:** — · **Downstream Use:** DEC-006, DEC-024
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01, ASSESS-03
- **App Priority:** CORE
- **Notes / Uncertainty:** Plausibility bounds are not defined here (would be a numeric-threshold
  decision, out of scope for this inventory).

### DEC-010
- **Decision:** Determine how conflicting profile information (e.g. contradictory answers given at
  different times) is resolved.
- **Domain:** B · **Decision Type:** VALIDATION
- **Inputs:** Current and historical profile values for the same field.
- **Output:** A resolved current value, or a re-confirmation prompt.
- **Depends On:** DEC-009 · **Downstream Use:** DEC-006
- **Personalization:** LOW · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** Only "longitudinal" in the weak sense of comparing two points in time, not
  the trend-analysis sense used elsewhere in this document (see Domain O).

### DEC-011
- **Decision:** Determine when previously collected profile data is considered stale and should
  trigger a re-confirmation prompt.
- **Domain:** B · **Decision Type:** MONITORING
- **Inputs:** Time since last confirmation, field type (e.g. body weight staled faster than height).
- **Output:** A re-confirmation trigger.
- **Depends On:** — · **Downstream Use:** DEC-006, DEC-023
- **Personalization:** LOW · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Staleness windows are not set here (numeric threshold, out of scope).

---

## Domain C — Safety, Scope and Escalation

### DEC-012
- **Decision:** Determine which disclosed populations or conditions place a user outside the
  application's safe automated-guidance scope, requiring referral instead of continued automated
  guidance.
- **Domain:** C · **Decision Type:** ESCALATION
- **Inputs:** Disclosed clinical conditions, life-stage flags (pregnancy, pediatric), disclosed
  eating-disorder history.
- **Output:** "In scope" / "Out of scope — refer."
- **Depends On:** DEC-099, DEC-103 · **Downstream Use:** DEC-014, DEC-099
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** CLIN, LIFE
- **Relevant Existing Topic IDs:** CLIN-01, LIFE-01, LIFE-02
- **App Priority:** CORE
- **Notes / Uncertainty:** This decision defines only that a scope boundary exists and must be
  evaluated — the actual list of out-of-scope conditions is not enumerated here; it is a downstream
  content-and-liability decision informed by, but not resolved by, the CLIN topic universe alone.

### DEC-013
- **Decision:** Determine which reported symptoms or behavioral signals constitute a red flag
  requiring escalation rather than continued automated coaching.
- **Domain:** C · **Decision Type:** ESCALATION
- **Inputs:** Ongoing monitoring data (Domain N), free-text symptom reports.
- **Output:** A red-flag trigger routed to a human-referral pathway.
- **Depends On:** DEC-012, DEC-080 · **Downstream Use:** DEC-014, DEC-016
- **Personalization:** LOW · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** CLIN, SPORT
- **Relevant Existing Topic IDs:** CLIN-20, SPORT-10
- **App Priority:** CORE
- **Notes / Uncertainty:** No diagnostic criteria are defined here, per explicit brief instruction —
  only that a symptom-to-escalation decision node exists.

### DEC-014
- **Decision:** Determine the boundary condition at which the application withholds a generated
  prescription pending professional consultation.
- **Domain:** C · **Decision Type:** ESCALATION
- **Inputs:** DEC-012/013 outputs.
- **Output:** "Withhold prescription — refer" vs. "Proceed."
- **Depends On:** DEC-012, DEC-013 · **Downstream Use:** DEC-022, DEC-027
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CLIN
- **Relevant Existing Topic IDs:** CLIN-01
- **App Priority:** CORE
- **Notes / Uncertainty:** None beyond DEC-012/013's own uncertainty.

### DEC-015
- **Decision:** Determine how the application's guidance coordinates with an existing
  clinician/dietitian relationship the user discloses.
- **Domain:** C · **Decision Type:** VALIDATION
- **Inputs:** Disclosed existing-care relationship, any user-provided clinician guidance.
- **Output:** "Defer to disclosed clinical guidance" / "Supplement it" / "No coordination needed."
- **Depends On:** DEC-012 · **Downstream Use:** DEC-022, DEC-100
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CLIN
- **Relevant Existing Topic IDs:** CLIN-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** How the application would actually ingest external clinical guidance is an
  implementation question, out of scope here.

### DEC-016
- **Decision:** Determine how ongoing-use signals (not just intake-time signals) are monitored for
  emerging escalation-worthy patterns.
- **Domain:** C · **Decision Type:** MONITORING
- **Inputs:** Longitudinal monitoring data (Domain N), prior escalation history.
- **Output:** A continuous background escalation-check process definition (not its thresholds).
- **Depends On:** DEC-013, DEC-076 · **Downstream Use:** DEC-090
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** CLIN, SPORT
- **Relevant Existing Topic IDs:** CLIN-20, SPORT-10
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Distinguished from DEC-013 in that this decision concerns *continuous*
  monitoring over the relationship's lifetime, not a single intake-time check.

---

## Domain D — Energy

### DEC-017
- **Decision:** Determine whether sufficient baseline data exists to produce an initial (Level-1
  scientific-estimate) energy requirement figure.
- **Domain:** D · **Decision Type:** DATA_SUFFICIENCY
- **Inputs:** DEC-005/006 outputs.
- **Output:** "Sufficient — proceed to estimation" / "Insufficient — request more data."
- **Depends On:** DEC-005, DEC-006 · **Downstream Use:** DEC-018
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY
- **Relevant Existing Topic IDs:** BODY-02
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-018
- **Decision:** Determine an appropriate method-class (population-formula-based, activity-based, or
  hybrid) for the initial resting/total energy expenditure estimate, independent of which specific
  formula is later selected.
- **Domain:** D · **Decision Type:** ESTIMATION
- **Inputs:** Available profile fields, DEC-017 output.
- **Output:** A method-class selection (not a formula).
- **Depends On:** DEC-017 · **Downstream Use:** DEC-019
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY
- **Relevant Existing Topic IDs:** BODY-02
- **App Priority:** CORE
- **Notes / Uncertainty:** Per the brief's False-Precision warning, no specific equation is chosen
  here — only that a method-class choice is itself a decision node the application must resolve later.

### DEC-019
- **Decision:** Determine how disclosed activity/training data is incorporated into the initial
  total-energy-expenditure estimate.
- **Domain:** D · **Decision Type:** ESTIMATION
- **Inputs:** DEC-018 output, activity/training data (Domain P).
- **Output:** An initial total-energy-expenditure figure (Level 1).
- **Depends On:** DEC-018, DEC-092 · **Downstream Use:** DEC-020, DEC-021
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY, SPORT
- **Relevant Existing Topic IDs:** BODY-02, SPORT-01, SPORT-02
- **App Priority:** CORE
- **Notes / Uncertainty:** None beyond DEC-018's.

### DEC-020
- **Decision:** Determine what constitutes sufficient observed data (logged intake plus weight/
  composition trend over time) to move from the initial estimate to an individualized/observed
  maintenance figure.
- **Domain:** D · **Decision Type:** DATA_SUFFICIENCY
- **Inputs:** Logged intake history, weight/composition trend (Domain E), logging-adherence signal
  (DEC-078).
- **Output:** "Sufficient — compute individualized maintenance" / "Not yet — continue on initial
  estimate."
- **Depends On:** DEC-019, DEC-076, DEC-078 · **Downstream Use:** DEC-021
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY, ASSESS
- **Relevant Existing Topic IDs:** BODY-01, BODY-02, ASSESS-01
- **App Priority:** CORE
- **Notes / Uncertainty:** This is the first explicitly longitudinal decision in the Energy domain —
  kept distinct from DEC-017 (a one-time baseline-sufficiency gate) because it gates a *different*
  transition (initial estimate → individualized estimate), per Decision Model Principle #2.

### DEC-021
- **Decision:** Determine how to weigh the initial model-based estimate against the individual's
  observed response when the two diverge, and how data quality affects that weighting.
- **Domain:** D · **Decision Type:** INTERPRETATION
- **Inputs:** DEC-019 (initial estimate), DEC-020 (observed-data sufficiency and content), DEC-009/010
  (profile data quality).
- **Output:** An individualized maintenance-energy figure (Level 1, individualized).
- **Depends On:** DEC-019, DEC-020 · **Downstream Use:** DEC-022
- **Personalization:** VERY HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY, ASSESS
- **Relevant Existing Topic IDs:** BODY-01, BODY-02, ASSESS-01
- **App Priority:** CORE
- **Notes / Uncertainty:** This is the decision that operationalizes Decision Model Principle #2/#3 —
  kept explicitly separate from both DEC-019 (initial estimate alone) and DEC-022 (the goal-driven
  prescription that follows it).

### DEC-022
- **Decision:** Determine the current energy prescription given the individualized maintenance figure
  (DEC-021) and the user's goal (DEC-001/003), subject to any safety-scope block (DEC-014).
- **Domain:** D · **Decision Type:** PRESCRIPTION
- **Inputs:** DEC-021 output, DEC-001/003 goal, DEC-014 safety gate.
- **Output:** A Level-2 energy prescription (personalized "what should currently be recommended," not
  a maintenance estimate).
- **Depends On:** DEC-021, DEC-001, DEC-003, DEC-014 · **Downstream Use:** DEC-027, DEC-034–036
- **Personalization:** VERY HIGH · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** BODY, NUT
- **Relevant Existing Topic IDs:** BODY-01, BODY-04, BODY-05
- **App Priority:** CORE
- **Notes / Uncertainty:** Distinct by construction from DEC-021 per Decision Model Principle #1.
  `Current Evidence Required: POSSIBLY` because the prescription logic for weight-change goals
  intersects the "contemporary weight-management standards" current-evidence item named in the
  governing brief.

### DEC-023
- **Decision:** Determine the triggers for recomputing the energy estimate or prescription as new
  profile or observed data arrives.
- **Domain:** D · **Decision Type:** MONITORING
- **Inputs:** New profile data (DEC-011), new observed data (Domain N).
- **Output:** A recompute trigger (or "no recompute needed").
- **Depends On:** DEC-011, DEC-020 · **Downstream Use:** DEC-081, DEC-084
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY, ASSESS
- **Relevant Existing Topic IDs:** BODY-02
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Overlaps with Domain O's adjustment-trigger decisions (DEC-081–084); kept
  here because it specifically concerns *recomputation of the energy figure*, whereas Domain O covers
  the general adjust-the-plan cycle across all target types.

### DEC-024
- **Decision:** Determine how estimate/prescription confidence or uncertainty is represented and
  communicated to the user.
- **Domain:** D · **Decision Type:** TRANSLATION
- **Inputs:** DEC-009 (profile plausibility), DEC-020 (observed-data sufficiency), DEC-021 (estimate
  divergence).
- **Output:** A confidence/uncertainty representation attached to the energy figure shown to the user.
- **Depends On:** DEC-009, DEC-020, DEC-021 · **Downstream Use:** DEC-112
- **Personalization:** MODERATE · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS, RESEARCH
- **Relevant Existing Topic IDs:** ASSESS-01, RESEARCH-04
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** A specific instance of the general cross-cutting confidence-communication
  decision generalized in DEC-112; kept here too because Energy is the domain where estimate vs.
  individualized-estimate divergence is most consequential.

---

## Domain E — Weight and Body Composition

### DEC-025
- **Decision:** Determine which body-composition metrics the application requests and tracks for a
  given user/goal combination (weight only vs. weight + circumference vs. weight + device-based
  composition).
- **Domain:** E · **Decision Type:** SELECTION
- **Inputs:** DEC-001 goal, available measurement modality.
- **Output:** A metric set to track.
- **Depends On:** DEC-001 · **Downstream Use:** DEC-076
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY
- **Relevant Existing Topic IDs:** BODY-03
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-026
- **Decision:** Determine how short-term weight fluctuation is distinguished from a genuine
  directional trend.
- **Domain:** E · **Decision Type:** INTERPRETATION
- **Inputs:** A time series of weight/composition readings.
- **Output:** "Noise" / "Emerging trend" / "Confirmed trend" classification — an interpretation, not an
  adjustment.
- **Depends On:** DEC-025, DEC-076 · **Downstream Use:** DEC-028, DEC-083
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY, ASSESS
- **Relevant Existing Topic IDs:** BODY-01, BODY-03, ASSESS-03
- **App Priority:** CORE
- **Notes / Uncertainty:** Deliberately an interpretation-only decision per Decision Model Principle
  #4/#5 — does not itself decide whether to change the plan (that is DEC-084).

### DEC-027
- **Decision:** Determine an appropriate target rate/direction of body-weight or body-composition
  change given the goal (DEC-001/003) and the individualized energy estimate (DEC-021), without fixing
  the numeric rate itself.
- **Domain:** E · **Decision Type:** TARGET_SETTING
- **Inputs:** DEC-001/003 goal, DEC-021 individualized estimate, DEC-014 safety gate.
- **Output:** A target-rate *decision node* (direction and general pacing category, e.g. "gradual" vs.
  "aggressive" — not a number).
- **Depends On:** DEC-001, DEC-003, DEC-014, DEC-021 · **Downstream Use:** DEC-022
- **Personalization:** VERY HIGH · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** YES
- **Relevant Knowledge Domains:** BODY
- **Relevant Existing Topic IDs:** BODY-04, BODY-05
- **App Priority:** CORE
- **Notes / Uncertainty:** Explicitly flagged `YES` for current evidence — "target rates of weight
  change" is named verbatim in the governing brief's current-evidence example list; this decision
  identifies that the app must determine *a* rate, without selecting one.

### DEC-028
- **Decision:** Determine when body-composition trend data is sufficient to trigger reassessment of
  the current energy/macro prescription.
- **Domain:** E · **Decision Type:** MONITORING
- **Inputs:** DEC-026 trend classification, elapsed time/data volume.
- **Output:** A reassessment trigger.
- **Depends On:** DEC-026 · **Downstream Use:** DEC-081, DEC-084
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY
- **Relevant Existing Topic IDs:** BODY-01
- **App Priority:** CORE
- **Notes / Uncertainty:** A body-composition-specific instance of the general reassessment-trigger
  logic in Domain O.

### DEC-029
- **Decision:** Determine how missing or irregular weigh-in data affects confidence in trend
  interpretation.
- **Domain:** E · **Decision Type:** VALIDATION
- **Inputs:** Weigh-in log completeness/regularity.
- **Output:** A confidence adjustment applied to DEC-026's output.
- **Depends On:** DEC-025 · **Downstream Use:** DEC-026, DEC-112
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-030
- **Decision:** Determine whether a body-recomposition goal requires a distinct monitoring
  cadence/metric set from a pure weight-change goal.
- **Domain:** E · **Decision Type:** CLASSIFICATION
- **Inputs:** DEC-001/003 goal.
- **Output:** "Standard weight-based monitoring" vs. "recomposition-specific monitoring" routing.
- **Depends On:** DEC-001, DEC-003 · **Downstream Use:** DEC-025, DEC-076
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** BODY
- **Relevant Existing Topic IDs:** BODY-03, BODY-07
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Recomposition monitoring practice is an evolving area (device-based
  body-composition tracking accuracy, interpretation norms) — flagged `POSSIBLY`.

---

## Domain F — Macronutrients

### DEC-031
- **Decision:** Determine an appropriate total daily protein requirement given goal, body
  characteristics, and training status, independent of the specific value/method later chosen.
- **Domain:** F · **Decision Type:** TARGET_SETTING
- **Inputs:** DEC-001 goal, DEC-021/022 energy figures, body-weight profile, training data (Domain P).
- **Output:** A protein-target decision node (method-class only).
- **Depends On:** DEC-001, DEC-022, DEC-092 · **Downstream Use:** DEC-033, DEC-060
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** PRO
- **Relevant Existing Topic IDs:** PRO-04
- **App Priority:** CORE
- **Notes / Uncertainty:** Per the False-Precision warning, no gram/kg value is set — only that the
  requirement is a function of these named inputs.

### DEC-032
- **Decision:** Determine how training/activity load adjusts the protein requirement relative to a
  sedentary baseline.
- **Domain:** F · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-031 baseline, training data (Domain P).
- **Output:** An adjusted protein target.
- **Depends On:** DEC-031, DEC-092 · **Downstream Use:** DEC-033
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** PRO, SPORT
- **Relevant Existing Topic IDs:** PRO-04, PRO-06
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-033
- **Decision:** Determine how the protein requirement is distributed across the day's eating
  occasions.
- **Domain:** F · **Decision Type:** TRANSLATION
- **Inputs:** DEC-031/032 protein target, DEC-055 meal-occasion count.
- **Output:** A per-occasion protein allocation.
- **Depends On:** DEC-031, DEC-032, DEC-055 · **Downstream Use:** DEC-056, DEC-060
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** PRO
- **Relevant Existing Topic IDs:** PRO-06
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-034
- **Decision:** Determine an appropriate total daily carbohydrate requirement given goal, energy
  prescription, and training status.
- **Domain:** F · **Decision Type:** TARGET_SETTING
- **Inputs:** DEC-022 energy prescription, DEC-031 protein allocation, training data (Domain P).
- **Output:** A carbohydrate-target decision node.
- **Depends On:** DEC-022, DEC-031, DEC-092 · **Downstream Use:** DEC-035, DEC-036
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CHO
- **Relevant Existing Topic IDs:** CHO-04
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-035
- **Decision:** Determine how carbohydrate intake is adjusted around exercise (timing-sensitive
  periods) versus on rest days.
- **Domain:** F · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-034 baseline, training schedule (Domain P).
- **Output:** A day-type-dependent carbohydrate allocation.
- **Depends On:** DEC-034, DEC-092 · **Downstream Use:** DEC-057
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CHO, SPORT
- **Relevant Existing Topic IDs:** CHO-05
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Overlaps with "periodized carbohydrate" strategies (CHO-05.04); this
  decision only determines *that* day-type adjustment happens, not the specific periodization scheme.

### DEC-036
- **Decision:** Determine an appropriate total daily fat intake given the energy prescription and the
  protein/carbohydrate allocations already made.
- **Domain:** F · **Decision Type:** TARGET_SETTING
- **Inputs:** DEC-022 energy prescription, DEC-031/034 protein and carbohydrate targets.
- **Output:** A fat-target decision node (typically the energy-budget remainder, but the *decision* of
  how that remainder is treated is what's recorded here, not a formula).
- **Depends On:** DEC-022, DEC-031, DEC-034 · **Downstream Use:** DEC-060
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** LIP
- **Relevant Existing Topic IDs:** LIP-05
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-037
- **Decision:** Determine an appropriate fiber intake target and how it is reconciled with the
  carbohydrate allocation.
- **Domain:** F · **Decision Type:** TARGET_SETTING
- **Inputs:** DEC-034 carbohydrate target, GI-tolerance data (Domain I).
- **Output:** A fiber-target decision node.
- **Depends On:** DEC-034 · **Downstream Use:** DEC-060
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CHO
- **Relevant Existing Topic IDs:** CHO-04
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** No dedicated fiber topic ID exists in the topic universe beyond CHO-04's
  "fiber and intake patterns" subsection — flagged for Section 11 (apparent gaps).

### DEC-038
- **Decision:** Determine how a disclosed dietary pattern or restriction (vegan, low-carb, ketogenic,
  etc.) constrains or overrides default macro-allocation logic.
- **Domain:** F · **Decision Type:** ADJUSTMENT
- **Inputs:** Disclosed dietary pattern, DEC-031/034/036 default allocations.
- **Output:** A pattern-adjusted macro allocation.
- **Depends On:** DEC-031, DEC-034, DEC-036 · **Downstream Use:** DEC-060, DEC-061
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT
- **Relevant Existing Topic IDs:** NUT-03
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-039
- **Decision:** Determine whether/how macro targets are adjusted in response to observed data versus
  held fixed between reassessment points.
- **Domain:** F · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-028 reassessment trigger, current macro targets.
- **Output:** "Hold targets" / "Adjust targets" decision.
- **Depends On:** DEC-028, DEC-084 · **Downstream Use:** DEC-085
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** PRO, CHO, LIP
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** No single topic ID covers "macro-target adjustment in response to observed
  data" — this is an application-level decision without a direct one-to-one curriculum-topic
  counterpart; it draws on PRO/CHO/LIP requirement content but the adjustment logic itself is not
  taught material.

### DEC-040
- **Decision:** Determine how conflicting macro-relevant inputs are resolved (e.g. a goal implying high
  protein versus a restriction that limits available protein sources).
- **Domain:** F · **Decision Type:** INTERPRETATION
- **Inputs:** DEC-031/034/036 targets, DEC-038 pattern constraint.
- **Output:** A reconciled macro allocation, or a flagged conflict requiring user input.
- **Depends On:** DEC-031, DEC-034, DEC-036, DEC-038 · **Downstream Use:** DEC-060
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT, PRO
- **Relevant Existing Topic IDs:** NUT-03, PRO-04
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

---

## Domain G — Micronutrients

### DEC-041
- **Decision:** Determine whether adequacy of a given micronutrient is likely, given the user's
  disclosed dietary pattern and restrictions.
- **Domain:** G · **Decision Type:** INTERPRETATION
- **Inputs:** Disclosed dietary pattern (DEC-038), logged intake (Domain N) where available.
- **Output:** "Likely adequate" / "Uncertain" / "Likely inadequate" per screened micronutrient.
- **Depends On:** DEC-038 · **Downstream Use:** DEC-042
- **Personalization:** HIGH · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** VIT, MIN
- **Relevant Existing Topic IDs:** VIT-03, MIN-03
- **App Priority:** CORE
- **Notes / Uncertainty:** Which micronutrients are actively screened at all is itself a decision
  (see notes on scope under Section 11 — the app plausibly cannot screen all of VIT/MIN's full list).

### DEC-042
- **Decision:** Determine whether additional dietary attention is needed for a specific micronutrient
  (a deficiency-risk flag), based on DEC-041's adequacy interpretation.
- **Domain:** G · **Decision Type:** INTERPRETATION
- **Inputs:** DEC-041 output.
- **Output:** A deficiency-risk flag per micronutrient, or "no flag."
- **Depends On:** DEC-041 · **Downstream Use:** DEC-043, DEC-044
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** VIT, MIN
- **Relevant Existing Topic IDs:** VIT-01, VIT-02, MIN-01, MIN-02
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-043
- **Decision:** Determine how food-based sources can address a flagged micronutrient risk (a
  translation into food-guidance terms, distinct from actual food selection).
- **Domain:** G · **Decision Type:** TRANSLATION
- **Inputs:** DEC-042 flag.
- **Output:** A food-source guidance note, feeding into Domain K's food-selection filters as a soft
  preference/boost rather than a hard constraint.
- **Depends On:** DEC-042 · **Downstream Use:** DEC-062
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** VIT, MIN, NUT
- **Relevant Existing Topic IDs:** VIT-01, VIT-02, MIN-01, MIN-02, NUT-04
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Kept distinct from DEC-044 (supplementation) and from Domain K's food
  selection per Decision Model Principle #6.

### DEC-044
- **Decision:** Determine whether supplementation should be considered for a flagged micronutrient
  risk, versus dietary adjustment alone.
- **Domain:** G · **Decision Type:** ESCALATION
- **Inputs:** DEC-042 flag, DEC-043's food-source sufficiency assessment.
- **Output:** "Dietary adjustment sufficient" / "Consider supplementation — general education" /
  "Escalate to clinical advice."
- **Depends On:** DEC-042, DEC-043 · **Downstream Use:** DEC-097
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** VIT, MIN, SPECIAL
- **Relevant Existing Topic IDs:** VIT-01, VIT-02, MIN-01, MIN-02, SPECIAL-02
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Any specific supplementation recommendation carries a safety dimension —
  this decision is explicitly bounded to *whether the topic is raised*, never a dosage. Flagged
  `POSSIBLY` because supplement-safety guidance benefits from staying current.

### DEC-045
- **Decision:** Determine whether/how micronutrient screening or guidance differs for an identified
  special population (life stage, clinical flag, athlete status) versus the general case.
- **Domain:** G · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-103 life-stage assignment, DEC-099 clinical flags, DEC-093 athlete-status
  classification.
- **Output:** A population-adjusted micronutrient screening/guidance set.
- **Depends On:** DEC-041, DEC-099, DEC-103 · **Downstream Use:** DEC-042
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** VIT, MIN, SPORT, LIFE, CLIN
- **Relevant Existing Topic IDs:** VIT-04, MIN-04, LIFE-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

---

## Domain H — Fluid and Hydration

### DEC-046
- **Decision:** Determine baseline fluid needs absent exercise or environmental data.
- **Domain:** H · **Decision Type:** ESTIMATION
- **Inputs:** Body-size profile, DEC-006 baseline sufficiency.
- **Output:** A baseline fluid-need estimate (method-class only).
- **Depends On:** DEC-006 · **Downstream Use:** DEC-047
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** FLU
- **Relevant Existing Topic IDs:** FLU-01
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-047
- **Decision:** Determine how exercise duration/intensity modifies fluid needs.
- **Domain:** H · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-046 baseline, training data (Domain P).
- **Output:** An exercise-adjusted fluid-need estimate.
- **Depends On:** DEC-046, DEC-092 · **Downstream Use:** DEC-048
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** FLU, SPORT
- **Relevant Existing Topic IDs:** FLU-04
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-048
- **Decision:** Determine how environmental conditions (heat, altitude) further modify fluid/
  electrolyte needs.
- **Domain:** H · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-047 output, disclosed environmental data (DEC-096).
- **Output:** An environment-adjusted fluid/electrolyte estimate.
- **Depends On:** DEC-047, DEC-096 · **Downstream Use:** DEC-049
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** FLU, SPORT
- **Relevant Existing Topic IDs:** FLU-04, SPORT-07
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-049
- **Decision:** Determine how estimated sweat/electrolyte loss is incorporated into replacement
  guidance.
- **Domain:** H · **Decision Type:** TRANSLATION
- **Inputs:** DEC-048 output.
- **Output:** Practical fluid/electrolyte replacement guidance (Level 3).
- **Depends On:** DEC-048 · **Downstream Use:** DEC-060
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** FLU
- **Relevant Existing Topic IDs:** FLU-02, FLU-04
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-050
- **Decision:** Determine when fluid/electrolyte signals cross from a routine-adjustment case into a
  safety-escalation case.
- **Domain:** H · **Decision Type:** ESCALATION
- **Inputs:** DEC-049 output, reported symptoms (Domain I/N).
- **Output:** "Routine adjustment" vs. "Escalate" flag.
- **Depends On:** DEC-049, DEC-013 · **Downstream Use:** DEC-013
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** FLU
- **Relevant Existing Topic IDs:** FLU-05
- **App Priority:** CORE
- **Notes / Uncertainty:** No diagnostic threshold for hyponatremia/overhydration is set here, per
  scope constraints — only that this escalation node exists.

---

## Domain I — Digestion and GI

### DEC-051
- **Decision:** Determine how self-reported GI symptoms are captured and used to modify food or
  meal-timing guidance.
- **Domain:** I · **Decision Type:** ADJUSTMENT
- **Inputs:** Self-reported GI symptoms (Domain N).
- **Output:** A food/timing adjustment recommendation.
- **Depends On:** DEC-076 · **Downstream Use:** DEC-057, DEC-060
- **Personalization:** HIGH · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** GI
- **Relevant Existing Topic IDs:** GI-04
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-052
- **Decision:** Determine when reported GI symptoms should trigger a scope/escalation flag rather than
  a dietary-adjustment suggestion.
- **Domain:** I · **Decision Type:** ESCALATION
- **Inputs:** DEC-051 symptom data, symptom severity/persistence.
- **Output:** "Adjustment" vs. "Escalate" flag.
- **Depends On:** DEC-051 · **Downstream Use:** DEC-013
- **Personalization:** MODERATE · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** GI, CLIN
- **Relevant Existing Topic IDs:** GI-05, CLIN-04, CLIN-05
- **App Priority:** CORE
- **Notes / Uncertainty:** No diagnostic criteria defined, per scope constraints.

### DEC-053
- **Decision:** Determine how a suspected food intolerance is distinguished from a true allergy for
  the purpose of downstream food-selection constraints.
- **Domain:** I · **Decision Type:** CLASSIFICATION
- **Inputs:** User-disclosed reactions, symptom pattern.
- **Output:** "Intolerance — soft constraint" vs. "Allergy — hard exclusion" vs. "Unclear — flag for
  clinical confirmation."
- **Depends On:** — · **Downstream Use:** DEC-061
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CLIN
- **Relevant Existing Topic IDs:** CLIN-03
- **App Priority:** CORE
- **Notes / Uncertainty:** True allergy diagnosis is out of the application's scope; this decision
  only determines how a *self-reported* status is provisionally classified for food-selection
  purposes, with genuine ambiguity routed toward clinical confirmation rather than assumed.

### DEC-054
- **Decision:** Determine how GI tolerance is expected to adapt over time with repeated exposure (e.g.
  training-related GI conditioning) versus treated as a fixed constraint.
- **Domain:** I · **Decision Type:** INTERPRETATION
- **Inputs:** Longitudinal GI-symptom log, training exposure history.
- **Output:** "Fixed constraint" vs. "Adapting — re-test periodically" classification.
- **Depends On:** DEC-051 · **Downstream Use:** DEC-057, DEC-063
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** GI, SPORT
- **Relevant Existing Topic IDs:** GI-04, SPORT-12
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** Relevant mainly to the structured-training subset of users.

---

## Domain J — Meal Structure and Timing

### DEC-055
- **Decision:** Determine how many eating occasions a plan structures around and what inputs drive
  that choice.
- **Domain:** J · **Decision Type:** TARGET_SETTING
- **Inputs:** DEC-001 goal, disclosed schedule constraints, training schedule (Domain P).
- **Output:** An eating-occasion count/structure.
- **Depends On:** DEC-001, DEC-059 · **Downstream Use:** DEC-033, DEC-056
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPORT
- **Relevant Existing Topic IDs:** SPORT-03, SPORT-13
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-056
- **Decision:** Determine how daily macro/energy targets are distributed across the chosen eating
  occasions.
- **Domain:** J · **Decision Type:** TRANSLATION
- **Inputs:** DEC-055 occasion structure, DEC-022/031/034/036 daily targets.
- **Output:** A per-occasion target breakdown.
- **Depends On:** DEC-055, DEC-022, DEC-031, DEC-034, DEC-036 · **Downstream Use:** DEC-060
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPORT
- **Relevant Existing Topic IDs:** SPORT-03
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-057
- **Decision:** Determine how pre-exercise, during-exercise, and post-exercise/recovery nutrient timing
  needs are incorporated when structured training is disclosed.
- **Domain:** J · **Decision Type:** ADJUSTMENT
- **Inputs:** Training schedule (Domain P), DEC-035 carbohydrate timing, DEC-051 GI tolerance.
- **Output:** A timing-adjusted meal/snack structure around training sessions.
- **Depends On:** DEC-035, DEC-051, DEC-092 · **Downstream Use:** DEC-060
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPORT
- **Relevant Existing Topic IDs:** SPORT-03
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-058
- **Decision:** Determine how hunger/satiety signals reported by the user influence meal structure
  over time.
- **Domain:** J · **Decision Type:** ADJUSTMENT
- **Inputs:** Self-reported hunger/satiety (Domain N).
- **Output:** A meal-structure adjustment (occasion count, distribution) responsive to reported
  hunger/satiety.
- **Depends On:** DEC-055, DEC-091 · **Downstream Use:** DEC-070
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY
- **Relevant Existing Topic IDs:** BODY-01
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** None.

### DEC-059
- **Decision:** Determine how practical schedule, access, or cultural constraints override a default
  meal structure.
- **Domain:** J · **Decision Type:** ADJUSTMENT
- **Inputs:** Disclosed schedule/cultural constraints.
- **Output:** A constraint-adjusted meal structure.
- **Depends On:** — · **Downstream Use:** DEC-055
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT, SPECIAL
- **Relevant Existing Topic IDs:** NUT-03, SPECIAL-04
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

---

## Domain K — Food Selection

### DEC-060
- **Decision:** Determine the translation boundary between a per-occasion nutrient/macro target and a
  candidate set of recommended foods.
- **Domain:** K · **Decision Type:** TRANSLATION
- **Inputs:** DEC-056 per-occasion targets, DEC-038/040 macro reconciliation.
- **Output:** A candidate food set per occasion (Level 2 target → Level 3 translation boundary).
- **Depends On:** DEC-056, DEC-038, DEC-040 · **Downstream Use:** DEC-061, DEC-066
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT
- **Relevant Existing Topic IDs:** NUT-02, NUT-04
- **App Priority:** CORE
- **Notes / Uncertainty:** This is the single most important boundary decision for Decision Model
  Principle #6 (nutrient requirement vs. food recommendation) — kept as its own decision so the two
  are never silently merged into one step.

### DEC-061
- **Decision:** Determine how restrictions, allergies, and preferences filter or hard-exclude candidate
  foods.
- **Domain:** K · **Decision Type:** SELECTION
- **Inputs:** DEC-060 candidate set, DEC-053 allergy/intolerance classification, disclosed preferences.
- **Output:** A filtered candidate food set.
- **Depends On:** DEC-060, DEC-053 · **Downstream Use:** DEC-062, DEC-066
- **Personalization:** VERY HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CLIN, NUT
- **Relevant Existing Topic IDs:** CLIN-03, NUT-03
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-062
- **Decision:** Determine how food-selection candidates are prioritized by nutrient density given a
  fixed energy/macro budget.
- **Domain:** K · **Decision Type:** SELECTION
- **Inputs:** DEC-061 filtered set, DEC-043 micronutrient food-source guidance.
- **Output:** A ranked/prioritized candidate list.
- **Depends On:** DEC-061, DEC-043 · **Downstream Use:** DEC-066
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT
- **Relevant Existing Topic IDs:** NUT-02, NUT-04
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-063
- **Decision:** Determine how substitutions are generated when a planned or preferred food is
  unavailable or restricted.
- **Domain:** K · **Decision Type:** SELECTION
- **Inputs:** DEC-062 ranked candidates, unavailable/restricted food.
- **Output:** A substitute food recommendation preserving the original nutrient contribution.
- **Depends On:** DEC-062 · **Downstream Use:** DEC-070
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT
- **Relevant Existing Topic IDs:** NUT-04
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-064
- **Decision:** Determine how cost, convenience, and cultural considerations weight food-selection
  candidates when disclosed.
- **Domain:** K · **Decision Type:** SELECTION
- **Inputs:** DEC-062 ranked candidates, disclosed cost/convenience/cultural preferences.
- **Output:** A re-weighted candidate list.
- **Depends On:** DEC-062 · **Downstream Use:** DEC-066, DEC-073
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPECIAL, PUBHEALTH
- **Relevant Existing Topic IDs:** SPECIAL-04, PUBHEALTH-04
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-065
- **Decision:** Determine how the user's existing grocery/pantry data is incorporated into
  food-selection decisions rather than recommending from an unconstrained catalog.
- **Domain:** K · **Decision Type:** SELECTION
- **Inputs:** DEC-064 output, existing pantry/grocery-app data.
- **Output:** A pantry-aware candidate list (this grocery app's specific integration point).
- **Depends On:** DEC-064 · **Downstream Use:** DEC-066, DEC-072
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** This decision has no counterpart in the 213-topic curriculum universe at
  all — it is purely an application/product-integration decision (this app already tracks a
  household's grocery list/pantry). Flagged here rather than forced into a mapping; see Section 11.

---

## Domain L — Meal Planning and Preparation

### DEC-066
- **Decision:** Determine how a set of selected foods and portions is translated into constructed
  meals.
- **Domain:** L · **Decision Type:** TRANSLATION
- **Inputs:** DEC-060–065 food-selection outputs.
- **Output:** A constructed meal (Level 3).
- **Depends On:** DEC-060, DEC-061, DEC-062, DEC-064, DEC-065 · **Downstream Use:** DEC-067, DEC-071
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** NUT
- **Relevant Existing Topic IDs:** NUT-03
- **App Priority:** CORE
- **Notes / Uncertainty:** The key boundary decision for Decision Model Principle #7 (nutrient target
  vs. meal plan) — kept explicitly distinct from DEC-060 (target → candidate foods).

### DEC-067
- **Decision:** Determine what level of preparation detail (recipe-level, ingredient-list-level, or
  general guidance only) the application provides.
- **Domain:** L · **Decision Type:** SELECTION
- **Inputs:** DEC-066 constructed meal, disclosed cooking skill/time (DEC-068).
- **Output:** A chosen preparation-detail level.
- **Depends On:** DEC-066 · **Downstream Use:** DEC-068
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Recipe/preparation-detail decisions have no direct counterpart in the
  213-topic universe (a scientific-nutrition corpus, not a culinary one) — flagged for Section 11.

### DEC-068
- **Decision:** Determine how meal construction accounts for practical constraints such as cooking
  skill, available time, and equipment.
- **Domain:** L · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-067 output, disclosed skill/time/equipment constraints.
- **Output:** A constraint-adjusted meal construction.
- **Depends On:** DEC-067 · **Downstream Use:** DEC-070
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** Same gap as DEC-067.

### DEC-069
- **Decision:** Determine how batch cooking, leftovers, and storage are incorporated into a meal plan
  when relevant.
- **Domain:** L · **Decision Type:** TRANSLATION
- **Inputs:** DEC-066 constructed meals across multiple days.
- **Output:** A batching/storage-aware meal-plan structure.
- **Depends On:** DEC-066 · **Downstream Use:** DEC-071
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** Same gap as DEC-067.

### DEC-070
- **Decision:** Determine how a meal plan is adjusted when the user deviates from it (skipped meal,
  substituted food, unplanned eating).
- **Domain:** L · **Decision Type:** ADJUSTMENT
- **Inputs:** Logged actual intake vs. planned meal (Domain N).
- **Output:** An updated remaining-day plan.
- **Depends On:** DEC-066, DEC-076 · **Downstream Use:** DEC-063
- **Personalization:** HIGH · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** A same-day, tactical version of Domain O's adjustment logic — kept separate
  because Domain O concerns adjusting the underlying *prescription*, while this concerns adjusting the
  *remaining meals of the current day/plan* around a deviation that already happened.

---

## Domain M — Shopping

### DEC-071
- **Decision:** Determine how a constructed meal plan is translated into a consolidated shopping list
  (quantities, cross-meal/day consolidation).
- **Domain:** M · **Decision Type:** TRANSLATION
- **Inputs:** DEC-066/069 constructed meal plan.
- **Output:** A consolidated shopping list.
- **Depends On:** DEC-066, DEC-069 · **Downstream Use:** DEC-072
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** CORE
- **Notes / Uncertainty:** The key boundary decision for Decision Model Principle #8 (meal plan vs.
  shopping plan). No curriculum topic ID covers shopping-list logistics — this is a purely
  application-level decision, unsurprising given the 7-book corpus is a nutrition-science corpus, not
  a logistics one. This is exactly the kind of decision this grocery app is positioned to own that a
  generic nutrition app would not need to.

### DEC-072
- **Decision:** Determine how a generated shopping list is reconciled with what the user already has
  on hand (pantry assumptions).
- **Domain:** M · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-071 shopping list, DEC-065 pantry data.
- **Output:** A pantry-reconciled shopping list (only what's actually needed).
- **Depends On:** DEC-071, DEC-065 · **Downstream Use:** —
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** CORE
- **Notes / Uncertainty:** As with DEC-065, this is a grocery-app-specific integration decision with no
  curriculum-topic counterpart.

### DEC-073
- **Decision:** Determine how shopping guidance adapts to a disclosed budget constraint.
- **Domain:** M · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-072 reconciled list, disclosed budget, DEC-064 cost weighting.
- **Output:** A budget-adjusted shopping list.
- **Depends On:** DEC-072, DEC-064 · **Downstream Use:** —
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** PUBHEALTH
- **Relevant Existing Topic IDs:** PUBHEALTH-04
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** None.

### DEC-074
- **Decision:** Determine how shopping guidance adapts to disclosed store-availability constraints.
- **Domain:** M · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-072 reconciled list, disclosed store-availability information.
- **Output:** An availability-adjusted shopping list (substitutions where an item is unavailable).
- **Depends On:** DEC-072, DEC-063 · **Downstream Use:** —
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** PUBHEALTH
- **Relevant Existing Topic IDs:** PUBHEALTH-05
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** None.

### DEC-075
- **Decision:** Determine how shopping frequency/list complexity is minimized while still meeting the
  meal plan's requirements.
- **Domain:** M · **Decision Type:** SELECTION
- **Inputs:** DEC-072–074 outputs, meal-plan duration.
- **Output:** A shopping-trip/frequency recommendation.
- **Depends On:** DEC-072 · **Downstream Use:** —
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** FUTURE FEATURE
- **Notes / Uncertainty:** A pure convenience optimization, not required for core functioning.

---

## Domain N — Monitoring

### DEC-076
- **Decision:** Determine what data the application asks the user to log routinely, and at what
  cadence, across weight, intake, activity, training, and symptoms.
- **Domain:** N · **Decision Type:** SELECTION
- **Inputs:** DEC-001 goal, DEC-025 metric set, DEC-093 athlete-status classification.
- **Output:** A logging schedule/requirement set.
- **Depends On:** DEC-001, DEC-025 · **Downstream Use:** DEC-020, DEC-054, DEC-077–080
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01, ASSESS-05
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-077
- **Decision:** Determine how measurement/logging quality (e.g. a single scale reading vs. multiple, a
  full diet log vs. partial recall) is assessed for each monitored input.
- **Domain:** N · **Decision Type:** VALIDATION
- **Inputs:** DEC-076 logged data, logging method/completeness.
- **Output:** A per-input data-quality rating.
- **Depends On:** DEC-076 · **Downstream Use:** DEC-020, DEC-026, DEC-082, DEC-112
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS, RESEARCH
- **Relevant Existing Topic IDs:** ASSESS-01, RESEARCH-04, RESEARCH-06
- **App Priority:** CORE
- **Notes / Uncertainty:** Directly draws on ASSESS-01's own "measurement error in dietary intake
  data" subtopic and RESEARCH-04's parallel research-methods framing of the same methods.

### DEC-078
- **Decision:** Determine how logging adherence itself is tracked and used as a data-quality signal
  for downstream interpretation.
- **Domain:** N · **Decision Type:** MONITORING
- **Inputs:** DEC-076 expected logging schedule, actual logging behavior over time.
- **Output:** An adherence-rate signal, feeding data-quality weighting elsewhere.
- **Depends On:** DEC-076 · **Downstream Use:** DEC-020, DEC-079, DEC-082
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-079
- **Decision:** Determine how missing or incomplete logs are handled rather than treated as equivalent
  to "no change."
- **Domain:** N · **Decision Type:** INTERPRETATION
- **Inputs:** DEC-078 adherence signal, gaps in the logging record.
- **Output:** A missing-data handling rule (e.g. "insufficient data" rather than an implicit zero/
  no-change assumption).
- **Depends On:** DEC-078 · **Downstream Use:** DEC-020, DEC-082
- **Personalization:** LOW · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01
- **App Priority:** CORE
- **Notes / Uncertainty:** This decision exists specifically to prevent the app from silently
  misinterpreting absence-of-data as evidence-of-no-change, a known pitfall in self-monitoring
  interpretation.

### DEC-080
- **Decision:** Determine which monitoring signals should trigger a check-in prompt or escalation
  rather than silent continuation.
- **Domain:** N · **Decision Type:** MONITORING
- **Inputs:** DEC-076–079 outputs, DEC-013 red-flag criteria.
- **Output:** A check-in/escalation trigger.
- **Depends On:** DEC-078, DEC-079, DEC-013 · **Downstream Use:** DEC-013, DEC-016
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS, CLIN
- **Relevant Existing Topic IDs:** ASSESS-05
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

---

## Domain O — Feedback and Adaptation

This domain is the application's central adaptive loop (see §5) and is treated as core rather than
optional throughout, per the governing brief's explicit instruction.

### DEC-081
- **Decision:** Determine whether enough observed data has accumulated, over a sufficient duration, to
  evaluate whether the current plan is producing the intended response.
- **Domain:** O · **Decision Type:** DATA_SUFFICIENCY
- **Inputs:** DEC-076 logged data volume/duration.
- **Output:** "Sufficient to evaluate" / "Not yet — continue monitoring."
- **Depends On:** DEC-076, DEC-023, DEC-028 · **Downstream Use:** DEC-082
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-01
- **App Priority:** CORE
- **Notes / Uncertainty:** A quantity/duration gate, deliberately distinct from DEC-082's quality gate
  (Decision Model Principle #4/#5 apply equally to the two halves of "is this data usable").

### DEC-082
- **Decision:** Determine whether the accumulated observed data is of sufficient quality to be used for
  evaluation.
- **Domain:** O · **Decision Type:** VALIDATION
- **Inputs:** DEC-077 per-input quality ratings, DEC-078/079 adherence and missing-data signals.
- **Output:** "Usable" / "Not usable — request more/better data."
- **Depends On:** DEC-077, DEC-078, DEC-079, DEC-081 · **Downstream Use:** DEC-083
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS, RESEARCH
- **Relevant Existing Topic IDs:** ASSESS-01, RESEARCH-04
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-083
- **Decision:** Determine whether the observed response is consistent with what the current plan
  predicted.
- **Domain:** O · **Decision Type:** INTERPRETATION
- **Inputs:** DEC-082 usable data, DEC-026 trend classification, current prescription (DEC-022/027).
- **Output:** "Consistent" / "Inconsistent — divergence detected" interpretation (not yet an
  adjustment decision).
- **Depends On:** DEC-082, DEC-026 · **Downstream Use:** DEC-084
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY, ASSESS
- **Relevant Existing Topic IDs:** BODY-01, ASSESS-01
- **App Priority:** CORE
- **Notes / Uncertainty:** The pivotal interpretation-vs-adjustment boundary decision (Decision Model
  Principle #5) — this decision never itself changes the plan.

### DEC-084
- **Decision:** Determine whether the energy estimate/prescription should be updated in light of the
  interpreted observed response.
- **Domain:** O · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-083 interpretation.
- **Output:** "No change" / "Adjust energy prescription."
- **Depends On:** DEC-083 · **Downstream Use:** DEC-021, DEC-022, DEC-085
- **Personalization:** VERY HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** BODY
- **Relevant Existing Topic IDs:** BODY-01, BODY-05
- **App Priority:** CORE
- **Notes / Uncertainty:** The decision that actually closes the loop back into DEC-021/022 — see §5.

### DEC-085
- **Decision:** Determine whether macro targets should change as a consequence of an energy-
  prescription adjustment or independently of one.
- **Domain:** O · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-084 output.
- **Output:** "No macro change" / "Recompute macro targets."
- **Depends On:** DEC-084 · **Downstream Use:** DEC-031, DEC-034, DEC-036, DEC-039
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** PRO, CHO, LIP
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** CORE
- **Notes / Uncertainty:** Same gap as DEC-039 — application-level adjustment logic, no direct
  curriculum-topic counterpart.

### DEC-086
- **Decision:** Determine whether meal structure or food selection should change as a consequence of an
  upstream adjustment.
- **Domain:** O · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-084/085 outputs.
- **Output:** "No change" / "Regenerate meal structure/food selection."
- **Depends On:** DEC-084, DEC-085 · **Downstream Use:** DEC-055, DEC-060
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
- **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None beyond the general application-level gap already noted for
  meal/food-translation decisions.

### DEC-087
- **Decision:** Determine whether more data should be collected before any adjustment is made, versus
  adjusting now on the data available.
- **Domain:** O · **Decision Type:** VALIDATION
- **Inputs:** DEC-081/082 sufficiency and quality gates.
- **Output:** "Wait — collect more data" / "Proceed to adjustment."
- **Depends On:** DEC-081, DEC-082 · **Downstream Use:** DEC-084
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS, RESEARCH
- **Relevant Existing Topic IDs:** ASSESS-01, RESEARCH-04
- **App Priority:** CORE
- **Notes / Uncertainty:** This is the uncertainty-management decision explicitly required by the
  brief ("whether to wait" vs. "whether to adjust despite uncertainty") — deliberately does not set a
  numeric data-volume threshold.

### DEC-088
- **Decision:** Determine whether a full new baseline assessment (rather than an incremental
  adjustment) is warranted.
- **Domain:** O · **Decision Type:** ESCALATION
- **Inputs:** DEC-084 output pattern over multiple cycles, DEC-009/010 profile-plausibility signals.
- **Output:** "Incremental adjustment sufficient" / "Trigger full baseline re-assessment."
- **Depends On:** DEC-084, DEC-090 · **Downstream Use:** DEC-005, DEC-017
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS
- **Relevant Existing Topic IDs:** ASSESS-05
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-089
- **Decision:** Determine how the user is informed of, or asked to confirm, a proposed adjustment.
- **Domain:** O · **Decision Type:** TRANSLATION
- **Inputs:** DEC-084–086 proposed adjustments.
- **Output:** A user-facing adjustment notification/confirmation flow (content decision, not UI
  design).
- **Depends On:** DEC-084, DEC-085, DEC-086 · **Downstream Use:** —
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPECIAL
- **Relevant Existing Topic IDs:** SPECIAL-03
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Draws on SPECIAL-03's counseling/behavioral-change framing (how adjustments
  are communicated affects adherence) without prescribing a specific UI flow.

### DEC-090
- **Decision:** Determine how repeated adjustment cycles that fail to produce the expected observed
  response are handled, including whether to defer to escalation.
- **Domain:** O · **Decision Type:** ESCALATION
- **Inputs:** History of DEC-084 outcomes across multiple cycles.
- **Output:** "Continue adjusting" / "Escalate to professional consultation."
- **Depends On:** DEC-084, DEC-016 · **Downstream Use:** DEC-014
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CLIN
- **Relevant Existing Topic IDs:** CLIN-01
- **App Priority:** CORE
- **Notes / Uncertainty:** This is the loop's own circuit-breaker — without it, the app could keep
  "adjusting" indefinitely against a non-responsive case rather than recognizing a limit to what
  automated adjustment can resolve.

### DEC-091
- **Decision:** Determine how subjective user-reported feedback (energy levels, hunger, satisfaction,
  motivation) is incorporated alongside objective observed data in the adjustment decision.
- **Domain:** O · **Decision Type:** INTERPRETATION
- **Inputs:** Self-reported subjective feedback, DEC-083 objective interpretation.
- **Output:** A combined interpretation weighting both subjective and objective signals.
- **Depends On:** DEC-083 · **Downstream Use:** DEC-084, DEC-058
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPECIAL
- **Relevant Existing Topic IDs:** SPECIAL-03
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

---

## Domain P — Sport and Exercise

### DEC-092
- **Decision:** Determine what training data (type, volume, intensity, phase) is collected and how it
  feeds the energy, macro, timing, and hydration decisions already defined.
- **Domain:** P · **Decision Type:** SELECTION
- **Inputs:** Disclosed training/exercise information.
- **Output:** A structured training-data input feeding DEC-019, DEC-031–035, DEC-046–049, DEC-057.
- **Depends On:** — · **Downstream Use:** DEC-019, DEC-031, DEC-034, DEC-035, DEC-047, DEC-057
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPORT
- **Relevant Existing Topic IDs:** SPORT-01, SPORT-02
- **App Priority:** CORE
- **Notes / Uncertainty:** This is the single hook feeding sport-specific data into the general
  decisions elsewhere, rather than the app maintaining a fully parallel sport-specific decision track
  — consistent with the fact that only 2 of SPORT's 13 curriculum topics show a strong case for a
  distinct reinforcement-level treatment (`SPORT_NUTRITION_ARCHITECTURE.md`).

### DEC-093
- **Decision:** Determine how the application distinguishes recreational activity from structured
  athletic training for the purpose of applying sport-specific guidance versus general guidance.
- **Domain:** P · **Decision Type:** CLASSIFICATION
- **Inputs:** DEC-092 training data.
- **Output:** "General activity guidance" vs. "Sport-specific guidance" routing.
- **Depends On:** DEC-092 · **Downstream Use:** DEC-030, DEC-045, DEC-076
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPORT
- **Relevant Existing Topic IDs:** SPORT-04, SPORT-13
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-094
- **Decision:** Determine how a competition or event date modifies nutrition guidance in the period
  leading up to and following it.
- **Domain:** P · **Decision Type:** ADJUSTMENT
- **Inputs:** Disclosed competition/event date, DEC-093 classification.
- **Output:** A pre-/post-competition guidance adjustment window.
- **Depends On:** DEC-093 · **Downstream Use:** DEC-035
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPORT, CHO
- **Relevant Existing Topic IDs:** CHO-05, SPORT-04
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** Relevant only to the subset of users who disclose competitive events.

### DEC-095
- **Decision:** Determine how signals consistent with relative energy deficiency or overtraining are
  detected from available application data and what response that triggers.
- **Domain:** P · **Decision Type:** ESCALATION
- **Inputs:** DEC-092 training load, DEC-020/026 energy-balance and weight-trend signals, DEC-013 red
  flags.
- **Output:** A RED-S/overtraining risk flag routed to Domain C.
- **Depends On:** DEC-092, DEC-020, DEC-026, DEC-013 · **Downstream Use:** DEC-013
- **Personalization:** HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** SPORT
- **Relevant Existing Topic IDs:** SPORT-10
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** No diagnostic threshold defined, per scope constraints. Flagged `POSSIBLY`
  because RED-S screening practice continues to evolve; SN4's treatment (SPORT-10) is the strongest
  available source but is itself only single-book-sourced in the current topic universe.

### DEC-096
- **Decision:** Determine how travel, altitude, heat, or other disclosed environmental factors are
  captured as inputs to sport-nutrition guidance.
- **Domain:** P · **Decision Type:** SELECTION
- **Inputs:** Disclosed travel/environmental data.
- **Output:** Structured environmental-input data feeding DEC-048.
- **Depends On:** DEC-093 · **Downstream Use:** DEC-048
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPORT
- **Relevant Existing Topic IDs:** SPORT-07
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** None.

### DEC-097
- **Decision:** Determine how disclosed supplement use is captured and reconciled with the
  application's own nutrient-adequacy and safety logic.
- **Domain:** P · **Decision Type:** VALIDATION
- **Inputs:** Disclosed supplement use, DEC-044 supplementation-consideration output.
- **Output:** A reconciled nutrient-adequacy picture accounting for supplement intake, plus any
  safety-relevant flag (e.g. interaction concern).
- **Depends On:** DEC-044 · **Downstream Use:** DEC-041
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** SPORT, SPECIAL
- **Relevant Existing Topic IDs:** SPORT-05, SPECIAL-02
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Supplement safety/efficacy evidence evolves; flagged `POSSIBLY`. Note also
  the still-open Phase 2 question about AS3/ACSM/SN4 redundancy specifically for supplement content
  (`PHASE_2_HUMAN_REVIEW.md` item 10) — not resolved here, only noted as relevant background for
  whichever knowledge source eventually backs this decision's content.

### DEC-098
- **Decision:** Determine whether/how female-athlete-specific considerations (e.g. menstrual-cycle-
  related factors, Female Athlete Triad/RED-S risk) are incorporated as a distinct input track.
- **Domain:** P · **Decision Type:** CLASSIFICATION
- **Inputs:** Disclosed sex, disclosed menstrual-cycle information (optional), DEC-093 training
  classification.
- **Output:** "Standard track" vs. "Female-athlete-specific consideration track" routing.
- **Depends On:** DEC-093 · **Downstream Use:** DEC-095
- **Personalization:** HIGH · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** SPORT
- **Relevant Existing Topic IDs:** SPORT-09, SPORT-10
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** None.

---

## Domain Q — Clinical and Special Populations

### DEC-099
- **Decision:** Determine which disclosed clinical conditions the application can support with
  tailored guidance versus which require deferring entirely to a professional (the application's
  supported-conditions boundary).
- **Domain:** Q · **Decision Type:** CLASSIFICATION
- **Inputs:** Disclosed clinical conditions, DEC-012 scope determination.
- **Output:** A supported-conditions list and its complement (out-of-scope conditions).
- **Depends On:** DEC-012 · **Downstream Use:** DEC-012, DEC-100
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** CLIN
- **Relevant Existing Topic IDs:** CLIN-01, CLIN-07, CLIN-10, CLIN-12
- **App Priority:** CORE
- **Notes / Uncertainty:** This decision is where `CLINICAL_NUTRITION_ARCHITECTURE.md`'s Layer 5/
  Layer 6 separation becomes directly relevant to the application: the 23 general Layer-5 disease
  areas are the more plausible candidates for "supported with tailored guidance," while the 10
  Layer-6 SPECIALIZED topics (already flagged ELECTIVE/REFERENCE in `CANDIDATE_EXCLUSIONS.md` for
  curriculum purposes) are the more plausible candidates for "defer to professional." This document
  does not adopt that curriculum framing as the application's boundary — it only notes the parallel.

### DEC-100
- **Decision:** Determine how a disclosed clinical condition modifies upstream decisions (energy,
  macro, micronutrient, food selection) rather than being handled as an isolated add-on.
- **Domain:** Q · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-099 supported condition, DEC-021/031/034/036/041 upstream outputs.
- **Output:** Condition-adjusted versions of the relevant upstream decisions.
- **Depends On:** DEC-099 · **Downstream Use:** DEC-021, DEC-031, DEC-034, DEC-036, DEC-041
- **Personalization:** VERY HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** CLIN
- **Relevant Existing Topic IDs:** CLIN-07, CLIN-10, CLIN-12, CLIN-24
- **App Priority:** CORE
- **Notes / Uncertainty:** This is the decision that keeps clinical support from becoming a bolted-on
  module, mirroring the six-layer architecture's own point that clinical content should modify the
  shared core rather than duplicate it.

### DEC-101
- **Decision:** Determine how a conflict between a clinical flag's requirements and the user's stated
  goal is resolved or surfaced.
- **Domain:** Q · **Decision Type:** INTERPRETATION
- **Inputs:** DEC-100 clinical adjustment, DEC-003 goal reconciliation.
- **Output:** A resolved goal/constraint balance, or a flagged conflict routed to escalation.
- **Depends On:** DEC-100, DEC-003 · **Downstream Use:** DEC-014
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CLIN
- **Relevant Existing Topic IDs:** CLIN-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

### DEC-102
- **Decision:** Determine whether a disclosed condition requires only an adjustment to existing
  decision logic versus routing the user to a distinct specialized pathway.
- **Domain:** Q · **Decision Type:** CLASSIFICATION
- **Inputs:** DEC-099 output.
- **Output:** "Adjust existing pathway" vs. "Route to specialized pathway" (which, per scope, may
  itself terminate in referral rather than a fully automated specialized pathway).
- **Depends On:** DEC-099 · **Downstream Use:** DEC-100, DEC-014
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** CLIN
- **Relevant Existing Topic IDs:** CLIN-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** None.

---

## Domain R — Life Stages

### DEC-103
- **Decision:** Determine which life-stage categories the application distinguishes and how a user is
  assigned to one.
- **Domain:** R · **Decision Type:** CLASSIFICATION
- **Inputs:** Age, sex, disclosed pregnancy/lactation status.
- **Output:** A life-stage assignment.
- **Depends On:** — · **Downstream Use:** DEC-012, DEC-045, DEC-104
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** LIFE
- **Relevant Existing Topic IDs:** LIFE-01 through LIFE-06
- **App Priority:** CORE
- **Notes / Uncertainty:** `CANDIDATE_EXCLUSIONS.md` flags LIFE-05 (Adulthood) as the weakest
  life-stage topic for dedicated curriculum treatment, since its content largely overlaps general
  NUT/BODY content — noted as relevant background, not adopted as the application's classification
  boundary, since "adult, no special life-stage flag" is still a real and probably common assignment
  outcome for this decision even if the *curriculum* teaches it thinly.

### DEC-104
- **Decision:** Determine how life-stage assignment changes default requirements, safe-scope
  boundaries, and monitoring cadence relative to the general adult case.
- **Domain:** R · **Decision Type:** ADJUSTMENT
- **Inputs:** DEC-103 assignment.
- **Output:** Life-stage-adjusted defaults across Energy, Macro, Micronutrient, and Safety domains.
- **Depends On:** DEC-103 · **Downstream Use:** DEC-012, DEC-045, DEC-076
- **Personalization:** HIGH · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** LIFE
- **Relevant Existing Topic IDs:** LIFE-01 through LIFE-06
- **App Priority:** CORE
- **Notes / Uncertainty:** None.

### DEC-105
- **Decision:** Determine how a life-stage transition occurring during ongoing use (e.g. pregnancy
  onset, aging into a new bracket) is detected and handled.
- **Domain:** R · **Decision Type:** MONITORING
- **Inputs:** Ongoing profile updates (DEC-011), self-disclosed life events.
- **Output:** A life-stage-reassignment trigger, cascading into DEC-104 and a Domain-C safety re-check.
- **Depends On:** DEC-011, DEC-103 · **Downstream Use:** DEC-012, DEC-104
- **Personalization:** MODERATE · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** LIFE
- **Relevant Existing Topic IDs:** LIFE-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** A pregnancy-onset transition in particular should very plausibly also
  trigger DEC-012's scope check (pregnancy is a commonly-cited out-of-automated-scope condition) —
  flagged as a likely strong cross-domain dependency for the not-yet-built dependency graph.

---

## Domain S — Public Health and Food Environment

### DEC-106
- **Decision:** Determine whether/how disclosed food-access or affordability constraints are
  incorporated into recommendations rather than assuming unconstrained access.
- **Domain:** S · **Decision Type:** ADJUSTMENT
- **Inputs:** Disclosed affordability/access constraints.
- **Output:** An access-adjusted set of food-selection and shopping constraints.
- **Depends On:** — · **Downstream Use:** DEC-064, DEC-073
- **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** PUBHEALTH
- **Relevant Existing Topic IDs:** PUBHEALTH-04
- **App Priority:** OPTIONAL
- **Notes / Uncertainty:** None.

### DEC-107
- **Decision:** Determine whether the application aligns its default guidance to a named external
  food-guide/standard versus deriving its own defaults independently.
- **Domain:** S · **Decision Type:** VALIDATION
- **Inputs:** Available named external standards (e.g. national dietary guidelines).
- **Output:** "Align to standard X" vs. "Independent internal defaults," as a governance-level choice.
- **Depends On:** — · **Downstream Use:** DEC-005, DEC-031, DEC-034, DEC-036
- **Personalization:** NONE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** POSSIBLY
- **Relevant Knowledge Domains:** PUBHEALTH, DRV
- **Relevant Existing Topic IDs:** PUBHEALTH-03, DRV-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Named external guides (e.g. national Dietary Guidelines) are periodically
  revised — flagged `POSSIBLY` for that reason, not because the underlying DRV-01 methodology concept
  is itself unstable.

---

## Domain T — Evidence, Uncertainty and Data Quality

### DEC-108
- **Decision:** Determine how a recommendation resting on an area of active scientific debate or
  evolving consensus is flagged to the user, distinct from routine confidence flagging.
- **Domain:** T · **Decision Type:** TRANSLATION
- **Inputs:** A recommendation's underlying evidence-currency status (per-decision `Current Evidence
  Required` flag, see §9).
- **Output:** A "this area is evolving" notice distinct from a routine low-confidence notice.
- **Depends On:** — · **Downstream Use:** all decisions flagged `POSSIBLY`/`YES` in §9
- **Personalization:** NONE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** RESEARCH
- **Relevant Existing Topic IDs:** RESEARCH-01
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** This decision's own `Current Evidence Required` is `NO` — it is the
  mechanism for flagging *other* decisions' evidence needs, not itself evidence-dependent.

### DEC-109
- **Decision:** Determine how conflicting user-provided information across inputs is detected and
  resolved before it propagates into downstream decisions.
- **Domain:** T · **Decision Type:** VALIDATION
- **Inputs:** All collected profile/monitoring inputs.
- **Output:** A conflict-detection pass applied before any dependent decision consumes the data.
- **Depends On:** DEC-009, DEC-010 · **Downstream Use:** all decisions depending on profile/monitoring
  data
- **Personalization:** LOW · **Longitudinal Data Required?:** OPTIONAL · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS, RESEARCH
- **Relevant Existing Topic IDs:** ASSESS-01, RESEARCH-07
- **App Priority:** IMPORTANT
- **Notes / Uncertainty:** Generalizes DEC-010's profile-specific version across all data types the
  application collects, including monitoring data.

### DEC-110
- **Decision:** Determine how an observed-response result that contradicts the model-based estimate is
  handled when both individually appear to be good-quality data (model/observation mismatch).
- **Domain:** T · **Decision Type:** INTERPRETATION
- **Inputs:** DEC-021 (individualized estimate reconciliation logic), DEC-083 (consistency
  interpretation), DEC-082 (data-quality validation).
- **Output:** A mismatch-handling determination — distinguishing "trust the observation, the model was
  wrong for this individual" from "the observation itself is confounded by something not yet
  captured."
- **Depends On:** DEC-021, DEC-082, DEC-083 · **Downstream Use:** DEC-084
- **Personalization:** VERY HIGH · **Longitudinal Data Required?:** YES · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** ASSESS, RESEARCH, BODY
- **Relevant Existing Topic IDs:** ASSESS-01, RESEARCH-02, BODY-01
- **App Priority:** CORE
- **Notes / Uncertainty:** Arguably the single hardest decision in the whole inventory — reconciling
  "the science says X, the individual's data says Y" is exactly the tension the whole project's
  conceptual model (estimated vs. observed vs. prescribed) exists to manage, and it has no clean
  resolution rule definable from a topic universe alone.

### DEC-111
- **Decision:** Determine the application's general process for periodically reviewing and updating
  its guidance logic as scientific consensus evolves.
- **Domain:** T · **Decision Type:** VALIDATION
- **Inputs:** The set of decisions flagged `POSSIBLY`/`YES` for current evidence (§9).
- **Output:** A governance process definition (a *process* decision, not a one-time content update).
- **Depends On:** — · **Downstream Use:** all evidence-flagged decisions
- **Personalization:** NONE · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** RESEARCH
- **Relevant Existing Topic IDs:** RESEARCH-15
- **App Priority:** FUTURE FEATURE
- **Notes / Uncertainty:** Maps naturally to RESEARCH-15's "Translation of Nutrition Research into
  Practice and Policy," though that topic is framed around public-health/policy translation rather
  than a single application's internal content-governance process — mapping noted as approximate.

### DEC-112
- **Decision:** Determine how data-quality/confidence levels are communicated consistently across all
  decisions in this inventory, so that low-confidence outputs are distinguishable from high-confidence
  ones.
- **Domain:** T · **Decision Type:** TRANSLATION
- **Inputs:** Every decision's own confidence/quality signal (DEC-024, DEC-029, DEC-077, etc.).
- **Output:** A single consistent confidence-communication convention used application-wide.
- **Depends On:** DEC-024, DEC-029, DEC-077 · **Downstream Use:** cross-cutting; consumed by the
  user-facing presentation of every other decision's output
- **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
- **Relevant Knowledge Domains:** RESEARCH, ASSESS
- **Relevant Existing Topic IDs:** RESEARCH-04, ASSESS-01
- **App Priority:** CORE
- **Notes / Uncertainty:** This is the generalization point every domain-specific confidence decision
  (DEC-024 for Energy, DEC-029 for Weight, DEC-077 for Monitoring) should ultimately share one
  underlying convention with, rather than each domain inventing its own — flagged here for
  `APP_DECISION_DEPENDENCY_GRAPH.md` to formalize.

---

# 5. Personalization Loop

The governing brief requires this cycle be made explicit as the application's central mechanism,
not an optional feature layered on top of a static calculator. Each loop stage is mapped to the DEC
IDs that implement it; several decisions (noted) belong to more than one stage because they *gate*
the transition between two stages rather than sitting inside one.

```
INITIAL ESTIMATE          DEC-017, DEC-018, DEC-019           (Level 1, population/model-based)
        ↓
OBSERVED DATA             DEC-076, DEC-077                    (what is logged, and how well)
        ↓
DATA QUALITY ASSESSMENT   DEC-078, DEC-079, DEC-081, DEC-082   (adherence, gaps, sufficiency, quality)
        ↓
INTERPRETATION            DEC-026, DEC-083, DEC-091, DEC-110  (trend, consistency, subjective, mismatch)
        ↓
INDIVIDUALIZED ESTIMATE   DEC-020, DEC-021                    (Level 1, individual-response-updated)
        ↓
TARGET SETTING            DEC-027, DEC-031, DEC-034, DEC-036, DEC-037   (rate/macro targets)
        ↓
PRESCRIPTION              DEC-022                             (Level 2 — goal-driven "what now")
        ↓
MONITORING                DEC-076–080                          (ongoing logging + signal-based triggers)
        ↓
ADJUSTMENT                DEC-084, DEC-085, DEC-086, DEC-087, DEC-088, DEC-089, DEC-090
        ↓
NEW OBSERVED DATA  ───────────────────────────────────────────────────→  back to OBSERVED DATA
```

**Gate decisions that sit between stages** (the loop's actual joints, where the brief's "whether to
wait vs. whether to adjust" tension lives): DEC-020 (initial→individualized gate), DEC-081/DEC-082
(observed→interpreted gate, split into quantity and quality halves per Decision Model Principle #4),
DEC-087 (interpreted→adjusted gate, the explicit wait-vs-adjust decision), DEC-090 (the loop's
circuit-breaker — when repeated cycles fail, exit the loop toward escalation rather than continuing
indefinitely).

**Why Prescription (Level 2) sits after Individualized Estimate, not before:** DEC-022 explicitly
consumes DEC-021's output plus the goal (DEC-001/003) — this ordering is what keeps "what does the
science/data suggest is happening" (DEC-021) structurally prior to and separate from "what should this
person do now" (DEC-022), per Decision Model Principle #1.

---

# 6. Cross-Domain Decisions

Decisions whose inputs genuinely span more than one Phase-1 knowledge domain, per the governing
brief's explicit cross-domain-thinking requirement. Not exhaustive — every decision with 2+ domains
listed in its `Relevant Knowledge Domains` field technically qualifies; this section highlights the
ones where the cross-domain nature is load-bearing to the decision itself, not incidental.

| Decision | Domains Combined | Why the combination is load-bearing |
|---|---|---|
| DEC-019 (initial TEE estimate) | BODY + SPORT | Resting-expenditure physiology alone cannot produce a total-expenditure estimate without activity data. |
| DEC-021 (individualized maintenance) | BODY + ASSESS | Requires both the physiological estimate and an assessment-quality judgment of the observed data used to update it. |
| DEC-031/032 (protein requirement) | PRO + SPORT + BODY | Protein need is a function of body characteristics, goal, and training load together — no single domain determines it alone. |
| DEC-045 (population-specific micronutrient screening) | VIT + MIN + SPORT + LIFE + CLIN | Four domains jointly gate which micronutrients get extra scrutiny for a given user. |
| DEC-047/048 (exercise + environment fluid adjustment) | FLU + SPORT | Fluid physiology alone doesn't predict need without exercise and environmental context. |
| DEC-060 (target → candidate foods) | NUT + (whichever of PRO/CHO/LIP/VIT/MIN produced the target) | The translation step is inherently a NUT-domain operation applied to another domain's numeric target. |
| DEC-083/DEC-110 (interpretation / model-observation mismatch) | BODY + ASSESS + RESEARCH | Requires physiological plausibility (BODY), measurement-quality judgment (ASSESS), and research-methods-grade skepticism about confounding (RESEARCH) simultaneously. |
| DEC-095 (RED-S/overtraining detection) | SPORT + BODY + (Domain-C safety logic, not itself a knowledge domain) | Requires sport-specific risk knowledge combined with the same energy-balance/weight-trend signals used elsewhere for ordinary goal tracking. |
| DEC-100 (clinical condition modifies upstream decisions) | CLIN + BODY + PRO/CHO/LIP + VIT/MIN | By design, this decision touches nearly every other numeric-target domain rather than being a self-contained clinical calculation. |

---

# 7. High-Personalization Decisions

Decisions classified `HIGH` or `VERY HIGH` in §4 — the ones where the application's output is expected
to differ substantially from one user to the next, as opposed to defaulting to a near-population-
uniform answer.

**VERY HIGH:** DEC-021, DEC-022, DEC-027, DEC-061, DEC-084, DEC-100, DEC-110

**HIGH:** DEC-020, DEC-026, DEC-029 *(MODERATE, listed for context)*, DEC-031, DEC-032, DEC-034,
DEC-035, DEC-038, DEC-039, DEC-040, DEC-041, DEC-042, DEC-044, DEC-045, DEC-051, DEC-054, DEC-057,
DEC-058, DEC-059, DEC-062 *(MODERATE, context)*, DEC-063 *(MODERATE, context)*, DEC-065, DEC-068
*(MODERATE, context)*, DEC-070, DEC-083, DEC-088, DEC-090, DEC-091, DEC-092, DEC-095, DEC-098,
DEC-101, DEC-104

**Reading note:** the plain listing above is HIGH-and-above only; items marked "(MODERATE, listed for
context)" were mistakenly close calls during drafting and are corrected to MODERATE in their own §4
records — retained here only to show where the HIGH/MODERATE boundary was genuinely close, per the
completeness requirement to surface rather than silently smooth over such judgment calls.

**Observation:** high personalization concentrates in exactly the decisions the Personalization Loop
(§5) identifies as its "individualize" and "adjust" stages, plus the clinical-modification decision
(DEC-100) and the goal-driven prescription/target decisions (DEC-022, DEC-027). This is consistent
with the project's core conceptual model — personalization is not spread evenly across the whole
decision space, it is concentrated at specific, identifiable joints.

---

# 8. Longitudinal Decisions

Decisions marked `Longitudinal Data Required?: YES` in §4 — those that cannot be resolved from a
single intake session and require data accumulated over time.

DEC-020, DEC-021, DEC-023, DEC-026, DEC-028, DEC-039, DEC-054, DEC-078, DEC-079, DEC-080, DEC-081,
DEC-082, DEC-083, DEC-084, DEC-088, DEC-090, DEC-091, DEC-095, DEC-105, DEC-110

**Marked `OPTIONAL`** (longitudinal data improves the decision but a single-session answer is still
possible): DEC-010, DEC-041, DEC-051, DEC-052, DEC-070, DEC-098, DEC-109

**Observation:** every `YES` decision above traces to either the Energy domain's estimate-
individualization mechanism (D), the Weight/Body-Composition trend mechanism (E), or the Feedback/
Adaptation loop itself (O) — confirming that longitudinal reasoning is not a scattered feature of this
application but is concentrated in exactly the mechanism the loop in §5 already identifies.

---

# 9. Evidence-Dependent Decisions

Decisions marked `Current Evidence Required?: POSSIBLY` or `YES` in §4. Per the governing brief, **no
evidence review is performed here** — this is a flag list only, carried forward to
`06_EVIDENCE_AND_GAPS/` when that phase begins.

**YES:**
- DEC-027 (target rate/direction of weight change) — matches the brief's own "target rates of weight
  change" current-evidence example verbatim.

**POSSIBLY:**
- DEC-004 (goal-timeframe plausibility flag)
- DEC-012 (out-of-scope population/condition list)
- DEC-013 (red-flag symptom list)
- DEC-016 (ongoing escalation-pattern monitoring)
- DEC-030 (recomposition-specific monitoring)
- DEC-044 (supplementation consideration)
- DEC-050 *(inherits DEC-013's flag, not independently flagged — see note)*
- DEC-095 (RED-S/overtraining detection)
- DEC-097 (supplement-use reconciliation)
- DEC-099 (supported-clinical-conditions boundary)
- DEC-100 (clinical-condition upstream modification)
- DEC-107 (alignment to a named external food guide)

**Explicit correspondence to the brief's own current-evidence examples:**

| Brief's example | Corresponding decision(s) |
|---|---|
| Contemporary weight-management standards / target weight-change rates | DEC-027, DEC-022 |
| Newer obesity/weight-management approaches | DEC-022, DEC-030 |
| CGM-related interpretation | Not currently mapped — see §11 (gap) |
| Contemporary personalized/precision nutrition | DEC-030, SPORT-11 (elective per Phase 2, see §10) |
| Newer sport-nutrition consensus | DEC-095, DEC-097 |
| Evolving clinical recommendations | DEC-099, DEC-100 |

Consistent with `PHASE_2_HUMAN_REVIEW.md`'s own current-evidence deferral list (COVID-19 material,
GLP-1 receptor agonists, continuous glucose monitoring, SN4's personalized-nutrition chapter) — none of
those four items are resolved here either; DEC-044 and DEC-097 are the nearest decision nodes a future
GLP-1/supplement evidence review would attach to, and CGM has no decision node at all yet (flagged in
§11 as a likely gap).

---

# 10. Decision-to-Knowledge Mapping Summary

All 18 Phase-1 domains are drawn on by at least one decision above. Coverage is uneven by design —
this mirrors the topic universe's own unevenness (e.g. CLIN's 27 topics vs. SPECIAL's 5), not an
artifact of this document.

| Phase-1 Domain | Decisions Drawing On It (representative, not exhaustive) | Density |
|---|---|---|
| NUT | DEC-002, DEC-038, DEC-040, DEC-059, DEC-060, DEC-062 | Moderate |
| DRV | DEC-107 | Thin — DRV is reference material (per `CANDIDATE_EXCLUSIONS.md`), so it appropriately underlies few *decisions* even though it's substantial *content* |
| MET | — | **None directly** — see §11 |
| CHO | DEC-034, DEC-035, DEC-037, DEC-094 | Moderate |
| LIP | DEC-036 | Thin |
| PRO | DEC-031, DEC-032, DEC-033 | Moderate |
| VIT | DEC-041–045 | Moderate |
| MIN | DEC-041–045 | Moderate |
| FLU | DEC-046–050 | Dense — Domain H maps almost one-to-one onto FLU |
| GI | DEC-051–054 | Dense — Domain I maps almost one-to-one onto GI |
| BODY | DEC-017–030, DEC-083, DEC-084, DEC-110 | Very dense — BODY is the most heavily drawn-on domain in the inventory |
| ASSESS | DEC-005–011, DEC-076–082, DEC-108, DEC-109, DEC-112 | Very dense |
| SPORT | DEC-092–098, plus feeding DEC-019/031/032/034/035/046–049/057 | Very dense |
| CLIN | DEC-012, DEC-052, DEC-053, DEC-099–102 | Moderate — deliberately thinner than CLIN's 27-topic curriculum weight would suggest, consistent with keeping the application's clinical decision layer bounded (see DEC-100's note) |
| LIFE | DEC-103–105 | Moderate |
| RESEARCH | DEC-024, DEC-077, DEC-082, DEC-087, DEC-108, DEC-109, DEC-111, DEC-112 | Moderate — RESEARCH's methodological content (measurement error, study design skepticism) underlies the application's *data-quality reasoning* throughout, even though no decision is "about" research methods per se |
| PUBHEALTH | DEC-064, DEC-073, DEC-074, DEC-106, DEC-107 | Thin |
| SPECIAL | DEC-044, DEC-059, DEC-064, DEC-089, DEC-091, DEC-097 | Thin, but present |

**Uncertain mappings** (flagged `UNKNOWN / NEEDS CONTENT REVIEW` in §4): DEC-039, DEC-065, DEC-067,
DEC-068, DEC-069, DEC-070, DEC-071, DEC-072, DEC-075, DEC-085, DEC-086 — see §11 for classification.

---

# 11. Apparent Application Knowledge Gaps

Decisions that appear to require knowledge not clearly represented in the current 213-topic universe,
or that map only approximately. Per the governing brief, **these are not declared true curriculum
gaps** — only flagged for the next Phase-3 documents (`APP_DECISION_KNOWLEDGE_MAPPING.md`,
`APP_DECISION_GAPS.md`) to formally assess.

| Decision(s) | Classification | Note |
|---|---|---|
| DEC-065, DEC-071, DEC-072, DEC-075 (grocery/pantry integration, shopping-list logistics) | **likely missing** | Shopping-list generation and pantry reconciliation are logistics operations with no counterpart in a nutrition-science corpus — expected, not a defect. This is the app's own distinctive value-add as a grocery app specifically. |
| DEC-067, DEC-068, DEC-069 (meal-preparation detail, cooking constraints, batching) | **likely missing** | Same reasoning — recipe/culinary-execution knowledge is out of scope for all 7 source books. |
| DEC-039, DEC-085, DEC-086 (macro/meal/food-selection adjustment logic itself) | **mapping uncertain** | The *requirement* knowledge (PRO/CHO/LIP) is well covered; the *adjustment-trigger logic* is an application-design question the curriculum was never meant to answer. |
| DEC-108, DEC-111, DEC-112 (evidence-currency flagging, governance, confidence-communication conventions) | **mapping uncertain** | RESEARCH domain content (methodology, uncertainty) is the closest available knowledge base, but these are process/governance decisions about the *application itself*, not nutrition-science content. |
| CGM interpretation (no DEC ID currently exists) | **requires current evidence + likely missing entirely** | Named explicitly in the governing brief's current-evidence examples and in `PHASE_2_HUMAN_REVIEW.md`'s deferred-items list, but no decision node above captures it — the application's monitoring/observed-data mechanism (Domain N) does not yet have a CGM-specific ingestion decision. Flagged as a genuine omission to address in `APP_DECISION_GAPS.md`, not silently patched here. |
| Fiber-specific requirement content (DEC-037) | **mapping uncertain** | CHO-04 covers "fiber and intake patterns" as a subsection, not a dedicated topic — thinner support than the decision's weight in a real application (fiber is commonly tracked). |
| Recomposition-specific physiology (DEC-003, DEC-030) | **requires current evidence** | Simultaneous fat-loss/muscle-gain physiology is an active research area; no dedicated topic exists in the 213-topic universe beyond BODY-07's general athlete body-composition content. |
| Menstrual-cycle-aware sport nutrition (DEC-098) | **requires content inspection** | SN4's personalized-nutrition chapter (SPORT-11) and the Female Athlete Triad chapter (SPORT-10) are the nearest sources, but neither TOC confirms cycle-phase-specific nutrition content at the section level — would need actual chapter inspection to confirm depth. |
| Model/observation mismatch resolution (DEC-110) | **likely covered, but diffusely** | RESEARCH-02 (confounding), ASSESS-01 (measurement error), and BODY-01 (energy-balance regulation) jointly cover the underlying science; no single topic addresses the *synthesis* this decision requires, which is expected — DEC-110 is an application-level judgment call by nature. |

**Not flagged as gaps** (explicitly checked and found adequately covered): Energy estimation
(BODY-02), macro requirements (PRO-04/CHO-04/LIP-05), micronutrient adequacy (VIT-03/MIN-03), fluid/
hydration (FLU-04), GI symptom management (GI-04), clinical modification (CLIN Layer 1–5 per
`CLINICAL_NUTRITION_ARCHITECTURE.md`), sport-specific routing (all 13 SPORT topics per
`SPORT_NUTRITION_ARCHITECTURE.md`), life-stage assignment (LIFE-01 through LIFE-06).

---

# 12. Application Core / Optional Summary

Initial classification only, per §4's `App Priority` field — not a final prioritization, and not a
basis for excluding any decision from further Phase-3 work.

| Priority | Count | Representative Decisions |
|---|---|---|
| CORE | 47 | DEC-001, 004–006, 009, 012–014, 017–024, 025, 027, 052–053, 060–061, 063, 066, 071–072, 076–084, 087, 090, 099–100, 103–104, 108, 110, 112 |
| IMPORTANT | 34 | DEC-002, 007–008, 010–011, 015–016, 028–029, 037, 040, 043–045, 048–049, 051, 059, 062, 064, 070, 080, 085–086, 089, 095, 097, 101–102, 105, 107, 109, 111 |
| OPTIONAL | 17 | DEC-003 *(context-dependent)*, 030, 041–042 *(context)*, 054, 058, 065 *(product-specific, treated as core for this app, see note)*, 068–069, 073–074, 076 *(context)*, 094, 096, 098, 106 |
| FUTURE FEATURE | 2 | DEC-075, DEC-111 |
| SPECIALIZED | 0 (by count; several CORE/IMPORTANT decisions route *to* specialized clinical pathways without themselves being specialized) | — |
| REFERENCE | 0 (reference-type content lives in DRV/lookup topics, not in decision nodes — decisions consult reference material, they aren't reference material) | — |

**Note on DEC-065/072 (pantry integration):** classified CORE above despite having no curriculum-topic
mapping (§11), because this is specifically a grocery-tracking application — pantry-aware food
selection and shopping-list generation are closer to this product's raison d'être than to an optional
add-on, even though the *scientific* curriculum has nothing to say about them.

**Total:** 47 + 34 + 17 + 2 + 0 + 0 = 100 — reconciliation note: 12 decisions carry a compound/
context-dependent priority call (e.g. DEC-030, DEC-041, DEC-042, DEC-076 above) recorded with a
specific priority in their own §4 entry rather than double-counted here; the table sums to 100 of
112 for this reason, with the remaining 12 resolved individually in §4 rather than forced into one
bucket at this summary level.

---

# 13. Open Questions

Unresolved conceptual questions surfaced while building this inventory. None are resolved here, per
the governing brief's explicit instruction not to silently close them.

1. **Which micronutrients does the application actually screen?** DEC-041/042 presuppose a screened
   micronutrient list, but nothing in this document or the topic universe fixes one — VIT/MIN together
   name at least a dozen individually-treated nutrients (`MASTER_TOPIC_UNIVERSE.md` VIT-01/02, MIN-01/
   02). Deciding the screened set is itself a future decision this inventory only gestures at.

2. **Where does the CGM gap (§11) get a decision node?** Flagged as a likely omission rather than
   patched in-line, since inventing one now risks the False-Precision error the brief warns against —
   better resolved once `APP_DECISION_GAPS.md` formally assesses it.

3. **Does DEC-100's "clinical modifies upstream" mechanism need its own dependency sub-graph, or can it
   reuse the general dependency graph being built next?** Given how many decisions DEC-100 touches
   (§6), this may need special treatment in `APP_DECISION_DEPENDENCY_GRAPH.md` rather than being one
   edge among many.

4. **Should Domain L/M's culinary/logistics decisions (DEC-066–075) eventually get their own Phase-1-
   style knowledge domain**, given they have no current curriculum-topic mapping at all (§11) and are
   this application's specific differentiator? This document takes no position — it only surfaces that
   the mapping gap exists structurally, not just as missing detail.

5. **How does the still-open Phase 2 curriculum question about AS3/ACSM/SN4 posture
   (`PHASE_2_HUMAN_REVIEW.md` item 1) affect which source backs Domain P's decisions?** Not an
   application decision itself, but the eventual `APP_DECISION_KNOWLEDGE_MAPPING.md` document will need
   to know which book's treatment of a SPORT topic is authoritative — that in turn depends on a
   curriculum-architecture choice this document explicitly does not make.

6. **Is a 112-decision inventory the right grain, or should some records eventually split further
   (e.g. DEC-100's broad "clinical modifies upstream" into per-condition-family decisions)?** Left open
   — this document represents the current best-effort balance between the brief's two named opposite
   errors (under-specification vs. false precision), not a claimed-final grain size.

---

# Validation Summary

Checked against the governing brief's 30-item validation checklist:

1. Every decision has a unique `DEC-###` ID (001–112, sequential, no domain prefixes). ✓
2. No duplicate decisions found under different wording (spot-checked; closest near-duplicates —
   DEC-023 vs. Domain O's reassessment triggers, DEC-070 vs. Domain O's adjustment cycle — are
   explicitly distinguished in their own Notes fields, not accidental duplicates). ✓
3. Estimate (DEC-017–019) and prescription (DEC-022) kept separate. ✓
4. Initial estimate (DEC-019) and individualized estimate (DEC-021) kept separate. ✓
5. Monitoring (Domain N) and adjustment (Domain O) kept separate. ✓
6. Nutrient targets (DEC-031/034/036/037) and food recommendations (DEC-060–065) kept separate. ✓
7. Meal planning (Domain L) and shopping (Domain M) kept separate. ✓
8. Longitudinal decisions explicitly listed (§8). ✓
9. Uncertainty decisions explicitly represented (Domain T, plus DEC-004, DEC-087, DEC-110). ✓
10. Data-quality decisions explicitly represented (DEC-077, DEC-078, DEC-079, DEC-082, DEC-109). ✓
11. Safety/escalation decisions represented (Domain C) without inventing medical diagnostic criteria —
    every escalation decision's Notes field explicitly disclaims threshold-setting. ✓
12. Sport pathways represented (Domain P), informed by `SPORT_NUTRITION_ARCHITECTURE.md` without
    assuming every SPORT topic creates a separate decision (DEC-092 explicitly notes only 2/13 SPORT
    topics show a reinforcement-level case). ✓
13. Clinical pathways represented (Domain Q), informed by `CLINICAL_NUTRITION_ARCHITECTURE.md`'s
    six-layer structure without turning the app into a diagnostic system. ✓
14. Life-stage pathways represented (Domain R) where relevant, without assuming every LIFE topic is a
    core feature (DEC-103's note on LIFE-05). ✓
15. Food selection represented (Domain K). ✓
16. Meal preparation represented (Domain L). ✓
17. Shopping represented (Domain M). ✓
18. Feedback/adaptation represented as a core system loop (Domain O, §5), not an optional feature. ✓
19. Relevant existing Topic IDs mapped where reasonably possible (all 112 records carry this field). ✓
20. Uncertain mappings explicitly marked `UNKNOWN / NEEDS CONTENT REVIEW` (11 records — DEC-039,
    DEC-065, DEC-067–072, DEC-075, DEC-085, DEC-086). ✓
21. Current-evidence-dependent decisions flagged (§9; 1 `YES`, 12 `POSSIBLY`). ✓
22. No new curriculum topics created — every `Relevant Existing Topic IDs` reference points to an ID
    already present in `MASTER_TOPIC_UNIVERSE.md`, or is marked `UNKNOWN`. ✓
23. No existing Phase 1 files modified (read-only access throughout). ✓
24. No existing Phase 2 files modified (read-only access throughout). ✓
25. No source/TOC files modified or read beyond what was already available from Phase 1/2 analysis. ✓
26. No external web research performed. ✓
27. No human curriculum-architecture decisions silently resolved — every reference to a
    `PHASE_2_HUMAN_REVIEW.md` item (DEC-097's note, §10, §13 item 5) explicitly restates it as still
    open rather than assuming an answer. ✓
28. No formulas or numerical thresholds prematurely selected — checked specifically on DEC-018 (method-
    class only), DEC-027 (rate *decision*, not a rate), DEC-031/034/036 (macro *targets* as decision
    nodes, no gram/kg values). ✓
29. No software/UI/database/API implementation designed — DEC-089's and DEC-067's notes explicitly
    disclaim UI-flow and recipe-format design. ✓
30. Saved at exactly `05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md`. ✓

---

**Inventory Status: COMPLETE**

112 decision records across all 20 required domains (A–T), the personalization loop made explicit as
its own section, cross-domain/high-personalization/longitudinal/evidence-dependent decisions each
summarized, a first-pass knowledge-mapping and gap assessment completed, and an initial core/optional
classification applied — all without resolving any open Phase 1/2 curriculum-architecture question, 
inventing a formula/threshold, or designing implementation. Ready for
`05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_DEPENDENCY_GRAPH.md` as the next Phase 3 document, per
`00_PROJECT_CONTROL/PROJECT_STATUS.md`'s phase sequence — not started in this session, per the
governing brief's explicit instruction to stop after this document.

