# DEC-069 Investigation — Batch/Leftovers/Storage Scope

**Document type:** Phase 9 investigation and Human Decision Package. **Investigation only — no
implementation, no resolution of DEC-069, no reopening of DEC-068.**
**Date:** 2026-09-09
**Status:** DEC-069 remains OPEN after this document. DEC-067 remains CLOSED/IMPLEMENTED and DEC-068
remains CLOSED/DEFERRED FOR V1 — neither is reopened. DEC-070 is unchanged.

---

## 1. Purpose and Scope

Investigate DEC-069 to the depth needed to produce a Human Decision Package: recover its exact
original definition, trace its formal dependencies, distinguish it precisely from every neighboring
decision (especially the just-closed DEC-068), determine what it actually controls, decompose the
"scaling/yield/batch/portion/storage" concept cluster into its constituent parts rather than treating
them as one idea, audit the current codebase for any existing capability, assess knowledge-layer
support, and — since DEC-069 is confirmed genuinely unresolved — present candidate options for human
review. This document does not select an option and does not implement anything.

---

## 2. Exact DEC-069 Definition

Recovered verbatim from `APP_DECISION_INVENTORY.md` lines 1147–1158 (Domain L — Meal Planning and
Preparation):

> **Decision:** Determine how batch cooking, leftovers, and storage are incorporated into a meal plan
> when relevant.
>
> **Domain:** L · **Decision Type:** TRANSLATION
>
> **Inputs:** DEC-066 constructed meals across multiple days.
>
> **Output:** A batching/storage-aware meal-plan structure.
>
> **Depends On:** DEC-066 · **Downstream Use:** DEC-071
>
> **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
>
> **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
>
> **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
>
> **App Priority:** OPTIONAL
>
> **Notes / Uncertainty:** Same gap as DEC-067.

This original text is not reinterpreted in this section. Operational meaning is developed in §5–§6.

**Note on Decision Type:** unlike DEC-068 (ADJUSTMENT — modifies one already-constructed meal for
feasibility), DEC-069 is typed **TRANSLATION** — it takes constructed meals *across multiple days* and
produces a *structure*, not a modification of any single meal. This distinction is load-bearing for §5.

---

## 3. Formal Dependencies

Traced directly in `APP_DECISION_DEPENDENCY_GRAPH.md`; every line containing the literal string
`DEC-069` in that file was inspected (three total: one narrative-diagram mention, two table edges).

**Inbound edge:**

> Line 441: `DEC-066 | DEC-069 | REQUIRED | Batching/storage logic operates on constructed meals across
> days | — | Constructed meals (multi-day) | —`

**Outbound edge:**

> Line 450: `DEC-069 | DEC-071 | REQUIRED | Consolidation must account for batching/storage decisions
> already made | — | Batching-aware meal structure | —`

**No discrepancy this time.** Unlike DEC-068 (whose Inventory "Downstream Use: DEC-070" had no
corresponding graph edge — see `DEC-068_INVESTIGATION.md` §3), DEC-069's Inventory fields (`Depends
On: DEC-066 · Downstream Use: DEC-071`) match the Dependency Graph exactly — both edges exist, both are
classified `REQUIRED`, and no other edge of any type (`CONDITIONAL`, `STRONGLY_RECOMMENDED`,
`INFORMATIVE`, `FEEDBACK`) touches DEC-069 in either direction. No bidirectional relationship exists.

**Confirmed via the graph's own narrative summary** (line 205): `DEC-066, DEC-069 (constructed meals
across days) → DEC-071 (shopping list) → DEC-072 (pantry reconciliation)` — consistent with the two
edges above.

**Practical reading:** DEC-069 sits cleanly between DEC-066 (single-meal construction) and DEC-071
(shopping-list consolidation). It has exactly one upstream and one downstream formal dependency — it is
not a hub, and (per §7 below) its `DEC-069 → DEC-071` edge is a *real, already-mapped* consequence for
shopping, not a speculative one.

---

## 4. Decision Neighborhood

Every decision named in the task is addressed below. Not every one is materially related — several are
included only to confirm the boundary is clean (no formal or semantic dependency), per the task's own
instruction not to assume every neighbor is relevant.

| Decision | What it controls | What DEC-069 controls (contrast) | Boundary | Does DEC-069 consume its output? | Formal or contextual? |
|---|---|---|---|---|---|
| `DEC-060` | Translating a per-occasion nutrient target into a candidate food set (Domain K) | Incorporating already-constructed meals into a multi-day batching/storage structure (Domain L) | Different domain, different layer (food selection vs. meal-plan structure); no overlap | No | Not related — no edge, no shared concept |
| `DEC-061` | Filtering/hard-excluding candidate foods for allergy/preference (Domain K, safety) | Nothing about food selection or exclusion | DEC-069 must *preserve* DEC-061's already-applied filtering across any scaling/duplication it introduces (§11), but does not re-decide it | No formal input | Contextual — a safety invariant DEC-069 must respect, not a dependency |
| `DEC-062` | Ranking candidates by nutrient density (Domain K) | Nothing about ranking | No overlap | No | Not related |
| `DEC-063` | Generating a substitute food when one is unavailable/restricted (Domain K) | Nothing about substitution — DEC-069 assumes the same foods persist across the batch/multi-day window | If a future DEC-069 implementation ever needed to swap a food (e.g. one that doesn't store well), that swap is DEC-063's territory, not a new DEC-069 mechanism (§11) | No | Contextual — a routing rule for a hypothetical future case, not a current dependency |
| `DEC-064` | Cost/convenience/cultural weighting (Domain K) | Nothing about weighting | No overlap | No | Not related |
| `DEC-065` | Incorporating the user's existing pantry/grocery data into food *selection* (Domain K) | Incorporating storage of *already-selected, already-constructed* meals (Domain L) | Different direction: DEC-065 looks at what the user already has *before* selecting; DEC-069 looks at what happens to a meal *after* it's constructed, over time | No | Not related — no edge; see §13 for the pantry/storage terminology distinction this boundary requires |
| `DEC-066` | Translating selected foods+portions into one constructed meal (Level 3) | Incorporating *multiple* such constructed meals, across days, into a batching-aware structure | DEC-069 is strictly downstream and operates on DEC-066's output at a higher (multi-day) level | **Yes — formal `REQUIRED` input** (§3) | **Formal** |
| `DEC-067` | Choosing how much preparation detail is exposed for one constructed meal (representation) — CLOSED, Level 1 | Nothing about representation detail | Different decision type entirely (SELECTION vs. TRANSLATION); DEC-069 does not consume DEC-067's `prepNote`/`prepMinutes` output — confirmed no edge exists between them in the graph | No | Not related — no edge |
| `DEC-068` | Adjusting *one* meal for disclosed skill/time/equipment (ADJUSTMENT) — CLOSED/DEFERRED FOR V1 | Incorporating batching/storage across *multiple days* (TRANSLATION) | No formal dependency in either direction (`DEC-068_INVESTIGATION.md` §3, confirmed again here); genuinely separate concerns — see §14 for the full boundary re-confirmation | No | Not related — no edge, and this document re-confirms it, not merely repeats it |
| `DEC-070` | Adjusting the *remaining day's plan* when the user deviates (skipped meal, substitution, unplanned eating) — a same-day, reactive, tactical decision | A *proactive*, structural decision about incorporating batching into the plan before any deviation occurs | DEC-070 reacts to what actually happened; DEC-069 shapes what was planned in the first place. Both depend on DEC-066 directly, not on each other | No | Not related — no edge exists between DEC-069 and DEC-070 in either direction |
| `DEC-071` | Translating a constructed meal plan into a consolidated shopping list | Producing the batching-aware structure DEC-071 must consolidate *from* | DEC-071 is strictly downstream | DEC-071 consumes **DEC-069's** output (not the reverse) | **Formal** — `DEC-069 → DEC-071 REQUIRED` (§3) |
| `DEC-072` | Reconciling a shopping list against pantry/on-hand data | Nothing about pantry reconciliation | Downstream of DEC-071, two steps removed from DEC-069; also depends on `DEC-065`, not `DEC-069` | No | Not related — no edge |
| `DEC-073` | Adapting shopping guidance to a disclosed budget | Nothing about budget | No overlap; depends on `DEC-072`, `DEC-064` | No | Not related |
| `DEC-074` | Adapting shopping guidance to store-availability, routing substitutions through `DEC-063` | Nothing about availability | No overlap; depends on `DEC-072`, `DEC-063` | No | Not related |
| `DEC-075` | Minimizing shopping-trip frequency/complexity (`App Priority: FUTURE FEATURE`) | Nothing about trip minimization | No overlap; depends on `DEC-072`–`074` | No | Not related |

**Summary:** DEC-069 has exactly two *formal* relationships in the entire 112-decision model (`DEC-066 →
DEC-069 → DEC-071`), both `REQUIRED`. Every other decision in this table is either upstream of DEC-066
(irrelevant to DEC-069 directly), a same-Domain-L sibling with no shared edge (`DEC-067`, `DEC-068`,
`DEC-070`), or downstream of DEC-071 (two steps removed). The only genuinely nuanced boundaries are
**DEC-063** (substitution — a routing rule for a hypothetical future case, §11) and **DEC-065/DEC-072**
(pantry — a terminology distinction that matters because DEC-069's own decision text uses the word
"storage," which is not the same thing as pantry/on-hand inventory — see §13).

---

## 5. What DEC-069 Actually Controls

**Answering directly, per the task's framing:** *What decision does DEC-069 make that no adjacent
decision already makes?*

DEC-069 decides **whether, and how, a meal-plan structure accounts for the fact that food preparation
does not have to happen fresh, once, per single sitting** — specifically: whether one preparation event
can produce more than what is eaten immediately (batch cooking), whether food not eaten immediately is
carried forward and re-incorporated into a later planned meal (leftovers), and whether/how the meal-plan
structure represents the storage state that makes carrying food forward safe and planned (storage). No
other decision in the model asks this question:

- `DEC-066` decides how *one* meal gets constructed from selected foods — it has no concept of "this
  meal produces enough for three more days."
- `DEC-067` decides how much *preparation detail* is shown for one meal — it never asks whether that
  meal is eaten once or five times.
- `DEC-068` decides whether *one* meal is feasible given skill/time/equipment — a per-sitting adjustment,
  not a multi-day structural one.
- `DEC-070` decides how to react *after* a deviation from plan already happened — DEC-069 is about
  shaping the plan itself, proactively, before any deviation occurs.
- `DEC-071` assumes a finished, batching-aware plan already exists and only translates it into a
  shopping list — it does not decide *whether* batching happened.

**Exact control boundary:** DEC-069's authority begins where `DEC-066` produces one constructed meal and
ends where `DEC-071` needs a finished multi-day, batching-aware structure to consolidate. Within that
window, DEC-069 owns: (a) whether a single preparation event's *output quantity* can exceed what is
needed for the meal it was originally constructed for, (b) whether that surplus is represented as
carrying forward to specific future planned meals (leftovers), and (c) whether/how the storage
conditions and duration that make that carry-forward safe are represented in the plan. It does **not**
own *how much* to produce (a scaling/yield mechanism — §6), *who* it's for (a personalization question —
§12), or *what specific food* is prepared (`DEC-066`'s job, unaffected).

---

## 6. Scaling / Yield / Portion / Batch Analysis

The task correctly warns against collapsing these into one concept. Each is classified independently
against DEC-069's own decision text and the evidence in §7/§10.

| Concept | Classification | Evidence / reasoning |
|---|---|---|
| **Recipe/batch scaling** (ingredient quantities change when target quantity changes) | **CORE TO DEC-069** | This is the mechanical enabling step for "batch cooking" — DEC-069's own decision text. `ON_COOKING_7E_EXECUTION_RECORD.md` line 81 explicitly labels DEC-069 "**Scaling / Adaptation**" in its own DEC-to-knowledge mapping table. Not owned by any other decision. |
| **Yield** (how many portions a meal/recipe produces) | **CORE TO DEC-069** | `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §14.1 classifies Yield as `FUTURE/OPTIONAL`, explicitly noting it "only becomes load-bearing if DEC-069's v1-necessity is answered 'yes.'" Yield is the concept scaling operates on. |
| **Serving multiplication** (one constructed meal becomes multiple servings) | **CORE TO DEC-069** | This is the simplest form of "batch cooking" in DEC-069's own text — producing more servings from one construction event than one sitting requires. |
| **Batch production** (bulk preparation) | **CORE TO DEC-069, with an internal split** | DEC-069's own decision text names "batch cooking" directly. However, the *scale* of batch production matters: household-scale batching (STRONG/ADEQUATE knowledge support) is categorically different from true quantity-food/restaurant-scale production (confirmed **absent** from the corpus — a named, bounded limitation; §7). Both are "batch production" in casual language but are evidence-distinct. |
| **Multi-day meal prep** (one preparation event supplies multiple future `meal_entries`) | **CORE TO DEC-069** | DEC-069's own `Inputs` field is literally "DEC-066 constructed meals **across multiple days**," and its decision text names "leftovers... incorporated into a meal plan." This is DEC-069's defining case, not a related-but-separate concept. |
| **Household/user count** (adjusting construction based on number of people) | **UNKNOWN — REQUIRES HUMAN DECISION** | Not named anywhere in DEC-069's own decision text, and DEC-069's own `Personalization` rating is `LOW` — inconsistent with treating household size as a core, load-bearing input. Confirmed absent from the codebase (§8 — no household-size field exists anywhere; every "household" reference in the entire repository is the multi-tenant `household_id` scoping key, not a person-count). Plausible as a future extension if scaling is ever built, but not established by the record itself. |
| **Portion conversion** (ingredient quantities corresponding to a target portion) | **CORE TO DEC-069 — with a reported terminology collision** | On Cooking 7e's "portion conversion" (Ch.4, cited under DEC-069's own knowledge-support line) is the same mechanism as scaling/yield above, applied per-portion rather than per-batch — core to DEC-069. **However**, `APP_DECISION_GAPS.md` line 364 uses the *same word* "Portion/Quantity" for a **different, Domain-K concept** (`DEC-060`/`DEC-062`'s food-selection quantity, NUT-04's exchange-list methodology) — this is not DEC-069's territory at all. Flagged as a terminology collision between two unrelated decisions, not resolved here (§18). |
| **Storage/inventory** | **SPLIT — see below** | DEC-069's own text names "storage" directly, but two distinct meanings exist and must not be collapsed (§13): |

**Storage split, made explicit:**

- **Storage as shelf-life/preservation guidance for an already-prepared batch** (how long can this
  cooked meal safely keep; refrigeration/freezing guidance) — **CORE TO DEC-069**. Knowledge-support is
  rated `ADEQUATE` (§7); this is what DEC-069's own text means by "storage."
- **Storage/pantry as on-hand raw-ingredient inventory** (what foods does the user already have before
  shopping) — **DEC-069 OUT OF SCOPE, belongs to `DEC-065`/`DEC-072`.** `DEC-065`'s own decision text
  ("the user's existing grocery/pantry data... incorporated into food-*selection* decisions") and
  `DEC-072`'s ("reconciled with what the user already has on hand") both explicitly own this concept.
  Confirmed by code (§8): no pantry/inventory mechanism of any kind exists in the repository regardless
  of which decision would eventually own it.

---

## 7. Knowledge-Layer Analysis

Cross-checked across `APP_DECISION_KNOWLEDGE_MAPPING.md`, `APP_DECISION_GAPS.md`, and Phase 8's three
On Cooking 7e artifacts.

**A. Knowledge-supported (STRONG/ADEQUATE, no gap):**
- Recipe scaling / yield conversion — `STRONG` (`ON_COOKING_7E_EXECUTION_RECORD.md` line 66: "Chapter 4
  explicitly covers measurement/conversion, recipe yield and portion conversion, conversion factors,
  yield tests, and large recipe changes").
- Portioning — `ADEQUATE` (line 67: "Standardized recipe portion sizes, yield, serving counts, and
  portion conversion are explicit").
- Storage (shelf-life/preservation sense only, §6) — `ADEQUATE` (line 69: "Food safety/sanitation and
  preservation sections cover refrigeration, freezing, storage separation, reheating, and preservation
  methods").

**B. Knowledge-thin (conceptually supported, insufficiently operationalized):**
- Batch-size effects at household/small-commercial scale — `PARTIAL` (line 68: "Large-batch conversion
  examples, batch-size effects, sauce/bakeshop batch guidance, and yield calculations are present," but
  "Quantity-food production and restaurant operations are not established as a full v1 knowledge
  system").
- Nutrient retention across a storage window — explicitly **untested**, not merely thin: Usability
  assumption **U6** in `PRACTICAL_TRANSLATION_ANALYSIS.md` line 504: "Batch cooking behaves
  nutritionally like fresh cooking across a storage window (`DEC-069`)... **Untested**." Corroborated by
  `CULINARY_SOURCE_EXTENSION.md` line 70: the term "nutrient retention" scores **zero hits** across the
  entire admitted corpus.

**C. Knowledge-absent (genuinely requires additional source material):**
- True quantity-food / restaurant-scale batch production — confirmed **absent**, not merely thin.
  `CULINARY_SOURCE_EXTENSION.md` line 124: "Batch preparation | **Absent** (0 hits)." This was a **named,
  bounded, pre-anticipated limitation** — flagged in that same document (line 175–179) *before* the
  source was even acquired, and confirmed rather than newly discovered upon inspection
  (`PRACTICAL_TRANSLATION_ANALYSIS.md` §11.2). Texts that do cover it properly (e.g. *Food for Fifty*)
  are quantity-production/operations texts explicitly excluded by this project's own source-selection
  criterion C5 (line 176–177).

**D. Product-only (not a knowledge gap, an application/product-architecture decision):**
- Whether Grocery v1 needs *any* batching/multi-day/storage capability at all. `PROJECT_STATUS.md` lines
  148–153 already frames this precisely: *"whether DEC-069 genuinely needs restaurant-scale batch
  production for v1... answering 'yes' would reopen a knowledge question and likely warrant a future
  gate; 'no' simply confirms the existing bounded limitation as [acceptable for v1]."* This is squarely
  a product decision, not resolved by more knowledge-gathering.
- Whether household-size-based scaling (§6) is wanted — not a knowledge gap (the knowledge is `STRONG`);
  purely a product-scope question.

**E. Evidence gap (requires current evidence or external standards):**
- None identified requiring literature/guideline research. `DEC-069`'s own record states `Current
  Evidence Required?: NO`, and this investigation found no reason to dispute that — the open questions
  above (U6's nutrient-retention assumption) are a *within-corpus* untested assumption, not a call for
  new external evidence gathering. This is recorded as an uncertainty (§18), not as a formula or
  coefficient to invent — no nutrient-retention multiplier is proposed anywhere in this document.

**Formal classification** (per `APP_DECISION_GAPS.md` line 221 and `APP_DECISION_KNOWLEDGE_MAPPING.md`
line 491): `DEC-069` is `NOT COVERED` / `GAP-A` at the pure curriculum-topic level (no counterpart among
the 213 knowledge-topic IDs — expected, since the seven-book nutrition-science corpus was never going to
teach batch cooking), while the separately-admitted On Cooking 7e corpus (Phase 8) closes most of that
gap at the *culinary* layer, leaving only the product-decision and the restaurant-scale sub-question
open. Both classifications are correct simultaneously, at different layers — not a contradiction.

---

## 8. Current Application Capability

Full code trace performed (via a dedicated Explore subagent) across `MealFoodPicker.tsx`,
`MealPlanView.tsx`, `TodayView.tsx`, `combos.ts`, `comboMatch.ts`, `mealPlan.ts`, `localMealPlan.ts`,
`nutrition.ts`, `foodIdentity.ts`, `listActions.ts`, `meal-entries.ts`, `personal-plan.ts`,
`data/combos.json`, `data/README.md`, and every `supabase/*.sql` migration, plus a repo-wide grep for
yield/portion/serving/scale/batch/multiplier/pantry/inventory/storage/leftover/household.

**Finding: DEC-069 has zero code footprint**, in every one of the six areas the task asked about:

| Capability | Existing? | Evidence |
|---|---|---|
| Recipe/batch scaling, yield, serving multiplication | **MISSING** | `Combo` (`combos.ts:1-10`) and `MealEntry`/`MealItem` store only fixed absolute gram quantities. The only "scale" function in the codebase, `scaleNutrition()` (`mealNutrition.ts:19-31`), is a per-100g→per-gram **unit conversion** (`factor = quantityG/100`), not a servings/batch multiplier. |
| Multi-day meal-prep (one event → many future `meal_entries`) | **MISSING** | `createMealEntry()` (`mealPlan.ts:76-101`) and `handleCreate()` (`meal-entries.ts:119-213`) each insert exactly one row per call — no bulk-create path exists anywhere. |
| Household/user-count-based quantity adjustment | **MISSING** | No column, type, or variable anywhere represents a person-count. `08-personal-plan.sql:6-9` explicitly documents the profile as *per-person, not per-household* ("a household can have multiple invited members") — reinforcing that every other "household" reference in the codebase (~90+ hits) is the multi-tenant `household_id` scoping key, never a family/group size. |
| Portion conversion | **MISSING** | `NutritionCompareView.tsx:21` contains a comment explicitly *denying* the feature: "no serving-size input." |
| Pantry/inventory (on-hand food tracking) | **MISSING** | `listActions.ts` only adds/removes/checks off shopping-list items; no "already have N in stock" logic exists. The single `pantry` string in the whole repo (`categorization/categories.ts:378`) is a comment naming a shopping-item *category bucket* ("grains & pantry heads"), not an inventory feature. |
| Storage/leftover/shelf-life tracking | **MISSING** | Every `storage`-matching hit in `src/` is the `localStorage` browser API's key-naming convention (`useMealPersonalization.ts:12`, `useOnboarding.ts:3`, `preferences.ts:3`) — unrelated to food storage. Zero hits for `leftover` anywhere in `src/` or `supabase/`. |

**The one adjacent, non-qualifying artifact:** `TodayView.tsx`'s `preparingIds` "Hazırlanıyor" (I'm
cooking this) toggle (line 70) is explicitly documented in its own code comment as *"Purely a visual
'I'm cooking this right now' flag — no timer, no backend write, resets on reload. A real cook-time
tracker is a later idea, not this one."* This is the closest thing to a "cooking event" concept anywhere
in the app, and its own comment disclaims exactly the persistence/multi-day capability DEC-069 would
require.

**Cross-reference with DEC-068's own code trace** (`DEC-068_INVESTIGATION.md` §5): both investigations,
performed independently, arrive at the same underlying fact about the codebase — the entire
meal-planning data model (`Combo`, `MealEntry`, `MealItem`, `meal_entries`) is uniformly flat,
single-day, and fixed-absolute-gram-quantity. Neither DEC-068's constraint-matching nor DEC-069's
batching/scaling has any existing hook to build on; the two decisions are independently unimplemented,
not partially-shared.

---

## 9. Current Data Model

| Type/table | Fields | Yield/serving/batch field? | Household-size field? |
|---|---|---|---|
| `Combo` (`src/lib/combos.ts`) | `id, nameTr, items:[{foodId,grams}], prepMinutes, tags, prepNote?` | No | No |
| `MealEntry`/`MealEntryRow` (`src/lib/mealPlan.ts`) | `id, date, slot, foodId, quantityG, position, comboId` | No | No |
| `MealItem` (`src/lib/localMealPlan.ts`) | `id, foodId, quantityG, comboId?` | No | No |
| `meal_entries` (`supabase/07-meal-entries.sql` + `12-meal-entries-combo-id.sql`) | `id, household_id, date, slot, food_id, quantity_g, position, created_at, combo_id` | No | No (`household_id` is the tenant key, not a person-count) |
| `Nutrition` (`src/lib/nutrition.ts`) | `name_tr, food_id?, kcal_per_100, protein_g, fat_g, carbs_g, fiber_g, aliases?, allergen_classes?` | No | N/A |
| `personal_plan` (`supabase/08-personal-plan.sql`, `09-personal-plan-user-scoped.sql`) | `user_id, name, equation_sex, age_years, height_cm, weight_kg, activity, goal, waist_cm, excluded_food_ids, food_exclusions, allergen_class_exclusions` | No | No — explicitly documented as per-person, not per-household (`08-personal-plan.sql:6-9`) |

**Conclusion, matching `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §14.1's own classification:**
Yield is `FUTURE/OPTIONAL` — confirmed absent from every table and type above, exactly as that document
already concluded before this investigation re-verified it independently.

---

## 10. Nutrition Boundary

The governing distinction (`PROJECT_AI_PROTOCOL.md` §5) is preserved and applied precisely:

```text
Food composition ≠ Food selection ≠ Meal construction ≠ Nutrition calculation ≠ Prescription
                                                         ≠ Recipe/meal construction ≠ Scaling ≠ Portioning
```

**Key finding: nutrition-calculation infrastructure requires zero changes to support any scaling DEC-069
might introduce.** `mealNutrition.ts`'s `scaleNutrition()` already computes nutrition **proportionally to
any gram amount** (`factor = quantityG / 100`) — it has no notion of "this gram amount came from
multiplying a base recipe by 3," and does not need one. If a future DEC-069 implementation scales a
`Combo`'s `items[].grams` by some factor before the meal is logged, the existing calculation function
will compute the correct proportional nutrition for the new, larger gram amount with no modification.
**The entire gap is one layer up: deciding what the new gram amount should be** (a scaling/yield
decision — DEC-069's actual territory), not how to compute nutrition once it's decided (already solved).

Working through the specific questions the task poses:

- **Is a scaled-up ingredient list merely a recipe transformation?** Yes — multiplying every
  `items[].grams` value by a scale factor is a deterministic, mechanical transformation of DEC-066's
  output. It does not, by itself, invoke any new decision logic beyond "what is the scale factor,"
  which is exactly what DEC-069 (or a future option chosen under it) would need to specify.
- **Does nutrition need recalculation?** Yes, but only as a mechanical re-application of the *existing*
  `scaleNutrition()` function to the new gram amounts — not new calculation logic.
- **Does the target nutrition change?** No. The user's per-occasion or daily macro/kcal target (Domain
  D/E/F, `DEC-017`–`040`) is entirely unaffected — DEC-069 only concerns how much of a given, already-
  targeted meal gets physically prepared and when it's eaten, not what the target itself is.
- **Does the prescription change?** No, for the same reason.
- **Is this a new decision, or merely deterministic translation once decided?** The *scaling
  arithmetic itself* is deterministic translation (no new decision needed once a scale factor and
  target are known). **What DEC-069 actually decides is whether that translation happens at all, and
  under what product-level rules** (household-scale only? multi-day? restaurant-scale?) — that
  higher-level question is the genuine decision; the arithmetic under it is not.

No existing DEC's nutrition-calculation ownership is duplicated or reassigned by this analysis.

---

## 11. Food Identity and Safety Boundary

**Canonical Food Identity:** any linear scaling of `items[].grams` leaves `items[].foodId` **completely
unchanged** — the set of foods in a meal does not change, only the quantity of each. `foodIdentity.ts`'s
resolution chain (`food_id → canonical name → unique alias → AMBIGUOUS/UNKNOWN`) is invoked identically
regardless of gram amount; scaling introduces no new identity-resolution surface at all.

**Allergen safety (B3 hybrid food-level + allergen-class exclusion):** exclusion filtering
(`comboMatch.ts`'s hard/soft tiering) happens **at combo-selection time**, before any hypothetical
scaling would occur. Since scaling never changes *which* foods are present, a combo that already passed
exclusion filtering remains excluded-clean after scaling — **no new exclusion re-evaluation is
required**, provided (critical invariant, stated in the task and reaffirmed here): **any future DEC-069
transformation must not substitute or add foods**, only multiply existing, already-filtered quantities.
The moment a hypothetical implementation introduces substitution (e.g., "swap food X for something that
stores better"), that crosses into `DEC-063`'s territory and must route through its existing
nutrient-preservation/substitution logic — **not** a new DEC-069-specific substitution mechanism. This
mirrors the identical rule already established in `DEC-068_INVESTIGATION.md` §9 (Option 3) for a
different hypothetical case.

**Preferences/intolerance (hard vs. soft):** same reasoning — hard exclusions remain hard, soft
(intolerance) de-prioritization remains soft, across any pure-quantity scaling, since neither depends on
gram amount, only on food identity.

**Stated invariant, satisfied by construction for every option in §16 that does not introduce
substitution:** *"Any future DEC-069 transformation must not bypass existing Food Identity resolution or
hard/soft exclusion precedence."* Confirmed: none of the options analyzed in §16 requires bypassing
either mechanism. If a future implementation ever proposed doing so, it would be classified **unsafe**
per this document's own instruction.

---

## 12. Personalization

DEC-069's own Inventory record states `Personalization: LOW, Longitudinal Data Required: NO`. Working
through the task's candidate inputs:

| Candidate input | Classification | Reasoning |
|---|---|---|
| Household size | **Future capability** | Plausible for a "scale to serve N people" feature, but not named in DEC-069's own text, not tracked anywhere in the codebase (§8), and inconsistent with a `LOW` personalization rating if treated as a core requirement. |
| Target servings | **Future capability** | Same reasoning — a product-level input a scaling feature would need, not something DEC-069's record establishes as required today. |
| Meal frequency | **Unrelated** | Governed by `MEAL_SLOTS`/Domain L's existing meal-structure decisions, not DEC-069. |
| Meal schedule | **Unrelated** | Same. |
| Storage capacity | **Optional** | Relevant only if a future implementation wanted to reason about *how much* can physically be batched — not established as required by DEC-069's own record, which asks only whether/how batching is incorporated, not how much storage space exists. |
| Equipment | **Unrelated to DEC-069 — explicitly DEC-068's deferred territory** | See §14. |
| Time | **Unrelated to DEC-069 — explicitly DEC-068's deferred territory** | See §14. |
| Pantry state | **Unrelated** | `DEC-065`/`DEC-072`'s territory (§6, §13), not DEC-069's. |
| User preference | **Unrelated** | Governed by existing exclusion/preference mechanisms (§11), unaffected by scaling. |
| Dietary pattern | **Unrelated** | Same. |
| Nutrient targets | **Unrelated** | Untouched by DEC-069 (§10). |

**No personalization requirement beyond DEC-069's own `LOW` rating is invented here.** The `Personalization:
LOW`/`Longitudinal Data Required: NO` fields are not altered by this investigation, per instruction.

---

## 13. Shopping / Pantry Consequences

**Deterministic translation vs. actual decision logic, kept separate as instructed:**

- **Real, already-formally-mapped consequence:** `DEC-069 → DEC-071` is a `REQUIRED` edge (§3) — whatever
  batching-aware structure DEC-069 produces, `DEC-071`'s shopping-list consolidation **must** consume it
  rather than a plain single-day meal list. This is not speculative; it is already recorded in the
  formally-maintained Dependency Graph, independent of which option (§16) is eventually chosen. If
  DEC-069 is deferred (Option 1), `DEC-071` simply continues consuming single-day `DEC-066` output as it
  already does today — no change to current shopping behavior.
- **Deterministic translation, not new decision logic:** once a batching-aware structure exists,
  aggregating its (already-scaled) quantities into a shopping list is the same consolidation arithmetic
  `DEC-071` already needs to perform for a plain multi-meal day — no new decision is required for the
  aggregation step itself.
- **Explicitly NOT part of DEC-069:** duplicate aggregation logic, Food Identity resolution at the
  shopping layer, and pantry reconciliation are all `DEC-071`/`DEC-072`'s existing or already-scoped
  responsibilities — DEC-069 does not need to (and should not) reimplement any of them.
- **Pantry/inventory consumption** (decrementing on-hand stock as a batch is prepared) is **not** part of
  DEC-069 — it would require the pantry/inventory concept that `DEC-065`/`DEC-072` own and that is
  confirmed absent from the codebase entirely (§8). A future DEC-069 implementation must not silently
  invent pantry-consumption logic; that dependency, if ever needed, belongs to `DEC-065`/`DEC-072`'s own
  future scope.
- **Future meal entries:** if a batching-aware structure is ever implemented, whether it also needs to
  *pre-populate* future `meal_entries` rows (vs. merely informing the shopping list) is itself a
  DEC-069-scope product question, not a shopping question — addressed as part of the candidate options
  in §16, not assumed here.

**Reported, not resolved:** `DEC-065`'s own Inventory note claims *"this app already tracks a
household's grocery list/pantry"* (`APP_DECISION_INVENTORY.md` line 1099–1100). Both this investigation
and `DEC-068_INVESTIGATION.md` (§5, §13) independently confirm by direct code trace that **no pantry/
on-hand-inventory mechanism exists anywhere in the codebase** — only a shopping *list* (checked/unchecked
items) exists, which is not the same as pantry state. This is a pre-existing Inventory-vs-code
discrepancy, orthogonal to DEC-069 itself; flagged here because it bears directly on §6/§13's
storage-vs-pantry boundary, but not corrected (out of this document's scope — `DEC-065` is not
DEC-069 and modifying the Inventory is explicitly prohibited).

---

## 14. DEC-068 Boundary

DEC-068 is ratified **CLOSED — DEFERRED FOR V1** (`00_PROJECT_CONTROL/DECISIONS/2026-09-09-dec-068-
deferred-v1-ratification.md`). This section demonstrates, not merely asserts, that DEC-069 does not
silently absorb any of its deferred functionality.

- **Cooking-skill matching remains deferred.** No candidate option in §16 requires or introduces a
  skill-level input, skill taxonomy, or skill-based filtering of any kind. Batch/multi-day scaling is a
  pure quantity transformation (§10) — it has no notion of "the user is a beginner cook."
- **Time-budget matching remains deferred.** No option in §16 compares a disclosed time budget against
  `prepMinutes` or anything else. `Combo.prepMinutes` remains exactly what DEC-067/068 already
  established it to be — informational display text, untouched by any scaling arithmetic.
- **Equipment matching remains deferred.** No option in §16 introduces an equipment-disclosure or
  equipment-matching mechanism.

**No conflict found.** DEC-069's own decision text (batch cooking, leftovers, storage) does not
logically require any of DEC-068's three deferred dimensions — a household could double a recipe and eat
the leftovers tomorrow without ever disclosing their skill level, available time, or owned equipment.
Had a conflict been found (e.g., if true batch production genuinely required equipment-capacity
awareness), this document would flag it rather than resolve it, per instruction — no such requirement was
found in any of the options constructed in §16.

**Cross-reference:** `DEC-068_INVESTIGATION.md` §15 already reasoned about this boundary from the other
direction (protecting DEC-069 from absorbing scaling concepts prematurely broached during that
investigation). This section confirms the boundary holds symmetrically.

---

## 15. Future Recipe / Batch Architecture

Concepts a fuller DEC-069 implementation might eventually require, classified against the current
architecture (cross-referenced with `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §14.1's existing
concept table, re-verified rather than merely cited):

| Concept | Classification | Reasoning |
|---|---|---|
| Recipe entity | **Belongs to another DEC** (`DEC-067`, already `EXISTING REPO CONCEPT` as `Combo`) | `Combo` already exists at the ingredient-list level (DEC-067 Level 1); DEC-069 would extend it, not replace or re-own it. |
| Recipe version | **Belongs to future architecture** | Not required by any option in §16 — no option needs to track edits to a recipe over time. |
| Yield | **Required for DEC-069** (if any scaling option is chosen) | Confirmed absent (§8, §9); becomes load-bearing only if Option 2, 3, or 4 (§16) is chosen — matches `PHASE_9...` §14.1's own conditional exactly. |
| Serving size | **Required for DEC-069** (same conditions as Yield) | The unit Yield is expressed in. |
| Portion | **Required for DEC-069, with the terminology caveat from §6** | Only in the recipe-yield sense; the unrelated Domain-K "portion" sense is not implicated. |
| Batch | **Required for DEC-069** (Option 3/4 only) | Not required for Option 1 (no-op) or Option 2 (single-sitting scaling only, no multi-day carry-forward). |
| Batch instance | **Belongs to DEC-069 implementation only** | A specific realized batch (this Tuesday's double recipe) — an implementation-time concept, not something this investigation needs to design. |
| Preparation state (cooked/raw) | **Belongs to future architecture** | Relevant only if nutrient-retention-during-storage (U6, §7) is ever modeled quantitatively — explicitly not attempted here; no coefficient is invented. |
| Storage state | **Required for DEC-069** (Option 3/4 only) | Needed to represent "this batch is refrigerated, good until date X" — the storage half of DEC-069's own decision text. |
| Multi-serving meal | **Overlaps with Yield** | Not a separate concept — the same thing Yield represents, from the consumption side rather than the production side. |
| Scaled ingredient set | **Derived concept** | Once Yield exists, a scaled ingredient set is `Combo.items[] × scaleFactor` — a computed value, not new persisted state, consistent with §10's finding that scaling is deterministic translation once decided. |

**No schema is proposed or created**, per instruction — this table classifies concepts abstractly, the
same way `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §14.1 already does for the rest of the model.

---

## 16. Candidate Decision Options

DEC-069 is genuinely unresolved (confirmed by §7–§9: no implementation, a `LOW`-personalization/
`OPTIONAL`-priority record, and a knowledge base that is strong for most of what it would need but
confirmed absent for its largest possible scope). The following options are constructed from the
evidence above — not manufactured to pad the table — and mirror the three-tier structure Phase 9's own
§16.3 already sketched, refined with this investigation's code-level and knowledge-level findings.

### Option 1 — Defer DEC-069 for v1 (status quo, explicit)

**Product behavior:** Unchanged — no scaling, no batching, no multi-day carry-forward of any kind.
**Inputs:** None new.
**Data model:** None new.
**Calculation:** None new — `mealNutrition.ts` untouched.
**Nutrition:** No change to composition, targets, or calculation.
**Safety:** No change; existing exclusion filtering continues exactly as-is.
**Food Identity:** No change.
**Shopping:** `DEC-071` continues consuming plain single-day `DEC-066` output, as today.
**Personalization:** None added.
**Complexity:** None — zero new architecture.
**Risks:** None introduced. The only "risk" is the pre-existing, already-named limitation (no
batch/leftover support) remaining unaddressed indefinitely.
**Dependencies affected:** None.
**DEC-068 interaction:** None — trivially satisfies §14.
**DEC-069 boundary:** Fully within scope — this *is* one of DEC-069's own legitimate answers ("not
relevant" is explicitly part of DEC-069's own decision text: "...when relevant").
**Future extensibility:** Leaves every option below fully available later; nothing is foreclosed.

### Option 2 — Household-scale recipe scaling only (single sitting, no multi-day storage)

**Product behavior:** A user could scale a `Combo` up or down (e.g. "serves 4" → "serves 2" or "serves
6") for a single meal, eaten at one sitting. No leftover carry-forward, no storage representation.
**Inputs:** A target serving count or scale factor, disclosed at the point of selecting a combo.
**Data model:** Add a `Combo.baseServings` (or equivalent Yield concept) — the smallest addition per
§9/§15's own conditional finding.
**Calculation:** `items[].grams × (targetServings / baseServings)`, then feed through the existing,
unmodified `scaleNutrition()` (§10) — no new nutrition-calculation logic.
**Nutrition:** No change to targets/prescription; only the meal's own totals scale proportionally,
exactly as `mealNutrition.ts` already computes for any gram amount.
**Safety:** Exclusion filtering already happened before scaling (§11); scaling never changes which foods
are present, so no re-evaluation is needed.
**Food Identity:** Unaffected — `foodId`s unchanged (§11).
**Shopping:** `DEC-071` would consolidate the scaled quantities instead of the base ones — a mechanical
extension of its existing aggregation logic (§13), not a new decision.
**Personalization:** Minimal — only a per-selection target-serving input, consistent with DEC-069's own
`LOW` rating.
**Complexity:** Low — one new field, one deterministic multiplication step, reuses every existing
calculation/filtering/identity mechanism unchanged.
**Risks:** Low. The main risk is scope creep toward Option 3 if "serves more than needed" implicitly
invites a "what happens to the extra" question — should be explicitly out of scope if this option is
chosen.
**Dependencies affected:** `DEC-071` (mechanical extension only, per above).
**DEC-068 interaction:** None (§14).
**DEC-069 boundary:** Stays within scope — this is "batch cooking" in its smallest form (more servings
than one sitting needs), without yet deciding what happens to the surplus.
**Future extensibility:** A clean subset of Option 3 — nothing here would need to be redone if the
product later grows into multi-day meal-prep.

### Option 3 — Multi-day meal-prep / batch cooking (make-ahead across several days, storage-aware)

**Product behavior:** A user could prepare a batch once and have it appear as pre-planned meals on
multiple future days, with the plan aware that those meals came from stored, previously-cooked food
rather than fresh preparation each time.
**Inputs:** Everything Option 2 requires, plus a target day-count/date-range and (optionally) storage
guidance surfaced to the user (e.g. "keeps refrigerated for up to N days" — sourced from On Cooking 7e's
`ADEQUATE`-rated storage/preservation content, §7).
**Data model:** Yield (as in Option 2) plus a storage/preservation metadata concept (§15) and a
mechanism to generate multiple future `MealEntry`/`meal_entries` rows from one preparation event — the
one genuinely new *mechanism* (not just a field) this option requires, since §8 confirmed no bulk-create
path exists anywhere today.
**Calculation:** Same deterministic scaling as Option 2, applied once and distributed across the target
day-range; no new nutrition-calculation logic.
**Nutrition:** Same as Option 2, per day's worth of the batch — **with the caveat that U6's nutrient-
retention-across-storage assumption remains untested** (§7). This option would rely on that assumption
without additional evidence unless the human reviewer treats it as a blocking concern.
**Safety:** Same invariant as Option 2 (§11) — the batch's food set is fixed at preparation time;
exclusion filtering already applied at selection remains valid across every future day the batch
supplies, provided no substitution is introduced.
**Food Identity:** Unaffected, same reasoning as Option 2.
**Shopping:** `DEC-071` consumes the full batching-aware structure this option produces — the real case
the `DEC-069 → DEC-071 REQUIRED` edge (§3) anticipates.
**Personalization:** Slightly higher than Option 2 (a date range/day-count is more personalization
surface than a single serving count), but still consistent with `LOW` if kept to explicit user input
rather than inferred behavior.
**Complexity:** Moderate — the multi-row-generation mechanism is new architecture, not merely a new
field; this is the first option requiring genuinely new backend behavior (§8 confirmed today's API only
ever inserts one row per call).
**Risks:** The untested U6 nutrient-retention assumption (§7); scope risk of drifting toward a full
recipe/meal-prep subsystem if not bounded explicitly to household-scale (see Option 4's contrast).
**Dependencies affected:** `DEC-071` (real consumer of the full structure, not just a mechanical
extension).
**DEC-069 boundary:** Fully within scope — this is DEC-069's own "Inputs: DEC-066 constructed meals
across multiple days" and "leftovers... incorporated into a meal plan" language, directly.
**Future extensibility:** Does not require or preclude restaurant-scale production (Option 4) — stays
within Phase 8's already-established `ADEQUATE`/`STRONG` knowledge boundary (§7), per
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §16.3's own explicit "without assuming the largest one"
framing.

### Option 4 — True restaurant/professional-scale batch production

**Product behavior:** Grocery would support quantity-food production planning at a scale beyond
household meal-prep (e.g., feeding many people, commercial-style batch conversion).
**Inputs, data model, calculation:** All of Option 3's requirements, plus quantity-food-specific
conversion factors and batch-scaling methodology that **the admitted corpus does not contain** (§7 — a
confirmed, named absence, not a thin coverage).
**Nutrition/Safety/Food Identity:** Same mechanisms as Options 2/3 in principle, but at a scale where
food-safety/storage guidance may need depth beyond what On Cooking 7e's `ADEQUATE` (household/
small-scale) rating was verified to cover.
**Shopping:** Same `DEC-071` relationship as Option 3, at larger quantities.
**Personalization:** Likely exceeds `LOW` if commercial-scale planning requires additional operational
inputs (equipment capacity, throughput) — though this document does not assume that; it depends entirely
on what a future evaluation would find necessary.
**Complexity:** Highest of all four options.
**Risks:** **This is the one option Phase 8's own governance explicitly flags as reopening a knowledge
question, not just a product one.** `PRACTICAL_TRANSLATION_ANALYSIS.md` §11.2: *"If Phase 9 determines
batch production is load-bearing for v1, that determination is what would warrant a gate."*
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §16.3: *"this becomes the first candidate for a
Gate-7-adjacent review."* Choosing this option is **not** a simple product decision like the other
three — it carries a **process consequence** (likely triggering a new gate and potentially a ninth
source-book admission) that the human reviewer should weigh explicitly, not discover after the fact.
**Dependencies affected:** Same as Option 3, at larger scope.
**DEC-068 interaction:** None directly, though at commercial scale "equipment" starts to sound
DEC-068-adjacent — flagged as a boundary to watch, not a current conflict (no option here requires
resolving it).
**DEC-069 boundary:** Technically within DEC-069's literal text ("batch cooking"), but at a scale Phase 8
never evaluated as in-scope merely because the source book contains professional-kitchen chapters — the
project's own standing rule (`CULINARY_SOURCE_EXTENSION.md` §5 rule 4): "chapters existing ≠ chapters in
scope."
**Future extensibility:** Not recommended as a v1 starting point (see §17) precisely because of the gate
consequence above — recorded as a genuine option, not a disqualified one, since the human reviewer may
have context (e.g. a demonstrated user need) this document cannot see.

---

## 17. Human Decision Package

### Exact question

Should Grocery v1 support any form of batch cooking, leftover carry-forward, or storage-aware multi-day
meal planning (DEC-069) — and if so, at what scope (household-scale single-sitting scaling only;
multi-day meal-prep with storage awareness; or true restaurant/professional-scale batch production,
which would likely reopen a knowledge question and warrant a new gate) — or should it remain deferred for
v1, as DEC-068 was?

### Current state

Nothing is implemented (§8, confirmed by full code trace). The entire meal-planning data model (`Combo`,
`MealEntry`, `meal_entries`) is flat, single-day, and fixed-absolute-gram-quantity. No Yield, serving,
batch, household-size, pantry, or storage concept exists anywhere in the codebase or schema.

### Options

See §16 in full. Summarized:

1. **Defer for v1** — no change, matches `App Priority: OPTIONAL` and the immediately-preceding DEC-068
   precedent.
2. **Household-scale recipe scaling only** — smallest genuine capability; single sitting, no
   leftover/storage representation; reuses all existing calculation/safety/identity mechanisms
   unchanged.
3. **Multi-day meal-prep / batch cooking, storage-aware** — DEC-069's own literal definition, fully
   within Phase 8's `ADEQUATE`/`STRONG` knowledge boundary; the first option requiring genuinely new
   backend architecture (multi-row generation).
4. **True restaurant/professional-scale batch production** — the one option confirmed to reopen a
   knowledge question and likely require a new gate; not recommended as a default v1 starting point, but
   reported as a genuine option per the task's instruction not to force smaller options if evidence
   doesn't support them.

### Recommended option

> **FOR HUMAN REVIEW — NOT RATIFIED.**

Evidence-based reasoning, per the task's explicit requirements:

- **Why the recommendation fits DEC-069's actual definition:** Option 2 (or, if the reviewer wants
  DEC-069's literal multi-day/leftover language fully realized, Option 3) is the smallest option that
  genuinely satisfies the TRANSLATION decision type and the "batch cooking... incorporated into a meal
  plan" text, without inventing capability DEC-069 never asked for.
- **Why it does not duplicate another DEC:** Option 2/3 introduce no skill/time/equipment matching
  (DEC-068, deferred — §14), no substitution mechanism (DEC-063's territory — §11), no pantry/inventory
  tracking (DEC-065/072's territory — §13), and no new shopping-consolidation decision logic beyond
  `DEC-071`'s already-scoped, already-formally-connected role (§3, §13).
- **Why it is proportionate to Grocery's v1 scope:** `App Priority: OPTIONAL` and `Personalization: LOW`
  both argue against the largest option (4) as a default; Option 2/3 stay entirely within knowledge the
  corpus already rates `STRONG`/`ADEQUATE` (§7), avoiding the gate-triggering consequence Option 4
  carries.
- **If the reviewer prefers no v1 capability at all**, Option 1 (explicit defer) is recommended over
  silent neglect, mirroring the reasoning already applied to DEC-068 (`2026-09-09-dec-068-deferred-v1-
  ratification.md` §2) — an explicit decline is traceable and reversible; silently leaving DEC-069 open
  and unaddressed is not.
- **What this recommendation leaves unresolved:** which exact scope (2 vs. 3) is worth the added
  complexity of multi-row `meal_entries` generation; whether U6's untested nutrient-retention assumption
  needs to be resolved before Option 3 ships or can be accepted as a documented uncertainty;
  household-size-based scaling (§6, §12) if the reviewer wants it — not established as required by
  DEC-069's own record.
- **What it deliberately does NOT implement:** any part of Option 4 (restaurant-scale) by default,
  precisely because of the gate consequence in §16; any DEC-068 functionality (§14); any DEC-063
  substitution mechanism (§11); any DEC-065/072 pantry mechanism (§13).

### Consequences

| | Option 1 (Defer) | Option 2 (Single-sitting scaling) | Option 3 (Multi-day meal-prep) | Option 4 (Restaurant-scale) |
|---|---|---|---|---|
| Product | No change | User can scale one meal's servings | User can batch-cook across days, storage-aware | Commercial-scale planning |
| Architecture | None | Minor extension (Yield field + deterministic multiply) | New mechanism (multi-row `meal_entries` generation) | Largest — new knowledge source or explicit scope narrowing required |
| Data | None | +1 field (`baseServings`/Yield) | Yield + storage metadata | Yield + storage + quantity-food-specific fields (undefined without new source) |
| Nutrition | None | Reuses `scaleNutrition()` unchanged | Same, plus reliance on untested U6 assumption | Same, at a scale not evidence-verified |
| Safety | None | Preserved by construction (§11) | Preserved by construction (§11), provided no substitution is added | Same, but storage-safety depth at scale is less verified |
| Personalization | None | Minimal (target servings) | Low-moderate (date range) | Potentially higher (operational inputs) |
| Shopping | Unaffected | Mechanical extension of `DEC-071` | Real consumer of `DEC-069`'s output (§3, §13) | Same, larger quantities |
| Future extensibility | Fully open | Clean subset of Option 3 | Does not require Option 4 | Likely triggers a new gate (§16) |

### Explicit non-decisions

This Human Decision Package does **not** decide: which option (if any) is adopted; whether restaurant-
scale production is ever pursued; any DEC-068 reopening; any DEC-063/065/072 change; household-size
tracking as a product feature; any new DEC ID; any implementation, schema, API, or UI change; whether
U6's nutrient-retention assumption requires new evidence before shipping Option 3.

---

## 18. Open Questions / Uncertainty

1. **Terminology collision on "portion"** (§6): `APP_DECISION_GAPS.md`'s Domain-K "Portion/Quantity"
   concept (`DEC-060`/`062`, NUT-04 exchange lists) and On Cooking 7e's recipe-yield "portion conversion"
   (DEC-069's territory) use the same word for different concepts. Not resolved here — flagged for
   whoever next touches either document.
2. **Untested nutrient-retention-across-storage assumption (U6)** — `PRACTICAL_TRANSLATION_ANALYSIS.md`
   line 504 rates this "Untested," and `CULINARY_SOURCE_EXTENSION.md` confirms zero corpus hits for
   "nutrient retention." Any Option 3/4 implementation would rely on this assumption unless a future pass
   resolves it. No coefficient or retention rule is proposed here.
3. **DEC-065's Inventory note claiming existing pantry tracking** (§13) appears to overclaim relative to
   the confirmed code-level absence of any pantry/inventory mechanism — a pre-existing discrepancy,
   orthogonal to DEC-069, not corrected here (out of scope; `DEC-065` is not this document's subject).
4. **Whether household-size-based scaling should ever become part of DEC-069's scope** (§6, §12) — not
   established by DEC-069's own record (`Personalization: LOW`), not resolved here; flagged as a
   plausible but unconfirmed future extension.
5. **Whether Option 2 and Option 3 should be split into separate decisions** (mirroring the split
   consideration already flagged, but not acted on, for DEC-068 in `DEC-068_INVESTIGATION.md` §19) —
   not proposed here since it would require a new DEC ID, outside this document's authorization.

---

## 19. Investigation Conclusion

DEC-069 is a Domain L, TRANSLATION-type decision with exactly two formal dependencies
(`DEC-066 → DEC-069 → DEC-071`, both `REQUIRED`, both confirmed consistent between the Inventory and the
Dependency Graph — no discrepancy this time). It controls whether and how batch cooking, leftovers, and
storage are incorporated into a multi-day meal-plan structure — a distinct question from every
neighboring decision, most notably DEC-068 (per-meal skill/time/equipment adjustment, already CLOSED/
DEFERRED FOR V1 and confirmed not silently reopened by anything in this document, §14). The
scaling/yield/portion/batch/storage concept cluster decomposes cleanly: scaling, yield, serving
multiplication, batch production (at household scale), multi-day meal-prep, and the shelf-life sense of
storage are all core to DEC-069 and well-supported by the admitted On Cooking 7e corpus (`STRONG`/
`ADEQUATE`); household/user-count scaling is a plausible but unconfirmed future extension; portion
conversion is core but shares its name with an unrelated Domain-K concept; and pantry/inventory (the
on-hand sense of "storage") belongs to `DEC-065`/`DEC-072`, not DEC-069. True restaurant/professional-
scale batch production is the one sub-concept confirmed **absent** from the knowledge corpus and flagged
by Phase 8's own governance as likely to reopen a knowledge question and warrant a new gate if chosen.
No code capability exists for any part of DEC-069 today — the entire meal-planning data model is flat,
single-day, fixed-gram-quantity. Nutrition-calculation infrastructure requires no changes to support
scaling (`scaleNutrition()` already computes correctly for any gram amount); the actual gap is entirely
at the decision layer (what scale factor, for what purpose) DEC-069 itself owns. Four genuine options are
presented, with a recommendation — Option 2 or 3 if any v1 capability is wanted, Option 1 if not — FOR
HUMAN REVIEW, NOT RATIFIED. This document decides nothing; it prepares the decision.
