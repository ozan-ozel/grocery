# Decision Record — DEC-069 V1 Scope Ratification (Option 3)

**Date:** 2026-09-09
**Type:** Phase 9 human product-decision ratification — **not a Review Gate.** Gate 7 is defined as the
end of Phase 9 (`PROJECT_AI_PROTOCOL.md` §21) and remains unopened.
**Decision authority:** Human / ChatGPT reviewer
**Artifact under review:** `08_APP_TRANSLATION/DEC-069_INVESTIGATION.md` §16 (Option 3), §17 (Human
Decision Package)
**Outcome:** **DEC-069 = Option 3 — multi-day household meal-prep / batch cooking, leftovers, and
storage-aware meal planning — ratified.**

**This record creates no new `DEC` ID and does not rewrite `DEC-069`'s original definition.**
`APP_DECISION_INVENTORY.md` lines 1147–1158 remain exactly as written — that record already named
"batch cooking, leftovers, and storage... incorporated into a meal plan" as `DEC-069`'s scope; this
ratification selects the household-scale, multi-day realization of it (Option 3) over the smaller
(Option 2, single-sitting scaling only) and larger (Option 4, restaurant-scale) alternatives the
investigation presented. Nothing here amends the decision's text, inputs, outputs, domain, type, or
dependency edges.

---

## Decision

**DEC-069 — Batch Cooking, Leftovers, and Storage**

## Status

**CLOSED — V1 SCOPE RATIFIED**

Implementation is **NOT STARTED** and is **NOT authorized by this record**. This ratification closes the
*scope decision* only; a separate, later implementation-architecture investigation is required before any
code, schema, or API work may begin.

---

## 1. Ratified Scope — Option 3

**Grocery v1 will support multi-day household meal-prep / batch cooking, leftovers, and storage-aware
meal planning**, per `DEC-069_INVESTIGATION.md` §16, Option 3. Concretely, the ratified capability is that
Grocery may represent a single preparation event that supports more than one planned meal across
multiple days. The capability may include:

- batch cooking for multiple planned meals from one preparation event
- distribution of a prepared quantity across those planned meals
- planned use of leftovers in later meals
- representation of relevant storage state/information (e.g. how long a batch remains usable)
- shopping aggregation based on the resulting multi-day meal structure

**The capability must remain bounded to household/user-scale meal preparation.** This is not a
general-purpose recipe-scaling engine, and scaling/yield/portion conversion may be used **only** to the
extent required to support the multi-day batch/leftover/storage capability above — not introduced as an
independent, standalone feature.

---

## 2. Why Option 3

Recorded as supplied by the reviewer, consistent with the evidence `DEC-069_INVESTIGATION.md` assembled:

- **Option 3 directly matches DEC-069's own decision text** — "batch cooking, leftovers, and storage...
  incorporated into a meal plan," and its own `Inputs` field ("DEC-066 constructed meals **across
  multiple days**") — more literally than Option 2 (single-sitting scaling only, no leftover/storage
  representation) (`DEC-069_INVESTIGATION.md` §2, §16).
- **Knowledge support for the required mechanisms is strong.** Recipe scaling / yield conversion is rated
  `STRONG`, and storage/preservation guidance is rated `ADEQUATE`, in the admitted On Cooking 7e corpus
  (`ON_COOKING_7E_EXECUTION_RECORD.md` lines 66, 69; cited at `DEC-069_INVESTIGATION.md` §7).
- **True restaurant/professional-scale batch production remains outside the current corpus** — confirmed
  **absent**, a named and bounded limitation (`CULINARY_SOURCE_EXTENSION.md` line 124;
  `PRACTICAL_TRANSLATION_ANALYSIS.md` §11.2). Option 3 deliberately stays inside the knowledge boundary
  Option 4 would cross, avoiding the gate-triggering consequence Phase 8's own governance already flagged
  for that larger option (`DEC-069_INVESTIGATION.md` §16, Option 4).
- **Nutrition calculation already supports arbitrary gram quantities.** `scaleNutrition()`
  (`src/lib/mealNutrition.ts`) computes proportionally to any gram amount already; DEC-069 is confirmed to
  be a decision/translation/data-model problem, not a nutrition-calculation problem
  (`DEC-069_INVESTIGATION.md` §10).
- **Shopping has an established, formal downstream dependency** on whatever batching-aware structure
  DEC-069 produces (`DEC-069 → DEC-071`, `REQUIRED` — `APP_DECISION_DEPENDENCY_GRAPH.md` line 450) — Option
  3 is the realization that actually exercises that dependency, rather than leaving it formally present
  but practically unused (as Option 1 would) (`DEC-069_INVESTIGATION.md` §3, §13).
- **The capability is meaningfully different from every neighboring decision.** It is distinct from
  `DEC-066` (single-meal construction), `DEC-067` (representation detail, CLOSED), `DEC-068` (per-meal
  skill/time/equipment adjustment, CLOSED/DEFERRED), and `DEC-070` (reactive, same-day deviation
  handling) — confirmed by the full decision-neighborhood boundary analysis in
  `DEC-069_INVESTIGATION.md` §4–§5.

---

## 3. Explicit Boundaries

### Production scale — NOT ratified

**Restaurant-scale production, professional quantity-food production, and commercial catering
production are explicitly NOT part of this ratification.** The Phase 8 finding that true
restaurant/quantity-food batch production is absent from the admitted corpus remains valid and unchanged
by this record (`DEC-069_INVESTIGATION.md` §7, §16 Option 4). If a future need for that scale emerges, it
is a separate scope decision that would likely reopen a knowledge question and warrant its own gate
(`PRACTICAL_TRANSLATION_ANALYSIS.md` §11.2) — not something this ratification authorizes by extension.

### Inventory — NOT absorbed

This ratification does **not** absorb pantry reconciliation, inventory tracking, on-hand-stock deduction,
or inventory optimization. These remain `DEC-065`/`DEC-072`'s scope, exactly as `DEC-069_INVESTIGATION.md`
§6/§13 established — "storage" in DEC-069's sense means shelf-life/preservation guidance for an
already-prepared batch, not on-hand raw-ingredient inventory.

### Advanced storage science — NOT introduced

This ratification does **not** authorize automatic microbiological shelf-life prediction, unsupported
shelf-life guarantees, storage-risk numerical models without evidence, nutrient-retention coefficients
across storage, or invented nutrient-loss percentages. `DEC-069_INVESTIGATION.md` §7 explicitly classified
nutrient-retention-across-storage (usability assumption U6) as **UNTESTED**, corroborated by a zero-hit
search for "nutrient retention" across the entire admitted corpus (`CULINARY_SOURCE_EXTENSION.md` line
70). Any future implementation that relies on this assumption does so as a documented, unresolved
uncertainty — not as an established fact this ratification manufactures.

### Personalization — NOT expanded

This ratification does **not** introduce household-size or storage-capacity personalization merely
because it could be useful. `DEC-069`'s existing `Personalization: LOW` classification
(`APP_DECISION_INVENTORY.md` line 1154) is unchanged and is not altered by this record. Any future
additional personalization dimension must be separately justified, not assumed as part of this scope.

---

## 4. DEC-069 Boundaries With Adjacent Decisions

- **`DEC-066`** — constructs individual meals. `DEC-069` extends the planning structure so that
  preparation can support multiple planned meals across time. `DEC-066` is not redefined by this record.
- **`DEC-067`** — **CLOSED, Level 1.** Provides an ingredient list, quantities, and an optional concise
  textual preparation note. `DEC-069` may consume `DEC-067`'s output but does not reopen or modify it.
- **`DEC-068`** — **CLOSED, DEFERRED FOR V1.** `DEC-069` does not introduce cooking-skill matching,
  time-budget matching, or equipment matching. `DEC-068` is not reopened by this record.
- **`DEC-070`** — a reactive, same-day deviation-handling decision. `DEC-069` is proactive, multi-day
  planning. The two decision scopes are not merged.
- **`DEC-071`** — the existing formal dependency `DEC-069 → DEC-071` (`REQUIRED`) remains exactly as
  recorded in `APP_DECISION_DEPENDENCY_GRAPH.md` line 450. The batching structure DEC-069 produces may be
  consumed downstream by shopping/consolidation logic. `DEC-071` is not redefined by this record.
- **`DEC-063`** — if a future implementation requires ingredient substitution (e.g., swapping a food that
  doesn't store well), it must use the existing substitution decision path `DEC-063` already owns.
  `DEC-069` does not create, and this record does not authorize, a new substitution mechanism.

---

## 5. Safety Boundary

This ratification does not change the existing safety architecture. Pure quantity scaling — multiplying
an already-selected, already-filtered meal's ingredient quantities — does not change Food Identity,
allergen identity, food-level exclusion, or allergen-class exclusion, because the foods themselves remain
the same (`DEC-069_INVESTIGATION.md` §11). Any future implementation must preserve existing hard/soft
exclusion precedence. **This record does not modify allergen taxonomy, exclusion semantics, Food
Identity, or safety logic of any kind.**

---

## 6. Nutrition Boundary

`DEC-069_INVESTIGATION.md` §10 established that `scaleNutrition()` (`src/lib/mealNutrition.ts`) already
computes nutrition proportionally to any gram amount — the calculation infrastructure requires zero
changes to support scaling. **DEC-069 is confirmed to be primarily a decision/translation/data-model
problem, not a nutrition-calculation problem.** This record does not modify nutrition calculations and
does not introduce new macro formulas, new nutrient-loss assumptions, storage nutrient-retention
coefficients, or new nutrition prescriptions of any kind.

---

## 7. Dependencies

Confirmed unchanged from `DEC-069_INVESTIGATION.md` §3, re-verified directly against
`APP_DECISION_DEPENDENCY_GRAPH.md`:

- `DEC-066 → DEC-069` — **REQUIRED** (line 441: "Batching/storage logic operates on constructed meals
  across days")
- `DEC-069 → DEC-071` — **REQUIRED** (line 450: "Consolidation must account for batching/storage
  decisions already made")

**No additional formal dependency is authorized by this ratification.** In particular, this record does
**not** introduce a `DEC-068 → DEC-069` or `DEC-069 → DEC-070` edge — neither exists in the Dependency
Graph, and this ratification's scope (§4 above) confirms no semantic basis for either has been created by
selecting Option 3.

---

## 8. Open Implementation Questions — Explicitly NOT Resolved by This Decision

The following are implementation-architecture questions for a **future, separate investigation**, not
answered here:

- whether a Batch entity is needed
- whether a Preparation Event entity is needed
- whether leftovers need their own representation
- how storage state is represented
- how portions are represented
- how batch quantities are calculated
- how multi-day distribution is persisted
- whether existing `MealEntry` requires extension
- whether `Combo` requires extension
- whether a new database/API structure is required
- how shopping consolidation consumes the batch structure
- how user/household quantity is determined
- how storage duration is represented
- how storage/safety guidance is surfaced to the user

---

## 9. Implementation Authorization

**This record does not authorize implementation.** No application code, schema, migration, API, or UI
change is permitted on the basis of this ratification. No `Batch`, `Preparation Event`, `Recipe`, or
`Storage` entity is created by this record. Phase 9 remains architecture-only where no implementation has
been separately authorized, per `PROJECT_AI_PROTOCOL.md` §28. The next authorized task is a **DEC-069
Implementation Architecture Investigation** — not begun by this record.

**No decision definition was modified by this record.** `DEC-069`'s original text
(`APP_DECISION_INVENTORY.md` lines 1147–1158) is unchanged; `DEC-066`, `DEC-067`, `DEC-068`, `DEC-070`,
`DEC-071`, and every other `DEC` remain exactly as written. No new `DEC` ID was created. Any future
amendment to a decision definition, or any implementation of what this record ratifies, requires its own
explicit authorization.
