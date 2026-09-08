# DEC-067 — Preparation Detail Level: Human Decision Investigation

**Status:** Investigation artifact. Not a decision record. Nothing below ratifies, resolves, or narrows
`DEC-067`, `DEC-069`, `DEC-099`/`DEC-100`, or any Canonical Food Identity decision.
**Phase:** Phase 9 — Application/Product Architecture (`PROJECT_AI_PROTOCOL.md` §17). Gate 7 (end of
Phase 9) is not open.
**Trigger:** Continuation of the Phase 9 human-decision candidates first surfaced in
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §8 and analyzed further at §16.3/§20.8, now written up
as its own decision package per the user's request, following the precedent already set by
`CANONICAL_FOOD_IDENTITY_INVESTIGATION.md` for `DEC-053`/`061`'s identity question.
**Relationship to Canonical Food Identity:** that milestone is **CLOSED** (`d437f37` → `6555c7d` →
`8a5ac09`, merged to `master`) and is treated here strictly as a precondition to build on, per §10 below.
It is not reopened, re-litigated, or extended by this document.

---

## 1. Purpose

Produce a single, decision-ready package on `DEC-067` (preparation-detail level) for human/ChatGPT
review: what the decision currently says, what the repository can already represent, what the Phase 8
culinary-corpus extension actually supports, what the genuinely distinct architectural options are, and
which questions in this space can only be answered by a human. This document does not choose an option.

---

## 2. Current `DEC-067` Definition — Exact, With Provenance

**Original text** (`05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md` lines 1120–1132, unedited
since Phase 3):

> **Decision:** Determine what level of preparation detail (recipe-level, ingredient-list-level, or
> general guidance only) the application provides.
> **Domain:** L · **Decision Type:** SELECTION
> **Inputs:** DEC-066 constructed meal, disclosed cooking skill/time (DEC-068).
> **Output:** A chosen preparation-detail level.
> **Depends On:** DEC-066 · **Downstream Use:** DEC-068
> **Personalization:** LOW · **Longitudinal Data Required?:** NO · **Current Evidence Required?:** NO
> **App Priority:** IMPORTANT
> **Notes/Uncertainty:** *"Recipe/preparation-detail decisions have no direct counterpart in the
> 213-topic universe... flagged for Section 11."*

This wording has **not changed** across Phase 3, 7, 8, or 9. No document redefines the decision's text,
inputs, outputs, or the three named options. What has changed across phases is the decision's **status**
(below) — a status evolution, not a wording conflict. No discrepancy in DEC-067's own text was found.

**Dependency edges** (`APP_DECISION_DEPENDENCY_GRAPH.md` lines 439–440, 829, 1112, 1126, 1140):
`DEC-066 → DEC-067` (REQUIRED — a constructed meal must exist before a detail level can be chosen for
it) and `DEC-067 → DEC-068` (REQUIRED — constraint accounting in `DEC-068` operates at whatever detail
level `DEC-067` picked). `DEC-067` has exactly one upstream and one downstream dependency in the
112-decision model; it is not a hub.

**Status by phase, exact:**

| Phase | Status | Source |
|---|---|---|
| Phase 3 | `GAP-A` — "no knowledge representation at all" | `APP_DECISION_GAPS.md` line 219; `APP_DECISION_MODEL.md` line 824 |
| Phase 4 | `APPLICATION TRANSLATION GAP`, confirmed `GAP-A` | `DECISION_KNOWLEDGE_READINESS.md` line 77 |
| Phase 7 | `BLOCKED` (Domain L, `067–069` confirmed `GAP-A`) | `DECISION_LOGIC_SPECIFICATION.md` line 87 |
| Phase 8 (Gate 6, pre-inspection) | Reclassified "`GAP-A` → controlled corpus-extension work," **not yet specified** | `PRACTICAL_TRANSLATION_ANALYSIS.md` lines 105–108, 458 |
| Phase 8 (post-inspection) | **Knowledge-supported** — `STRONG` (standardized recipe structure, ingredients, method, yield, portions, variations, Ch.4) | `ON_COOKING_7E_EXECUTION_RECORD.md` §3–4; `CULINARY_SOURCE_EXTENSION.md` line 251 |
| Phase 9 | **`PRODUCT DECISION GAP`** — knowledge supports all three named levels; nothing in the corpus picks one | `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §3 line 136, §8, §16.3 |

**Decision type, confirmed:** `SELECTION` among three named options — not a threshold, not a formula, not
open-ended design. This constrains the candidate-option analysis in §8 to variations *of* those three (or
architecturally distinct alternatives explicitly flagged as such), not an unbounded design space.

---

## 3. Current Phase 9 Context

`DEC-067` is discussed at length in the existing Phase 9 architecture artifact
(`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`): §2.2 (capability map), §3 (gap classification), §4.5/§8
(human-decision flag), §12.2 items 3/4/13 (dependency inventory), §14.1 (concept classification), §16.3
(decision-package-style option comparison), §20.8 (what it blocks/does not block). This document does not
duplicate that analysis; §7–§9 below restate its conclusions only where needed for a self-contained
package, cite the source section, and add what that document did not yet do: a direct culinary-corpus
evidence pass scoped to `DEC-067` alone (§6), and an explicit minimum-viable-model recommendation (§12).

**One staleness flagged, per `PROJECT_AI_PROTOCOL.md` §31/§36 (report, do not silently fix):**
`PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §20.13 lists "canonical Food identity's anchor (§16.1
A1/A2/A3)" as still open. It is not — `CANONICAL_FOOD_IDENTITY_INVESTIGATION.md` §17 decision 1 resolved
it (opaque `food_id` added to the existing nutrition row) and it is now implemented, tested, and merged to
`master` (`docs/SESSION_CHECKPOINT.md`). This does not affect `DEC-067` directly (§16.3 already notes
identity is independent of `DEC-067`/`DEC-069`, §16.4), but a reader of §20.13 today would be misled about
what is still open. Flagged here rather than edited into the Phase 9 document, consistent with that
document's own precedent for stale cross-references (§0.1, §12.1).

---

## 4. Current Application Capability

Verified directly against the repository (not recalled from prior analysis):

- **`data/combos.json` / `src/lib/combos.ts`** — the only recipe-like structure that exists. A `Combo` is
  `{ id, nameTr, items: {foodId, grams}[], prepMinutes, tags }`. Sixteen hand-authored, build-time,
  non-user-editable entries. No method/steps field, no yield distinct from its ingredient list, no
  construction engine — these are authored, not generated (`PHASE_9...` §12.1, §14.2).
- **Canonical Food identity** — now real (as of the closed milestone): `nutrition.food_id uuid`, exact
  precedence chain `food_id → canonical name → unique alias → AMBIGUOUS/UNKNOWN`, no fuzzy step
  (`src/lib/foodIdentity.ts`, `supabase/16-nutrition-food-id.sql`). `combos.json`'s `items[].foodId` and
  `meal_entries.food_id` both resolve through this identity transitively.
- **Nutrient calculation** — `src/lib/mealNutrition.ts` (`scaleNutrition`, `sumMacros`) scales a per-100g
  row by grams and sums across items; deployed, used by `comboMatch.ts` and `localMealPlan.ts`. Macro-only
  (no micronutrient columns in `data/nutrition.json`'s 64-row seed or the live 89-row table).
  Yield/scaling, cooked-vs-raw state, and nutrient-retention adjustment are **not** modeled anywhere —
  every gram figure is treated as the as-eaten quantity.
- **Quantity representation** — grams only, everywhere nutrition-linked (`meal_entries.quantity_g`,
  `combos.json` grams). No human-scale "portion" concept exists distinct from a raw gram number
  (`PHASE_9...` §14.1).
- **Preparation representation** — exactly one field exists anywhere in the repository:
  `Combo.prepMinutes`, a single rough number. No method, no steps, no cooking-method taxonomy, no mise en
  place concept.
- **Exclusion/restriction filtering** — real and enforced at the food level (`foodExclusions.ts`,
  `comboMatch.ts`, `MealFoodPicker.tsx`) since the 2026-09-08 Milestone 1 work, with `DEC-053`'s
  allergy/intolerance/unclear taxonomy now wired for hard/soft filtering. This is `DEC-061`'s territory,
  not `DEC-067`'s, but any preparation-detail level `DEC-067` selects inherits this filter once it exposes
  anything beyond what `comboMatch.ts` already filters (`PHASE_9...` §16.3).
- **Shopping-list translation** — `lists`/`items` (`supabase/01-schema.sql`) is a real, fully wired
  shopping list, unrelated to any recipe representation. Confirmed it needs only an identity-resolved
  ingredient+quantity list, not a resolved `DEC-067` answer, to function (`PHASE_9...` §14.7, §16.4).

**Summary:** Grocery can represent a fixed, small, hand-authored ingredient-list-level "recipe" today. It
cannot construct one, cannot represent preparation method/steps, cannot represent yield or a human-scale
portion, and has no per-recipe modification path.

---

## 5. Current Gaps

Applying the same category system `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §3 uses:

| Gap | Classification | Note |
|---|---|---|
| Which preparation-detail level Grocery ships | **PRODUCT DECISION GAP** | The corpus supports all three named levels; nothing in it picks one (§2 above). |
| Recipe representation beyond `combos.json`'s v0 shape | **Requires new domain model**, gated on `DEC-067`'s answer | `PHASE_9...` §12.2 item 3 — "blocked *on* `DEC-067`, not deferrable independent of it." |
| Portion as distinct from raw grams | **PRODUCT CONCEPT**, gated on `DEC-067` | `PHASE_9...` §14.1 — whether a human-scale portion is needed is exactly what `DEC-067` would determine. |
| Preparation Method / Cooking Method taxonomy | **FUTURE/OPTIONAL**, gated on `DEC-067` | Knowledge exists (§6 below); representation does not; building one isn't justified before a level is chosen. |
| Yield | **FUTURE/OPTIONAL**, gated on `DEC-069`'s v1-necessity, not `DEC-067` | Load-bearing only if batch/scaling (`DEC-069`) is answered "yes." |
| Nutrient-retention/cooked-state adjustment | **KNOWLEDGE GAP** (quantitative) | See §9 — qualitative pattern exists, no coefficient exists anywhere, and none should be invented. |

---

## 6. Culinary Corpus Evidence — Scoped to `DEC-067`

Source: `11_PHASE_8_PRACTICAL_TRANSLATION/ON_COOKING_7E_EXECUTION_RECORD.md` §2–4 (direct text inspection
of *On Cooking: A Textbook of Culinary Fundamentals*, 7th ed., Labensky/Hause/Martel, Pearson, ISBN
9780138091170 — ~1,249 pages, `pypdf` full-text extraction, targeted chapters read in page context, not
TOC-only). Classified per the task's own four-way evidence scale:

| Capability | Evidence classification | Source detail |
|---|---|---|
| Standardized recipe structure (ingredients, quantities, method, yield, portion) | **Directly supported — STRONG** | Ch.4 "Menus and Recipes," pp. ~106–127; recipe examples include ingredients, mise en place, method, yield, variations. |
| Ingredient functions | **Directly supported — STRONG** | Sauce/bakeshop/egg/dairy/grain/vegetable/meat chapters explain binding, leavening, emulsifying, flavor roles. |
| Measurements / conversions | **Directly supported — STRONG** | Ch.4 covers measurement systems and conversion factors explicitly. |
| Yield / portion conversion / scaling | **Directly supported — STRONG** | Ch.4 covers yield tests, portion conversion, and "large recipe changes" (scaling) explicitly. |
| Purchasing | **Indirectly supported — ADEQUATE** | Receiving/purchasing content connects recipe ingredient quantities to procurement; not Grocery-specific. |
| Preparation methods / mise en place | **Directly supported — STRONG** | Ch.9 "Mise en Place," pp. ~208–238; prep lists, required tools, sequencing. |
| Cooking methods | **Directly supported — STRONG** | Ch.10, pp. ~239–262; dry-heat/moist-heat/combination taxonomy applied across food-class chapters. |
| Ingredient substitution | **Indirectly supported — ADEQUATE** | Substitution notes and food-class chapters; example-level, not a general solver (matches Phase 8's earlier, pre-extension finding that substitution knowledge in the *original* 7-book corpus was example-level only). |
| Recipe modification | **Directly supported — STRONG** | Recipe variations, low-calorie/low-fat/plant-based variants presented as controlled changes to an existing preparation. |
| Nutrition-oriented cooking / nutrient retention | **Indirectly supported — ADEQUATE, qualitative only** | Ch.3 "Nutrition and Healthy Cooking," pp. ~78–105, plus food-class chapters, connect preparation/cooking choices to nutrient and quality effects **qualitatively**. No coefficient, percentage, or formula is present or extracted. |
| Batch preparation | **Indirectly supported — PARTIAL** | Large-batch conversion examples and batch-size effects exist; **true quantity-food/restaurant-scale production is confirmed absent** — a named, bounded limitation (`ON_COOKING_7E_EXECUTION_RECORD.md` §6). This is `DEC-069`'s boundary, not `DEC-067`'s. |
| Storage | **Indirectly supported — ADEQUATE** | Food-safety/sanitation and preservation sections (Ch.2, Ch.28) cover refrigeration/freezing/reheating limits generally, not per-recipe. `DEC-069`'s territory (§11). |
| Food safety | **Directly supported — STRONG, but subordinate** | Ch.2 covers HACCP, cross-contamination, allergens, temperature control. Per the binding scientific-authority rule (`CULINARY_SOURCE_EXTENSION.md` §5 rule 1, restated `PHASE_9...` §6), **the seven-book nutrition corpus governs wherever the two overlap** — On Cooking supplements operational detail, never overrides. |
| Recipe nutrition analysis | **Indirectly supported — ADEQUATE** | The edition includes recipe-level nutritional analysis, explicitly framed as reference material with margin-of-error limitations — not authoritative for Grocery's own nutrient targets. |

**For `DEC-067` specifically:** the three capabilities that decide *whether the app can support each of
the three named preparation-detail levels* — standardized recipe structure, preparation methods/mise en
place, cooking methods — are all rated `STRONG`. The knowledge boundary is not what blocks `DEC-067`; it
was reclassified from `GAP-A` to knowledge-supported precisely because this inspection closed it
(§2 above). What blocks `DEC-067` is that the corpus, by design, cannot and does not choose among the
three levels for Grocery — that choice has no scientific or culinary-knowledge content at all.

---

## 7. Preparation-Detail Design Space

Derived from `PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §16.3's own option analysis (not
re-derived independently, since that analysis already checked itself against repository evidence) and
restated here as the design space for this package. Four genuinely distinct options were found — one more
than the task's illustrative three, because the repository evidence (`combos.json`'s existing shape) and
Gate 6's construction-vs-modification line together produce a fourth option that is not merely a smaller
version of the other three.

| Option | What it represents | What it deliberately does not represent |
|---|---|---|
| **Level 0 — General guidance only** | A named dish/combination and a rough time estimate; no ingredient breakdown exposed to the user beyond what's needed for nutrition (which stays internal). | Any per-ingredient breakdown, any method, any yield/portion concept. |
| **Level 1 — Ingredient-list-level** (today's de facto floor) | Name + {food, quantity} lines, exposed to the user; a rough prep-time figure. This is what `combos.json` already ships. | Method/steps, cooking-method taxonomy, yield distinct from the ingredient list, portion distinct from grams (unless human-scale units are separately added). |
| **Level 2 — Structured/standardized-recipe-level** (On Cooking Ch.4 shape) | Ingredients + method/steps + yield + portion size + variations — the full standardized-recipe schema the corpus documents. | Restaurant/quantity-food batch production (`DEC-069`'s boundary); a general substitution solver (`DEC-063`'s boundary, reused not rebuilt). |
| **Level 3 — Recipe modification only** (construction not attempted) | Grocery adapts a recipe the user already has (scaling, substitution, adjustment) rather than generating one from `DEC-060`–`066`'s candidate-food chain. | Any construction pipeline; does not build on `combos.json`'s existing shape at all — an architecturally different engine, not a smaller Level 2. |

Level 3 is listed for completeness because it is architecturally distinct, not because it is recommended.
Gate 6 (`00_PROJECT_CONTROL/DECISIONS/2026-09-07-gate-6-culinary-corpus-extension.md`) already rejected
"translation-layer only" (its Option C) **as the primary corpus-extension architecture** — but that
ruling was about *which knowledge source to admit*, not about foreclosing "modification only" as a
`DEC-067` product answer once the corpus was admitted. The two rulings are not in conflict, but they are
not the same question either; this is noted so Level 3 is not silently excluded by a citation that does
not actually cover it, nor silently treated as pre-approved by one that does not either.

---

## 8. Candidate Options — Full Comparison

| Dimension | Level 0 — General guidance | Level 1 — Ingredient-list | Level 2 — Structured recipe | Level 3 — Modification only |
|---|---|---|---|---|
| Required data concepts | None new | None new (already `combos.json`'s shape) | Preparation Method, Cooking Method, Yield, Portion — all currently `FUTURE/OPTIONAL` | A different engine input: an arbitrary user-supplied recipe, not `DEC-060`–`066`'s output |
| Required decision logic | None new | None new | `DEC-068`'s constraint-matching (still unspecified at any level — `SPECIFICATION GAP`, `PHASE_9...` §3) | `DEC-063`'s substitution/scaling applied to arbitrary input — reuses `DEC-063` knowledge, needs a new applicability path |
| Nutrition calculation implications | None — nutrition already computed internally regardless of what's shown | None — `mealNutrition.ts` unaffected | Yield/portion-scaling makes cooked-vs-raw nutrient state (§9) load-bearing for the first time | Same as Level 2, applied to a recipe the app did not construct — provenance of the original nutrient values becomes an open question |
| Portion/scaling implications | None | None (grams only) | Requires Portion and Yield as first-class concepts | Requires scaling logic (`DEC-069`-adjacent) applied to unknown-provenance recipes |
| Shopping implications | None — `DEC-071` only needs an identity-resolved ingredient+quantity list, satisfied even by Level 0/1 (`PHASE_9...` §14.7, §16.4) | Same — already satisfied | Same — no *additional* shopping requirement beyond Level 1 | Same, but the ingredient list itself may be less reliably identity-resolved if user-supplied |
| Substitution implications | None | None | Reuses `DEC-063` as specified | Substitution *is* the primary mechanism, not an add-on — the modification engine's core |
| Safety implications | None beyond existing `DEC-061` filtering | None beyond existing `DEC-061` filtering | Inherits `DEC-061` filtering the moment ingredients are shown structurally; no new safety surface | Same inheritance, plus user-supplied content is not pre-filtered by `DEC-060`–`065`'s candidate chain, so restriction filtering would need to run on arbitrary input |
| Personalization implications | LOW (matches `DEC-067`'s own stated `Personalization: LOW`) | LOW | LOW–MODERATE (portion/yield could personalize to household size) | MODERATE (adapting *someone's* recipe is inherently more personalized than picking one) |
| Implementation complexity | Minimal — a smaller version of what ships today | Minimal — already shipped, informally | Materially larger — new domain model, new UI surface, new construction logic | A different-shaped, comparably sized effort — not simply "more than Level 2" |
| Future extensibility | Low ceiling — hard to grow into Level 1+ without rework | Moderate — a natural stepping-stone to Level 2 | High ceiling — the corpus supports growing further (batch, more variations) once `DEC-069` is answered | Extensible in a different direction (more sophisticated modification), not toward construction |
| Risk of overbuilding | None | Low | **Real** — Yield/Portion/Method become permanent domain concepts the moment this ships, whether or not most users need them | Real, but for a narrower audience (users who already have a recipe) |
| Risk of underbuilding | **Real** — "IMPORTANT" `App Priority` (§2) suggests the product intends more than a label | Moderate — no method/steps may frustrate users attempting anything non-trivial | Low | Real for users who want Grocery to *generate* a meal, not just adjust one they supply |
| Dependency on `DEC-069` | None | None | Only for the *batch/scaling* sub-features, not the base structure (`PHASE_9...` §20.8 table: "Blocks" only for yield+scaling, not the base recipe representation) | Scaling sub-feature only, same as Level 2 |
| Dependency on the culinary-corpus extension | Minimal | Minimal | **Full** — this is the level the extension was evidenced for (§6) | Partial — reuses `DEC-063`'s substitution evidence, which predates the extension in part |
| Sufficient for the current product concept? | Arguably below `App Priority: IMPORTANT`'s apparent intent | Matches what has already shipped and been used in production (`combos.json`) | Matches the corpus's strongest evidence and the decision's `IMPORTANT` priority, at real build cost | A genuinely different product shape — sufficiency depends on whether Grocery's concept is "plan meals for me" (favors 0–2) or "help me cook what I already chose" (favors 3) |

No option above is chosen. The comparison exists to make the trade-offs explicit for §14/§15.

---

## 9. Nutrition Implications

Checked against the task's own list, distinguishing what `DEC-067` itself forces from what is `DEC-069`'s
or a pre-existing capability's territory:

| Item | Status | Note |
|---|---|---|
| Nutrient identity, nutrient quantity (recipe-level, serving-level calculation) | **Already supported, independent of `DEC-067`'s answer** | `mealNutrition.ts`'s scale-and-sum works today on any (Food, quantity) list, at any of Levels 0–3; canonical Food identity (§10) makes the identity side of this exact and safe. |
| Edible portion (waste/refuse factors) | **Evidence gap** | On Cooking discusses yield tests qualitatively; no Grocery-usable factor table exists in either corpus. Not required unless Level 2/3 is chosen and yield precision becomes a goal. |
| Cooked vs. raw state; water/fat gain or loss; nutrient-retention adjustment | **Evidence gap (quantitative); qualitative pattern only** | ON_COOKING_7E rates this `ADEQUATE` and explicitly qualitative — Ch.3 connects preparation choices to nutrient/quality effects in general terms, with **no coefficient, percentage, or formula extracted or available**. This is `PRACTICAL_TRANSLATION_ANALYSIS.md`'s own `U3` — "the assumption with correctness consequences" — and it is framed there as `DEC-069`'s territory, not `DEC-067`'s. |
| Yield | **Deferred, gated on `DEC-069`'s v1-necessity, not `DEC-067`** | Confirmed absent from the repository (§4); becomes load-bearing only if Level 2/3 is chosen *and* `DEC-069` answers "yes" to any scaling need. |
| Ingredient substitutions preserving nutrient contribution | **Already specified, independent of `DEC-067`** | `DEC-063`'s own definition, `ADEQUATE` per corpus evidence (§6); reused, not re-derived, by whichever `DEC-067` level exposes substitution. |
| Recipe-level vs. serving-level nutrient calculation | **No new gap** | Both already reduce to the same scale-and-sum function; the only new requirement any `DEC-067` level introduces is a *display* concept (portion), not a new *calculation*. |

**Conclusion for this section:** `DEC-067`'s own choice does not, by itself, require any new nutrition
formula, coefficient, or threshold — none is invented here, consistent with §7's evidence-gap finding. The
one place `DEC-067`'s answer changes the nutrition picture is indirect: choosing Level 2 or 3 raises the
practical stakes of `DEC-069`/`U3`'s already-open, already-flagged nutrient-retention question, because a
cooked-state recipe display makes the gap user-visible in a way an ingredient list does not. This is
recorded as an interaction, not resolved — `DEC-069` is not decided here (§11).

---

## 10. Food Identity Interaction

The Canonical Food Identity milestone is **CLOSED and not reopened here.** The chain the task asked to
check:

```
Food ID → Recipe Ingredient → preparation state → recipe → serving
```

| Link | Status |
|---|---|
| **Food ID** | **Already supported.** `nutrition.food_id uuid`, exact precedence chain (`food_id → canonical name → unique alias → AMBIGUOUS/UNKNOWN`), structurally no fuzzy step (`src/lib/foodIdentity.ts`, guarded by `foodIdentitySafety.test.ts`). |
| **Recipe Ingredient** | **Conceptually defined, not yet built as a first-class entity.** `PHASE_9...` §14.1 classifies it as a *derived concept* — the (Food × quantity) pairing inside a Recipe, already shaped this way in `Combo.items[]`. No decision is needed to preserve this; it requires no new architecture regardless of which `DEC-067` level is chosen (§8). |
| **Preparation state** | **Missing.** No representation exists anywhere in the repository (§4). Whether it needs to exist at all — and if so, whether as structured data (a cooking-method/method-step taxonomy) or free text — is exactly what `DEC-067`'s level choice (Level 1 vs. 2) determines. Not decided here. |
| **Recipe** | **Missing beyond `combos.json`'s v0 floor.** Exists informally at Level 1 today; anything past that is new and gated on `DEC-067`. |
| **Serving** | **Missing as a distinct concept from a raw gram quantity.** Portion (§7's design-space table) is the concept that would fill this; gated on `DEC-067`. |

**The governing invariant is preserved throughout this analysis and by every option in §8:** *fuzzy
matching must never establish Food identity, allergen identity, exclusion equivalence, substitution
equivalence, or safety identity.* None of the four candidate levels in §7/§8 requires or introduces a
fuzzy step anywhere in this chain — every option consumes the existing exact-match Food identity as an
upstream input, never re-derives or bypasses it. `PHASE_9...` §16.1/§16.4 already established that Food
identity is independent of, and does not need to wait for, `DEC-067`; this document confirms the reverse
is also true — none of `DEC-067`'s four options requires re-opening or weakening identity resolution.

---

## 11. `DEC-069` Boundary

**Current state, exact** (`APP_DECISION_INVENTORY.md` lines 1147–1158): *"Determine how batch cooking,
leftovers, and storage are incorporated into a meal plan when relevant."* Domain L, `TRANSLATION` type,
depends on `DEC-066`, feeds `DEC-071`. `App Priority: OPTIONAL` — one tier below `DEC-067`'s `IMPORTANT`
(`PHASE_9...` §20.8 notes this asymmetry explicitly).

**What `DEC-069` is actually asking:** how household batch cooking, leftovers, and storage fit into a
multi-day plan — not, by itself, whether restaurant-scale production is supported. That narrower question
is a *sub-question* Phase 8/9 surfaced (`PRACTICAL_TRANSLATION_ANALYSIS.md` §11.2; `PHASE_9...` §3/§4.5),
not the whole of `DEC-069`.

**Which `DEC-067` choices constrain `DEC-069`, and vice versa:** per `PHASE_9_APPLICATION_CAPABILITY_
ARCHITECTURE.md` §20.8's table, the two decisions gate almost entirely disjoint capabilities. `DEC-067`
blocks recipe representation/construction/modification, Portion, and Preparation/storage-*metadata*
representation. `DEC-069` blocks only Yield+scaling and, separately, restaurant/quantity-food batch
production. Household-scale batch cooking and storage are explicitly **not** blocked by `DEC-069` being
unresolved — Phase 8 rates household scaling and storage `ADEQUATE`/`STRONG` on their own (§6 above).

**What must NOT be decided during `DEC-067`:** whether restaurant-scale batch production is a v1
requirement (`DEC-069`'s own sub-question) and any numeric batch/yield parameter. Neither is touched here.

**Household batch cooking without committing to restaurant-scale production:** yes — per §6/§8 above, a
Level 2 recipe (structured, with a stated yield) can be scaled by a simple factor for household-size
batching using only the `ADEQUATE`/`STRONG`-rated scaling and storage knowledge already in the corpus,
without ever invoking the confirmed-absent quantity-food/professional-scale capability. This is stated as
an architectural finding, not a recommendation to build it now.

`DEC-069` is **not resolved, narrowed, or reopened by this document.**

---

## 12. Minimum Viable Grocery Preparation Model

**Question:** the smallest preparation-detail model that lets Grocery produce scientifically defensible,
practical, personalized meals/recipes without prematurely becoming a full culinary-management system.

Working from §8's comparison: Level 0 risks under-delivering against `DEC-067`'s own `IMPORTANT` priority
and against what has already shipped (`combos.json` is already past Level 0). Level 2 is fully
knowledge-supported (§6) but commits the architecture to four new domain concepts (Preparation Method,
Cooking Method, Yield, Portion) that are all currently `FUTURE/OPTIONAL`, and raises `DEC-069`/`U3`'s open
nutrient-retention question in practice (§9) before it has been separately resolved. Level 3 is a
different product (recipe-adaptation, not meal-planning) and does not extend `combos.json`'s existing,
already-used shape.

**Recommended candidate — for human review: Level 1 (ingredient-list-level), with Preparation Method as an
optional free-text field, held as an explicit stepping stone toward Level 2.**

Reasoning:
- It requires zero new domain concepts (§8) — it is what `combos.json` already ships and what
  `mealNutrition.ts`, `comboMatch.ts`, and the now-closed canonical-identity work already operate on
  correctly.
- It does not force `DEC-069`/`U3`'s nutrient-retention question into the open before that decision is
  separately made (§9) — an ingredient list's nutrient total does not depend on a cooked-yield adjustment
  the way a portioned, scaled recipe's does.
- It satisfies `DEC-071`'s shopping-translation requirement completely (§10, §14.7 of the Phase 9
  document) — nothing about shopping is blocked by staying at this level.
- It does not foreclose Level 2 — every Level-1 data point (identity-resolved ingredients + quantities)
  is a strict subset of what Level 2 needs, so growing later does not require discarding anything built
  now (unlike Level 3, which is a different engine entirely).
- Adding preparation method as *optional free text* (not a structured taxonomy) captures some of Level 2's
  user value at effectively no new architecture cost, since it introduces no new required domain concept —
  it is a nullable string on the existing recipe-like shape, not a new entity.

This is offered as input to the human/ChatGPT decision, **not ratified.** The comparison in §8 is
symmetric; a reviewer could reasonably weigh `App Priority: IMPORTANT` more heavily and pick Level 2
instead, accepting the four new domain concepts as a deliberate investment. That trade-off is exactly
what §14 asks the human to resolve.

---

## 13. Risks and Trade-offs

- **Risk of picking Level 0/1 and staying there:** if the product intent behind `App Priority: IMPORTANT`
  is closer to "Grocery gives real cooking instructions," under-delivering here may be a bigger product
  risk than the architecture risk of over-building Level 2.
- **Risk of picking Level 2 now:** commits four new domain concepts before any of them has been validated
  against a real user need beyond the corpus saying they're representable; raises `DEC-069`/`U3`'s
  nutrient-retention question in practice before it is separately resolved (§9); the largest jump in
  implementation complexity of the four options (§8).
- **Risk of picking Level 3:** a different product than "plan meals for me," which is what `DEC-060`–`066`
  already assume the app does; choosing it changes the shape of `DEC-068` (constraint matching) and
  `DEC-063` (substitution) usage patterns in ways not analyzed elsewhere in Phase 9.
- **Risk shared by all four options:** none removes the standing `DEC-061` safety requirement — whichever
  level is chosen inherits food-restriction filtering the moment it exposes ingredients beyond what
  `comboMatch.ts` already filters (§8's safety-implications row). This is not a reason to prefer one level
  over another; it is a cost every level after Level 0 pays identically.
- **Risk of delay:** `DEC-067` has been an open human-decision candidate since Phase 9's first milestone
  (`PHASE_9...` §8, 2026-09-07) and remains open through six subsequent Phase 9 passes (§12, §13, §14,
  §16, §20). It gates recipe representation, portioning, and preparation/storage metadata (§11's table) —
  continued deferral keeps those capabilities from being scoped at all.

---

## 14. Human Decisions Required

1. **Which of the four levels in §7/§8 does Grocery ship for v1** — general guidance, ingredient-list,
   structured recipe, or modification-only. This is `DEC-067` itself.
2. **Whether ordered preparation steps are required**, or whether an unordered/free-text preparation note
   is sufficient for whichever level is chosen (this determines part of Level 1 vs. Level 2's actual
   build cost, and is not resolved by picking a level name alone).
3. **Whether preparation state/method should be structured (a taxonomy) or textual**, if any preparation
   content is exposed at all — the corpus supports a structured taxonomy (Ch.10's dry-heat/moist-heat/
   combination classes, §6) but nothing requires Grocery to adopt it verbatim.
4. **Whether a human-scale Portion concept (distinct from raw grams) belongs in the first implementation**,
   independent of whether Yield/scaling (`DEC-069`'s territory) is included.
5. **Whether the "recipe modification only" architecture (Level 3) should be considered a live
   alternative to construction (Levels 1–2), or is out of scope for this decision** — `PHASE_9...`'s
   existing analysis leaves this genuinely open (§7 above); it is not foreclosed by Gate 6's separate
   ruling about *source admission*.

Not created as decisions here, because they do not require human judgment at this stage: whether recipe
construction reuses the existing canonical Food identity (no — it must, per §10, and no option in §8
proposes otherwise); whether `DEC-069` must be resolved first (no — §11 shows the two decisions are
largely disjoint); whether any nutrient-retention coefficient should be adopted (no — §9 shows none exists
to adopt, and inventing one is explicitly out of scope for this document).

---

## 15. Recommendation for Human Review

**Recommended candidate — for human review: Level 1 (ingredient-list-level) with optional free-text
preparation notes, as stated in §12.** Not ratified. The human/ChatGPT reviewer may instead select Level 0,
Level 2, Level 3, or a hybrid not enumerated above; §8's comparison table is built to support any of those
choices, not just the recommended one.

---

## 16. Explicit Non-Decisions / Deferred Items

- **`DEC-069`'s v1-necessity** (restaurant-scale batch production) — not decided here (§11).
- **`DEC-099`/`DEC-100`** (clinical scope) — not touched; `DEC-061`'s restriction filtering, which every
  `DEC-067` level inherits, remains bounded by the same conservative posture already in place.
- **Allergen-class vocabulary, unmapped-food default, precedence mechanics** — pre-existing open items
  from `PHASE_9...` §16.2/§20.10, orthogonal to `DEC-067`, not addressed here.
- **Any nutrient-retention coefficient, cooking-loss percentage, or conversion factor** — explicitly not
  invented; §9 records this as an evidence gap rather than filling it.
- **Any database schema, API contract, or UI design for whichever level is chosen** — out of scope per
  the task's own instructions and `PROJECT_AI_PROTOCOL.md` §28; §8's "required data concepts" column is
  deliberately stated at the concept level, not the schema level.
- **`DEC-068`'s constraint-matching policy** — remains a separate, still-open `SPECIFICATION GAP`
  (`PHASE_9...` §3) regardless of which `DEC-067` level is chosen.

---

## 17. Evidence and Provenance

| Claim | Source |
|---|---|
| DEC-067 original text, dependencies, status | `05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md` lines 1120–1132; `APP_DECISION_DEPENDENCY_GRAPH.md` lines 439–440, 829 |
| DEC-067 Phase 3/4 gap classification | `APP_DECISION_GAPS.md` line 219; `APP_DECISION_MODEL.md` line 824; `09_PHASE_4.../DECISION_KNOWLEDGE_READINESS.md` line 77 |
| DEC-067 Phase 7 BLOCKED status | `10_PHASE_7.../DECISION_LOGIC_SPECIFICATION.md` line 87 |
| Gate 6 decision, source selection, construction-vs-modification ruling | `00_PROJECT_CONTROL/DECISIONS/2026-09-07-gate-6-culinary-corpus-extension.md`; `11_PHASE_8.../CULINARY_SOURCE_EXTENSION.md` |
| On Cooking 7e inspection, coverage ratings, decision mapping | `11_PHASE_8.../ON_COOKING_7E_EXECUTION_RECORD.md` §2–6 |
| U3 nutrient-retention usability assumption | `11_PHASE_8.../PRACTICAL_TRANSLATION_ANALYSIS.md` §7.2, lines 499–514 |
| Phase 9 DEC-067 capability map, gap, human-decision flags, dependency inventory, option comparison | `08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md` §2.2, §3, §4.5, §8, §12.2, §14.1, §16.3, §20.8 |
| Canonical Food Identity closure and current implementation | `08_APP_TRANSLATION/CANONICAL_FOOD_IDENTITY_INVESTIGATION.md` §17; `docs/SESSION_CHECKPOINT.md`; `supabase/16-nutrition-food-id.sql`; `src/lib/foodIdentity.ts` |
| Current repository capability (`combos.json`, `mealNutrition.ts`, `lists`/`items`) | Direct file reads: `src/lib/combos.ts`, `src/lib/mealNutrition.ts`, `supabase/01-schema.sql`, `supabase/16-nutrition-food-id.sql`, cross-checked against `PHASE_9...` §12.1 |
| Latest session state | `~/vault/grocery/logs/2026-09-08.md` |

No claim above is asserted without a source. No numeric threshold, formula, or coefficient appears
anywhere in this document.

---

## 18. Conclusion

`DEC-067` is fully knowledge-supported (§6) and has been a flagged, unresolved human/product decision
since Phase 9's first milestone. It is a bounded `SELECTION` among (at minimum) four genuinely distinct
architectural options (§7–§8), none of which requires inventing nutrition science, reopening Canonical
Food Identity (§10), or resolving `DEC-069` (§11). The corpus evidence closes the *knowledge* question;
it does not and cannot close the *product* question, because none of the three originally-named levels
(or the fourth, modification-only alternative) has any basis in nutrition or culinary science over the
others — the choice is Grocery's own. A minimum-viable candidate is offered in §12 for review, and five
concrete questions are named in §14 for human/ChatGPT resolution. Nothing in this document commits the
project to any of them.
