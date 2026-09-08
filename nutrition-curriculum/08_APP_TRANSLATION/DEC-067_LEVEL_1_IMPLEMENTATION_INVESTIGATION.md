# DEC-067 Level 1 — Implementation-Readiness Investigation

**Status:** Investigation artifact. **No implementation performed.** Nothing below modifies source code,
schema, API, UI, or any Phase 1–8/Canonical-Food-Identity decision.
**Phase:** Phase 9 — Application/Product Architecture. Gate 7 (end of Phase 9) is not open.
**Trigger:** Post-ratification continuation of `00_PROJECT_CONTROL/DECISIONS/2026-09-08-dec-067-
preparation-detail-ratification.md`. That record is treated here as fixed and not re-litigated.

---

## 1. Objective

Determine how Grocery can expose the ratified DEC-067 Level 1 capability —

```text
Meal → Ingredient list → Food + quantity → optional concise textual preparation note
```

— using the smallest architectural change possible, and to identify precisely what already exists versus
what is genuinely missing. This is a readiness investigation only; §16's candidate file list is not
executed here.

---

## 2. Authority / Decision Context

**Ratified, not reopened here** (`2026-09-08-dec-067-preparation-detail-ratification.md`): DEC-067 =
Level 1 — ingredient list with quantities, optionally accompanied by a concise textual preparation note.
Explicitly deferred: structured Preparation Method, ordered steps, formal Portion, Yield, scaling,
nutrient-retention coefficients, cooked-vs-raw adjustment, a general modification engine, batch/
restaurant-scale production, and any `DEC-069` scope question. Canonical Food Identity is **CLOSED**
(`d437f37` → `6555c7d` → `8a5ac09`, merged to `master`) and treated strictly as an upstream dependency.

**Baseline re-confirmed before inspecting code:** `git log --oneline -5` shows `master` unchanged since
the Canonical Food Identity closeout (`8a5ac09`); working tree carries only the two prior investigation/
ratification documents as untracked files. No implementation has occurred on `DEC-067` yet.

---

## 3. Current Architecture — Summary

Grocery has **no single "Meal" or "Recipe" entity.** Two independent representations already produce an
ingredient-list shape, for different purposes, and neither was built with DEC-067 in mind:

1. **`Combo`** (`src/lib/combos.ts`, data in `data/combos.json`) — a hand-authored, build-time-bundled
   suggestion: name + `{food, grams}` list + a numeric `prepMinutes` + tags. This is the only thing in the
   repository that Grocery itself *authors* as a named, reusable meal suggestion.
2. **`meal_entries`** (Supabase table, `src/lib/localMealPlan.ts`/`mealPlan.ts`) — individual
   (household, date, slot, food, quantity) rows a user adds directly in the Meal Plan tab, or that get
   created in bulk (one row per ingredient) when a `Combo` is logged via "Yedim." These rows have **no
   name and no note field of their own** — they are identified only by `(date, slot)` or, if they
   originated from a combo, by a `combo_id` string pointing back to that `Combo`.

Both converge on the same nutrition-calculation function (`mealNutrition.ts`) and the same canonical
Food-lookup catalog, but they are not the same entity, and only one of them (`Combo`) is something
Grocery "constructs" as a nameable unit rather than something a user assembles item-by-item.

---

## 4. Current Meal Model

There is no `Meal` type anywhere in the codebase. What exists:

- **`MealEntry`** (`src/lib/mealPlan.ts` lines 3–11): `{ id, date, slot, foodId, quantityG, position,
  comboId }`. One row = one (food, quantity) fact for one slot on one day. `slot` is one of
  `kahvalti | ogle | aksam | ara` (`MEAL_SLOTS`, `localMealPlan.ts` lines 21–26) — exactly four fixed
  slots, no user-defined meal naming.
- **A "meal" is therefore an implicit grouping**: every `MealEntry` sharing the same `(date, slot)` is
  rendered together in `MealPlanView`'s `MealSection` (lines 137–214), or, in `TodayView`, every entry
  sharing the same `comboId` is regrouped into an `EatenGroup` (lines 96–119) purely for display —
  neither grouping is a persisted, named object.
- **`Combo`** is the closest thing to a named, Grocery-constructed meal, but it is not a `meal_entries`
  row itself — it is a static catalog entry that `meal_entries` rows can optionally reference via
  `comboId` once logged.

**Consequence for DEC-067:** "a meal already constructed by Grocery" (the ratified text) most precisely
matches `Combo` — the one entity Grocery itself authors and names. A `MealPlanView`-built slot of items
has no name and no construction step attributable to Grocery beyond the food-picker UI; it is user-
assembled, not Grocery-constructed. This is stated as an architectural observation for §15, not as a new
decision — DEC-067 does not specify which entity qualifies, and this document does not decide it either.

---

## 5. Current Ingredient Model

Every ingredient reference in the codebase — `Combo.items[]`, `MealItem.foodId`, `MealEntry.foodId`, and
`MealFoodPicker`'s add call — has the identical shape: `{ foodId: string, grams/quantityG: number }`,
where **`foodId` is a `nutrition.name_tr` string (or a resolvable alias), not the new opaque `food_id`
UUID.**

Confirmed directly in source, not inferred:

- `src/lib/mealPlan.ts` line 7: `foodId: string; // Nutrition.name_tr`.
- `src/lib/combos.ts` line 4: `items: { foodId: string; grams: number }[]` — no comment, but
  `TodayView.tsx`'s raw-JSON mapping (lines 17–30) and `data/README.md` ("`food_id` is checked... against
  the live Supabase `nutrition` table... looked up with `lookupNutrition`") confirm it is resolved by
  name, exactly like `MealEntry.foodId`.
- `src/components/MealFoodPicker.tsx` line 69: `onAdd(selected.name_tr, quantityG)`.
- Resolution everywhere is `lookupNutrition(catalog, name)` → `normalize(name)` → exact map lookup
  (`nutrition.ts` lines 264–269) — exact-match only, no fuzzy step, consistent with the identity
  invariant, but keyed by **name**, not by the opaque `food_id`.

**Quantity semantics:** `grams`/`quantityG` is a raw gram figure everywhere, always treated as the
as-eaten/as-purchased amount. Nothing in the codebase distinguishes raw vs. cooked, or a serving vs. a
purchase quantity — confirmed by grep; no such field or comment exists.

**Unit:** grams only. No unit field, no unit conversion anywhere in the meal/ingredient path.

**Display name:** derived at render time via `catalog.get(item.foodId)?.name_tr ?? item.foodId`
(`MealPlanView.tsx` line 235) — falls back to the raw stored string if the catalog lookup misses.

**`food_id` (opaque) propagation — the actual gap:** the opaque `food_id` UUID exists only on the
`Nutrition` object itself (read-through from the API, `nutrition.ts` lines 6–11, 277) and is consumed by
exactly two call sites today: shopping `Item.foodId` (via `listActions.addItem`'s `resolveFood`, attached
at add-time) and `foodExclusions`'s dual-match (`{name_tr, food_id}`). **No meal/combo/ingredient
reference anywhere has been migrated to store the opaque `food_id`** — this matches the Canonical Food
Identity session checkpoint's own note that `meal_entries.food_id` and `Combo`'s `food_id`/`foodId` were
"left completely untouched to avoid a name collision with the new opaque concept," not overlooked by
accident. See §10 for what this means for DEC-067.

---

## 6. Current Combo Model

`data/combos.json` (16 entries) — exact shape, from source:

```json
{
  "id": "tavuk-pirinc-brokoli",
  "name_tr": "Tavuklu pirinç ve brokoli",
  "items": [{ "food_id": "tavuk göğsü", "grams": 150 }, ...],
  "prep_minutes": 20,
  "tags": ["hizli", "yuksek-protein"]
}
```

Mapped to the camelCase `Combo` type (`src/lib/combos.ts`) at load time in `TodayView.tsx` (lines 17–31).
**This is already, in effect, a Level-1 ingredient-list representation**: a name, a `{food, grams}[]`
list, and a single rough numeric time figure. It has:

- No method/steps field.
- No yield or portion field distinct from the ingredient list itself.
- No preparation-note text field of any kind — `prepMinutes` is a bare number, not a note.
- No user-edit path — hand-authored, bundled into the client build, not stored in Supabase
  (`data/README.md`: *"this file is not uploaded to Supabase — it's bundled directly into the client
  build and edited by hand"*).

`combos.json`'s own field is literally named `food_id` in the JSON (`"food_id": "tavuk göğsü"`), despite
holding a **name string, not the opaque UUID.** This is a pre-existing naming collision with the new
canonical `food_id` concept, not introduced by this investigation — flagged here because it is exactly
the kind of confusion §10's principle exists to prevent, and any future change to this file should not
compound it by silently assuming the field already carries a canonical ID.

---

## 7. Current Shopping Flow

The `meal/combo → ingredients → shopping item` path **already works end-to-end for combos**, verified by
direct trace:

```text
TodayView.addComboToList(combo)
  → for each combo.items: onAddItem(item.foodId, `${grams}g`, { exact: true })
  → App.tsx's listActions.addItem(name, qty, { exact: true })
  → resolveFood(canonicalName, foodIdentityIndex)   [exact match only]
  → new Item { id, name, qty, foodId: resolvedFoodId, ... } pushed onto the active list
```

(`TodayView.tsx` lines 149–156; `listActions.ts` lines 56–117.) The `{ exact: true }` flag is specifically
there so a combo's already-canonical name is **not** run through the shopping catalog's fuzzy rewrite
(`findCanonicalName`) — this is the fix the Canonical Food Identity investigation flagged and the
Milestone-1/closure work applied. The resulting shopping `Item` **does** carry the opaque `food_id` (via
`resolveFood`), even though the combo's own ingredient list does not (§5).

**For `MealPlanView`-built (non-combo) meals, no equivalent "send this slot's ingredients to my shopping
list" action exists** — confirmed by grep; `MealPlanView.tsx`/`useMealPlan` have no call into
`listActions`. This is a pre-existing gap in a different feature, not something DEC-067 introduces or is
required to close (DEC-071's shopping-translation requirement is already satisfied for the one entity —
`Combo` — that DEC-067 most directly targets, per §4).

---

## 8. Current Nutrition Flow

`src/lib/mealNutrition.ts` — `scaleNutrition(nutrition, grams)` and `sumMacros(totals[])` — is the single
calculation path used by both `comboMatch.ts` (combo suggestions) and `localMealPlan.ts`/`MealPlanView`
(manual meal entries). It:

- Scales a per-100g `Nutrition` row linearly by the stored gram quantity.
- Treats every stored gram figure as the as-eaten amount — no cooked/raw conversion, no yield step, no
  retention factor, anywhere.
- Is unaffected by which entity (`Combo` or `meal_entries`) supplies the ingredient list — both feed the
  same function with the same shape.

**Distinction maintained, verified against actual code, not assumed:** food composition
(`Nutrition` row) → ingredient quantity (`grams`) → nutrient calculation (`scaleNutrition`/`sumMacros`) →
nutrient target (`personalPlan.ts`/`useRemainingToday`, a separate module) → prescription (does not exist
in this codebase; Grocery only ever computes an *estimate/remaining* figure, never a prescriptive
instruction). DEC-067 Level 1 does not touch any link in this chain.

---

## 9. Preparation-Note Investigation

Searched across `src/`, `netlify/`, `supabase/`, and `data/` for: prep, cooking, instruction, method,
note, description, recipe, direction (case-insensitive). Results, filtered to what's actually relevant
(the raw grep also matched unrelated words like "categorization," "authorization," "state" — excluded
below):

| Candidate field | What it actually is | Usable for DEC-067's note? |
|---|---|---|
| `Combo.prepMinutes` / `combos.json`'s `prep_minutes` | A single number (minutes), displayed as "X dk" (`TodayView.tsx` lines 284, 347) | **No** — numeric, not textual; already serves a different purpose (a rough time estimate) that DEC-067 does not ask to repurpose |
| `Combo.tags` / `tags[]` | Free-form short labels (`"hizli"`, `"yuksek-protein"`), *"not filtered on yet; informational only"* (`data/README.md`) | **No** — a tag list is not prose, and repurposing it would conflict with its existing (if inactive) tag semantics |
| `Item.qty` (shopping) | Free text, e.g. `"2 kg"` | **No** — belongs to the shopping list, not a meal/combo, and is itself an existing `DATA GAP` for unrelated reasons (`PHASE_9...` §12.2 item 5) |
| Anything on `MealEntry`/`meal_entries` | No description/note/text column exists at all (`SELECT_COLS` in `meal-entries.ts` line 31 lists exactly `id,household_id,date,slot,food_id,quantity_g,position,combo_id`) | **No** — nothing to reuse |
| Anything on `Nutrition`/`nutrition` table | No preparation-related field; `allergen_classes`, macros, aliases only | **No** — wrong entity (food composition, not a meal) |

**Conclusion: no existing field can safely carry the DEC-067 note. A new field is genuinely necessary.**
The smallest place for it is an **optional string on `Combo`** (e.g. `Combo.prepNote?: string`, mirrored
in `combos.json` as an optional `"prep_note"` key) — this requires **no schema, no migration, no API
change**, because `combos.json` is a bundled static file, not a Supabase-backed table (§6). Extending
`meal_entries` (or inventing a new "named meal" entity) to carry a note for user-built `MealPlanView`
meals would require an actual schema change and a new concept (§4's observation) — not ruled out, but a
materially larger step than what the ratified Level-1 scope requires on its own.

---

## 10. Canonical Food Identity Integration

**Treated as CLOSED, not reopened, not redesigned.** The expected principle —

```text
Food Identity → food_id → Ingredient → Meal
```

— is checked against actual code, not assumed:

| Link | Status |
|---|---|
| **Food Identity → `food_id`** | Real and working (`nutrition.food_id`, `foodIdentity.ts`'s exact-only `resolveFood`). Unaffected by anything in this investigation. |
| **`food_id` → Ingredient** | **Not yet true.** Every ingredient reference in `Combo`/`MealEntry`/`MealItem` stores a **name string**, not `food_id` (§5). The opaque id is available (every `Nutrition` row carries one) but nothing in the meal/combo path reads or stores it. |
| **Ingredient → Meal** | True in the loose sense established in §3/§4 — a `Combo`'s or a slot's ingredient list is exactly a `(Food-reference × quantity)[]`, matching `PHASE_9...` §14.1's "Recipe Ingredient is a derived concept, not a new identity." |

**What this means for DEC-067 Level 1, precisely:** the ratified capability can be built entirely on
**today's existing name-based resolution** — it already works correctly (exact match, no fuzzy step,
`lookupNutrition`) for both `Combo` and `meal_entries`. Migrating `Combo.items[].foodId`/
`MealEntry.foodId` to store the opaque `food_id` instead of a name is **not required to satisfy DEC-067**
and is **not proposed here** — doing so would touch `combos.json`, its loader, `comboMatch.ts`,
`meal-entries.ts`'s API contract, and the `meal_entries` table itself, which is a materially larger and
unrelated change (it is, in fact, exactly the "unify the three disconnected identity mechanisms" work
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §12.2 dependency #2 already named as separate,
deferrable work). **No fuzzy matching is introduced or proposed anywhere in this investigation.** No
second Food table is proposed. The identity resolver itself is not touched.

---

## 11. DEC-066 Boundary

`DEC-066` ("meal construction") owns *deciding what meal to construct* — in the current codebase, this is
either `comboMatch.ts`'s deterministic ranking (for suggestions) or the user's own free choice of foods in
`MealFoodPicker` (for manual entries). **DEC-067 Level 1 does not change or touch this layer.** It only
adds a representation concern (the optional note) to whatever `DEC-066` has already produced — it does not
decide which foods go into a meal, does not re-rank combos, and does not alter `matchCombos`/
`scoreAllCombos`'s logic in any way.

---

## 12. DEC-068 Boundary

`DEC-068` ("skill/time/equipment constraint adjustment," `App Priority: OPTIONAL`, still a
`SPECIFICATION GAP` per `PHASE_9...` §3) consumes `DEC-067`'s output. Today, the only DEC-068-adjacent
data point that exists at all is `Combo.prepMinutes` (a rough time figure) — no skill or equipment field
exists anywhere. Level 1's optional textual note does not, by itself, give `DEC-068` any new *structured*
signal to match against (a free-text note cannot be programmatically matched against "user has 15
minutes" without separate, unspecified parsing logic) — this is consistent with `DEC-068` remaining an
open `SPECIFICATION GAP`, not resolved or narrowed by this investigation.

---

## 13. DEC-069 Boundary — Explicit Scope-Leakage Audit

Checked against every item the task named. **None is introduced, expanded, or silently supported by the
Level-1 architecture investigated here:**

| Item | Present anywhere today? | Would Level 1 introduce/expand it? |
|---|---|---|
| Yield | Absent (confirmed, §5 — "grams... always... as-eaten") | No |
| Batch scaling / serving multiplication | Absent | No |
| Recipe scaling | Absent | No |
| Household batch production | Absent | No |
| Restaurant-scale production | Absent (explicitly out of scope, Phase 8) | No |
| Inventory-aware recipe scaling | Absent (no pantry/inventory concept exists at all, `PHASE_9...` §12.1) | No |
| Standardized cooking methods | Absent | No |
| Structured recipe steps | Absent | No |

The one existing numeric field adjacent to this space, `Combo.prepMinutes`, is a rough time *estimate*,
not a yield or scaling mechanism, and this investigation does not propose changing its meaning or adding
any scaling logic derived from it. `DEC-069` remains entirely unresolved and is not touched by anything
in §14–§17 below.

---

## 14. Existing vs. Missing Capability Matrix

| Capability | Already exists? | Where? | DEC-067 change required? |
|---|---|---|---|
| Meal representation | Partial — no `Meal` entity; `Combo` (named) and `meal_entries` groups (unnamed) both exist | `combos.ts`/`combos.json`; `mealPlan.ts`, `MealPlanView.tsx` | **NOT REQUIRED** — Level 1 attaches to `Combo` (§4); no new Meal entity needed |
| Ingredient representation | Yes | `Combo.items[]`, `MealItem`, `MealEntry` | **NOT REQUIRED** — already a (food, quantity) list |
| Food reference | Yes (by name) | Same as above | **NOT REQUIRED** for Level 1 (§10) |
| `food_id` (opaque, on ingredients) | No — only on `Nutrition` rows, shopping `Item`, exclusions | `nutrition.ts`, `listActions.ts`, `foodExclusions.ts` | **NOT REQUIRED** — out of DEC-067's scope (§10) |
| Quantity | Yes (grams) | `Combo.items[].grams`, `MealEntry.quantityG` | **NOT REQUIRED** |
| Unit | Grams-only, uniform | Same | **NOT REQUIRED** — no unit concept needed for Level 1 |
| Ingredient display | Yes | `MealPlanView.tsx` `MealItemRow` | **NOT REQUIRED** |
| Nutrition calculation | Yes | `mealNutrition.ts` | **NOT REQUIRED** |
| Shopping expansion | Yes, for `Combo` | `TodayView.addComboToList` → `listActions.addItem` | **NOT REQUIRED** |
| Preparation note | **No** | — | **MINOR EXTENSION** — one new optional field on `Combo`/`combos.json` (§9) |
| Meal detail UI (display the note) | No | `TodayView.tsx` `SuggestionCard`, `EatenGroup` rendering | **MINOR EXTENSION** — render an existing-shape optional string, same pattern as `prepMinutes` today |
| Persistence | `combos.json` needs none (static file); Supabase needs none for Level 1 | — | **NOT REQUIRED** |
| API support | `/api/nutrition`, `/api/meal-entries` unaffected | — | **NOT REQUIRED** |

No row is classified **NEW CONCEPT** or **BLOCKED**. The only required change is a **MINOR EXTENSION**:
one new optional textual field, plus the UI to show it where a combo's details already render.

---

## 15. Minimal Implementation Architecture

The existing code already supports, and this investigation recommends staying with:

```text
Existing Combo
      │
      ├── Food (name-resolved) + grams
      ├── Food (name-resolved) + grams
      ├── Food (name-resolved) + grams
      └── optional prepNote: string   ← the only new thing
```

**Not** the expanded shape the task's own example warns against (`Recipe`, `RecipeIngredient`,
`PreparationMethod`, `PreparationStep`, `Portion`, `Yield`, `RecipeVersion`, `RecipeScaling`) — nothing in
§3–§14's evidence supports or requires any of those for the ratified Level-1 scope. `combos.json`'s
existing shape (name + ingredient list + a single scalar) is structurally identical to what Level 1 asks
for; the only genuinely missing piece is the note field itself.

**Scoping observation, not a new decision:** this minimal architecture satisfies DEC-067 for
Grocery-authored `Combo` suggestions. Whether a user-built `MealPlanView` slot should *also* be able to
carry a preparation note is a separate, larger question (§4, §9) — it would require inventing a new named
"meal" concept that does not exist today, which is not what the ratified Level-1 text requires ("a meal
already constructed by Grocery"). Not decided here; noted so a future implementer does not silently
assume parity between the two surfaces.

---

## 16. Candidate Changed Files

**Not edited. Listed for future reference only.**

| Path | Why it would change | Type of change | Source/API/schema/UI/data? | Migration required? |
|---|---|---|---|---|
| `data/combos.json` | Add an optional `"prep_note"` string per entry | Data | Data | No — static bundled file |
| `src/lib/combos.ts` | Add `prepNote?: string` to the `Combo` type | Source | Source (type only) | No |
| `src/components/TodayView.tsx` | Map `raw.prep_note` → `prepNote` alongside the existing `prep_minutes`/`prepMinutes` mapping (lines 17–31); render the note in `SuggestionCard`/`EatenGroup` if present | Source + UI | Source, UI | No |
| `data/README.md` | Document the new optional `prep_note` field in the `combos.json` schema section | Documentation | Data-schema doc | No |

**Not required for Level 1**, listed only to show what was deliberately excluded from the candidate set:
any `supabase/*.sql` migration, any `netlify/functions/*.ts` change, any change to `meal_entries`,
`mealPlan.ts`, `localMealPlan.ts`, `MealPlanView.tsx`, `MealFoodPicker.tsx`, `comboMatch.ts`,
`mealNutrition.ts`, `foodIdentity.ts`, or `foodExclusions.ts`. None of these needs to change to satisfy
the ratified Level-1 text.

---

## 17. Data Flow

**Existing flow (unchanged):**

```text
DEC-066 meal construction (comboMatch.ts ranking, or manual MealFoodPicker choice)
        ↓
Combo (name + items[] + prepMinutes)  |  meal_entries group (date, slot)
        ↓
Food (name-resolved via lookupNutrition) + grams
        ↓
mealNutrition.ts (scaleNutrition / sumMacros)  →  display in TodayView / MealPlanView
        ↓
(for Combo only) TodayView.addComboToList → listActions.addItem → shopping Item (food_id-aware)
```

**Proposed addition (not implemented):**

```text
Combo
  └── prepNote?: string   [NEW]
        ↓
  rendered alongside prepMinutes wherever a Combo's details already display
  (TodayView's SuggestionCard / EatenGroup)
```

Nothing else in the existing flow changes. The nutrition, shopping, and exclusion paths are untouched by
the proposed addition.

---

## 18. Risks

- **Scope-creep risk (highest):** the temptation to attach the note to `meal_entries` "for consistency"
  would require inventing a new named-meal concept not requested by the ratified decision (§4, §15) —
  flagged explicitly so a future implementation session does not silently expand scope for symmetry's
  sake.
- **Naming-collision risk:** `combos.json`'s existing `food_id` field (a name string, §6) sitting next to
  the real opaque `food_id` concept elsewhere in the codebase is a pre-existing point of confusion. Adding
  `prep_note` next to it is safe, but any future work in this file should not assume `food_id` here means
  the same thing it means in `nutrition.food_id`.
- **UI-only risk:** if the note is only ever rendered where `prepMinutes` already is, very long text could
  break the existing compact card layout (`SuggestionCard`) — a display-detail concern for actual
  implementation, not an architectural one.
- **No risk found for nutrition, shopping, Food Identity, or exclusion correctness** — the proposed
  addition is purely additive and orthogonal to every one of those paths (§8, §10, §7).

---

## 19. Validation Plan (for future implementation — not executed now)

- **Unit tests:** `Combo`/`combos.json` parsing accepts an optional `prepNote`/`prep_note` and defaults
  correctly when absent (extending the existing pattern in `comboMatch.test.ts`).
- **Integration tests:** `scoreAllCombos`/`matchCombos` output is unaffected by the new field's presence
  or absence (a regression guard, not new logic to test).
- **Browser QA:** a combo with a note renders it in `TodayView`; a combo without one renders exactly as
  today (no empty note UI).
- **Nutrition regression checks:** `mealNutrition.ts` totals for existing combos are byte-identical before
  and after the change (the field is inert to calculation).
- **Shopping regression checks:** `addComboToList`/`removeComboFromList` behavior and the `{ exact: true }`
  Food-ID dedup path are unaffected — the note never reaches `listActions`.
- **Food ID regression checks:** `foodIdentity.ts`'s resolver and its existing safety test
  (`foodIdentitySafety.test.ts`) are untouched and should be re-run unmodified to confirm no incidental
  coupling was introduced.
- **Preparation-note persistence/display checks:** since `combos.json` is static/bundled, "persistence" is
  build-time only — verify the note survives the `TodayView.tsx` raw→camelCase mapping (§16) unchanged.
- **Backward compatibility:** existing combos without the new field must render and function identically
  (optional field, no default required beyond "absent").
- **Safety/exclusion regression checks:** `comboMatch.ts`'s hard/soft exclusion filtering
  (`comboHasHardConflict`/`comboHasSoftConflict`) is unaffected — the note is not consulted by either
  function and should not be.

---

## 20. Human Decision Status

> **No additional human architectural decision required before implementation.**

`DEC-067`'s primary level, preparation-state textuality, Portion/Yield deferral, ordered-steps deferral,
and the modification-only classification are all already ratified
(`2026-09-08-dec-067-preparation-detail-ratification.md`). The one scoping observation this investigation
surfaced (§4/§15 — whether the note should also reach user-built `MealPlanView` meals, not just `Combo`)
is **not** raised as a required decision: the ratified text ("a meal already constructed by Grocery") is
already satisfiable by targeting `Combo` alone, and extending further is optional future scope, not a
blocker. `DEC-067`, Canonical Food Identity, and `DEC-069` are not reopened by this document.

---

## 21. Explicitly Deferred Scope

Unchanged from the ratification, reconfirmed against actual code in this pass:

- Structured Preparation Method / Cooking Method taxonomy — no such field exists or is proposed.
- Ordered/structured recipe steps — no such field exists or is proposed.
- Formal Portion concept distinct from grams — not proposed; grams remain the only quantity unit.
- Recipe Yield / recipe scaling / batch scaling / serving multiplication — none exists; none proposed.
- Nutrient-retention coefficients / cooked-vs-raw nutrient adjustment — no such logic exists or is
  proposed; `mealNutrition.ts` is untouched.
- A general recipe-modification engine — out of scope, unrelated to `Combo`'s ingredient-list shape.
- Migrating `Combo`/`meal_entries` ingredient references to the opaque `food_id` — real, named, and
  explicitly deferred (§10) as separate, larger work, not required by DEC-067.
- A new named "meal" entity for `MealPlanView` — named as a scoping observation (§4/§15/§20), not
  proposed or required.
- Restaurant-scale/quantity-food batch production — untouched (§13).
- `DEC-069` in full — untouched.
