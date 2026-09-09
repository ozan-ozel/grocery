# DEC-069 Implementation Architecture Investigation

**Document type:** Implementation-architecture investigation only. **No implementation, no schema
change, no migration, no code change of any kind. Does not amend DEC-069 or any other DEC. Does not
create a new DEC ID.**
**Date:** 2026-09-09
**Governance status (unchanged by this document):** DEC-067 CLOSED/IMPLEMENTED. DEC-068 CLOSED/DEFERRED
FOR V1. **DEC-069 CLOSED / V1 SCOPE RATIFIED (Option 3 — household-scale multi-day batch cooking,
leftovers, and storage-aware meal planning); implementation NOT STARTED before this document and NOT
STARTED after it.** DEC-070, DEC-071 unchanged.

> **SUPERSEDED IN PART — additive correction, original text below preserved for provenance.** A
> follow-up audit, `DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md` (2026-09-09), found the
> `PreparationBatch` shape proposed below (a singular `total_quantity` scalar plus an optional
> `source_combo_id` pointer, with no explicit composition snapshot) **insufficient**: it cannot
> represent a manually-assembled batch at all, and cannot safely reconstruct a Combo-originated batch's
> historical composition once `data/combos.json` is edited (confirmed unsafe by direct code evidence —
> `combos.json` has no versioning, and every existing read path resolves combo data live). The audit's
> result was **REVISION REQUIRED**, applied in a new "Revised Architecture (Post-Audit)" section near
> the end of this document. **Read that section as authoritative for the `PreparationBatch` shape; the
> `total_quantity`/`source_combo_id`-only shape below is retained as historical reasoning, not as a
> current recommendation.** DEC-069's ratified scope (Option 3) is unaffected by this correction.

---

## Scope

Answer, with code-verified evidence: *what is the smallest coherent architecture that could implement
the ratified DEC-069 scope without unnecessarily creating a new domain model?* This document does not
assume `Batch`, `PreparationEvent`, `Leftover`, `StorageState`, or `Portion` require separate entities —
each is investigated independently against the actual current codebase, and classified as an existing
concept, a derived concept, a field/relationship, or a genuinely new concept only where the evidence
requires it.

**Source of truth reconciled first (read, not modified):** `DEC-069_INVESTIGATION.md`, `2026-09-09-dec-
069-v1-scope-ratification.md`, `APP_DECISION_INVENTORY.md`, `APP_DECISION_DEPENDENCY_GRAPH.md`,
`APP_DECISION_MODEL.md`, `APP_DECISION_KNOWLEDGE_MAPPING.md`, `APP_DECISION_GAPS.md`,
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`, `docs/SESSION_CHECKPOINT.md`. The ratification's
explicit exclusions are treated as binding constraints on this investigation: no restaurant-scale
production, no pantry/inventory absorption (stays `DEC-065`/`DEC-072`), no automatic shelf-life
prediction or nutrient-retention coefficients, no personalization expansion (household size, storage
capacity) beyond what's already established, no general-purpose recipe-scaling engine beyond what the
ratified capability needs, and any future substitution must route through `DEC-063`.

---

## Existing Architecture Findings

A dedicated code-tracing pass (via an Explore subagent, all citations verified by direct file reads) was
performed across `MealPlanView.tsx`, `MealFoodPicker.tsx`, `TodayView.tsx`, `combos.ts`, `comboMatch.ts`,
`mealPlan.ts`, `localMealPlan.ts`, `meal-entries.ts`, `personal-plan.ts`, `nutrition.ts`,
`foodIdentity.ts`, `listActions.ts`, `data/combos.json`/`README.md`, and every `supabase/*.sql`
migration, plus a repo-wide search for leftover/batch/storage/shelf-life/preparation-event terminology.

**Headline finding: there is no `Meal`, `Recipe`, `Preparation`, `Batch`, or `Leftover` entity anywhere in
the codebase today.** What exists is a single flat fact table (`meal_entries`: one row = one
food+quantity+date+slot) and a static, file-based suggestion template (`Combo`, `data/combos.json`, no
database table at all). Every "meal" in the UI is a client-side grouping of `MealEntry` rows sharing a
`(date, slot)` pair — never a persisted object in its own right.

---

## Meal (current reconstruction)

**Not a database entity.** `src/lib/mealPlan.ts:3-11` (`MealEntry`) and `netlify/functions/meal-
entries.ts:15-24` (`MealEntryRow`) both model exactly one `(food, quantity, date, slot)` tuple:

```ts
export type MealEntry = {
  id: string; date: string; slot: MealSlot;
  foodId: string; quantityG: number; position: number; comboId: string | null;
};
```

A "meal" in `MealPlanView.tsx` is a UI-time grouping of rows sharing `(date, slot)` — `MEAL_SLOTS` is a
fixed 4-slot list (`localMealPlan.ts:19-26`). **No status field distinguishes a planned-future entry from
an already-eaten one.** The identical row shape and identical `POST /api/meal-entries` API path is used
for both a manual "Besin ekle" plan addition (`MealFoodPicker.tsx:65-71` → `MealPlanView.tsx:96`) and a
"Yedim" consumption log (`TodayView.tsx:185-195`, `eatCombo()`). The only difference is convention-by-
caller (which `date` is passed, whether `combo_id` happens to be set) — never a persisted fact.

---

## Combo

Full type, `src/lib/combos.ts:1-10`:

```ts
export type Combo = {
  id: string; nameTr: string; items: { foodId: string; grams: number }[];
  prepMinutes: number; tags: string[]; prepNote?: string;
};
```

**`Combo` is a static suggestion template, not a meal or a preparation event.** It is persisted only as a
hand-authored, client-bundled JSON file (`data/combos.json`) — confirmed no `combos` table exists in any
of the 16 `supabase/*.sql` migrations, and `data/README.md:28-47` states explicitly: *"Unlike
nutrition.json, this file is not uploaded to Supabase — it's bundled directly into the client build and
edited by hand."* **No user-created-combo mechanism exists at all** — no create UI, no POST/PUT endpoint;
only the ~16 hand-authored combos exist. `prepMinutes` is a static hands-on-time estimate on the
*template*, not a record of an actual cooking occurrence; `prepNote` is explicitly "informational only —
never parsed" (`combos.ts:8-9`). **`Combo ≠ Recipe` and `Combo ≠ preparation event`** — it has no
notion of "this happened once, on this date, yielding this much."

**`combo_id` on `meal_entries` identifies the static template, not an instance.**
`supabase/12-meal-entries-combo-id.sql:10-11` adds `combo_id text` (no FK, "additive, no backfill
needed"). If a user "ate combo X" on three separate days, all three groups of `meal_entries` rows carry
the **identical** `combo_id = "X"` string. **No field anywhere distinguishes "these three came from one
batch cooked once" from "made fresh three separate times."** `TodayView.tsx`'s own grouping
(`eatenGroups`, lines 99-123) groups by `comboId` strictly **within a single day** — it has no cross-day
concept and could not represent one with today's fields.

---

## MealEntry / meal_entries — persisted fields, exhaustively

`id, household_id, date, slot, food_id, quantity_g, position, combo_id, created_at`
(`supabase/07-meal-entries.sql:17-26` + `12-meal-entries-combo-id.sql`). No `status`, no `batch_id`, no
`servings`, no `preparation_date` distinct from `date`. `quantity_g` is a single absolute gram number per
row — already exactly the "quantity assigned to a planned meal" concept the task asks about; nothing new
is needed for that half.

---

## Shopping — meal → ingredients → shopping item

`TodayView.tsx:153-160` (`addComboToList`) calls `onAddItem(item.foodId, "\{grams}g", { exact: true })`
per ingredient. `listActions.ts:81-103` (`addItem`)'s merge logic:

```ts
const existing = active.items.find((i) =>
  resolvedFoodId && i.foodId ? i.foodId === resolvedFoodId : isCloseMatch(...)
);
if (existing) { /* re-check it, do NOT sum quantities */ return; }
```

**Confirmed: existence-deduplication only, never numeric aggregation.** A second add of the same
`food_id` re-marks the existing line unchecked; the `qty` string (free text, e.g. `"150g"`) from the
*first* add is never summed with a second. `Item.qty` is a free-text string, not a number
(`src/lib/store.ts`) — quantity summing isn't even representable today without a format decision. This is
a **pre-existing** shopping-layer limitation, not something DEC-069 introduces or must fix (see Shopping/
DEC-071 Compatibility below).

---

## A. Preparation Event

**Does DEC-069 require an explicit preparation event? Yes — as a grouping key, not necessarily as a
fact-holding entity in its own right, though evidence below shows it ends up needing to hold a small
number of facts too (merging with Batch, see below).**

What would be lost without one: the ability to answer "which later meals came from this one cooking
occasion" at all. Confirmed by the `combo_id` analysis above — the *only* existing cross-row reference
(`combo_id`) identifies a recipe template, never an instance, and cannot be repurposed for this without
losing the ability to distinguish two separate cook-once-eat-three-times occasions of the *same* combo
(e.g., two different weeks' batches of "tavuk-pirinç-brokoli"). A preparation event is therefore not
implicit in anything that exists today, not a derivable relationship, and not something metadata-only
fields on `meal_entries` alone can express (see Migration Surface below) — it is the one **genuinely new
concept** this investigation finds necessary.

## B. Batch

**Does DEC-069 require a separate Batch entity, distinct from Preparation Event? No — evidence shows
they collapse into one concept for this app's minimal-necessary scope.** "Batch cooking" *is* "a
preparation event that yields more than one serving" — there is no daylight between "the event of
cooking" and "the quantity that resulted from it" that this app's ratified scope needs to track
separately. Splitting them into two tables would duplicate a 1:1 relationship with no represented
benefit (tested and rejected under Outcome 2 below). **Recommendation: one merged concept,
`PreparationBatch`, holding both the event fact (when, from what) and the batch fact (how much).**

## C. Portion

**Does DEC-069 require an explicit Portion concept, distinct from existing gram quantities? No.**
`scaleNutrition()` (`src/lib/mealNutrition.ts:19-31`) is confirmed **completely gram-source-blind** — its
signature is `(nutrition: Nutrition, quantityG: number) => MacroTotals`, with `factor = quantityG / 100`
and no branch or metadata parameter of any kind. Feeding it "100g allocated from a 500g batch" requires
**zero code change**, identical to feeding it "100g of a fresh single-serving meal." The task's own
distinction —

```text
quantity of prepared food   →  a new field on PreparationBatch (the batch's total)
quantity assigned to a meal →  the EXISTING meal_entries.quantity_g, unchanged
```

— is already fully supported by the existing schema. **No serving/yield abstraction is invented.** The
batch's total quantity is the only new number needed, and it lives on the one new `PreparationBatch`
row, not as a new per-meal concept.

## D. Leftover

**Does a leftover require its own persisted object? No — it is a derived concept.** Minimum information
required to know "this later planned meal is supplied by food prepared earlier" is exactly: a
`meal_entries` row whose (new) `batch_id` points at a `PreparationBatch` created on an earlier date. "Is
this a leftover" is then a computed fact (`meal_entries.date > preparation_batch.prepared_date`), not a
status that needs to be written anywhere. No `Leftover` table, no `is_leftover` boolean, no separate
relationship object.

## E. Storage State

**Minimum representation, explicitly not inventing shelf-life science:** a single optional free-text
field on the new `PreparationBatch` row (e.g. an informational storage note), directly analogous to
`DEC-067`'s already-shipped `Combo.prepNote` precedent — plain descriptive text, never parsed, never
consulted by any logic. **Explicitly rejected as out of scope for this minimal architecture:** structured
shelf-life duration fields, automatic expiry calculation, storage-location enums, or any
nutrient-retention modeling — none of these are required to satisfy "storage-aware planning" at the
ratified scope's own bounded level, and the ratification record explicitly prohibits inventing them.
**Classification: REQUIRED at the free-text-note level (matches the ratified capability's own
"representation of relevant storage state/information" language); anything more structured is DEFERRED,
pending its own human decision** (see Requires Human Decision, below).

---

## Multi-day Model — Four Models Compared

### Model A — Existing MealEntry extension only (no new table)

Add fields directly to `meal_entries` (e.g. a `batch_id`-shaped column) and nothing else.
**Insufficient, evidenced by the schema's own idiom.** A "batch" needs shared facts (total quantity,
prepared date, storage note) visible to *every* `meal_entries` row that draws from it, across multiple
dates. Storing those facts as columns on `meal_entries` itself would require duplicating the same
batch-total/date/note on every one of that batch's child rows — a denormalization no existing table in
this schema performs (every one-to-many "shared parent fact" relationship here — `lists`→`items`,
`households`→`lists` — uses a separate parent table plus a foreign-key-less pointer column on the child,
never redundant copies on every child). Model A alone either loses the batch-level facts entirely (a
valid but narrower scope that fails to satisfy "storage-aware planning," since there'd be nothing to
attach a storage note to) or violates the schema's own established pattern.

### Model B — Preparation Event + MealEntry relationship

```text
PreparationBatch  →  prepared quantity, prepared date, optional source combo, optional storage note
      ↑ (nullable, FK-less pointer, mirroring the existing combo_id precedent exactly)
MealEntry         →  unchanged shape + one new nullable batch_id column
```

**Matches the schema's own established idiom exactly** (same shape as the already-shipped `combo_id`
addition in `12-meal-entries-combo-id.sql`). Sufficient to represent everything the ratified scope needs
(§ A–E above), with zero denormalization and zero duplicated facts.

### Model C — Batch as primary persisted object with its own "planned portions" sub-rows

```text
Batch → ingredients, total quantity, planned portions (as separate rows), storage state
```

**Rejected as unnecessary duplication.** `meal_entries` *already is* "a food+quantity assigned to a
date+slot" — introducing a second, parallel "batch portion" allocation table would duplicate
`meal_entries`' existing responsibility rather than extend it. The existing row is the "planned portion";
it only needs a pointer to the batch it came from (Model B), not a whole new representation of the same
fact.

### Model D — Derived relationship / minimal metadata, no major new persistent entity

Tested explicitly, per instruction not to assume any model is correct: could a bare shared grouping ID
(a client-generated UUID stamped as a new `meal_entries` column, with **no** backing table at all, every
batch-level fact derived by aggregating the rows that share it) suffice? **Partially — it satisfies A/C/D
above (grouping, portion reuse, leftover-as-derived), but fails E.** Without a parent row, there is
nowhere to record (a) a storage note independent of any specific meal, or (b) a batch total quantity
*larger* than the sum of what's been allocated to meals so far (e.g., "I made 1000g and have only planned
600g worth of meals — the other 400g exists but isn't yet assigned anywhere"). Since the ratified scope
explicitly includes "representation of relevant storage state/information" (ratification §1), Model D
under-delivers on a capability the human decision already selected. **Rejected as insufficient for the
actual ratified scope, though it would be sufficient for a narrower, unratified scope that dropped
storage representation.**

---

## Combo Compatibility

**Existing combos continue to function completely unchanged.** `PreparationBatch` is a new, independent
table; nothing about `Combo`'s shape, `data/combos.json`, or `comboMatch.ts`'s suggestion/filtering logic
needs to change. A `PreparationBatch` row *may* optionally carry a nullable `source_combo_id` (mirroring
the existing FK-less `combo_id` pattern) if the batch was cooked from a suggested combo — but this is a
convenience link, not a requirement; a batch could equally be created from a manually-assembled set of
foods with no combo involved at all. **Combo is not turned into a "fundamentally different entity" by
any part of this architecture.**

## MealEntry Compatibility

**Planned meals remain `MealEntry` records, unchanged in every existing field.** A `MealEntry` gains
exactly one new optional field (`batchId: string | null`), following the identical pattern already
established by `comboId: string | null`. Every existing `meal_entries` row (with `batch_id = NULL`) is
unaffected — no backfill required (same precedent already used for `combo_id`,
`12-meal-entries-combo-id.sql:8`: "additive, no backfill needed").

## Food Identity Compatibility

**Confirmed unaffected — no new identity surface is introduced.** A `PreparationBatch` row does not need
to hold its own food references at all under Model B; the actual foods and their canonical identities
remain exactly on the `meal_entries.food_id` rows that reference the batch, resolved through the existing
`foodIdentity.ts` chain exactly as today. No opaque `food_id` reference is replaced or supplemented with a
string fallback anywhere in this architecture.

## Nutrition Compatibility

**`scaleNutrition()` requires zero modification.** Confirmed above (§C) — it is already blind to where a
gram quantity came from. Total nutrition for a `meal_entries` row that draws from a batch is computed
identically to a fresh-cooked row today; only the *upstream* question of what `quantityG` equals (a
manually-typed number today, or a batch-allocated number under this architecture) differs, and that
question is entirely outside `mealNutrition.ts`'s existing, unmodified responsibility.

## Safety Compatibility

**Preserved, provided one invariant holds: a batch's food set is fixed at creation and never
substituted afterward.** Exclusion filtering (`comboMatch.ts`'s hard/soft tiering, `foodExclusions.ts`)
already runs at food/combo-selection time — i.e., at the moment a `PreparationBatch` would be created
(the same UI moment that exists today for adding a combo or logging a food), using the exact same,
unmodified mechanism. Once a batch is created, every later `meal_entries` allocation from it references
the same, already-vetted `food_id`s — **no per-allocation re-check is architecturally necessary**, because
scaling/re-allocating a fixed food set changes quantities, never identities (mirrors the identical finding
already established for pure scaling in `DEC-069_INVESTIGATION.md` §11). **Direct answer to "where does
exclusion evaluation happen if one batch feeds several meals":** once, at batch-creation time, via the
existing mechanism — never re-evaluated per allocation. **The one safety invariant this architecture
requires and does not itself enforce (a future implementation task's responsibility):** no mechanism may
ever substitute a food *within* an existing batch after creation without routing through `DEC-063`; doing
so outside that path would be the one way this design could introduce a safety bypass.

## Shopping / DEC-071 Compatibility

**No DEC-071 redesign is required.** Today's "add to shopping list" already operates as **one call per
combo/selection event**, not once per day the food is eaten (`addComboToList`, `TodayView.tsx:153-160`).
Under this architecture, "add a batch to the shopping list" would likewise be **one call, using the
batch's total ingredient quantities** (the combo's `items[].grams` scaled to the batch's total yield, or
a manually-assembled total) — made once, at batch-creation time, exactly mirroring the existing
one-call-per-add pattern. This sidesteps the pre-existing non-aggregation limitation in `listActions.ts`
(§ Shopping, above) entirely for the batch case, since there is no need to sum quantities across multiple
separate adds — the total is computed once, upstream, before the single shopping-list call.
**Pre-existing, unrelated limitation, inherited as-is, not fixed by this architecture:** if a user
*also* manually adds one of a batch's ingredients separately, `listActions.ts`'s existing
existence-only dedup (no quantity summing) still applies — a `DEC-071`-scope improvement, not a `DEC-069`
requirement, flagged under Requires Human Decision.

## Legacy Compatibility

Every existing `meal_entries` row is compatible with `batch_id = NULL` by default (additive, no
backfill — same precedent as `combo_id`). Existing `combos.json` entries require zero change. Existing
shopping items require zero change. **Migration classification: mandatory only if this architecture is
implemented at all** (one new table + one new nullable column on `meal_entries`); **no data backfill is
required**; the storage-note field's exact shape (§E) is the one sub-decision that could be deferred
independently without affecting the rest of the migration.

---

## Minimal Architecture Test

**Outcome 0 — no new persisted concept: REJECTED.** Without *some* shared identifier connecting multiple
`meal_entries` rows across different dates, there is no way to represent "these three meals came from one
batch" at all — confirmed impossible today (`combo_id` only identifies the recipe template, never an
instance). Outcome 0 would mean the ratified capability is not actually implemented.

**Outcome 1 — one new concept: RECOMMENDED.** A single `PreparationBatch`-shaped table (merging
"preparation event" and "batch," per §A/§B) plus one new nullable `batch_id` pointer column on
`meal_entries` (the pointer itself is plumbing, not a second concept — exactly as `combo_id` was never
counted as a concept distinct from `Combo`). Sufficient for A–E above with zero denormalization, zero
changes to `Combo`/nutrition/identity/exclusion logic, and no duplication of existing architecture.
**Correction (later audit):** "sufficient for... E" (Storage State) understated what `PreparationBatch`
itself must hold — a later audit found the *internal shape* sketched in this pass (a scalar
`total_quantity` + `source_combo_id` pointer, no explicit per-food composition) insufficient; see the
"Revised Architecture (Post-Audit)" section near the end of this document. The "one new concept, not
two or more" conclusion of Outcome 1 itself is unaffected — only what that one concept must contain.

**Outcome 2 — two new concepts: REJECTED.** Splitting "preparation event" and "batch" into two separate
tables was tested (§B) and found to duplicate a 1:1 relationship for no represented benefit — nothing in
the ratified scope or the current app distinguishes "the act of cooking" from "the quantity it produced"
as independently-lifecycled facts.

**Outcome 3+ — three or more new concepts: REJECTED.** A separate `Leftover` table and/or a separate
`Portion`/`StorageState` table were both tested (§C, §D) and found to duplicate information already
recoverable from `meal_entries.quantity_g` + the one new `batch_id`/`PreparationBatch` pair — violating
"minimum sufficient architecture without semantic loss."

---

## Architecture Options

| Option | New Concepts | Multi-day Batch | Leftovers | Storage | Shopping | Complexity | Risks |
|---|---|---|---|---|---|---|---|
| **Model A** — extend `MealEntry` only, no new table | 0 tables, N fields | Cannot represent shared batch facts without denormalizing onto every child row | Derivable only if batch facts exist somewhere — they don't here | No home for a storage note without duplicating it per row | Unaffected | Low | Loses batch-level facts entirely, or violates schema idiom by duplicating them per row |
| **Model B** — `PreparationBatch` + `MealEntry.batch_id` (**Outcome 1**) | 1 table + 1 nullable column | Fully represented via shared pointer | Derived (later-dated row referencing an earlier batch) | Optional free-text note on the batch row | One call per batch, mirrors existing one-call-per-combo pattern | Low–Moderate | None found beyond the stated food-substitution invariant (§ Safety) |
| **Model C** — `Batch` with its own "planned portion" sub-rows | 2 tables (batch + portions) | Represented, but duplicates `meal_entries`' existing role | Same duplication | Same as Model B | Same as Model B, plus a second place quantities could drift out of sync | Moderate–High | Two sources of truth for "what's planned," risk of divergence |
| **Model D** — derived grouping key only, no backing table | 0 tables, 1 column | Represented for grouping, not for unallocated surplus | Derived | **Not representable** independent of a specific meal | Unaffected | Lowest | Fails the ratified scope's own storage-representation requirement |

---

## Recommended Architecture

1. **Reuse, unchanged:** `Combo` (as a suggestion template only), `meal_entries`/`MealEntry` (its
   existing fields), `mealNutrition.ts`'s `scaleNutrition()`, `foodIdentity.ts`'s resolution chain,
   `comboMatch.ts`/`foodExclusions.ts`'s exclusion filtering, `listActions.ts`'s existing add/dedup
   logic.
2. **Extend, minimally:** `meal_entries` gains one new nullable `batch_id` column (FK-less, mirroring
   the existing `combo_id` precedent exactly — additive, no backfill).
3. **Newly introduce:** exactly one new concept, `PreparationBatch` (naming not decided here) — holding
   the batch's own total-quantity/yield, prepared date, an optional nullable pointer to the `Combo`
   template it was based on (if any), and an optional free-text storage note. This is the smallest
   addition that satisfies the ratified scope without semantic loss.
4. **Remain derived, not persisted:** "leftover" status (computed from `batch_id` + date comparison);
   "portion" (the existing `quantity_g` field, unchanged in meaning).
5. **Remain explicitly outside DEC-069:** pantry/inventory tracking (`DEC-065`/`DEC-072`); any
   structured shelf-life/expiry model; any nutrient-retention coefficient; restaurant/professional-scale
   batch fields; household-size-based personalization; a general-purpose recipe-scaling engine beyond
   what one batch's own total-quantity field requires.
6. **Should NOT be built:** Model C's separate portion-allocation table (duplicates `meal_entries`);
   Model D's zero-table approach (fails the storage-representation requirement); any structured
   storage-location/duration field beyond free text (not evidenced as required, and explicitly
   prohibited from inventing shelf-life science).

This recommendation is **minimal, evidence-based, and tied directly to the ratified Option 3 scope** — it
introduces exactly the one concept the evidence shows is unavoidable (§ Minimal Architecture Test,
Outcome 1), reuses everything else unchanged, and does not attempt to be "cleaner" at the cost of
duplicating existing responsibility (Model C) or under-delivering the ratified capability (Model D).

**Superseded in part — see "Revised Architecture (Post-Audit)" near the end of this document.** Item 3
above ("total-quantity/yield" as a singular field, with `source_combo_id` as the only combo-related
data) was found insufficient by `DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md`: a single scalar cannot
represent a multi-food batch's per-food quantities, and `source_combo_id` alone cannot safely
reconstruct historical composition once `combos.json` is edited. The one new concept (`PreparationBatch`)
and everything in items 1, 2, 4, 5, 6 above remain correct and unchanged by the correction — only the
*internal shape* of `PreparationBatch` itself is revised, not the "exactly one new concept" conclusion.

---

## Required Future Implementation Work

**Required for DEC-069:**
- Design and create the one new `PreparationBatch`-shaped table (exact column list, naming, and whether
  the storage note is truly free-text or given minimal structure — not decided here).
- Add the one new nullable `batch_id` column to `meal_entries`.
- Client-side: a way to create a `PreparationBatch` (from a combo, scaled up, or from manually-assembled
  foods) and a way to allocate portions of it into specific future `meal_entries` rows.
- Rendering: surface "this meal came from a batch prepared on date D" and the optional storage note in
  the UI (`TodayView.tsx`/`MealPlanView.tsx`), following the existing `prepNote` display precedent.

**Required for DEC-071 integration:**
- A single "add this batch's total ingredients to the shopping list" action, computed once from the
  batch's total quantity (mirrors `addComboToList` exactly, scaled).

**Optional enhancement (not required by the ratified scope):**
- Numeric quantity aggregation in `listActions.ts` (would benefit both batch and non-batch shopping adds
  equally) — a `DEC-071`-scope question, not created or decided here.
- A nullable `source_combo_id` link from `PreparationBatch` back to the `Combo` template used, if any.

**Future scope (explicitly not part of this architecture):**
- Structured storage-location/duration fields, automatic expiry surfacing.
- Restaurant/professional-scale batch production (`DEC-069`'s own unratified sub-question).
- Pantry/inventory deduction as a batch is consumed (`DEC-065`/`DEC-072` territory).
- Household-size-aware batch sizing.

**Explicitly excluded:**
- Any nutrient-retention-across-storage coefficient (usability assumption U6 remains untested — see
  `DEC-069_INVESTIGATION.md` §7).
- Any new substitution mechanism (must route through `DEC-063` if ever needed).
- Any change to `DEC-053`/B3 exclusion semantics or precedence.

---

## Requires Human Decision

The following are flagged, not resolved, per instruction:

1. **Whether the storage note (§E) ships at all in the first implementation pass**, or whether v1 defers
   storage representation entirely and only implements the batch/leftover multi-day mechanism —
   **REQUIRES HUMAN DECISION.**
2. **Whether a `PreparationBatch` should optionally link back to a `Combo` template**, or whether batches
   are always freeform (manually assembled foods) — **REQUIRES HUMAN DECISION** (a design nicety, not
   architecturally required either way). **Narrowed by the later audit:** the answer is structurally
   "yes, as optional, non-authoritative provenance via `source_combo_id`" (see "Revised Architecture
   (Post-Audit)" above) — what remains open is only whether that link is worth building at all, not its
   shape if built.
3. **Whether `listActions.ts`'s existing non-quantity-aggregating dedup behavior should be improved** as
   part of this work or left exactly as-is — **REQUIRES HUMAN DECISION**, and is orthogonal to DEC-069
   (belongs to `DEC-071`'s own future scope, not created or expanded here).
4. **Whether per-household-member attribution of a shared batch's leftovers is ever needed** (today
   `meal_entries` has no field distinguishing which household member ate what — only tenant-level
   `household_id` scoping exists) — a **pre-existing limitation, unrelated to DEC-069**, noted for
   completeness, not resolved here.

---

## Artifact

`nutrition-curriculum/08_APP_TRANSLATION/DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` (this
file) — the only file created by this task. `DEC-069_INVESTIGATION.md` was read, not modified.

---

## Open Questions (§17 checklist, answered or marked UNRESOLVED)

- **What exactly is a preparation event?** Answered (§A/§B) — merged with "batch" into one
  `PreparationBatch` concept; not split further.
- **What exactly constitutes a batch?** Answered — a `PreparationBatch` row: total quantity/yield,
  prepared date, optional combo link, optional storage note.
- **How is prepared quantity represented?** Answered — a new field on `PreparationBatch` (total).
- **How is quantity allocated to meals?** Answered — the existing, unchanged `meal_entries.quantity_g`.
- **How is leftover quantity represented?** Answered — derived (later-dated allocation referencing an
  earlier batch), not persisted separately.
- **How is storage state represented?** Answered at the minimal level (§E); the exact shape is
  **REQUIRES HUMAN DECISION** (item 1 above).
- **How are multiple days linked?** Answered — via the shared `batch_id` pointer across `meal_entries`
  rows on different dates.
- **Where does batch provenance live?** Answered — on the `PreparationBatch` row itself (optional
  `source_combo_id`), not duplicated onto every `meal_entries` allocation.
- **How does shopping aggregate batch ingredients?** Answered (§ Shopping/DEC-071 Compatibility) — one
  call per batch, computed once from the batch's total, mirroring the existing per-combo add pattern; no
  new aggregation logic required in `listActions.ts` for the batch case specifically.
- **How does the architecture interact with existing `MealEntry`?** Answered — one new nullable column,
  every existing row unaffected.
- **How does it interact with `Combo`?** Answered — zero required change; an optional nullable link only.
- **Is a database migration unavoidable?** Answered — yes, if this architecture is implemented at all
  (one new table + one new column), but it is additive with no backfill, mirroring an already-shipped
  precedent (`combo_id`).
- **Can the feature be implemented with minimal schema extension?** Answered — yes: exactly one new
  table and one new nullable column is the evidenced minimum (Outcome 1); no larger schema change is
  justified by the evidence.

No item above is marked UNRESOLVED at the architectural level — the only genuinely open items are the
four human-decision points listed above, which are product/scope choices, not architecture questions
this investigation could resolve from evidence.

---

## Revised Architecture (Post-Audit)

**Added 2026-09-09, after `DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md` — authoritative for the
`PreparationBatch` shape. Everything above this section is preserved as the original investigation's
reasoning; only the `PreparationBatch` internal shape is corrected here, per that audit's REVISION
REQUIRED finding.**

### Original architecture finding

This document originally proposed:

```text
PreparationBatch
  ├── total_quantity        (a single scalar)
  ├── prepared_date
  ├── storage_note?
  └── source_combo_id?

MealEntry
  └── batch_id?
```

### Audit correction

The follow-up audit proved this insufficient on two independent grounds: (1) a single `total_quantity`
scalar cannot represent a multi-food batch's per-food quantities at all (Batch A's 1000g chicken/800g
rice/500g broccoli cannot be recovered from one number); and (2) `source_combo_id` alone cannot safely
reconstruct a Combo-originated batch's historical composition, because `data/combos.json` has no
versioning and every existing read path (`comboMatch.ts`, `TodayView.tsx`) resolves combo data **live** —
a later edit to that combo's `items` would silently and permanently corrupt any batch that relied on
resolving the pointer instead of storing its own copy. A manually-assembled batch (no combo at all) had
**no** composition representation whatsoever under the original shape.

### Revised architecture

```text
PreparationBatch
  ├── id
  ├── household_id
  ├── prepared_date
  ├── storage_note?              (optional, free text, informational only — unchanged)
  ├── source_combo_id?           (optional, provenance ONLY — never authoritative for composition)
  └── composition: { food_id, quantity_g }[]   ← the correction: an immutable snapshot, captured once
                                                   at creation, reusing Combo.items' existing shape

MealEntry
  └── batch_id?                  (nullable, FK-less — unchanged from the original proposal)
```

`source_combo_id` may assist in *populating* the initial `composition` snapshot for a Combo-originated
batch (a convenience at creation time), but is never consulted again afterward — every later read of a
batch's composition reads `composition` directly, never `source_combo_id`. A manually-assembled batch
sets `composition` directly, with `source_combo_id` left null.

### Consequences

- **Historical integrity:** preserved — `composition` is immutable once written, independent of any
  future edit to `combos.json`.
- **Food Identity:** preserved — `composition[].food_id` is the canonical opaque identity, resolved once
  at creation via the existing, unmodified `foodIdentity.ts` chain; never a name string, never fuzzy-
  matched.
- **Safety provenance:** preserved and strengthened — the food set evaluated against hard/soft
  exclusions at batch-creation time is now *provably* fixed thereafter (it cannot silently change via an
  external combo edit), closing a staleness risk the original, pointer-only shape did not guard against.
- **Leftover derivation:** unaffected — leftover remains a derived read-time aggregate:
  `remaining(batch, food) = composition[food].quantity_g − SUM(meal_entries.quantity_g WHERE batch_id,
  food_id)`. No `Leftover` entity is introduced.
- **Combo independence:** preserved — `Combo`, `combos.json`, and `comboMatch.ts` require zero changes;
  a batch's `composition` is entirely independent of the combo template once captured.
- **Manual-batch support:** now fully supported — a manually-assembled batch has exactly the same
  `composition` shape as a Combo-originated one, with `source_combo_id` simply left null.
- **DEC-071 input integrity:** improved — DEC-071 (not redesigned here) would consume the same
  provenance-independent `composition` shape regardless of batch origin, rather than a value that could
  drift depending on whether and when a source combo was later edited.

This revision does not change the "exactly one new concept" conclusion (Outcome 1, above) — only what
that one concept, `PreparationBatch`, must contain. No new entity (`Leftover`, `Recipe`, `Meal`, or a
separate `BatchComposition`/`BatchIngredient` table) is introduced; the composition snapshot is a field/
sub-structure of `PreparationBatch` itself, reusing `Combo.items`' existing `{foodId, grams}` shape at a
new granularity (per-instance, immutable) rather than inventing a new one. The exact persistence shape
(a child table vs. an embedded array/JSON column) remains an implementation detail, not decided here.

---

## Validation

**Governance:** DEC-069 remains CLOSED / V1 SCOPE RATIFIED; implementation remains NOT STARTED; DEC-067,
DEC-068, DEC-070, DEC-071 unchanged; no DEC ID created; no DEC definition amended.

**Architecture / implementation:** no schema changed, no migration created, no API changed, no UI
changed, no JSON changed, no nutrition logic changed, no Food Identity changed, no allergen/exclusion
logic changed, no shopping logic changed. Every finding above is descriptive/comparative, not a code
change.
