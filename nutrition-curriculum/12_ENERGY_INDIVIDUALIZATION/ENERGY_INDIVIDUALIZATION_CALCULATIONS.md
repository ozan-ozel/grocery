# Energy Individualization — Calculation Details

**Status: research-layer synthesis, not implementation-ready.**

This document creates no `DEC` ID, renames none, retires none, and amends no existing decision
content. It adopts no formula, no coefficient, and no threshold. Every number below already appears
either in `ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md` §4 (the "research spec") as a cited finding, or
in `../../src/lib/mealPersonalization.ts` as shipped code. This document adds no new one; it collects
them into one formula-first, citation-first reference instead of the research spec's evidence-domain
narrative.

**How this relates to the other two documents in this folder.**
[`ENERGY_INDIVIDUALIZATION_ARCHITECTURE.md`](ENERGY_INDIVIDUALIZATION_ARCHITECTURE.md) maps *where*
each calculation below sits in the personalization pipeline; this document is *what the calculation
actually is*, its inputs, its outputs, and its source. Read the architecture doc for stage boundaries
and `DEC` ownership; read this one for the math.

**Abbreviations.** REE, PAL, SEPV, EWMA, DLW and the rest are expanded in the appendix of
[`ENERGY_INDIVIDUALIZATION_MVP_ARCHITECTURE.html`](ENERGY_INDIVIDUALIZATION_MVP_ARCHITECTURE.html),
which is the single glossary for all four documents in this folder.

**Governing rules:** same as the research spec — `../00_PROJECT_CONTROL/PROJECT_AI_PROTOCOL.md` §25
(current-evidence policy: established vs. emerging, preserve uncertainty), §26 (human decision
preservation), §29 (traceability — every number below carries its source), §30 (ID stability). Per §25
point 7: nothing tagged **Candidate** below is upgraded to a deterministic project value here: doing
that requires a ratification record in `../00_PROJECT_CONTROL/DECISIONS/` per research spec §14, which
none of these have.

## Status legend

| Status | Meaning |
|---|---|
| **Shipped** | In production today in `mealPersonalization.ts`; owning `DEC` is `SHIPPED`/`COVERED` |
| **Candidate** | A cited finding from the literature; not adopted as a project value; blocked on a specific research-spec §16 open item |
| **Rejected** | Established in the literature as incorrect or superseded; kept here only because an existing drafted decision derives from it |

---

## 1. Purpose and how to read this table

Each entry states: what it computes, the formula or method as far as it is citable, **Inputs**,
**Outputs**, source citation, status, and (for Candidates) which open item blocks adoption. Units are
stated explicitly since the research spec and the shipped code don't always agree on rounding (§2
below flags the one place they differ).

---

## 2. Currently shipped calculations

Source: `../../src/lib/mealPersonalization.ts`, function `calculateTargets()` (line 116) unless noted.
All of these are `DEC-018`/`DEC-019`/`DEC-022`/`DEC-031`/`034`/`036`/`037` territory per the
architecture doc §2.2/§2.7/§2.8.

### 2.1 Resting energy expenditure — Mifflin-St Jeor

```
bmr = 9.99 × weightKg + 6.25 × heightCm − 4.92 × ageYears + (5 if male, −161 if female)
```

- **Inputs:** `weightKg` (kg), `heightCm` (cm), `ageYears` (years), `equationSex` (`male`/`female`)
- **Outputs:** `bmrKcal` (kcal/day)
- **Status:** Shipped — `DEC-018`
- **Source:** Mifflin-St Jeor equation; validated in
  [PMC10687135 — RMR equations in athletes, meta-analysis](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10687135/)
  and [PMC7299486 — RMR prediction validity in females](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7299486/)
- **Known deviation:** the code uses the *original* coefficients (`9.99 / 6.25 / 4.92`);
  `DECISION_LOGIC_SPECIFICATION.md` §3.1 quotes the *rounded* form (`10 / 6.25 / 5`). Research spec
  §1.2 records this as "a cosmetic difference" — same equation, not a discrepancy requiring
  reconciliation.
- **Known accuracy limit (not corrected in code):** reported within ±10% of measured REE for ~56–73%
  of general adults and 40.7–63.7% in athletic populations — i.e. for between roughly a quarter and
  three-fifths of users, this single-point figure is off by more than a tenth before any activity
  multiplier is applied. No correction exists in code or elsewhere for this; it is exactly the
  population/individual gap the rest of this document's Candidates section addresses.

### 2.2 Maintenance energy — PAL multiplier

```
maintenance = bmr × pal
```

| Activity | `pal` |
|---|---|
| sedentary | 1.4 |
| light | 1.55 |
| moderate | 1.7 |
| high | 1.9 |
| very_high | 2.1 |

- **Inputs:** `bmr` (from §2.1), `activity` (one of the five categories above)
- **Outputs:** `maintenanceKcal` (kcal/day)
- **Status:** Shipped — `DEC-019`
- **Source:** PAL-multiplier method generally; critique of the method's error sources in
  [PMC13007108 — PAL calculation revisited](https://pmc.ncbi.nlm.nih.gov/articles/PMC13007108/) and
  [PMC7004509 — PAL in female athletes](https://pmc.ncbi.nlm.nih.gov/articles/PMC7004509/)
- **Known deviation:** `DECISION_LOGIC_SPECIFICATION.md` §3.1 (`DEC-019`) specifies PAL as *bands*; the
  code implements a **single point** per category (table above), discarding the only place the
  method's own uncertainty was visible (research spec §1.2, §14 point 5).

### 2.3 Energy prescription — goal offset

```
target = maintenance − 400   (goal = loss)
target = maintenance + 250   (goal = gain)
target = maintenance         (goal = maintain)
safeTarget = max(1200, target)   // MIN_CALORIES = 1200
```

- **Inputs:** `maintenanceKcal` (from §2.2), `goal` (`loss`/`gain`/`maintain`)
- **Outputs:** `targetKcal` (kcal/day); a warning string if the pre-floor `target` is below 1200
- **Status:** Shipped — `DEC-022` `COVERED`
- **Source / caveat:** `DECISION_LOGIC_SPECIFICATION.md` §3.1 derives its own ±500 kcal/day figure
  (not what the code implements — see §4 below) from the ~3500 kcal-per-pound-of-body-fat
  approximation. The code's actual −400/+250 values are recorded in the register as "a numeric-tuning
  question for a human," independent of whichever derivation is used.

### 2.4 Protein target

```
proteinPerKg = 2.0   (goal = loss)
proteinPerKg = 1.6   (goal = gain, or activity = high/very_high)
proteinPerKg = 1.2   (otherwise)
proteinG = { min: weightKg × proteinPerKg, max: min + 20 }
```

- **Inputs:** `weightKg`, `goal`, `activity`
- **Outputs:** `proteinG.min` / `proteinG.max` (g/day)
- **Status:** Shipped — `DEC-031`

### 2.5 Fat target

```
fatMin = 0.20 × safeTarget / 9
fatMax = 0.35 × safeTarget / 9
```

- **Inputs:** `safeTarget` (from §2.3)
- **Outputs:** `fatG.min` / `fatG.max` (g/day)
- **Status:** Shipped — `DEC-034`

### 2.6 Carbohydrate target

```
carbsG = weightKg × { min, max }   // g/kg/day, by activity
```

| Activity | g/kg/day |
|---|---|
| sedentary, light | 3–5 |
| moderate | 5–7 |
| high | 6–10 |
| very_high | 10–12 |

- **Inputs:** `weightKg`, `activity`
- **Outputs:** `carbsG.min` / `carbsG.max` (g/day)
- **Status:** Shipped — `DEC-036`
- **Source:** Sport Nutrition (Jeukendrup & Gleeson, Ch. 4/6); code comment notes sedentary shares
  light's tier since the source has no sedentary-specific tier.

### 2.7 Fiber target

```
fiberG = { min: max(25, 14 × safeTarget/1000), max: max(30, 14 × safeTarget/1000) }
```

- **Inputs:** `safeTarget`
- **Outputs:** `fiberG.min` / `fiberG.max` (g/day)
- **Status:** Shipped — `DEC-037`

### 2.8 Water target

```
waterMl = weightKg × 33
```

- **Inputs:** `weightKg`
- **Outputs:** `waterMl` (mL/day)
- **Status:** Shipped — `DEC-046` `PROVISIONAL`. Code comment records this as the midpoint of a
  drafted 30–35 mL/kg/day DRI baseline range, with no exercise (`DEC-047`) or heat/altitude (`DEC-048`)
  adjustment — a second instance of a range collapsed to a point, same pattern as §2.2 (research spec
  §14 point 5).

---

## 3. Candidate calculations for individualization (not adopted)

One entry per research-spec §4 evidence domain with a citable formula or method. None of these is
implemented. Each states which research-spec §16 item keeps it from being adopted.

### 3.1 NASEM 2023 EER framework + standard error of predicted value

- **What it computes:** Estimated Energy Requirement (EER) from an expanded doubly-labeled-water
  database, four PAL categories, age-dependent coefficients — and, distinctly, a **standard error of
  predicted value (SEPV)** per equation: a published width for the population estimate.
- **Inputs:** age, sex, height, weight, life-stage, PAL category (same input set the app already
  collects)
- **Outputs:** EER point estimate (kcal/day); SEPV = **342 kcal/d for men ≥19 y, 241 kcal/d for women**
- **Status:** Candidate — established. Blocked on research-spec §16 item 1 (whether to adopt NASEM
  2023 in place of the 2005-era DRI/IOM PAL bands `DEC-019` currently cites)
- **Source:** [NASEM 2023, DRI for Energy](https://www.ncbi.nlm.nih.gov/books/NBK591034/);
  [Applications chapter](https://www.ncbi.nlm.nih.gov/books/NBK591020/)

### 3.2 Energy-balance back-calculation

- **What it computes:** intake or expenditure inferred from observed body-weight change through a
  body-composition dynamics model, rather than assumed from a formula.
- **Inputs:** a regular weight series; a logged-intake series, both over weeks
- **Outputs:** an inferred maintenance-requirement *change* (strongest evidence is for reproducing a
  change, not for pinning an absolute level — research spec §4.6, open question OQ1)
- **Status:** Candidate — established, strongest cited evidence of the five domains here. Blocked on
  research spec §16 item 3 (architecture choice — this is candidate architecture C) and inherits the
  self-report bias problem from §3.6 below since logged intake enters as a quantity
- **Source:** [Sanghvi et al., AJCN 2015 (PMC4515869)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4515869/) —
  the NIDDK body-weight dynamics model reproduced the two-year CALERIE intake change to within 40 kcal/d
  of the DLW-plus-DXA reference; [intake-balance validation (PMC5485536)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5485536/)

### 3.3 Dynamic body-weight model

- **What it computes:** the trajectory of body weight/composition under a given intake, accounting for
  expenditure adaptation as the body changes — the engine behind the NIH Body Weight Planner.
- **Inputs:** baseline anthropometrics, an intake trajectory
- **Outputs:** a time-varying expenditure/weight trajectory, not a single point
- **Status:** Candidate — established. Same blocker as §3.2 (research spec §16 item 3, candidate
  architecture C/E)
- **Source:** [Hall et al., Lancet 2011](https://pubmed.ncbi.nlm.nih.gov/21872751/);
  [NIDDK Body Weight Planner](https://niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner)

### 3.4 Trend extraction — exponentially-weighted moving average / rolling average

- **What it computes:** the underlying trend in a noisy daily weight series.
- **Inputs:** a daily (or near-daily) weight series
- **Outputs:** a smoothed weight trend, distinguishable from day-to-day noise (§3.7 below)
- **Status:** Candidate — established method, emerging *product* practice. No smoothing constant or
  window is specified here (research spec §16 item 6); commercial adaptive-TDEE products (e.g.
  MacroFactor) run weekly re-estimation typically described as needing on the order of 2–4 weeks of
  data, reported as precedent, not evidence
- **Source:** [Exponential smoothing](https://en.wikipedia.org/wiki/Exponential_smoothing);
  [adaptive-TDEE product description](https://calorie-trackers.com/reviews/macrofactor/)

### 3.5 Recursive state estimator (Kalman / EKF family)

- **What it computes:** a hidden state (true maintenance energy requirement) recursively updated from
  noisy observations, with explicit measurement-noise and process-noise models — the weighting between
  prior and observation *emerges from* the noise model instead of being hand-set.
- **Inputs:** same as §3.2, plus explicit noise-model parameters
- **Outputs:** posterior state estimate with native uncertainty, updated per observation
- **Status:** Candidate — **emerging** in this application area specifically; no application-specific
  validation evidence exists in the sources reviewed. Blocked on research spec §16 item 3 (candidate
  architecture D) and on §25 point 7 (no emerging→deterministic conversion without justification)
- **Source:** [PM-EKF (arXiv)](https://arxiv.org/abs/2604.26803);
  [semi-physical intake estimation (PMC5001697)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5001697/)

### 3.6 Self-reported intake bias — Goldberg-family screening

- **What it computes:** whether reported intake is plausible given predicted BMR and a screened PAL,
  as a way of detecting (not correcting) misreporting.
- **Inputs:** logged intake, predicted BMR (§2.1), an activity/PAL estimate
- **Outputs:** a plausibility flag on the reported-intake series, not a corrected intake value
- **Status:** Candidate — established as biased. Under-reporting typically 5–25%, with >50%
  misreporting observed in national dietary datasets; the bias is reported as individual and
  persistent, not noise that averages out over a window. Blocked on research spec open question OQ2
  (no stance yet on whether to correct for it, be robust to it, or disclose the conditioning)
- **Source:** [Nature Food 2024, DLW-derived misreporting detection](https://www.nature.com/articles/s43016-024-01089-5);
  [BMC Med Res Methodol 2025](https://link.springer.com/article/10.1186/s12874-025-02568-4)

### 3.7 Day-to-day body-mass noise floor

- **What it computes:** the amount of day-to-day scale-weight variation attributable to
  sodium/water/glycogen/gut content rather than tissue change — the floor any trend call (§3.4) must
  clear before it can be treated as real.
- **Inputs:** none — this is a reported population statistic, not a per-user calculation
- **Outputs:** SD ≈ **0.53% at 1 day, 0.69% at 7 days**; consecutive-day swings of ±0.5–1 kg reported
  as common
- **Status:** Candidate — established. Constrains research spec §16 item 6 (minimum observation
  window) but does not set it
- **Source:** [Day-to-day variability in euvolemic body mass (PubMed 37955103)](https://pubmed.ncbi.nlm.nih.gov/37955103/);
  [two-week weight-change composition](https://physoc.onlinelibrary.wiley.com/doi/full/10.14814/phy2.13336)

### 3.8 Adaptive thermogenesis magnitude

- **What it computes:** the reduction in expenditure beyond what body-composition change alone
  predicts, following weight loss — not a formula to apply, but the physiological argument for
  *periodic re-estimation* rather than a fixed correction term (research spec §4.9 explicitly:
  a correction term would be a new invented coefficient, barred by §18).
- **Inputs:** none directly usable — magnitude is individually variable
- **Outputs:** commonly reported ≈90–180 kcal/d reduction after moderate loss, range roughly −65 to
  −230 kcal/d across studies; ≈half reported to dissipate after weight stabilization
- **Status:** Candidate — established, but explicitly not a formula to adopt; it argues for the
  re-estimation architecture (§2.10 in the architecture doc), which is already approved in shape
- **Source:** [AJCN review of adaptive thermogenesis](https://ajcn.nutrition.org/article/S0002-9165(22)00885-1/fulltext);
  [magnitude and methods (PubMed 34839398)](https://pubmed.ncbi.nlm.nih.gov/34839398/)

### 3.9 Low energy availability threshold

- **What it computes:** energy intake less exercise energy expenditure, normalized to fat-free mass,
  as a candidate screen for inadequate energy availability.
- **Inputs:** intake, exercise energy expenditure, fat-free mass
- **Outputs:** a candidate threshold of **30 kcal/kg FFM**, widely quoted but derived from short-term
  studies in sedentary women and widely critiqued as not universally applicable
- **Status:** Candidate — established consensus (IOC 2023 REDs), contested threshold. Blocked on
  research spec §16 item 8 (whether any energy-availability floor gates deficit prescriptions at all)
- **Source:** [IOC 2023 REDs consensus](https://www.semanticscholar.org/paper/31232e7d9d1bcf590e29b10e8d80337a8a6b6616);
  [LEA threshold critique (PMC11194298)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11194298/)

### 3.10 Protein during energy restriction

- **What it computes:** fat-free-mass preservation under a deficit as a function of protein intake.
- **Inputs:** body weight, training status, energy-balance state (maintenance vs. deficit)
- **Outputs:** 1.2–1.6 g/kg/d reported to preserve lean mass relative to 0.8 g/kg/d during restriction;
  a 2025 meta-regression supports ≥1.6 g/kg/d for resistance-trained individuals in deficit
- **Status:** Candidate for the *energy-conditioning* argument only — the app's existing protein tiers
  (§2.4 above) are already `DEC-031` `SHIPPED` and unchanged by this. Included here because it is the
  cleanest evidence that macros are conditioned on energy state, not independent of it (architecture
  doc §6.1)
- **Source:** [Meta-regression, Strength & Conditioning Journal 2025](https://journals.lww.com/nsca-scj/fulltext/9900/effect_of_dietary_protein_on_fat_free_mass_in.179.aspx);
  [Clin Nutr ESPEN 2024](https://www.clinicalnutritionespen.com/article/S2405-4577(24)00176-1/abstract)

---

## 4. Rejected/superseded calculations

### 4.1 Static 3500 kcal-per-pound rule

```
predicted weight change (lb) = cumulative energy deficit (kcal) / 3500
```

- **What it claims to compute:** the energy equivalent of a pound of body fat, used to convert a
  deficit into a predicted rate of weight loss.
- **Why it is rejected:** it ignores expenditure adaptation (§3.8) and systematically over-predicts
  loss. Thomas et al. (IJO 2013) reported **observed loss of 20.1 ± 11.3 lb against 27.6 ± 16.0 lb
  predicted** by this rule, with an accompanying same-journal response from Hall.
- **Why it is here anyway:** `DECISION_LOGIC_SPECIFICATION.md` §3.1 derives `DEC-022`'s ±500 kcal/day
  figure from this rule. This is recorded in research spec §15.1 as a **contradiction finding, not
  applied** — what it would change is the *derivation* of the kcal↔rate conversion, not `DEC-027`'s
  1–2 lb/week rate target (externally sourced, independent of this rule) and not the app's actual
  −400/+250 implementation (§2.3 above), which was never derived from ±500 in the first place. Status:
  unresolved, research spec §16 item 2.
- **Source:** [Thomas et al., IJO 2013](https://www.nature.com/articles/ijo2013112);
  [Hall response, IJO 2013](https://www.nature.com/articles/ijo2013113)

---

## 5. Uncertainty and interval reference

Consolidated numeric findings relevant to §10 of the research spec (uncertainty representation) and
architecture doc §5 (output contract). None of these is adopted as the project's interval — adoption
is research spec §16 items 1 and 3.

| Quantity | Value | Source |
|---|---|---|
| NASEM 2023 EER standard error of predicted value (SEPV), men ≥19y | 342 kcal/d | §3.1 above / [NASEM 2023](https://www.ncbi.nlm.nih.gov/books/NBK591034/) |
| NASEM 2023 EER SEPV, women | 241 kcal/d | same |
| Mifflin-St Jeor hit-rate within ±10% of measured REE, general adults | 56–73% | [PMC10687135](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10687135/) |
| Mifflin-St Jeor hit-rate within ±10% of measured REE, athletic populations | 40.7–63.7% | [PMC7299486](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7299486/) |
| Consumer wearable EE mean bias | ≈−3% | [PMC11560992](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11560992/) |
| Consumer wearable EE individual error range | ≈−21% to +15% (MAPE >30% reported for all brands in some reviews) | same |
| Self-reported intake under-reporting | typically 5–25%, >50% misreporting in national datasets | [Nature Food 2024](https://www.nature.com/articles/s43016-024-01089-5) |
| Day-to-day body-mass SD | ≈0.53% at 1 day, ≈0.69% at 7 days | [PubMed 37955103](https://pubmed.ncbi.nlm.nih.gov/37955103/) |
| Adaptive thermogenesis magnitude | ≈90–180 kcal/d typical, range ≈−65 to −230 kcal/d | [AJCN review](https://ajcn.nutrition.org/article/S0002-9165(22)00885-1/fulltext) |
| Energy-balance back-calculation accuracy (Sanghvi et al.) | within 40 kcal/d of DLW+DXA reference over 2 years | [PMC4515869](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4515869/) |
| Static 3500 kcal/lb rule over-prediction | 27.6 ± 16.0 lb predicted vs. 20.1 ± 11.3 lb observed | [Thomas et al. IJO 2013](https://www.nature.com/articles/ijo2013112) |

---

## 6. Full reference list

Grouped by evidence domain, matching research spec §4's numbering.

- **§4.1 NASEM 2023 DRI framework:** [NASEM 2023, DRI for Energy](https://www.ncbi.nlm.nih.gov/books/NBK591034/); [Applications chapter](https://www.ncbi.nlm.nih.gov/books/NBK591020/)
- **§4.2 Mifflin-St Jeor:** [PMC10687135](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10687135/); [PMC7299486](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7299486/)
- **§4.3 Activity multipliers/PAL:** [PMC13007108](https://pmc.ncbi.nlm.nih.gov/articles/PMC13007108/); [PMC7004509](https://pmc.ncbi.nlm.nih.gov/articles/PMC7004509/)
- **§4.4 Consumer wearables:** [PMC11560992](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11560992/)
- **§4.5 Self-reported intake:** [Nature Food 2024](https://www.nature.com/articles/s43016-024-01089-5); [BMC Med Res Methodol 2025](https://link.springer.com/article/10.1186/s12874-025-02568-4)
- **§4.6 Energy-balance back-calculation:** [PMC4515869](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4515869/); [PMC5485536](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5485536/)
- **§4.7 Dynamic body-weight models:** [Hall et al., Lancet 2011](https://pubmed.ncbi.nlm.nih.gov/21872751/); [NIDDK Body Weight Planner](https://niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner)
- **§4.8 Static 3500 kcal/lb rule:** [Thomas et al., IJO 2013](https://www.nature.com/articles/ijo2013112); [Hall response](https://www.nature.com/articles/ijo2013113)
- **§4.9 Adaptive thermogenesis:** [AJCN review](https://ajcn.nutrition.org/article/S0002-9165(22)00885-1/fulltext); [PubMed 34839398](https://pubmed.ncbi.nlm.nih.gov/34839398/)
- **§4.10 Day-to-day body-mass variability:** [PubMed 37955103](https://pubmed.ncbi.nlm.nih.gov/37955103/); [physoc phy2.13336](https://physoc.onlinelibrary.wiley.com/doi/full/10.14814/phy2.13336)
- **§4.11 Trend extraction / adaptive-TDEE products:** [Exponential smoothing](https://en.wikipedia.org/wiki/Exponential_smoothing); [MacroFactor description](https://calorie-trackers.com/reviews/macrofactor/)
- **§4.12 Recursive state estimators:** [PM-EKF (arXiv)](https://arxiv.org/abs/2604.26803); [PMC5001697](https://pmc.ncbi.nlm.nih.gov/articles/PMC5001697/)
- **§4.13 Low energy availability / REDs:** [IOC 2023 REDs consensus](https://www.semanticscholar.org/paper/31232e7d9d1bcf590e29b10e8d80337a8a6b6616); [PMC11194298](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11194298/)
- **§4.14 Protein during energy restriction:** [Strength & Conditioning Journal 2025](https://journals.lww.com/nsca-scj/fulltext/9900/effect_of_dietary_protein_on_fat_free_mass_in.179.aspx); [Clin Nutr ESPEN 2024](https://www.clinicalnutritionespen.com/article/S2405-4577(24)00176-1/abstract)

## References back to this folder

- [`ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md`](ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md) §4 — the
  narrative evidence discussion this document reorganizes.
- [`ENERGY_INDIVIDUALIZATION_ARCHITECTURE.md`](ENERGY_INDIVIDUALIZATION_ARCHITECTURE.md) — where each
  calculation above sits in the personalization pipeline.
- `../../src/lib/mealPersonalization.ts` — the shipped implementation cited throughout §2.
