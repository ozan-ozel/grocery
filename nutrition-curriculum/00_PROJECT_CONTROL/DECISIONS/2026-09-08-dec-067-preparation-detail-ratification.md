# Decision Record — DEC-067 Preparation Detail Level (Ratification)

**Date:** 2026-09-08
**Type:** Phase 9 human product-decision ratification — **not a Review Gate.** Gate 7 is defined as the
end of Phase 9 (`PROJECT_AI_PROTOCOL.md` §21) and remains unopened.
**Decision authority:** Human / ChatGPT reviewer
**Artifact under review:** `08_APP_TRANSLATION/DEC-067_PREPARATION_DETAIL_INVESTIGATION.md`, building on
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §8, §16.3, §20.8
**Outcome:** **DEC-067 = Level 1 (ingredient-list-level), with an optional textual preparation note —
ratified.**

**This record creates no new `DEC` ID and does not rewrite `DEC-067`'s original definition.**
`APP_DECISION_INVENTORY.md` lines 1120–1132 remain exactly as written — that record already named
"ingredient-list-level" as one of `DEC-067`'s three options; this ratification selects it. Nothing here
amends the decision's text, inputs, outputs, domain, type, or dependency edges.

---

## 1. Decision — DEC-067 Primary Level: Level 1

**Ratified scope, recorded verbatim as supplied by the reviewer:**

> For a meal already constructed by Grocery, the application provides an ingredient list with
> quantities, optionally accompanied by a concise textual preparation note.

This resolves `DEC-067`'s `SELECTION` among its three originally-named options (recipe-level /
ingredient-list-level / general guidance only) in favor of **ingredient-list-level**, extended with an
optional textual note. It does not select recipe-level or general-guidance-only for any part of the
decision.

## 2. Preparation State: Textual for v1

An optional preparation note may be represented as textual content. **No structured Preparation Method
domain/concept is introduced by this decision.** The exact storage shape of the note (a single string, a
nullable field, etc.) is implementation detail, not decided here.

## 3. Portion / Yield: Deferred

No formal Portion/Yield concept is introduced as part of `DEC-067`. Preserved distinction, recorded
verbatim:

- a future recipe-level "serves N" concept remains possible;
- recipe scaling / changing yield remains `DEC-069` territory;
- neither is implemented or decided by this record.

## 4. Ordered Preparation Steps: Deferred

Ordered/structured cooking steps are not part of the v1 `DEC-067` capability. They remain available as a
future recipe-level extension, contingent on a future decision, not this one.

## 5. Modification-Only Capability: Separate Downstream Capability

**Recipe modification-only is not a `DEC-067` level.** `DEC-067`'s own definition takes a constructed
meal (`DEC-066`'s output) as its input; modification-only does not build on that construction chain at
all (`DEC-067_PREPARATION_DETAIL_INVESTIGATION.md` §3.D). It remains a distinct future capability,
associated with the appropriate downstream architecture/decisions, including `DEC-063` where applicable
(substitution/functional-equivalence knowledge) and any future recipe architecture. Not created, not
numbered, not scheduled by this record.

---

## 6. Explicit Scope of the Ratification

**DEC-067 now means, as a ratified product decision layered on its unchanged original text:**

> For a meal already constructed by Grocery, the application provides an ingredient list with
> quantities, optionally accompanied by a concise textual preparation note.

**This does NOT establish:**

- structured recipes
- ordered cooking steps
- structured preparation methods
- formal portion/yield modeling
- recipe scaling
- nutrient-retention coefficients
- cooked-vs-raw nutrient adjustment
- a general recipe-modification engine
- batch production
- restaurant-scale production

`DEC-069` remains unresolved and is **not** answered by this ratification. Canonical Food Identity
remains **CLOSED** and is unaffected.

---

## 7. Rationale

Recorded as supplied by the reviewer, consistent with the evidence the investigation artifact assembled:

- **Knowledge support was never the blocker.** On Cooking 7e rates `STRONG` on the capabilities needed for
  any of the three named levels (`ON_COOKING_7E_EXECUTION_RECORD.md` §3–4); the corpus supplies no basis
  for preferring one level over another (`DEC-067_PREPARATION_DETAIL_INVESTIGATION.md` §6).
- **Level 1 matches the product's own documented direction, not merely the cheapest build.**
  `docs/roadmap.md` item 5 frames the only recipe direction the project has documented as *"a recipe
  layer that expands '[a dish]' into its ingredient list... a natural extension of that data model, not
  a new subsystem"* — exactly Level 1's shape. `README.md` describes Grocery itself as *"a grocery list
  app,"* not a cooking-instruction platform.
- **Level 1 is a strict subset of Level 2.** Choosing it now discards nothing if a future decision later
  chooses to grow into structured recipes, ordered steps, or portion/yield modeling.
- **Level 1 does not force `DEC-069`'s open nutrient-retention question (`U3`,
  `PRACTICAL_TRANSLATION_ANALYSIS.md` §7.2) into practice** the way a cooked-yield-aware recipe level
  would — no coefficient for cooked-vs-raw nutrient change exists in either corpus, and none is invented
  by this ratification.

## 8. Reconciliation Against the Existing Decision Model

Re-checked against `APP_DECISION_INVENTORY.md`, `APP_DECISION_DEPENDENCY_GRAPH.md`, and
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` before recording. **No contradiction was found.**
`DEC-067`'s two dependency edges are unaffected: `DEC-066 → DEC-067` (a constructed meal is still the
required input) and `DEC-067 → DEC-068` (constraint accounting in `DEC-068` now has a concrete detail
level — ingredient list + optional note — to operate on, rather than an unresolved one). Selecting an
already-named option is not a redefinition; it is the resolution the `SELECTION` decision type was always
waiting for.

---

## 9. Downstream Dependencies — Not Decided by This Record

- **`DEC-068`** (skill/time/equipment constraint matching) — now has a concrete detail level to adjust,
  but its own constraint-matching policy remains an open `SPECIFICATION GAP`, unresolved here.
- **`DEC-069`** (batch/leftovers/storage, restaurant-scale-production v1 necessity) — untouched, remains
  open.
- **`DEC-063`** (substitution) — untouched; cited only as the eventual home for modification-only
  capability, not amended.
- **Canonical Food Identity** — remains CLOSED; the ingredient-list representation this record ratifies
  consumes that identity as an upstream input (per the investigation's §10) without reopening it.
- Database schema, API design, UI design, and any implementation architecture for the optional
  preparation note or the ingredient-list representation itself.

## 10. Explicitly Unresolved

- `DEC-069` in full (batch scope, restaurant-scale-production necessity).
- `DEC-099`/`DEC-100` (clinical scope) — remain `BLOCKED`, untouched.
- Allergen-class vocabulary, unmapped-food default, precedence mechanics — pre-existing open items,
  orthogonal to this ratification.
- Any future decision to introduce structured preparation methods, ordered steps, portion/yield, or a
  modification engine — all explicitly left open, not pre-empted, by §6 above.

---

## 11. Implementation Authorization

**This record does not authorize implementation.** No application code, schema, migration, API, or UI
change is permitted on the basis of this ratification. The optional preparation note is **not**
implemented by this record, and no recipe functionality of any kind is implemented by this record. Phase
9 remains architecture-only per `PROJECT_AI_PROTOCOL.md` §28.

**No decision definition was modified by this record.** `DEC-067`'s original text
(`APP_DECISION_INVENTORY.md` lines 1120–1132) is unchanged; `DEC-066`, `DEC-068`, `DEC-069`, `DEC-063`,
and every other `DEC` remain exactly as written. Any future amendment to a decision definition, or any
implementation of what this record ratifies, requires its own explicit authorization.
