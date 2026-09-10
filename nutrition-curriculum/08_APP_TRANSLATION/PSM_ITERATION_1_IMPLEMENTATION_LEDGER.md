# PSM Iteration 1 — Implementation Ledger

**Status:** MVP-1 implemented, automated validation clean, browser QA pending.
**Branch:** `feature/psm-iteration-1-dec-triage`.
**This is not a replacement for `APP_DECISION_INVENTORY.md` or any ratification record.** It records
only the *implementation-triage* view of the 112 decisions for this PSM pass, plus the provisional
choices actually shipped. No canonical `DEC` record is amended, closed, or reopened by this document.

---

## 1. What PSM Is (for this project)

**Progressive Sanding Model:** build a broad, coherent, working MVP surface first, then progressively
sand it down through cumulative real-system browser QA, rather than trying to finalize every decision
before writing code. A **provisional MVP decision** is a deliberately temporary implementation choice
made to get the system working and observable — not a claim that it is the final scientific, product,
UX, or architectural decision. Every provisional choice in this codebase is tagged inline as:

```
MVP-1 PROVISIONAL
REVISIT AFTER QA-1
```

See `src/lib/mealPersonalization.ts` and `src/components/MealPlanView.tsx` for the actual tags.

**Do not silently convert a provisional choice into a permanent decision** — a canonical `DEC` record
only changes status via its own ratification process (as `DEC-067`/`068`/`069`/`048` already did).

---

## 2. Iteration 1 Scope

Reassessed all 112 decisions (`DEC-001`–`DEC-112`) against `APP_DECISION_INVENTORY.md`,
`DECISION_LOGIC_SPECIFICATION.md`, every `DECISIONS/*.md` ratification record, `PROJECT_STATUS.md`,
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`, `docs/SESSION_CHECKPOINT.md`, and the actual
application code (`src/`, `api/`, `supabase/*.sql`) — not just Domains K/L/M. The full triage is §3
below.

From that triage, four decisions were selected for actual MVP-1 implementation this iteration (§5) —
chosen for being simultaneously: safe, reversible, requiring no new schema, not requiring invented
scientific values, and each closing a real, visible gap in the pipeline in §15 of the source
instructions (Profile → Estimation → Meal construction → Shopping). Everything else identified as a
genuine `C — PROVISIONAL MVP CANDIDATE` but **not** built this iteration is listed explicitly in §6 as
carried into a future PSM iteration — Iteration 1 intentionally does not attempt all of them in one
pass (see §7, "why not more").

---

## 3. Full DEC-001–112 Triage

> **READINESS PRECEDENCE:** `nutrition-curriculum/DEC_REGISTER.md` is authoritative for each decision's
> implementation readiness, and carries all 112 as individual rows in plain words (`SHIPPED` / `READY` /
> `PROVISIONAL` / `DEFERRED` / `BLOCKED` / `COVERED`) alongside the `A`–`H` category below. This section
> is not rewritten and remains the source for the per-decision *rationale* the register only summarises.
> Where the two disagree about a category, the register wins and this section is stale.

Categories: **A**=DONE, **B**=RATIFIED/IMPLEMENTATION REMAINS, **C**=PROVISIONAL MVP CANDIDATE,
**D**=DEFERRED, **E**=BLOCKED (do not guess), **F**=REFERENCE/SCIENTIFIC, **G**=ALREADY
COVERED/INFORMATIONAL, **H**=OTHER.

### Domain A — Goal (001–004)

| DEC | Cat | Rationale |
|---|---|---|
| 001 | G | `PersonalGoal` enum (maintain/loss/gain) already serves goal classification at MVP granularity; the curriculum's finer category set is a later-sanding refinement, not a gap blocking use. |
| 002 | G | Goal is a closed 3-option select, not free text — "vague goal" has no surface to apply to under the current input model. |
| 003 | G | App has no multi-goal input surface to reconcile — not applicable until such a surface exists. |
| 004 | E | Exact "implausible timeframe" threshold is an explicit Domain-C judgment call, deferred — do not invent a number. |

### Domain B — Baseline Profile (005–011)

| DEC | Cat | Rationale |
|---|---|---|
| 005 | G | `validateProfile()` already enforces minimum required fields. |
| 006 | G | `isEstimated`/`DEFAULT_PROFILE` fallback in `useRemainingToday.ts` already covers baseline-vs-default. |
| 007 | E | Would require a guided-intake conversation flow (which field to ask next) — a real feature, not a one-line MVP; no existing UI surface to hang it on without inventing one. |
| 008 | E | Same — no field-refusal UX exists; inventing one is a real feature, not this iteration's scope. |
| 009 | **C — IMPLEMENTED** | See §5.2. |
| 010 | E | No profile-history mechanism exists; conflict resolution needs one first. |
| 011 | **C — not built, carried to Iteration 2** | See §6. |

### Domain C — Clinical Safety Boundary (012–016)

| DEC | Cat | Rationale |
|---|---|---|
| 012–016 | **E (all five)** | Explicit safety boundary, coupled to `DEC-099`, posture-only per Gate 6 — do-not-resolve-autonomously across every gate record. Not touched. |

### Domain D — Energy (017–024)

| DEC | Cat | Rationale |
|---|---|---|
| 017 | G | `validateProfile()` already gates `calculateTargets()`. |
| 018 | A | Mifflin-St Jeor implemented, unchanged. |
| 019 | A | PAL-band activity multiplier implemented, unchanged. |
| 020 | E | Needs an observed-weight-trend data loop that doesn't exist — a multi-week feature, not a fast MVP; building a fake "individualized estimate" without real observed data would fabricate confidence. |
| 021 | E | Deviation-cap numeric parameter explicitly deferred to Phase 8/Gate 5, do-not-resolve-autonomously. |
| 022 | G | Static +400/-250 kcal adjustment already implemented; adjusting to match the curriculum's ±500 exactly is a numeric-tuning question for a human, not an architecture gap. Left as-is. |
| 023 | E | Recompute-trigger cadence depends on the same missing observed-data loop as DEC-020. |
| 024 | G | `warnings`/`assumptions` string arrays already communicate estimate caveats; not confidence-scaled, but present. |

### Domain E — Body Composition (025–030)

| DEC | Cat | Rationale |
|---|---|---|
| 025–030 (all six) | **E** | All depend on a weight/body-comp logging-and-trend subsystem that does not exist. Building a minimal version would mean a new table, new UI, and a trend algorithm — a real feature, not a one-line MVP; explicitly the kind of "unnecessary schema layer... unless directly required" §10 warns against building speculatively. Carried as a block, not attempted piecemeal, to Iteration 2 (see §6). |

### Domain F — Macros (031–040)

| DEC | Cat | Rationale |
|---|---|---|
| 031 | A | Tiered g/kg protein implemented. |
| 032 | G | Activity level already feeds the protein tier; a separate structured training-load input is Domain P's job (blocked there, see below). |
| 033 | **C — IMPLEMENTED** | See §5.4. |
| 034 | A | Carb g/kg-by-activity table implemented. |
| 035 | E | Needs exercise-timing data (Domain P) that doesn't exist yet. |
| 036 | A | Fat 20–35% AMDR remainder implemented. |
| 037 | A | Fiber 14 g/1000 kcal implemented. |
| 038 | E | Vegan/keto-style macro overrides would require inventing branching macro logic beyond the drafted spec's own "branching per pattern" — a real feature, not a safe one-liner. |
| 039 | D | Explicitly ratified: no independent macro-adjustment loop (Gate 5). |
| 040 | E | No conflicting-macro-input surface exists yet to resolve. |

### Domain G — Micronutrients (041–045)

| DEC | Cat | Rationale |
|---|---|---|
| 041–045 (all five) | **E** | `data/nutrition.json` carries macros + fiber only, no micronutrient columns. Any implementation would require either inventing per-food micronutrient values (explicitly forbidden, §24) or a real data-sourcing project — out of MVP-1 budget. |

### Domain H — Hydration (046–050)

| DEC | Cat | Rationale |
|---|---|---|
| 046 | **C — IMPLEMENTED** | See §5.1. |
| 047 | E | Needs exercise-duration data (Domain P) that doesn't exist. |
| 048 | A | Already ratified-closed by declining the parameter (Gate 6) — nothing to implement. |
| 049 | E | Needs sweat-rate/electrolyte data that doesn't exist. |
| 050 | E | Hyponatremia safety escalation needs a real, sourced threshold and an escalation UX — safety-relevant, not a guessable one-liner. |

### Domain I — GI Tolerance (051–054)

| DEC | Cat | Rationale |
|---|---|---|
| 051 | E | No symptom-logging surface exists; inventing one plus its use is a real feature. |
| 052 | E | Escalation-vs-adjustment threshold explicitly deferred to Domain C. |
| 053 | A | A1 hard/soft exclusion split implemented and safety-tested, unchanged. |
| 054 | E | Depends on the same missing symptom-logging surface as DEC-051. |

### Domain J — Meal Structure (055–059)

| DEC | Cat | Rationale |
|---|---|---|
| 055 | G | Fixed 4-slot structure already serves MVP meal structuring. |
| 056 | G | Existing per-slot target-vs-consumed totals already distribute targets simply. |
| 057 | E | Needs exercise-timing data (Domain P). |
| 058 | E | Hunger/satiety-responsiveness has no principled non-invented rule to apply without real signal. |
| 059 | E | No schedule/cultural-constraint input surface exists. |

### Domain K — Food Selection (060–065)

| DEC | Cat | Rationale |
|---|---|---|
| 060 | A | `scoreAllCombos` translation implemented. |
| 061 | A (food-level) / **E (allergen-class data coverage)** | Food-level filtering complete and safety-tested. Allergen-class enforcement code exists but only 19/89 live foods have curated mappings — that's a data-entry task, not a code gap, and expanding it risks inventing allergen data. Not touched. |
| 062 | E | Needs micronutrient-density data (blocked at DEC-041–045). |
| 063 | E | Substitution generation is `DEC-063`'s own scope — explicitly not to be built as a side effect of another decision (see §9's boundary list); a real feature. |
| 064 | E | No cost/cultural data model exists. |
| 065 | E | Curriculum-BLOCKED (GAP-D); building even a minimal pantry model is a net-new schema layer §10 says not to build speculatively. |

### Domain L — Meal Construction/Preparation (066–070)

| DEC | Cat | Rationale |
|---|---|---|
| 066 | G | `combos.json`/`combos.ts` already provide curated constructed meals — adequate for MVP; generative construction is a much larger, separate feature. |
| 067 | A | Ratified Level 1, implemented exactly at that level. Boundary preserved, not expanded (§9 below). |
| 068 | D | Ratified deferred-for-v1. Not implemented, per ratification. |
| 069 | A | Fully implemented, live-validated. Boundary preserved (§9 below). |
| 070 | A | Already implemented — `removeItem`/`ConfirmDeleteButton` in `MealPlanView.tsx` already let a user delete/adjust a planned entry, which is the MVP-level realization of "adjust plan when user deviates." No new work needed. |

### Domain M — Shopping (071–075)

| DEC | Cat | Rationale |
|---|---|---|
| 071 | **C — IMPLEMENTED** | See §5.3. |
| 072 | E | Needs pantry (blocked at DEC-065). |
| 073 | E | No cost data model exists; inventing prices would be fabricated data. |
| 074 | E | No store-availability data model exists. |
| 075 | D | Explicitly flagged "App Priority FUTURE FEATURE," non-core by design. |

### Domain N — Monitoring (076–080)

| DEC | Cat | Rationale |
|---|---|---|
| 076 | G | `logConsumption`/`undoConsumption` already cover food-intake logging; weight/activity/symptom logging is a larger feature (see Domain E). |
| 077–080 (all four) | E | Data-quality rating, adherence tracking, missing-log handling, and check-in escalation all presuppose a monitoring subsystem broader than the single existing food-log hook — a real feature, not a fast MVP addition. |

### Domain O — Adaptive Loop (081–091)

| DEC | Cat | Rationale |
|---|---|---|
| 081–091 (all eleven) | **E** | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090` are explicit do-not-resolve-autonomously safety items (circuit-breaker values). Building any part of this loop without the rest would be a non-functional, misleading fragment — not attempted. |

### Domain P — Sport/Training Data (092–098)

| DEC | Cat | Rationale |
|---|---|---|
| 092–097 (six) | E | No structured training-data capture surface exists; several (096, 097) explicitly feed still-blocked decisions (048's exercise half, 044's dosing boundary). A real feature. |
| 098 | D | A negative finding, already resolved: evidence does not support cycle-phase-tailored logic. Correctly not implemented. |

### Domain Q — Clinical Scope (099–102)

| DEC | Cat | Rationale |
|---|---|---|
| 099, 100 | D | Explicitly deferred, not reopened, at every gate. Untouched. |
| 101, 102 | E | Formally depend on 099/100; blocked transitively. |

### Domain R — Life Stage (103–105)

| DEC | Cat | Rationale |
|---|---|---|
| 103–105 (all three) | E | No life-stage (pregnancy/lactation/age-bracket) fields exist in the profile model; DRI life-stage adjustment tables are real reference data this session did not verify/source — adding fields without the adjustment logic behind them would be a misleading half-feature. |

### Domain S — Access/Affordability (106)

| DEC | Cat | Rationale |
|---|---|---|
| 106 | E | No food-access/affordability data model exists. |

### Domain T — Governance/Confidence (107–112)

| DEC | Cat | Rationale |
|---|---|---|
| 107 | G | App already cites named external standards (Mifflin-St Jeor, DRI-style constants) throughout — consistent with the ratified governance posture. Not an additional code change. |
| 108 | E | "Evolving-consensus" flagging needs a real per-decision provenance/confidence taxonomy — inventing a shallow version risks manufacturing false precision, contrary to §20. |
| 109 | E | Cross-input conflict detection generalizes DEC-009/010, both otherwise blocked/partial. |
| 110 | E | Same deviation-cap parameter as DEC-021, explicitly deferred. |
| 111 | D | Explicitly flagged "App Priority FUTURE FEATURE." |
| 112 | G | `warnings`/`assumptions` arrays are the existing (ad hoc, not scaled) confidence-communication convention; adequate for MVP. |

### Triage counts

| Category | Count |
|---|---|
| A — DONE | 13 |
| B — RATIFIED / IMPLEMENTATION REMAINS | 0 |
| C — PROVISIONAL MVP CANDIDATE (4 implemented, 1 carried forward explicitly, others noted inline) | 5 |
| D — DEFERRED | 7 |
| E — BLOCKED | 72 |
| F — REFERENCE/SCIENTIFIC | 0 |
| G — ALREADY COVERED / INFORMATIONAL | 15 |
| H — OTHER | 0 |
| **Total** | **112** (13+0+5+7+72+0+15+0) |

**Why the BLOCKED count is large:** most of the remaining open surface (Domains E, G, N, O, P, R, S and
much of C/D/M) is gated behind subsystems that do not exist yet (observed-data trend tracking,
micronutrient data, training-data capture, pantry, cost/store data) or behind explicit
do-not-resolve-autonomously safety parameters. Per §10/§24 of the source instructions, PSM does not
mean building speculative schemas or inventing scientific values to manufacture breadth — a narrower,
real Iteration 1 was preferred over a wider, half-fabricated one.

---

## 4. Closed Decisions — Not Reopened

Confirmed untouched, boundaries preserved exactly: Canonical Food Identity, B3 allergen
taxonomy/exclusion semantics, `DEC-067` (Level 1), `DEC-068` (deferred), `DEC-069` (Option 3,
household-scale). See §9 for the specific boundary statements re-affirmed.

---

## 5. MVP-1 Provisional Decisions — Option Records

### 5.1 DEC-046 — Baseline fluid needs

- **Current status:** OPEN (DRAFTED, Sec3.5 — DRI AI convention, 30–35 mL/kg/day).
- **MVP-1 provisional choice:** `waterMl = round(weightKg * 33)` (the midpoint of the drafted range),
  added to `PersonalTargets` and shown as a fifth target card ("Su") in `PersonalPlanView.tsx`.
- **Why this option:** the drafted formula is already a single deterministic multiply — the smallest
  possible representation that is still traceable to the curriculum's own cited figure, not invented.
- **Alternative 2:** show the full 30–35 mL/kg range instead of a single midpoint number. Rejected for
  MVP-1 only for display-simplicity; trivial to switch later.
- **Alternative 3:** none meaningful beyond a range-vs-point display choice.
- **What MVP-1 does NOT solve:** DEC-047 (exercise adjustment) and DEC-048 (heat/altitude, already
  ratified-closed) are not incorporated — this is baseline only.
- **What could cause us to change it:** real exercise-duration/environment data becoming available
  (Domain P), or QA feedback that a single point number reads as false precision.
- **Revisit point:** `REVISIT AFTER INTEGRATED BROWSER QA — PSM ITERATION 2`.

### 5.2 DEC-009 — Plausibility check on profile data

- **Current status:** OPEN (DRAFTED, Sec3.7 — anthropometric-bounds principle).
- **MVP-1 provisional choice:** a non-blocking warning appended to `calculateTargets()`'s existing
  `warnings` array when the *combined* BMI falls outside 12–60, on top of `validateProfile()`'s
  existing per-field bounds (which alone can still yield a physiologically nonsensical combination,
  e.g. 35 kg at 230 cm).
- **Why this option:** one boundary check reusing an existing field (`warnings`) — no new gate, no new
  UI surface, fully reversible (delete the `if`).
- **Alternative 2:** turn it into a hard validation error in `validateProfile()` instead of a warning.
  Rejected for MVP-1 as less reversible (a hard gate could block a legitimate edge-case profile);
  a warning is the more conservative, undo-able choice.
- **Alternative 3:** cross-check against age/sex-specific BMI norms instead of a flat 12–60 band.
  Rejected as inventing a more complex model than the drafted spec calls for at this stage.
- **What MVP-1 does NOT solve:** true implausibility detection beyond BMI (e.g. waist-to-height ratio
  cross-checks) per the full DEC-009 scope.
- **What could cause us to change it:** QA turning up real profiles that trip the warning
  inappropriately, or a future decision on where the 12/60 bounds should really sit.
- **Revisit point:** `REVISIT AFTER INTEGRATED BROWSER QA — PSM ITERATION 2`.

### 5.3 DEC-071 — Meal plan → shopping list consolidation

- **Current status:** OPEN (curriculum-BLOCKED at Sec7 as "product logic, not nutrition science" — not
  a science gap).
- **MVP-1 provisional choice:** a single "Bu günü alışveriş listesine ekle" button in `MealPlanView`
  that walks the currently-viewed day's planned items (`useMealPlan().allItems()`) and calls the
  existing shopping `addItem(name, qty)` once per item — the exact same function and dedup/Food-Identity
  resolution the Shopping tab already uses.
- **Why this option:** zero new schema, zero new dedup/aggregation logic — reuses `listActions.addItem`
  verbatim. The single smallest possible bridge between the two already-working surfaces.
- **Alternative 2:** aggregate quantities across repeated ingredients before adding (e.g. two meals both
  using "yumurta" become one combined-quantity row). Rejected for MVP-1 — `listActions.ts`'s existing
  dedup is explicitly non-quantity-aggregating already (a pre-existing, documented limitation, not
  something this task should silently fix), and building real aggregation is closer to `DEC-071`'s full
  scope than a fast MVP bridge.
- **Alternative 3:** a full "shopping list per week" planning surface with editable quantities before
  adding. Rejected as building UI infrastructure beyond what a fast MVP needs.
- **What MVP-1 does NOT solve:** quantity aggregation, pantry reconciliation (DEC-072), budget (073),
  store availability (074), or shopping-frequency minimization (075, explicitly out of scope).
- **What could cause us to change it:** QA revealing duplicate-row clutter is actually confusing enough
  in practice to justify aggregation sooner.
- **Revisit point:** `REVISIT AFTER INTEGRATED BROWSER QA — PSM ITERATION 2`.

### 5.4 DEC-033 — Distribute protein across occasions

- **Current status:** OPEN (DRAFTED, Sec3.3 — ~0.3–0.4 g/kg/occasion band).
- **MVP-1 provisional choice:** `occasionProteinTargetG(weightKg)` returns a flat `{min, max}` band
  applied identically to all four meal slots, shown as a small "Protein hedefi X-Y g" line per slot in
  `MealPlanView`. Display-only — nothing reads this value to gate, resize, or block an entry.
- **Why this option:** one pure function, no per-occasion redistribution logic, no dependency on
  exercise timing (DEC-035/057, both blocked) — the smallest useful signal a user can see per meal.
- **Alternative 2:** weight the target by occasion size/timing (e.g. a bigger post-workout allocation).
  Rejected for MVP-1 — requires exercise-timing data that doesn't exist (DEC-057, blocked).
- **Alternative 3:** derive the per-occasion target from the day's total protein target divided by
  occasion count, rather than a flat weight-based band. Rejected — the curriculum's own drafted figure
  is already per-kg, not a division of the daily total; dividing the daily total would silently invent
  a different formula.
- **What MVP-1 does NOT solve:** genuine per-occasion redistribution, and it is purely informational —
  no meal-plan entry is auto-adjusted to hit it.
- **What could cause us to change it:** QA feedback that a flat, identical band across all four slots
  reads as confusing or wrong for lopsided plans (e.g. a very small "ara öğün").
- **Revisit point:** `REVISIT AFTER INTEGRATED BROWSER QA — PSM ITERATION 2`.

---

## 6. Explicitly Carried Forward (real `C` candidates, not built this iteration)

- **DEC-011** (staleness window for profile reconfirmation) — a genuinely safe, reversible MVP exists
  (a soft "consider updating your profile" banner past N days), but it requires a new
  `updated_at`/`profile_updated_at` column on the `personal_plan` table — a live-DB schema change this
  task deliberately did not make without your review, consistent with every prior migration in this
  project's history requiring your own application via the Supabase SQL editor. Revisit once a schema
  change for this specific decision is explicitly authorized.
- Everything marked **E** above that is genuinely a "some real, safe minimal representation is
  *conceivable* but requires new schema/data/UI infrastructure this iteration's budget did not cover"
  rather than a hard safety/architecture block — the triage tables in §3 flag which of those are the
  closer, more feasible calls for a PSM Iteration 2 (Domain E body-comp logging and Domain N
  intake-adjacent logging are the two most likely next candidates, since Domain O's entire adaptive loop
  depends on them).

---

## 7. Why Not More — Scope Discipline Note

The source instructions ask for "a substantial portion of implementation-relevant remaining DEC
surface" while also explicitly forbidding invented scientific values, speculative schemas, and
generalized engines built "because they might be useful." After the full 112-decision triage, the
genuinely fast-safe-reversible-no-new-schema set was four decisions (§5) plus the "already adequate,
no work needed" set (13 `A` + 15 `G` = 28 decisions confirmed fine as-is). The remaining ~72 decisions
are blocked behind either (a) missing subsystems that are themselves multi-decision features
(observed-data trend tracking, micronutrient data, training-data capture, pantry/cost/store models,
life-stage fields) or (b) explicit do-not-resolve-autonomously safety parameters. Building partial,
non-functional fragments of those just to inflate the "implemented" count would violate §20's
prohibition on fake finality and §24's prohibition on inventing evidence — so Iteration 1 stayed
narrow by design, and the real next-iteration candidates are named explicitly in §6 rather than
attempted half-built.

---

## 8. Implementation Queue (dependency-ordered, as executed)

1. `DEC-046` (hydration baseline) — foundational, adds a field to the existing target-calculation
   function every other display consumes.
2. `DEC-009` (BMI plausibility) — same function, same commit-sized change, layered on top of 1.
3. `DEC-033` (per-occasion protein) — depends on `PersonalProfile.weightKg`, consumed by
   `MealPlanView`, which already exists.
4. `DEC-071` (shopping consolidation) — depends on `useMealPlan().allItems()` (already existed from the
   DEC-069 implementation pass) and the Shopping tab's existing `addItem` (threaded one prop deeper).

No implementation strictly followed DEC-number order — dependency order was used, per §13.

---

## 9. Boundaries Explicitly Re-Affirmed, Not Touched

- **DEC-067:** still Level 1 — ingredient-list output, optional textual note, no structured steps, no
  portion/yield model. Not expanded.
- **DEC-068:** still deferred for v1 — no skill/time/equipment matching added. `prepMinutes`/`prepNote`
  (if present) remain informational only.
- **DEC-069:** still Option 3, household-scale — no restaurant-scale production capability added, no
  change to `PreparationBatch`'s shape or its `composition[].food_id` value-space invariant
  (`nutrition.name_tr`, never the opaque Canonical-Food-Identity UUID).
- **Canonical Food Identity:** `food_id` (uuid) remains the canonical identity; fuzzy matching
  (`isCloseMatch`/`findCanonicalName`) was not touched and was not imported into any file changed this
  iteration (all four new pieces of logic are either pure arithmetic or reuse of already-safety-guarded
  functions).
- **B3 safety:** `hasHardExclusion`/`hasSoftConstraint`/allergen-class precedence untouched. No
  exclusion/allergen logic was modified this iteration.

---

## 10. Known Limitations of MVP-1

- The "Su" (water) target is a static baseline number with no logging, no adjustment, and no
  connection to actual fluid intake — informational only.
- The BMI plausibility warning is a coarse 12–60 band, not a sourced clinical implausibility model.
- Per-occasion protein targets are flat across all four slots regardless of meal size or timing.
- The meal-plan → shopping button does not aggregate quantities across repeated ingredients (same
  limitation `listActions.ts`'s dedup already had) and does not check pantry, cost, or store
  availability.
- All four provisional choices are display/consolidation additions only — none of them gate, block, or
  auto-adjust anything elsewhere in the app.

---

## 11. Browser QA Targets for This Iteration

Per the pipeline in the source instructions (`User/Profile → Goal → Assessment → Estimation →
Prescription → Meal construction → Food selection → Preparation → Shopping → Consumption/feedback`),
this iteration's changes are reachable at:

1. **Kişisel Plan tab** — confirm the new "Su" target card renders a sane value for a normal profile,
   and confirm the BMI-plausibility warning does *not* fire for ordinary inputs (it should only fire
   for extreme combinations — try one, e.g. very tall + very light, to confirm it does fire).
2. **Yemek Planı tab, any day with items in at least one slot** — confirm each slot's new "Protein
   hedefi X-Y g" line renders without layout breakage, and confirm the "Bu günü alışveriş listesine
   ekle" button (visible once the day has a nonzero total) actually adds each item to the active
   shopping list under the Alışveriş tab — check for duplicate/near-duplicate handling, and confirm no
   console errors or duplicate React keys appear.
3. Regression check: confirm existing meal-plan add/remove/quantity-edit, food exclusion filtering, and
   the DEC-069 `BatchPlanner` flow still work unchanged (this iteration touched `MealPlanView.tsx` but
   not `BatchPlanner.tsx` itself).

These findings become the sanding material for PSM Iteration 2 — no dedicated per-DEC browser test
suite was built, per §16 of the source instructions.

---

## 12. Revisit List for Iteration 2

Ranked by likely sanding priority after browser QA:

- **Critical:** none identified — nothing in this iteration touches safety, identity, or an existing
  ratified boundary.
- **High:** whether the flat per-occasion protein band (DEC-033) is confusing for the "ara öğün" slot
  in practice; whether the shopping-consolidation button's lack of quantity aggregation produces
  visibly annoying duplicate rows.
- **Medium:** whether the water target should show a range instead of a point value; whether the BMI
  plausibility band (12–60) needs tightening or loosening.
- **Low:** copy/wording polish on the new "taslak" (draft) label on the water card.

Also carried forward for a future iteration's triage (not urgent, not attempted this pass): DEC-011's
profile-staleness banner (needs a schema addition, see §6).
