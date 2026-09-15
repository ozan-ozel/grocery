# Energy Individualization — Architecture

**Status: research-layer synthesis, not implementation-ready.**

This document creates no `DEC` ID, renames none, retires none, and amends no existing decision
content. It selects no formula, no coefficient, no threshold, and no macro percentage. It does not
open a row in `../IMPLEMENTATION_HANDOFF.md`.

**What this document is.** `ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md` (the "research spec") is a
narrative: problem, evidence, candidate architectures, open questions, in reading order. That order is
right for a first read and wrong for a reference. This document takes the same already-ratified
content — spec §2, §5, §6, §7, §11, §12, §13, plus `../DEC_REGISTER.md` and
`../05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md` — and re-indexes it by **pipeline stage**:
for each stage, what goes in, what comes out, which `DEC` owns it, and what state it's in today. It
resolves nothing the research spec left open. Where a number or formula is needed, this document
points at [`ENERGY_INDIVIDUALIZATION_CALCULATIONS.md`](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md)
(the "calculations doc") rather than restating it, so there is exactly one place a figure can drift
from its citation.

**Governing rules:** same as the research spec — `../00_PROJECT_CONTROL/PROJECT_AI_PROTOCOL.md` §25
(current-evidence policy), §26 (human decision preservation), §28 (no premature implementation), §29
(traceability), §30 (ID stability), §31 (document discipline). Under §31: this is a re-index of
existing content, not a new decision layer. Readiness stays owned by `../DEC_REGISTER.md`, decision
content by `APP_DECISION_INVENTORY.md`, drafted formulas by
`../10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md`, and the underlying
evidence and open questions by `ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md` itself. Every fact below
that isn't attributed to code carries a `spec §n` citation back to that document.

---

## 1. Pipeline overview

The loop below is `APP_DECISION_INVENTORY.md` §5's loop and `PROJECT_AI_PROTOCOL.md` §6's loop,
reproduced from research spec §11. It is not a new loop — this document only adds the stage-by-stage
detail in §2.

```
BASELINE  (DEC-005/006/009/017)
   │  gate: DEC-017
   ▼
INITIAL ESTIMATE  (DEC-018 → DEC-019)
   │  gate: DEC-020
   ▼
OBSERVED DATA  (DEC-076, DEC-077)
   │  gate: DEC-078/079
   ▼
DATA-QUALITY ASSESSMENT  (DEC-081 quantity, DEC-082 quality)
   │  gate: DEC-082
   ▼
INTERPRETATION  (DEC-026 trend, DEC-083 consistency, DEC-110 mismatch, DEC-091 subjective)
   │  gate: DEC-021 — the weighting decision itself
   ▼
INDIVIDUALIZED MAINTENANCE  (DEC-021)
   │  gate: DEC-022, safety-gated by DEC-014
   ▼
PRESCRIPTION  (DEC-022) ──→ TARGETS (DEC-027 rate; DEC-031/034/036/037 macros)
   │  boundary: DEC-060 — translation layer starts here (§6 below)
   ▼
MONITORING  (DEC-076–080)
   │  gate: DEC-087 — explicit wait-vs-adjust
   ▼
ADJUSTMENT  (DEC-084 → DEC-085 → DEC-086; DEC-089 notify; DEC-090 circuit breaker)
   │
   └──→ back to OBSERVED DATA, or out to escalation via DEC-090 → Domain C
```

Four structural properties, restated from spec §11 because they constrain every stage below: the loop
**has an exit** (`DEC-090`'s dual-trigger circuit breaker — repeated unsuccessful cycles, or excessive
cumulative deviation); `DEC-084` reuses `DEC-028`'s reassessment trigger rather than adding a second
one; **prescription always sits after** the individualized estimate, never before; and the
wait-vs-adjust tension has its own explicit node (`DEC-087`), so "not enough data to act yet" is a
decision the system can state and explain, not an absence of one.

---

## 2. Stage-by-stage architecture

Each stage lists its inputs, its outputs, the boundary principle its *downstream* edge protects (i.e.
what merging it with the next stage would violate — `APP_DECISION_INVENTORY.md` §2), and where its math
lives in the calculations doc.

### 2.1 Baseline

| | |
|---|---|
| **Inputs** | Age, sex, height, weight, activity category, goal, optional waist circumference — all user-supplied profile fields |
| **Outputs** | A validated `PersonalProfile`; a pass/fail from `validateProfile()`; a coarse implausibility flag |
| **Owning DECs / status** | `DEC-005`, `006`, `017` `COVERED`; `DEC-009` `PROVISIONAL`; `DEC-010`, `011` `BLOCKED` |
| **Boundary protected** | #4 Measurement ≠ Interpretation — holding a profile field is not judging it sufficient or plausible (spec §2) |
| **Today** | `validateProfile()` and the BMI implausibility check in `src/lib/mealPersonalization.ts` (see §8 below) |
| **Math** | none — pure bounds-checking, no calculation doc entry |

### 2.2 Initial estimate

| | |
|---|---|
| **Inputs** | The validated Baseline profile |
| **Outputs** | Initial TEE estimate (population, `DEC-019`) |
| **Owning DECs / status** | `DEC-018` (method class), `DEC-019` (activity incorporation) — `SHIPPED` ×2 |
| **Boundary protected** | #2 Initial Estimate ≠ Individualized Estimate (spec §2) |
| **Today** | `bmr` and `maintenance` in `calculateTargets()` |
| **Math** | [Calculations §2 — Mifflin-St Jeor REE, PAL multiplier](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md#2-currently-shipped-calculations) |

### 2.3 Observed data

| | |
|---|---|
| **Inputs** | Per-item logged consumption; (once built) a weight series and structured activity sessions — spec §6.3 |
| **Outputs** | A raw longitudinal record: what was logged, on which days, at what completeness |
| **Owning DECs / status** | `DEC-076` `COVERED`; `DEC-077`–`080` `BLOCKED` ×4 |
| **Boundary protected** | #4 — recording data is not yet judging its adequacy (spec §2) |
| **Today** | The meal-entry/consumption path only; no weight-history table exists in `supabase/` (spec §1.2) |
| **Math** | none directly — feeds §2.4's sufficiency/quality gates |

### 2.4 Data-quality assessment

| | |
|---|---|
| **Inputs** | The Observed-data record |
| **Outputs** | Data-sufficiency verdict (quantity); data-quality verdict (recency/consistency/logging convention) |
| **Owning DECs / status** | `DEC-020`, `DEC-081` (quantity), `DEC-082` (quality) — `BLOCKED` ×3 |
| **Boundary protected** | #4 — quantity sufficiency is not quality sufficiency; the split is itself an application of #4 (`APP_DECISION_INVENTORY.md` §5) |
| **Today** | Does not exist |
| **Math** | [Calculations §5 — the data-quality findings that motivate this gate](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md#5-uncertainty-and-interval-reference) |

### 2.5 Interpretation

| | |
|---|---|
| **Inputs** | Data that has passed the quality gate |
| **Outputs** | A trend call (real change vs. noise); a consistency call against the current prescription; a mismatch flag |
| **Owning DECs / status** | `DEC-026` trend, `DEC-083` consistency, `DEC-110` mismatch, `DEC-091` subjective — all within the `BLOCKED` set named in spec §2's weight/trend-interpretation and adaptation rows |
| **Boundary protected** | #4, then #5 Interpretation ≠ Adjustment at the `026 → 028` edge specifically (spec §2) |
| **Today** | Does not exist |
| **Math** | [Calculations §3 — trend extraction (EWMA/rolling average), weight-noise floor](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md#3-candidate-calculations-for-individualization-not-adopted) |

### 2.6 Individualized maintenance

| | |
|---|---|
| **Inputs** | The Initial estimate (as prior) plus Interpretation's trend/consistency output |
| **Outputs** | Individualized maintenance estimate, ideally as `{ value, interval, source, evidence_basis, as_of }` (§7 below) |
| **Owning DECs / status** | `DEC-021`, `DEC-110` — `BLOCKED` ×2 |
| **Boundary protected** | #3 Population Standard ≠ Individual Response (spec §2) |
| **Today** | Does not exist. `DEC-021`/`DEC-110`'s reconciliation hierarchy is ratified (population model → adequate observation → divergence safeguard) but the weighting function between them is explicitly not specified anywhere (spec §5 option B, §10) |
| **Math** | [Calculations §3 — NASEM EER/SEPV, energy-balance back-calculation, dynamic body-weight model, recursive estimator](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md#3-candidate-calculations-for-individualization-not-adopted) |

### 2.7 Prescription

| | |
|---|---|
| **Inputs** | Individualized maintenance estimate; goal |
| **Outputs** | Energy prescription (a deficit/surplus/maintenance target) |
| **Owning DECs / status** | `DEC-001`, `003`, `022` `COVERED`; `DEC-027` `BLOCKED` |
| **Boundary protected** | #1 Estimate ≠ Prescription — the load-bearing boundary of the whole loop (spec §11) |
| **Today** | `target`/`safeTarget` in `calculateTargets()` — a fixed offset applied to the *population* maintenance estimate, since no individualized estimate exists yet |
| **Math** | [Calculations §2 — goal offset](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md#2-currently-shipped-calculations); [Calculations §4 — why the 3500 kcal/lb derivation behind the offset is contested](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md#4-rejectedsuperseded-calculations) |

### 2.8 Targets

| | |
|---|---|
| **Inputs** | Energy prescription |
| **Outputs** | Target rate of change; macro targets (protein/fat/carb/fiber/water) |
| **Owning DECs / status** | `DEC-027` rate `BLOCKED`; `DEC-031`, `034`, `036`, `037` `SHIPPED`; `DEC-032` `COVERED`; `DEC-033` `PROVISIONAL`; `DEC-035`, `038`, `040`, `085` `BLOCKED`; `DEC-039` `DEFERRED` |
| **Boundary protected** | #6 Nutrient Requirement ≠ Food Recommendation (spec §2) |
| **Today** | `proteinG`/`fatG`/`carbsG`/`fiberG`/`waterMl` in `calculateTargets()`; no target-rate-of-change output exists |
| **Math** | [Calculations §2 — macro formulas](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md#2-currently-shipped-calculations) |

### 2.9 Monitoring

| | |
|---|---|
| **Inputs** | Ongoing Observed-data stream against the current Prescription |
| **Outputs** | Adherence/logging-quality signal; consistency-with-prescription signal; a wait-vs-adjust decision (`DEC-087`) |
| **Owning DECs / status** | `DEC-076` `COVERED`; `DEC-077`–`080` `BLOCKED` ×4 |
| **Boundary protected** | #4 (spec §2) |
| **Today** | Does not exist beyond raw consumption logging |
| **Math** | none new — reuses §2.4's data-quality findings |

### 2.10 Adjustment

| | |
|---|---|
| **Inputs** | Monitoring's wait-vs-adjust decision when it says "adjust" |
| **Outputs** | An energy-adjustment proposal with rationale; a downstream macro recalculation (never independent — §6 below); a user notification; a circuit-breaker/escalation signal |
| **Owning DECs / status** | `DEC-023`, `083`, `084`, `086`–`091` — `BLOCKED` ×9 |
| **Boundary protected** | #5 Interpretation ≠ Adjustment (spec §2) |
| **Today** | Does not exist |
| **Math** | none new — the adjustment magnitude is deliberately unspecified (spec §18 items 2, 3, 4); it re-enters §2.3 (Observed data) or exits via `DEC-090`'s circuit breaker |

---

## 3. Candidate model architectures (A–E)

Spec §5 describes five candidates for how §2.5–§2.6 (Interpretation → Individualized maintenance) could
actually be built. **No selection is made here** — the choice is spec §16 item 3, still open.

| | A static | B weighted | C back-calc | D estimator | E hybrid |
|---|---|---|---|---|---|
| Uses individual response | no | yes | yes | yes | yes |
| Works on day 1 | yes | prior only | no | prior only | yes (prior only) |
| Needs weight-history subsystem | no | yes | yes | yes | yes |
| Needs monitoring/adherence subsystem | no | yes | yes | yes | yes |
| Needs a human-supplied parameter before buildable | no | **yes** (weighting, unless hard-switchover) | yes (bias stance) | **yes** (noise model) | yes (prior width, bias stance) |
| Handles adaptive thermogenesis | no | via re-estimation | via re-estimation and model | yes, structurally | yes, structurally |
| Native uncertainty output | no | no | no | yes | yes |
| Explainable to a user | high | high | medium | low | medium |
| Published validation for this use | n/a | n/a | strong | thin | partial |

- **A — Static formula** (`profile → REE → × PAL → ± offset → target`): today's shape
  (`../../src/lib/mealPersonalization.ts`). `DEC-018`/`DEC-019` `SHIPPED`, `DEC-022` `COVERED`. Every
  other option still needs A for cold start, so it is a permanent first phase, not a rejected option.
- **B — Formula + monotone observation weighting**: a *family*, not one design; its cheapest member is
  a hard switchover (prior until the data-sufficiency gate passes, then observation) which needs no
  blending function. The general weighting function is explicitly barred from invention (spec §5, §18
  item 4).
- **C — Energy-balance back-calculation**: logged intake + weight trend through a body-weight dynamics
  model → inferred maintenance. Strongest cited evidence (Calculations §3). Inherits the self-report
  bias problem directly since logged intake enters as a quantity.
- **D — Recursive state estimator (Kalman/EKF)**: the only candidate where the prior/observation
  weighting *falls out of* an explicit noise model instead of being hand-set. No application-specific
  validation found in the sources reviewed (spec §4.12).
- **E — Hybrid**: population prior (formula + a published width) × observation likelihood = explicit
  posterior `{ value, interval }`. Not a rival to B/C so much as their formal unification; D is one
  mechanized way to compute E recursively. Needs spec §16 item 1 (NASEM adoption) settled first, since
  without a sourced prior width there is no prior.

Full option-by-option detail, including each option's cost and honest-strength notes: spec §5.

---

## 4. Subsystem map

Four subsystems spec §6.3 names as currently missing. Naming them here is not designing them.

| Subsystem | What it would supply into the pipeline | Unblocks |
|---|---|---|
| **Weight / body-composition trend** | A weight *series*, not a scalar — feeds §2.3 Observed data, and is a precondition for §2.5 Interpretation and §2.6 Individualized maintenance in every architecture except A | `DEC-025`–`030`, transitively `DEC-020`/`021`. Named in the spec as "the single highest-leverage missing piece" |
| **Training / activity capture** | Structured session data (type, volume, intensity, phase) — the only route by which `DEC-019`'s activity term could become something other than a dropdown; feeds §2.3 | `DEC-092`, `093`, `095` |
| **Monitoring / adherence** | Logging-quality rating, adherence tracking, missing-log handling, check-in escalation — feeds §2.4 and §2.9 directly | `DEC-077`–`080`; `DEC-078` feeds `DEC-020` directly on the dependency spine |
| **Micronutrient data** | Not on the energy chain; listed because the register names it as one of the four blocking subsystems and §6 (below) touches it at the edges | out of scope for the energy chain |

**Explicitly undecided, in no bucket above:** device- or step-derived activity data. Its error profile
(Calculations §3) means "can we get it" and "should we use it" have different answers — spec §16 item 7.

Weight/body-composition trend and Monitoring/adherence are **peers**, not sequential — `DEC-078` (from
Monitoring) feeds `DEC-020` (gated by weight/body-comp data) directly on the dependency spine, so
neither is a prerequisite of the other (spec §17).

---

## 5. Output contract

Spec §7's conceptual shape — not a schema, not a type definition (§18 item 8 bars that):

```
{ value, interval, source, evidence_basis, as_of }
```

| Field | Meaning |
|---|---|
| `value` | The point figure |
| `interval` | The honest width around it (Calculations §5) |
| `source` | Which stage produced it: `population_formula`, `observation`, `blend`, `user_override` |
| `evidence_basis` | What it rests on: `profile_only`, `n_weeks_observed`, `insufficient_data` |
| `as_of` | When it was computed, so staleness is visible rather than inferred |

Today's `PersonalTargets` (`src/lib/mealPersonalization.ts`) is a flat record of bare numbers plus two
untyped `string[]` arrays (`warnings`, `assumptions`) — every stage boundary in §2 above is
unenforceable at runtime because the values crossing it carry no `source`/`evidence_basis` tag.

| Output | Owning DEC | Today |
|---|---|---|
| Initial TEE estimate | `DEC-019` | `maintenanceKcal`, bare number |
| Individualized maintenance estimate | `DEC-021` | Does not exist |
| Energy prescription | `DEC-022` | `targetKcal`, bare number |
| Target rate of change | `DEC-027` | Does not exist |
| Observed trend call | `DEC-026` | Does not exist |
| Data-sufficiency verdict | `DEC-020`, `081`, `082` | Does not exist |
| Data-quality verdict | `DEC-077`, `078`, `082` | Does not exist |
| Confidence/uncertainty representation | `DEC-024`, `112` | Two `string[]` arrays |
| Macro targets | `DEC-031`, `034`, `036`, `037` | Bare numbers/ranges |
| Adjustment proposal + rationale | `DEC-084`, `089` | Does not exist |
| Circuit-breaker/escalation signal | `DEC-090` | Does not exist |

---

## 6. Cross-layer boundaries

### 6.1 Energy → macro (one-directional)

Ratified at Gate 5 §3.18.2 (`DEC-039`/`DEC-085`), restated here as a constraint this document inherits,
not one it concludes:

```
observation → energy adjustment (DEC-084) → macro recalculation (DEC-085 → DEC-031/034/036)
```

Macro allocation changes only as a **downstream consequence** of an energy-prescription change.
Independent macro auto-adjustment on satiety, adherence, training load, or subjective preference alone
is barred; such signals may act only by first causing an authorized energy reassessment. `DEC-039` is
`DEFERRED` with the register note: "Explicitly ratified: no independent macro-adjustment loop (Gate
5)." If the energy estimate starts moving on its own schedule (any of §3's architectures B–E), the
macro layer inherits that movement automatically — there is no separate decision to make there, and
adding one would recreate the second controller Gate 5 barred (spec §12).

### 6.2 Macro → meal-planning (one-directional)

```
        SCIENTIFIC / DECISION LAYER
        energy estimate → prescription → macro targets   { value, interval, source, ... }
                                  │
        ══════════════════════════╪══════════════════════ the boundary
                                  ▼   (targets + uncertainty pass DOWN only)
        TRANSLATION LAYER
        DEC-056 per-occasion distribution → DEC-060 target→candidate foods
          → DEC-061 filters → DEC-066 constructed meals → DEC-070 deviation handling
```

Mapped onto Phase 9's five-layer model
(`../08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §1):

| Phase 9 layer | This chain's occupant |
|---|---|
| 1. Scientific knowledge | The evidence in the calculations doc |
| 2. Decision logic | `DEC-017`–`024`, `026`–`029`, `031`–`037`, `081`–`090` |
| 3. Translation logic | `DEC-055`, `056`, `060`, `061`, `066` |
| 4. Product behavior | `DEC-070`, `DEC-089` |
| 5. UI/UX | Not in scope, not authorized (`PROJECT_AI_PROTOCOL.md` §28) |

**What must never happen:** a user eating less than planned, the planner failing to hit a target, or a
user deleting a planned meal (`DEC-070`, `SHIPPED`) are layer-3/4 events. None may be read directly as
evidence about the person's energy requirement. The only legitimate path from a translation-layer
observation back to the energy figure runs through §2.9–§2.10 (Monitoring → Adjustment), where it gets
quality-gated first. `DEC-086` is the correctly-directed counterpart — meal structure changes *as a
consequence of* an upstream adjustment, downward — and is `BLOCKED` along with the rest of the
adjustment loop (spec §13).

---

## 7. Current implementation snapshot

`calculateTargets()` (`../../src/lib/mealPersonalization.ts:116`) reaches exactly four of the ten
pipeline stages above:

```
BASELINE → INITIAL ESTIMATE → PRESCRIPTION → TARGETS
```

It never reaches Observed data, Data-quality assessment, Interpretation, Individualized maintenance,
Monitoring, or Adjustment — those six stages, and every `DEC` that owns them, are `BLOCKED` because the
subsystems in §4 above don't exist. This is a faithful implementation of a `SHIPPED`/`COVERED` MVP
whose individualizing half was never built, not a defect in what was built (spec §1.2).

`personal_plan` (`../../supabase/09-personal-plan-user-scoped.sql`) stores exactly one `weight_kg` per
user — no weight-history table exists anywhere in `supabase/`, which is why §2.3 (Observed data) has no
weight-series input to read today.

---

## 8. Open governance items

None of these is resolved by this document, by the calculations doc, or by an implementer's judgment
(`PROJECT_AI_PROTOCOL.md` §26). Restated from spec §16 for reference alongside the architecture they
each bear on:

| # | Decision | Bears on |
|---|---|---|
| 1 | Adopt NASEM 2023 EER framework in place of 2005-era DRI/IOM PAL bands? | §2.2 Initial estimate; §5 output-contract interval width |
| 2 | Re-derive `DEC-022`'s kcal↔rate conversion from a dynamic model instead of the 3500 kcal/lb rule? | §2.7 Prescription |
| 3 | Which candidate architecture (A–E) does the project target? | §3, and therefore §2.5–§2.6 |
| 4 | The `DEC-021`/`DEC-110` deviation-cap value | §2.6 Individualized maintenance |
| 5 | The `DEC-090` circuit-breaker cycle count and cumulative-deviation threshold | §2.10 Adjustment |
| 6 | Minimum observation window / weigh-in cadence before individualization is permitted | §2.4 Data-quality assessment; §4 Weight/body-comp subsystem |
| 7 | Whether device-/step-derived activity data is admitted as an input at all | §2.3 Observed data; §4 Training/activity subsystem |
| 8 | Whether an energy-availability safety floor gates deficit prescriptions for disclosed trainees | §2.7 Prescription |

---

## References

- [`ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md`](ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md) — the
  narrative this document re-indexes; §2, §5, §6, §7, §11, §12, §13 specifically.
- [`ENERGY_INDIVIDUALIZATION_CALCULATIONS.md`](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md) — every
  formula and numeric finding referenced above, with sources.
- `../DEC_REGISTER.md` — readiness words for every `DEC` ID cited above.
- `../05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md` — decision content and the nine
  Decision Model Principles cited by number throughout.
- `../10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md` — drafted formulas and
  thresholds for decisions that already have them.
- `../00_PROJECT_CONTROL/PROJECT_AI_PROTOCOL.md` — governing rules §5, §6, §25, §26, §28, §29, §30, §31.
- `../../src/lib/mealPersonalization.ts`, `../../supabase/09-personal-plan-user-scoped.sql` —
  application code and schema cited in §2 and §7.
