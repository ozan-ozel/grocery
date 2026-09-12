# Energy Individualization — Research and Specification

**Status: research + specification only. NOT implementation-ready.**

This document selects no formula, no coefficient, no threshold, and no macro percentage. It creates no
`DEC` ID, renames none, retires none, and amends no existing decision content. It does not open a row
in `../IMPLEMENTATION_HANDOFF.md`. Everything it produces is either (a) a description of the decision
architecture the corpus already ratified, (b) evidence gathered against a named question, or (c) an
explicitly-labelled open choice that requires human ratification before it can be built.

**Why it exists:** the corpus already forbids collapsing the energy chain into a single formula
(`../05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md` §2 Principles 1–3;
`../00_PROJECT_CONTROL/PROJECT_AI_PROTOCOL.md` §5/§6), and Gate 5 already ratified the hierarchy that
makes observation dominant once a data bar is met
(`../10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md` §3.18.1). What was
missing is not the architecture. It is a researched account of how that architecture is actually fed,
gated, and represented — and of which choices inside it are still nobody's to make autonomously.

**Governing rules this document operates under:** `PROJECT_AI_PROTOCOL.md` §25 (current-evidence
policy: established vs emerging, preserve uncertainty), §26 (human decision preservation), §28 (no
premature implementation), §29 (traceability), §30 (ID stability), §31 (document discipline). Under
§31 specifically: this is a new research layer, not a competing source of truth. Readiness stays owned
by `../DEC_REGISTER.md`, decision content by `APP_DECISION_INVENTORY.md`, and specification by
`DECISION_LOGIC_SPECIFICATION.md`. Where this document restates any of them it cites them, and where
it disagrees with one (§15) it records the disagreement as a finding for a human rather than acting on
it.

---

## 1. Problem definition

### 1.1 The general problem

The dominant consumer pattern for setting an energy target is a single unbroken chain:

```
profile inputs → REE equation → × activity multiplier → ± goal offset → calorie target
```

Every stage of that chain is a population estimate, and the chain has nowhere to put the one piece of
evidence that is actually about the individual: how their body responded to what they ate. The
activity multiplier carries much of the numeric weight and is the least defensible link in it (§4.3).
The result is a number with the surface appearance of personalization — it moves when the user's
weight or sex or activity dropdown moves — and little of the substance, because nothing downstream of
it ever observes whether it was right.

### 1.2 The concrete instance in this application

Grocery's `calculateTargets()` (`../../src/lib/mealPersonalization.ts:116`) is exactly that shape, end
to end, in about thirty lines:

- Mifflin-St Jeor REE from age, sex, height, weight (the original `9.99 / 6.25 / 4.92` coefficient
  form, not the rounded `10 / 6.25 / 5` form quoted in `DECISION_LOGIC_SPECIFICATION.md` §3.1 — a
  cosmetic difference, recorded here only so the two are known to be the same equation).
- A **single-point** PAL constant selected from a five-item dropdown (`1.4 / 1.55 / 1.7 / 1.9 / 2.1`,
  `mealPersonalization.ts:52-58`), multiplied into REE to give `maintenanceKcal`. Note this is a single
  point where `DECISION_LOGIC_SPECIFICATION.md` §3.1 (`DEC-019`) specifies *bands*. The app has already
  collapsed the band's width, which was the one place the method's own uncertainty was visible.
- A fixed goal offset: `−400` for loss, `+250` for gain, `0` for maintain, floored at `MIN_CALORIES`.
- Macros derived from the resulting figure and body weight.

There is **no observed-response input anywhere in the chain.** `personal_plan`
(`../../supabase/09-personal-plan-user-scoped.sql`) stores exactly one `weight_kg` per user, with no
weight-history table anywhere in `supabase/`; nothing reads logged intake back into the energy figure.
The only confidence surface is two `string[]` arrays (`warnings`, `assumptions`) carrying fixed Turkish
caveat sentences — not scaled, not sourced, and not tied to how much data the user has actually
produced.

**This is not a defect of the implementation.** It is a faithful implementation of a `SHIPPED` /
`COVERED` MVP whose individualizing half is `BLOCKED` on subsystems that do not exist. The problem is
that the collapsed chain is the *only* thing present, so from the user's side there is nothing to
distinguish an estimate that has never been tested against their body from one that has.

### 1.3 What this document is trying to make possible

Not a better formula. A chain in which the population formula is demoted to a **prior** — an opening
position with an honest width — and the individual's own longitudinal response is admitted as
**evidence** that can move it, with every stage of that movement gated, quality-checked, bounded, and
attributable. The corpus already says this must be the shape (`PROJECT_AI_PROTOCOL.md` §6; Gate 5
§3.18.1). This document researches what it would take to actually feed it.

---

## 2. Relevant existing DEC IDs

No ID below is created, renamed, retired, or amended here. Readiness words are transcribed from
`../DEC_REGISTER.md` as of 2026-09-12; that file remains the only authority for them. Decision
*content* is owned by `APP_DECISION_INVENTORY.md`; the register's `Label` column is navigational only
and is not quoted as content.

The final column names the `APP_DECISION_INVENTORY.md` §2 Decision Model Principle that the boundary
**at the downstream edge of that stage** protects — that is, the merge that principle forbids.

| Stage | DEC IDs and readiness (`DEC_REGISTER.md`) | Boundary principle protected |
|---|---|---|
| Baseline sufficiency | `DEC-005`, `006`, `017` `COVERED`; `DEC-009` `PROVISIONAL`; `DEC-010`, `011` `BLOCKED` | #4 Measurement ≠ Interpretation — holding a profile field is not judging it sufficient or plausible |
| Initial estimate | `DEC-018` (method class), `DEC-019` (activity incorporation) — `SHIPPED` ×2 | #2 Initial Estimate ≠ Individualized Estimate |
| Observed-data sufficiency | `DEC-020`, `DEC-081` (quantity), `DEC-082` (quality) — `BLOCKED` ×3 | #4; and the 081/082 split is itself an application of #4, per `APP_DECISION_INVENTORY.md` §5 |
| Individualized maintenance | `DEC-021`, `DEC-110` — `BLOCKED` ×2 | #3 Population Standard ≠ Individual Response |
| Goal prescription | `DEC-001`, `003`, `022` `COVERED`; `DEC-027` `BLOCKED` | #1 Estimate ≠ Prescription |
| Weight / trend interpretation | `DEC-025`, `026`, `028`, `029`, `030` — `BLOCKED` ×5 | #4, then #5 Interpretation ≠ Adjustment at the `026 → 028` edge |
| Macro allocation | `DEC-031`, `034`, `036`, `037` `SHIPPED`; `DEC-032` `COVERED`; `DEC-033` `PROVISIONAL`; `DEC-035`, `038`, `040`, `085` `BLOCKED`; `DEC-039` `DEFERRED` | #6 Nutrient Requirement ≠ Food Recommendation |
| Monitoring | `DEC-076` `COVERED`; `DEC-077`–`080` `BLOCKED` ×4 | #4 |
| Adaptation | `DEC-023`, `083`, `084`, `086`–`091` — `BLOCKED` ×9 | #5 Interpretation ≠ Adjustment |
| Sport / training input | `DEC-092`, `093`, `095` — `BLOCKED` ×3 | #4 — a logged session is not an energy cost |
| Uncertainty / governance | `DEC-024`, `112` `COVERED`; `DEC-029`, `077`, `108`, `109` `BLOCKED` | Principle #9 (Scientific Estimate ≠ Personalized Prescription ≠ Practical Translation) and `PROJECT_AI_PROTOCOL.md` §5's *Population Estimate ≠ Individual Truth* |
| Meal-translation boundary | `DEC-055`, `056`, `066` `COVERED`; `DEC-060`, `070` `SHIPPED` | #7 Nutrient Target ≠ Meal Plan; #8 Meal Plan ≠ Shopping Plan |

**Three transcription corrections.** The brief that commissioned this document summarised three of
these lines differently. The register wins, per its own statement that it owns the readiness word and
nothing else:

- Baseline sufficiency is `COVERED` ×3, not ×4 — `DEC-009` is `PROVISIONAL` and `010`/`011` are
  `BLOCKED`, which accounts for all six.
- Macro allocation is `SHIPPED` ×4 (`031`, `034`, `036`, `037`), not ×5 — `DEC-032` is `COVERED`.
- Uncertainty/governance is `COVERED` ×2 (`024`, `112`), not ×3 — `DEC-029`, `077`, `108` and `109` are
  all `BLOCKED`.

No register row was edited to produce this table.

### 2.1 The dependency spine (restated, not redrawn)

Already recorded in `APP_DECISION_INVENTORY.md` §5 and `APP_DECISION_DEPENDENCY_GRAPH.md` §5 chains B,
C, D, I and J. Restated here for reading convenience only:

```
005/006 → 017 → 018 → 019 → 020 → 021 → 022 → {027, 034–036} → 060
                                    ↑
             026 → 028 → 084 ───────┘   (adjustment feeds back to 021/022)
             078 → 020
             009/020/021 → 024 → 112
```

`DEC-022` is the most heavily-converged node in the whole graph
(`APP_DECISION_DEPENDENCY_GRAPH.md` §13's own finding), and `DEC-110` is named there as the hardest
single node. Neither observation is made here; both are cited.

---

## 3. Research questions

The ten questions this document was chartered to answer, each tagged to the decision(s) it bears on.
Tagging a question to a `DEC` does not modify that `DEC`; it records where an answer would eventually
have to land.

| # | Question | Bears on |
|---|---|---|
| RQ1 | How wrong is a population REE equation for an individual, and can that error be quantified rather than assumed away? | `DEC-018`, `DEC-024` |
| RQ2 | How much of the total error in a formula-based TDEE estimate is contributed by the activity multiplier specifically, and do its component errors cancel or compound? | `DEC-019`, `DEC-092`, `DEC-093` |
| RQ3 | Can an individual's maintenance energy requirement be estimated from their own logged intake plus weight trend, and with what demonstrated accuracy? | `DEC-020`, `DEC-021`, `DEC-083` |
| RQ4 | How much observed data, over what window, at what regularity, is needed before such an estimate beats the population prior? | `DEC-020`, `DEC-081`, `DEC-026`, `DEC-029` |
| RQ5 | How should data quality (under-reporting, non-weighed logging, adherence, gaps) be assessed and allowed to attenuate the observation's influence? | `DEC-077`, `DEC-078`, `DEC-079`, `DEC-082` |
| RQ6 | How should model and observation be reconciled when they diverge, and what safeguard prevents a data artefact being read as a metabolic outlier? | `DEC-021`, `DEC-110`, `DEC-108` |
| RQ7 | How should the resulting figure's uncertainty be represented internally and communicated to the user? | `DEC-024`, `DEC-112`, `DEC-029` |
| RQ8 | On what evidence does a goal-driven deficit or surplus convert into an expected rate of weight change, and does the conversion currently in the specification survive scrutiny? | `DEC-022`, `DEC-027`, `DEC-028` |
| RQ9 | How does an energy re-estimate propagate to macros, and what prevents macros from becoming a second, independent control loop? | `DEC-084`, `DEC-085`, `DEC-039`, `DEC-031`/`034`/`036` |
| RQ10 | Where is the hard boundary between the scientific/energy layer and the meal-translation layer, and what stops a food or portion decision from feeding back into the energy estimate? | `DEC-060`, `DEC-066`, `DEC-086`, `DEC-070` |

Two further questions are named in §15 as **open**, not answered: whether device-derived activity data
should be admitted as an input at all (RQ2's negative result makes this genuinely undecided), and
whether an energy-availability safety floor should gate deficit prescriptions for disclosed trainees
(`DEC-095`).

---

## 4. Evidence domains

Each entry is rated on six axes: what it measures; inputs it needs; strengths; weaknesses;
population-vs-individual applicability; longitudinal fitness; and app feasibility. Per
`PROJECT_AI_PROTOCOL.md` §25, each is marked **established** or **emerging**, and every numeric value
below is reported *as a source's finding*, never adopted as a project value. Nothing in this section
selects anything.

### 4.1 The 2023 NASEM DRI framework for energy — **established**

- **What it measures:** Estimated Energy Requirement (EER), rebuilt on an expanded doubly-labeled-water
  (DLW) database, with four PAL categories and age-dependent coefficients.
- **Inputs needed:** age, sex, height, weight, life-stage, a PAL category.
- **Strengths:** it is the current authoritative framework, DLW-anchored, and — decisively for this
  document — it publishes a **standard error of predicted value (SEPV)** per equation, reported as
  342 kcal/d for men ≥19 y and 241 kcal/d for women. That is a published, citable width for the
  population prior, which is precisely the quantity `DEC-024` presently has no source for.
- **Weaknesses:** still a population regression; the SEPV *is* the weakness, stated honestly.
- **Population vs individual:** NASEM states the point directly — comparing an individual's intake to
  the EER "does not indicate whether they are meeting, exceeding, or falling below their actual
  requirement." The framework's own applications chapter recommends monitoring body weight over time
  and adjusting.
- **Longitudinal fitness:** none by itself. It is explicitly a starting point that the source tells you
  to correct with observation.
- **App feasibility:** high. Same input set the app already collects.
- **Sources:** [NASEM 2023, DRI for Energy (NCBI Bookshelf)](https://www.ncbi.nlm.nih.gov/books/NBK591034/);
  [Applications chapter](https://www.ncbi.nlm.nih.gov/books/NBK591020/).

### 4.2 Predictive REE equations, Mifflin-St Jeor in particular — **established**

- **What it measures:** resting energy expenditure from anthropometrics.
- **Inputs needed:** age, sex, height, weight.
- **Strengths:** most accurate general REE equation in the modern literature; already `SHIPPED` here as
  `DEC-018`.
- **Weaknesses:** accuracy is a *distribution*, not a point. Reported to land within ±10% of measured
  REE for roughly 56–73% of general adults, and 40.7–63.7% in athletic populations. Restated plainly:
  for something between a quarter and three-fifths of users, the app's opening REE figure is off by
  more than a tenth before any activity multiplier is applied.
- **Population vs individual:** the ±10% hit-rate figures *are* the population-to-individual gap,
  quantified.
- **Longitudinal fitness:** none. Fixed given fixed inputs; changes only when body weight changes.
- **App feasibility:** already implemented.
- **Sources:** [RMR equations in athletes, meta-analysis (PMC10687135)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10687135/);
  [RMR prediction validity in females (PMC7299486)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7299486/).

### 4.3 Activity multipliers and PAL — **established (as a critique)**

- **What it measures:** total expenditure as a scalar multiple of resting expenditure.
- **Inputs needed:** a self-reported activity category, or an activity log plus MET tables.
- **Strengths:** cheap, universally understood, needs no hardware.
- **Weaknesses:** three compounding error sources, not one. (i) The 1-MET convention overestimates true
  measured RMR by a reported 10–30%, so every MET-derived cost inherits a scaling error. (ii) PAL
  varies widely *within* the same sport or occupation, so the category is a poor proxy for the person.
  (iii) Self-report tends to over-estimate activity while MET tables tend to under-estimate the cost of
  the activity performed. These do not reliably cancel; the literature describes them as compounding.
- **Population vs individual:** worst of the domains reviewed. A category assignment is a population
  statement wearing an individual's label.
- **Longitudinal fitness:** none, and worse than none in practice — the multiplier only changes when
  the user changes a dropdown, so real changes in habitual activity are invisible to it.
- **App feasibility:** already implemented, and (per §1.2) implemented as a single point rather than
  the specified band, discarding the only visible width.
- **Sources:** [PAL calculation revisited (PMC13007108)](https://pmc.ncbi.nlm.nih.gov/articles/PMC13007108/);
  [PAL in female athletes (PMC7004509)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7004509/).

### 4.4 Consumer wearable energy-expenditure estimates — **established (as low-trust)**

- **What it measures:** device-estimated total or active energy expenditure.
- **Inputs needed:** a wearable, plus a data-sharing integration the app does not have.
- **Strengths:** passive, continuous, no user logging burden, responsive to real behaviour change.
- **Weaknesses:** a 2024 living umbrella review reports mean EE bias around −3% but with error spanning
  roughly −21% to +15%, and notes reviews reporting MAPE above 30% for all brands. A near-zero mean
  bias with that spread is the classic population-accurate / individual-inaccurate signature.
- **Population vs individual:** poor. The small mean bias is a group property that does not transfer.
- **Longitudinal fitness:** good in principle (dense, continuous), undermined by the per-individual
  error magnitude.
- **App feasibility:** medium. Technically integrable; the trust question is the blocker, not the
  plumbing.
- **Source:** [Living umbrella review of wearable EE accuracy (PMC11560992)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11560992/).

### 4.5 Self-reported dietary intake — **established (as biased)**

- **What it measures:** what the user says they ate.
- **Inputs needed:** the intake logging the app already has.
- **Strengths:** available today; the single richest individual signal the app can currently obtain.
- **Weaknesses:** systematic under-reporting, typically reported around 5–25%, with misreporting rates
  above 50% observed in national dietary datasets. The Goldberg cutoff (reported intake against
  predicted BMR, screened against a plausible PAL) is the standard screen; a 2024 DLW-derived detection
  equation and 2025 methodological work extend that family.
- **Population vs individual:** the bias is individual and persistent, not random noise that averages
  out over a window — which is exactly why an absolute-intake reading cannot be trusted, and why the
  intake-balance approach (§4.6) is built to be robust to a *stable* bias rather than to assume none.
- **Longitudinal fitness:** good, conditional on the bias being reasonably stable within a person over
  the window.
- **App feasibility:** high for the data; the screening logic is new work.
- **Sources:** [Nature Food 2024, DLW-derived misreporting detection](https://www.nature.com/articles/s43016-024-01089-5);
  [BMC Med Res Methodol 2025](https://link.springer.com/article/10.1186/s12874-025-02568-4).

### 4.6 Intake-balance / energy-balance back-calculation — **established**

- **What it measures:** energy intake or expenditure inferred from observed body-weight change plus a
  model of body-composition dynamics.
- **Inputs needed:** a regular weight series and a logged-intake series over weeks.
- **Strengths:** the strongest individualization evidence found. Sanghvi et al. (AJCN 2015) reported the
  NIDDK body-weight dynamics model reproducing the two-year CALERIE intake change to within 40 kcal/d
  of the DLW-plus-DXA reference. Subsequent intake-balance validation work supports the method family.
- **Weaknesses:** accuracy depends on weight-series quality and on the model's body-composition
  assumptions; it estimates a *change* well, which is not the same as pinning an absolute level.
- **Population vs individual:** genuinely individual — this is its whole point.
- **Longitudinal fitness:** excellent; it is definitionally longitudinal and cannot operate on a single
  timepoint.
- **App feasibility:** medium. The mathematics is published and tractable; the weight-history subsystem
  it needs does not exist here (§6.3).
- **Sources:** [Sanghvi et al., AJCN 2015 (PMC4515869)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4515869/);
  [intake-balance validation (PMC5485536)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5485536/).

### 4.7 Dynamic body-weight models — **established**

- **What it measures:** the trajectory of body weight and composition under a given intake, accounting
  for expenditure adaptation over time.
- **Inputs needed:** baseline anthropometrics plus an intake trajectory.
- **Strengths:** Hall et al. (Lancet 2011) is a validated differential-equation model, and it is the
  engine behind the public NIH Body Weight Planner. It supplies the thing a static rule cannot: an
  expenditure that moves as the body moves.
- **Weaknesses:** heavier than a formula; parameterisation and validation matter; harder to explain to
  a user.
- **Population vs individual:** population-parameterised but individually trajectory-fitted — the
  useful middle.
- **Longitudinal fitness:** excellent.
- **App feasibility:** medium; the same missing subsystem as §4.6 gates it.
- **Sources:** [Hall et al., Lancet 2011](https://pubmed.ncbi.nlm.nih.gov/21872751/);
  [NIDDK Body Weight Planner](https://niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner).

### 4.8 The static 3500 kcal-per-pound rule — **established as incorrect**

- **What it measures:** nominally, the energy equivalent of a pound of body fat, used to convert an
  energy deficit into a predicted rate of weight loss.
- **Weaknesses:** it ignores expenditure adaptation and systematically over-predicts loss. Thomas et al.
  (IJO 2013) reported observed loss of 20.1 ± 11.3 lb against 27.6 ± 16.0 lb predicted by the static
  rule, with an accompanying response from Hall in the same journal.
- **Why it is in this document:** `DECISION_LOGIC_SPECIFICATION.md` §3.1 derives `DEC-022`'s ±500 kcal
  from "the standard ~3,500 kcal per pound of body fat approximation." That derivation rests on this
  rule. See §15.1 — recorded as a finding for a human, not applied.
- **Sources:** [Thomas et al., IJO 2013](https://www.nature.com/articles/ijo2013112);
  [Hall response, IJO 2013](https://www.nature.com/articles/ijo2013113).

### 4.9 Adaptive thermogenesis — **established**

- **What it measures:** the reduction in energy expenditure beyond what body-composition change alone
  predicts, following weight loss.
- **Strengths / findings:** commonly reported around 90–180 kcal/d after moderate loss, with a range
  spanning roughly −65 to −230 kcal/d across studies and methods; roughly half of the apparent effect
  is reported to dissipate after weight stabilization.
- **Why it matters here:** it is the physiological reason a fixed prescription drifts out of
  calibration with time-on-plan. It argues for **periodic re-estimation from observation** rather than
  for adding another correction term to the formula. The distinction matters: a correction term would
  be a new invented coefficient, which §18 bars; re-estimation is the architecture the corpus already
  approved.
- **Population vs individual:** the magnitude is individually variable, which is itself the argument
  against a fixed correction.
- **Longitudinal fitness:** it is a longitudinal phenomenon by definition and is invisible to any
  single-timepoint method.
- **Sources:** [AJCN review of adaptive thermogenesis](https://ajcn.nutrition.org/article/S0002-9165(22)00885-1/fulltext);
  [magnitude and methods (PubMed 34839398)](https://pubmed.ncbi.nlm.nih.gov/34839398/).

### 4.10 Day-to-day body-mass variability — **established**

- **What it measures:** the noise floor of scale weight in euvolemic adults.
- **Findings:** day-to-day body-mass SD reported at about 0.53% at one day, rising to about 0.69% at
  seven days; consecutive-day swings of ±0.5–1 kg are common; the drivers are sodium/water balance,
  glycogen and gut content rather than tissue change. Two-week weight-change composition work supports
  the same reading.
- **Why it matters here:** it sets the floor any trend rule must clear before a change can be called
  real. `DEC-026` and `DEC-029` are the decisions that must clear it. This document reports the noise
  magnitude; it does not set the window, the smoothing constant, or the threshold.
- **Sources:** [Day-to-day variability in euvolemic body mass (PubMed 37955103)](https://pubmed.ncbi.nlm.nih.gov/37955103/);
  [two-week weight-change composition](https://physoc.onlinelibrary.wiley.com/doi/full/10.14814/phy2.13336).

### 4.11 Trend extraction and existing adaptive-TDEE products — **established method, emerging product practice**

- **What it measures:** the underlying trend in a noisy daily weight series; and, commercially, a
  weekly-updated expenditure estimate.
- **Findings:** exponentially-weighted moving averages and rolling averages are the standard smoothing
  family. Commercial adaptive-TDEE products (MacroFactor among others) run weekly re-estimation from
  logged intake plus weight trend, and are typically described as needing on the order of 2–4 weeks of
  data before they will move a target.
- **Weaknesses:** product behaviour is precedent, not evidence. The commercial cadence is reported here
  as *what exists*, and explicitly not as a validated threshold — adopting a competitor's window would
  be inventing a threshold by imitation, which §18 bars.
- **App feasibility:** high, once a weight series exists.
- **Sources:** [Exponential smoothing](https://en.wikipedia.org/wiki/Exponential_smoothing);
  [adaptive-TDEE product description](https://calorie-trackers.com/reviews/macrofactor/).

### 4.12 Recursive state estimators (Kalman / EKF family) — **emerging in this application area**

- **What it measures:** a hidden state (here: true maintenance energy requirement) recursively updated
  from noisy observations, with explicit models of both measurement noise and process noise.
- **Strengths:** it is the natural formalism for "trust the observation more as it accumulates, and
  less when it is noisy" — the weighting emerges from the noise model rather than being hand-set.
  Applied in the literature to physical-activity energy expenditure and to gestational energy-intake
  estimation.
- **Weaknesses:** the application-specific validation evidence this project would need does not exist
  in the sources reviewed; it is heavier to implement, harder to explain, and its failure modes are
  less legible than a rolling average's.
- **Population vs individual:** individual by construction.
- **Longitudinal fitness:** excellent.
- **App feasibility:** low-to-medium today.
- **Sources:** [PM-EKF (arXiv)](https://arxiv.org/abs/2604.26803);
  [semi-physical intake estimation (PMC5001697)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5001697/).

### 4.13 Low energy availability and REDs — **established consensus, contested threshold**

- **What it measures:** whether energy intake less exercise energy expenditure, normalised to fat-free
  mass, is adequate to support physiological function.
- **Findings:** the 2023 IOC REDs consensus frames low energy availability on an adaptable-to-problematic
  spectrum and defines a three-step CAT2 screening approach. The widely-quoted 30 kcal/kg FFM threshold
  derives from short-term studies in sedentary women and is widely critiqued as not universally
  applicable. Field estimates of energy availability carry error from both the intake side and the
  exercise-EE side.
- **Why it matters here:** it is the candidate safety floor under any deficit prescription for a
  disclosed trainee (`DEC-095`). It is listed as a *candidate*; whether such a floor gates prescriptions
  at all is in §16, and no threshold value is adopted here.
- **Sources:** [IOC 2023 REDs consensus](https://www.semanticscholar.org/paper/31232e7d9d1bcf590e29b10e8d80337a8a6b6616);
  [LEA threshold critique (PMC11194298)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11194298/).

### 4.14 Protein during energy restriction — **established**

- **What it measures:** fat-free-mass preservation under a deficit as a function of protein intake.
- **Findings:** intakes in the 1.2–1.6 g/kg/d region are reported to preserve lean mass relative to
  0.8 g/kg/d during restriction, and a 2025 meta-regression supports ≥1.6 g/kg/d in resistance-trained
  individuals under a deficit.
- **Why it is in an *energy* document:** it is the cleanest demonstration that the macro layer is
  *conditioned on* the energy state rather than independent of it — the same person's protein
  requirement differs at maintenance and in deficit. That is §12's constraint, evidenced.
- **Non-adoption note:** the app's existing protein tiers are `DEC-031`, already `SHIPPED`. Nothing here
  changes them, and no value above is proposed as a target.
- **Sources:** [Meta-regression, Strength & Conditioning Journal 2025](https://journals.lww.com/nsca-scj/fulltext/9900/effect_of_dietary_protein_on_fat_free_mass_in.179.aspx);
  [Clin Nutr ESPEN 2024](https://www.clinicalnutritionespen.com/article/S2405-4577(24)00176-1/abstract).

---

## 5. Candidate model architectures

Five candidates, described so they can be compared. **No selection is made here** — the choice is in
§16. No architecture below is given a coefficient, a weighting, a window, or a threshold; where one
would be needed, that is stated as a parameter the architecture *requires a human to supply*, which is
part of its cost.

### A. Static formula (the status quo)

```
profile → REE equation → × PAL point → ± goal offset → target
```

- **Individualization:** anthropometric only.
- **Data required:** one profile snapshot.
- **What it needs that does not exist:** nothing. It is `../../src/lib/mealPersonalization.ts` today.
- **Corpus position:** `DEC-018`/`DEC-019` `SHIPPED`; `DEC-022` `COVERED`.
- **Cost:** carries the full §4.2 + §4.3 error stack with no mechanism to detect or correct it, and no
  honest width (§1.2).
- **Honest strength:** it always produces an answer, immediately, for a brand-new user with no history.
  Any other architecture still needs A for the cold-start period, so A is not a rejected option — it is
  at minimum the first phase of every other option.

### B. Formula plus monotone observation weighting

```
formula estimate ──┐
                   ├→ combine, weight rising monotonically with observation
observed response ─┘   quantity and quality → individualized estimate
```

- **Individualization:** partial and gradual.
- **Data required:** a weight trend and an intake series; a data-sufficiency gate (`DEC-020`/`081`/`082`).
- **What it needs that does not exist:** weight-trend subsystem, monitoring/adherence subsystem.
- **Corpus position:** this is the literal shape of the Gate 5 §3.18.1 hierarchy, and
  `DECISION_LOGIC_SPECIFICATION.md` §3.1 already states that the conceptual principle is specifiable
  while "the *exact* weighting function is not an established formula anywhere in the corpus and should
  not be invented here."
- **Cost:** the weighting function is precisely the thing nobody is authorized to invent. B is only
  buildable once a human supplies it or ratifies a sourced one.
- **Note:** B is a *family*, not one design. Its cheapest member is a hard switchover (prior until the
  gate passes, observation after), which needs no blending function at all — that member is
  compatible with Gate 5's "starting reference, not a permanent co-equal input" wording and is the
  variant that asks least of a human. Recording that as an observation about the option space, not a
  recommendation.

### C. Energy-balance back-calculation

```
logged intake + weight trend → body-weight dynamics model → inferred maintenance requirement
```

- **Individualization:** high; the estimate is derived from the person's own response.
- **Data required:** a regular weight series and a reasonably complete intake series over weeks.
- **What it needs that does not exist:** weight-trend subsystem, monitoring/adherence subsystem, and
  intake-completeness assessment.
- **Evidence position:** the strongest of the five (§4.6, §4.7). Also inherits §4.5's under-reporting
  problem directly, since logged intake enters the calculation as a quantity.
- **Cost:** requires an explicit stance on intake bias — either correct for it, or estimate a quantity
  that is robust to a stable offset, or state plainly that the output is conditioned on the user's own
  logging convention. That stance is a design decision no one has taken.

### D. Recursive state estimator (Kalman / EKF family)

```
prior state (formula) → predict → observe (weight, intake) → update → posterior state, recursively
```

- **Individualization:** high, and it is the only candidate where the weighting between prior and
  observation *falls out of* the noise model instead of being hand-authored.
- **Data required:** the same as C, plus explicit measurement-noise and process-noise characterisations.
- **What it needs that does not exist:** everything C needs, plus the noise parameterisation, plus
  validation evidence for this population and this data quality (§4.12 — the application-specific
  validation is not in the sources reviewed).
- **Cost:** highest implementation and explanation burden; least legible failure mode. A user asking
  "why did my target change?" is hardest to answer here.

### E. Hybrid — formula as prior, observation as likelihood, explicit posterior

```
population prior (formula + its published SEPV width)
      × observation likelihood (intake-balance signal + its own uncertainty)
      = posterior maintenance estimate {value, interval}
```

- **Individualization:** high, and uniquely it produces the *interval* as a first-class output rather
  than as an afterthought (§7, §10).
- **Data required:** as C, plus a defensible width for the prior — for which §4.1's published SEPV is
  the one citable candidate this research found.
- **Relationship to the others:** E is not a rival to B and C so much as the formal statement of what B
  approximates and what C contributes. D is one mechanised way to compute E recursively.
- **Cost:** requires the project to commit to a probabilistic representation end to end, including in
  what the user is shown; and E is the option most likely to require the NASEM framework question in
  §16 to be settled first, since without a sourced prior width there is no prior to speak of.

### 5.1 Comparison table

| | A static | B weighted | C back-calc | D estimator | E hybrid |
|---|---|---|---|---|---|
| Uses individual response | no | yes | yes | yes | yes |
| Works on day 1 | yes | prior only | no | prior only | yes (prior only) |
| Needs weight-history subsystem | no | yes | yes | yes | yes |
| Needs monitoring/adherence subsystem | no | yes | yes | yes | yes |
| Needs a human-supplied parameter before it can be built | no | **yes** (weighting, unless the switchover variant) | yes (bias stance) | **yes** (noise model) | yes (prior width, bias stance) |
| Handles adaptive thermogenesis (§4.9) | no | via re-estimation | via re-estimation and model | yes, structurally | yes, structurally |
| Native uncertainty output | no | no | no | yes | yes |
| Explainable to a user | high | high | medium | low | medium |
| Published validation for this use | n/a | n/a | strong (§4.6) | thin (§4.12) | partial (inherits §4.1 + §4.6) |

**No row of this table constitutes a recommendation.** The architecture choice is §16 item 3, and the
table's purpose is to make the choice legible, not to pre-empt it.

---

## 6. Required inputs

Split by what it would actually take to obtain each one. Nothing here is a schema; §18 bars that.

### 6.1 Already in the app

| Input | Where it lives today |
|---|---|
| Age, sex, height, current weight, activity category, goal | `personal_plan` (`supabase/09-personal-plan-user-scoped.sql`), via `PersonalProfile` |
| Waist circumference (optional) | same, `waist_cm` |
| Per-item logged consumption | the meal-entry / consumption path (`DEC-076` `COVERED`) |
| Profile validity gate | `validateProfile()` (`DEC-005`/`DEC-017`) |
| Coarse implausibility flag | the `MVP-1 PROVISIONAL (DEC-009)` BMI check in `mealPersonalization.ts` |

### 6.2 Capturable today without a new subsystem

| Input | Note |
|---|---|
| Intake **completeness** per day (did the user log at all; how many occasions) | derivable from data the app already writes; no new capture surface, only new interpretation. Interpretation is `DEC-078`/`DEC-079`, both `BLOCKED`. |
| Time-on-plan / days since profile creation | `personal_plan.updated_at` exists in the schema file; note `DEC-011`'s register entry records that its intended use needs a migration that was deliberately withheld, so this is *available as data*, not *available as a decision input*. |
| Explicit user-declared weighing convention (weighed vs estimated portions) | a single disclosure field, not a subsystem — but it is a new input the app does not ask for. |

### 6.3 Needs a new subsystem

These are the four blocking subsystems `DEC_REGISTER.md` already cites by name. Naming them here does
not design them.

1. **Weight / body-composition trend subsystem** — a weight *series*, not a scalar. Blocks `DEC-025`,
   `026`, `027`, `028`, `029`, `030`, and transitively `DEC-020`/`021`. Nothing in §5's B, C, D or E is
   possible without it. It is the single highest-leverage missing piece in this entire document.
2. **Training / activity capture subsystem** — structured session data (type, volume, intensity,
   phase). Blocks `DEC-092`, `093`, `095`, and is the only route by which `DEC-019`'s activity term
   could become something other than a dropdown.
3. **Monitoring / adherence subsystem** — logging-quality rating, adherence tracking, missing-log
   handling, check-in escalation. Blocks `DEC-077`–`080`, and `DEC-078` feeds `DEC-020` directly on the
   dependency spine.
4. **Micronutrient data** — not on the energy chain, listed because the register cites it as one of the
   four and because §12's downstream macro consequences touch it at the edges. Out of scope for this
   document.

**Explicitly undecided, not placed in any of the three buckets:** device- or step-derived activity
data. §4.4's error profile means "can we get it" and "should we use it" have different answers. §16
item 7.

---

## 7. Candidate outputs

The figures the chain emits. The load-bearing point of this section is not the list — it is the shape.

**Every figure below should carry a structure, not a bare number:**

```
{ value, interval, source, evidence_basis, as_of }
```

- `value` — the point figure.
- `interval` — the honest width around it, from §10.
- `source` — which stage produced it (`population_formula`, `observation`, `blend`, `user_override`).
- `evidence_basis` — what it rests on (`profile_only`, `n_weeks_observed`, `insufficient_data`).
- `as_of` — when it was computed, so staleness is visible rather than inferred.

This is a *conceptual* shape, not a type definition and not a schema; naming the five fields is the
point, not their encoding. It matters because today's output (`PersonalTargets`) is a flat record of
bare numbers plus two untyped string arrays, so downstream code has no way to tell a formula guess from
a data-backed figure. Every stage boundary in §2 becomes unenforceable at runtime when the values
crossing it are indistinguishable.

| Output | Owning DEC | Notes |
|---|---|---|
| Initial TEE estimate (Level 1, population) | `DEC-019` | Today: `maintenanceKcal`, bare number |
| Individualized maintenance estimate (Level 1, individualized) | `DEC-021` | Does not exist today |
| Energy prescription (Level 2) | `DEC-022` | Today: `targetKcal`, bare number |
| Target rate of change | `DEC-027` | Does not exist today |
| Observed trend call (trend vs noise) | `DEC-026` | Does not exist today |
| Data-sufficiency verdict | `DEC-020`, `081`, `082` | Does not exist today |
| Data-quality verdict | `DEC-077`, `078`, `082` | Does not exist today |
| Confidence / uncertainty representation | `DEC-024`, `112` | Today: two `string[]` arrays |
| Macro targets | `DEC-031`, `034`, `036`, `037` | Today: bare numbers and ranges |
| Adjustment proposal, and its rationale | `DEC-084`, `089` | Does not exist today |
| Circuit-breaker / escalation signal | `DEC-090` | Does not exist today |

---

## 8. Longitudinal data requirements

Conceptual only. No cadence, window length, or completeness threshold is selected here; each is named
as a parameter with the evidence that constrains it and the `DEC` that must eventually own it.

**What the longitudinal record must be able to answer.** This is the real specification of this
section — a data design is adequate if and only if it can answer all six:

1. What was this person's body-mass trajectory over the window, distinguishable from its own noise
   floor (§4.10)?
2. How much did they actually log, on how many of the days in the window, and with what gaps?
3. Is the observed trajectory consistent with what the current prescription predicted (`DEC-083`)?
4. If it is not, is the inconsistency attributable to data quality before it is attributed to
   physiology (Gate 5 §3.18.1's safeguard ordering)?
5. How much has the estimate already moved from its starting point, cumulatively (`DEC-090`'s
   cumulative-deviation trigger needs this to be answerable at all)?
6. What did the app believe, and why, at each past point in time — so that a change in the target can
   be explained rather than merely announced (`DEC-089`).

**Weigh-in cadence and regularity.** Constrained by §4.10: a series sparse relative to the noise floor
cannot support a trend call. Regularity matters independently of count, since irregular sampling biases
a smoothed trend. Owner: `DEC-026`, with `DEC-029` owning what irregularity does to confidence.
Parameter, not selected here.

**Intake-log completeness.** Both a gate and a continuous quality signal. Owner: `DEC-078` (adherence
as a data-quality signal), `DEC-079` (missing logs), `DEC-082` (quality gate). Parameter, not selected.

**Minimum observation window.** `DECISION_LOGIC_SPECIFICATION.md` §3.1 already records ~2–3 weeks for
`DEC-020` and explicitly flags it as "a practical convention, not a physiological constant"; §3.2
records a rolling 7-day average with a 2-week directional hold for `DEC-026`, flagged the same way;
§3.1 records a 2–4 week recompute cadence for `DEC-023`, flagged the same way. §4.11 notes commercial
products cluster in the same 2–4 week region. **Four independent conventions agreeing is not the same
as evidence**, and this document does not upgrade any of them. Owner: `DEC-020`. §16 item 6.

**Retention.** Long enough to answer question 5 and 6 above, which means the horizon is set by the
circuit-breaker's cumulative-deviation window (`DEC-090`) — itself an open parameter (§16 item 5).

---

## 9. Data-quality considerations

Every entry is a reason the observation signal cannot be taken at face value. Together they are the
argument for why §5's observation-driven architectures need a quality gate (`DEC-082`) in front of
them, not merely a quantity gate (`DEC-081`) — the split the inventory already draws under Principle #4.

| Concern | What it does to the estimate | Evidence | Owning DEC |
|---|---|---|---|
| Intake under-reporting | Biases any intake-derived expenditure estimate downward. Typically reported 5–25%, >50% misreporting in national datasets. The bias is individual and persistent, so a longer window does not average it out. | §4.5 | `DEC-077`, `082` |
| Non-weighed / estimated portions | Adds variance and, in the usual direction, further under-statement. Distinguishable from under-reporting in cause, not in effect. | §4.5 | `DEC-077` |
| Adherence drift | If logging completeness falls as the plan gets harder, the missing days are non-random — the observation degrades exactly when the plan is failing, which is when it matters most. | §4.5, §4.11 | `DEC-078` |
| Missing periods | **`DEC-079` exists precisely to forbid the obvious wrong answer:** a gap must never be treated as equivalent to "no change." A silent zero-fill would be an invented data point. | corpus rule | `DEC-079` |
| Weigh-in noise | ±0.5–1 kg day-to-day swings from sodium, water, glycogen and gut content. Any trend call must clear this floor. | §4.10 | `DEC-026`, `029` |
| Device-derived activity error | Mean bias near −3% but individual error roughly −21% to +15%, MAPE >30% reported for all brands in some reviews. Admitting this input imports that error into the energy figure. | §4.4 | `DEC-092`, `019` |
| Self-reported activity category | Over-estimation of activity compounded with MET-table under-estimation of cost (§4.3). Present in the app today. | §4.3 | `DEC-019` |
| Short-term physiological confounders | Glycogen and water shifts after a diet or training change can produce weeks of weight movement unrelated to fat balance, and will masquerade as a metabolic signal. | §4.10 | `DEC-083`, `110` |

**The ordering rule is already ratified.** Gate 5 §3.18.1: a large model/observation divergence is
**not** to be read as a genuine metabolic outlier by default. It triggers a safeguard that checks
intake-logging quality, measurement quality, adherence/completeness, short-term physiological effects
and other confounders *first*. Every row above is one of the things that safeguard is checking. This
document adds none and removes none.

---

## 10. Uncertainty representation

Extends `DEC-024` and `DEC-112`; replaces neither. `DEC-024` is currently `COVERED` by two `string[]`
arrays and `DEC-112` `COVERED` by the same convention — adequate for MVP, and explicitly "not
confidence-scaled" in the register's own words.

**Three components, in the order they arise:**

1. **The population prior's honest width.** §4.1's SEPV is the citable candidate: NASEM publishes a
   standard error of predicted value per equation (reported as 342 kcal/d for men ≥19 y, 241 kcal/d for
   women), alongside its own statement that comparing an individual's intake to the EER does not tell
   you whether they are meeting their actual requirement. §4.2's ±10% hit-rates say the same thing in a
   different currency for Mifflin-St Jeor specifically. **Whether the app adopts a SEPV-style interval,
   and on which framework's equation, is §16 items 1 and 3 — not decided here.** What is decided by the
   evidence, and not by this document, is that a width of this order exists and that presenting a bare
   number implies a precision the method does not have.

2. **Observation-derived narrowing.** The interval should narrow as the observation window lengthens
   and completeness improves, and widen again when data goes missing or quality degrades. This is the
   same monotone relationship `DEC-024`'s existing specification already states as a principle
   ("confidence should scale inversely with measurement-error factors: data recency, quantity and
   consistency"). **The functional form of the narrowing is not specified here** — it is the same class
   of object as `DEC-021`'s weighting function, which §3.1 of the specification says must not be
   invented.

3. **The divergence branch.** Already approved. Gate 5 §3.18.1's safeguard is the failure mode's
   handler: when model and observation disagree beyond the safeguard's trigger, the correct output is
   not a confidently-blended number but a lowered-confidence state plus the data-quality investigation
   §9 describes. The *existence* of a cap or safety rail is approved; **its value is Phase 8 carry-forward
   item 1 and remains open, with retention itself not assumed** (`DECISION_LOGIC_SPECIFICATION.md`
   §4.1).

**What this means for the user-facing surface.** `DEC-024`'s existing specification already gives the
qualitative form ("preliminary estimate" vs "confirmed from N weeks of your own data"). The gap this
document identifies is not the wording — it is that today nothing in the pipeline knows N, so the
qualitative statement has no input to be derived from. Fixing that is a §6.3 subsystem question, not a
copy question.

---

## 11. Personalization logic (conceptual)

The loop below is `APP_DECISION_INVENTORY.md` §5's loop and `PROJECT_AI_PROTOCOL.md` §6's loop. It is
not a new loop. What this section adds is the label on each arrow: the `DEC` that owns the transition,
and the §2 Principle that forbids merging the two stages it joins.

```
BASELINE  (DEC-005/006/009/017)
   │  arrow owner: DEC-017 — sufficiency gate
   │  forbids merging by: #4 measurement ≠ interpretation
   ▼
INITIAL ESTIMATE  (DEC-018 → DEC-019)
   │  arrow owner: DEC-020 — observed-data sufficiency gate
   │  forbids merging by: #2 initial ≠ individualized
   ▼
OBSERVED DATA  (DEC-076, DEC-077)
   │  arrow owner: DEC-078/079 — adherence and missing-data handling
   │  forbids merging by: #4
   ▼
DATA-QUALITY ASSESSMENT  (DEC-081 quantity, DEC-082 quality)
   │  arrow owner: DEC-082
   │  forbids merging by: #4 — quantity sufficiency is not quality sufficiency
   ▼
INTERPRETATION  (DEC-026 trend, DEC-083 consistency, DEC-110 mismatch, DEC-091 subjective)
   │  arrow owner: DEC-021 — the weighting decision itself
   │  forbids merging by: #3 population standard ≠ individual response
   ▼
INDIVIDUALIZED MAINTENANCE  (DEC-021)
   │  arrow owner: DEC-022, gated by DEC-014 safety
   │  forbids merging by: #1 estimate ≠ prescription  ← the load-bearing one
   ▼
PRESCRIPTION  (DEC-022) ──→ TARGETS (DEC-027 rate; DEC-031/034/036/037 macros)
   │  arrow owner: DEC-060 — the translation boundary
   │  forbids merging by: #6 requirement ≠ food recommendation, #7 target ≠ meal plan
   ▼
MONITORING  (DEC-076–080)
   │  arrow owner: DEC-087 — the explicit wait-vs-adjust gate
   │  forbids merging by: #5 interpretation ≠ adjustment
   ▼
ADJUSTMENT  (DEC-084 → DEC-085 → DEC-086; DEC-089 notify; DEC-090 circuit breaker)
   │
   └──→ back to OBSERVED DATA, or out to escalation via DEC-090 → Domain C
```

**Four properties of this loop that are constraints, not choices:**

- **It has an exit.** `DEC-090`'s circuit breaker is dual-trigger (repeated unsuccessful cycles, or
  excessive cumulative deviation), and Gate 5's non-deferred governing constraint is that the loop must
  never be allowed to adjust indefinitely. The two numeric parameters are open (§16 item 5); the exit's
  existence is not.
- **`DEC-084` reuses `DEC-028`'s reassessment trigger** rather than introducing a second competing
  threshold — Gate 5 §3.18.5, closing a risk the specification's own self-audit raised.
- **Prescription sits after individualized estimate, never before.** `APP_DECISION_INVENTORY.md` §5
  states the reason explicitly: it is what keeps "what is happening" structurally prior to and separate
  from "what should this person do now."
- **The wait-vs-adjust tension has its own node.** `DEC-087` exists so that "we do not yet have enough
  to act on" is a decision the system makes and can explain, rather than an absence of one.

---

## 12. Energy → macro dependency

**One-directional. This is inherited, not concluded.**

Gate 5 §3.18.2 (`DEC-039` / `DEC-085`) ratified:

```
observation → energy adjustment (DEC-084) → macro recalculation (DEC-085 → DEC-031/034/036)
```

Macro allocation changes only as a **downstream consequence** of an energy-prescription change.
Independent automatic macro adjustment on satiety, adherence, training load or subjective preference
alone is **barred**; such signals may act only by first causing an authorized energy reassessment.
`DEC-031`'s protein floor and `DEC-040`'s priority principle are preserved unchanged. `DEC-039` is
`DEFERRED` in the register with the note "Explicitly ratified: no independent macro-adjustment loop
(Gate 5)."

**This document restates that as a constraint it inherits.** It is not a finding made here, and nothing
in §4.14 reopens it. §4.14's protein evidence is the opposite of a case for macro autonomy: it shows
the macro layer is *conditioned on* the energy state — the same individual's protein requirement
differs at maintenance and in deficit — which is exactly why energy must be the single controller and
macros must recompute from it rather than alongside it.

**One consequence worth stating, because it is easy to get wrong when building §5's B/C/D/E:** if the
energy estimate becomes something that moves on its own schedule, the macro layer inherits that
movement automatically. There is no separate decision to make there, and adding one would create the
second controller Gate 5 barred.

---

## 13. Macro → meal-planning dependency

The abstraction boundary. The scientific layer hands *down* targets plus uncertainty; the translation
layer must never hand a portion or food decision back *up* into the energy estimate.

```
        SCIENTIFIC / DECISION LAYER
        energy estimate → prescription → macro targets   {value, interval, source, ...}
                                  │
        ══════════════════════════╪══════════════════════ the boundary
                                  ▼   (targets + uncertainty pass DOWN only)
        TRANSLATION LAYER
        DEC-056 per-occasion distribution → DEC-060 target→candidate foods
          → DEC-061 filters → DEC-066 constructed meals → DEC-070 deviation handling
```

**Mapped onto Phase 9's five-layer model** (`../08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`
§1), whose entire stated purpose is that these must never be silently merged:

| Phase 9 layer | This chain's occupant |
|---|---|
| 1. Scientific knowledge | The evidence in §4 — what the corpus and current literature establish |
| 2. Decision logic | `DEC-017`–`024`, `026`–`029`, `031`–`037`, `081`–`090` — the energy and macro chain |
| 3. Translation logic | `DEC-055`, `056`, `060`, `061`, `066` — target becomes food becomes meal |
| 4. Product behavior | What gets stored, what triggers a prompt, what a user may override — `DEC-070`, `DEC-089` |
| 5. UI/UX | Not in scope, and not authorized (`PROJECT_AI_PROTOCOL.md` §28) |

**The specific thing that must not happen.** A user eating less than planned, or the planner failing to
find a combination that hits a target, or a user deleting a planned meal (`DEC-070`, `SHIPPED`) are all
layer-3/4 events. None of them may be read directly as evidence about the person's energy requirement.
The only legitimate path from a translation-layer observation to the energy figure runs through the
monitoring and adaptation chain (`DEC-076` → `078`/`079` → `081`/`082` → `083` → `084`), where it gets
quality-gated first. A shortcut from "the plan wasn't followed" to "the estimate must be wrong" would
collapse Principle #5 (interpretation ≠ adjustment) and Principle #7 (target ≠ meal plan) in one move.

`DEC-086` is the correctly-directed counterpart: meal structure and food selection change *as a
consequence of* an upstream adjustment. Downward. It is `BLOCKED`, along with the rest of the loop.

---

## 14. Evidence and source requirements

Standing requirements for anything numeric that ever enters this chain, per `PROJECT_AI_PROTOCOL.md`
§25 and §29.

Every numeric candidate must carry:

1. **Source** — a specific, resolvable citation, not "the literature."
2. **Date** — publication or consensus date, so vintage is visible (§15.2 exists because a vintage went
   unnoticed).
3. **Population** — who it was derived in. §4.13's 30 kcal/kg FFM figure is the cautionary case: derived
   in short-term studies of sedentary women, widely applied far outside that.
4. **Established vs emerging** — §25 point 5. Every §4 entry above carries this tag.
5. **Preserved uncertainty** — §25 point 6. A range must not be silently collapsed to its midpoint. The
   app has already done this once, at `DEC-019` (§1.2: a PAL *band* implemented as a point) and once at
   `DEC-046` (the water figure's own in-code comment records taking the midpoint of a 30–35 mL/kg
   range). Both are visible in `mealPersonalization.ts` today.
6. **No emerging → deterministic conversion without justification** — §25 point 7. §4.12's estimator
   family is the live case: plausible, published, and lacking application-specific validation here.

**Additionally, for anything that would become a project value rather than a cited finding:** it needs
a ratification record in `00_PROJECT_CONTROL/DECISIONS/`. Nothing in this document has one, which is
why nothing in this document is a project value.

---

## 15. Open questions

### 15.1 Contradiction finding — `DEC-022`'s ±500 kcal derivation

**Recorded as a finding. Not applied. Nothing was edited.**

`DECISION_LOGIC_SPECIFICATION.md` §3.1 derives `DEC-022`'s ±500 kcal/day figure from "the standard
~3,500 kcal per pound of body fat approximation." §4.8's evidence is that this rule is wrong for
precisely the reason this whole document exists: it ignores expenditure adaptation, and it
systematically over-predicts loss (observed 20.1 ± 11.3 lb against 27.6 ± 16.0 lb predicted, Thomas et
al. IJO 2013, with a same-journal response from Hall).

- **What it would change:** the *derivation* of the kcal↔rate conversion, and therefore the standing of
  ±500 kcal/day as a figure with a stated basis.
- **What it would NOT change:** `DEC-027`'s 1–2 lb/week target *rate*. That is externally sourced
  (2013 AHA/ACC/TOS, restated as current in 2025 guidance, recorded at
  `../06_EVIDENCE_AND_GAPS/EVIDENCE_AND_CONTENT_INSPECTION_REGISTER.md` §3.9) and is independent of the
  3500 rule. Only the conversion from an energy deficit to an expected rate is challenged, not the rate
  itself.
- **What it would also not change today:** the app does not implement ±500. It implements −400/+250
  (`mealPersonalization.ts`), which the register already describes as a numeric-tuning question for a
  human. This finding does not make that gap more or less urgent; it changes what the eventual
  reconciliation would have to be reconciled *to*.
- **Status:** unresolved. §16 item 2.

### 15.2 Contradiction finding — `DEC-018` / `DEC-019` framework vintage

**Recorded as a finding. Not applied. Nothing was edited.**

`DECISION_LOGIC_SPECIFICATION.md` §3.1 cites 2005-era DRI/IOM PAL bands for `DEC-019`. §4.1's NASEM
2023 DRI for Energy supersedes that framework: it was rebuilt on an expanded DLW database, it changes
the PAL category scheme (four categories, age-dependent coefficients), and it publishes a SEPV per
equation.

- **What it would change:** the cited framework for `DEC-019`'s activity incorporation, and — the part
  that matters most for this document — it would supply a **sourced width** for the population estimate,
  which is exactly the quantity `DEC-024` currently has no source for (§10 component 1).
- **What it would NOT change:** `DEC-018`'s Mifflin-St Jeor selection is a separate question. NASEM's
  EER framework and a predictive REE equation are not interchangeable objects, and adopting one does
  not automatically retire the other. Nor does it change any macro decision, any `SHIPPED` status, or
  any readiness word.
- **Status:** unresolved. §16 item 1.

### 15.3 Other open questions

| # | Question | Why it is open |
|---|---|---|
| OQ1 | Does the app estimate an absolute maintenance figure, or a *change* in it? | §4.6's evidence is strongest for reproducing intake *change*; an absolute level inherits §4.5's persistent individual bias directly. The two are different products with different honesty properties. |
| OQ2 | What is the app's stance on stable intake under-reporting? Correct it, be robust to it, or state the output is conditioned on the user's own logging convention? | No stance exists. Every observation-driven architecture in §5 needs one before it can be built. |
| OQ3 | Should the cold-start period show a target at all, or show a range? | §4.1/§4.2's widths make a bare day-1 number hard to defend, but a range may be unusable as a daily target. This is a genuine science-versus-product tension of the kind `../README.md`'s translation-mindset section describes. |
| OQ4 | Does re-estimation apply retrospectively to already-logged days? | Affects whether history is stable or mutable, and therefore whether `DEC-089`'s user notification can ever say something coherent. |
| OQ5 | What happens to the individualized estimate when the user changes goal mid-window? | The observation was generated under the old prescription. Nothing specifies whether it survives, decays, or resets. |
| OQ6 | How does any of this behave for a user whose weight is genuinely stable at an unknown intake? | The most common real case, and the one where intake-balance methods have the least signal to work with. |

---

## 16. Decisions requiring human approval

Per `PROJECT_AI_PROTOCOL.md` §26, each of these is preserved as **unresolved**. None is resolved by
this document, none may be resolved by an implementer's judgment, and none becomes resolved because a
later document needs an answer.

| # | Decision | Bears on | Current state |
|---|---|---|---|
| 1 | Whether to adopt the NASEM 2023 EER framework in place of the 2005-era DRI/IOM PAL bands | `DEC-018`, `DEC-019`, and consequently `DEC-024`'s prior width | Open. §15.2. Both `DEC-018` and `DEC-019` are `SHIPPED`, so this is a change to shipped behaviour, not a gap-fill. |
| 2 | Whether `DEC-022`'s kcal↔rate conversion is re-derived from a dynamic model instead of the 3500 kcal/lb rule | `DEC-022`; not `DEC-027` | Open. §15.1. |
| 3 | Which candidate architecture (A–E) the project targets | the whole chain | Open. §5. No option is recommended here. |
| 4 | The `DEC-021` / `DEC-110` deviation-cap value | `DEC-021`, `DEC-110` | **Still open** as Gate 5 §4.1 carry-forward item 1. Retention of a cap at all is explicitly not assumed by that item, and is not assumed here. |
| 5 | The `DEC-090` circuit-breaker cycle count and cumulative-deviation threshold | `DEC-090`, `DEC-084` | **Still open** as Gate 5 §4.1 carry-forward item 2. |
| 6 | The minimum observation window and weigh-in cadence before individualization is permitted | `DEC-020`, `DEC-026`, `DEC-029` | Open. §8 — four converging conventions are not evidence. |
| 7 | Whether device- or step-derived activity data is admitted as an input at all | `DEC-092`, `DEC-019` | Open. §4.4's error profile makes this a real question, not a formality. |
| 8 | Whether an energy-availability safety floor gates deficit prescriptions for disclosed trainees | `DEC-095`, `DEC-022`, `DEC-014` | Open. §4.13. Note the threshold's own contested provenance is part of what must be decided, not a detail of implementing it. |

**Cross-check against `DECISION_LOGIC_SPECIFICATION.md` §4.2.** That section bars Phase 8 from
introducing unsupported medical thresholds, arbitrary supplement doses, arbitrary clinical exclusion
criteria, arbitrary circuit-breaker values, unsupported heat multipliers, independent macro-control
logic, hidden formulas, and undocumented safety assumptions. This document introduces none of the
eight. Items 4 and 5 above are the two Gate 5 deferrals that remain open, restated in their original
open state rather than closed with a plausible number — which §4.2 names as exactly the failure the
deferrals exist to prevent.

---

## 17. Future implementation requirements

Prerequisites in dependency order. **No design.** Each entry says what must exist, not what it should
look like.

1. **A human answer to §16 item 3** (which architecture). Everything below is conditional on it, and
   items 1, 2 and 6–8 may need answering first depending on which architecture is chosen — E in
   particular cannot start without item 1, since without a sourced prior width there is no prior.
2. **Weight / body-composition trend subsystem** (§6.3.1). Unblocks `DEC-025`–`030`. Nothing
   observation-driven exists without it; it is the gate on `DEC-020` and therefore on `DEC-021`.
3. **Monitoring / adherence subsystem** (§6.3.3). Unblocks `DEC-076`–`080`. `DEC-078` feeds `DEC-020`
   directly, so this is a peer prerequisite of item 2, not a follower.
4. **Data-sufficiency and data-quality gates** (`DEC-020`, `081`, `082`), which need items 2 and 3
   present before they have anything to gate.
5. **The `{value, interval, source, evidence_basis, as_of}` output shape** (§7), which must land before
   or with item 6 — otherwise the individualized figure is indistinguishable from the formula figure at
   every downstream call site.
6. **Individualized maintenance estimation** (`DEC-021`), needing items 2–5 plus §16 items 3 and 4.
7. **Confidence representation** (`DEC-024`, `DEC-112`), needing item 5's shape and item 4's verdicts to
   have anything to represent.
8. **Adaptation loop with its circuit breaker** (`DEC-083`, `084`, `087`, `089`, `090`), needing all of
   the above plus §16 item 5. `DEC-085`/`086` follow automatically and are not separate work items
   (§12).
9. **Training capture subsystem** (§6.3.2) — parallel track. Unblocks `DEC-092`/`093`, is the
   precondition for `DEC-095`, and is what §16 item 8 would need in order to be actionable.

**Note on ordering:** items 2 and 3 are the only ones that can begin without a human answer, because
they are data-capture prerequisites common to every architecture in §5 except A. That is an observation
about the dependency graph, not a proposal to begin them.

---

## 18. NOT to be implemented yet

A hard fence. Everything in this list is barred until the corresponding §16 item is ratified.

1. **No adaptive loop in production.** `DEC-081`–`091` are `BLOCKED`, and the subsystems they depend on
   do not exist. Building a partial loop against absent data would mean fabricating the data.
2. **No deviation-cap value.** Gate 5 §4.1 item 1 is open, and retention of a cap at all is not
   assumed. Picking a number here would close a deferral by guessing.
3. **No circuit-breaker parameters.** Gate 5 §4.1 item 2 is open. `DECISION_LOGIC_SPECIFICATION.md` §4.2
   names "arbitrary circuit-breaker values" explicitly.
4. **No invented weighting function** between model and observation. §3.1 of the specification says it
   "should not be invented here"; the same applies here. §5's option B is described, not parameterised.
5. **No macro auto-adjust.** `DEC-039` is `DEFERRED` by explicit Gate 5 ratification. Macros recompute
   downstream of an authorized energy change and by no other route (§12).
6. **No clinical criteria.** `DEC-099`/`DEC-100` remain `DEFERRED` and were explicitly not reopened at
   Gate 5. Nothing in this document touches clinical scope, and §4.13's REDs material is evidence about
   a candidate safety floor, not a clinical criterion.
7. **No new observation-derived formula, coefficient, threshold, window, cadence, interval width, or
   macro percentage.** Every number appearing anywhere above is a cited finding attributed to a source,
   not a project value. Adopting any of them requires a `DECISIONS/` record.
8. **No schema, no migration, no UI, no API.** §28 (the scientific architecture leads the software
   architecture) plus this document's own scope fence. §7's five-field shape is a conceptual
   requirement about what must be distinguishable, not a table or a type.
9. **No `DEC` ID created, renamed, retired, or amended**, and no readiness word changed. §30.
10. **No `IMPLEMENTATION_HANDOFF.md` row.** This document is research, not a spec pushed for
    implementation. A handoff row requires a `09_HANDOFF_SPECS/` spec and a deliberate push, which is a
    separate act.

---

## Provenance

- **Corpus documents cited:** `../DEC_REGISTER.md`;
  `../05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md` (§2, §5, §7, §8, Domain D records);
  `../05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_DEPENDENCY_GRAPH.md` (§5, §13);
  `../10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md` (§3.1, §3.2, §3.18.1,
  §3.18.2, §3.18.5, §4.1, §4.2);
  `../06_EVIDENCE_AND_GAPS/EVIDENCE_AND_CONTENT_INSPECTION_REGISTER.md` (§3.9);
  `../08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` (§1);
  `../00_PROJECT_CONTROL/PROJECT_AI_PROTOCOL.md` (§5, §6, §25, §26, §28, §29, §30, §31).
- **Application code and schema cited:** `../../src/lib/mealPersonalization.ts`;
  `../../supabase/09-personal-plan-user-scoped.sql`.
- **External evidence:** every source is linked inline in §4 at the finding it supports. No finding in
  §4 is used anywhere in this document without its citation travelling with it.
- **Date of the register transcription in §2:** 2026-09-12.
