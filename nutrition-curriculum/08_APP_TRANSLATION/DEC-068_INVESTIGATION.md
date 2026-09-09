# DEC-068 Investigation — Skill/Time/Equipment Constraint Adjustment

**Document type:** Phase 9 investigation and Human Decision Package. **Investigation only — no
implementation, no resolution of DEC-068, no reopening of DEC-069.**
**Date:** 2026-09-09
**Status:** DEC-068 remains OPEN after this document. DEC-067 remains CLOSED (Level 1, ratified
2026-09-08) and is not reopened. DEC-069 remains OPEN and untouched.

---

## 1. Objective

Investigate `DEC-068` ("skill/time/equipment constraint matching") to the depth needed to produce a
Human Decision Package: recover its exact original definition, trace its dependencies, determine what
it actually controls (as distinct from neighboring decisions), audit the current codebase for any
existing capability that could satisfy it, and — only if genuinely unresolved, which this investigation
confirms it is — present candidate options for human review. This document does not select an option.

---

## 2. Exact DEC-068 Definition

Recovered verbatim from `APP_DECISION_INVENTORY.md` lines 1134–1145 (Domain L — Meal Planning and
Preparation):

> **Decision:** Determine how meal construction accounts for practical constraints such as cooking
> skill, available time, and equipment.
>
> **Domain:** L · **Decision Type:** ADJUSTMENT
>
> **Inputs:** DEC-067 output, disclosed skill/time/equipment constraints.
>
> **Output:** A constraint-adjusted meal construction.
>
> **Depends On:** DEC-067 · **Downstream Use:** DEC-070
>
> **Personalization:** MODERATE · **Longitudinal Data Required?:** NO · **Current Evidence
> Required?:** NO
>
> **Relevant Knowledge Domains:** UNKNOWN / NEEDS CONTENT REVIEW
>
> **Relevant Existing Topic IDs:** UNKNOWN / NEEDS CONTENT REVIEW
>
> **App Priority:** OPTIONAL
>
> **Notes / Uncertainty:** Same gap as DEC-067.

This original text is not reinterpreted in this section. Interpretation is deferred to §4.

---

## 3. Dependency Context

**The named chain, verified:**

```text
DEC-066 (meal construction)
   ↓ REQUIRED (dependency-graph line 439: "Preparation-detail level choice presumes a
   |           constructed meal already exists to describe")
DEC-067 (preparation-detail level) — CLOSED, ratified Level 1 (ingredient list + optional textual note)
   ↓ REQUIRED (dependency-graph line 440: "Constraint accounting operates at whatever
   |           detail level was chosen")
DEC-068 (skill/time/equipment adjustment) — OPEN, this investigation
   ↓ (see discrepancy below)
DEC-069 (batch/leftovers/storage) — OPEN, untouched, NOT actually downstream of DEC-068 (see below)
```

**What DEC-068 receives from DEC-066:** nothing directly — `APP_DECISION_DEPENDENCY_GRAPH.md` records
no `DEC-066 → DEC-068` edge. DEC-068's only recorded upstream dependency is DEC-067.

**What DEC-068 receives from DEC-067:** a chosen preparation-detail level and, since Level 1's ratification,
an ingredient list with quantities plus an optional free-text preparation note (`Combo.prepNote`). Per
`APP_DECISION_DEPENDENCY_GRAPH.md` line 440, this is a `REQUIRED` edge: "Constraint accounting operates at
whatever detail level was chosen."

**What DEC-068 produces:** per its own Output field, "a constraint-adjusted meal construction" — i.e. a
version of the DEC-066/067 output modified to fit disclosed skill/time/equipment limits.

**What DEC-069 expects from DEC-068:** **nothing, as a formal graph edge.** `APP_DECISION_DEPENDENCY_GRAPH.md`
records `DEC-066 → DEC-069` (line 441: "Batching/storage logic operates on constructed meals across days")
as DEC-069's only upstream dependency. There is no `DEC-068 → DEC-069` edge anywhere in the graph.

**Discrepancy found and reported, not silently resolved:** DEC-068's own inventory record states
"Downstream Use: DEC-070," but `APP_DECISION_DEPENDENCY_GRAPH.md` records DEC-070's dependencies as
`DEC-066, DEC-076` only (`APP_DECISION_INVENTORY.md` line 1166) — **no `DEC-068 → DEC-070` edge exists in
the formal graph.** A targeted search of `APP_DECISION_DEPENDENCY_GRAPH.md` for every line containing the
literal string `DEC-068` returns exactly one match (line 440, the `DEC-067 → DEC-068` edge already cited).
This is a bookkeeping inconsistency between the Inventory's informal "Downstream Use" annotation and the
formally maintained Dependency Graph — flagged per `PROJECT_AI_PROTOCOL.md` §3 ("if two sources conflict:
identify the conflict... report the inconsistency; do not silently overwrite the source of truth"), not
corrected here (this document is investigation-only and the Dependency Graph is out of scope to modify).

**Other decisions depending on DEC-068:** none found. No other line in `APP_DECISION_DEPENDENCY_GRAPH.md`
names DEC-068 as a dependency.

**Edge classification (the four named tiers):**

| Edge | Classification | Basis |
|---|---|---|
| `DEC-066 → DEC-067` | REQUIRED | Graph line 439 |
| `DEC-067 → DEC-068` | REQUIRED | Graph line 440 |
| `DEC-068 → DEC-070` (inventory-claimed) | **Not present in the graph** — cannot classify; see discrepancy above | — |
| `DEC-066 → DEC-069` | REQUIRED | Graph line 441 |

No CONDITIONAL, STRONGLY_RECOMMENDED, INFORMATIVE, or FEEDBACK edges involving DEC-068 were found.

---

## 4. Responsibility Boundaries

**What user-facing or application-level decision does DEC-068 actually control?**

DEC-068 controls exactly one thing: *whether and how an already-constructed meal (DEC-066's output,
described at whatever detail level DEC-067 chose) gets modified or filtered because the user cannot
realistically prepare it* — specifically because of their cooking skill, the time they have available, or
the equipment they own. It is an **ADJUSTMENT** decision type, not a SELECTION or TRANSLATION: it takes a
meal that already exists and asks whether it survives contact with practical reality, and if not, what
happens to it.

DEC-068 does **not** control:

- *what* level of preparation detail is shown (that is DEC-067 — a SELECTION about representation).
- *which* foods get selected in the first place (that is Domain K, `DEC-060`–`065`).
- *how* a meal plan is built from selected foods (that is DEC-066).
- *substituting* one food for another when unavailable or restricted (that is DEC-063).
- *batching, leftovers, or multi-day storage* (that is DEC-069).
- *shopping-list generation or consolidation* (that is `DEC-071`).

**Responsibility boundary table:**

| Decision | Owns | Does NOT own |
|---|---|---|
| `DEC-066` | Translating selected foods+portions into one constructed meal | Preparation detail level, constraint feasibility, substitution |
| `DEC-067` | **CLOSED.** How much preparation detail is exposed for a constructed meal (recipe/ingredient-list/general guidance) — a representation choice | Whether the meal is actually feasible for the user to make; any adjustment to the meal's composition |
| `DEC-068` | Whether/how a constructed meal is adjusted or filtered for disclosed skill/time/equipment limits | Detail-level representation (DEC-067); food substitution (DEC-063); batching/storage (DEC-069) |
| `DEC-069` | Incorporating batch cooking, leftovers, and storage across multiple days | Per-meal feasibility for a single sitting; skill/equipment matching |
| `DEC-063` | Generating a substitute food when one is unavailable or restricted | Adjusting for skill/time/equipment (a substitute could still be infeasible for the same reasons) |
| `DEC-061` | Filtering/hard-excluding candidate foods for allergy/intolerance/preference, upstream at food-selection time (Domain K) | Anything downstream of meal construction; not safety-adjacent to skill/time/equipment |
| `DEC-065` | Incorporating the user's existing pantry/grocery data into food selection | Constraint matching of any kind |
| `DEC-071` | Translating a meal plan into a consolidated shopping list | Meal-level feasibility |

**Ambiguity found, reported rather than resolved:** the boundary between DEC-068 and DEC-069 is not
perfectly crisp in the source documents. Both are Domain L, both are gated on "does the user have what
they need," and `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §16.3 groups them together as "Decision
Package C — Recipe Depth and Batch-Production Scope." The distinguishing line, as consistently stated
across `APP_DECISION_INVENTORY.md`, the DEC-067 ratification record, and §16.3, is: DEC-068 is about a
**single meal's** feasibility for **one person, one sitting** (skill/time/equipment); DEC-069 is about
**multi-day, multi-meal, or restaurant/professional-scale** production (batching, leftovers, storage,
scaling). This line is reported as the working boundary, not newly invented — it is fully derivable from
already-approved text — but no single sentence in the source documents states it this explicitly, so it is
recorded here as a clarification rather than as an authoritative restatement.

---

## 5. Current Implementation

**Finding, based on a full code trace (not filename inference) of `src/components/MealFoodPicker.tsx`,
`src/components/MealPlanView.tsx`, `src/components/TodayView.tsx`, `src/lib/combos.ts`,
`src/lib/comboMatch.ts`, `src/lib/mealPlan.ts`, `src/lib/localMealPlan.ts`, `src/lib/nutrition.ts`,
`src/lib/foodIdentity.ts`, `src/lib/listActions.ts`, `netlify/functions/meal-entries.ts` (the only Netlify
function touching meal entries or combos), `data/combos.json`, and every `supabase/*.sql` file:**

**DEC-068 has zero code footprint.** Specifically, confirmed absent everywhere in the repository:

- No field on any type, table, or user profile representing cooking skill level.
- No field representing available kitchen equipment.
- No field representing a user-disclosed time *budget* (as opposed to a combo's own fixed `prepMinutes`
  display value).
- No comparison, filter, sort, or scoring logic anywhere that reads skill, equipment, or a disclosed time
  budget.
- No UI surface where a user discloses skill, equipment, or a time budget.

**What does exist, and why it does not satisfy DEC-068:**

| Existing artifact | What it is | Why it is not DEC-068 |
|---|---|---|
| `Combo.prepMinutes: number` (`src/lib/combos.ts`) | A fixed, combo-authored estimate of preparation time | Rendered as plain text only (`TodayView.tsx` lines 288, 356 per the code trace) — never read by any filter, sort, or comparison. It describes the combo; it is never compared against anything the *user* discloses. |
| `Combo.prepNote?: string` (DEC-067 Level 1, `src/lib/combos.ts`) | An optional free-text preparation note | Rendered as plain text only (`TodayView.tsx` lines 295–299, 363–365); its own type comment states "never parsed, never consulted by matching/nutrition/shopping logic," confirmed by `comboMatch.test.ts`'s explicit pass-through invariance tests. Free text, not a structured signal. |
| `hasSoftConstraint` / `hasSoftAllergenClassConstraint` (`src/lib/foodExclusions.ts`, `src/lib/comboMatch.ts`) | DEC-053's intolerance-handling "soft constraint" (de-prioritize, never hard-exclude) | Unrelated to DEC-068 — despite the shared word "constraint," this is food-allergy/intolerance semantics, not skill/time/equipment. Confirmed by reading the function bodies: both operate on `FoodExclusion`/`AllergenClassExclusion` arrays, never on time/skill/equipment data (which does not exist). |
| `PersonalProfile.activity: ActivityLevel` (`src/lib/mealPersonalization.ts`) | A TDEE activity-level multiplier (sedentary/light/moderate/high/very_high) | A metabolic/energy-estimation input (Domain D), not a cooking-skill or kitchen-equipment field — confirmed by its use only in energy-target calculation, never in combo filtering. |
| `Combo.tags: string[]` | Free-form tags on each combo | `data/README.md` states explicitly: "not filtered on yet; informational only for now" — confirmed unused by `comboMatch.ts`. Could theoretically carry a skill/equipment tag in the future but does not today. |

A repository-wide case-insensitive search for "skill," "equipment," and "difficulty" across `src/` and
`supabase/` returns **zero hits** outside the DEC-053 "soft constraint" naming coincidence above and one
unrelated citation (`mealPersonalization.ts` line 61, a comment quoting a physical-activity MET-table
category, "low-intensity or skill-based activities" — about exercise intensity, not cooking).

---

## 6. Current User Flow

```text
meal/food selection  (Domain K, DEC-060–065)
        ↓
meal construction     (DEC-066 — src/lib/comboMatch.ts's scoreAllCombos/matchCombos,
        ↓              or MealPlanView.tsx's manual MealFoodPicker flow)
ingredient representation (DEC-067, CLOSED — Combo.items[] + optional prepNote)
        ↓
nutrition             (mealNutrition.ts — macro totals only, unaffected by anything below)
        ↓
shopping              (listActions.ts — "Listeye ekle" button, unaffected)
        ↓
meal logging/feedback (meal-entries.ts — "Yedim" button, unaffected)
```

**Where DEC-068 appears to belong:** between "meal construction" and "ingredient representation" (or
alongside it), as an ADJUSTMENT step that would filter or modify what DEC-066/067 already produced. **No
such step exists today.**

**Concretely, in `TodayView.tsx` (the app's actual suggestion surface):**

1. `useRemainingToday` computes the user's remaining macro/kcal budget for today.
2. `matchCombos(COMBOS, remaining.remaining, foodExclusions, allergenExclusions, catalogMap)` drops any
   combo containing a hard-excluded food/allergen class, computes macro totals, flags (but keeps) soft
   (intolerance) conflicts, filters to combos whose total kcal fits the remaining budget, sorts by
   (no-soft-conflict-first, then protein descending), and returns the top 5.
3. Each `SuggestionCard` shows the combo's name, `prepMinutes` (text), kcal/protein, and `prepNote` (text,
   if present), with buttons to add ingredients to the shopping list or log it as eaten.
4. A "Diğer kombinasyonlar" (other combinations) section shows the same scoring without the kcal cutoff.

**The only "budget" the system currently reasons about is nutritional** (kcal/macros). At no point does the
user disclose, and at no point does the system consult, cooking skill, available time, or equipment.

**In `MealPlanView.tsx` (the manual meal-logging surface):** the user picks a food via `MealFoodPicker`
and types a quantity directly into a fixed slot (kahvaltı/öğle/akşam/ara öğün). `MealFoodPicker` filters
only on food exclusions (DEC-053/B3) — no combo suggestion, scoring, or constraint logic of any kind
exists on this path either.

- **Current UI behavior:** no skill/time/equipment input exists anywhere in the app.
- **Current selection logic:** kcal-budget + protein-ranking + allergy/intolerance tiering only.
- **Current persistence:** `meal_entries` stores `(food_id, quantity_g, combo_id?)` — no constraint data
  of any kind.
- **Current Food ID usage:** unaffected; DEC-068 would consume Food Identity only indirectly, through
  whatever meal DEC-066/067 already constructed.
- **Current exclusion/allergen interaction:** entirely separate mechanism (DEC-053/B3), confirmed to share
  no code path with anything DEC-068-relevant.
- **Current personalization behavior:** limited to macro/kcal targets (Domain D/E/F) and food exclusions;
  no skill/time/equipment personalization exists.

---

## 7. Existing Capability Audit

| DEC-068 capability | Existing? | Exact implementation | Complete / Partial / Missing |
|---|---|---|---|
| User discloses cooking skill level | No | — | **Missing** |
| User discloses a time budget (distinct from a combo's own `prepMinutes`) | No | — | **Missing** |
| User discloses available kitchen equipment | No | — | **Missing** |
| Constraint-matching logic (compare disclosed constraints against a meal's requirements) | No | — | **Missing** |
| Constraint-adjusted meal construction (system modifies/filters a meal in response) | No | — | **Missing** |
| Prep-time *display* on a combo (informational only) | Yes | `Combo.prepMinutes`, rendered `TodayView.tsx:288,356` | **Complete as a display feature — does not count toward DEC-068**, since a capability counts only if the code actually performs the decision, and nothing reads this value as a constraint input |
| Preparation-note *display* on a combo (DEC-067 Level 1, informational only) | Yes | `Combo.prepNote`, rendered `TodayView.tsx:295-299,363-365` | **Complete as a display feature — does not count toward DEC-068**, same reasoning; explicitly unparsed free text |

No row in this table counts as existing DEC-068 capability. The two "Yes" rows are DEC-066/067 display
features that happen to be adjacent in subject matter (both concern preparation time/detail), not partial
DEC-068 implementations.

---

## 8. Knowledge Support

**Classification, cross-checked across three independent Phase 3/9 sources:**

- `APP_DECISION_KNOWLEDGE_MAPPING.md` line 489: **"NO TOPIC MAPPED... Same gap as DEC-067. APPLICATION
  TRANSLATION GAP."**
- `APP_DECISION_GAPS.md` line 220: `068 | NOT COVERED | GAP-A | LOW | n/a | Same as DEC-067 | APPLICATION
  TRANSLATION / FUTURE FEATURE | NO | NO`.
- `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` line 137 (Gap Classification, §3): classifies DEC-068
  more specifically as a **SPECIFICATION GAP**: *"On Cooking establishes what preparation requires
  (equipment, time); it does not specify how Grocery should match a user's disclosed constraints against a
  recipe's requirements — that matching rule doesn't exist yet at any layer."*

These are consistent, not conflicting: `GAP-A`/"NOT COVERED" describes the absence of a *knowledge-layer*
counterpart in the 213-topic curriculum universe (no book teaches "how to match a user's time budget to a
recipe"); "SPECIFICATION GAP" describes the same absence one layer up — the *decision logic* for that
matching has never been specified either, by any phase, at any layer. Both agree DEC-068 is **not** a
knowledge gap in the sense of "science we don't yet know" — On Cooking 7e is rated `STRONG` for the
underlying culinary workflow knowledge (mise en place, knife skills, Ch.9/Ch.6 —
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` line 95). The gap is squarely a **product/application
decision plus an unspecified matching rule**, not a scientific-evidence shortfall.

**Verdict:** DEC-068 is a **PRODUCT/APPLICATION DECISION**, layered on a **SPECIFICATION GAP** (the matching
rule itself). It is not a knowledge gap, not a translation-content gap requiring new evidence, and not a
scope/governance gap (unlike `DEC-099`/`DEC-100`).

---

## 9. Candidate Options

DEC-068 is genuinely unresolved (confirmed by §5–§8: no implementation, no specified matching rule, no
knowledge-layer blocker). The following options are constructed from what the codebase and governance
documents actually support — not manufactured to pad the table.

### Option 1 — Decline for v1 (status quo, explicit)

**Definition:** Formally record that Grocery does not perform skill/time/equipment constraint matching in
v1, matching `App Priority: OPTIONAL` and following the `DEC-048` precedent (`PROJECT_STATUS.md` line
33: a prior decision was explicitly *declined* rather than left ambiguously open).
**User experience:** Unchanged — no new UI, no new questions asked.
**Application responsibility:** None new.
**Required data:** None.
**Required implementation:** None.
**Personalization impact:** None (stays at current MODERATE-via-macros-only level).
**Nutrition implications:** None.
**Safety implications:** None.
**Shopping implications:** None.
**Downstream effect on DEC-069:** None — DEC-069 has no formal dependency on DEC-068 (§3).
**Advantages:** Zero implementation cost; zero risk; consistent with `App Priority: OPTIONAL` and
`PROJECT_AI_PROTOCOL.md` §28 (no premature implementation).
**Disadvantages:** The practical-feasibility gap (a suggested combo could require equipment/time/skill the
user doesn't have) remains unaddressed indefinitely.
**Scope risk:** None — this option expands nothing.

### Option 2 — Time-budget-only filtering (minimal extension, reuses `prepMinutes`)

**Definition:** Let the user optionally disclose a time budget (e.g. "I have about 15 minutes"); filter or
de-prioritize combo suggestions whose existing `prepMinutes` exceeds it, using the same soft/hard tiering
pattern already established for DEC-053 (`hasSoftConstraint`).
**User experience:** One new optional input (a time-budget selector), analogous to the existing macro
budget already shown in `TodayView.tsx`.
**Application responsibility:** Compare a user-disclosed number against an already-existing per-combo
number — no new *meal content* is required, only a new *personal-profile* field and a comparison in
`comboMatch.ts`.
**Required data:** One new field on `PersonalProfile`/`personal_plan` (e.g. `timeBudgetMinutes?: number`).
No change to `Combo`/`combos.json` — `prepMinutes` already exists.
**Required implementation:** A new comparison in `comboMatch.ts`'s scoring/filtering (structurally similar
to the existing kcal-budget filter), a new profile field + migration, and a UI control.
**Personalization impact:** MODERATE — matches DEC-068's own inventory rating.
**Nutrition implications:** None — `mealNutrition.ts` is untouched; this only changes which combos are
shown, not any nutrient math.
**Safety implications:** None directly, but the filter must be applied *after*, not instead of, the
existing hard/soft exclusion filtering (i.e., inherit `comboMatch.ts`'s existing precedence — never let a
time filter surface a food that the exclusion filter would have removed).
**Shopping implications:** None.
**Downstream effect on DEC-069:** None — no batching/scaling concept is introduced.
**Advantages:** Smallest option that produces a genuinely new user-facing capability; reuses an existing
field (`prepMinutes`) with zero new `Combo`/`combos.json` schema change; structurally mirrors an
already-proven pattern (the kcal-budget filter, the DEC-053 soft/hard tiering).
**Disadvantages:** Does not address skill or equipment at all — a partial answer to DEC-068's own three-part
definition ("cooking skill, available time, and equipment"). Would need its own follow-up decision if skill
or equipment are later required.
**Scope risk:** LOW — bounded to one new profile field, one new comparison, one new UI control.

### Option 3 — Full skill+time+equipment structured matching

**Definition:** Add structured requirement metadata to each combo (e.g. a skill-level tag, a required-
equipment list) and structured disclosure fields to the user profile (skill level, owned equipment); match
the two and filter/rank/annotate suggestions accordingly.
**User experience:** A dedicated onboarding/profile section for skill level and equipment; suggestions
would visibly reflect all three constraint types.
**Application responsibility:** A genuinely new matching engine — not a simple numeric comparison like
Option 2, but a multi-field requirement/capability match (skill ordinal comparison, equipment set
intersection, time numeric comparison).
**Required data:** New `Combo` fields (skill level required, equipment required — a `FUTURE/OPTIONAL`
concept per `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §14.1's "Preparation Method"/"Cooking Method"
rows, not previously scoped for DEC-068 specifically); new `PersonalProfile`/`personal_plan` fields for
skill and equipment; a data-authoring burden on every one of the 16 existing `combos.json` entries (all
would need skill/equipment tagging to make the new filter meaningful).
**Required implementation:** New profile UI, new combo-authoring schema + `data/README.md` documentation,
new matching logic in `comboMatch.ts`, and — per `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §14.8's
own "Implementation-Readiness Matrix" pattern for adjacent concepts — this would newly need to be entered
into that matrix as its own row (it is not currently represented there at all, unlike `DEC-067`/`DEC-069`
which already have rows).
**Personalization impact:** MODERATE-to-HIGH — exceeds DEC-068's own inventory rating of MODERATE unless
scoped carefully.
**Nutrition implications:** None directly, provided the matching stays a filter/rank step and never alters
`mealNutrition.ts`'s calculation.
**Safety implications:** Same precedence requirement as Option 2 (must not override or bypass hard/soft
exclusion filtering) — and a new one: if "equipment" filtering ever triggers an automatic food/method
*substitution* (as opposed to just hiding an infeasible combo), that substitution would need to route
through `DEC-063`'s substitution logic to preserve nutrient-contribution equivalence, not invent an
independent substitution path (mirroring the existing rule already established for `DEC-074` in
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §2.3, "must route through DEC-063's nutrient-preservation
constraint, not invent a separate substitution path").
**Shopping implications:** None directly.
**Downstream effect on DEC-069:** None required, but the two are adjacent enough (§4's boundary note) that
a reviewer choosing this option should re-confirm the DEC-068/DEC-069 boundary stays intact — this option
should not silently grow into a scaling/batch-size feature.
**Advantages:** Directly and completely answers DEC-068's original three-part definition.
**Disadvantages:** By far the largest option — new data on both sides (combo authoring + user profile), a
new matching engine, and a data-authoring burden across all existing combos; the free-text `prepNote` from
DEC-067 Level 1 cannot be reused as a structured signal (§14), so none of DEC-067's implementation reduces
this option's cost.
**Scope risk:** MODERATE-to-HIGH — the largest option carries the most risk of scope creep into recipe-
system territory that DEC-067's ratification record explicitly declined (structured preparation methods,
ordered steps).

### Option 4 — Informational-only constraint annotation (no filtering)

**Definition:** Extend the existing display-only pattern (like `prepMinutes`/`prepNote`) with an
informational note about likely equipment/skill needs, shown but never used to filter or rank — the user
reads it and decides for themselves.
**User experience:** A new line of text on suggestion cards (e.g. "Fırın gerekir" / "requires an oven"),
authored per-combo, purely descriptive.
**Application responsibility:** None beyond authoring and rendering text — no comparison against user data
at all, since no user-side disclosure would be required.
**Required data:** An optional new `Combo`/`combos.json` field (e.g. `equipmentNote?: string`), directly
analogous to `prepNote`'s existing shape.
**Required implementation:** Nearly identical to the DEC-067 Level 1 implementation pattern already
shipped this session — a new optional string field, a render site, documentation in `data/README.md`.
**Personalization impact:** None — this is LOW, not MODERATE, since nothing is matched against the user.
**Nutrition implications:** None.
**Safety implications:** None.
**Shopping implications:** None.
**Downstream effect on DEC-069:** None.
**Advantages:** Cheapest option that says *something* about equipment/skill; reuses the exact
implementation pattern already validated for DEC-067 Level 1.
**Disadvantages:** Does not actually perform an ADJUSTMENT (DEC-068's own Decision Type) — it is arguably
not a resolution of DEC-068 at all, since DEC-068's Output is defined as "a constraint-adjusted meal
construction," not an annotated one. Reported here because a reviewer may still find it a useful adjacent
option, but flagged as likely **not a genuine DEC-068 resolution** — closer to an extension of DEC-067's
already-ratified textual-note pattern than to DEC-068's own ADJUSTMENT definition.
**Scope risk:** LOW, but carries a boundary risk of blurring DEC-067 (representation) and DEC-068
(adjustment) if adopted under DEC-068's name.

---

## 10. Safety Analysis

**Does DEC-068 affect allergy exclusions, intolerance handling, dietary-pattern constraints, Food Identity,
allergen-class mappings, exclusion precedence, or escalation? No — confirmed by code trace, not assumed.**

- The only exclusion/safety mechanism in the codebase is DEC-053/B3's hard/soft exclusion tiering
  (`src/lib/foodExclusions.ts`, consumed by `comboMatch.ts` and `MealFoodPicker.tsx`). It operates entirely
  on `FoodExclusion[]`/`AllergenClassExclusion[]` data — there is no code path, shared function, or shared
  data structure between this mechanism and anything skill/time/equipment-related, because the latter does
  not exist.
- Food Identity (`src/lib/foodIdentity.ts`) resolves a name/alias to a canonical food row; DEC-068 would
  only ever consume its output indirectly (through whatever meal DEC-066/067 already constructed), never
  interact with its resolution logic.
- **The one safety-relevant invariant this investigation surfaces for any future DEC-068 implementation**
  (Options 2/3 above): any new constraint filter must run in addition to, and must never bypass or run
  instead of, the existing hard/soft exclusion filter. `comboMatch.ts`'s current filter order is
  exclusion-first, then macro-budget; a future constraint filter should preserve that ordering (exclusion
  remains the non-negotiable first gate). This is a design *recommendation* surfaced for the human reviewer
  — no safety behavior is changed by this document, and no new safety rule is invented; it names an
  ordering constraint already implicit in how `comboMatch.ts` is structured today.
- No new safety rule is proposed. No existing safety rule is altered.

---

## 11. Nutrition Analysis

**Does DEC-068 affect food selection, nutrient calculation, macro targets, meal targets, prescription, or
longitudinal adjustment? No, under every option in §9.**

The governing distinction (`PROJECT_AI_PROTOCOL.md` §5) is preserved:

```text
Food composition  ≠  Food selection  ≠  Meal construction  ≠  Nutrition calculation  ≠  Prescription
```

DEC-068 sits at the **meal construction / translation layer**, adjusting or filtering what DEC-066/067
already produced. In every candidate option (§9), `mealNutrition.ts`'s pure per-100g × grams calculation is
untouched — none of the options change *what* nutrients a food contributes, only *which* already-computed
combos are shown or how they are ranked. The one scenario that would touch nutrition — Option 3's
possibility of an equipment-driven food *substitution* — is explicitly required (§9, Option 3's Safety
implications) to route through `DEC-063`'s existing nutrient-preservation constraint rather than invent an
independent path, exactly mirroring the rule Phase 9 already applies to `DEC-074`. No formula or threshold
is introduced by this document.

---

## 12. Personalization and Longitudinal Behavior

Per DEC-068's own inventory record: **Personalization: MODERATE, Longitudinal Data Required: NO.**

**Should DEC-068 respond to:**

- User preferences — not directly; skill/time/equipment are a distinct axis from food preference (DEC-061)
  or cost/convenience (DEC-064).
- Allergies/intolerances — no; orthogonal, per §10.
- Dietary pattern — no.
- Available foods (pantry) — no; that is DEC-065's axis.
- Prior meals — no; DEC-068 has `Longitudinal Data Required?: NO` in its own record, and no candidate
  option in §9 introduces a longitudinal signal.
- Observed response / longitudinal adherence — no, same reasoning.
- Previous meal selections — no.

**Information used to make the decision vs. merely displayed afterward:** this is the precise line §5/§7
already drew in code terms — `prepMinutes` and `prepNote` are today **displayed afterward only**; none of
DEC-068's candidate options in §9 propose changing that classification for those two fields specifically
(Option 2 proposes comparing `prepMinutes`, an existing display value, against a *newly disclosed*
time-budget value — the new input becomes decision-driving, the existing `prepMinutes` field's role does
not change). No personalization requirement beyond what DEC-068's own inventory record already states is
invented here.

---

## 13. Product Architecture Impact

| Requirement | Classification | Basis |
|---|---|---|
| New domain concept: Skill level | **NEW CONCEPT** (Options 3) / NOT REQUIRED (Options 1, 2, 4) | No skill concept exists anywhere in the repo (§5) |
| New domain concept: Equipment inventory | **NEW CONCEPT** (Option 3) / NOT REQUIRED (Options 1, 2, 4) | No equipment concept exists anywhere in the repo (§5) |
| New domain concept: Disclosed time budget | **NEW CONCEPT** (Options 2, 3) / NOT REQUIRED (Options 1, 4) | Distinct from the existing `prepMinutes` display value, which describes the combo, not the user |
| New data structure: `Combo` requirement metadata | **NEW CONCEPT** (Option 3) / MINOR EXTENSION (Option 4, one optional string field) / NOT REQUIRED (Options 1, 2) | `Combo`'s current shape (`src/lib/combos.ts`) has no requirement-metadata fields |
| New data structure: `PersonalProfile` constraint fields | **MINOR EXTENSION** (Option 2, one field) / **NEW CONCEPT** (Option 3, multiple structured fields) / NOT REQUIRED (Options 1, 4) | `PersonalProfile`'s current shape (`src/lib/mealPersonalization.ts`) has no skill/equipment/time-budget fields |
| New persistence | Mirrors the data-structure rows above — a `personal_plan` column addition (Options 2/3) is the same class of change as the six existing `ALTER TABLE`-driven `supabase/*.sql` migrations already used for exclusions/allergen-classes | **MINOR EXTENSION** |
| New API | **NOT REQUIRED** under any option — `netlify/functions/meal-entries.ts` and any personal-plan endpoint already accept/return arbitrary profile fields; no new endpoint shape is implied | — |
| New UI | **NEW CONCEPT** (Options 2, 3 — a disclosure control) / MINOR EXTENSION (Option 4 — one more display line, same pattern as `prepNote`) / NOT REQUIRED (Option 1) | No skill/time/equipment UI exists anywhere (§5) |
| Changes to existing `Combo` architecture | **NOT REQUIRED** (Options 1, 2) / MINOR EXTENSION (Option 4) / NEW CONCEPT (Option 3) | `ScoredCombo = Combo & {...}` (per the DEC-067 implementation) means any new optional field flows through automatically, as already demonstrated by `prepNote` |
| Changes to `meal_entries` | **NOT REQUIRED** under any option | DEC-068 operates upstream of logging, at suggestion/construction time; `meal_entries`' `(food_id, quantity_g, combo_id?)` shape is unaffected regardless of which combo was suggested |
| Changes to Food Identity | **NOT REQUIRED** under any option | DEC-068 only ever consumes Food Identity indirectly, through DEC-066/067's already-constructed meal |
| Changes to shopping | **NOT REQUIRED** under any option | No candidate option in §9 touches `listActions.ts` or the `lists`/`items` tables |

---

## 14. DEC-067 Interaction

DEC-067 (CLOSED, Level 1) now provides: an ingredient list with quantities, plus an optional free-text
preparation note (`Combo.prepNote`). `DEC-067_LEVEL_1_IMPLEMENTATION_INVESTIGATION.md` §12 ("DEC-068
Boundary") already anticipated this exact question and concluded: *"Level 1's optional textual note does
not, by itself, give DEC-068 any new structured signal to match against (a free-text note cannot be
programmatically matched against 'user has 15 minutes' without separate, unspecified parsing logic)."*
This investigation's own code trace confirms that conclusion still holds unchanged: `prepNote` remains
unparsed free text (§5, §7).

**What DEC-068 actually consumes from DEC-067's capability, concretely:**

- The only currently-**structured** (non-free-text) signal available from the DEC-066/067 area is
  `Combo.prepMinutes: number` — a fixed, combo-authored estimate, not a disclosed user constraint. Option 2
  (§9) is the only candidate option that reuses this value.
- `Combo.prepNote` remains unusable as a matching signal under every option in §9 unless a future,
  separate decision introduces structured parsing of free text — which none of this document's options
  propose, since doing so would risk turning DEC-067 into something closer to structured recipe metadata,
  which its own ratification record explicitly declined to do ("No structured Preparation Method
  domain/concept is introduced by this decision" — ratification record §2).

**Explicitly not duplicated:** none of §9's options re-decide *how much detail* DEC-067 already chose to
expose (ingredient-list + optional note). None propose a recipe system. DEC-068 is scoped here strictly as
an adjustment/filter over what DEC-067 already produces, consistent with its own Decision Type (ADJUSTMENT,
not SELECTION or TRANSLATION).

---

## 15. DEC-069 Boundary

**Explicitly deferred to DEC-069, and not touched by any option in §9:**

- Scaling a recipe's yield (e.g. "serves 4" → "serves 2").
- Batch cooking / meal-prep across multiple days.
- Restaurant-scale or professional-scale production.
- Any inventory-aware recipe scaling (deciding portions based on what's on hand).
- Serving multiplication of any kind.

None of §9's four candidate options require or introduce any of the above. Per `APP_DECISION_DEPENDENCY_
GRAPH.md`, DEC-069 has no formal dependency on DEC-068 in either direction (§3) — the two are Domain-L
siblings, both downstream of DEC-066, not sequentially chained to each other. This investigation confirms
that finding and adds no new coupling between them. If a future DEC-068 implementation (most plausibly
Option 3) were ever extended toward "suggest a different equipment-appropriate batch size," that would
cross into DEC-069's unresolved restaurant/professional-scale question (per
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §16.3's own Phase-8-sourced finding that true quantity-food
batch production is a confirmed, bounded knowledge absence) — flagged here as a dependency/blocker for any
future implementer to watch for, not something any current option proposes or that this document resolves.

---

## 16. Human Decision Package

### DEC-068 exact question

Should Grocery match meal suggestions against a user's disclosed cooking skill, available time, and/or
kitchen equipment — and if so, in what form (no matching at all; a minimal time-budget-only filter; a full
structured skill+time+equipment match; or an informational-only annotation) — or should this remain
unimplemented for v1?

### Current state

Nothing is implemented (§5, confirmed by full code trace). The only adjacent artifacts are DEC-066/067's
`Combo.prepMinutes` (a fixed display number) and `Combo.prepNote` (DEC-067 Level 1's free-text note,
unparsed) — both purely informational, neither consulted by any filter, sort, or comparison.

### Candidate options

See §9 in full. Summarized:

1. **Decline for v1** — no change, matches `App Priority: OPTIONAL`.
2. **Time-budget-only filtering** — smallest genuine ADJUSTMENT capability; reuses existing `prepMinutes`.
3. **Full skill+time+equipment structured matching** — completely answers DEC-068's original definition;
   by far the largest option.
4. **Informational-only annotation** — cheapest option, but arguably does not satisfy DEC-068's own
   ADJUSTMENT decision type; closer to a DEC-067-style extension.

### Recommendation

> **FOR HUMAN REVIEW — NOT RATIFIED.**

Given `App Priority: OPTIONAL` (the lowest priority tier used in the decision model), the confirmed absence
of any knowledge-layer or specification-layer foundation to build on (§8), `PROJECT_AI_PROTOCOL.md` §28's
"no premature implementation" principle, and the immediately preceding DEC-067 precedent of ratifying the
smallest option that matched the product's own already-documented direction rather than the most complete
one — **if the reviewer wants any v1 capability at all, Option 2 (time-budget-only filtering) is the
smallest option that genuinely satisfies DEC-068's ADJUSTMENT definition**, since it reuses an existing
field, requires one new profile field, and mirrors an already-proven filtering pattern (the kcal-budget
filter). **If the reviewer prefers to keep DEC-068 unimplemented for v1, Option 1 (explicit decline,
mirroring the `DEC-048` precedent) is recommended over silently leaving it open-but-ignored**, since an
explicit decline is traceable and reversible, while silent neglect is not. This recommendation does not
rule out Option 3 for a later, larger product push — it is reported as the highest-cost, highest-completeness
option, not a disqualified one.

### Consequences

| | Option 1 (Decline) | Option 2 (Time-budget) | Option 3 (Full match) | Option 4 (Annotation only) |
|---|---|---|---|---|
| Architecture | None | Minor extension | New concept | Minor extension |
| UI | None | New control | New section | One new display line |
| Data | None | +1 profile field | +N combo fields, +N profile fields | +1 combo field |
| Nutrition | None | None | None (if routed through DEC-063 for any substitution) | None |
| Safety | None | Must preserve exclusion-filter precedence | Must preserve exclusion-filter precedence; must route any substitution through DEC-063 | None |
| Personalization | None | MODERATE | MODERATE–HIGH | LOW (arguably none) |
| DEC-069 | None | None | Must be watched for scope creep (§15) | None |

### Explicit non-decisions

This Human Decision Package does **not** decide: which option (if any) is adopted; DEC-069's v1-necessity;
any DEC-067 amendment; any new DEC ID; any implementation, schema, API, or UI change.

---

## 17. Recommendation

Restated from §16 for directness: **FOR HUMAN REVIEW — NOT RATIFIED.** Option 2 (time-budget-only
filtering) is the smallest option that genuinely resolves DEC-068 if any v1 capability is wanted; Option 1
(explicit decline) is recommended if not. Option 3 remains available as a larger future push. Option 4 is
reported but flagged as likely not a true DEC-068 resolution (§9). No option is selected by this document.

---

## 18. Explicit Non-Decisions

This document does NOT:

- Resolve DEC-068. It remains OPEN.
- Reopen or resolve DEC-069. It remains OPEN, untouched.
- Amend DEC-066 or DEC-067. Both remain exactly as previously written/ratified.
- Create any new DEC ID.
- Modify application source, JSON data, the database, any migration, any API, or any UI.
- Modify Food Identity or allergen/exclusion logic.
- Modify nutrition-calculation logic.
- Reopen Phase 1–8.
- Resolve the bookkeeping discrepancy noted in §3 (the Inventory's "Downstream Use: DEC-068 → DEC-070" claim
  vs. the Dependency Graph's absence of that edge) — reported only.
- Resolve the DEC-068/DEC-069 boundary ambiguity noted in §4 beyond reporting the working distinction already
  derivable from existing text.

---

## 19. Open Questions

1. **Bookkeeping discrepancy (§3):** `APP_DECISION_INVENTORY.md`'s DEC-068 record states "Downstream Use:
   DEC-070," but `APP_DECISION_DEPENDENCY_GRAPH.md` records no `DEC-068 → DEC-070` edge (DEC-070's only
   recorded dependencies are DEC-066 and DEC-076). Not resolved here; flagged for whoever next maintains
   the Dependency Graph.
2. **Whether DEC-068 should ever be split into separate sub-decisions** (skill vs. time vs. equipment),
   given they have materially different data-availability profiles (time has an existing proxy field,
   `prepMinutes`; skill and equipment have none) and different UX disclosure costs. Not resolved here — no
   option in §9 proposes splitting DEC-068, since doing so would create a new DEC ID, which is outside this
   document's authorization.
3. **Whether a future DEC-063 substitution path, if ever built, would need to inherit any DEC-068 matching
   result** (e.g., swapping in an "easier" substitute food when the original fails a constraint match). Not
   currently applicable, since neither DEC-063's substitution logic nor any DEC-068 matching logic is
   implemented — noted only so a future implementer does not overlook the interaction.
4. **Whether Option 4's informational-only annotation genuinely counts as a DEC-068 resolution at all**,
   given DEC-068's own Decision Type is ADJUSTMENT, not a display/representation choice. Reported as a
   definitional question for the human reviewer, not resolved here.
