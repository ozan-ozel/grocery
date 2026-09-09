# Decision Record — DEC-068 Deferred for v1 (Ratification)

**Date:** 2026-09-09
**Type:** Phase 9 human product-decision ratification — **not a Review Gate.** Gate 7 is defined as the
end of Phase 9 (`PROJECT_AI_PROTOCOL.md` §21) and remains unopened.
**Decision authority:** Human / ChatGPT reviewer
**Artifact under review:** `08_APP_TRANSLATION/DEC-068_INVESTIGATION.md`, and its dependent
DEC-068 → DEC-070 dependency-discrepancy audit (both completed 2026-09-09)
**Outcome:** **DEC-068 = deferred for v1 — ratified.**

**This record creates no new `DEC` ID and does not rewrite `DEC-068`'s original definition.**
`APP_DECISION_INVENTORY.md` lines 1134–1145 remain exactly as written. Nothing here amends the
decision's text, inputs, outputs, domain, type, or dependency edges.

---

## Decision

**DEC-068 — Practical Constraint-Adjusted Meal Construction**

Status: **CLOSED — DEFERRED FOR V1**

---

## 1. Ratified Decision

**Grocery v1 will not automatically adjust or filter meal construction based on:**

- cooking skill
- available time
- equipment constraints

No constraint-disclosure UI, no constraint-matching logic, and no constraint-adjusted meal construction
of any kind is authorized for v1. `DEC-068` remains a named, tracked decision — it is closed as
*deferred*, not answered with a specific matching mechanism, and not deleted or reclassified as
out-of-scope permanently.

The existing `DEC-067` preparation metadata remains exactly what it already was ratified and implemented
to be, and nothing about that status changes here:

- `Combo.prepMinutes` may communicate a preparation-duration estimate.
- `Combo.prepNote` may communicate a concise textual preparation note.
- **Neither is, or becomes, a structured `DEC-068` constraint-matching signal.** This was already the
  finding of `DEC-067_LEVEL_1_IMPLEMENTATION_INVESTIGATION.md` §12 and `DEC-068_INVESTIGATION.md` §5/§14;
  this record does not change that finding, it ratifies not acting on it for v1.

`DEC-068` may be reconsidered in a future version if explicit time, skill, and equipment constraints
become a demonstrated v1 requirement. Reopening it would require its own future evaluation of, at
minimum: user constraint inputs, meal metadata, constraint representation, matching/filtering behavior,
adjustment behavior, personalization impact, interaction with existing exclusion logic, and interaction
with `DEC-063` if substitution becomes involved. None of that evaluation is performed or pre-decided by
this record.

---

## 2. Rationale

Recorded as supplied by the reviewer, consistent with the evidence `DEC-068_INVESTIGATION.md` assembled:

- **`DEC-068` carries `App Priority: OPTIONAL`** (`APP_DECISION_INVENTORY.md` line 1144) — the lowest
  priority tier used anywhere in the 112-decision model, and the same tier the investigation's own
  recommendation (`DEC-068_INVESTIGATION.md` §16/§17) weighed most heavily.
- **No structured skill/time/equipment constraint model exists anywhere in the codebase today** — confirmed
  by a full code trace across `MealFoodPicker.tsx`, `MealPlanView.tsx`, `TodayView.tsx`, `combos.ts`,
  `comboMatch.ts`, `mealPlan.ts`, `localMealPlan.ts`, `nutrition.ts`, `foodIdentity.ts`, `listActions.ts`,
  `meal-entries.ts`, `data/combos.json`, and every `supabase/*.sql` migration
  (`DEC-068_INVESTIGATION.md` §5, §7).
- **`prepMinutes` is preparation metadata, not a user time-budget model** — it is a fixed, combo-authored
  display value, never compared against anything a user discloses (`DEC-068_INVESTIGATION.md` §5, §7).
- **`prepNote` is free text and is not a structured matching signal** — confirmed unparsed by its own type
  comment and by `comboMatch.test.ts`'s explicit pass-through invariance tests
  (`DEC-068_INVESTIGATION.md` §5, §14).
- **Full constraint matching (Option 3 of the investigation) would introduce material product/data-model
  complexity** — new `Combo` requirement metadata, new `PersonalProfile`/`personal_plan` fields, a new
  matching engine, and a data-authoring burden across all existing combos
  (`DEC-068_INVESTIGATION.md` §9, §13).
- **No demonstrated v1 requirement was found strong enough to justify that complexity** — `docs/roadmap.md`
  documents no product direction toward skill/time/equipment matching, unlike `DEC-067`'s Level 1, which
  matched an already-documented roadmap direction (`DEC-067_PREPARATION_DETAIL_INVESTIGATION.md` §6/§7,
  cited in that decision's own ratification record §7).
- **Deferring the capability avoids premature architecture**, consistent with `PROJECT_AI_PROTOCOL.md` §28
  ("Before Phase 9: Do not create production application architecture unless specifically required for a
  narrowly scoped research task").
- **No nutrition calculation or safety mechanism needs to change** to defer this decision — deferral is a
  pure no-op with respect to `mealNutrition.ts`, `foodExclusions.ts`, and every other currently-shipped
  mechanism (`DEC-068_INVESTIGATION.md` §10, §11).

---

## 3. DEC-067 Boundary

**`DEC-067` remains CLOSED**, ratified at Level 1 (`00_PROJECT_CONTROL/DECISIONS/2026-09-08-dec-067-
preparation-detail-ratification.md`) and implemented (`docs/SESSION_CHECKPOINT.md`; commits `f8ae274` →
`ff5b3f0`). Its Level-1 output remains exactly:

- an ingredient list
- quantities
- an optional concise textual preparation note

`DEC-067`'s `prepMinutes` / `prepNote` **must not silently become `DEC-068` decision inputs**. Any future
work that wants to consume either field as a structured constraint-matching signal would need its own
explicit decision — reusing them silently would conflate a representation decision (`DEC-067`) with an
adjustment decision (`DEC-068`), a distinction `DEC-068_INVESTIGATION.md` §4 and §14 establish explicitly.

---

## 4. DEC-069 Boundary

**`DEC-068` does not absorb, and this ratification does not decide:**

- recipe scaling
- yield / serving multiplication
- batch production
- restaurant-scale production
- inventory-aware recipe scaling

All of the above remain `DEC-069` territory, exactly as `DEC-068_INVESTIGATION.md` §15 already established.
**`DEC-069` remains OPEN and is entirely unaffected by this record** — nothing here narrows, resolves, or
comments on its restaurant-scale-production question.

---

## 5. DEC-070 Relationship

The dependency-discrepancy audit completed 2026-09-09 (immediately preceding this ratification) found:

> **`DEC-068 → DEC-070` is an INFORMATIVE / CONTEXTUAL relationship, not a formal dependency.**

Both `APP_DECISION_INVENTORY.md` (whose own field legend defines "Downstream Use" as decisions that
"plausibly consume" a decision's output — line 124) and `APP_DECISION_DEPENDENCY_GRAPH.md` (which draws an
edge only where "the output of DEC-A is materially needed, constrains, informs, or conditions DEC-B's
determination" — line 42) are functioning exactly as designed. `DEC-070`'s actual inputs (the original
`DEC-066` constructed meal, per graph line 442's explicit wording, plus `DEC-076`'s logged intake) do not
require any `DEC-068` result. **No dependency-graph correction is required.** This finding is recorded
here for traceability; it was not altered, and is not altered, by this ratification.

---

## 6. Safety Boundary

**No new safety behavior is introduced by this record.** Deferring `DEC-068` changes nothing about
`DEC-053`/B3's existing hard/soft exclusion handling — the two mechanisms share no code path today
(`DEC-068_INVESTIGATION.md` §10), and deferral keeps it that way.

**If `DEC-068` is implemented in a future version**, any constraint-matching or constraint-adjustment logic
**must not bypass or reorder the existing hard/soft exclusion precedence** — exclusion filtering must
remain the first, non-negotiable gate a suggested meal passes through, exactly as `comboMatch.ts`'s current
filter order already establishes and as `DEC-068_INVESTIGATION.md` §10 recommends as a design invariant for
any future implementer. This record does not implement that invariant; it records the requirement for
whoever eventually does.

---

## 7. Nutrition Boundary

**No new nutrition-calculation or prescription logic is introduced by this record.** `mealNutrition.ts`'s
per-100g × grams calculation is untouched by deferring `DEC-068`, and no candidate option
`DEC-068_INVESTIGATION.md` §9 considered would have changed it either.

**Any future substitution behavior that a `DEC-068` implementation might eventually introduce** (e.g., an
equipment-driven "swap for something easier") **must route through `DEC-063`'s existing nutrient-
preservation constraint**, not invent an independent substitution path — mirroring the rule Phase 9 already
applies to `DEC-074` (`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §2.3) and the recommendation already
recorded in `DEC-068_INVESTIGATION.md` §9 (Option 3) and §11.

---

## 8. Personalization

**No additional v1 personalization mechanism is introduced.** `DEC-068`'s own inventory record rates it
`Personalization: MODERATE, Longitudinal Data Required: NO`
(`APP_DECISION_INVENTORY.md` line 1141) — deferral leaves the application's actual personalization surface
exactly where it already stood (macro/kcal targets and food exclusions only), per
`DEC-068_INVESTIGATION.md` §12.

---

## 9. Explicitly Unresolved / Non-Decisions

This ratification does **NOT** decide:

- Future time-budget modeling — what form it would take, if ever built.
- Future cooking-skill taxonomy — whether or how skill levels would be represented.
- Future equipment taxonomy — whether or how owned equipment would be represented.
- Future structured preparation metadata (Preparation Method, Cooking Method, Yield, Portion) — these
  remain `FUTURE/OPTIONAL` concepts per `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §14.1, unaffected.
- Any future constraint-matching algorithm or ranking policy.
- Any future recipe scaling, yield, or batch-size behavior — `DEC-069` territory, untouched (§4 above).
- **`DEC-069`** in full — remains OPEN, unaffected.
- **`DEC-099`/`DEC-100`** (clinical scope) — remain `BLOCKED`, untouched, unrelated to this record.
- Any new `DEC` ID. None is created by this record.

---

## 10. Implementation Authorization

**This record does not authorize implementation.** No application code, schema, migration, API, or UI
change is permitted on the basis of this ratification. Deferring `DEC-068` is a documentation/governance
action only. Phase 9 remains architecture-only where no implementation has been separately authorized, per
`PROJECT_AI_PROTOCOL.md` §28.

**No decision definition was modified by this record.** `DEC-068`'s original text
(`APP_DECISION_INVENTORY.md` lines 1134–1145) is unchanged; `DEC-066`, `DEC-067`, `DEC-069`, `DEC-070`, and
every other `DEC` remain exactly as written. Any future amendment to a decision definition, or any
implementation of what a future version of this decision might ratify, requires its own explicit
authorization.
