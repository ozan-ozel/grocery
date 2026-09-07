# Decision Logic Specification — Phase 7

**Phase:** Phase 7 — Decision Engine Specification (`PROJECT_AI_PROTOCOL.md` §15)
**Question:** How should conceptual decisions become explicit decision logic?
**Built on (read-only, not modified):** `APP_DECISION_INVENTORY.md`, `APP_DECISION_DEPENDENCY_GRAPH.md`,
`APP_DECISION_GAPS.md`, `APP_DECISION_MODEL.md` (Phase 3); `KNOWLEDGE_DECISION_DEPTH_MAP.md`,
`DECISION_KNOWLEDGE_READINESS.md` (Phase 4); `EVIDENCE_AND_CONTENT_INSPECTION_REGISTER.md` (Phase 5);
`FINAL_CURRICULUM_ARCHITECTURE.md` (Phase 6, cited only for curriculum-vs-application-scope distinction,
per that document's own §1).
**Preserved exactly as documented:** `DEC-099`/`DEC-100` remain scope-pending. The three flagged
bookkeeping/citation discrepancies remain flagged, not fixed. The eight Phase 5 recommendations remain
recommendations only. No Phase 1–6 source-of-truth document is modified.

---

## 0. Amendment Notice — Post-Closure Edits Authorized by Gate 6 (2026-09-07)

> **This document was closed at Gate 5 and has since been amended.** Three entries were changed *after*
> closure under explicit Gate 6 authorization. The amendments are listed here rather than left to be
> discovered in place, because a closed source-of-truth document that changes silently is exactly the
> failure this project's change discipline (`PROJECT_AI_PROTOCOL.md` §36) exists to prevent.

| # | Entry | Change | Authority |
|---|---|---|---|
| 1 | `DEC-048` (§3.5, §3.18.6) | **Specified and closed.** Heat takes no population multiplier (routes to individualized sweat-rate measurement); altitude takes an additive +1–1.5 L/day increment, scoped, with provenance recorded. | Gate 6 §6 — *ratification* of `DEC-048`, explicitly **not** a reopening of Gate 5 |
| 2 | `DEC-031` (§3.3) | **Wording corrected.** The 1.6–2.2 g/kg band is retained but may no longer be presented as evidence of additional hypertrophy benefit in its upper half; SN4's plateau is 1.6–1.7 g/kg. | Gate 6 §7 |
| 3 | `DEC-034` (§3.3) | **Category corrected.** 8–12 g/kg/day moved out of the routine daily bands and specified as a pre-event loading protocol (~2–3 days pre-competition). The 6-vs-7 g/kg endurance floor divergence is recorded, **not** reconciled. | Gate 6 §7 |

**What did not change:** no numeric value was altered except by recategorizing `DEC-034`'s 8–12 band
from *daily requirement* to *pre-event protocol*; no stable ID was touched; the 97/15 accounting is
unchanged; `DEC-099`/`DEC-100` remain deferred. The count of drafted decisions carrying a deferred
numerical parameter fell from **9 to 8** because `DEC-048` closed.

**Gate 6's authorization was explicitly narrow** — *"limited to clarification/correction of existing
specifications … evidence/provenance corrections, not new human judgment calls."* Nothing beyond items
1–3 was changed on that authority.

---

## 1. Purpose and Scope

`PROJECT_AI_PROTOCOL.md` §15 asks: how should conceptual decisions (Phase 3's 112 `DEC` records) become
explicit decision logic (formulas, thresholds, uncertainty handling, confidence logic, conditional rules,
adjustment rules, safety rules, algorithmic decision paths)? §28's premature-implementation rule barred
this *before* Phase 7 — Phase 7 is where it becomes appropriate for the first time in this project.

**What "specification" means here, and what it does not mean:** this document writes down formulas,
thresholds, and rules as **documented specification** — the same kind of artifact a textbook or clinical
guideline presents (an equation, a range, a decision rule) — not executable code, a database schema, or
a UI. `PROJECT_AI_PROTOCOL.md` §28 separately bars *production application architecture* before Phase 9;
nothing here crosses that line. A formula appearing in this document is a specification a future
implementation phase would consult, not a delivered feature.

**Four specification-status categories**, applied to every one of the 112 decisions (§2):

| Status | Meaning |
|---|---|
| **SPECIFIED** | A concrete formula, threshold, or rule is given below, with a citation to an established source (a DRI/AMDR value, a named physiological equation, a sports-medicine consensus range, or a finding this project itself already verified in Phase 5). |
| **SPECIFIABLE (not yet drafted)** | Established science almost certainly exists to answer this decision, but this pass did not reach it — a scoping/pacing limit, not a genuine blocker. Listed explicitly so a future Phase 7 increment does not have to rediscover which decisions are in this category. |
| **NEEDS HUMAN/SCIENTIFIC JUDGMENT** | The decision requires a genuine judgment call this document should not make unilaterally — most commonly because it involves safety/liability tradeoffs, a numeric threshold with no single established value (only conventions with real disagreement), or Phase 3's own prior finding that the underlying logic itself (not just a number) is unspecified in the corpus (`DEC-039`/`085`'s `NEEDS CONTENT REVIEW` flag). |
| **BLOCKED** | Cannot be specified at all right now, for a reason already established elsewhere in this project — either the clinical-scope decision (`DEC-099`/`DEC-100`, explicitly not reopened here) or the confirmed Practical Translation Gap (`GAP-A`/`GAP-D`, recipe/preparation/shopping content genuinely absent from the corpus). |

**What this document does not do:** resolve `DEC-099`/`DEC-100`; invent a number where none is
established (every `SPECIFIED` entry below cites its source); silently promote a `NEEDS HUMAN/SCIENTIFIC
JUDGMENT` item to `SPECIFIED` by picking a number anyway; treat a `SPECIFIABLE (not yet drafted)` item as
though it were already done.

---

## 2. Specification Status — All 112 Decisions

Organized by Phase 3's own 20 domains. Reused, not re-derived, from `APP_DECISION_INVENTORY.md`.

| Domain | Decisions | Status Summary |
|---|---|---|
| A — Goal Classification | 001–004 | **SPECIFIED (§3.6)** (categorical branching logic; no numeric threshold needed) |
| B — Profile/Baseline | 005–011 | **SPECIFIED (§3.7)** (data-governance logic, not nutrition-science formulas) |
| C — Safety/Scope/Escalation | 012–016 | **SPECIFIED (§3.18.4)** — conservative posture approved at Gate 5; detailed criteria deferred to Phase 8 |
| **D — Energy** | **017–024** | **SPECIFIED (§3.1)** |
| **E — Weight/Body Composition** | **025–030** | **SPECIFIED (§3.2)**, one item NEEDS JUDGMENT |
| **F — Macronutrients** | **031–040** | **SPECIFIED (§3.3)**, two items (`039`/`085` family) NEED JUDGMENT |
| **G — Micronutrients** | **041–045** | **SPECIFIED (§3.4)**, dosing specifics flagged NEEDS JUDGMENT |
| **H — Fluid/Hydration** | **046–050** | **SPECIFIED (§3.5)** |
| I — Digestion/GI | 051–054 | **SPECIFIED (§3.9)** |
| J — Meal Structure/Timing | 055–059 | **SPECIFIED (§3.10)** |
| K — Food Selection | 060–065 | **SPECIFIED (§3.11)**, `065` **BLOCKED** (`GAP-D`) |
| L — Meal Planning/Preparation | 066–070 | **BLOCKED** (`067–069` confirmed `GAP-A`; rest `GAP-D`) |
| M — Shopping | 071–075 | **BLOCKED** (`GAP-D`, product/application logic, not nutrition science) |
| N — Monitoring | 076–080 | **SPECIFIED (§3.12)** |
| O — Feedback/Adaptation | 081–091 | **SPECIFIED** — scaffolding §3.17; core `084`/`085`/`090` resolved at Gate 5 (§3.18.2, §3.18.5), circuit-breaker parameters deferred to Phase 8 |
| P — Sport/Exercise | 092–098 | **SPECIFIED (§3.6, §3.8, §3.13)** — all 7 decisions |
| Q — Clinical/Special Populations | 099–102 | **BLOCKED** (`DEC-099`/`100` explicitly not reopened; `101`/`102` depend on their resolution) |
| R — Life Stages | 103–105 | **SPECIFIED (§3.14)** |
| S — Public Health/Food Environment | 106–107 | **SPECIFIED (§3.15)** |
| T — Evidence/Uncertainty/Data Quality | 108–112 | **SPECIFIED (§3.16)**; `110` resolved at Gate 5 (§3.18.1), deviation-cap value deferred to Phase 8 |

**Totals, after Gate 5 (2026-09-07): 97 of 112 decisions carry a drafted specification.** The remaining
15 are **BLOCKED** (Domains L, M, Q, and `DEC-065`) — absent corpus content or the still-deferred
clinical-scope decision, neither solvable by judgment. **The `NEEDS HUMAN/SCIENTIFIC JUDGMENT` and
`SPECIFIABLE (not yet drafted)` categories are both now empty.**

**Of the 97, eight carry a numerical parameter still deferred to Phase 8** — `DEC-021`/`DEC-110`
(deviation cap), `DEC-090` (circuit-breaker values), and `DEC-012`–`016` (Domain C criteria). These are
**architecturally specified with a named open parameter**, which is a materially different state from
"undecided": the decision's shape, its safety posture, and its failure direction are all settled, and
only a number remains. They are tracked in §4.

**Was nine, now eight (Gate 6, 2026-09-07):** `DEC-048` left this set when Phase 8's evidence work closed
it (§3.5, §3.18.6). It closed by **declining** the deferred parameter rather than supplying it — the
evidence established that a population heat multiplier is the wrong form, not merely an unavailable
number.

**Domain-boundary correction (found during this pass):** the previous version of this table mis-stated
two domain boundaries — `DEC-065` (pantry/grocery-app integration) is Domain **K**, not L, per its own
`**Domain:**` field in `APP_DECISION_INVENTORY.md` (confirmed against that document's own per-decision
field, not assumed from a section-header skim); and `DEC-081`–`091` are Domain **O**, not split N/O at
082/083. This shifted no decision's actual classification (`DEC-065` was already correctly treated as a
`GAP-D` application-integration item; `DEC-081`/`082` were already correctly treated as data-sufficiency/
quality gates) — only which domain letter and which section's decision-count each belonged to. Corrected
here and in §5's validation cross-check; disclosed rather than silently fixed, per this project's
standing practice.

---

## 3. Specified Domains

### 3.1 Domain D — Energy (`DEC-017`–`024`)

- **`DEC-017`** (sufficiency check): minimum fields for a population-formula estimate are age, sex,
  height, weight, and a self-reported activity category — the same four inputs the Mifflin-St Jeor
  equation and standard DRI Estimated-Energy-Requirement (EER) methodology both require. *Source:
  standard DRI/EER methodology, reflected throughout the corpus's own `BODY-02`/`DRV-01` content.*
- **`DEC-018`** (method-class selection): **Mifflin-St Jeor** as the default population-formula
  method-class — the most-validated predictive resting-energy-expenditure (REE) equation for general,
  non-clinical populations in the modern literature, superseding the older Harris-Benedict equation
  (kept only as a legacy/comparison alternative). Indirect calorimetry (gold standard) and doubly-labeled
  water (research-grade) are both out of scope for a consumer application per `BODY-02`'s own
  method-class treatment.
  ```
  Men:   REE (kcal/day) = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) + 5
  Women: REE (kcal/day) = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) − 161
  ```
- **`DEC-019`** (activity incorporation): standard Physical Activity Level (PAL) multiplier approach —
  `TEE = REE × PAL`. Established DRI/IOM PAL bands: sedentary 1.2–1.3; lightly active 1.375–1.55;
  moderately active 1.55–1.725; very active 1.725–1.9; extremely active 1.9–2.4. Where disclosed
  structured training exists (`SPORT-01`/`02`), the activity-specific energy cost may refine the PAL
  band rather than replace this method-class.
- **`DEC-020`** (sufficiency for individualization): a recommended **minimum starting threshold** of
  ~2–3 weeks of reasonably consistent logged intake and weight data, per standard practice for
  distinguishing a real weight-trend from short-term fluctuation (§3.2's `DEC-026`). **This specific
  duration is a practical convention, not a physiological constant** — flagged as adjustable, not a
  scientific fact, unlike the equations above.
- **`DEC-021`** (weighing model vs. observed) — **NEEDS HUMAN/SCIENTIFIC JUDGMENT.** Phase 3's own
  dependency-graph analysis already named this "arguably the single hardest decision in the whole
  inventory" (three-domain knowledge convergence, `APP_DECISION_KNOWLEDGE_MAPPING.md` §11). The
  *conceptual* principle is specifiable (weight the observed signal more heavily as its duration and
  data quality increase, per `ASSESS-01.03`'s measurement-error framing) — the *exact* weighting
  function is not an established formula anywhere in the corpus and should not be invented here.
- **`DEC-022`** (energy prescription) — directly composable from `DEC-021`'s individualized maintenance
  estimate and Phase 5's own established finding (register §3.9): a **±500 kcal/day** deviation from
  maintenance corresponds to the established ~1 lb (0.45 kg)/week rate (using the standard ~3,500 kcal
  per pound of body fat approximation), directly matching the AHA/ACC/TOS-consistent target rate.
- **`DEC-023`** (recompute triggers): a recommended **2–4 week** cadence, or immediately upon a
  significant disclosed profile change (e.g. new activity level) — a practical convention, flagged
  adjustable, not a physiological constant.
- **`DEC-024`** (confidence communication): a **principle**, not a formula — confidence should scale
  inversely with `ASSESS-01.03`'s measurement-error factors (data recency, quantity, and consistency),
  communicated qualitatively (e.g. "preliminary estimate" vs. "confirmed from N weeks of your own data").

### 3.2 Domain E — Weight and Body Composition (`DEC-025`–`030`)

- **`DEC-025`** (metric set selection): weight alone is the floor; circumference or device-based body-
  composition metrics (`BODY-03`) are added only if the user discloses access to that measurement method
  — straightforward branching logic, no threshold needed.
- **`DEC-026`** (trend vs. noise): use a **rolling 7-day average** to smooth known day-to-day water/
  glycogen/GI-content fluctuation (commonly documented as up to 1–2 kg daily variation), and require the
  smoothed trend to hold directionally for **at least 2 weeks** before treating it as a genuine trend
  rather than noise. The smoothing method (rolling average) is standard practice; the exact day-count is
  a reasonable convention, not a hard constant — flagged accordingly.
- **`DEC-027`** (target rate/direction) — **fully specified, directly reusing Phase 5's own finding**
  (register §3.9, not re-derived here): **1–2 lb (0.45–0.9 kg) per week**, per the 2013 AHA/ACC/TOS
  Guideline for the Management of Overweight and Obesity in Adults, restated as current in a 2025
  multi-society guideline. This is the single most directly citable specification in this entire
  document — external, dated, and already verified by this project.
- **`DEC-028`** (reassessment trigger from trend): recommended threshold — if the observed rate over
  2–3 weeks deviates by more than roughly half the prescribed rate (e.g. observed <0.5×  or >1.5× the
  `DEC-027` target), trigger reassessment. The percentage is a reasonable convention, flagged adjustable.
- **`DEC-029`** (missing weigh-in confidence): a **principle** — fewer data points within a rolling
  window directly lowers confidence in the `DEC-026` trend call; no separate formula needed beyond
  `DEC-026`'s own window-completeness.
- **`DEC-030`** (recomposition monitoring): branching logic — a recomposition goal routes to `BODY-03`
  body-composition metrics as the primary signal, not scale weight alone (which is expected to be
  comparatively flat during genuine recomposition).

### 3.3 Domain F — Macronutrients (`DEC-031`–`040`)

- **`DEC-031`** (protein requirement): established, tiered ranges from DRI and sports-nutrition
  consensus (`PRO-04`):
  ```
  General/sedentary adult (DRI RDA):        0.8 g/kg body weight/day
  Recreationally active:                    1.2–1.6 g/kg/day
  Strength/hypertrophy-focused training:    1.6–2.2 g/kg/day
  During caloric restriction (any level):   favor the upper end of the applicable
                                             range, to preserve lean mass
  ```
  **Provenance correction (Gate 6 §7, applied 2026-09-07).** Phase 8's page-level verification against
  the corpus corroborated this band but sharpened what its upper half means: **SN4 places the hypertrophy
  plateau at approximately 1.6–1.7 g/kg/day (break point 1.62)** — the *bottom* of the 1.6–2.2 tier.
  The band is therefore correct as a **permissive specification range**, but:
  > **The 1.6–2.2 range must NOT be presented as evidence that intakes in its upper half produce
  > additional hypertrophy benefit.** Above roughly 1.7 g/kg the evidence supports *tolerance and
  > sufficiency*, not incremental gain. The upper half is headroom — it accommodates measurement error,
  > under-reporting, and the caloric-restriction case below — not a target to aim for.

  This does not change the numbers, only the claim attached to them. The restriction clause above stands
  on lean-mass preservation during an energy deficit, which is a separate and independently supported
  rationale — not on any claimed hypertrophy benefit of higher intakes.
- **`DEC-032`** (training-load adjustment): incorporated directly into `DEC-031`'s tiers above (higher
  disclosed training volume/intensity moves the target toward the upper end of its tier) — no separate
  formula needed.
- **`DEC-033`** (distribution across occasions): established sports-nutrition guidance recommends
  roughly **0.3–0.4 g/kg body weight** (commonly cited as ~20–40 g for most adults) per eating occasion,
  spread across 3–5 occasions, to support a repeated muscle-protein-synthesis response — general
  sports-nutrition consensus (`PRO-06`), not a single-study figure.
- **`DEC-034`** (carbohydrate requirement): DRI RDA floor of **130 g/day** (the brain's minimum glucose
  requirement) and an Acceptable Macronutrient Distribution Range (AMDR) of **45–65% of total energy**
  for the general population (`CHO-04`). For disclosed structured training, sports-nutrition
  consensus provides graduated g/kg/day bands by training volume: light training 3–5 g/kg/day; moderate
  5–7 g/kg/day; high-volume endurance 6–10 g/kg/day.

  **Category correction (Gate 6 §7, applied 2026-09-07).** The previous version of this entry listed
  "extreme/ultra-endurance up to 8–12 g/kg/day" as a fourth *routine daily* band. Phase 8's provenance
  verification established that this **conflates two different things**:
  > **8–12 g/kg/day is a pre-event carbohydrate-loading protocol, run over approximately 2–3 days before
  > competition — not a routine daily requirement for anyone.** It is a time-boxed preparation protocol
  > attached to a specific event, and it is specified here as such:
  ```
  routine daily fueling      → the three volume-graduated bands above (max 6–10 g/kg/day)
  pre-event carb loading     → 8–12 g/kg/day for ~2–3 days immediately before competition,
                               conditional on a disclosed event date (see DEC-094's window),
                               reverting to the routine band afterward
  ```
  Presenting a loading protocol as a daily target would overstate sustained carbohydrate need for the
  ultra-endurance population by a wide margin, which is a safety-relevant misstatement rather than a
  presentational one.

  **Provenance nuance, recorded not silently reconciled (Gate 6 §7).** Phase 7's high-volume endurance
  **floor of 6 g/kg/day sits 1 g/kg below the corpus's own endurance floor of 7 g/kg/day.** The figure is
  retained as specified — Gate 6 authorized recording the difference, **not** reinterpreting it — and the
  discrepancy is flagged here for whichever phase next revises this entry. The lower floor is the more
  conservative choice for a target *floor*, but the divergence from the corpus is real and is not
  characterized here as agreement.
- **`DEC-035`** (carb timing around exercise) — directly sourced from the corpus itself (`CHO-05`, `SN4`
  Chapter 6, already read during Phase 5 content inspection): pre-exercise 1–4 g/kg, 1–4 hours before;
  during exercise 30–90 g/h depending on duration and intensity (approximately 30 g/h up to ~2 hours,
  up to 60 g/h beyond that, up to 90 g/h — from multiple transportable carbohydrate sources — for
  sessions beyond 2.5–3 hours); post-exercise ~1–1.2 g/kg within the first hours of recovery.
- **`DEC-036`** (fat requirement): the remainder of the energy budget after protein and carbohydrate
  allocation, subject to the AMDR floor of **20–35% of total energy** from fat (`LIP-05`) — a floor
  exists to protect essential-fatty-acid and fat-soluble-vitamin adequacy, not merely "whatever is left."
- **`DEC-037`** (fiber target) — directly sourced from the corpus itself (found during Phase 5 content
  inspection of `KM16`'s pediatric fiber subsection, which itself cites the adult-derived figure): **14 g
  per 1,000 kcal** of energy intake (the DRI Adequate Intake convention), reconciled against the
  carbohydrate allocation as a sub-component, not an addition to it.
- **`DEC-038`** (dietary pattern override): branching logic per disclosed pattern (e.g. vegan → exclude
  animal-protein food sources from `DEC-043`'s translation, not the g/kg target itself; ketogenic →
  override `DEC-034`'s carbohydrate target with a commonly-cited ceiling of roughly 20–50 g/day,
  itself a convention rather than a DRI-derived figure, flagged as such).
- **`DEC-039`** (macro adjust on observed data) and **`DEC-085`** (its longitudinal counterpart) —
  **NEEDS HUMAN/SCIENTIFIC JUDGMENT.** Phase 3 already flagged both `NEEDS CONTENT REVIEW`
  (`APP_DECISION_KNOWLEDGE_MAPPING.md` §6): the underlying *adjustment-trigger logic itself* — not a
  missing number, a missing rule — is not present anywhere in the 7-book corpus. Specifying it here
  would mean inventing a rule with no textbook or guideline basis, which this document does not do.
- **`DEC-040`** (conflict resolution): a **priority principle**, not a formula — protein's requirement
  (`DEC-031`, a safety-adjacent floor per `PRO-05`'s malnutrition boundary) is protected first; pattern-
  driven restrictions are then applied to the carbohydrate/fat allocation, not to the protein floor.

### 3.4 Domain G — Micronutrients (`DEC-041`–`045`)

- **`DEC-041`**/**`DEC-042`** (adequacy/deficiency-risk flagging): compare the disclosed dietary
  pattern's typical intake of a given micronutrient against its DRI value (`VIT-03`/`MIN-03`, with the
  actual numeric DRI/RDA/AI/UL values themselves living in the reference tables `DRV-03`/`DRV-04`, per
  `CANDIDATE_EXCLUSIONS.md`'s REFERENCE-ONLY designation, ratified at Gate 4). A commonly-used dietary-
  assessment heuristic flags risk when typical intake falls below roughly **two-thirds (67%) of the
  RDA**, or when a disclosed pattern excludes a food group that is a primary source of that nutrient
  (e.g. a vegan pattern and vitamin B12). The 67% threshold is a widely-used assessment convention, not
  a DRI-defined cutoff — flagged as such.
- **`DEC-043`** (food-source translation): direct lookup logic against `NUT-04`'s food-composition data
  and each nutrient's own named dietary sources (`VIT-01/02`, `MIN-01/02`) — no numeric threshold
  involved, a mapping operation.
- **`DEC-044`** (supplementation consideration): branching logic — consider supplementation when dietary
  adjustment alone cannot plausibly close the gap (e.g. a pattern that excludes the nutrient's primary
  food sources entirely). **Specific dosing recommendations are NEEDS HUMAN/SCIENTIFIC JUDGMENT** — a
  real safety/liability question distinct from the qualitative "consider it" branching logic, which is
  itself specifiable.
- **`DEC-045`** (population-specific screening): branching logic referencing already-established special-
  population DRI adjustments — e.g. pregnancy raises the folate RDA from 400 to 600 mcg/day (`LIFE-01`,
  a standard DRI figure); endurance/female athletes warrant iron-status attention (`MIN-04`, per Phase 5's
  register §3.4's independent confirmation that `SN4`'s treatment of this is substantive, not thin).

### 3.5 Domain H — Fluid and Hydration (`DEC-046`–`050`)

- **`DEC-046`** (baseline fluid needs): standard DRI Adequate Intake for total water — approximately
  **2.7 L/day for women, 3.7 L/day for men** (including food-derived water), or the commonly-used **30–
  35 mL/kg body weight/day** approximation (`FLU-01`).
- **`DEC-047`** (exercise fluid adjustment): established sports-medicine guidance (ACSM) — replace
  approximately **400–800 mL/hour** during exercise, scaled by disclosed sweat rate and session duration
  (`FLU-04`).
- **`DEC-048`** (environmental modification): **SPECIFIED — corrected and ratified at Gate 6, 2026-09-07.**
  Fluid needs increase in heat and at altitude, but **the two do not take the same specification form**,
  and neither takes a population multiplier. Phase 8's evidence work established that a multiplier is not
  merely unavailable but *inappropriate* for heat (`PRACTICAL_TRANSLATION_ANALYSIS.md` §5.1):
  ```
  altitude exposure  → additive daily increment: +1–1.5 L/day over the DEC-046 baseline
                       (source guidance: 4–5 L/day total during altitude training/competition,
                       offsetting respiratory/urinary losses of ~850–1,900 mL/day)
                       SCOPED to altitude training/competition conditions — not generalizable
                       beyond the population and context its source supports
  heat exposure      → NO population multiplier. Route to individualized sweat-rate measurement
                       (pre/post body-mass change, corrected for intake), feeding DEC-047's
                       already-specified 400–800 mL/h replacement band
  both               → individualization governs; the altitude increment is a starting default,
                       never a substitute for measurement
  ```
  **Provenance, recorded explicitly per Gate 6 §6:** the altitude figures derive from a 2024 narrative
  review of high-altitude/mountaineering nutrition reporting ACSM expert guidance; the heat position
  derives from the ACSM position stand on Exercise and Fluid Replacement, which reports sweat rate as
  highly variable and capable of exceeding 2 L/h (documented endurance-athlete rates of 2.79 and
  3.06 L/h) and recommends **customized** replacement programs on exactly that basis. **Why no heat
  multiplier:** inter-individual sweat-rate variability (~0.5 to >3 L/h) is larger than any population
  factor could represent, so a single multiplier would be wrong for most individuals in both directions —
  it would not be a rough approximation but a misspecification. This matches the corpus, where SN4 and
  ACSM independently direct the reader to measure sweat rate per condition rather than scale a baseline.
- **`DEC-049`** (sweat/electrolyte incorporation): established ACSM sodium-replacement guidance of
  approximately **500–700 mg sodium per liter** of fluid replaced during prolonged or heavy-sweat
  exercise (`FLU-02`/`04`).
- **`DEC-050`** (safety escalation): a **safety rule**, well-documented in sports medicine — excessive
  plain-water intake without electrolyte replacement during prolonged/ultra-endurance exercise carries a
  real hyponatremia risk (`FLU-05`); this should escalate to an explicit safety flag, not a routine
  adjustment suggestion.

### 3.6 Domain A — Goal Classification (`DEC-001`–`004`)

Pure categorical/branching logic — no numeric threshold or scientific citation needed, only the logic
structure itself:

- **`DEC-001`**: classify into one of the named categories (maintenance, weight loss, weight gain,
  muscle/lean-mass gain, performance, health-oriented, body-composition, unclear/unstated) from
  disclosed goal text/selection; "unclear/unstated" is itself a valid terminal classification, not an
  error state, feeding `DEC-002`.
- **`DEC-002`**: if classification lands on "unclear/unstated," route to a clarification prompt before
  proceeding; a vague qualitative statement should not silently default to a specific category.
- **`DEC-003`**: apparent goal conflicts (e.g. simultaneous fat loss + muscle gain) route to `BODY-01`'s
  energy-balance framing (per `KNOWLEDGE_DECISION_DEPTH_MAP.md`, already tiered `FULL`) — reconciled as
  a recomposition sub-case (`DEC-030`) rather than treated as an error.
- **`DEC-004`**: an extreme implied timeframe (e.g. a large weight change disclosed as wanted "by next
  week") routes to a safety flag (Domain C) before any estimate is produced — the *detection* logic is
  specifiable (compare implied rate against `DEC-027`'s established 1–2 lb/week reference point); the
  *exact* multiple-of-that-rate that counts as "extreme" is a Domain-C judgment call (§4).

### 3.7 Domain B — User Profile and Baseline (`DEC-005`–`011`)

Data-governance branching logic, not nutrition-science formulas:

- **`DEC-005`**: minimum required fields for `DEC-018`'s method-class = age, sex, height, weight,
  activity category (directly reused from §3.1's `DEC-017`, not re-derived).
- **`DEC-006`**: if the minimum set (`DEC-005`) is present, proceed; if not, either request the missing
  fields (`DEC-007`) or substitute population defaults only where `DEC-008` permits.
- **`DEC-007`**: prioritize missing fields by their direct contribution to `DEC-018`'s equation weight —
  age/sex/height/weight first (equation-load-bearing), activity category second (refines rather than
  gates the estimate).
- **`DEC-008`**: a refused field triggers a population-default substitution with a corresponding
  confidence downgrade (`DEC-024`), not a hard block — except where the missing field is safety-relevant
  (Domain C).
- **`DEC-009`**: implausibility bounds follow standard anthropometric plausibility ranges (e.g. adult
  height/weight combinations yielding a BMI far outside the roughly 12–60 kg/m² physiologically-observed
  range) — flagged for re-confirmation, not silently accepted or silently rejected.
- **`DEC-010`**: a later-provided value supersedes an earlier one for the same field, with the
  superseded value logged (not discarded) for `DEC-009`-style plausibility comparison.
- **`DEC-011`**: a recommended staleness window of **~3–6 months** for physically-changeable fields
  (weight, activity level) before prompting re-confirmation — a practical convention (like `DEC-020`'s
  2–3 weeks), not a physiological constant.

### 3.8 Partial: Domain P — Sport/Exercise (evidence-linked items only)

Not a full domain specification (most of Domain P is application/branching logic, `SPECIFIABLE (not yet
drafted)`), but two items connect directly to Phase 5's own evidence findings and are worth recording now:

- **`DEC-095`** (RED-S/overtraining detection): the current authoritative diagnostic/risk framework is
  the IOC's 2023 consensus statement on Relative Energy Deficiency in Sport, with its CAT2 risk-
  categorization tool updated again in January 2026 (register §3.12) — the *detection signals and risk
  stratification* should reference this framework rather than an invented rule; **the exact data-signal
  mapping (which application-observable inputs map to which CAT2 risk category) is `SPECIFIABLE (not yet
  drafted)`**, not done in this pass.
- **`DEC-098`** (female-athlete-specific track): Phase 5's register (§3.3 Finding B) already resolved the
  menstrual-cycle-phase sub-question with a **negative** finding — current evidence does not support
  cycle-phase-tailored nutrition/training recommendations (Colenso-Semple et al. 2023). **The
  specification here is a safety rule, not a positive formula**: `DEC-098` should not implement cycle-
  phase-tailored logic, because doing so would assert a claim current evidence does not support. The
  broader Female Athlete Triad/RED-S safety content (`SPORT-10`) remains `DEC-013`/`016`'s established
  red-flag content, unaffected by this specific finding.

### 3.9 Domain I — Digestion and GI (`DEC-051`–`054`)

- **`DEC-051`** (GI-symptom capture and use): branching logic — self-reported GI symptoms (bloating,
  discomfort, timing-related distress) feed a food/timing-adjustment recommendation (`GI-04`); a direct
  data-capture-to-adjustment mapping, no numeric threshold required.
- **`DEC-052`** (adjustment vs. escalation): the *branching structure itself* is specifiable — symptom
  data plus severity/persistence routes to either "adjust" or "escalate." **The specific severity/
  persistence threshold that crosses into escalation is not specified here** — it is the same
  liability-sensitive question already compiled as Gate 5 candidate #4 (Domain C thresholds, §4), not a
  new judgment call; `DEC-052` simply inherits it via its own `Downstream Use: DEC-013` link.
- **`DEC-053`** (intolerance vs. allergy triage): a three-way classification from self-report alone —
  "intolerance (soft constraint)" / "allergy (hard exclusion)" / "unclear (flag for clinical
  confirmation)." This is explicitly **not** a diagnostic decision (true allergy diagnosis is out of the
  application's scope, per Phase 3's own note on `DEC-053`) — the specification is only how a
  self-reported status is provisionally triaged for downstream food-selection filtering (`DEC-061`), with
  genuine ambiguity routed toward "flag for confirmation" rather than guessed.
- **`DEC-054`** (fixed vs. adapting GI tolerance): branching logic — a **recommended re-test interval of
  4–6 weeks, or upon a disclosed training-phase change**, before revisiting a "fixed constraint"
  classification. Like `DEC-011`'s ~3–6 month profile-staleness window and `DEC-020`'s 2–3 week data
  threshold, **this interval is a practical convention, not a physiological constant** — flagged
  accordingly, and low-stakes given this decision's `OPTIONAL` app priority (affects only the
  structured-training subset of users).

### 3.10 Domain J — Meal Structure and Timing (`DEC-055`–`059`)

Almost entirely translation/branching logic that composes already-specified upstream decisions rather
than introducing new nutrition-science content:

- **`DEC-055`** (eating-occasion count): derived from `DEC-001`'s goal classification, disclosed
  schedule constraints, and — when disclosed — training schedule (`DEC-092`); no independent formula,
  a structuring decision downstream of already-specified inputs.
- **`DEC-056`** (per-occasion target distribution): a direct arithmetic distribution of `DEC-022`
  (energy), `DEC-031` (protein), `DEC-034` (carbohydrate), and `DEC-036` (fat) daily targets across the
  `DEC-055` occasion count — translation, not new science.
- **`DEC-057`** (exercise-timing incorporation): directly composes `DEC-035`'s already-specified
  carbohydrate-timing windows (§3.3) with `DEC-051`'s GI-tolerance data, when structured training is
  disclosed — no new figures beyond what `DEC-035` already established.
- **`DEC-058`** (hunger/satiety-responsive adjustment): a **principle** — reported hunger/satiety over
  time (`BODY-01`'s energy-balance framing) adjusts occasion count/distribution; deliberately no numeric
  threshold, since satiety response is individual and no single established figure applies.
- **`DEC-059`** (schedule/cultural constraint override): branching logic — disclosed practical
  constraints (work schedule, cultural meal patterns, `NUT-03`/`SPECIAL-04`) override the `DEC-055`
  default structure; a constraint-satisfaction operation, not a formula.

### 3.11 Domain K — Food Selection (`DEC-060`–`065`)

- **`DEC-060`** (target → candidate-food-set translation): the boundary decision between a per-occasion
  nutrient target (`DEC-056`) and an actual candidate food set — direct lookup against `NUT-04`'s
  food-composition data, reconciled with `DEC-038`/`040`'s pattern/priority logic. Kept as its own step
  per Phase 3's own Decision Model Principle #6 (nutrient requirement vs. food recommendation are never
  silently merged) — no new figures, a defined translation boundary.
- **`DEC-061`** (restriction/allergy/preference filtering): direct filtering logic — `DEC-053`'s
  intolerance/allergy classification hard-excludes or soft-constrains candidates from `DEC-060`'s set;
  disclosed preferences filter further. A set-operation, not a formula.
- **`DEC-062`** (nutrient-density prioritization): ranks `DEC-061`'s filtered set using `DEC-043`'s
  already-specified micronutrient food-source guidance (§3.4) against the fixed energy/macro budget —
  reuses existing specification, no new content.
- **`DEC-063`** (substitution generation): when a candidate is unavailable/restricted, substitutes a
  food preserving the original nutrient contribution from `DEC-062`'s ranked list — a nutrient-matching
  operation against `NUT-04`'s composition data, not a new formula.
- **`DEC-064`** (cost/convenience/cultural re-weighting): re-weights `DEC-062`'s ranked candidates by
  disclosed cost/convenience/cultural preference — a weighting operation on already-computed rankings.
- **`DEC-065`** (pantry/grocery-app integration) — **BLOCKED (`GAP-D`)**, for the same reason as all of
  Domain M: Phase 3's own gap analysis (`APP_DECISION_GAPS.md` row 065) confirms "no curriculum
  counterpart possible" — the underlying food/nutrient science (`DEC-060`–`064`, all specified above) is
  fully adequate; only the pantry-reconciliation logistics bridge is missing, and that bridge is this
  grocery app's own product-integration concern, not a nutrition-science question this document can
  answer from the 7-book corpus. Consistent with the existing L/M `BLOCKED` treatment — not re-litigated
  here, only extended to this now-correctly-located Domain-K item (see the domain-boundary correction in
  §2).

### 3.12 Domain N — Monitoring (`DEC-076`–`080`)

Data-quality and logging-governance logic — reuses the measurement-error framing already established
for Domains D/E rather than introducing new thresholds:

- **`DEC-076`** (what/how-often to log): a data-capture menu — weight, intake, activity, training,
  symptoms — with cadence following `ASSESS-01`/`05`'s own logging-frequency framing; scope adjusted by
  `DEC-001` (goal) and `DEC-093` (athlete-status). A configuration decision, not a formula.
- **`DEC-077`** (per-input data-quality rating): directly reuses `ASSESS-01`'s "measurement error in
  dietary intake data" framing — a single log entry rates lower than multiple entries; partial recall
  rates lower than a full diet log. A qualitative rating scheme, consistent with `DEC-024`'s
  confidence-communication principle (§3.1), not a new numeric formula.
- **`DEC-078`** (adherence tracking): a straightforward ratio — logged occasions ÷ expected occasions
  (`DEC-076`'s schedule) — over a rolling window, feeding data-quality weighting elsewhere; the same
  rolling-window logic already used by `DEC-026` (§3.2), not a new mechanism.
- **`DEC-079`** (missing-data handling): a **principle**, explicitly guarding against a known
  self-monitoring pitfall — an unlogged period must be classified "insufficient data," never silently
  treated as "no change." No threshold needed; this is a data-integrity rule, not a formula.
- **`DEC-080`** (check-in/escalation triggers): branching logic — `DEC-078`/`079`'s adherence and
  missing-data signals, combined with `DEC-013`'s existing red-flag criteria, trigger a check-in prompt.
  Reuses `DEC-013`'s already-established (if Domain-C-gated) criteria rather than inventing new ones.

### 3.13 Domain P — Sport and Exercise, Remainder (`DEC-092`–`094`, `096`–`097`)

Completes Domain P alongside §3.6's `DEC-092`-referencing items and §3.8's evidence-linked `DEC-095`/
`098` — all five remaining decisions are data-capture/classification/branching logic that feed
already-specified domains, not new nutrition-science content:

- **`DEC-092`** (training-data capture): captures type/volume/intensity/phase as a single structured
  input (`SPORT-01`/`02`) feeding the already-specified `DEC-019` (PAL refinement, §3.1), `DEC-031`–`035`
  (protein/carb targets and timing, §3.3), `DEC-046`–`049` (fluid, §3.5), and `DEC-057` (§3.10) — a single
  intake hook, not a parallel decision system, consistent with Phase 3's own note that only 2 of 13 SPORT
  topics warranted distinct reinforcement-level treatment.
- **`DEC-093`** (recreational vs. structured-athlete classification): a routing decision from `DEC-092`'s
  captured data (`SPORT-04`/`13`) — "general guidance" vs. "sport-specific guidance," feeding `DEC-030`,
  `DEC-045`, `DEC-076`. Classification logic, no numeric threshold.
- **`DEC-094`** (competition/event-date adjustment window): a scheduling decision — a disclosed event
  date opens a pre-/post-competition adjustment window that modifies `DEC-035`'s timing guidance
  (`CHO-05`/`SPORT-04`); relevant only to the subset of users who disclose competitive events, per its
  own `OPTIONAL` priority.
- **`DEC-096`** (environmental-input capture): captures disclosed travel/heat/altitude data (`SPORT-07`)
  as a structured input feeding `DEC-048`'s environmental fluid-adjustment logic — a capture step, not a
  new formula. **Updated post-Gate-6:** `DEC-048` is now fully specified (§3.5), so this capture step
  feeds a closed rule rather than an open one. Note that the capture must distinguish **heat** from
  **altitude**, because §3.5 routes them differently — altitude to an additive increment, heat to
  individualized sweat-rate measurement. A capture step that collapsed both into one "environmental
  stress" flag would be insufficient for the specification it feeds.
- **`DEC-097`** (supplement-use reconciliation): captures disclosed supplement use and reconciles it
  against `DEC-044`'s already-specified (§3.4) supplementation-consideration logic, producing an
  adequacy picture that accounts for supplement intake. **Specific interaction-safety thresholds** (e.g.
  a disclosed supplement combination or dose crossing into a safety concern) are **not** specified here —
  they fall under the same family as Gate 5 candidate #3 (`DEC-044` dosing, §4), not a new item. The
  still-open AS3/ACSM/SN4 supplement-content redundancy question (`PHASE_2_HUMAN_REVIEW.md` item 10,
  carried since Gate 4) is noted as relevant background only, not resolved by this specification.

### 3.14 Domain R — Life Stages (`DEC-103`–`105`)

- **`DEC-103`** (life-stage assignment): a classification from age, sex, and disclosed pregnancy/
  lactation status into one of the six established `LIFE`-domain categories (`LIFE-01`–`06`) — "adult, no
  special life-stage flag" is itself a valid, common assignment outcome, independent of `LIFE-05`
  (Adulthood) being the curriculum's thinnest life-stage topic (a curriculum-depth observation, not a
  reason to avoid this classification outcome, per `CANDIDATE_EXCLUSIONS.md`'s own framing).
- **`DEC-104`** (life-stage-adjusted defaults): directly composes already-established, named DRI
  life-stage adjustments wherever `DEC-103` assigns a non-default stage — e.g. pregnancy raises the
  folate RDA from 400 to 600 mcg/day and the protein RDA from 0.8 to ~1.1 g/kg/day (`LIFE-01`, reused
  directly from `DEC-045`'s §3.4 specification, not re-derived); lactation raises energy needs by
  approximately +330–400 kcal/day (established DRI figure, `LIFE-02`). A composition of already-specified
  adjustments across Energy/Macro/Micronutrient/Safety domains, not a new formula.
- **`DEC-105`** (life-stage-transition detection): a monitoring trigger — a disclosed life event (e.g.
  pregnancy onset, aging into a new bracket) during ongoing use re-runs `DEC-103`'s classification and
  cascades into `DEC-104`. Per Phase 3's own flagged cross-domain note, a pregnancy-onset transition
  specifically should also trigger `DEC-012`'s Domain-C scope check — reused here as a specified
  cross-domain dependency, not a new judgment call (pregnancy already sits within Domain C's existing,
  if unspecified, scope-check criteria, compiled as Gate 5 candidate #4).

### 3.15 Domain S — Public Health and Food Environment (`DEC-106`–`107`)

- **`DEC-106`** (food-access/affordability adjustment): branching logic — disclosed affordability/access
  constraints (`PUBHEALTH-04`) adjust `DEC-064`'s cost-weighting and `DEC-073`'s budget-adjusted shopping
  logic; a constraint-propagation operation, not a new formula.
- **`DEC-107`** (external-standard alignment governance): this decision asks whether the application
  aligns its defaults to a named external standard versus deriving independent internal defaults
  (`PUBHEALTH-03`/`DRV-01`). **This document's own practice across every `SPECIFIED` decision in §3.1–
  §3.14 already constitutes a de facto answer**: every numeric value specified so far cites a named
  established external standard (DRI/AMDR/IOM values, the Mifflin-St Jeor equation, ACSM sports-medicine
  guidance, the IOC RED-S consensus statement) rather than an independently-derived internal figure. The
  specification for `DEC-107` is therefore to **formally ratify this already-operating convention**
  ("align to established named external standards, not independent internal defaults") as the decision
  engine's explicit governance policy — a low-risk confirmation of existing practice, not a new invented
  policy, and distinct in kind from the genuinely contested Domain-C/O judgment calls in §4. Named
  external guides are periodically revised (hence the source inventory's own `POSSIBLY` evidence-currency
  flag on this decision) — that revision cadence is exactly what `DEC-111` (§3.16) specifies a process
  for, not a reason to withhold this ratification.

### 3.16 Domain T — Evidence, Uncertainty, and Data Quality (`DEC-108`–`112`)

- **`DEC-108`** (evolving-consensus flagging): a **principle**, directly generalizing the established-
  vs-emerging evidence distinction this project has already applied since Phase 5 (register §3.9's
  `DEC-027` vs. §3.3's `DEC-098`) — any decision carrying a `Current Evidence Required` flag of `POSSIBLY`
  or `YES` (per `APP_DECISION_INVENTORY.md` §9) surfaces an "this area is evolving" notice, distinct from
  `DEC-024`'s routine low-confidence notice. No numeric threshold; a flagging rule keyed to an existing
  per-decision attribute already recorded in Phase 3.
- **`DEC-109`** (cross-input conflict detection): generalizes `DEC-009`/`010`'s profile-specific
  plausibility/supersession logic (§3.7) across all collected data, including monitoring inputs — a
  validation pass applied before any dependent decision consumes the data, not a new mechanism.
- **`DEC-110`** (model-vs-observation mismatch) — **NEEDS HUMAN/SCIENTIFIC JUDGMENT.** Already compiled
  as Gate 5 candidate #1 alongside `DEC-021` (§4) — Phase 3's own note calls this "arguably the single
  hardest decision in the whole inventory," with no resolution rule definable from the topic universe
  alone. Restated here only to confirm Domain T's own accounting, not specified twice.
- **`DEC-111`** (evidence-review governance process): a **process** decision, not a content update —
  specifies that decisions flagged `POSSIBLY`/`YES` for current-evidence dependency (per §9 of the
  inventory) undergo periodic review; a **recommended annual cadence** is proposed as a starting
  convention (flagged adjustable, consistent with this document's other convention-flagged intervals),
  maps approximately to `RESEARCH-15`'s policy-translation framing per Phase 3's own note that the mapping
  is "approximate," not exact.
- **`DEC-112`** (unified confidence-communication convention): the generalization point for every
  domain-specific confidence signal already specified in this document (`DEC-024` for Energy, §3.1;
  `DEC-029` for Weight, §3.2; `DEC-077` for Monitoring, §3.12) — one shared qualitative convention (e.g.
  "preliminary" / "developing" / "confirmed," scaling with data recency, quantity, and consistency) used
  application-wide, rather than each domain inventing its own. A composition of already-specified pieces,
  not new content.

### 3.17 Domain O — Feedback and Adaptation, Non-Core Remainder (`DEC-081`–`083`, `086`–`089`, `091`)

Domain O is the application's central adaptive loop. Its three **core** adjustment decisions
(`DEC-084`/`085`/`090`) are `NEEDS JUDGMENT` and stay in §4 — nothing below specifies them by implication.
What *is* specifiable is the loop's **gating and interpretation scaffolding**: the decisions that
determine whether the loop is even entitled to run, and what it does with its own output. That
separation is itself Phase 3's stated design (Decision Model Principle #5: interpretation never changes
the plan; only adjustment does), so specifying the scaffolding without the core is a coherent stopping
point, not a half-finished one.

- **`DEC-081`** (quantity/duration gate): "enough data to evaluate?" — satisfied when the accumulated
  record meets `DEC-020`'s already-specified ~2–3 week minimum *and* `DEC-026`'s 2-week trend-confirmation
  window (§3.1, §3.2). No new threshold is introduced here; this decision is the gate that *applies*
  those two, and it fails closed ("not yet — continue monitoring") when either is unmet.
- **`DEC-082`** (quality gate): "is the data good enough to evaluate?" — a distinct gate from `DEC-081`,
  per Phase 3's own note that quantity and quality are two separate halves of "is this data usable."
  Composes `DEC-077`'s per-input quality ratings, `DEC-078`'s adherence rate, and `DEC-079`'s
  missing-data classification (§3.12). Fails closed to "not usable — request more/better data."
- **`DEC-083`** (consistency interpretation): compares the observed response (`DEC-026`'s trend call)
  against what the current prescription (`DEC-022`/`027`) predicted, emitting "consistent" or
  "divergence detected." **This decision never changes the plan** — it hands its interpretation to
  `DEC-084`, which is where an actual adjustment would be decided and which is `NEEDS JUDGMENT`. The
  boundary is load-bearing: specifying `DEC-083` does not smuggle in an adjustment rule.
- **`DEC-086`** (downstream regeneration): branching logic — an upstream adjustment (`DEC-084`/`085`)
  triggers regeneration of meal structure (`DEC-055`) and food selection (`DEC-060`). **The trigger logic
  is specified; what it regenerates partly is not** — `DEC-086` inherits `DEC-066`'s `GAP-D` translation
  gap whenever regeneration reaches meal *construction*, per Phase 3's own gap note. So this decision is
  specified up to, and explicitly stops at, the same `BLOCKED` boundary as Domain L.
- **`DEC-087`** (wait vs. adjust under uncertainty): the uncertainty-management decision the governing
  brief explicitly required. Specified as a **precedence rule, deliberately without a numeric
  data-volume threshold** (matching Phase 3's own framing): if `DEC-081` or `DEC-082` fails, wait; if
  both pass but confidence is low (`DEC-024`/`DEC-112`), the *communicated confidence* is downgraded
  rather than the adjustment being withheld. "Wait" is reserved for genuine insufficiency, so that low
  confidence does not silently become permanent paralysis.
- **`DEC-088`** (incremental vs. full re-baseline): escalation logic — a full baseline reassessment
  (`DEC-005`/`DEC-017`) is warranted when the profile itself is suspect rather than the prescription:
  a `DEC-009`/`010` plausibility signal, or `DEC-011`'s ~3–6 month staleness window elapsing (§3.7). This
  is deliberately routed to *profile* signals rather than to repeated adjustment failure, because the
  latter is `DEC-090`'s circuit-breaker question and is `NEEDS JUDGMENT` (§4).
- **`DEC-089`** (adjustment communication): a **content** decision, not a UI design — draws on
  `SPECIAL-03`'s counseling/behavioral-change framing: a proposed adjustment is communicated with its
  reason and its confidence level (`DEC-112`'s shared convention, §3.16), not as an unexplained change.
  Consistent with `PROJECT_AI_PROTOCOL.md` §28: this specifies *what is communicated*, and leaves *how it
  is presented* to Phase 9.
- **`DEC-091`** (subjective alongside objective): a **principle** — self-reported energy, hunger,
  satisfaction, and motivation are carried alongside `DEC-083`'s objective interpretation rather than
  averaged into it, and a *conflict* between them (objective progress on plan, subjective distress) is
  routed to a check-in (`DEC-080`) rather than resolved arithmetically. **No weighting function is
  specified** — that would be the same invented-weighting problem already flagged as Gate 5 candidate #1
  for `DEC-021`/`DEC-110`, and it is not quietly solved here by a different name.

### 3.18 Gate 5 Resolutions (`DEC-012`–`016`, `021`, `039`, `044`, `048`, `084`, `085`, `090`, `110`)

Supplied by the human at Gate 5 on 2026-09-07 and recorded verbatim in
`DECISIONS/2026-09-07-gate-5-phase-7-closure.md`. **These are decisions received, not decisions made
here.** Where a numerical parameter was explicitly deferred to Phase 8, it is left open below rather than
filled with a plausible-looking value — filling it in would be precisely the failure the deferral exists
to prevent.

#### 3.18.1 `DEC-021` / `DEC-110` — model vs. observation

Approved hierarchy:

```
population model (Mifflin-St Jeor, §3.1)   → initial estimate / prior
adequate longitudinal observation
  (passes DEC-081 quantity + DEC-082 quality) → dominant individual evidence
large model/observation divergence          → uncertainty & data-quality safeguard
```

The population model is the **starting reference, not a permanent co-equal input** — once the data bar is
met, observation dominates. Critically, a large divergence is **not** to be read as a genuine metabolic
outlier by default; it triggers a safeguard that checks intake-logging quality, measurement quality,
adherence/completeness, short-term physiological effects, and other confounders first.

**No blending formula is to be invented, and no numerical deviation cap is set here.** The *existence* of
a cap/safety rail is approved; its value is Phase 8 work (§4). This resolves the §3.1 note on `DEC-021`
that previously withheld the weighting function.

#### 3.18.2 `DEC-039` / `DEC-085` — macro adjustment

**Macro targets do not form an independent feedback-control loop in v1.** Approved architecture:

```
observation → energy adjustment (DEC-084) → macro recalculation (DEC-085 → DEC-031/034/036)
```

Macro allocation changes as a **downstream consequence** of an energy-prescription change. Independent
automatic macro adjustment on satiety, adherence, training load, or subjective preference alone is
**barred** — such signals may only act by first causing an authorized energy reassessment. `DEC-031`'s
protein floor and `DEC-040`'s priority principle are preserved unchanged.

This resolves §3.3's `DEC-039` entry, which previously withheld the trigger rule as absent from the
corpus: the rule is now a supplied architectural constraint (one controller, not two), not a discovered
scientific fact — and it is recorded as such.

#### 3.18.3 `DEC-044` — supplementation dosing

**The application does not provide autonomous micronutrient supplementation dosing in v1.**

```
gap identified, dietary correction plausible      → food/dietary correction (DEC-043)
gap identified, dietary correction insufficient,
  deficiency suspected/confirmed, or otherwise
  clinically consequential                        → professional evaluation (Domain C)
```

Barred: automatic RDA-level repletion, UL-level dosing, ingredient-specific therapeutic dosing, and any
dose derived from internal defaults. The application **may explain that supplementation can be
relevant**; it does not state a dose. Any future dosing capability requires a separate evidence/safety
review.

Note this is a **complete** specification, not a deferred one — "no autonomous dose" is the answer, not a
placeholder awaiting a number.

#### 3.18.4 Domain C (`DEC-012`–`016`) — safety, scope, escalation

**Approved posture: broad exclusion + frequent escalation.** The application prefers escalation over
autonomous nutritional prescription wherever available information indicates a potentially clinically
significant condition, symptom pattern, medication interaction, or physiological state for which safe
automated guidance cannot be confidently established.

**The detailed criteria are deferred to Phase 8** and must derive from: the application's defined
clinical scope; authoritative clinical guidance; the existing decision model; the project's
safety/escalation requirements.

**`DEC-099`/`DEC-100` remain unresolved and untouched.** The Gate 5 decision states this explicitly,
notwithstanding the `DEC-012` ⇄ `DEC-099` coupling this document surfaced — approving a *posture* is not
resolving the *scope*.

Every escalation path specified elsewhere in this document now terminates in an approved posture rather
than an open question: `DEC-052` (GI symptoms), `DEC-080` (monitoring triggers), `DEC-095` (RED-S),
`DEC-105` (pregnancy onset), `DEC-090` (circuit breaker), `DEC-044` (supplementation).

#### 3.18.5 `DEC-084` / `DEC-090` — adjustment and circuit breaker

**The adaptive loop must have a circuit breaker**, triggered by **either** condition, whichever is
reached first:

```
repeated unsuccessful adjustment cycles        ─┐
                                                ├→ escalation (Domain C)
excessive cumulative deviation from the         │
  starting estimate/prescription               ─┘
```

`DEC-084` **reuses `DEC-028`'s already-specified reassessment trigger** (§3.2) rather than introducing a
second competing threshold — closing the risk this document's own self-audit raised about §3.17
implying an adjustment rule by the back door.

**The numerical cycle count and cumulative-deviation threshold are deferred to Phase 8** (§4). The
governing constraint, which is not deferred: **the loop must never be allowed to adjust indefinitely.**

#### 3.18.6 `DEC-048` — heat/altitude fluid adjustment — **CLOSED at Gate 6**

Gate 5's authorized specification was `heat/altitude exposure → increased fluid requirement flag`, with
**no quantitative multiplier authorized**, and directed Phase 8 to conduct a targeted evidence search —
conditioned on the multiplier being evidence-backed and explicitly scoped *"if one is justified."*

**Phase 8 found that one is not justified for heat, and Gate 6 ratified that correction on 2026-09-07.**
The full specification is now in §3.5. The outcome is worth stating plainly because it inverts the shape
Gate 5 anticipated: **heat and altitude required different forms, and the search's most important result
was a negative one.** Altitude yielded a citable additive increment; heat yielded the finding that the
multiplier concept itself is inappropriate, because inter-individual sweat-rate variability exceeds any
population factor.

**This closes the last of Gate 5's four numerical deferrals that Phase 8 was able to reach.** No number
was invented; the one that could not be evidenced was declined rather than filled.

#### 3.18.7 `DEC-107` — external-standard alignment (ratification accepted)

This document's §3.15 ratification is **explicitly accepted** by Gate 5. Provenance chain:
`authoritative source → project specification → application decision rule`.

Recorded with the qualification the decision itself attaches: **this is a governance decision, not
permission to blindly copy values.** Phase 8 includes provenance standardization and re-verification for
the numeric consensus ranges §6 flagged as not uniformly page-verified against this project's corpus.

---

## 4. Gate 5 Resolutions and Phase 8 Carry-Forward

**All six candidates were answered at Gate 5 on 2026-09-07** (GO; full record in
`DECISIONS/2026-09-07-gate-5-phase-7-closure.md`, specifications applied in §3.18). Status of each:

| # | Item | Gate 5 outcome | Residue |
|---|---|---|---|
| 1 | `DEC-021`/`DEC-110` | Option C+D — observation dominates once the data bar is met; divergence triggers a safeguard | Deviation-cap **value** → Phase 8 |
| 2 | `DEC-039`/`DEC-085` | Option A — no independent macro control loop | **None** — complete |
| 3 | `DEC-044` | Option A — no autonomous dosing in v1 | **None** — complete |
| 4 | Domain C (`012`–`016`) | Conservative posture: broad exclusion + frequent escalation | Detailed **criteria** → Phase 8 |
| 5 | Domain O core (`084`/`085`/`090`) | Option C — dual-trigger circuit breaker; `084` reuses `DEC-028` | Cycle-count and deviation **values** → Phase 8 |
| 6 | `DEC-048` | Option B — directional flag only, no multiplier | **DISCHARGED at Gate 6** (§3.5, §3.18.6) — no heat multiplier exists to find; altitude took an additive form |

Plus: **`DEC-107`'s autonomous ratification was explicitly accepted** (§3.18.7) — the item this
document's own self-audit had flagged as most open to objection.

### 4.1 Phase 8 carry-forward (required evidence/safety work)

1. The numerical model/observation deviation cap for `DEC-021`/`DEC-110` — **if retained** after evidence
   review. Retention is not assumed. — **STILL OPEN.**
2. The numerical circuit-breaker parameters for `DEC-090`. — **STILL OPEN.**
3. The detailed Domain C escalation/exclusion criteria — **after** clinical scope is defined. —
   **GENUINELY BLOCKED**, not merely unstarted: clinical scope is `DEC-099`/`DEC-100`, which remain
   deferred. Cannot close in Phase 8 unless those are answered.
4. A researched, validated quantitative heat/altitude fluid approach for `DEC-048`. — **DISCHARGED**
   (Phase 8 §5.1; ratified Gate 6 §6; applied here at §3.5/§3.18.6).
5. Standardized, verified provenance for the numeric consensus ranges not uniformly page-verified during
   Phase 7 (§6). — **DISCHARGED** (Phase 8 §5.3; corrections authorized by Gate 6 §7 and applied here at
   `DEC-031` and `DEC-034`).
6. Preservation of `DEC-107`'s external-standard alignment principle. — **PRESERVED.**

**Three of six discharged or preserved (items 4, 5, 6); two still open (1, 2); one genuinely blocked (3)
behind a deferral this project has not been authorized to reopen.**

### 4.2 Explicitly not authorized in Phase 8

Per the Gate 5 decision, Phase 8 must not introduce: unsupported medical thresholds; arbitrary supplement
doses; arbitrary clinical exclusion criteria; arbitrary circuit-breaker values; unsupported heat
multipliers; independent macro-control logic; hidden formulas; undocumented safety assumptions.

**The deferrals above are not to-do items that may be closed by picking a reasonable number.** Each was
deferred specifically because a plausible-looking value would be indistinguishable, in the finished
specification, from an evidence-backed one.

### 4.3 Still `BLOCKED`, and not affected by Gate 5

`DEC-099`/`100`/`101`/`102` (clinical scope — explicitly not reopened, and the approved Domain C posture
does not narrow them) and `DEC-065`–`075` (Practical Translation Gap, `GAP-A`/`GAP-D`). The latter is
**Phase 8's own subject matter** — see §7.

---

## 5. Validation

- All 112 decisions accounted for in §2's table. Domain membership was verified **programmatically** in
  this pass — every `### DEC-###` heading in `APP_DECISION_INVENTORY.md` was paired with its own
  `**Domain:**` field and the resulting 112 pairs counted per domain, rather than inferred from section
  headers or carried over from the previous version of this table:
  ```
  A4+B7+C5+D8+E6+F10+G5+H5+I4+J5+K6+L5+M5+N5+O11+P7+Q4+R3+S2+T5 = 112
  ```
  This corrected four domain boundaries relative to this document's previous version (`K5`→`K6`,
  `L6`→`L5`, `N7`→`N5`, `O9`→`O11`) — see §2's domain-boundary correction note. The previous version's
  *total* was also 112, which is precisely why the boundary error survived the first pass's check: a
  correct total masked two offsetting boundary errors. Counting per domain, not just summing, is what
  caught it.
- Specification-status accounting also sums to 112, checked independently of the domain counts.
  **Post-Gate-5:** **97** with a drafted specification in §3 + **15** `BLOCKED` (L5 + M5 + Q4 +
  `DEC-065`) = 112, with **zero** in `NEEDS JUDGMENT` and **zero** in `SPECIFIABLE (not yet drafted)`.
  The pre-Gate-5 figures were 88 / 15 / 9 / 0; the 9 judgment items moved into the drafted column when
  Gate 5 supplied their decisions, which is the only change to the accounting.
- **Of the 97 drafted, 8 carry a Phase-8-deferred numerical parameter** (`DEC-021`, `DEC-110`, `DEC-090`,
  `DEC-012`–`016` — enumerated in §4.1). Counted as drafted because their architecture, safety posture,
  and failure direction are settled and a reader gets a usable specification; **not** counted as
  finished, because a named number is still open. Both facts are stated rather than one being rounded
  away. **Post-Gate-6 this is 8, not 9:** `DEC-048` closed (§3.5). The 97/15 split is unchanged — the
  discharge moved a decision *within* the drafted column, not between columns.
- **Two of the four pre-Gate-5 partial entries are now complete, not merely reclassified:** `DEC-039`
  (no independent macro loop) and `DEC-044` (no autonomous dosing) received answers that close them
  outright — "no" is a complete specification, not a placeholder. `DEC-021` retains a named open parameter
  and is counted among the 8 above; **`DEC-048` no longer does** — Gate 6 closed it (§3.5).
- Every `SPECIFIED` entry (§3) cites either an established, named source (DRI/AMDR values, the Mifflin-
  St Jeor equation, ACSM sports-medicine guidance, the IOC RED-S consensus statement) or a finding this
  project already verified in Phase 5 (`DEC-027`'s rate, `DEC-037`'s fiber AI, `DEC-035`'s timing
  windows, `DEC-095`/`098`'s evidence-currency findings) — none is an invented number.
- Every threshold explicitly labeled a "convention" or "reasonable starting value" (e.g. `DEC-020`'s
  2–3 weeks, `DEC-026`'s 2-week trend window, `DEC-041`'s 67% adequacy heuristic) is distinguished from
  the DRI/equation-derived values, which are established science, not conventions.
- `DEC-099`/`DEC-100` were not resolved — both remain `BLOCKED`, mentioned only to confirm that status.
- No Phase 1–6 source document was modified.
- No production code, database schema, UI, or executable algorithm was created — every item above is a
  documented specification, consistent with `PROJECT_AI_PROTOCOL.md` §28's Phase-9 boundary.

---

## 6. Self-Audit (per `PROJECT_AI_PROTOCOL.md` §19 Step 6)

- **What could be wrong:** several of the "established" ranges cited (protein g/kg tiers, carbohydrate
  g/kg-by-training-volume bands, the 500–700 mg/L sodium-replacement range) are broad consensus ranges
  from sports-nutrition literature generally, not verified in this pass against this project's own
  7-book corpus page-by-page the way Phase 5's content-inspection findings were — they are standard,
  uncontroversial figures taught consistently across exercise-nutrition textbooks (including the ones in
  this corpus), but this document does not claim to have re-verified each one against a specific page
  citation the way `DEC-027`, `DEC-035`, and `DEC-037` were.
- **What could also be wrong, and is worth a reviewer's attention:** the domains drafted in the second
  pass (I, J, K, N, P-remainder, R, S, T) are overwhelmingly *branching, translation, and data-governance
  logic* that compose already-specified upstream decisions rather than introducing new numeric claims.
  That is a genuine property of those domains, not a shortcut — but it does mean their specifications are
  only as sound as the upstream ones they compose, and an error in §3.1–§3.5 would propagate into them
  silently. They are also, for the same reason, the parts of this document a future implementation phase
  is most likely to want to restructure.
- **The one substantive judgment made autonomously — raised, then accepted.** `DEC-107` (align to named
  external standards vs. derive independent internal defaults) was specified as a **ratification of the
  convention this document was already following** rather than escalated as a seventh Gate 5 candidate,
  and flagged here for precisely that objection. **Gate 5 explicitly accepted it** (§3.18.7), with the
  qualification that it is a governance decision and not permission to copy values uncritically — which
  is why Phase 8 carries a provenance re-verification task (§4.1 item 5). The original flag is left
  standing rather than deleted now that it resolved favourably: it was a real judgment call at the time.
- **The structural risk in Domain O (§3.17) — now closed by Gate 5.** Specifying that domain's gating and
  interpretation scaffolding while its three core adjustment decisions were open was defensible only
  because Phase 3's Decision Model Principle #5 draws exactly that line. The specific concern raised was
  whether §3.17 *implied* an adjustment rule by the back door, particularly `DEC-087`'s
  "downgrade-confidence-rather-than-withhold" precedence rule. **Gate 5's ruling that `DEC-084` reuses
  `DEC-028`'s existing reassessment trigger rather than introducing a competing threshold** (§3.18.5)
  resolves it: there is now one reassessment threshold in the system, not a scaffolding-implied second.
- **What was silently resolved:** nothing, before or after Gate 5. `DEC-099`/`100` remain `BLOCKED` —
  and the approved Domain C posture does **not** narrow them, which the Gate 5 decision states
  explicitly. `DEC-052`'s escalation threshold and `DEC-097`'s supplement-interaction thresholds were
  routed to Domain C and `DEC-044` respectively, both of which Gate 5 has now answered at the posture
  level, with criteria deferred to Phase 8.
- **What was assumed in applying Gate 5:** that the nine decisions carrying Phase-8-deferred parameters
  belong in the drafted column rather than a fifth category of their own. The reasoning is in §5; the
  alternative (a distinct "architecturally specified, numerically open" status) would be defensible and
  is a reasonable thing for Phase 8 to introduce if the distinction starts doing real work.
- **What changed from Phase 1–6:** no source document changed. This document's own §2 domain-boundary
  error was corrected and disclosed (§2, §5) — a correction to Phase 7's own artifact, not to any
  Phase 1–6 source of truth.
- **What Phase 8 inherits:** the six carry-forward items in §4.1, and — structurally — the Practical
  Translation Gap itself, since Phase 8's subject matter is exactly the territory of the 10 `BLOCKED`
  decisions in Domains L and M.

---

## 7. Status

**Phase 7: COMPLETE.** Gate 5 approved **GO** on 2026-09-07
(`DECISIONS/2026-09-07-gate-5-phase-7-closure.md`); Phase 8 (Practical Translation) is authorized.

| | Count | What it means |
|---|---|---|
| Drafted specification (§3) | **97** | Domains A, B, C, D, E, F, G, H, I, J, K (less `065`), N, O, P, R, S, T. **Eight** of these carry a Phase-8-deferred numerical parameter (§4.1) — was nine before Gate 6 closed `DEC-048`. |
| `BLOCKED` | **15** | L, M, Q, and `DEC-065` — the Practical Translation Gap and the unreopened clinical-scope decision. |
| `NEEDS JUDGMENT` | **0** | All six Gate 5 candidates answered (§3.18, §4). |
| `SPECIFIABLE`, not yet drafted | **0** | Empty since the second Phase 7 pass. |

**What "complete" does and does not mean.** Phase 7 is complete in the sense the protocol asks for:
every one of the 112 decisions has a specified decision rule, an approved safety posture, or a documented
reason it cannot be specified — and no category of "not reached" remains. It does **not** mean the
decision engine is finished. **Eight** decisions still need a number, and 15 remain blocked. What changed at
Gate 5 is that **none of the remainder is now waiting on a judgment call** — the open items are evidence
tasks with an approved shape, which is Phase 8's work, not another gate's.

The two most consequential things Gate 5 settled, both of which constrain everything downstream: the
adaptive loop **must** terminate (a circuit breaker is mandatory, even though its trigger values are not
yet set), and the application **does not dose** — nutrient gaps route to food or to a professional, never
to an autonomously generated supplement quantity.

See `DECISIONS/2026-09-07-gate-5-phase-7-closure.md` for the full decision record and
`AI_SESSION_STATE.md` for the execution checkpoint.
