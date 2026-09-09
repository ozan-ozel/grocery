# DEC-069 Batch Composition Architecture Audit

**Document type:** Narrow follow-up architecture/data-model audit. **Investigation only — no
implementation, no schema change, no migration, no DEC modification, no new DEC ID.**
**Date:** 2026-09-09
**Governance status (unchanged by this document):** DEC-067 CLOSED. DEC-068 CLOSED/DEFERRED FOR V1.
**DEC-069 CLOSED / V1 SCOPE RATIFIED (Option 3) — not reopened, not reconsidered.** DEC-070, DEC-071
unchanged. This audit does not touch, overwrite, or invalidate
`DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`, which remains intact as historical evidence.

---

## 1. Executive Conclusion

**Result: REVISION REQUIRED** (applies to the specific `PreparationBatch` shape proposed in
`DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` — not to the DEC-069 product decision, which is
unaffected and not reopened).

**Exact semantic conclusion:** `source_combo_id` alone is **provably insufficient**, confirmed by direct
code evidence, not inference. A `PreparationBatch` that stores only a pointer to a `Combo` template
cannot: (a) represent a manually-assembled batch at all (there is no combo to point to), and (b) safely
reconstruct a Combo-originated batch's historical composition, because `data/combos.json` has no
versioning, no snapshot, and no change-history mechanism of any kind — the codebase's own established
pattern is "resolve live via id," which is exactly the property that makes a bare pointer unsafe for a
multi-day, historically-load-bearing record. The fix is not an additional entity but a **correction to
what the batch itself must store**: an explicit, immutable copy of its `{food_id, quantity_g}`
composition at creation time, reusing `Combo.items`' existing shape rather than inventing a new one.
This also closes a real **safety** gap, not just a correctness one (§11).

**No new human product-level decision is required.** This is an implementation-correctness/safety
finding, not a scope question — DEC-069's ratified scope (Option 3) is unaffected either way. The
schema-shape choice (child table vs. an array/JSON field) is an implementation detail, explicitly not
decided here.

---

## 2. Original Architecture Under Audit

From `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` ("Recommended Architecture" and "Minimal
Architecture Test"):

```text
PreparationBatch
  ├── total_quantity          (as proposed: a single scalar)
  ├── prepared_date
  ├── storage_note (optional, free text)
  └── source_combo_id (optional, nullable, FK-less)

MealEntry
  └── batch_id (new, nullable, FK-less)
```

That document's own "Combo Compatibility" section explicitly left open whether a batch "was cooked from
a suggested combo" or "manually-assembled foods with no combo involved," without proving both cases
preserve equivalent information — this is the exact gap this audit was commissioned to close.

---

## 3. Central Semantic Gap

Restated precisely: **the original proposal never specifies where a batch's own list of foods and
per-food quantities lives.** `source_combo_id` was implicitly assumed to answer this for Combo-originated
batches (by pointing at `Combo.items`), and `total_quantity` (a singular scalar) cannot answer it at all
for a multi-food batch (Batch A in §4 has three foods — a single "total quantity" number cannot
distinguish 1000g chicken from 800g rice from 500g broccoli, let alone let the app compute *per-food*
remaining amounts). **This is a second, independent defect beyond the combo-vs-manual question**,
surfaced by working through the required semantic test in §4, and is corrected by the same fix (§7).

---

## 4. Current Repository Evidence

A dedicated code-tracing pass (Explore subagent, all citations verified by direct file reads) confirmed
the following, precisely:

- **`Combo` type** (`src/lib/combos.ts:1-10`): `items: { foodId: string; grams: number }[]` is the *only*
  place composition lives on the type. No version field, no timestamp, no revision id.
- **`data/combos.json`**: a flat, hand-edited JSON array, confirmed the sole source of combo composition
  (no `combos` table exists in Supabase). **No versioning, no changelog, no runtime history of any kind**
  — `data/README.md:46-47`: *"this file is not uploaded to Supabase — it's bundled directly into the
  client build and edited by hand."* If `items` for an existing `id` is edited in a future commit,
  nothing in the running application detects, diffs, or preserves the prior array.
- **`MealEntryRow`** (`src/lib/mealPlan.ts:13-22`, `netlify/functions/meal-entries.ts:15-24`, backed by
  `supabase/07-meal-entries.sql` + `12-meal-entries-combo-id.sql`): exact live columns —
  `id, household_id, date, slot, food_id, quantity_g, position, combo_id, created_at`. **No field stores
  a snapshot of "what the combo's items were" at write time.**
- **`comboMatch.ts`**: `resolveItems()` (lines 25-33) and `scoreAllCombos()` (lines 80-107) always read
  `combo.items` **live** off the in-memory `Combo[]` loaded fresh from `combos.json` — no caching layer,
  no persisted copy anywhere in this file's call chain.
- **`TodayView.tsx`'s `addComboToList`/`eatCombo`** (lines 153-160, 185-195): **confirmed — no copy of a
  combo's ingredient list is ever written anywhere.** `eatCombo` creates one `meal_entries` row per
  ingredient containing only `{foodId, quantityG, comboId}` — the string `combo_id`, nothing more. Every
  later read (e.g. "Bugün yediklerin" grouping) **re-resolves `combo_id` against the live `COMBOS`
  array**, meaning a later edit to that combo's JSON would silently and retroactively reinterpret old,
  already-logged entries.
- **Shopping `Item` type** (`src/lib/store.ts:5-23`): **no `comboId`, no `mealEntryId`, no source link of
  any kind.** `listActions.ts`'s `addItem` (lines 56-117) persists only `name, qty (free text), checked,
  addedAt, category?, foodId?` — once added, a combo-derived shopping line is indistinguishable from a
  hand-typed one.
- **Every `supabase/*.sql` file** (all 16 read): confirmed **no `combos`, `combo_items`, `batch`, or
  `batch_ingredients` table of any kind.** `combo_id` (`12-meal-entries-combo-id.sql:10-11`) is plain
  `text`, no FK, no trigger, no audit table.
- **Established codebase precedent, confirmed explicitly:** "reference and resolve live" is the
  documented convention, not "snapshot at write time." `netlify/functions/meal-entries.ts:6-9`: *"Nutrition
  is never stored here — always derived client-side from food_id + quantity_g."* `07-meal-entries.sql`'s
  own comment: `food_id` "has no FK... a nutrition row can be renamed/removed independently of past meal
  entries" — the design deliberately accepts that a single day's historical log may reinterpret under a
  renamed/edited nutrition row. **This precedent does not, by itself, prove the same tolerance is safe for
  a multi-day batch record** — see §13.

---

## 5. Combo-Originated Batch Analysis

Under the **original** proposal (`source_combo_id` only, no snapshot): at creation time, the batch's
composition is fully known (it's whatever `combos.json` currently says for that `id`). But nothing is
copied — the batch record itself stores no foods, no quantities. Every later read of "what was in this
batch" would have to re-resolve `source_combo_id` against the **current** `combos.json`. If that combo's
`items` array is ever edited after the batch was created (a plain git-tracked hand-edit, with zero
versioning per §4), **the batch's true original composition becomes permanently unrecoverable** — the
application would silently substitute the new, edited composition and present it as if it had always been
the batch's contents. This is not a theoretical risk; it is the same live-resolution behavior already
observed for `combo_id` on `meal_entries` today (§4), simply operating over a longer, multi-day exposure
window where an intervening edit is more likely to matter.

## 6. Manual Batch Analysis

Under the original proposal, a manually-assembled batch (no `Combo` involved at all) has **no
`source_combo_id` to set**, and therefore **zero recorded composition of any kind** — `total_quantity`
alone (a singular scalar, per §3) cannot even represent which foods are in a multi-food batch, let alone
their individual quantities. **The original architecture cannot represent Case B at all**, not merely
imperfectly. This alone is sufficient to fail the central audit question's "without semantic loss"
requirement, independent of the historical-integrity concern in §5.

---

## 7. Batch Composition Requirements

**Answering §5 of the task's audit questions directly:**

- **Where is the complete Food set of a batch stored?** In the original proposal: nowhere, for a manual
  batch; implicitly in `combos.json`, for a Combo-originated one (unsafe, per §5).
- **Where is the quantity of each Food originally prepared stored?** Nowhere explicitly in the original
  proposal — `total_quantity` is a scalar, not a per-food quantity list.
- **Can a manually assembled batch preserve that information?** Not under the original proposal (§6).
  **Yes**, if the batch stores its own explicit `{food_id, quantity_g}[]` list at creation.
- **Can a Combo-originated batch reconstruct it safely?** Not by live-resolving `source_combo_id` (§5).
  **Yes**, if the batch copies `Combo.items` into its own explicit list at the moment of creation, rather
  than storing only a pointer.
- **What happens if `source_combo_id` is absent?** Under the corrected model: nothing is lost, since
  `source_combo_id` becomes purely informational provenance metadata, never load-bearing for
  reconstructing composition.
- **Is relying on the current Combo definition safe for historical batch reconstruction? What happens if
  a Combo is later edited?** No, confirmed unsafe (§5) — a later edit silently and permanently corrupts
  any batch that relied on live resolution.
- **Is historical batch composition immutable or reconstructable?** It must be made **immutable at
  creation** — reconstruction from a mutable external source (the combo template) is proven unsafe.
- **Can composition be represented without introducing unnecessary duplication?** Yes, and it should be
  **justified, deliberate duplication**, not accidental drift-prone duplication: the batch's composition
  snapshot reuses the *exact existing shape* already used by `Combo.items` (`{foodId, grams}[]`,
  `combos.ts:3`) — this is not a new data shape, only a new place that shape is persisted (per batch
  instance, immutably, rather than only in the live, mutable template). This directly satisfies §7's
  "concept minimization" instruction: no new kind of structure is invented, only an existing, already-
  proven shape applied at a new granularity.

**Corrected minimum requirement:** `PreparationBatch` must carry an explicit, immutable
`composition: {food_id: string, quantity_g: number}[]` captured at creation time. The originally-proposed
`total_quantity` (singular scalar) should be retired in favor of this per-food list — it was
under-specified for any batch containing more than one food, independent of the combo-vs-manual question.

---

## 8. Allocation Requirements

**Answering the task's Audit Question B:** yes, the existing `meal_entries.quantity_g` field can safely
represent allocation from a batch, **once composition is stored per-food** (§7). For Batch A
(1000g chicken / 800g rice / 500g broccoli), each meal draws separate `meal_entries` rows (one per
ingredient, exactly the app's existing row-per-ingredient pattern — confirmed unchanged, §4), each
carrying the new nullable `batch_id` plus the existing `food_id`/`quantity_g`. Remaining is then a
**read-time aggregate**, not a stored counter:

```text
remaining(batch, food) = batch.composition[food].quantity_g
                        − SUM(meal_entries.quantity_g WHERE batch_id = batch.id AND food_id = food)
```

For the worked example: `remaining(A, chicken) = 1000 − (200 + 200) = 600`; `remaining(A, rice) =
800 − (160 + 160) = 480`; `remaining(A, broccoli) = 500 − (100 + 100) = 300` — matching the required test
exactly, **for both Case A and Case B**, since the aggregate depends only on the batch's own snapshot
composition and its child `meal_entries` rows (which already have an unambiguous, unmodified shape) — not
on whether a `Combo` was ever involved. **No missing linkage or invariant beyond the batch_id pointer
itself** — no new field is needed on `MealEntry` beyond what the original investigation already proposed.
**One invariant worth stating explicitly:** allocation is safely derivable *at read time* precisely
because `meal_entries` rows are themselves append-mostly historical facts within the same table (already
the case today, unrelated to this audit) — unlike combo/nutrition-catalog content, they are not resolved
against a separate, independently-mutable template. This is the precise distinction between "safe to
derive live" (allocation, from `meal_entries`) and "unsafe to derive live" (composition, from
`combos.json`) that this audit's central finding rests on.

---

## 9. Leftover Derivation

**Answering the task's Audit Question C:** leftover remains correctly a **derived allocation state**, not
a persisted entity — this conclusion from the original investigation is **unaffected by, and in fact
depends on**, the composition-snapshot correction in §7/§8. "This later planned meal is a leftover of
Batch A" is exactly "a `meal_entries` row whose `batch_id` points at a batch created on an earlier date";
"how much is left" is exactly the `remaining(batch, food)` aggregate in §8. **No separate `Leftover`
entity is introduced or found necessary** — explicitly distinguishing, per instruction: *leftover as a
persisted entity* (rejected — nothing here requires it) vs. *leftover as a derived allocation state*
(confirmed correct, and now provably computable once §7's fix is applied).

---

## 10. DEC-071 Shopping Requirements

**Answering the task's Audit Question D:** with the corrected model, DEC-069 can answer "what
ingredients/Foods need to be purchased to prepare this batch?" **identically for Combo-originated and
manually-assembled batches** — both produce the same `composition: {food_id, quantity_g}[]` shape once
created (§7), so a future shopping-integration step reads that one shape regardless of provenance. This is
the concrete proof of cross-case equivalence the task's semantic test requires.

**What shopping needs, precisely:** the batch's **original composition** (to know what to buy, before
any cooking has happened) — not the remaining quantity (a post-consumption concept, irrelevant to
acquiring ingredients) and not merely "preparation requirements" in the abstract. This mirrors the prior
investigation's already-established finding that a batch would be added to shopping via **one call, using
the batch's total (now: per-food) quantities**, computed once at creation — unaffected by, and now made
safe by, this audit's correction. **DEC-071 itself is not redesigned or reopened here** — this section
only identifies the information DEC-069 must expose to it (the composition snapshot), not how DEC-071
consumes it.

---

## 11. Safety / Food Identity Implications

**Answering the task's Audit Question E.** The composition snapshot must store `food_id` (the canonical
identity, resolved once at batch-creation time through the existing, unmodified `foodIdentity.ts` chain)
— never a raw name string, and never established via fuzzy matching, per instruction.

**A safety finding beyond the original investigation's scope, surfaced by this audit:** under the
*original*, pointer-only proposal, exclusion filtering's guarantee — "once a food set is vetted against
hard/soft exclusions, it stays vetted for this batch" (already established in
`DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`'s own Safety Compatibility section) — **silently
breaks** if the batch's food set is only ever resolved live against a combo template that could be edited
later to add a new ingredient. A batch created last week, vetted at the time against the user's
exclusions, could — under the pointer-only model — appear today to contain a food it never actually
contained, **bypassing exclusion evaluation entirely for that newly-introduced food**, because no
re-vetting step would ever be triggered (nothing signals that the "batch" changed). **The immutable
composition snapshot (§7) closes this gap by construction**: once a batch's food set is fixed at creation
and vetted then, it is *provably* fixed forever after, because it is no longer resolved against anything
mutable. This elevates the composition-snapshot requirement from a correctness nicety to a genuine safety
requirement — reinforcing the REVISION REQUIRED conclusion (§1).

**Confirmed deterministic, no new rules invented:** hard food-level exclusions, allergen-class
exclusions, soft intolerance semantics, and UNKNOWN-allergen fail-closed behavior all continue to operate
exactly as they do today, evaluated once at batch-creation time via the existing, unmodified
`comboMatch.ts`/`foodExclusions.ts` mechanisms — the same invariant already stated in the prior
investigation (a batch's food set must never be silently substituted after creation without routing
through `DEC-063`), now additionally guaranteed to be *enforceable* rather than merely *intended*, because
the food set is immutable data rather than a live-resolved reference.

---

## 12. Nutrition Implications

**Answering the task's Audit Question F.** `scaleNutrition()` (`src/lib/mealNutrition.ts:19-31`) requires
**zero modification** — confirmed unchanged from the prior investigation's finding. `(Nutrition row via
food_id) + quantity_g` remains fully sufficient for every nutrition computation this architecture needs,
whether the `quantity_g` comes from a fresh manual entry, a live combo, or an allocation against a
snapshotted batch composition — the function has no branch and no awareness of provenance either way. **No
cooked/raw conversion, retention coefficient, or yield coefficient is introduced or required** — the
architecture cannot distinguish cooked/raw/preparation nutrient states, and this is **explicitly recorded
as a deferred limitation** (matching `DEC-069_INVESTIGATION.md` §7's already-documented, untested U6
nutrient-retention-across-storage assumption), not solved here.

---

## 13. Historical Integrity / Immutability

**Answering the task's Audit Question 6 directly, with the worked example.** Batch A created 2026-09-10
from Combo X (1000g chicken / 800g rice / 500g broccoli). If Combo X is later edited:

- **Under the original, pointer-only design:** the application **cannot** reconstruct Batch A's true
  original composition — confirmed with certainty in §5, by direct evidence that `combos.json` has no
  versioning and every read path resolves `combo.items` live (§4).
- **Correction required:** the batch must snapshot its composition at creation, per §7.

**Three models compared, as specified:**

| Model | Description | Historically safe? |
|---|---|---|
| **Model 1** | `PreparationBatch.source_combo_id` only | **No** — proven unsafe (§5, §13) |
| **Model 2** | `PreparationBatch` with an explicit immutable composition, no combo link at all | **Yes** — sufficient on its own |
| **Model 3** | `PreparationBatch.source_combo_id` (informational) + explicit immutable composition snapshot | **Yes** — sufficient, plus retains provenance |

**Model 3 is the minimum semantically safe model.** It costs nothing beyond Model 2 (the
`source_combo_id` field was already proposed in the original architecture at zero structural cost) while
preserving a genuine, if minor, benefit: knowing "this batch was originally suggested by combo X" for
future UX/analytics purposes, **without ever treating that pointer as authoritative** for reconstructing
what the batch actually contained. This is not premature normalization — it is the smallest correction
that closes the proven gap while discarding nothing already proposed.

---

## 14. Architectural Options Comparison

| Criterion | **A** — Combo-derived composition (pointer only) | **B** — Explicit batch composition (no combo link) | **C** — Combo source + immutable snapshot |
|---|---|---|---|
| Manual batches | **FAIL** — no composition representable at all | PASS | PASS |
| Combo batches | **FAIL long-term** — correct only until the combo is ever edited | PASS | PASS |
| Historical integrity | **FAIL** — proven unrecoverable after a combo edit (§13) | PASS — immutable by construction | PASS — immutable by construction |
| Leftover derivation | **FAIL** — no fixed baseline to compute remaining against | PASS (§9) | PASS (§9) |
| Shopping input | **FAIL/UNSAFE** — drifts with combo edits | PASS (§10) | PASS (§10) |
| Food Identity | Nominally OK short-term, unsafe long-term (same drift risk) | PASS — `food_id` fixed at snapshot time | PASS — `food_id` fixed at snapshot time |
| Safety determinism | **FAIL** — exclusion vetting can silently go stale (§11) | PASS | PASS |
| Nutrition calculation | OK short-term only (same drift risk) | PASS (§12) | PASS (§12) |
| Data duplication | None — the absence of duplication *is* the defect | Moderate, deliberate (copies `Combo.items`' shape once, at creation) | Same as B |
| Architectural complexity | Lowest | Low–moderate (one new structure, existing shape) | Same as B, plus one already-proposed nullable field |
| Future extension risk | **High** — silent corruption risk compounds with every future combo edit | Low | Low — marginally better than B (provenance aids future debugging without weakening safety) |

**Selected: Option C**, per §13's reasoning — strictly dominant over A (which fails outright on
correctness and safety) and marginally better than B (retains provenance at no extra safety cost).

---

## 15. Minimum Semantically Safe Architecture

```text
PreparationBatch
  ├── id
  ├── household_id
  ├── prepared_date
  ├── storage_note?              (optional, free text, informational only — unchanged from the
  │                                original proposal; depth still "Requires Human Decision", §17)
  ├── source_combo_id?            (optional, nullable, informational/provenance only — NOT
  │                                authoritative for reconstructing composition)
  └── composition: { food_id, quantity_g }[]   ← corrected/added by this audit; immutable once
                                                   created; reuses Combo.items' existing shape

MealEntry
  └── batch_id?                  (nullable, FK-less — unchanged from the original proposal)
```

This is the smallest model that passes every criterion in §14 for both Combo-originated and manually
assembled batches, without semantic loss, and without introducing an entity beyond what §7's evidence
proves necessary.

---

## 16. What Remains Deferred

Unchanged from `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`, re-confirmed as still correctly
deferred by this audit:

- Structured shelf-life duration fields, automatic expiry surfacing, or any shelf-life prediction.
- Any nutrient-retention-across-storage coefficient (U6 remains untested).
- Restaurant/professional-scale batch production (DEC-069's own unratified sub-question).
- Pantry/inventory deduction as a batch is consumed (`DEC-065`/`DEC-072` territory).
- Household-size-aware batch sizing.
- Cooked/raw/preparation nutrient-state distinction.
- `DEC-071`'s own shopping-aggregation redesign (`listActions.ts`'s existence-only dedup) — orthogonal to
  DEC-069, not created or resolved by either investigation.
- The exact schema shape for the composition snapshot (a new child table vs. an embedded array/JSON
  field on the batch row) — an implementation detail, not a semantic question, not decided here.

---

## 17. Implementation Prerequisites

Before any future implementation task begins, the following should be explicitly acknowledged (not
re-decided, since none of them reopen DEC-069's scope):

1. **The composition snapshot is a deliberate, motivated duplication** of `Combo.items`' shape at batch-
   creation time — not an accidental one, and not something a future "DRY" refactor should silently
   remove, since removing it reintroduces the proven historical-integrity and safety gaps (§5, §11, §13).
2. **`source_combo_id` must never be treated as authoritative** for reconstructing a batch's composition
   — only the snapshot is authoritative. This should be stated explicitly in whatever implementation
   spec is eventually written, to prevent a future implementer from "optimizing away" the snapshot in
   favor of the pointer.
3. **The originally-proposed singular `total_quantity` field is retired**, replaced by the per-food
   `composition` list (§7) — this is a correction to the prior investigation's own proposal, not an
   addition to it.
4. The four "Requires Human Decision" items from the prior investigation remain open, with one
   effectively narrowed by this audit: whether `PreparationBatch` should link back to a `Combo` (item 2
   in the prior list) is now answered **structurally** — yes, as optional, non-authoritative provenance
   (Option C) — but the *storage-note depth* (item 1), *shopping dedup improvement* (item 3), and
   *per-household-member attribution* (item 4) questions remain exactly as open as before.

---

## 18. Explicit Conclusion

> **REVISION REQUIRED**

Applies specifically to `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`'s proposed
`PreparationBatch` shape (`total_quantity` + `source_combo_id`, no explicit composition), which is proven
insufficient for manually-assembled batches (total loss of composition) and unsafe for Combo-originated
batches (silent historical corruption after any future combo edit, plus a real exclusion-vetting staleness
risk). The correction is narrow and additive: replace the singular `total_quantity` with an immutable
`composition: {food_id, quantity_g}[]` snapshot, captured once at creation, reusing `Combo.items`'
existing shape; retain `source_combo_id` as optional, non-authoritative provenance only. **DEC-069's
ratified product scope (Option 3) is not reopened, not reconsidered, and not found internally
contradictory by this audit** — only the implementation-architecture proposal required correction before
it could be safely built.

---

## Requires Human Decision

**No new human decision is required to accept this audit's core finding** — the composition-snapshot
correction is an implementation-correctness/safety requirement, not a product-scope choice, and does not
reopen DEC-069. The following pre-existing, narrower questions remain open (carried forward from
`DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`, one now partially narrowed — see §17 item 4):

1. Storage-note depth/shape for v1 (free-text-only vs. anything more structured) — **open**.
2. Whether the composition snapshot is implemented as a child table or an embedded array/JSON field —
   an implementation detail, **not a product decision**, left to a future implementation task.
3. Whether `listActions.ts`'s existing non-quantity-aggregating shopping dedup should be improved as part
   of a future DEC-071-adjacent effort — **open**, orthogonal to DEC-069.
4. Whether per-household-member attribution of a shared batch's leftovers is ever needed — **open**,
   pre-existing, unrelated to DEC-069.
