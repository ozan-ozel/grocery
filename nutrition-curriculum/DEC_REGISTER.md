# DEC Register — Implementation Readiness

**What this file is:** the single scannable answer to *"which application decision can be worked on,
and which cannot?"* One row for each of the 112 decisions, `DEC-001`–`DEC-112`.

**What this file owns:** the readiness word for each decision, and nothing else.

**What it does not own — go to these instead:**

| For… | Read |
|---|---|
| What a decision actually *is* (inputs, outputs, dependencies) | `05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md` |
| Its drafted specification (formulas, thresholds, rules) | `10_PHASE_7_DECISION_ENGINE_SPECIFICATION/DECISION_LOGIC_SPECIFICATION.md` |
| A human ratification of it | `00_PROJECT_CONTROL/DECISIONS/` |
| Per-decision triage rationale in full | `08_APP_TRANSLATION/PSM_ITERATION_1_IMPLEMENTATION_LEDGER.md` §3 |
| Project phase status and current next task | `00_PROJECT_CONTROL/PROJECT_STATUS.md` |
| The rules you must follow when working here | `00_PROJECT_CONTROL/PROJECT_AI_PROTOCOL.md` |
| Whether a `READY`/`PROVISIONAL` decision is actively being handed off for implementation right now | `IMPLEMENTATION_HANDOFF.md` |

The `Label` column is **navigational only** — a condensed cue, not the decision's content. Cite
`APP_DECISION_INVENTORY.md` for that, never this file.

---

## The vocabulary

Seven words. Six map one-to-one onto the ledger's original `A`–`H` triage category, kept in its own
column so the two can always be reconciled; `PARTIAL` is the one exception — see note 4 below.

| Word | Ledger | Means | Can it be picked up? | Count |
|---|---|---|---|---|
| `SHIPPED` | A | Implemented in the app and verified | Done | **11** |
| `READY` | B | Ratified — implement it exactly as specified | **Yes** | **0** |
| `PROVISIONAL` | C | Implement a deliberately *temporary* MVP choice | **Yes, with care** | **4** |
| `DEFERRED` | D | Deliberately out of scope for v1 | No | **7** |
| `BLOCKED` | E | Waiting on a named missing subsystem, or on a human safety decision | No | **74** |
| `COVERED` | F, G, H | The app already does something adequate here | Not now | **15** |
| `PARTIAL` | mixed (e.g. A/E) | A meaningful part of the decision is implemented and verified; the rest is blocked or incomplete | Not now — remainder needs the same gate as its blocking half | **1** |

Four things a newcomer needs to know before using this table:

1. **`READY` is currently zero.** Every executable decision today is `PROVISIONAL`. That is a true
   fact about the project's state, not a gap in this register.
2. **`PROVISIONAL` is not permission to decide.** A provisional choice is temporary by construction and
   must be tagged in code as `MVP-N PROVISIONAL / REVISIT AFTER QA-N`. A decision becomes `READY` only
   through its own ratification process — never by an implementer's judgement.
3. **`COVERED` is not `SHIPPED`.** `SHIPPED` means the decision was implemented as specified.
   `COVERED` means the app has *something adequate* in that space and the curriculum's fuller version
   is a later refinement. `DEC-022` is the clearest case: the app applies +400/−250 kcal where the
   curriculum says ±500 — "a numeric-tuning question for a human, not an architecture gap." A
   `COVERED` row is a candidate for later sanding, not a closed item.
4. **`PARTIAL` is not `SHIPPED`, and it spans two ledger categories on purpose.** Use it only when a
   decision genuinely splits into an implemented, verified sub-scope and a separately blocked or
   incomplete sub-scope — not as a hedge for ordinary uncertainty. `DEC-061` is the only current case:
   food-level restriction filtering is implemented and safety-tested (`A`); allergen-class enforcement
   exists in code but only 19/89 foods carry curated mappings (`E`, a data-coverage gap). Marking the
   whole row `SHIPPED` overstated the safety-relevant half; marking it `BLOCKED` would understate the
   working half. Resolve a `PARTIAL` row by finishing its blocked half, not by reasoning it into
   `SHIPPED`.

**Why 74 are `BLOCKED`:** most of the remaining surface (Domains E, G, N, O, P, R, S and much of C/D/M)
depends on subsystems that do not exist yet — observed-data trend tracking, micronutrient data,
training-data capture, pantry, cost/store data — or on explicit do-not-resolve-autonomously safety
parameters. Unblocking one means building its subsystem first, not reasoning harder about the decision.

---

## Register

| DEC | Domain | Label (navigational only) | Readiness | Cat | Note |
|---|---|---|---|---|---|
| `DEC-001` | A · Goal | Determine the user's primary goal category (maintenance, weight loss, weight gain, muscle/lean-mass ga… | `COVERED` | G | `PersonalGoal` enum (maintain/loss/gain) already serves goal classification at MVP granularity; the curriculum's fine… |
| `DEC-002` | A · Goal | Determine whether a vague or purely qualitative goal statement ("get healthier," "feel better") can be… | `COVERED` | G | Goal is a closed 3-option select, not free text — "vague goal" has no surface to apply to under the current input model |
| `DEC-003` | A · Goal | Determine how multiple or apparently conflicting stated goals are reconciled or sequenced (e.g. simult… | `COVERED` | G | App has no multi-goal input surface to reconcile — not applicable until such a surface exists |
| `DEC-004` | A · Goal | Determine whether the goal as stated, or a timeframe implied within it, requires a safety/scope flag b… | `BLOCKED` | E | Exact "implausible timeframe" threshold is an explicit Domain-C judgment call, deferred — do not invent a number |
| `DEC-005` | B · Baseline Profile | Determine the minimum set of baseline profile fields required before an initial estimate can be produced | `COVERED` | G | `validateProfile()` already enforces minimum required fields |
| `DEC-006` | B · Baseline Profile | Determine whether currently available profile information is sufficient to proceed, or whether populat… | `COVERED` | G | `isEstimated`/`DEFAULT_PROFILE` fallback in `useRemainingToday.ts` already covers baseline-vs-default |
| `DEC-007` | B · Baseline Profile | Determine which missing profile fields have the greatest decision value and should be prioritized when… | `BLOCKED` | E | Would require a guided-intake conversation flow (which field to ask next) — a real feature, not a one-line MVP; no ex… |
| `DEC-008` | B · Baseline Profile | Determine how a user's refusal or inability to provide a requested profile field is handled downstream | `BLOCKED` | E | Same — no field-refusal UX exists; inventing one is a real feature, not this iteration's scope |
| `DEC-009` | B · Baseline Profile | Determine whether provided profile data is internally plausible, and how an implausible-data flag is h… | `PROVISIONAL` | C | IMPLEMENTED |
| `DEC-010` | B · Baseline Profile | Determine how conflicting profile information (e.g. contradictory answers given at different times) is… | `BLOCKED` | E | No profile-history mechanism exists; conflict resolution needs one first |
| `DEC-011` | B · Baseline Profile | Determine when previously collected profile data is considered stale and should trigger a re-confirmat… | `BLOCKED` | E | A safe MVP is designed but needs a new `updated_at` column on `personal_plan` — a live-DB migration withheld pending your review, per this project's standing practice. Not "pick up and implement," despite `C`'s ledger origin |
| `DEC-012` | C · Clinical Safety Boundary | Determine which disclosed populations or conditions place a user outside the application's safe automa… | `BLOCKED` | E | Explicit safety boundary, coupled to `DEC-099`, posture-only per Gate 6 — do-not-resolve-autonomously across every ga… |
| `DEC-013` | C · Clinical Safety Boundary | Determine which reported symptoms or behavioral signals constitute a red flag requiring escalation rat… | `BLOCKED` | E | Explicit safety boundary, coupled to `DEC-099`, posture-only per Gate 6 — do-not-resolve-autonomously across every ga… |
| `DEC-014` | C · Clinical Safety Boundary | Determine the boundary condition at which the application withholds a generated prescription pending p… | `BLOCKED` | E | Explicit safety boundary, coupled to `DEC-099`, posture-only per Gate 6 — do-not-resolve-autonomously across every ga… |
| `DEC-015` | C · Clinical Safety Boundary | Determine how the application's guidance coordinates with an existing clinician/dietitian relationship… | `BLOCKED` | E | Explicit safety boundary, coupled to `DEC-099`, posture-only per Gate 6 — do-not-resolve-autonomously across every ga… |
| `DEC-016` | C · Clinical Safety Boundary | Determine how ongoing-use signals (not just intake-time signals) are monitored for emerging escalation… | `BLOCKED` | E | Explicit safety boundary, coupled to `DEC-099`, posture-only per Gate 6 — do-not-resolve-autonomously across every ga… |
| `DEC-017` | D · Energy | Determine whether sufficient baseline data exists to produce an initial (Level-1 scientific-estimate)… | `COVERED` | G | `validateProfile()` already gates `calculateTargets()` |
| `DEC-018` | D · Energy | Determine an appropriate method-class (population-formula-based, activity-based, or hybrid) for the in… | `SHIPPED` | A | Mifflin-St Jeor implemented, unchanged |
| `DEC-019` | D · Energy | Determine how disclosed activity/training data is incorporated into the initial total-energy-expenditu… | `SHIPPED` | A | PAL-band activity multiplier implemented, unchanged |
| `DEC-020` | D · Energy | Determine what constitutes sufficient observed data (logged intake plus weight/ composition trend over… | `BLOCKED` | E | Needs an observed-weight-trend data loop that doesn't exist — a multi-week feature, not a fast MVP; building a fake "… |
| `DEC-021` | D · Energy | Determine how to weigh the initial model-based estimate against the individual's observed response whe… | `BLOCKED` | E | Deviation-cap numeric parameter explicitly deferred to Phase 8/Gate 5, do-not-resolve-autonomously |
| `DEC-022` | D · Energy | Determine the current energy prescription given the individualized maintenance figure (DEC-021) and th… | `COVERED` | G | Static +400/-250 kcal adjustment already implemented; adjusting to match the curriculum's ±500 exactly is a numeric-t… |
| `DEC-023` | D · Energy | Determine the triggers for recomputing the energy estimate or prescription as new profile or observed… | `BLOCKED` | E | Recompute-trigger cadence depends on the same missing observed-data loop as DEC-020 |
| `DEC-024` | D · Energy | Determine how estimate/prescription confidence or uncertainty is represented and communicated to the user | `COVERED` | G | `warnings`/`assumptions` string arrays already communicate estimate caveats; not confidence-scaled, but present |
| `DEC-025` | E · Body Composition | Determine which body-composition metrics the application requests and tracks for a given user/goal com… | `BLOCKED` | E | All depend on a weight/body-comp logging-and-trend subsystem that does not exist |
| `DEC-026` | E · Body Composition | Determine how short-term weight fluctuation is distinguished from a genuine directional trend | `BLOCKED` | E | All depend on a weight/body-comp logging-and-trend subsystem that does not exist |
| `DEC-027` | E · Body Composition | Determine an appropriate target rate/direction of body-weight or body-composition change given the goa… | `BLOCKED` | E | All depend on a weight/body-comp logging-and-trend subsystem that does not exist |
| `DEC-028` | E · Body Composition | Determine when body-composition trend data is sufficient to trigger reassessment of the current energy… | `BLOCKED` | E | All depend on a weight/body-comp logging-and-trend subsystem that does not exist |
| `DEC-029` | E · Body Composition | Determine how missing or irregular weigh-in data affects confidence in trend interpretation | `BLOCKED` | E | All depend on a weight/body-comp logging-and-trend subsystem that does not exist |
| `DEC-030` | E · Body Composition | Determine whether a body-recomposition goal requires a distinct monitoring cadence/metric set from a p… | `BLOCKED` | E | All depend on a weight/body-comp logging-and-trend subsystem that does not exist |
| `DEC-031` | F · Macros | Determine an appropriate total daily protein requirement given goal, body characteristics, and trainin… | `SHIPPED` | A | Tiered g/kg protein implemented |
| `DEC-032` | F · Macros | Determine how training/activity load adjusts the protein requirement relative to a sedentary baseline | `COVERED` | G | Activity level already feeds the protein tier; a separate structured training-load input is Domain P's job (blocked t… |
| `DEC-033` | F · Macros | Determine how the protein requirement is distributed across the day's eating occasions | `PROVISIONAL` | C | IMPLEMENTED |
| `DEC-034` | F · Macros | Determine an appropriate total daily carbohydrate requirement given goal, energy prescription, and tra… | `SHIPPED` | A | Carb g/kg-by-activity table implemented |
| `DEC-035` | F · Macros | Determine how carbohydrate intake is adjusted around exercise (timing-sensitive periods) versus on res… | `BLOCKED` | E | Needs exercise-timing data (Domain P) that doesn't exist yet |
| `DEC-036` | F · Macros | Determine an appropriate total daily fat intake given the energy prescription and the protein/carbohyd… | `SHIPPED` | A | Fat 20–35% AMDR remainder implemented |
| `DEC-037` | F · Macros | Determine an appropriate fiber intake target and how it is reconciled with the carbohydrate allocation | `SHIPPED` | A | Fiber 14 g/1000 kcal implemented |
| `DEC-038` | F · Macros | Determine how a disclosed dietary pattern or restriction (vegan, low-carb, ketogenic, etc.) constrains… | `BLOCKED` | E | Vegan/keto-style macro overrides would require inventing branching macro logic beyond the drafted spec's own "branchi… |
| `DEC-039` | F · Macros | Determine whether/how macro targets are adjusted in response to observed data versus held fixed betwee… | `DEFERRED` | D | Explicitly ratified: no independent macro-adjustment loop (Gate 5) |
| `DEC-040` | F · Macros | Determine how conflicting macro-relevant inputs are resolved (e.g. a goal implying high protein versus… | `BLOCKED` | E | No conflicting-macro-input surface exists yet to resolve |
| `DEC-041` | G · Micronutrients | Determine whether adequacy of a given micronutrient is likely, given the user's disclosed dietary patt… | `BLOCKED` | E | `data/nutrition.json` carries macros + fiber only, no micronutrient columns |
| `DEC-042` | G · Micronutrients | Determine whether additional dietary attention is needed for a specific micronutrient (a deficiency-ri… | `BLOCKED` | E | `data/nutrition.json` carries macros + fiber only, no micronutrient columns |
| `DEC-043` | G · Micronutrients | Determine how food-based sources can address a flagged micronutrient risk (a translation into food-gui… | `BLOCKED` | E | `data/nutrition.json` carries macros + fiber only, no micronutrient columns |
| `DEC-044` | G · Micronutrients | Determine whether supplementation should be considered for a flagged micronutrient risk, versus dietar… | `BLOCKED` | E | `data/nutrition.json` carries macros + fiber only, no micronutrient columns |
| `DEC-045` | G · Micronutrients | Determine whether/how micronutrient screening or guidance differs for an identified special population… | `BLOCKED` | E | `data/nutrition.json` carries macros + fiber only, no micronutrient columns |
| `DEC-046` | H · Hydration | Determine baseline fluid needs absent exercise or environmental data | `PROVISIONAL` | C | IMPLEMENTED |
| `DEC-047` | H · Hydration | Determine how exercise duration/intensity modifies fluid needs | `BLOCKED` | E | Needs exercise-duration data (Domain P) that doesn't exist |
| `DEC-048` | H · Hydration | Determine how environmental conditions (heat, altitude) further modify fluid/ electrolyte needs | `BLOCKED` | E | Gate 6 ratified real content here (no population heat multiplier; +1–1.5 L/day altitude additive) — not a no-op. But per `APP_DECISION_INVENTORY.md` it depends on `DEC-047` and `DEC-096` output, both `BLOCKED`, and `DEC-046`'s own note confirms it is "not incorporated." Was `SHIPPED`; corrected as transitively blocked, not done |
| `DEC-049` | H · Hydration | Determine how estimated sweat/electrolyte loss is incorporated into replacement guidance | `BLOCKED` | E | Needs sweat-rate/electrolyte data that doesn't exist |
| `DEC-050` | H · Hydration | Determine when fluid/electrolyte signals cross from a routine-adjustment case into a safety-escalation… | `BLOCKED` | E | Hyponatremia safety escalation needs a real, sourced threshold and an escalation UX — safety-relevant, not a guessabl… |
| `DEC-051` | I · GI Tolerance | Determine how self-reported GI symptoms are captured and used to modify food or meal-timing guidance | `BLOCKED` | E | No symptom-logging surface exists; inventing one plus its use is a real feature |
| `DEC-052` | I · GI Tolerance | Determine when reported GI symptoms should trigger a scope/escalation flag rather than a dietary-adjus… | `BLOCKED` | E | Escalation-vs-adjustment threshold explicitly deferred to Domain C |
| `DEC-053` | I · GI Tolerance | Determine how a suspected food intolerance is distinguished from a true allergy for the purpose of dow… | `SHIPPED` | A | A1 hard/soft exclusion split implemented and safety-tested, unchanged |
| `DEC-054` | I · GI Tolerance | Determine how GI tolerance is expected to adapt over time with repeated exposure (e.g. training-relate… | `BLOCKED` | E | Depends on the same missing symptom-logging surface as DEC-051 |
| `DEC-055` | J · Meal Structure | Determine how many eating occasions a plan structures around and what inputs drive that choice | `COVERED` | G | Fixed 4-slot structure already serves MVP meal structuring |
| `DEC-056` | J · Meal Structure | Determine how daily macro/energy targets are distributed across the chosen eating occasions | `COVERED` | G | Existing per-slot target-vs-consumed totals already distribute targets simply |
| `DEC-057` | J · Meal Structure | Determine how pre-exercise, during-exercise, and post-exercise/recovery nutrient timing needs are inco… | `BLOCKED` | E | Needs exercise-timing data (Domain P) |
| `DEC-058` | J · Meal Structure | Determine how hunger/satiety signals reported by the user influence meal structure over time | `BLOCKED` | E | Hunger/satiety-responsiveness has no principled non-invented rule to apply without real signal |
| `DEC-059` | J · Meal Structure | Determine how practical schedule, access, or cultural constraints override a default meal structure | `BLOCKED` | E | No schedule/cultural-constraint input surface exists |
| `DEC-060` | K · Food Selection | Determine the translation boundary between a per-occasion nutrient/macro target and a candidate set of… | `SHIPPED` | A | `scoreAllCombos` translation implemented |
| `DEC-061` | K · Food Selection | Determine how restrictions, allergies, and preferences filter or hard-exclude candidate foods | `PARTIAL` | A/E | Food-level filtering implemented and safety-tested (`A`); allergen-class enforcement code exists but only 19/89 foods have curated mappings — a data-coverage gap (`E`), not a code gap. Was `SHIPPED`; that overstated the allergen-class half |
| `DEC-062` | K · Food Selection | Determine how food-selection candidates are prioritized by nutrient density given a fixed energy/macro… | `BLOCKED` | E | Needs micronutrient-density data (blocked at DEC-041–045) |
| `DEC-063` | K · Food Selection | Determine how substitutions are generated when a planned or preferred food is unavailable or restricted | `BLOCKED` | E | Substitution generation is `DEC-063`'s own scope — explicitly not to be built as a side effect of another decision (s… |
| `DEC-064` | K · Food Selection | Determine how cost, convenience, and cultural considerations weight food-selection candidates when dis… | `BLOCKED` | E | No cost/cultural data model exists |
| `DEC-065` | K · Food Selection | Determine how the user's existing grocery/pantry data is incorporated into food-selection decisions ra… | `BLOCKED` | E | Curriculum-BLOCKED (GAP-D); building even a minimal pantry model is a net-new schema layer §10 says not to build spec… |
| `DEC-066` | L · Meal Construction/Prep | Determine how a set of selected foods and portions is translated into constructed meals | `COVERED` | G | `combos.json`/`combos.ts` already provide curated constructed meals — adequate for MVP; generative construction is a… |
| `DEC-067` | L · Meal Construction/Prep | Determine what level of preparation detail (recipe-level, ingredient-list-level, or general guidance o… | `SHIPPED` | A | Ratified Level 1, implemented exactly at that level |
| `DEC-068` | L · Meal Construction/Prep | Determine how meal construction accounts for practical constraints such as cooking skill, available ti… | `DEFERRED` | D | Ratified deferred-for-v1 |
| `DEC-069` | L · Meal Construction/Prep | Determine how batch cooking, leftovers, and storage are incorporated into a meal plan when relevant | `SHIPPED` | A | Fully implemented, live-validated |
| `DEC-070` | L · Meal Construction/Prep | Determine how a meal plan is adjusted when the user deviates from it (skipped meal, substituted food… | `SHIPPED` | A | Already implemented — `removeItem`/`ConfirmDeleteButton` in `MealPlanView.tsx` already let a user delete/adjust a pla… |
| `DEC-071` | M · Shopping | Determine how a constructed meal plan is translated into a consolidated shopping list (quantities, cro… | `PROVISIONAL` | C | IMPLEMENTED |
| `DEC-072` | M · Shopping | Determine how a generated shopping list is reconciled with what the user already has on hand (pantry a… | `BLOCKED` | E | Needs pantry (blocked at DEC-065) |
| `DEC-073` | M · Shopping | Determine how shopping guidance adapts to a disclosed budget constraint | `BLOCKED` | E | No cost data model exists; inventing prices would be fabricated data |
| `DEC-074` | M · Shopping | Determine how shopping guidance adapts to disclosed store-availability constraints | `BLOCKED` | E | No store-availability data model exists |
| `DEC-075` | M · Shopping | Determine how shopping frequency/list complexity is minimized while still meeting the meal plan's requ… | `DEFERRED` | D | Explicitly flagged "App Priority FUTURE FEATURE," non-core by design |
| `DEC-076` | N · Monitoring | Determine what data the application asks the user to log routinely, and at what cadence, across weight… | `COVERED` | G | `logConsumption`/`undoConsumption` already cover food-intake logging; weight/activity/symptom logging is a larger fea… |
| `DEC-077` | N · Monitoring | Determine how measurement/logging quality (e.g. a single scale reading vs | `BLOCKED` | E | Data-quality rating, adherence tracking, missing-log handling, and check-in escalation all presuppose a monitoring su… |
| `DEC-078` | N · Monitoring | Determine how logging adherence itself is tracked and used as a data-quality signal for downstream int… | `BLOCKED` | E | Data-quality rating, adherence tracking, missing-log handling, and check-in escalation all presuppose a monitoring su… |
| `DEC-079` | N · Monitoring | Determine how missing or incomplete logs are handled rather than treated as equivalent to "no change." | `BLOCKED` | E | Data-quality rating, adherence tracking, missing-log handling, and check-in escalation all presuppose a monitoring su… |
| `DEC-080` | N · Monitoring | Determine which monitoring signals should trigger a check-in prompt or escalation rather than silent c… | `BLOCKED` | E | Data-quality rating, adherence tracking, missing-log handling, and check-in escalation all presuppose a monitoring su… |
| `DEC-081` | O · Adaptive Loop | Determine whether enough observed data has accumulated, over a sufficient duration, to evaluate whethe… | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-082` | O · Adaptive Loop | Determine whether the accumulated observed data is of sufficient quality to be used for evaluation | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-083` | O · Adaptive Loop | Determine whether the observed response is consistent with what the current plan predicted | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-084` | O · Adaptive Loop | Determine whether the energy estimate/prescription should be updated in light of the interpreted obser… | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-085` | O · Adaptive Loop | Determine whether macro targets should change as a consequence of an energy- prescription adjustment o… | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-086` | O · Adaptive Loop | Determine whether meal structure or food selection should change as a consequence of an upstream adjus… | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-087` | O · Adaptive Loop | Determine whether more data should be collected before any adjustment is made, versus adjusting now on… | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-088` | O · Adaptive Loop | Determine whether a full new baseline assessment (rather than an incremental adjustment) is warranted | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-089` | O · Adaptive Loop | Determine how the user is informed of, or asked to confirm, a proposed adjustment | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-090` | O · Adaptive Loop | Determine how repeated adjustment cycles that fail to produce the expected observed response are handl… | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-091` | O · Adaptive Loop | Determine how subjective user-reported feedback (energy levels, hunger, satisfaction, motivation) is i… | `BLOCKED` | E | The entire adaptive loop depends on the observed-data trend infrastructure blocked at Domain E/N, and `DEC-084`/`090`… |
| `DEC-092` | P · Sport/Training Data | Determine what training data (type, volume, intensity, phase) is collected and how it feeds the energy… | `BLOCKED` | E | No structured training-data capture surface exists; several (096, 097) explicitly feed still-blocked decisions (048's… |
| `DEC-093` | P · Sport/Training Data | Determine how the application distinguishes recreational activity from structured athletic training fo… | `BLOCKED` | E | No structured training-data capture surface exists; several (096, 097) explicitly feed still-blocked decisions (048's… |
| `DEC-094` | P · Sport/Training Data | Determine how a competition or event date modifies nutrition guidance in the period leading up to and… | `BLOCKED` | E | No structured training-data capture surface exists; several (096, 097) explicitly feed still-blocked decisions (048's… |
| `DEC-095` | P · Sport/Training Data | Determine how signals consistent with relative energy deficiency or overtraining are detected from ava… | `BLOCKED` | E | No structured training-data capture surface exists; several (096, 097) explicitly feed still-blocked decisions (048's… |
| `DEC-096` | P · Sport/Training Data | Determine how travel, altitude, heat, or other disclosed environmental factors are captured as inputs… | `BLOCKED` | E | No structured training-data capture surface exists; several (096, 097) explicitly feed still-blocked decisions (048's… |
| `DEC-097` | P · Sport/Training Data | Determine how disclosed supplement use is captured and reconciled with the application's own nutrient-… | `BLOCKED` | E | No structured training-data capture surface exists; several (096, 097) explicitly feed still-blocked decisions (048's… |
| `DEC-098` | P · Sport/Training Data | Determine whether/how female-athlete-specific considerations (e.g. menstrual-cycle- related factors, F… | `DEFERRED` | D | A negative finding, already resolved: evidence does not support cycle-phase-tailored logic |
| `DEC-099` | Q · Clinical Scope | Determine which disclosed clinical conditions the application can support with tailored guidance versu… | `DEFERRED` | D | Explicitly deferred, not reopened, at every gate |
| `DEC-100` | Q · Clinical Scope | Determine how a disclosed clinical condition modifies upstream decisions (energy, macro, micronutrient… | `DEFERRED` | D | Explicitly deferred, not reopened, at every gate |
| `DEC-101` | Q · Clinical Scope | Determine how a conflict between a clinical flag's requirements and the user's stated goal is resolved… | `BLOCKED` | E | Formally depend on 099/100; blocked transitively |
| `DEC-102` | Q · Clinical Scope | Determine whether a disclosed condition requires only an adjustment to existing decision logic versus… | `BLOCKED` | E | Formally depend on 099/100; blocked transitively |
| `DEC-103` | R · Life Stage | Determine which life-stage categories the application distinguishes and how a user is assigned to one | `BLOCKED` | E | No life-stage (pregnancy/lactation/age-bracket) fields exist in the profile model; DRI life-stage adjustment tables a… |
| `DEC-104` | R · Life Stage | Determine how life-stage assignment changes default requirements, safe-scope boundaries, and monitorin… | `BLOCKED` | E | No life-stage (pregnancy/lactation/age-bracket) fields exist in the profile model; DRI life-stage adjustment tables a… |
| `DEC-105` | R · Life Stage | Determine how a life-stage transition occurring during ongoing use (e.g. pregnancy onset, aging into a… | `BLOCKED` | E | No life-stage (pregnancy/lactation/age-bracket) fields exist in the profile model; DRI life-stage adjustment tables a… |
| `DEC-106` | S · Access/Affordability | Determine whether/how disclosed food-access or affordability constraints are incorporated into recomme… | `BLOCKED` | E | No food-access/affordability data model exists |
| `DEC-107` | S · Access/Affordability | Determine whether the application aligns its default guidance to a named external food-guide/standard… | `COVERED` | G | App already cites named external standards (Mifflin-St Jeor, DRI-style constants) throughout — consistent with the ra… |
| `DEC-108` | T · Governance/Confidence | Determine how a recommendation resting on an area of active scientific debate or evolving consensus is… | `BLOCKED` | E | "Evolving-consensus" flagging needs a real per-decision provenance/confidence taxonomy — inventing a shallow version… |
| `DEC-109` | T · Governance/Confidence | Determine how conflicting user-provided information across inputs is detected and resolved before it p… | `BLOCKED` | E | Cross-input conflict detection generalizes DEC-009/010, both otherwise blocked/partial |
| `DEC-110` | T · Governance/Confidence | Determine how an observed-response result that contradicts the model-based estimate is handled when bo… | `BLOCKED` | E | Same deviation-cap parameter as DEC-021, explicitly deferred |
| `DEC-111` | T · Governance/Confidence | Determine the application's general process for periodically reviewing and updating its guidance logic… | `DEFERRED` | D | Explicitly flagged "App Priority FUTURE FEATURE." |
| `DEC-112` | T · Governance/Confidence | Determine how data-quality/confidence levels are communicated consistently across all decisions in thi… | `COVERED` | G | `warnings`/`assumptions` arrays are the existing (ad hoc, not scaled) confidence-communication convention; adequate f… |
