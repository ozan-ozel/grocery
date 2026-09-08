# Canonical Food Identity Investigation

## Status and Scope

- Phase: Phase 9 — Application / Product Architecture
- Task: read-only identity investigation and architecture definition
- Branch: `feature/phase-9-canonical-food-identity`
- Implementation status: no production behavior changed by this investigation
- Decision status: six implementation-boundary decisions approved; implementation still unauthorized

This artifact records the current code evidence and a minimum safe direction for a future
implementation. It does not amend Phase 1–8 artifacts, existing DEC records, the master Phase 9
architecture document, database schema, API behavior, or tests.

The identity option called **A1** here means the Phase 9 §16.1 identity direction: extend the
existing alias mechanism. It must not be confused with the ratified Phase 9 A1 meaning in §§18–19,
which concerns intolerance remaining soft.

## 1. Current Identity Architecture

The application currently has no opaque, stable Food identifier. It has several string identities:

- `nutrition.name_tr`: normalized Turkish display/lookup key for a nutrition row.
- `Nutrition.aliases`: exact alternate strings that map to the same nutrition object in selected
  client lookup maps.
- shopping `Item.name`: free text stored in tenant list state and in the shared `items` table.
- combo `items[].food_id`: hand-authored string intended to equal `nutrition.name_tr`.
- meal `food_id`: persisted string documented as `nutrition.name_tr`.
- food exclusion `FoodExclusion.foodId`: persisted string intended to equal the canonical nutrition
  name, not a stable ID.
- allergen data: attached to a nutrition row and therefore indirectly keyed by `name_tr`.
- category memory: normalized shopping-name string keyed per household.

The current design is deterministic for exact nutrition lookup and for the B3 safety functions when
those functions receive a resolved Nutrition row. It is not a stable identity architecture across
persistence boundaries: renaming a nutrition name, changing an alias, or changing spelling can make
old combo, meal, exclusion, or list values unresolved or refer to a different row.

## 2. Identity Representations Discovered

| Representation              | Example / source                                               |                                            Stable? |                                                     Persisted? | Used by                                                       |                                                      Safety-sensitive? |
| --------------------------- | -------------------------------------------------------------- | -------------------------------------------------: | -------------------------------------------------------------: | ------------------------------------------------------------- | ---------------------------------------------------------------------: |
| Nutrition canonical name    | `nutrition.name_tr = "süt"`; `src/lib/nutrition.ts`            |                                   No; mutable text |                       Supabase nutrition row, cache, seed data | Nutrition lookup, UI display, exclusions, mappings            |                 Indirectly yes when used to reach exclusions/allergens |
| Nutrition alias             | `"tam yağlı süt"`; `Nutrition.aliases`                         |           No; mutable text and not globally unique |                                  Supabase nutrition row, cache | Exact lookup maps, catalog search, exclusion search           |                  Indirectly; aliases are not themselves exclusion keys |
| Nutrition map key           | `Map<string, Nutrition>` in `fetchNutrition`, `useFoodCatalog` |                              No; normalized string |                                      Device localStorage cache | Lookup and catalog consumers                                  |                                          Yes if lookup result feeds B3 |
| Shopping item ID            | `Item.id = uid()` in `src/lib/store.ts`                        |                Stable within one list-state record |                               Tenant state / shared `items.id` | Row editing, deletion, undo                                   |                                    No; item row is not a Food identity |
| Shopping item name          | `Item.name`, persisted as `items.name`                         |                                      No; free text |                                Tenant state / Supabase `items` | Shopping display, category, fuzzy dedup                       | Not directly, but identity conflation can misrepresent a selected food |
| Combo identifier            | `Combo.id`, e.g. `tavuk-pirinc-brokoli`                        | Stable in bundled JSON while source remains stable |                    Bundled source; meal `combo_id` can persist | Recommendation and eaten-group reconstruction                 |                                                           No by itself |
| Combo food reference        | `combos.json.items[].food_id`, e.g. `"pirinç"`                 |                                     No; name-based |                                                 Bundled source | Nutrition resolution, exclusion eligibility, list translation |   Yes: combo eligibility depends on exact resolved names and B3 checks |
| Meal food reference         | `meal_entries.food_id`, e.g. `"pirinç"`                        |                               No; explicitly no FK |                                        Supabase `meal_entries` | Meal plan, nutrition derivation, TodayView                    |                        Yes for logged-food lookup and future filtering |
| Local meal food reference   | `MealItem.foodId`, documented as `Nutrition.name_tr`           |                                                 No |                             Query cache / in-memory local plan | Meal rendering and macro totals                               |                                                             Indirectly |
| Food-level exclusion key    | `FoodExclusion.foodId`, e.g. `"badem"`                         |                        No; intended canonical name | `personal_plan.food_exclusions` JSONB and localStorage profile | Hard/soft filtering                                           |                                       Yes; exact safety decision input |
| Legacy food exclusion       | `excluded_food_ids[]`                                          |                                      No; free text |    `personal_plan.excluded_food_ids`, local cache legacy shape | Migration fallback                                            |                            Yes; migrated fail-closed as `unclassified` |
| Allergen mapping key        | `allergen_classes` entry attached to nutrition row             |                                 No independent key |                    Supabase `nutrition` JSONB and API response | B3 class matching                                             |                                                                    Yes |
| Allergen exclusion key      | `AllergenClassExclusion.allergenClass`                         |                                  Stable enum value |                `personal_plan.allergen_class_exclusions` JSONB | B3 class matching                                             |                                                                    Yes |
| Category-memory key         | normalized `name_lower` / localStorage map key                 |                              No; shopping spelling |               Supabase `item_category_memory` and localStorage | Category recall                                               |                                                                     No |
| Nutrition source identifier | USDA `fdc_id` in `scripts/usda-mapping.json` only              |                          Stable external source ID |                    Mapping file, not application Food identity | Seed/update process                                           |                                    No; not exposed as runtime identity |

No current representation is a stable application-wide Food identity. `Item.id` is a shopping-row
identity, not a Food identity. `Combo.id` identifies a composite suggestion, not an ingredient.

## 3. Current Food-Identity Flow

### 3.1 User-visible food to shopping list

1. A user types a free-form entry in `AddItem.tsx`, or selects a nutrition suggestion.
2. `parseEntry()` trims whitespace, extracts a free-text quantity, and applies Turkish title casing.
3. `createListActions().addItem()` calls `findCanonicalName()` for normal free text. That function
   compares the input against the household's shopping history using `isCloseMatch()` and may replace
   the typed spelling with an established shopping spelling.
4. The item is persisted as `{ id, name, qty, checked, ... }` in tenant state and ultimately in the
   shared `items` table. There is no Food reference in the row.
5. For combo-to-list, `TodayView` passes `combo.items[].foodId` with `{ exact: true }`. This skips
   `findCanonicalName()`, but the subsequent existing-row check still uses `isCloseMatch()`.

This is a display-string shopping pipeline. `{ exact: true }` prevents one fuzzy rewrite but does not
make the whole add operation identity-exact: an existing near-spelling can still absorb the new item.

### 3.2 Shopping representation to normalization and nutrition lookup

- `NutritionView` sends shopping `Item.name` values to `fetchNutritionCached()`.
- `fetchNutrition()` normalizes request names with `normalize()` (`trim()` plus
  `toLocaleLowerCase("tr-TR")`) and POSTs them to `/api/nutrition`.
- The API queries both exact `name_tr` and overlapping `aliases`.
- The client builds a `Map` using canonical `name_tr` and aliases. `lookupNutrition()` normalizes its
  input and performs exact `Map.get()`.
- Fuzzy matching is not used in nutrition lookup. A typo that is not an exact normalized name or
  alias remains unresolved.

Browse/catalog behavior differs slightly: the GET endpoint searches `name_tr` only, while the client
catalog map includes aliases from returned rows. The browse UI itself displays canonical names, not
alias identities.

### 3.3 Canonical-name resolution

There are two different functions with misleadingly adjacent concepts:

- `lookupNutrition()` is exact normalized lookup plus whatever exact alias keys were loaded into the
  map. It resolves to a Nutrition object.
- `findCanonicalName()` is fuzzy household shopping-history deduplication. It returns a shopping
  display string selected by edit distance, count, and recency. It does not resolve against the
  nutrition catalog and does not return a stable Food identity.

`isCloseMatch()` is edit-distance matching with Turkish-aware callers. It is used by shopping
catalog/list deduplication and is intentionally absent from `foodExclusions.ts` and `comboMatch.ts`.

### 3.4 Combo and meal references

- `combos.json` stores ingredient names in `items[].food_id`.
- `comboMatch.ts` resolves each combo ingredient through `catalog.get(item.foodId)`, not through
  `lookupNutrition()`. Therefore combo references must already be canonical map keys; aliases in a
  catalog map happen to work only when that map includes the alias, but the persisted reference itself
  remains a string.
- `MealFoodPicker` offers `food.name_tr` and passes that canonical name to `useMealPlan.addItem()`.
- `meal_entries.food_id` stores the string without a foreign key. Nutrition is derived later from the
  live catalog, so renaming/removing a nutrition row can make old entries unresolved.
- `TodayView` logs combo ingredients by the same name-based `foodId` and persists `combo_id` only as
  a grouping label.

### 3.5 Food exclusions and allergen logic

- `PersonalPlanView` searches canonical names and aliases but stores the selected canonical
  `f.name_tr` in `FoodExclusion.foodId`.
- `hasHardExclusion()` and `hasSoftConstraint()` compare exact strings. No normalization or alias
  resolution occurs inside these safety functions.
- `comboMatch.ts` compares food-level exclusions against `nutrition.name_tr`, then evaluates B3
  allergen mappings on the resolved Nutrition object.
- `hasHardAllergenClassExclusion()` treats missing class evidence as `UNKNOWN` and blocks under a
  hard-tier class exclusion; soft class constraints only flag confirmed `PRESENT`.
- `MealFoodPicker` applies the same hard/soft split to resolved Nutrition rows.

Thus the safety boundary is exact after a Nutrition object has been resolved. The unresolved risk is
upstream identity drift: a legacy string may fail to resolve, or a future implementation may wrongly
convert a display/fuzzy match into a safety identity.

## 4. `nutrition.name_tr` Role Analysis

| Use                                        | Classification                  | Evidence                                                           | Consequence                                                                         |
| ------------------------------------------ | ------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| User-facing label in nutrition and meal UI | DISPLAY                         | `NutritionView`, `MealPlanView`, `MealFoodPicker` render `name_tr` | A rename changes visible text                                                       |
| Nutrition map key                          | LOOKUP                          | `Map.set(name_tr, row)`, `lookupNutrition()`                       | It is the current lookup authority                                                  |
| Combo ingredient reference                 | IDENTITY + LOOKUP               | `combos.json.food_id`, `comboMatch`, `TodayView`                   | A display rename can break combos                                                   |
| Meal-entry `food_id`                       | IDENTITY + PERSISTENCE + LOOKUP | `meal_entries` schema and API                                      | Historical rows have no FK or stable target                                         |
| Food exclusion `foodId`                    | IDENTITY + PERSISTENCE + SAFETY | `foodExclusions.ts`, personal-plan API/schema                      | Exact string drift can alter filtering                                              |
| Allergen mapping attachment                | SAFETY + LOOKUP                 | `Nutrition.allergen_classes` and B3 functions                      | Mapping follows the nutrition row, not a stable Food ID                             |
| Nutrition API upsert conflict key          | PERSISTENCE                     | `scripts/upload-nutrition.ts` and API use `name_tr`                | Renaming is an insert/new key operation rather than an identity-preserving update   |
| Alias target                               | LOOKUP + IDENTITY bridge        | aliases map to the row containing `name_tr`                        | Alias currently means "same nutrition row", not a separately governed Food identity |
| Search and comparison exclusion            | DISPLAY + LOOKUP                | `NutritionCompareView`, browser and picker keys                    | UI uniqueness relies on names                                                       |

The same string is simultaneously display text, lookup key, persistence value, combo reference,
exclusion key, and an indirect allergen key. That is the primary architectural defect.

## 5. Matching Boundaries

### Exact identity and resolution

The current exact sequence is effectively:

1. trim and Turkish-locale lowercase;
2. exact canonical `name_tr` map key;
3. exact alias map key, when aliases were loaded;
4. unresolved.

This is safe only as a temporary name-based resolver because the result is still a mutable string
key. It must not be described as a stable identity.

### Fuzzy/display matching

`isCloseMatch()` and `findCanonicalName()` are display/history tools. They currently influence:

- shopping-list suggestion clustering;
- free-text shopping add canonicalization;
- duplicate shopping-row detection in `addItem()`;
- catalog history deduplication.

They do not currently influence:

- `hasHardExclusion()`;
- `hasSoftConstraint()`;
- `hasHardAllergenClassExclusion()`;
- `hasSoftAllergenClassConstraint()`;
- `comboMatch()`'s Nutrition resolution;
- nutrition `lookupNutrition()`;
- B3 allergen-class status.

Fuzzy matching can therefore not currently bypass a B3 or food-exclusion check directly. However, it
can influence the persisted shopping representation and can merge a combo's exact ingredient into a
near-spelling existing shopping row. That is an identity-loss bug at the shopping boundary, not a
direct allergy bypass today. The future canonical model must make exact Food ID equality the only
identity operation and leave fuzzy matching as suggestion-only UX.

Substitution does not exist as a separate implemented path. Combo selection is eligibility/ranking,
not substitution. No claim is made that fuzzy matching is safe for future substitution.

## 6. Existing Alias Mechanism

### What exists

- Storage: `aliases` is a string array on each Supabase `nutrition` row, mirrored by seed data and
  returned by the nutrition API.
- Target: an alias points to the containing nutrition row, and client maps point it to the same
  `Nutrition` object as `name_tr` when loaded together.
- Normalization: writes normalize aliases with Turkish-locale trim/lowercase; API reads assume stored
  values are normalized; client lookup normalizes the query.
- Determinism: exact lookup is deterministic for a given map, but global determinism is not enforced.
- Collision behavior: no database uniqueness constraint or API validation prevents the same alias from
  appearing on multiple rows. `fetchNutrition()` can overwrite an alias map key based on response
  order; `useFoodCatalog()` keeps the first alias it encounters. Those are inconsistent collision
  outcomes.
- Nutrition lookup: yes, through POST-by-name and client maps; browse GET filters `name_tr` only.
- Shopping: aliases participate in nutrition-backed suggestions/catalog maps, but shopping items still
  persist free-text `name` and do not persist an alias target.
- Exclusions: PersonalPlan search recognizes aliases, then persists the canonical `name_tr`; exclusion
  matching itself does not resolve aliases.
- Allergen logic: aliases only help obtain a Nutrition row; allergen status is read from that row.

### A1 conclusion

**A1 is safe and sufficient only as a bridge, not as the final identity by itself.** It can safely
extend the current mechanism if all alias resolution is exact, collision-checked, and returns a
stable canonical Food ID. The current alias array alone is insufficient because it has no stable ID,
no globally enforced uniqueness, no explicit ambiguity state, and no migration/versioning semantics.

The minimum safe A1-compatible direction is to add a stable opaque `food_id` to the canonical Food
record represented by each current nutrition row, retain `name_tr` as the canonical display name, and
retain aliases as exact alternate names that resolve to that `food_id`. This is an extension of the
existing mechanism, not permission to create a broad separate food database.

## 7. A1 Feasibility and Relationship Matrix

| Relationship                       | Status                                   | Evidence / boundary                                                                                             |
| ---------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Stable Food identifier             | EXTENSION REQUIRED                       | No runtime Food ID exists; `Item.id` and `Combo.id` are different concepts                                      |
| Canonical display name             | EXISTING, with separation required       | `nutrition.name_tr` is already the display source, but must stop being the identity key                         |
| Exact aliases                      | EXISTING, with safety hardening required | Exact alias arrays exist, but collision and ambiguity checks are absent                                         |
| Nutrition/composition relationship | EXTENSION REQUIRED                       | Current composition is embedded in the name-keyed nutrition row; add `food_id` ownership and preserve values    |
| Combo relationship                 | EXTENSION REQUIRED                       | Replace or version `food_id` string references with canonical Food IDs; retain a compatibility resolver         |
| Shopping relationship              | EXTENSION REQUIRED                       | Add optional canonical Food ID to an item; preserve free text for display and unresolved entries                |
| Food-level exclusions              | EXTENSION REQUIRED                       | Persist canonical Food ID, with an explicit legacy unresolved/name fallback during migration                    |
| Allergen relationship              | EXTENSION REQUIRED                       | Keep class enum and tri-state mapping, but attach mapping to canonical Food ID rather than name-only row lookup |
| Future recipes                     | FUTURE                                   | Recipe work is outside this investigation and should consume Food IDs later                                     |
| Pantry                             | EXPLICITLY OUT OF SCOPE                  | No pantry concept exists and no pantry model is proposed here                                                   |
| Substitution                       | FUTURE / HUMAN-DEFINED                   | Requires a semantic substitution policy; fuzzy similarity is not sufficient                                     |

## 8. Safety Analysis

### Allergy

Today, a food-level allergy exclusion is reliable only when the persisted `foodId` exactly equals the
resolved `Nutrition.name_tr` string. It is not reliably stable across renames, legacy spellings, or
ambiguous alias data. A stable Food ID is required for durable reliability. The future resolver must
fail closed to `UNKNOWN` when a legacy string is ambiguous or unresolved, never guess by edit distance.

### Allergen class

`Food -> allergen class` can remain deterministic. The existing B3 tri-state and conservative UNKNOWN
rule are sound once the Food object is stable. The mapping should be keyed by canonical `food_id`,
while class status remains explicit `PRESENT` or `CONFIRMED_ABSENT`; missing data remains `UNKNOWN`.

### Intolerance

Yes. Soft intolerance is an independent semantic tier and should remain separate from identity
resolution. Identity answers "which Food?"; the exclusion reason answers "how strongly should it be
handled?".

### UNKNOWN

Yes, but only if the resolver has an explicit result type such as `RESOLVED`, `AMBIGUOUS`, or
`UNKNOWN`. A missing exact ID, colliding alias, stale name, or unsupported legacy value must not be
silently converted to a nearby Food.

### Fuzzy matching

Yes, it can be isolated from safety identity, but the current shopping add path is not completely
isolated: `{ exact: true }` bypasses fuzzy canonical rewrite but the same function still fuzzy-matches
against existing shopping rows. That must be corrected or bypassed when a future call carries a
canonical Food ID. Fuzzy matching may remain for suggestions and free-text UX, never as proof of Food
identity, exclusion equivalence, allergen equivalence, or substitution equivalence.

## 9. Legacy Compatibility and Migration Implications

Current legacy/persisted forms include:

- Supabase nutrition rows keyed/upserted by `name_tr`.
- `data/nutrition.json` seed rows keyed by `name_tr`, with aliases.
- bundled combo `food_id` strings.
- shared shopping `items.name` strings and tenant state lists.
- `meal_entries.food_id` strings with no FK.
- `personal_plan.food_exclusions[].foodId` and legacy `excluded_food_ids[]` strings.
- device nutrition caches keyed by names and aliases.
- local personal-plan caches containing old `excludedFoodIds` values.
- category-memory keys based on normalized names.
- USDA `fdc_id` values used for import provenance, not application identity.

No migration should assume that equal strings, equal nutrition values, or similar names prove the
same Food. A future migration should:

1. assign a stable `food_id` to every currently unambiguous canonical nutrition row;
2. build a normalized exact lookup from old canonical names and validated aliases;
3. classify every historical string reference as resolved, ambiguous, or unknown;
4. backfill only unambiguous references in lists, meal entries, combos, and food exclusions;
5. preserve the original string as a display/legacy field during a deprecation period;
6. leave ambiguous and unknown records visibly unresolved rather than guessing;
7. validate alias collisions before enabling alias writes;
8. retain old columns or compatibility readers until read/write coverage is verified.

The migration must not use USDA `fdc_id` as the application Food ID automatically: it identifies an
external nutrition source record, not necessarily Grocery's food identity, and multiple preparation,
brand, or composition choices can share or differ from a source row.

## 10. Collision Risks

The following are real identity hazards and must be represented as separate concerns:

- Two nutrition rows with the same display name: currently prevented only implicitly by name-based
  upsert assumptions, not by an inspected application-level Food ID model.
- Turkish spelling/casing variants: Turkish-locale normalization handles case and whitespace, but it
  does not establish equivalence for transliteration such as `sut` versus `süt`.
- Alias collisions: the same alias can currently be attached to multiple rows with inconsistent map
  winner behavior.
- Singular/plural or near-spelling variants: fuzzy matching may merge shopping display rows but must
  not establish Food identity.
- Brand-specific versus generic foods: same or similar display names do not prove the same
  composition or allergen profile.
- Raw versus cooked foods: nutrition-equivalent values do not prove identity; preparation state must
  remain part of a future Food definition where relevant.
- Composite/prepared foods: a shared allergen class does not make two foods interchangeable.
- Nutrition-equivalent foods: equal macros do not make foods the same Food.
- Allergen-equivalent foods: sharing an allergen class does not make foods the same Food.
- Alias and display renames: changing a display name must not orphan historical safety references.

## 11. Minimum Safe Canonical Model

The smallest model that supports the requested current capabilities is:

```text
Food {
  food_id: opaque stable identifier
  canonical_name: current canonical display name
  aliases: exact, normalized, globally unambiguous alternate names
  nutrition: relationship to the current composition/nutrition record
  allergen_classes: explicit per-class status/source data
}
```

For the first implementation, this can be represented as a stable `food_id` added to the existing
nutrition record rather than a comprehensive new food database. The canonical Food record and the
nutrition composition are conceptually distinct even if their first physical storage is one table.

Runtime rules:

- canonical `food_id` is the only identity equality for new persisted references;
- `canonical_name` is display text and a compatibility lookup key, not identity;
- aliases are exact normalized input names pointing to one and only one `food_id`;
- alias collisions produce `AMBIGUOUS`, never an arbitrary winner;
- resolved Food objects carry the stable ID into combos, list items, meal entries, exclusions, and
  allergen evaluation;
- unresolved legacy text remains `UNKNOWN` and retains its original text;
- fuzzy matching can suggest a candidate to a human but cannot auto-resolve a safety-sensitive value;
- no recipe, pantry, portion, scaling, or optimization model is required for this foundation.

## 12. Implementation Proposal

### A. Canonical identity

Add an opaque stable `food_id` to each canonical Food represented by the current nutrition catalog.
Do not derive it from `name_tr`, aliases, USDA IDs, or display text. Generate it once and preserve it
through renames.

### B. Alias model

Keep aliases as exact normalized strings owned by one Food. Add validation that canonical names and
aliases are unique across the catalog after normalization. An alias points to `food_id`, not directly
to a mutable display string. Alias resolution must return one Food or an explicit ambiguous/unknown
result.

### C. Lookup rules

For new identity-aware paths:

```text
exact canonical food_id
  -> exact canonical_name after Turkish normalization
  -> exact validated alias after Turkish normalization
  -> UNKNOWN / AMBIGUOUS
```

No fuzzy step belongs in this resolver. Existing fuzzy suggestions may offer a candidate, but a user
or an explicitly trusted source must choose/confirm before a Food ID is persisted.

### D. Nutrition relationship

Initially retain the existing nutrition columns and attach them to `food_id`. The API should return
`food_id`, canonical name, aliases, macros, and allergen data. A later composition model can split
nutrition versions/records from Food identity without changing downstream references.

### E. Combo relationship

Update the combo source contract to carry canonical `food_id` values for new data. During transition,
resolve old `food_id` name strings through the exact compatibility resolver and report unresolved
combos instead of silently dropping or fuzzy-mapping them. `combo_id` remains the identity of the
composite suggestion, not an ingredient identity.

### F. Shopping relationship

Add an optional canonical `food_id` to shopping items while retaining `name` as the visible text and
legacy/unresolved fallback. Exact Food-ID adds must compare existing Food IDs exactly; free-text adds
may continue to use fuzzy suggestions, but fuzzy matching must not merge a known Food-ID item into a
near-spelling row.

### G. Exclusion relationship

Change new food-level exclusions to store `food_id`. During migration, retain the old string value as
legacy metadata or a compatibility field. Safety evaluation must use the resolved Food ID; unresolved
or ambiguous legacy exclusions must remain visible and conservative rather than being discarded.

### H. Allergen relationship

Preserve the current Türkiye/EU 14 vocabulary, explicit mapping source, and tri-state semantics.
Attach mappings to `food_id`. Keep hard-tier UNKNOWN blocking and soft-tier PRESENT flagging unchanged.
Do not infer allergen status from a name, alias, nutrition equality, or fuzzy similarity.

### I. Legacy compatibility

Read old name-based rows through the exact canonical-name/alias resolver. Write only the new ID-aware
shape after the migration boundary, while retaining legacy fields long enough to verify backfill and
rollback. Unknown and ambiguous values require an explicit unresolved state.

### J. Migration

A future migration requires catalog ID assignment, alias collision audit, exact reference backfill
for combos/list items/meal entries/exclusions, API/client shape updates, compatibility reads, and
observability for unresolved records. It must be staged and reversible; this artifact does not run it.

## 13. Must Change for Canonical Food Identity

- Introduce and persist an opaque stable `food_id` for canonical Foods.
- Separate canonical display text from identity in types and API payloads.
- Add collision validation for canonical names and aliases.
- Add an explicit exact resolver result that distinguishes resolved, ambiguous, and unknown.
- Make new combo, meal, shopping, and exclusion references ID-aware.
- Make exact Food-ID shopping operations use ID equality, not fuzzy row matching.
- Preserve legacy names and provide a controlled compatibility resolver/migration path.
- Keep B3 evaluation attached to the resolved Food object and stable ID.

## 14. Already Works and Should Be Preserved

- Turkish-locale trim/lowercase normalization for exact lookup.
- Exact alias lookup to a Nutrition object where the relevant alias map is loaded.
- No fuzzy imports in food-exclusion or combo safety modules.
- B3 explicit mapping statuses and conservative hard-tier UNKNOWN behavior.
- Separate hard and soft exclusion semantics.
- Nutrition derived from meal entries rather than duplicated in persisted meal rows.
- Existing legacy food-exclusion migration to `unclassified` as a hard tier.
- Human-readable shopping text and free-text quantity behavior.
- Existing combo grouping via `combo_id`.

## 15. Can Be Extended Later

- Separate nutrition composition/version tables.
- Recipe ingredients and preparation-state identities.
- Brand, package, raw/cooked, and serving-form dimensions.
- Human-reviewed substitution relationships.
- Alias provenance, locale metadata, and deprecation history.
- Pantry identity and inventory state.
- Shopping optimization, pricing, and availability.
- Automated catalog curation and unresolved-identity review tooling.

## 16. Explicitly Out of Scope

- Recipe functionality.
- Pantry functionality.
- Portion or scaling functionality.
- Shopping optimization.
- Meal-planning redesign.
- Comprehensive food-database expansion.
- Automatic fuzzy-to-canonical identity conversion.
- Allergen inference from names or equal nutrition values.
- Changes to unresolved `DEC-067`, `DEC-069`, `DEC-099`, or `DEC-100`.
- Any implementation in this investigation task.

## 17. Approved Human Decisions

The following six decisions were approved before implementation. They define the implementation
boundary; they do not authorize source changes, migrations, API changes, UI changes, or data changes.

1. **Initial Food ID placement:** add an opaque stable `food_id` to the existing nutrition-backed
   model. Do not introduce a separate Food table/entity unless the existing architecture makes it
   technically unavoidable.
2. **Food versus nutrition composition:** keep Food identity and nutrition composition together in
   this phase. Raw/cooked, preparation state, brand, composition versions, and source/version history
   remain deferred dimensions.
3. **Ambiguous legacy references:** backfill only exact, unambiguous matches. Exact canonical-name
   matches and exact unique aliases are `RESOLVED`; multiple possible identities are `AMBIGUOUS`;
   no safe resolution is `UNKNOWN`. Fuzzy similarity and equal nutrition values are never sufficient.
   Preserve the original legacy string.
4. **Alias ownership and uniqueness:** aliases are exact identity-resolution inputs. A normalized
   alias may resolve to exactly one Food; collisions return `AMBIGUOUS` and never select an arbitrary
   winner. Fuzzy similarity is not an alias.
5. **Shopping-list migration:** new shopping references should be `food_id`-aware. Existing rows
   remain backward compatible; `Item.name` may be backfilled only through exact, unambiguous
   resolution, with the original display/name preserved. No fuzzy identity migration.
6. **Historical meals and combos:** preserve backward compatibility. New references should be
   `food_id`-aware where supported; existing references may be backfilled only when exact and
   unambiguous. Ambiguous and unknown references remain unresolved, with original strings preserved.

No DEC ID was created or amended. These are Phase 9 implementation/product architecture decisions,
recorded here without modifying closed Phase 1–8 decision records.

## 18. Validation and Evidence Limits

- Investigation was read-only against production code and schema documentation.
- No tests were added.
- No source behavior was changed.
- The current codebase's existing validation was not rerun because this task changed documentation only.
- The final required checks are recorded after artifact creation: `git status --short` and
  `git diff --name-only`.

## Conclusion

The approved identity A1 direction is technically viable as an extension path, but the existing alias
mechanism is not sufficient as the canonical identity itself. The approved safe foundation is a stable
opaque Food ID with exact canonical-name/alias resolution and explicit UNKNOWN/AMBIGUOUS outcomes.
Fuzzy matching remains in the suggestion/display layer only, current B3 semantics are preserved, and
old name-based references will be migrated conservatively. Implementation remains unauthorized until a
separate implementation task explicitly begins it.
