# DEC-069 Implementation Plan

**Document type:** Implementation-readiness architecture/planning document. **No code, schema,
migration, API, UI, or `combos.json` change of any kind. Does not amend DEC-069 or any other DEC.
Does not create a new DEC ID.**
**Date:** 2026-09-09
**Governance status (unchanged by this document):** DEC-067 CLOSED/IMPLEMENTED. DEC-068
CLOSED/DEFERRED FOR V1. **DEC-069 CLOSED / V1 SCOPE RATIFIED (Option 3 — household-scale
multi-day batch cooking, leftovers, and storage-aware meal planning); implementation NOT STARTED
before this document and NOT STARTED after it.** DEC-070, DEC-071 unchanged.

> **IMPLEMENTATION STATUS UPDATE (additive, added after this document — original plan preserved
> below for provenance).** This plan was subsequently executed on `feature/dec-069-batch-
> implementation` (commits `842aed3`, `24e58e5`). **DEC-069 implementation is COMPLETE and
> live-validated at the data/API/database layer** against the actual configured Supabase project
> (schema, batch creation, batch-linked allocation, leftover derivation, the required historical-
> integrity test, Food Identity separation, household isolation, and full regression suite all
> confirmed live). **Interactive rendered-browser QA remains PENDING** — not performed, because no
> browser-automation tool was available in that session; this is a validation follow-up, not an
> unresolved architecture or product question. See `docs/SESSION_CHECKPOINT.md` for the current,
> authoritative status and the exact commit/verification detail.

**Inputs read (not modified):** `DEC-069_INVESTIGATION.md`,
`DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` (including its "Revised Architecture
(Post-Audit)" section — authoritative for the `PreparationBatch` shape),
`DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md`, `2026-09-09-dec-069-v1-scope-ratification.md`.
All current-system claims below were re-verified directly against the live repository during this
task (not assumed carried-over from earlier documents) — see §2 for citations.

---

## 1. Executive Summary

The ratified DEC-069 architecture (`PreparationBatch` + immutable `composition` snapshot +
`meal_entries.batch_id`) is implementable with exactly **one new table and one new nullable
column**, reusing every other existing mechanism (Food Identity resolution, B3 exclusion
filtering, `scaleNutrition()`, shopping add) unchanged. Direct re-inspection of the current
codebase confirms every finding of the two prior documents still holds, and surfaces one
additional, previously-undocumented nuance that this plan resolves with evidence rather than
invention: **the value the app already stores as `meal_entries.food_id` / `Combo.items[].foodId`
is `nutrition.name_tr` (a normalized display-name string), not the newer, optional, opaque
`Nutrition.food_id` field** introduced by the Canonical Food Identity milestone. `PreparationBatch`
composition must key off the *same* value space `meal_entries.food_id` already uses — not the
separate opaque `Nutrition.food_id` — or leftover derivation (§10) cannot match rows by simple
equality. This is a naming collision, not a design flaw, and is documented explicitly so no future
implementer conflates the two "food_id" concepts (§6.1).

**Verdict: READY WITH HUMAN DECISION(S).** No architectural blocker was found. Three items,
already flagged by the prior investigation/audit as open, remain genuinely product-level rather
than implementation-level (§21) and should be resolved before or during implementation, not
silently decided here.

---

## 2. Current-System Evidence

Re-verified directly this session (file reads, not carried over from prior documents):

- `supabase/07-meal-entries.sql` + `supabase/12-meal-entries-combo-id.sql`: `meal_entries` columns
  are exactly `id, household_id, date, slot, food_id, quantity_g, position, combo_id, created_at`.
  No `status`, `batch_id`, `servings`, or second date field exists. `food_id` is documented in the
  migration's own comment as "`nutrition.name_tr` (no FK...)".
- `netlify/functions/meal-entries.ts`: confirms the same column set server-side
  (`SELECT_COLS`/`MealEntryRow`); validation requires `food_id` non-empty string, `quantity_g`
  positive number, `combo_id` optional string-or-null. No batch-related field exists in the
  request/response contract today.
- `src/lib/combos.ts` + `data/combos.json`: `Combo.items: { foodId: string; grams: number }[]`.
  The JSON's raw key is `food_id`, and its actual values (e.g. `"tavuk göğsü"`, `"pirinç"`,
  `"brokoli"`) are Turkish display-name strings, matched against the nutrition catalog via
  `lookupNutrition(map, name) → map.get(normalize(name))` (`src/lib/nutrition.ts:264-269`) — a
  normalized-name lookup, not an opaque-id lookup.
- `src/lib/mealPlan.ts` / `src/lib/localMealPlan.ts`: both `MealEntry.foodId` and
  `MealItem.foodId` carry the explicit code comment `// Nutrition.name_tr`.
- `src/components/MealFoodPicker.tsx:69`: the manual "Besin ekle" flow calls
  `onAdd(selected.name_tr, quantityG)` — confirms the manual-entry path also writes `name_tr` into
  `foodId`, identically to the combo path.
- `src/lib/nutrition.ts:4-34`: `Nutrition.food_id` is a **separate, optional** field —
  "Opaque, stable canonical Food identity... read-through only... absent until
  `supabase/16-nutrition-food-id.sql` has been applied." It is populated only via
  `pickNutrition()` on catalog fetch and is never sent back on a write. It is consumed only by
  `src/lib/foodIdentity.ts` (`buildFoodIdentityIndex`/`resolveFood`) and
  `src/lib/listActions.ts`'s `addItem` (for shopping-row dedup/exclusion matching) — **never** by
  `meal_entries`, `Combo`, or any meal-planning code path.
- `src/lib/comboMatch.ts`: `resolveItems()` calls `lookupNutrition(catalog, item.foodId)` — the
  same name-based lookup, confirming combos never touch the opaque `Nutrition.food_id` either.
- `src/lib/mealNutrition.ts`: `scaleNutrition(nutrition, quantityG)`, `factor = quantityG / 100`,
  no branch, no provenance parameter — confirmed gram-source-blind.
- `src/hooks/useMealPlan.ts`: `useMealPlan` fetches exactly one date at a time
  (`fetchMealEntries(householdId, date, date)`), with `goToPrevDay`/`goToNextDay` stepping one day.
  **No multi-day/week view exists anywhere in the UI today** — `MealPlanView`/`TodayView` each
  render a single pinned or navigable date. Cross-day linkage today is possible only in the data
  layer (`fetchMealEntries` already accepts an arbitrary `from`/`to` range); no UI surface
  currently requests or renders more than one day at once.
- `src/components/MealPlanView.tsx`: already threads `foodExclusions`/`allergenExclusions` (from
  the household's `personalizationProfile`) into `MealFoodPicker` for hard-tier filtering at
  food-selection time — this is the existing hook point B3 batch-creation vetting would reuse
  (§11).
- `src/lib/foodExclusions.ts`: hard/soft tiering (`tierOf`), B3 allergen-class conservative
  escalation (`hasHardAllergenClassExclusion` blocks on PRESENT or UNKNOWN) confirmed unchanged
  and independent of any batch concept.
- `src/lib/listActions.ts`'s `addItem`: existence-only dedup (re-marks an existing row unchecked;
  never sums `qty`), confirmed still the current behavior — `Item.qty` is a free-text string
  (`src/lib/store.ts:8`).
- All 16 `supabase/*.sql` files (re-listed and re-confirmed this session): no `combos`,
  `batch`, `preparation`, or `leftover` table of any kind. Repo-wide search for
  `batch_id`/`PreparationBatch`/`leftover` in `src/` and `supabase/`: **zero matches** — confirms
  no drift since the prior investigation/audit.

**Conclusion: nothing has changed in the codebase since the prior two documents were written.**
Every architectural finding in `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`'s "Revised
Architecture (Post-Audit)" section and `DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md` is
re-confirmed current. The one addition this plan makes is the `food_id`-naming-collision finding
above, which those two documents did not need to surface (neither one had to decide a concrete
persistence shape).

---

## 3. Target Architecture

```text
PreparationBatch
  ├── id                    text, primary key
  ├── household_id          text, references households(id)
  ├── prepared_date         date
  ├── storage_note          text, nullable       (free text, informational only)
  ├── source_combo_id       text, nullable       (provenance ONLY — never authoritative)
  └── composition           { food_id: string, quantity_g: number }[]
                             — immutable snapshot, captured once at creation
                             — food_id here uses the SAME value space as
                               meal_entries.food_id (nutrition.name_tr), not
                               Nutrition.food_id (see §6.1)

MealEntry / meal_entries
  └── batch_id              text, nullable, FK-less   (new column; every existing row unaffected)
```

This is unchanged in substance from the audit's "Minimum Semantically Safe Architecture" (§15 of
the audit). This plan's job is to decide *how* `composition` is actually persisted (§4/§5), define
the invariants precisely enough to implement (§6), and produce a concrete, ordered build sequence
(§20).

---

## 4. Persistence Model Options

### Option A — `PreparationBatch` table + JSON/array composition field

```sql
create table preparation_batches (
  id text primary key,
  household_id text not null references households(id) on delete cascade,
  prepared_date date not null,
  storage_note text,
  source_combo_id text,
  composition jsonb not null,   -- [{ "food_id": "...", "quantity_g": 150 }, ...]
  created_at timestamptz not null default now()
);
```

### Option B — `PreparationBatch` table + normalized child composition rows

```sql
create table preparation_batches (
  id text primary key,
  household_id text not null references households(id) on delete cascade,
  prepared_date date not null,
  storage_note text,
  source_combo_id text,
  created_at timestamptz not null default now()
);

create table preparation_batch_items (
  id text primary key,
  batch_id text not null references preparation_batches(id) on delete cascade,
  food_id text not null,
  quantity_g numeric not null
);
```

### Option C — another existing-project-native structure

Investigated and rejected as not applicable: nothing in the current schema stores a per-row list
of `{food_id, quantity_g}` pairs as its own table the way Option B proposes fresh — the closest
precedent, `Combo.items`, is a **client-bundled JSON array**, not a Supabase table at all (§2).
There is no existing "composition-shaped" table to reuse; Option C collapses into "reuse the
`Combo.items` shape" (already the audit's chosen answer, §7 of the audit) rather than a distinct
persistence option. No third real option exists beyond A and B.

### Comparison

| Criterion | A — JSONB array | B — normalized child rows |
|---|---|---|
| Immutable historical snapshot | Equally safe — a JSONB value is copied, not referenced, once written | Equally safe — child rows are written once at creation |
| Per-food quantities | Native — array of objects | Native — one row per food |
| Referential integrity | None inside the array (no FK possible into a JSONB blob) | `food_id` still has no FK (matches `meal_entries.food_id`'s own no-FK precedent, §2) — the only integrity gain over A is `batch_id`'s own FK, which A can express too via the parent row |
| Food Identity | Same either way — `food_id` is a plain string in both | Same |
| Querying leftovers (§10) | Requires reading the whole `composition` array client-side (or a Postgres `jsonb_array_elements` query) then subtracting `meal_entries` aggregates | Can `SUM(quantity_g)` directly per `(batch_id, food_id)` in SQL if ever needed; in practice the app already does all nutrition/aggregation client-side (§2), so this SQL-native advantage is not currently exercised |
| Aggregation | Client-side only (matches every other aggregation in this app — nutrition totals, shopping totals) | Same in practice, SQL-native in theory |
| Supabase/Postgres ergonomics | One row per batch — simplest possible read (`select * from preparation_batches where id = ?`) | One parent row + N child rows — a join for every read |
| Migration complexity | One new table, one JSONB column — smallest possible surface | Two new tables |
| API complexity | Batch payload is exactly the object the client already builds (`{..., composition: [...]}) — a single insert | Requires the API to insert one parent row + N child rows (transactionally, or accept partial-write risk) |
| TypeScript ergonomics | `composition: {foodId: string; quantityG: number}[]` matches `Combo.items`' existing shape verbatim — zero new serialization logic | Requires flattening/reassembling the array from N rows on every read |
| Testability | Trivial — one object in, one object out | Requires seeding/asserting N child rows per test case |
| Future DEC-071 consumption | Reads one `composition` field off one row | Reads N child rows, needs its own join |
| Future storage information | Already has `storage_note` on the same row | Same |
| Manually assembled batches | No difference — both store the same array, just shaped differently | Same |
| Combo-originated batches | No difference | Same |
| Avoiding overengineering | **Matches the actual precedent this app already uses for "a list of {foodId, grams}"** (`Combo.items`, a JSON array) — introduces no new pattern | Introduces a normalized child-table pattern this app has never used for any comparable "list of ingredient rows" data (contrast: `lists`→`items` is genuinely 1:many *mutable* rows the user edits independently; a batch's composition is never edited row-by-row after creation) |

**Decision basis:** Option B's only real advantage (SQL-native `SUM`) is not something this app's
architecture currently exploits anywhere — every nutrition/shopping/exclusion computation already
happens client-side against data fetched as a whole object (§2). Option B also introduces a
transactional-write risk (parent + N children) that Option A avoids by construction (one row, one
insert). Option A directly mirrors the one existing precedent for "a list of `{foodId, grams}`
pairs" this codebase already has (`Combo.items`), at a new granularity (per-instance, immutable)
exactly as the audit's §17 prerequisite #3 describes it ("reusing `Combo.items`' existing shape").

---

## 5. Recommended Persistence Model

**Option A — `PreparationBatch` table with a JSONB `composition` array column.**

```sql
create table public.preparation_batches (
  id              text primary key,
  household_id    text not null references public.households(id) on delete cascade,
  prepared_date   date not null,
  storage_note    text,
  source_combo_id text,
  composition     jsonb not null,
  created_at      timestamptz not null default now()
);

create index if not exists preparation_batches_household_date_idx
  on public.preparation_batches (household_id, prepared_date);

alter table public.meal_entries
  add column if not exists batch_id text;
```

`composition`'s JSON shape: `[{ "food_id": "tavuk göğsü", "quantity_g": 1000 }, ...]` — verbatim
the same `{foodId, grams}`-equivalent shape `Combo.items` already uses, renamed to match
`meal_entries`' own `food_id`/`quantity_g` column-naming convention.

**No application-level enforcement of immutability beyond convention is proposed** (§6.3) —
matches this schema's existing style (nothing in this codebase uses database triggers or
row-level write-once constraints; `combo_id`'s own precedent is "write once at creation, read
many times," enforced only by there being no UPDATE code path that touches it).

---

## 6. Batch Composition Invariants

### 6.1 Food identity — the naming collision, resolved

**Finding (§2, this document only):** the codebase has two different things both informally called
"food id":

1. `meal_entries.food_id` / `Combo.items[].foodId` / `MealItem.foodId` — actually
   `nutrition.name_tr`, matched by normalized-string equality (`lookupNutrition`). This is the
   value space every existing meal-planning read/write already uses.
2. `Nutrition.food_id` — the newer, optional, opaque Canonical Food Identity field, populated only
   after migration 16 and consumed only by `foodIdentity.ts`/`listActions.ts` for shopping-row
   dedup and exclusion matching.

**Decision:** `PreparationBatch.composition[].food_id` **must use value space (1)** — the same
value that already flows into `meal_entries.food_id` for a given food today. This is not "food
name identity" in the sense the task warns against (a fuzzy or display-only label chosen ad hoc);
it is **the app's existing, already-load-bearing identity key for meal-planning rows**, unchanged
in kind from what `meal_entries.food_id` has always stored. Reusing it is what makes leftover
derivation (§10) a plain equality join — `composition[i].food_id === meal_entries.food_id` — with
zero new resolution/mapping layer.

Using value space (2) instead would require: (a) every food added via `MealFoodPicker`/`Combo` to
have a resolved `Nutrition.food_id` (not guaranteed — it's optional and read-through only, §2),
and (b) a translation step between `composition[].food_id` and `meal_entries.food_id` at every
leftover computation, since `meal_entries.food_id` itself is never the opaque id (§2). This would
be new complexity solving a problem the ratified scope does not raise. **Rejected.**

No fuzzy matching, no name-based lookup, and no `Nutrition.food_id`/FDC-id substitution is
introduced by this decision — it is a direct continuation of the identity convention
`meal_entries.food_id` already uses today, resolved once (via the existing
`MealFoodPicker`/`comboMatch.ts` selection UI, which already only offers catalog-backed foods) at
batch-creation time.

### 6.2 Quantity

Each `composition[]` entry's `quantity_g` must be a positive number (matches
`meal-entries.ts`'s existing `quantity_g` validation, `> 0`, `Number.isFinite`).

**Duplicate `food_id` within one batch's composition:** should be **rejected at construction time**
(client-side validation before the insert), not silently merged. Rationale: a batch is built
client-side from a Combo's `items` (which never contains a duplicate `foodId` today — confirmed by
inspecting all 16 `data/combos.json` entries' shape, §2) or from a manually-assembled food list
where the UI naturally prevents adding the same food twice (mirroring `MealFoodPicker`'s own
existing single-selection-at-a-time flow). Silent merging would hide a UI bug rather than surface
it; rejecting outright at the construction boundary costs nothing and matches this app's general
preference for explicit states over silent correction (e.g. `resolveFood`'s AMBIGUOUS state, never
picking a winner). **This does not affect an existing product decision** — it is a data-integrity
rule scoped entirely to the new `composition` array's own internal consistency.

### 6.3 Immutability

"Immutable composition snapshot" means, operationally: **`composition` is set once, at INSERT
time, and no UPDATE code path is ever written that touches it.** This mirrors the existing
`combo_id` precedent exactly (§2's `12-meal-entries-combo-id.sql` comment: "additive... entries...
leave this null... Entries created via [manual add] leave this null, same as today" — i.e. written
once, never revisited).

**Correction workflow:** if a batch's composition was wrong (e.g. user error at creation), the
correct action is to create a **new** `PreparationBatch` row (and, if the old one had no
allocations yet, delete it outright — `preparation_batches` has no downstream FK other than
`meal_entries.batch_id`, so an unreferenced batch can be deleted safely). **No in-place composition
edit is proposed or required.** No database-level write-protection (trigger, generated column,
`REVOKE UPDATE`) is proposed — this app has no precedent for that mechanism anywhere in its 16
migrations, and the convention-only approach already protects `combo_id`, `created_at`, and every
other "write-once" field in this schema identically.

---

## 7. Combo-Originated Batch Flow

```text
Combo (data/combos.json, unchanged)
  ↓  user picks a combo to "batch cook", optionally scaling quantities up
Food resolution — combo.items already reference resolvable foods (unchanged, comboMatch.ts)
  ↓
Safety/exclusion validation — comboHasHardConflict / comboHasSoftConflict (unchanged,
  comboMatch.ts, using the already-threaded exclusions/allergenExclusions from MealPlanView, §2)
  ↓
PreparationBatch creation — one INSERT, composition copied from combo.items (scaled) into
  { food_id: item.foodId, quantity_g: scaledGrams }[]
  ↓
composition snapshot — stored, immutable from this point forward
```

**Invariant confirmed:** `Combo` is an input to snapshot creation, never the historical source of
truth — exactly the audit's stated invariant. Once `composition` is written, `source_combo_id` is
never read again for reconstructing contents (only, optionally, for UI provenance display, e.g.
"originally from: Tavuklu Pirinç ve Brokoli").

**Is `source_combo_id` worth implementing?** Per the audit's §13/§14 (Option C dominates Option B
at zero extra cost), **yes, retain it** — it is a single nullable text column with no safety or
correctness cost, and provides a real (if minor) UX/debugging benefit ("this batch came from combo
X"). This plan does **not** treat it as required for v1's core functionality — a build that
shipped without it would still satisfy every DEC-069 invariant — but recommends including it since
its cost is zero and removing it later would be a breaking schema change while adding it later
would not. **Its semantics, stated precisely for implementation:** provenance/reference only;
`source_combo_id` MUST NEVER be read by any code path that needs to know what a batch actually
contains — only `composition` may answer that question.

---

## 8. Manual Batch Flow

```text
User-selected foods (via the existing MealFoodPicker-style catalog search, reused as-is)
  ↓
Food Identity resolution — same catalog lookup MealFoodPicker already performs
  (foods: Nutrition[] passed in, no new resolution mechanism)
  ↓
B3 exclusion/safety evaluation — same hasHardExclusion / hasHardAllergenClassExclusion /
  hasSoftConstraint / hasSoftAllergenClassConstraint calls MealFoodPicker already makes per food
  ↓
PreparationBatch — composition built directly from the user's selections,
  source_combo_id left null
  ↓
immutable composition snapshot
```

**No Combo is required at any step.** No generic Recipe system is introduced — the UI affordance
needed is "let the user pick N foods + quantities and save them as one batch," which is a small
extension of `MealFoodPicker`'s existing single-food-at-a-time picker (allowing multiple picks
before a final "create batch" confirmation), not a new selection mechanism.

---

## 9. MealEntry Integration

**`batch_id`:** nullable (every existing row has none; a fresh-cooked, non-batch meal entry never
needs one — matches `combo_id`'s own nullable precedent exactly), FK-less (matches every other
cross-reference in this table — `food_id` has no FK "so a nutrition row can be renamed/removed
independently of past meal entries," `combo_id` has no FK; consistency argues for the same
treatment here, and a FK would also force an application-level cascade decision — e.g. what
happens to `meal_entries.batch_id` if a `PreparationBatch` were ever deleted with allocations
still pointing at it — that this plan does not need to solve since FK-less pointers already
tolerate a dangling reference the same way `combo_id` does today).

- **Existing historical rows:** fully compatible, `batch_id = NULL` by default, no backfill
  (identical precedent to `combo_id`'s own "additive, no backfill needed").
- **Planned vs. consumed entries:** unaffected — `meal_entries` still has no status field (§2);
  a batch allocation is simply a `meal_entries` row like any other, whose `date` may be in the
  past (already eaten) or future (planned) exactly as today.
- **One batch feeding multiple dates:** yes — nothing here restricts which `date` a `batch_id`-
  bearing row uses; this is the entire point of the multi-day mechanism (§12).
- **One `MealEntry` allocates one food from a batch:** yes — matches the existing
  one-row-per-ingredient pattern (`eatCombo` already creates one row per combo item, §2's Combo
  section).
- **A batch feeding multiple `MealEntry` rows:** yes — arbitrarily many, across arbitrarily many
  dates, each independently created via the existing `createMealEntry`/`addItem` flow with
  `batchId` set.
- **Quantity representation today:** unchanged — `quantity_g`, a single positive number per row,
  already exactly sufficient (confirmed by the prior investigation, re-confirmed here).
- **Non-batch meal-entry logic:** fully unchanged — `batch_id` is simply absent/null for every
  existing code path; no existing function's signature needs to change to keep working (only new
  optional parameters are added where a batch-aware caller wants to set `batchId`).

---

## 10. Leftover Derivation

```text
remaining(batch, food_id) =
  batch.composition[food_id].quantity_g
  −
  SUM(meal_entries.quantity_g WHERE meal_entries.batch_id = batch.id
                                 AND meal_entries.food_id = food_id)
```

**How this is actually computed in Grocery:** client-side, mirroring every other aggregation in
this app (nutrition totals, shopping totals — none of which are computed in SQL today, §2). A
batch-detail view would: (1) fetch the one `preparation_batches` row (composition included), (2)
fetch `meal_entries` filtered by `batch_id = eq.<id>` (a new, simple PostgREST filter on the
already-existing `meal_entries` REST path, or a small addition to `meal-entries.ts`'s GET handler
to accept an optional `batchId` query param alongside `householdId`/`from`/`to`), (3) subtract
per-`food_id` in JavaScript. No SQL aggregate function is required.

**Worked example, re-verified:** Batch A (chicken 1000g / rice 800g / broccoli 500g), Meal 1
(200/160/100g) + Meal 2 (200/160/100g) → chicken 1000−400=600, rice 800−320=480, broccoli
500−200=300. Matches the required test exactly.

**Edge cases:**
- **Zero remaining:** `remaining = 0` when allocations sum exactly to composition — valid,
  renders as "fully used."
- **Exact full consumption:** same as zero remaining; no special-cased "closed" state needed —
  it's just a read-time arithmetic result of zero.
- **Multiple meals / different dates:** handled uniformly — the aggregate does not care which
  `date` each contributing `meal_entries` row has, only that `batch_id` and `food_id` match.
- **No allocations:** `remaining = composition[food_id].quantity_g` for every food — the full
  batch is untouched.
- **Legacy `MealEntry` rows with no `batch_id`:** excluded from the `SUM` entirely (they don't
  match `batch_id = eq.<id>`) — zero interaction with this computation, confirming legacy
  compatibility.
- **Invalid/over-allocation** (sum of allocations exceeds `composition[food_id].quantity_g`):
  **not corrected automatically.** `remaining` would go negative; the UI should surface this as a
  visible warning (e.g. "allocated more than was prepared") rather than clamping, hiding, or
  auto-adjusting it — consistent with this app's general pattern of surfacing rather than silently
  resolving inconsistent states (e.g. `resolveFood`'s AMBIGUOUS, never auto-picking). **No
  automatic correction behavior is proposed**, per instruction.

---

## 11. Safety / B3 Integration

**Where exclusions are evaluated today:** `comboMatch.ts` (`comboHasHardConflict`/
`comboHasSoftConflict`, for combos) and `MealFoodPicker.tsx` (`hasHardExclusion`/
`hasHardAllergenClassExclusion` filtering the visible food list, for manual entries) — both already
wired into `MealPlanView.tsx`, which threads `foodExclusions`/`allergenExclusions` from the
household's `personalizationProfile` (§2).

**Safest validation point for a batch's food set:** identical to where it happens today for a
combo or a manual food pick — **at batch-creation time**, using the exact same, unmodified
`comboMatch.ts` (for a Combo-originated batch) or `MealFoodPicker`-style filtering (for a manual
batch). No new safety code path is introduced; the batch-creation UI simply reuses whichever of
the two existing mechanisms matches how the batch is being assembled.

**Invariant (unchanged from both prior documents, now reinforced by the immutable-snapshot
correction):** the food set evaluated against hard/soft exclusions at creation is *provably* fixed
thereafter, because `composition` is immutable (§6.3) — a later edit to the source `Combo` cannot
reintroduce an unvetted food into an already-created batch. This closes exactly the staleness gap
the audit identified (§11 of the audit).

**Reuse confirmed, no new APIs needed:** `hasHardExclusion`, `hasSoftConstraint`,
`hasHardAllergenClassExclusion`, `hasSoftAllergenClassConstraint` all operate on a `Nutrition`-
shaped candidate or a bare food-id string (`FoodIdentityLike`, §2) — a batch-creation flow calls
these identically to how `MealFoodPicker`/`comboMatch.ts` already do, once, over the batch's
candidate food set, before the INSERT. **No new safety semantics, no new allergen categories, no
weakened hard-exclusion behavior** — this plan introduces zero changes to `foodExclusions.ts` or
`allergenClasses.ts`.

---

## 12. Nutrition Integration

**`scaleNutrition()` requires zero modification** — re-confirmed by direct read (§2): its
signature and body have no branch or parameter that could distinguish a batch-sourced quantity
from a fresh one. A `meal_entries` row with `batch_id` set is scaled identically to one without.

**No cooking-loss, yield, storage-retention, or raw/cooked coefficients are introduced.** If a
future need for these arises, it is explicitly a **separate gap**, not something this plan
attempts to solve — matches `DEC-069_INVESTIGATION.md`'s own already-documented, untested U6
nutrient-retention-across-storage assumption, carried forward unchanged.

---

## 13. Multi-Day Planning

**Current capability, confirmed (§2):** `MealPlanView`/`TodayView` each render exactly one date at
a time; `useMealPlan` fetches `from=date&to=date`. There is no week/multi-day view anywhere.

**Minimum implementation needed:** none, at the data layer — `fetchMealEntries` already accepts an
arbitrary date range, and each single-day view, on any given day, already independently fetches
that day's `meal_entries` rows (which may or may not carry a `batch_id`). **Cross-day linkage is
achieved purely through the shared `batch_id` value in the data model — no new UI concept of "a
multi-day plan" is required to satisfy the ratified scope's data requirements.**

**What the UI minimally needs to add** (implementation detail, not a new architecture): when
rendering a `meal_entries` row that has a non-null `batch_id`, optionally show "from a batch
prepared on `<prepared_date>`" (a small addition to `TodayView.tsx`/`MealPlanView.tsx`'s existing
per-item rendering, following the already-shipped `prepNote` display precedent, §2). This is a
rendering nicety, not a new planning architecture — no separate "batch view" screen is required to
satisfy the ratified scope, though one may be a reasonable *additional* build item for surfacing
remaining quantities (§17 UI Surface).

**Explicit distinction (per instruction):**
- **Batch preparation event** = the `PreparationBatch` row itself (`prepared_date`, `composition`).
- **Meal allocation** = a `meal_entries` row with `batch_id` set (a specific food+quantity drawn
  from the batch, on a specific date/slot).
- **Leftover state** = the derived `remaining(batch, food_id)` computation (§10), not persisted.
- **Storage information** = the batch's own `storage_note` field (§14), independent of any
  individual allocation.

No separate `Meal` or `Leftover` entity is introduced — matches both prior documents' conclusion.

---

## 14. Storage Note

Per the architecture documents, the minimum options are:

- **A — No storage information in v1.**
- **B — Free-text `storage_note`.**
- **C — Structured storage metadata** (explicitly rejected by both prior documents — no shelf-life
  modeling is to be invented).

**This plan's position:** the schema in §5 already includes `storage_note` as a nullable free-text
column at zero structural cost (mirrors the already-shipped `Combo.prepNote` precedent exactly,
§2). Including the column costs nothing whether or not it ships in the v1 UI — a nullable text
column with no writer is indistinguishable from not having it, and adding it later would be a
(trivial, but still separate) migration. **Whether the v1 UI actually exposes an input for it is a
genuine product decision** (how much UI surface to build for v1), not an implementation detail —
flagged in §21, not decided here, consistent with both prior documents' own treatment of this
question.

---

## 15. DEC-071 Interface

**What DEC-071 will need from DEC-069:** the batch's **original composition** — `composition:
{food_id, quantity_g}[]` — to answer "what needs to be purchased to prepare this batch," available
identically regardless of whether the batch is Combo-originated or manually assembled (§10 of the
audit already established this cross-case equivalence; re-confirmed here since it now maps onto a
concrete field, `preparation_batches.composition`).

**The clean contract, concretely:**

```text
DEC-069 exposes:      preparation_batches.composition  (original, for "what to buy")
                       remaining(batch, food_id)         (derived, for "what's already used")
DEC-071 consumes:      whichever of the two its own future scope needs — likely the original
                       composition for a "add this batch's ingredients to the list" action,
                       mirroring addComboToList's existing one-call-per-add pattern (§2)
```

**Not implemented or redesigned here:** DEC-071 itself, `listActions.ts`'s existing
existence-only shopping dedup (a pre-existing, orthogonal limitation — §2), or any new shopping
aggregation logic. This section only defines the interface DEC-069 must expose; if `listActions.ts`
is later found insufficient for however DEC-071 wants to consume this, that is a DEC-071-scope
gap, recorded here for continuity, not solved by this plan.

---

## 16. Migration Strategy

**New objects required** (if this architecture is implemented at all):
- One new table: `preparation_batches` (§5).
- One new nullable column: `meal_entries.batch_id`.

**Nullable vs. non-null:** every new column/table field is nullable or has no legacy row to
backfill (`preparation_batches` is a brand-new table — no existing rows exist to migrate at all;
`meal_entries.batch_id` is nullable, matching `combo_id`'s own precedent, §2).

**Indexes:** `preparation_batches(household_id, prepared_date)` — mirrors
`meal_entries_household_date_idx`'s existing pattern exactly, for the same reason (listing a
household's batches by date). A `meal_entries(batch_id)` index should be added if/when the
leftover-derivation query (§10) is measured to need it — not required for correctness, only for
query performance at scale; this repo's existing indexes are similarly narrow (one composite index
per table), so this is consistent with current practice rather than premature.

**Constraints:** `household_id` FK with `on delete cascade` (matches `meal_entries.household_id`'s
own FK exactly). No FK on `meal_entries.batch_id` (§9). No FK needed from `composition`'s internal
`food_id` values (matches `meal_entries.food_id`'s own no-FK precedent).

**Historical data impact:** none — `preparation_batches` starts empty; every existing
`meal_entries` row is valid with `batch_id = NULL` by default.

**Rollback:** `drop table if exists preparation_batches; alter table meal_entries drop column if
exists batch_id;` — both fully reversible with no data loss to any other table, since nothing
existing depends on either new object.

**Seed/test data impact:** none required — existing seed/test fixtures (`supabase/02-seed.sql`,
`*.test.ts` files) need no changes to keep passing, since nothing in the new schema is referenced
by existing code paths.

**Not executed by this plan** — this is a description of the migration that a future
implementation task would write, not a migration itself.

---

## 17. API / Domain Surface

**Proposed new TypeScript domain types** (mirroring `src/lib/combos.ts`'s and `src/lib/mealPlan.ts`'s
existing style):

```ts
// src/lib/preparationBatch.ts (new file, mirrors combos.ts's structure)
export type BatchCompositionItem = {
  foodId: string;   // same value space as MealEntry.foodId (nutrition.name_tr) — see §6.1
  quantityG: number;
};

export type PreparationBatch = {
  id: string;
  preparedDate: string;      // YYYY-MM-DD, matches MealEntry.date's format
  storageNote?: string;
  sourceComboId?: string;    // provenance only — never authoritative, see §7
  composition: BatchCompositionItem[];
};
```

- **Why required:** nothing existing represents "a list of {foodId, quantityG} pairs persisted
  once, immutably, per instance" — `Combo.items` is the closest shape but is a static, mutable,
  hand-authored template (§2), not an instance record.
- **What existing capability cannot serve it:** `Combo` (no instancing, no persistence, no
  immutability); `MealEntry` (one food per row, no shared-batch grouping); neither can represent a
  multi-food, cross-day, immutable batch record (Outcome 0 rejected, per both prior documents).

**Proposed new functions** (mirroring `src/lib/mealPlan.ts`'s `fetchMealEntries`/`createMealEntry`
pattern exactly):

```ts
export async function fetchPreparationBatch(id: string): Promise<PreparationBatch | null>
export async function fetchPreparationBatches(householdId: string, from: string, to: string): Promise<PreparationBatch[]>
export async function createPreparationBatch(batch: NewPreparationBatch): Promise<PreparationBatch | null>
```

- **Inputs:** a household id, a composition array, an optional storage note/source combo id.
- **Outputs:** the created/fetched `PreparationBatch` object(s), matching the existing
  fetch/create-returns-the-row convention already used by `mealPlan.ts`.
- **Invariants:** `composition` is set once at creation and never updated (no `updatePreparationBatch`
  function is proposed — matches §6.3's "no in-place edit" decision); duplicate `foodId` within one
  `composition` array is rejected client-side before the create call (§6.2).
- **Consumers:** a new batch-creation UI flow (§7/§8), a batch-detail/leftover view (§10), and
  `MealPlanView`/`TodayView`'s per-item rendering (for the optional "from a batch" annotation,
  §13).

**One new Netlify function**, `netlify/functions/preparation-batches.ts`, mirroring
`meal-entries.ts`'s existing structure exactly (GET by household+date-range or by id, POST to
create — no PATCH/DELETE endpoint is proposed, consistent with §6.3's immutability decision; a
DELETE endpoint may be justified for the "delete an unreferenced mistaken batch" case in §6.3, left
as an implementation-time call since it does not affect the core architecture).

**`meal_entries.ts`'s existing `POST`/`GET` handlers** gain one new optional field, `batch_id`
(create) and one new optional query filter, `batchId` (read) — both additive, mirroring exactly how
`combo_id` was added in a prior milestone (§2).

**No speculative abstractions introduced:** no `BatchAllocation` type is proposed (an "allocation"
is just a `MealEntry` with `batchId` set — introducing a distinct type for it would duplicate
`MealEntry`, exactly the Model C failure both prior documents already rejected).

---

## 18. UI Surface

Minimum architectural surface (no implementation, no polished UX spec, per instruction):

- **Create batch:** a new flow, reachable from `MealPlanView`/`TodayView`, offering "from a combo"
  (reuses `comboMatch.ts`'s existing combo list + scaling input) or "manually" (reuses
  `MealFoodPicker`'s existing catalog search, extended to accept multiple picks before confirming,
  §8) — both funnel into one `createPreparationBatch` call.
- **View batch:** a minimal detail surface showing `composition`, `prepared_date`, and (if present)
  `storage_note`/`source_combo_id` — could be as small as a card/sheet, not a full new page.
- **Allocate batch food to meals:** extends the existing "Besin ekle" (`MealFoodPicker`) flow with
  an additional "from batch X" source alongside "from catalog," writing `batchId` on the resulting
  `meal_entries` row.
- **See remaining quantities:** the batch-detail surface computes and displays `remaining(batch,
  food_id)` per food (§10) — read-only, no new persisted state.
- **Multi-day batch planning:** no new screen required at the architecture level (§13) — the
  existing single-day `MealPlanView`, on each day it's opened, already shows that day's
  `meal_entries` rows regardless of `batch_id`.
- **Storage note display/edit:** only if §14's human decision resolves to "yes, expose it in v1" —
  a simple text field/display, following `Combo.prepNote`'s existing display precedent.
- **Combo-originated / manually assembled batch:** both routed through the same "create batch" flow
  (§7/§8), differing only in the first step (pick a combo vs. pick foods).

No implementation is performed; this is the surface inventory only.

---

## 19. Testing Strategy

### Identity
- Valid food ids (matching `meal_entries.food_id`'s existing value space) are accepted into
  `composition`.
- An unknown food (not present in the nutrition catalog) is rejected at batch-creation time,
  mirroring `MealFoodPicker`'s existing catalog-only selection constraint.
- No fuzzy resolution step is ever invoked to establish a `composition` entry's identity — assert
  this by construction (the batch-creation flow only ever offers catalog-backed foods, same as
  `MealFoodPicker` today).

### Safety
- A hard exclusion on any food in the candidate set blocks batch creation (mirrors
  `comboHasHardConflict`'s existing test coverage in `comboMatch.test.ts`).
- An allergen-class hard exclusion (PRESENT or UNKNOWN) blocks batch creation identically.
- A soft intolerance match does not block creation, only flags it (mirrors existing soft-conflict
  behavior).

### Composition
- Multi-food batch: composition correctly stores all N foods with correct quantities.
- Manually assembled batch: composition fully populated with `source_combo_id = null`.
- Combo-originated batch: composition copied from `combo.items` (scaled), `source_combo_id` set.
- Duplicate `food_id` in a proposed composition: rejected before creation (§6.2).
- Immutable snapshot: after creation, no code path mutates `composition` — assert no
  `updatePreparationBatch`-shaped function exists / is called anywhere.

### Historical integrity
- Create Batch A from Combo X. Conceptually edit Combo X's `items` (in `combos.json`). Re-fetch
  Batch A. Assert its `composition` is unchanged — this is the direct regression test for the
  audit's central finding (§13 of the audit).

### Leftovers
- No allocations: `remaining` equals full `composition` quantity for every food.
- Partial allocation: `remaining` matches expected subtraction (the worked example, §10).
- Full allocation: `remaining = 0`.
- Multiple-day allocation: allocations on different `date`s still subtract correctly (aggregate is
  date-independent, §10).
- Multiple `MealEntry` rows for the same food/batch: all summed correctly.
- Over-allocation: `remaining` goes negative, no auto-correction — assert the raw value is
  surfaced, not clamped.

### Legacy
- Existing `meal_entries` rows with no `batch_id` (`NULL`) continue to fetch, render, and compute
  nutrition exactly as before — a direct regression check against `comboMatch.test.ts`'s and
  `foodExclusions.test.ts`'s existing suites (no existing test should need modification).

### Shopping boundary
- `preparation_batches.composition` alone is sufficient to compute a full shopping list for the
  batch (i.e. a test asserting the composition array, unmodified, contains everything DEC-071
  would need) — proves DEC-069's output is sufficient for future DEC-071 consumption without
  DEC-071 itself being implemented.

---

## 20. Recommended Implementation Sequence

Derived from the codebase's actual dependency structure (not the template sequence verbatim):

```text
1. Persistence model — create preparation_batches table + meal_entries.batch_id column
   (§5, §16). Purely additive; can land and be verified independently of everything else.

2. Domain types — src/lib/preparationBatch.ts (PreparationBatch, BatchCompositionItem) (§17).
   No behavior yet; unblocks everything below.

3. Netlify function — preparation-batches.ts (GET/POST) (§17). Depends on 1.

4. Batch creation — client-side create flow: Combo-originated (§7) and manual (§8) paths,
   including the duplicate-food_id rejection (§6.2) and safety/exclusion checks (§11, reusing
   existing comboMatch.ts / foodExclusions.ts unchanged). Depends on 2, 3.

5. MealEntry batch linkage — extend meal-entries.ts's POST to accept batch_id; extend
   MealFoodPicker's "add" flow with a "from batch" source (§9, §18). Depends on 4 (a batch must
   exist before anything can allocate from it).

6. Leftover derivation — client-side remaining() computation + a batch-detail view (§10, §18).
   Depends on 5 (needs real allocations to display against).

7. Multi-day rendering — the small "from a batch prepared on <date>" annotation in
   TodayView.tsx/MealPlanView.tsx (§13). Depends on 5; independent of 6.

8. Storage-note capability — only if §21's human decision approves it for v1 (§14, §18).
   Independent of 6/7; can be done any time after 1.

9. DEC-071 integration boundary — expose composition as the documented interface (§15); no
   DEC-071 code is written. Depends on 1 only, but logically follows once the shape is proven
   stable through 1-7.

10. Full regression/browser QA — existing comboMatch.test.ts / foodExclusions.test.ts /
    listActions.test.ts suites re-run unchanged (legacy compatibility, §19); new tests per §19
    added; manual browser QA via netlify:dev + an isolated test account (matching this project's
    established QA convention, e.g. the DEC-067 Level 1 closeout).
```

**What can be isolated vs. must be atomic:** step 1 (migration) is atomic in itself but otherwise
fully decoupled from application code — it can land, be verified, and sit unused safely. Steps
2-4 must land together to be meaningful (a domain type with no creation flow is inert, and vice
versa) but do not require step 5 to be tested in isolation (a batch can be created and inspected
via the API/tests before any allocation UI exists). Steps 6 and 7 are independent of each other
and can be built/reviewed in either order once 5 lands. Step 8 is fully independent and gated only
by the human decision in §21, not by any other step's completion.

---

## 21. Human Decisions Required

### IMPLEMENTATION DETAIL (Claude may decide during implementation)
- Exact naming of the new table/columns (`preparation_batches` vs. another name) — cosmetic.
- Whether a `DELETE` endpoint exists for an unreferenced, mistakenly-created batch (§6.3, §17).
- Whether a `meal_entries(batch_id)` index is added immediately or only if query performance
  requires it (§16).
- Exact shape of the batch-creation UI (single flow with two entry points vs. two separate flows)
  (§18).
- Whether `fetchPreparationBatches` supports a date-range query from day one or only fetch-by-id
  initially (§17) — an incremental-build sequencing choice, not a product question.

### HUMAN PRODUCT DECISION (must be reviewed before implementation)
1. **Storage-note depth for v1** (§14): ship free-text `storage_note` in the v1 UI, or defer all
   storage-representation UI to a later pass (the column can exist either way at zero cost, per
   §14 — this decision is specifically about UI scope, not schema). **Carried forward unresolved
   from both prior documents.**
2. **Whether `listActions.ts`'s existing non-quantity-aggregating shopping dedup should be
   improved** as part of this work or left exactly as-is (§15). **Carried forward unresolved** —
   orthogonal to DEC-069, belongs to DEC-071's own future scope.
3. **Whether per-household-member attribution of a shared batch's leftovers is ever needed** (§9).
   **Carried forward unresolved**, pre-existing and unrelated to DEC-069 — `meal_entries` has no
   member-level field today, and nothing in this plan introduces one.

**Already-ratified DEC-069 scope, explicitly NOT re-listed as unresolved here:** whether DEC-069
covers household-scale multi-day batch cooking at all (ratified, Option 3); whether restaurant-
scale is in scope (ratified out); whether pantry/inventory is in scope (ratified out, stays
DEC-065/DEC-072). None of these reappear as open questions in this plan.

---

## 22. Explicit Non-Goals

Confirmed explicitly out of scope for this implementation, matching the ratification's own
exclusions and both prior documents' findings:

- Restaurant/professional-scale production.
- Pantry/inventory modeling (stays `DEC-065`/`DEC-072`).
- Automatic shelf-life prediction or expiry-date prediction.
- Nutrient-retention coefficients across storage or cooking.
- A general-purpose recipe engine or recipe-scaling framework.
- A substitution engine (any future substitution routes through `DEC-063`).
- A new `Leftover` entity (remains derived, §10).
- A new `Meal` entity (a "meal" remains a UI-time grouping of `MealEntry` rows, unchanged).
- A new `Recipe` entity (`Combo` remains a static suggestion template, unchanged).
- Household-member attribution of batch leftovers (§21, item 3).
- Cooking skill/time/equipment adjustment (`DEC-068` — CLOSED/DEFERRED FOR V1, not reopened).
- Any new DEC ID.

---

## 23. Implementation Readiness Verdict

> **READY WITH HUMAN DECISION(S)**

The architecture is fully specified, code-verified against the current repository (not assumed),
and requires no further architectural investigation. Three pre-existing, narrow product questions
(§21) remain open and should be resolved before or during implementation, but none of them block
starting implementation of the core mechanism (persistence model, batch creation, allocation,
leftover derivation, safety integration) — each can proceed with its default/deferred answer
(no storage-note UI; dedup left as-is; no member attribution) without foreclosing any of the three
decisions later, since none of them require an incompatible schema or API shape to reverse.

---

## Files Changed

**Created by this task:**
- `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_IMPLEMENTATION_PLAN.md` (this file) — the only
  file created or modified by this task.

**Pre-existing, untouched by this task** (already uncommitted on `feature/dec-069-investigation`
from prior tasks this session):
- `docs/SESSION_CHECKPOINT.md`
- `nutrition-curriculum/08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`
- `nutrition-curriculum/00_PROJECT_CONTROL/DECISIONS/2026-09-09-dec-069-v1-scope-ratification.md`
- `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md`
- `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`
- `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_INVESTIGATION.md`

No application code, schema, migration, API, UI, or `data/combos.json` file was created, modified,
or deleted by this task.

---

## Validation

**Governance:** DEC-069 remains CLOSED / V1 SCOPE RATIFIED; implementation remains NOT STARTED;
DEC-067, DEC-068, DEC-070, DEC-071 unchanged; no DEC ID created; no DEC definition amended; no new
human product-level decision was silently ratified (§21's three items remain explicitly open).

**Architecture / implementation:** no schema changed, no migration created, no API changed, no UI
changed, no JSON changed, no nutrition logic changed, no Food Identity changed, no
allergen/exclusion logic changed, no shopping logic changed. Every finding above is
descriptive/comparative/planning, verified against direct reads of the current repository state,
not a code change.
