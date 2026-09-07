# Phase 9 — Application Capability Architecture

**Phase:** Phase 9 — Application / Product Architecture (`PROJECT_AI_PROTOCOL.md` §17)
**Question:** *How does the scientific decision system become software?*
**Authorized by:** Gate 6 GO (2026-09-07) plus Phase 8 closure (`PRACTICAL_TRANSLATION_ANALYSIS.md` §10–11.2,
`CULINARY_SOURCE_EXTENSION.md`, `ON_COOKING_7E_EXECUTION_RECORD.md`). Phase 8 is CLOSED; no new gate was
required to open Phase 9 — Gate 6 already covers this transition once Phase 8's own required steps
complete, per `PROJECT_AI_PROTOCOL.md`'s Gate 6/7 definitions (§21: Gate 6 = end of Phase 8, Gate 7 = end
of Phase 9 — there is no intermediate gate between them).
**Folder note:** this lives in `08_APP_TRANSLATION/`, a folder scaffolded (empty, `.gitkeep` only) during
the original repo reorganization, evidently reserved in advance for exactly this work. Its number (08)
predates folders 09–11 in the directory listing because those were numbered by when each phase's artifact
was actually produced, not by phase number. Noted here so the ordering isn't mistaken for an error.
**Built on (read-only):** `APP_DECISION_INVENTORY.md` / `APP_DECISION_GAPS.md` (Phase 3),
`DECISION_LOGIC_SPECIFICATION.md` (Phase 7), `PRACTICAL_TRANSLATION_ANALYSIS.md` /
`CULINARY_SOURCE_EXTENSION.md` / `ON_COOKING_7E_EXECUTION_RECORD.md` (Phase 8).
**What this document is not:** production code, a data schema, an API contract, a UI design, or a recipe
database. Per §28, none of that is authorized before this architecture stabilizes.

---

## 0. Baseline Recovered

Read and reconciled before any Phase 9 content was written:

- `PROJECT_STATUS.md` — confirms Phase 8 CLOSED, Gates 1–6 all GO, no gate currently open.
- `PROJECT_AI_PROTOCOL.md` §17 (Phase 9 scope), §21 (Gate 6/7 boundaries), §22/§23 (autonomy limits), §28
  (no premature implementation), §29 (traceability).
- `AI_SESSION_STATE.md` — STATUS `READY`, Phase 8 closure and Phase 9 authorization both recorded.
- Phase 3's `APP_DECISION_INVENTORY.md` — full text of `DEC-060`–`075` re-read directly from source for
  this document (not recalled from memory); domain boundaries confirmed: K = Food Selection (060–065),
  L = Meal Planning/Preparation (066–070), M = Shopping (071–075).
- Phase 7's `DECISION_LOGIC_SPECIFICATION.md` §2 status table — confirms which decisions are `SPECIFIED`
  vs. `BLOCKED` as of Phase 7's own accounting, and where that accounting is now stale (§1.1 below).
- Phase 8's three artifacts — the actual knowledge boundary this architecture must respect.

**Immutable baseline, treated as fixed unless a human decision says otherwise:** 7-book scientific corpus;
213 stable topics; 112 stable decisions (`DEC-001`–`112`); Gate 1–6 decisions; Phase 8 closure; the
historical Brown candidate record; the actual On Cooking 7e execution record. **No ID is renumbered or
redefined below.** Every capability in §3 cites an existing `DEC-###`; none is invented.

### 0.1 One stale cross-reference, flagged rather than fixed

Phase 7's own §2 status table still reads `L — Meal Planning/Preparation: BLOCKED` and
`M — Shopping: BLOCKED`, written before Phase 8 closed. This is the same aggregate-label issue
`PRACTICAL_TRANSLATION_ANALYSIS.md` §7.3 already identified and *deliberately did not fix*, because
re-labelling Phase 7's status taxonomy was outside Gate 6's narrow edit authorization. It is still true
here, for the same reason: this document does not edit `DECISION_LOGIC_SPECIFICATION.md`. Where this
document's own tables below differ from that stale label, the difference is intentional and cited to the
Phase 8 finding that supersedes it, not a silent correction of Phase 7.

---

## 1. The Five-Layer Boundary Model

Every capability below is assigned to exactly one of these layers. The model exists because this
project's whole discipline depends on these five things never being silently merged:

| Layer | What it is | Who owns it |
|---|---|---|
| **1. Scientific knowledge** | What a source book (or On Cooking 7e) actually teaches. | The corpus. Never invented. |
| **2. Decision logic** | What Grocery decides given that knowledge — a Phase 7 specification, a formula, a threshold, a branching rule. | Phase 7 (extended narrowly at Gate 6 for `DEC-031`/`034`/`048`; not extended here). |
| **3. Translation logic** | How a decision's output becomes the input to the *next* decision in the chain (target → candidate foods → meal → recipe → shopping list). | Phase 3's decision model (`DEC-060`–`075` are almost entirely this layer) plus this Phase 9 architecture. |
| **4. Product behavior** | What Grocery's application actually does with a translated output — what gets stored, what triggers a prompt, what a user can override. | Phase 9 (this phase), decided as product requirements, not science. |
| **5. UI/UX implementation** | Screens, components, copy, interaction design. | Not this phase. Not authorized until architecture stabilizes (§28). |

**The recurring failure mode this model exists to prevent:** treating layer-1 evidence ("On Cooking 7e
covers standardized recipes") as though it settles a layer-4 question ("therefore Grocery generates
recipes this way"). Every capability entry in §3 keeps these separate explicitly.

---

## 2. Capability Architecture Map — `DEC-060`–`075`

Columns: **Decision → Required Knowledge → Application Capability → Inputs → Outputs → Constraints →
Safety Boundary → Personalization → Longitudinal Feedback → Future Implementation Layer.**

### 2.1 Domain K — Food Selection (`DEC-060`–`065`)

| Decision | Required knowledge (Layer 1) | Application capability (Layer 3/4) | Inputs | Outputs | Constraints | Safety boundary | Personalization | Longitudinal feedback | Future impl. layer |
|---|---|---|---|---|---|---|---|---|---|
| `DEC-060` target→candidate foods | Nutrient targets already `SPECIFIED` (Domains D–H) | Translate a per-occasion macro/nutrient target into a candidate food set | `DEC-056` occasion targets, `DEC-038`/`040` reconciliation | Candidate food set | Must stay a NUT-domain operation, never silently redefine the target (Phase 3 Principle #6) | None beyond upstream Domain C posture | HIGH | No | Food-selection engine + food-composition data |
| `DEC-061` restriction filtering | Allergy/intolerance classification (`CLIN-03`), plant-based/allergen content **now evidenced by On Cooking 7e** (§4.1) | Hard-exclude or filter candidates | `DEC-060` set, `DEC-053` classification, disclosed preferences | Filtered candidate set | Exclusion must be conservative where clinical (Domain C posture, `DEC-099`/`100` deferral) | **Allergy/intolerance exclusion is safety-relevant** — a false negative here is a real-harm failure mode, not a UX defect | VERY HIGH | No | Restriction/allergen data model |
| `DEC-062` nutrient-density ranking | Micronutrient food-source guidance (`DEC-043`) | Prioritize filtered candidates under a fixed budget | `DEC-061` set, `DEC-043` guidance | Ranked list | None new | None | MODERATE | No | Ranking logic |
| `DEC-063` substitution | On Cooking 7e: functional substitution + diet-driven variation examples (**ADEQUATE**, `ON_COOKING_7E_EXECUTION_RECORD.md` §3) | Generate a substitute preserving nutrient contribution | `DEC-062` candidates, unavailable/restricted food | Substitute recommendation | **Must preserve the original nutrient contribution — this is the decision's own definition**, not a Phase 9 addition | Substitution must not silently cross an allergen/restriction boundary (`DEC-061`) | MODERATE | No | Substitution rule engine |
| `DEC-064` cost/convenience/culture weighting | None from the science corpus — `SPECIAL-04`/`PUBHEALTH-04` | Re-weight ranked candidates by disclosed preference | `DEC-062` list, disclosed preferences | Re-weighted list | None new | None | MODERATE | No | Preference model |
| `DEC-065` pantry-aware selection | **No curriculum counterpart — confirmed pure product-integration decision**, `GAP-D`, Phase 3's own finding | Incorporate this app's existing grocery/pantry data into candidate selection | `DEC-064` output, pantry data | Pantry-aware candidate list | This app already owns the pantry surface (`PRACTICAL_TRANSLATION_ANALYSIS.md` §3.3) | None beyond the food-safety data the pantry model itself carries | HIGH | No | **Direct integration point with this repo's existing pantry/list feature — see §5** |

### 2.2 Domain L — Meal Planning and Preparation (`DEC-066`–`070`)

| Decision | Required knowledge (Layer 1) | Application capability (Layer 3/4) | Inputs | Outputs | Constraints | Safety boundary | Personalization | Longitudinal feedback | Future impl. layer |
|---|---|---|---|---|---|---|---|---|---|
| `DEC-066` meal construction | `NUT-03`; **On Cooking 7e Ch.4 "Menus and Recipes"** now provides standardized-recipe methodology (**STRONG**) | Translate selected foods+portions into a constructed meal | `DEC-060`–`065` outputs | Constructed meal | Kept distinct from `DEC-060` (Phase 3 Principle #7) — a meal is not just a re-listing of a target | None new | MODERATE | No | Meal-construction engine |
| `DEC-067` preparation-detail level | **Was `GAP-A`, now knowledge-supported** — On Cooking 7e Ch.4: standardized recipe structure, ingredient list, method, yield, portions, variations (**STRONG**) | Choose how much preparation detail Grocery exposes (recipe-level / ingredient-list-level / general guidance) | `DEC-066` meal, disclosed skill/time (`DEC-068`) | Chosen detail level | **This is a product decision, not a science one** — the corpus can support any of the three levels; which one Grocery ships is layer 4, unresolved here (§6) | None | LOW | No | Recipe-detail selector; a **product decision**, flagged §6 |
| `DEC-068` skill/time/equipment adjustment | On Cooking 7e Ch.9 Mise en Place, Ch.6 Knife Skills (**STRONG** for workflow; equipment-constraint *matching logic* is not itself in the source — that's translation, not knowledge) | Adjust meal construction for disclosed practical constraints | `DEC-067` output, disclosed constraints | Constraint-adjusted construction | None new | None | MODERATE | No | Constraint-matching logic |
| `DEC-069` batch/leftovers/storage | **Partially knowledge-supported.** Scaling, yield/portion conversion, storage/preservation: **STRONG/ADEQUATE**. True quantity-food batch production: **PARTIAL**, a named bounded limitation (`CULINARY_SOURCE_EXTENSION.md` §6.1, `PRACTICAL_TRANSLATION_ANALYSIS.md` §11.2) | Incorporate batching/leftovers/storage into a multi-day plan | `DEC-066` meals across days | Batching/storage-aware structure | **Storage/food-safety content defers to the core nutrition corpus where the two overlap** (`CULINARY_SOURCE_EXTENSION.md` §5 rule 1) — On Cooking supplements, does not supersede | Storage-safety guidance (temperature, time limits) is safety-relevant, not just convenience | LOW | No | Storage/batching data model; **restaurant-scale batch production explicitly out of scope** (§4) |
| `DEC-070` deviation handling | None from science corpus — tactical, same-day logic (Domain N adjacent) | Adjust the remaining day's plan around a logged deviation | Logged actual intake vs. plan | Updated remaining-day plan | Kept separate from Domain O's *prescription* adjustment (Phase 3's own distinction) | None new | HIGH | OPTIONAL | Deviation-handling logic |

### 2.3 Domain M — Shopping (`DEC-071`–`075`)

| Decision | Required knowledge (Layer 1) | Application capability (Layer 3/4) | Inputs | Outputs | Constraints | Safety boundary | Personalization | Longitudinal feedback | Future impl. layer |
|---|---|---|---|---|---|---|---|---|---|
| `DEC-071` shopping-list consolidation | **No curriculum counterpart — confirmed pure product/logistics decision** (Phase 3's own note: *"exactly the kind of decision this grocery app is positioned to own"*) | Translate a meal plan into a consolidated shopping list | `DEC-066`/`069` plan | Consolidated list | Boundary decision for Phase 3 Principle #8 (meal plan vs. shopping plan) | None | LOW | No | **This repo's existing list/items feature is the direct implementation target — see §5** |
| `DEC-072` pantry reconciliation | Same as `DEC-065` | Reconcile the shopping list against pantry data | `DEC-071` list, `DEC-065` pantry data | Pantry-reconciled list | None new | None | HIGH | No | Same pantry integration as `DEC-065` |
| `DEC-073` budget adaptation | `PUBHEALTH-04` | Adjust shopping guidance to a disclosed budget | `DEC-072` list, disclosed budget | Budget-adjusted list | None new | None | MODERATE | No | Cost data — **requires external data**, §5 |
| `DEC-074` store-availability adaptation | `PUBHEALTH-05` | Adjust for disclosed store availability | `DEC-072` list, availability info | Availability-adjusted list (substitutions via `DEC-063`) | Must route through `DEC-063`'s nutrient-preservation constraint, not invent a separate substitution path | Same as `DEC-063` | MODERATE | No | Store/availability data — **requires external data**, §5 |
| `DEC-075` shopping-trip minimization | None — pure optimization | Minimize trip/list complexity while meeting the plan | `DEC-072`–`074` outputs | Trip/frequency recommendation | `App Priority: FUTURE FEATURE` per Phase 3 — not required for core function | None | LOW | No | Deferred; not core |

### 2.4 Upstream Nutrition Decision Layer (context, not re-specified here)

These are cited, not re-derived — every one is already `SPECIFIED` in Phase 7 and this document does not
reopen any of them. Listed because `DEC-060`–`075` depend on them and the user asked this layer be named
explicitly.

| Domain | Range | Capability area | Phase 7 status | What Phase 9 does with it |
|---|---|---|---|---|
| D — Energy | `017`–`024` | Energy estimation | `SPECIFIED` §3.1 (Mifflin-St Jeor baseline + adjustment) | Consumed as-is by `DEC-060`'s upstream chain |
| E — Weight/Body Composition | `025`–`030` | Personalization input | `SPECIFIED` §3.2 (one item still `NEEDS JUDGMENT`, unresolved by Phase 9) | Consumed as-is |
| F — Macronutrients | `031`–`040` | Macro allocation | `SPECIFIED` §3.3, corrected at Gate 6 (`DEC-031`/`034` provenance) | Consumed as-is; **no re-opening** |
| G — Micronutrients | `041`–`045` | Micronutrient handling | `SPECIFIED` §3.4, dosing specifics `NEEDS JUDGMENT` (no autonomous dosing — Gate 5 `DEC-044` Option A) | Consumed as-is |
| H — Fluid/Hydration | `046`–`050` | Hydration | `SPECIFIED` §3.5, corrected at Gate 6 (`DEC-048`) | Consumed as-is |
| C — Safety/Scope/Escalation | `012`–`016` | Safety/escalation | `SPECIFIED` §3.18.4, conservative posture; detailed criteria **genuinely blocked** behind `DEC-099`/`100` | Governs `DEC-061`'s exclusion boundary; **not resolved here** |
| N — Monitoring | `076`–`080` | Monitoring/logging | `SPECIFIED` §3.12 | Feeds `DEC-070` and Domain O |
| O — Feedback/Adaptation | `081`–`091` | Adjustment loop | `SPECIFIED` §3.17/§3.18.2/§3.18.5; circuit-breaker **values** deferred to Phase 8 evidence work (still open — not a Phase 9 task, see §7.2) | Governs when `DEC-084`/`085` re-trigger the whole chain above |

---

## 3. Gap Classification

Applied to every decision in §2 that is not a clean `SPECIFIED → translate` case. Categories per the
user's taxonomy: **SPECIFICATION GAP · KNOWLEDGE GAP · PRODUCT DECISION GAP · DATA GAP · SAFETY/SCOPE GAP.**
No gap below is closed by this document — each is classified, not solved.

| Decision | Gap | Classification | Why |
|---|---|---|---|
| `DEC-067` | Which preparation-detail level Grocery ships | **PRODUCT DECISION GAP** | The knowledge supports all three levels (recipe/ingredient-list/general); nothing in the corpus picks one. This is Grocery's call, not a Phase 7/8 question. |
| `DEC-068` | Equipment/time constraint *matching* logic | **SPECIFICATION GAP** | On Cooking establishes *what* preparation requires (equipment, time); it does not specify *how* Grocery should match a user's disclosed constraints against a recipe's requirements — that matching rule doesn't exist yet at any layer. |
| `DEC-069` | True quantity-food batch production | **KNOWLEDGE GAP, explicitly bounded** | Confirmed absent in On Cooking 7e (`ON_COOKING_7E_EXECUTION_RECORD.md` §6). Per `PRACTICAL_TRANSLATION_ANALYSIS.md` §11.2, this does *not* trigger a new gate on its own — it becomes consequential only if Phase 9 determines batch production is load-bearing for v1, which is the next classification below. |
| `DEC-069` (v1 necessity) | Whether restaurant-scale batching is even a v1 requirement | **PRODUCT DECISION GAP** | Unasked and unanswered. If the answer is "yes, load-bearing," the knowledge gap above becomes consequential and *would* warrant a gate (§11.2's own conditional). If "no," the gap is moot. **Recorded as a human decision candidate in §8.** |
| `DEC-070` | Deviation-handling *policy* (how aggressive, what triggers a re-plan vs. a silent absorb) | **PRODUCT DECISION GAP** | Phase 3 defines the decision's existence and inputs/outputs; the actual policy threshold is not specified anywhere. |
| `DEC-071`–`075` | Shopping-list consolidation, pantry reconciliation, budget/availability adaptation | **PRODUCT DECISION GAP**, not knowledge gaps | Phase 3's own finding, reconfirmed at Phase 8 §3.3/§7.3: these have no curriculum counterpart *because they were never meant to* — they are this application's logistics layer to own. |
| `DEC-073` cost weighting | Real ingredient cost data | **DATA GAP** | No source (nutrition corpus or On Cooking) provides pricing. External data required — see §5. |
| `DEC-074` store availability | Real store-inventory/availability data | **DATA GAP** | Same reasoning; external and highly implementation-specific (which retailers, which region). |
| `DEC-061` allergen exclusion detail | Whether Grocery's allergen taxonomy needs finer granularity than `CLIN-03` provides | **SAFETY/SCOPE GAP** | Not resolved here because it intersects Domain C, which is itself blocked behind `DEC-099`/`100`. Flagged, not decided. |
| `DEC-090` circuit-breaker values | Numeric cycle-count / cumulative-deviation thresholds | **SPECIFICATION GAP**, carried from Phase 8 | Explicitly not a Phase 9 task — this is Phase 7/8 evidence work still open (§7.2). Listed here only because Domain O feeds `DEC-060`'s upstream chain and a reader needs to know it's still open. |
| Domain N/O quantitative logging thresholds (`DEC-077`, `080`) | What counts as "sufficient duration," what triggers an escalation prompt | **SPECIFICATION GAP** | `SPECIFIED` at the architectural level (a rule exists) but several thresholds are conventions, not derived values — already flagged in Phase 7's own self-audit, not reopened here. |

---

## 4. Implementation Dependencies

Every application capability in §2 needs some combination of these. Categorized as the user requested.

### 4.1 Already supported by the current knowledge architecture

- Nutrient targets and macro allocation (Domains D–H) — fully `SPECIFIED`, no new evidence needed.
- Food-selection translation logic (`DEC-060`–`064`) — architecture is complete; needs food-composition
  data (below), not more knowledge work.
- Recipe construction, ingredient function, cooking-method selection, mise en place, standardized-recipe
  yield/scaling (`DEC-066`–`068`) — knowledge-supported by On Cooking 7e, `STRONG`/`ADEQUATE`.
- Substitution preserving nutrient contribution (`DEC-063`) — `ADEQUATE`, corroborated by both the core
  corpus (`DEC-061` restriction data) and On Cooking's functional-substitution examples.
- Storage/preservation concepts for non-batch use (`DEC-069`, partial) — `ADEQUATE`.
- Safety posture governing all of the above (Domain C's conservative default) — `SPECIFIED`.

### 4.2 Requires external data

- **Food-composition database** — every decision in Domain K assumes one exists; the nutrition corpus
  provides *targets*, never a per-food nutrient lookup at product granularity. Grocery's own scope, not a
  book's.
- **Real ingredient pricing** (`DEC-073`) and **store-inventory/availability data** (`DEC-074`) — neither
  the nutrition corpus nor On Cooking 7e is a source for either; both are `DATA GAP` per §3.
- **Ingredient identity/normalization** (matching "chicken breast, boneless" across a recipe, a food-
  composition entry, and a grocery-list line item) — a data-modeling problem the knowledge layer cannot
  answer.

### 4.3 Requires product design (not more knowledge, not more evidence)

- `DEC-067`'s preparation-detail level (§3).
- `DEC-068`'s constraint-matching policy.
- `DEC-070`'s deviation-handling policy.
- `DEC-071`–`075`'s entire shopping/consolidation UX — the *logistics knowledge* is close to complete
  (`ON_COOKING_7E_EXECUTION_RECORD.md` §3 rates purchasing/yield-waste `ADEQUATE`); the *product* is
  unbuilt.
- **The pantry/grocery-list integration itself** (`DEC-065`/`072`) — this repository already has a
  household grocery-list and pantry feature (per `docs/architecture.md`'s description of `lists`/`items`);
  the integration design (which fields, which sync model) is a product decision informed by, but not
  determined by, the decision model.

### 4.4 Requires future evidence

- `DEC-090` circuit-breaker numeric values, `DEC-021`/`110` deviation cap — both still open from Gate 5,
  unaffected by Phase 9, tracked so they aren't lost.
- Whether true batch/quantity-food production is needed for v1 (§3's `DEC-069` v1-necessity gap) — if the
  product answer is "yes," a ninth-source evidence question follows *from that*, not from this document.

### 4.5 Requires human decision

- **`DEC-067`'s preparation-detail level** — recipe-level, ingredient-list-level, or general guidance.
  This determines how much of On Cooking 7e's `STRONG` recipe-construction coverage Grocery actually
  exposes, and it is a genuine product/UX call, not something this architecture can pick. **Flagged to
  the user, §8.**
- **Whether restaurant-scale batch production is a v1 requirement for `DEC-069`.** If yes, this becomes
  the first candidate for a Gate 7-adjacent review, per §11.2's own conditional. If no, the existing
  bounded limitation is simply carried forward as documented.
- **`DEC-061`'s allergen-taxonomy granularity**, to the extent it intersects the still-blocked Domain C
  criteria. Not urgent, but noted so it isn't silently decided later by implementation default.

---

## 5. Reusable Knowledge Primitives — Not a Cookbook Copy

The user's framing is exactly right and worth stating as a governing principle: **On Cooking 7e contains
hundreds of recipes; Grocery needs none of them verbatim.** What Grocery needs is the *transferable*
knowledge that lets it construct, adapt, and reason about recipes generally. Extracted from
`ON_COOKING_7E_EXECUTION_RECORD.md` §3–4 and restated as primitives:

| Primitive | What it captures | Which decisions it serves |
|---|---|---|
| **Standardized-recipe structure** | Ingredients + quantities + method + yield + portion size — a *schema*, not any specific recipe's content | `DEC-066`, `067` |
| **Ingredient-function relationships** | Why an ingredient is in a dish (binding, leavening, emulsifying, flavor) — lets substitution reason about *function*, not just category | `DEC-063` |
| **Substitution/functional-equivalence rules** | GF flour blending, egg-replacement, oil/spread swaps, sodium reformulation — pattern-level, not recipe-specific | `DEC-063`, `074` |
| **Cooking-method taxonomy** | Dry-heat / moist-heat / combination, and which food properties each suits | `DEC-066`, `068` |
| **Yield/portion/scaling conversion factors** | The arithmetic of turning a recipe's stated yield into a different serving count | `DEC-069` (the supported part), `DEC-060` |
| **Storage/preservation transformation rules** | Refrigeration/freezing limits, reheating guidance — general rules, not per-dish | `DEC-069` (the supported part) |
| **Nutrient-fate/retention qualitative patterns** | How preparation method tends to affect nutrient content (not a quantitative model) | Feeds back to the core corpus's nutrient targets — a Layer-1→Layer-2 bridge, not a new target |

**What this explicitly rules out:** ingesting On Cooking's actual recipe *text* into a Grocery database,
treating its recipe count as Grocery's recipe catalog, or building a "cookbook browser" feature. The
knowledge layer is a rule set; the product's actual recipe content (if any) is a separate, later product
decision this document does not make.

---

## 6. Scientific Authority Boundary

**Binding, restated from `CULINARY_SOURCE_EXTENSION.md` §5 rule 1 and re-verified here against §2's
capability map:** where On Cooking 7e and the seven-book nutrition corpus both speak — storage, food
safety, nutrient effects — **the nutrition corpus governs.** On Cooking supplements operational detail; it
never overrides an energy, macro, clinical, or supplement boundary.

**Checked for actual conflicts, not just asserted absent:**

- Energy/macro targets (Domains D–F) — On Cooking makes no energy or macro claims; no conflict surface
  exists.
- Clinical safety boundaries (Domain C, `DEC-012`–`016`) — On Cooking's allergen/special-diet content
  (§2.1's `DEC-061` row) is *operational* (how to substitute) not *diagnostic* (who is at risk); the
  diagnostic boundary stays with Domain C and the still-deferred `DEC-099`/`100`. No conflict found.
- Supplement boundaries (`DEC-044`, Gate 5 Option A — no autonomous dosing) — On Cooking is a food-
  preparation text and makes no supplement claims. No conflict surface.
- Evidence hierarchy / escalation rules (Domain C, T) — unaffected; On Cooking was never treated as a
  nutrition-evidence source, only a preparation source (per `CULINARY_SOURCE_EXTENSION.md`'s own binding
  rules).

**No conflict was found requiring resolution.** Had one been found, per the user's instruction, it would
be named here rather than resolved by an invented compromise. None was.

---

## 7. Practical-Translation Gap — Reconciled Against Phase 8's Findings

Verifying each of the six points the user asked to re-check, against the actual current record:

1. **Portion knowledge remains thin/extendable, not falsely complete.** `DEC-060`/`062` are `GAP-C`,
   unchanged by the culinary extension — On Cooking 7e was never asked to, and does not, deepen exchange-
   list portioning methodology. Confirmed still thin in §2.1.
2. **Recipe construction is now supported by the bounded On Cooking extension.** Confirmed — `DEC-066`/
   `067` are `STRONG` per §2.2, sourced to specific chapters, not asserted.
3. **Recipe modification and substitution are distinguished from construction.** Preserved: §5's
   primitives keep "substitution/functional-equivalence rules" (`DEC-063`) as a distinct primitive from
   "standardized-recipe structure" (`DEC-066`/`067`) — the same construction-vs-modification line Gate 6
   itself insisted on when it rejected Option C as a primary architecture.
4. **Shopping/pantry/deviation remain primarily translation/logistics concerns.** Confirmed in §2.3 and
   §3 — every Domain M decision plus `DEC-065`/`070` is classified `PRODUCT DECISION GAP`, never
   `KNOWLEDGE GAP`.
5. **Culinary knowledge is not allowed to silently become nutrition prescription.** Enforced structurally
   by §1's five-layer model and verified with no exceptions in §6 — no capability in §2 lets a culinary
   fact set or override a nutrition target.
6. **Professional culinary/restaurant operations remain outside scope.** Reaffirmed: `DEC-069`'s batch-
   production limitation (§3, §4.5) is treated as a bounded gap requiring a *product* decision before it
   could ever become a *knowledge* one — exactly Gate 6 §10's standing exclusion, not silently relaxed by
   this document.

**No curriculum expansion occurred merely because On Cooking contains additional culinary topics** (candy,
desserts, quantity-food chapters) — §5's primitive list is deliberately narrower than the book's contents,
and `CULINARY_SOURCE_EXTENSION.md` §5 rule 4 (chapters existing ≠ chapters in scope) is respected
throughout §2's mapping.

---

## 8. Human Decisions Required (not decided by this document)

Two are named in §4.5 as immediately relevant; restated together here for visibility:

1. **`DEC-067`'s preparation-detail level** — recipe-level vs. ingredient-list-level vs. general guidance.
   A product/UX decision with real downstream consequences: it determines how much of the recipe-
   construction knowledge layer actually surfaces to a user, and it shapes every capability in §2.2 and
   §2.3 downstream of it.
2. **Whether restaurant-scale batch production is a genuine v1 requirement** for `DEC-069`. Answering
   "yes" reopens a knowledge question (a ninth source, or a scope narrowing); answering "no" simply
   confirms the current bounded limitation as acceptable and permanent for v1.

Neither is decided here. Both are architecturally significant enough that guessing would violate §23 —
they are recorded as open, not filled with a plausible default.

---

## 9. What Is Explicitly NOT Implemented Yet

Per §28 and the user's explicit instruction:

- No React components, no API endpoints, no database schema, no ORM/table design.
- No recipe-generation algorithm, no shopping-consolidation algorithm, no substitution engine code.
- No ingredient database, no food-composition data import, no UI, no copy.
- No numeric circuit-breaker values (`DEC-090`) or deviation cap (`DEC-021`/`110`) — still open Phase 7/8
  evidence tasks, not Phase 9 work.
- No resolution of `DEC-099`/`100` — untouched, as every prior phase has kept it.
- No new decision ID, no renumbering, no topic-universe change.

This document is an architecture — a map from existing decisions to future capabilities — not a build.

---

## 10. Self-Audit

- **Phase 8 remains CLOSED.** Verified by reading its actual current status (§0) before writing anything;
  this document did not reopen or restate its closure conditions.
- **No stable IDs changed.** Every `DEC-###` cited in §2–§8 is quoted from `APP_DECISION_INVENTORY.md` as
  written; none renumbered, merged, or invented. No topic ID touched.
- **No historical human decision silently altered.** Gate 5/6 decisions are cited, not re-adjudicated;
  the two open human-decision candidates (§8) are flagged, not answered on the project's behalf.
- **No new nutrition formula invented.** §2.4's upstream domains are referenced, not re-derived; nothing
  in §2.1–2.3 touches an energy, macro, or micronutrient formula.
- **No new clinical threshold invented.** Domain C is cited as still blocked; `DEC-061`'s allergen-
  granularity question is flagged (§3, §4.5) rather than answered.
- **On Cooking 7e's content was not treated as a complete recipe database.** §5 states this as a governing
  principle and lists primitives, not recipes; §7 point 6 re-confirms the professional/restaurant-
  operations exclusion holds.
- **Knowledge, decision logic, translation, and product implementation stayed separated.** §1's model is
  applied consistently across every row of §2; §6 specifically checked (not merely asserted) that no
  conflict crosses the boundary.
- **Every new Phase 9 capability traces to an existing decision or is marked a product requirement.**
  Every §2 row cites a `DEC-###`; every §3/§4 gap is classified into one of the five given categories,
  none left ambiguous.
- **Every unresolved issue is classified, not silently solved.** §3's table and §4.4/§4.5 are the record;
  nothing was given a plausible default value.
- **The project remains within Grocery's intended scope.** No capability above requires professional
  culinary content, restaurant-scale operations, or clinical dietary treatment — all three remain
  excluded per Gate 6 §10, checked explicitly in §7.

**One thing worth naming plainly rather than smoothing over:** this document is itself evidence for §0.1's
point — Phase 7's own status table is now stale in two rows (L, M) and this document works *around* that
staleness rather than fixing it, for the same authorization reason Phase 8 did. A future session doing any
programmatic cross-check against `DECISION_LOGIC_SPECIFICATION.md` §2 should know that table's `L`/`M`
rows are superseded by Phase 8/9 findings, not by a correction to that file itself.

---

## 11. Status (first milestone — unchanged, kept as written)

**Phase 9 first milestone: capability architecture established.** Not started: any implementation.
Recommended next step: resolve the two §8 human decisions (preparation-detail level; batch-production v1
necessity), since several §4.3 product-design items are easiest to scope once §8.1 is answered. No further
document is needed to carry that work — this artifact should be extended in place, per the user's own
"avoid document proliferation" instruction, rather than superseded by a new one.

---

## 12. Dependency Analysis — Grocery's Minimum Information Architecture (Phase 9, second pass)

**Trigger:** continuing from §11's own recommended next step, but *not* by resolving §8's two human
decisions — the user explicitly withheld both `DEC-067` (preparation-detail level) and `DEC-069`
(restaurant-scale batch-production necessity) again for this pass. They remain unresolved below, exactly
as §8 left them. This section instead does the work §4.2/§4.3 only sketched: a full dependency inventory
across the 13 areas the user named, each checked against the actual repository rather than assumed.

**Scope discipline, restated because it binds this section specifically:** no database schema, no
commercial food-database selection, no API/provider choice, no code, no invented nutrient value, formula,
or threshold, and On Cooking 7e is still not a recipe database (§5, §7 point 6 — unchanged). Where §12.2
below cannot resolve something with real evidence, it says so and stops, rather than filling the gap with
a plausible-looking architecture.

### 12.1 Repository Reconciliation — What Was Verified, Not Assumed

Before classifying anything, the actual repository was inspected (`docs/architecture.md`,
`supabase/*.sql`, `src/lib/*.ts`, `data/README.md`) rather than relying on §4.2–§4.3's prior prose, which
was written from the architecture doc's description without opening the schema or the sync/nutrition
code directly. Two corrections and several confirmations came out of that:

**Correction — §4.3's "pantry" claim does not hold.** §4.3 and §4.5 above describe "this repository
already has a household grocery-list **and pantry** feature." That is only half true. `lists`/`items`
(`supabase/01-schema.sql`) is a real, wired, synced **shopping list** — a list of lines with `name`
(free text), `qty` (free text), `checked` (bought/not-bought within *this* list), and a category; closing
a list archives it to History rather than deleting it (`docs/architecture.md`, "State & persistence").
There is no on-hand **inventory** concept anywhere in the repo — no table, no field, no UI surface that
tracks "how much of X the household currently has regardless of which list it came from." A grep for
`pantry`/`kiler` across `src/` and `netlify/` turns up nothing but a taxonomy keyword. `DEC-065`
("pantry-aware selection") and `DEC-072` ("pantry reconciliation") therefore have a real integration
target for the *shopping-list* half of what they need, but the *pantry* half is not built and was not
found anywhere partially built either. This is flagged, not silently fixed, in keeping with §0.1's own
precedent for stale cross-references: §4.3/§4.5 above are not edited, this correction just supersedes
them for anyone reading forward.

**Correction/addition — a minimal recipe-like structure already exists and was not mentioned in §5.**
`data/combos.json` / `src/lib/combos.ts` defines a `Combo`: `id`, `nameTr`, `items: {foodId, grams}[]`,
`prepMinutes`, `tags`. It is hand-authored, bundled into the client build (not Supabase-backed, not
user-editable), and used only to power "Bugün"'s suggestion engine (`src/lib/comboMatch.ts` — matches
against `personal_plan.excluded_food_ids`, ranks by protein, filters by remaining kcal budget). It has no
method/steps, no yield distinct from its ingredient list, and is explicitly out of scope as a "recipe
database" (per this document's own §5 boundary) — but it is real, shipped evidence of what a v0
ingredient-list-level recipe representation looks like in this codebase, and §12.2 below treats it as
the existing floor for `DEC-066`/`067`, not a hypothetical.

**Confirmed — food-composition data exists, narrowly.** The Supabase `nutrition` table
(`name_tr`, `aliases[]`, `kcal_per_100`, `protein_g`, `fat_g`, `carbs_g`, `fiber_g`) is live and read by
`netlify/functions/nutrition.ts`. The seed file backing it (`data/nutrition.json`) currently holds 64
rows, macro-and-fiber only, each with a manual USDA citation (`source` field) — this is a curated Turkish
grocery-item subset, not a general-purpose food-composition database, and carries no micronutrient
columns (Domain G).

**Confirmed — three separate, disconnected identity/matching primitives exist, not one.** (1)
`normalize()` (`src/lib/categorization/itemCategories.ts`) plus the `nutrition.aliases[]` array resolves
name variants to one nutrition row. (2) `isCloseMatch()` (`src/lib/fuzzyMatch.ts`, Levenshtein-bounded)
deduplicates typo'd shopping-list entries against the catalog built from past lists (`store.ts`,
`listActions.ts`, `AddItem.tsx`). (3) `item_category_memory` (`name_lower → category`, per household)
resolves a name to a *category*, independent of both of the above. None of the three shares a key space
with either of the others — a shopping-list line, a nutrition lookup, and a category guess for the same
real-world ingredient are matched by three unrelated mechanisms today, not one ingredient identity.

**Confirmed — a working macro nutrient-calculation engine exists.** `src/lib/mealNutrition.ts`
(`scaleNutrition`, `sumMacros`) scales a per-100g row by a gram quantity and sums across items; it backs
both `comboMatch.ts` and `localMealPlan.ts`. This is deployed, not hypothetical — Domain K/L capabilities
that only need macro totals (not micronutrient density) have no calculation-layer gap.

**Confirmed — a real per-user profile and a real longitudinal log both exist.** `personal_plan`
(weight/height/age/sex-equation/activity/goal/waist, one row per `app_user`) and `meal_entries`
(household/date/slot/`food_id`/`quantity_g`/`combo_id`) are both live Supabase tables, not proposals.
`personal_plan.excluded_food_ids text[]` is a real but undifferentiated exclusion list (the migration
comment says "allergies, dislikes" without distinguishing them) consumed only by `comboMatch.ts`'s
filter — it is not applied to the shopping list, not applied to nutrition rows, and carries no allergen
taxonomy.

**Confirmed — no pricing or store-availability data of any kind exists.** Grep across `src/lib` finds no
price/store-inventory concept; the only "market" hits are taxonomy keywords for categorizing a grocery
item's aisle, unrelated to `DEC-073`/`074`.

### 12.2 Dependency Inventory (13 areas)

For every row: **why** it's needed, the **DEC IDs** that depend on it, whether it sits **upstream**
(a foundation other decisions consume) or **downstream** (produced by running other decisions),
whether it **blocks** implementation of something in §2, whether it's **deferrable**, and the **minimum
viable representation** — stated at the information-architecture level, deliberately short of a schema.

| # | Dependency | Classification | Why needed | DEC IDs | Direction | Blocks impl.? | Deferrable? |
|---|---|---|---|---|---|---|---|
| 1 | Food-composition data | **EXISTING IN REPO** (partial — macro-only, 64 curated rows) → **REQUIRES EXTERNAL DATA** for real coverage/depth | Every Domain K decision assumes a per-ingredient nutrient lookup exists | 060–063, 066, 069 | Upstream | Partially — macro-level Domain K work is already unblocked; density ranking (`062`) and any micronutrient use are not | Yes, incrementally — coverage can grow row-by-row without an architecture change |
| 2 | Ingredient identity normalization | **EXISTING IN REPO** (three disconnected partial mechanisms, §12.1) → **REQUIRES NEW DOMAIN MODEL** to unify them | A shopping-list line, a nutrition lookup, and a future recipe ingredient must resolve to the same real-world thing for `063`/`065`/`071`/`072` to be reliable, not coincidentally correct | 060, 063, 065, 071, 072 | Upstream | Yes, for any cross-system feature (recipe↔list, list↔nutrition-at-scale); today's narrow `normalize()` unblocks a v0 that never crosses systems | Yes for the unification; the three existing partial mechanisms are enough to keep shipping single-system features meanwhile |
| 3 | Recipe/ingredient representation | **EXISTING IN REPO** (minimal — `combos.json`, §12.1) → extending it **REQUIRES NEW DOMAIN MODEL** | `066`–`069` need something to translate selected foods into; `combos.json` is evidence of the floor, not the ceiling | 066, 067, 068, 069 | Upstream | Yes for anything beyond today's fixed, hand-authored combo list — but the *shape* of the extension is exactly what `DEC-067` (still open, §8) decides | No — blocked *on* `DEC-067`, not deferrable independent of it |
| 4 | Portion and yield representation | Quantity: **EXISTING IN REPO** (grams, `meal_entries`/combos) — Yield/scaling: **REQUIRES NEW DOMAIN MODEL** (does not exist anywhere) | `069` (batching/leftovers) and any "serves N, scale to M" behavior need a yield concept; none exists today, only fixed per-item gram quantities | 060, 066, 069 | Upstream | Yes for `069`'s scaling half — but scoped by the still-open `DEC-069` v1-necessity decision (§8) | Yes, if `DEC-069`'s answer narrows batch/yield scope for v1 |
| 5 | Unit and measurement normalization | Nutrition-linked quantities: **EXISTING IN REPO** (grams used uniformly, sidestepping conversion) — Shopping-list `qty`: **REQUIRES NEW DOMAIN MODEL** (free text, zero structure today) | `071` consolidation and `072` pantry reconciliation need to compare quantities; `items.qty` is an unparsed string (`"2 kg"`, `"1 paket"`) today | 069, 071, 072, 074 | Upstream | Yes for `071`/`072` at real fidelity; not a blocker for anything nutrition-only, which already avoids the problem by only ever using grams | Yes — deferrable as long as shopping-list and nutrition quantities are never made to interoperate |
| 6 | Nutrient calculation dependencies | Macros: **EXISTING IN REPO** (`mealNutrition.ts`, deployed) — Micronutrients: **EXISTING IN KNOWLEDGE MODEL** only (Domain G targets are `SPECIFIED` but dosing specifics are `NEEDS JUDGMENT`, per §2.4) | `060`/`062` need a scale-and-sum calculation over candidate foods | 060, 062, and upstream D–H | Upstream | No — macro path is already unblocked; micronutrient depth is gated on Domain G's own already-tracked open item, not new here | Yes, for micronutrient depth |
| 7 | Ingredient substitution dependencies | **EXISTING IN KNOWLEDGE MODEL** (On Cooking 7e functional-substitution patterns, §5) → representation **REQUIRES NEW DOMAIN MODEL**; aggressiveness **REQUIRES NEW PRODUCT DECISION** | `063` must preserve nutrient contribution when substituting; `074` needs the same mechanism for availability-driven swaps | 061, 063, 074 | Upstream (for `074`) / self-contained (for `063`) | No — nothing else in §2 requires substitution to ship first | Yes — not required for a v1 that only does shopping-list translation |
| 8 | Restriction/allergen representation | Preference-grade: **EXISTING IN REPO** (`excluded_food_ids`, undifferentiated) — Safety/clinical-grade: **REQUIRES HUMAN DECISION** (intersects still-blocked `DEC-099`/`100`) | `061`'s exclusion must be conservative where clinical; today's list can't tell "allergy" from "dislike" | 061, 099, 100 | Upstream | **Yes, hard blocker** — if the product ever represents an exclusion as allergy-safe, and it is only a preference blacklist, that is a real-harm false-negative risk (§2.1's own safety-boundary note on `061`) | No, if any allergy-safety claim is made; yes, if scope stays "preference only" and is labeled as such |
| 9 | Pantry/list/item integration | Shopping list: **EXISTING IN REPO** (`lists`/`items`, fully wired) — Pantry (on-hand inventory): **REQUIRES NEW DOMAIN MODEL** (confirmed absent, §12.1 — corrects §4.3) | `065`/`072` were described as having a pantry to integrate with; only the list half exists | 065, 072 | Downstream (consumes Domain K/M outputs) | No for list-based integration; yes for anything requiring true on-hand-quantity tracking | Yes — `065`/`072` can target the shopping list alone until/unless a pantry feature is separately decided as a product requirement |
| 10 | Shopping and availability data | **REQUIRES EXTERNAL DATA** | `073` (cost) and `074` (store availability) have no source in either corpus and none in this repo | 073, 074 | Upstream (for those two decisions only) | No — `075` is already `FUTURE FEATURE` per Phase 3, and `073`/`074` are `MODERATE` personalization, not core-path | Yes, explicitly already deferred by Phase 3 |
| 11 | User preference/profile inputs | Energy/goal profile: **EXISTING IN REPO** (`personal_plan`) — Meal-prep-specific fields (skill, time, equipment, budget, store): **REQUIRES NEW DOMAIN MODEL** (no fields exist for any of these) | `064`/`068`/`073`/`074` all consume a "disclosed X" the user hasn't been asked for yet | 064, 068, 073, 074 | Upstream | Yes for those four decisions specifically; no effect on the energy/goal chain, which already works | Yes, until those decisions are prioritized |
| 12 | Longitudinal feedback inputs | Raw log: **EXISTING IN REPO** (`meal_entries`) — Adaptation policy: **carried-open SPECIFICATION GAP** (Phase 7/8, not new) | `070` and Domain O need logged actual intake; it's already collected | 070, 076–080, 081–091 (esp. 084/085/090) | Downstream (produced by use) → feeds back upstream into the next planning cycle | No — logging already happens; only the *policy* that consumes it is unresolved, and that was already tracked before this pass | Yes, already deferred (§3, §4.4) |
| 13 | Preparation and storage metadata | **EXISTING IN KNOWLEDGE MODEL** (On Cooking 7e, `STRONG`/`ADEQUATE` per Phase 8) → representation **REQUIRES NEW DOMAIN MODEL**, gated on `DEC-067` | `066`–`069` need prep/storage facts attached to whatever recipe representation ships | 066, 067, 068, 069 | Upstream | No independent blocker — blocked on the same still-open `DEC-067` as #3 | No, not deferrable independent of `DEC-067` |

**Minimum viable representation, stated once per dependency (architecture-level, no schema):**

1. A lookup keyed by ingredient identity resolving to macro composition per reference unit — the shape
   already in production; only coverage needs to grow.
2. One canonical identity per real-world ingredient that a shopping-list line, a nutrition lookup, and a
   future recipe ingredient can all resolve to, tolerant of casing/whitespace, known aliases, and small
   typos — i.e., unify the three existing partial mechanisms rather than add a fourth.
3. A name, an ingredient list where each line resolves through #2, and a quantity per line — method/steps
   are not required to unblock Domain K/M and only matter once `DEC-067` picks a detail level.
4. A (source yield, target yield) scale factor applicable to every ingredient quantity in a recipe —
   nothing more elaborate is implied by anything in §2.
5. Keep grams canonical wherever nutrition is involved (as today); treat shopping-list `qty` as a
   separate, non-canonical display value unless/until a decision is made to parse and normalize it.
6. The same (ingredient, quantity) → nutrient-totals function already shipped, extended with more fields
   per ingredient record if/when micronutrient depth is prioritized — no new calculation shape.
7. A record expressing "ingredient A substitutes for ingredient B, under condition C, preserving nutrient
   contribution" — a pairwise or functional-class mapping, not a general solver.
8. Preference-grade: exactly what `excluded_food_ids` already is. Safety-grade: an allergen taxonomy per
   ingredient identity plus a documented exclusion policy — explicitly not specified here, since it
   depends on the still-blocked `DEC-099`/`100`.
9. If a product decision says pantry is needed: a quantity-on-hand per ingredient identity per household,
   independent of any specific shopping list. Nothing more.
10. Not proposed here — any minimum viable representation would require picking an external provider,
    which is out of bounds for this pass.
11. A per-user record of disclosed constraints (skill, time, equipment, budget, store), each attachable to
    the decision that consumes it — the same shape as `personal_plan`, with more fields.
12. What's already logged (date, slot, ingredient identity, quantity) is sufficient to unblock any future
    adaptation logic; only the *policy*, already out of scope here, is missing.
13. A qualitative note (e.g., "refrigerate, use within N days") attachable to a recipe/ingredient record —
    not a calculation, not a numeric model.

### 12.3 Self-Audit — This Pass Specifically

- **`DEC-067` and `DEC-069`'s v1-necessity were not decided.** Both are referenced throughout §12.2 as
  gating conditions, never as resolved. Re-checked against §8's original wording before writing this
  sentence.
- **No database schema was designed.** §12.2's "minimum viable representation" column is deliberately
  worded at the level of "a lookup," "an identity," "a record expressing X" — none names a table, a
  column type, or a storage technology.
- **No commercial food database or API/provider was selected.** Dependency #1 and #10 both stop at
  "requires external data" / "not proposed here" rather than naming a candidate.
- **No nutrient value, formula, or threshold was invented.** §12.2 cites existing macro fields
  (`kcal_per_100`, etc.) and existing calculation functions by name; nothing new was computed or asserted.
  Domain G's dosing specifics are cited as still `NEEDS JUDGMENT`, not resolved.
- **On Cooking 7e was not turned into a recipe database.** Dependency #3 and #13 both cite it only as a
  knowledge source for a representation *shape*; `combos.json` (already-shipped, hand-authored, 
  intentionally small) is the only recipe-like artifact treated as real, and it is explicitly not derived
  from On Cooking's actual recipe text.
- **Every existing-repo claim was checked against the file, not recalled.** §12.1 lists what was actually
  read (`docs/architecture.md`, every relevant `supabase/*.sql` file, `src/lib/nutrition.ts`,
  `comboMatch.ts`, `combos.ts`, `localMealPlan.ts`, `fuzzyMatch.ts`) and one prior claim (§4.3's "pantry")
  was found to not hold and is flagged rather than silently left standing.
- **Uncertainty was not converted into architecture to look complete.** Dependencies #5 (unit
  normalization for the shopping list), #8 (safety-grade allergen taxonomy), and #10 (pricing/
  availability) are each left as an open requirement with a named reason, not filled with a plausible
  default shape.

---

## 13. Status — Updated After the Dependency-Analysis Pass

**Phase 9, second milestone: dependency analysis complete for all 13 areas the user named.** Still not
started: any implementation, any schema, any provider selection. Still open, unchanged from §8: `DEC-067`
(preparation-detail level) and `DEC-069`'s v1-necessity — §12.2 shows these now gate more of the
dependency inventory than §8 alone made visible (specifically #3, #4, #13), which is new information this
pass surfaced, not a reason to resolve them here.

**Recommended order of future implementation work** (architecture-level sequencing, not a schedule):

1. Resolve `DEC-067` and `DEC-069`'s v1-necessity (§8) — the single highest-leverage unblock, since
   dependencies #3, #4, and #13 all sit downstream of it and nothing else in this inventory is closer to
   "ready but waiting."
2. Unify dependency #2 (ingredient identity) — every cross-system dependency above it (#1's usability
   beyond single-system lookups, #3, #5, #7, #9) is more expensive to retrofit the longer three
   disconnected identity mechanisms keep shipping independently.
3. Decide dependency #8's scope explicitly (preference-only vs. any allergy-safety claim) before building
   anything that could be mistaken for the latter — this is a product decision, not an evidence question,
   and it is cheap to answer now and expensive to discover unanswered later.
4. Everything else in §12.2 (#4–#7, #9, #11–#13) can proceed in whatever order product priority dictates
   once #1–#3 above are settled; none of them blocks another except through the dependencies already
   named in the table.
5. Dependencies #10 (pricing/availability) stay deferred, per Phase 3's own `FUTURE FEATURE` labeling —
   revisit only after the above.

No further document is needed to carry this forward — consistent with §11's own instruction, this
artifact continues to be extended in place.

---

## 14. Domain-Boundary + Implementation-Readiness Analysis (Phase 9, third pass)

**Trigger:** §12–§13's dependency inventory is accepted as baseline and is **not repeated below.**
`DEC-067` and `DEC-069`'s v1-necessity are again left exactly as open as §8 and §12 left them — this pass
surfaces one *new* thing that behaves like a third open decision (§14.6) but does not resolve any of the
three. This pass goes one layer deeper than §12: not just *what* Grocery needs, but which of those needs
are actually distinct *concepts*, how the nine specific mechanisms named for this pass behave under
inspection (not just by name), and what a canonical-identity architecture would have to answer
conceptually. No schema, no migration, no refactor, no new ID, and no resolution of any open decision
occurs anywhere below.

### 14.1 Minimum Domain Boundaries — Concept Classification

| Concept | Classification | Why |
|---|---|---|
| Food | **REQUIRED DOMAIN CONCEPT** | Every other row in this table ultimately references "a real-world edible thing." `nutrition.name_tr` already plays this role today, informally. |
| Ingredient | **NOT NEEDED** (collapses into Food) | Repo evidence never treats "ingredient" as a second identity — `combos.json`'s `items[].foodId` and `meal_entries.food_id` both point straight at the same Food identity. A separate Ingredient concept would duplicate Food with no demonstrated need. |
| Recipe / Combo | **EXISTING REPO CONCEPT** (v0, `combos.json`) and **REQUIRED DOMAIN CONCEPT** going forward | Real today at a narrow scope (§14.4); required at some scope per §2.2 regardless of what `DEC-067` ultimately picks. |
| Recipe Ingredient | **DERIVED CONCEPT** | The (Food × quantity) line inside a Recipe — a relationship, not an identity of its own. Already shaped this way in `Combo.items[]`. |
| Nutrient Profile | **EXISTING REPO CONCEPT** (macro-only) | The `nutrition` table row. Micronutrient depth is a separate, unmet need (**EXTERNAL-DATA CONCEPT**), not a different concept. |
| Portion | **PRODUCT CONCEPT** | Today fully collapsed into a raw gram quantity everywhere nutrition-linked. Whether a human-scale "portion" (e.g. "1 orta boy elma") needs to exist as distinct from a gram number is exactly what `DEC-067`'s still-open answer would determine — not inferable here. |
| Yield | **FUTURE / OPTIONAL** | Does not exist anywhere in the repo (confirmed, §12.1). Only becomes load-bearing if `DEC-069`'s v1-necessity is answered "yes." |
| Preparation Method | **FUTURE / OPTIONAL** | Knowledge exists (On Cooking 7e, Phase 8), representation does not, and building one isn't justified before `DEC-067` picks a detail level. |
| Cooking Method | **FUTURE / OPTIONAL** | Same reasoning as Preparation Method — the dry-heat/moist-heat/combination taxonomy is a Phase 8 knowledge primitive (§5), not a repo concept today. |
| Meal | **EXISTING REPO CONCEPT** | A (date, slot) grouping of items — `MEAL_SLOTS` and `meal_entries` already implement exactly this. |
| Meal Plan | **EXISTING REPO CONCEPT, under-differentiated** | `meal_entries` serves as both a forward-looking plan and a backward-looking log with no field distinguishing the two (§14.2 finding). It exists; its boundary against Longitudinal Meal Entry does not yet. |
| Shopping List Item | **EXISTING REPO CONCEPT** | `items` table — real, synced, fully wired (confirmed again this pass). |
| Pantry / On-Hand Inventory | **FUTURE / OPTIONAL** | Confirmed absent, again (§12.1's correction reconfirmed by a fresh grep this pass). Needed only if a product decision says v1 requires it — not decided here. |
| User Food Preference | **EXISTING REPO CONCEPT** (mechanism) | `personal_plan.excluded_food_ids`. Real and working — but see §14.6: its current semantics don't safely support everything the word "preference" is being asked to cover in the UI that populates it. |
| Food Restriction | **PRODUCT CONCEPT** | Does not exist as distinct from Preference today. Whether a non-medical, diet-driven restriction category should split out from a bare dislike is undecided. |
| Allergen / Safety Restriction | **PRODUCT CONCEPT, safety-gated** | Becomes a **REQUIRED DOMAIN CONCEPT**, distinct from Preference, the moment Grocery makes any allergy-safety claim — but whether it makes that claim is a human/product decision entangled with the still-blocked `DEC-099`/`100`. Not decided here. |
| Food Identity / Canonical Identity | **REQUIRED DOMAIN CONCEPT** | The connective tissue every row above depends on. This pass's central finding (§14.3) is that it exists informally today, split across three non-unified mechanisms. |
| Nutrient Calculation Result | **DERIVED CONCEPT** | Always computed from (Food, quantity) at use time, never persisted — confirmed: `meal_entries` stores `food_id`/`quantity_g`, never a computed total; same for `combos.json`. |
| Longitudinal Meal Entry | **EXISTING REPO CONCEPT** | `meal_entries` — same table as Meal Plan (see that row's differentiation note). |

### 14.2 Reconciliation Deep-Dive — The Nine Named Mechanisms

Inspected directly (code read, not recalled) for this pass: `src/lib/combos.ts` + `data/combos.json`,
`src/lib/comboMatch.ts`, `src/lib/mealNutrition.ts`, `supabase/07-meal-entries.sql` +
`12-meal-entries-combo-id.sql`, `src/lib/mealPlan.ts`, `src/lib/localMealPlan.ts`,
`supabase/10-personal-plan-exclusions.sql`, `src/lib/personalPlan.ts`,
`src/components/PersonalPlanView.tsx`, `supabase/01-schema.sql`, `src/lib/listActions.ts`,
`src/lib/store.ts`, `src/lib/categorization/itemCategories.ts`, `src/lib/fuzzyMatch.ts`,
`netlify/functions/item-category-memory.ts`, `src/components/NutritionView.tsx`.

| Mechanism | What it currently represents | Can safely support | Cannot support | Overlaps | Unify or independent? |
|---|---|---|---|---|---|
| `data/combos.json` | A fixed, hand-authored, client-bundled list of `{id, nameTr, items:[{foodId,grams}], prepMinutes, tags}` | Read-only suggestion display; macro totals (already computed); exact-foodId exclusion filtering | User-created/edited recipes without a redeploy; method/steps; yield-based scaling; substitution; anything beyond exact-string ingredient matching | None structurally — it's the only recipe-shaped artifact | Independent for now; its `foodId`-as-bare-string pattern is the thing any future recipe evolution must deliberately keep or supersede, not something to merge into today |
| `mealNutrition.ts` | A pure function: per-100g row × grams → totals, summed across items | Any macro total/derivation given (Nutrition row, grams) | Micronutrients (no fields); non-gram units; cooking-loss/nutrient-fate adjustment (knowledge exists per Phase 8, logic doesn't) | None — sole calculation engine, used identically by `comboMatch.ts` and `localMealPlan.ts` | Independent — already minimal and single-purpose; no reason to touch it |
| `meal_entries` | A per-household, per-day, per-slot log of `(food_id, quantity_g)`, optionally tagged `combo_id` | Rendering "what's logged for day X"; live nutrition recompute from `nutrition` | Distinguishing a forward plan from a backward log for the same date/slot (no status field exists); expressing that several rows form one composed dish unless they share a `combo_id` (manual "Besin ekle" entries get no such grouping) | **Serves three Phase-3-distinct roles on one table**: Meal, Meal Plan, and Longitudinal Meal Entry — real, working, but not yet architecturally separated | Not decided here — whether Plan and Log ever need to diverge is a product question (§14.9), not resolved by this pass |
| `personal_plan.excluded_food_ids` | A flat `text[]` on one profile row, read only by `comboMatch.ts`'s filter | Hiding unwanted foods from the combo suggestion engine | Differentiating allergy from dislike (confirmed: the UI that populates it literally merges both, §14.6); applying at the shopping-list or nutrition-browse layer (never read there); any allergen-safety claim | Conceptually overlaps the not-yet-built Food Restriction / Allergen concepts — **must not be treated as already satisfying either** | Independent as-is; extending it into a safety mechanism requires a product/safety decision first, not a data migration |
| `lists` / `items` | A real, synced, per-household shopping list: `name` (free text), `qty` (free text), `checked`, `category` | Everything a manual shopping list needs today | Ingredient-identity-linked nutrition lookup at the list level (see `NutritionView.tsx` finding below); on-hand/pantry tracking (no field exists); recipe-driven auto-population (confirmed: `listActions.ts` has zero combo/nutrition references) | None conceptually — it is the one real Shopping List Item implementation | Independent; extending it to consume a Recipe would reuse this shape, not replace it (§14.7) |
| `normalize()` / `aliases` | One shared function (`itemCategories.ts`'s `normalize`, imported directly by `nutrition.ts`) doing trim + `tr-TR` lowercase, feeding two separate maps: nutrition's `name_tr`/`aliases` → row, and category memory's `name_lower` → category | Exact-after-normalization matching within either map; alias resolution within nutrition only | Typos (exact match only — a misspelled query returns nothing, which **fails closed**, a safe default, not a bug); cross-map resolution (a nutrition alias is invisible to category memory and vice versa) | The *transform* is already shared between nutrition and categorization; the *key spaces* it feeds are not — a more precise finding than treating these as three unrelated mechanisms | The transform doesn't need re-unifying (already is); the two key spaces built from it remain a real, unresolved overlap (§14.3) |
| `isCloseMatch` (`fuzzyMatch.ts`) | Levenshtein-bounded typo tolerance, used only in `store.ts`/`listActions.ts` to merge near-duplicate spellings in the shopping-list catalog (autocomplete) | Deduplicating typo'd shopping-list entries for display | Anything nutrition- or safety-adjacent — it is never imported by `nutrition.ts`, `comboMatch.ts`, or `personalPlan.ts` | None — it operates on a key space (catalog display names) nothing else touches | Independent, and should stay that way — its worst-case failure (a wrong autocomplete grouping) is safe; extending it into nutrition/exclusion matching would not be (§14.3) |
| `item_category_memory` | `(household_id, name_lower) → category`, written only on explicit user correction | Categorization precedence exactly as designed | Nutrition identity (never cross-referenced with `nutrition`); restriction/allergen filtering (categories are aisle taxonomy, e.g. "süt ürünleri," unrelated to safety classes) | Shares the `normalize()` transform with nutrition (see above) but is a fully separate table/map | Independent today; a future unified Food identity *could* let both resolve through one key space without merging their actual data — an architectural option, not a decision made here |
| **New this pass:** `NutritionView.tsx`'s live list↔nutrition integration | Maps each shopping-list item's raw `item.name` through `fetchNutritionCached`/`lookupNutrition` (exact-normalized match only) to show a per-item nutrition row on the active list | Nutrition display for list items whose name happens to normalize to a `name_tr`/alias exactly | Anything else — a list item named even slightly differently than its nutrition counterpart silently gets **no** nutrition row (`missing` is only `console.info`-logged, never surfaced to the user) | This *is* the shopping-list ↔ nutrition integration point §12 discussed abstractly — it is real, shipped, and already exhibits the identity gap as a concrete, observable failure mode, not a hypothetical one | Not addressed by any existing mechanism; this is the strongest concrete evidence for §14.3 |

### 14.3 Canonical Identity Architecture — Conceptual Answers Only

Framed, per the user's instruction, as a safety/data-integrity boundary, not a search-quality problem —
`NutritionView.tsx`'s silent-miss behavior (§14.2) is the concrete stakes: today's fail-closed default
(show nothing rather than the wrong thing) is *correct* precisely because identity isn't solved yet, not
a defect to patch over with more aggressive matching.

- **What must have a stable identity?** Food (referenced by nutrition, any future recipe ingredient, and,
  the moment it's cross-referenced, the shopping list). Recipe/Combo already has one (`combo.id`,
  referenced by `meal_entries.combo_id`). Household (`households.id`) and user (`app_users.id`) are
  already stable and unaffected by this problem — noted so they aren't mistaken for open questions.
- **Which concepts need aliases?** Only Food, and only because it already has them (`nutrition.aliases[]`).
  No other concept in §14.1 shows evidence of needing alternate names for the same thing.
- **Which concepts require canonicalization?** Food — and specifically, the shopping-list item name and
  any future recipe ingredient name both need to resolve to the *same* canonical Food the nutrition row
  already anchors, which neither does today (`NutritionView.tsx` only catches exact-normalized matches;
  `combos.json` bypasses the question entirely by hand-authoring exact `foodId` strings that already
  equal a `name_tr`).
- **Which concepts may safely use fuzzy matching?** Shopping-list catalog dedupe/display only
  (`isCloseMatch`, already in production) — safe because its worst-case failure is a wrong autocomplete
  grouping, and it never touches nutrition, exclusion, or safety data.
- **Where would fuzzy matching be unsafe?** Anywhere a match result feeds a nutrient calculation, a
  restriction/allergen exclusion check, or a substitution decision — a false-positive fuzzy match there
  could silently attribute the wrong food's nutrition to an item, or let an excluded/allergenic food
  through under a near-spelling. This is why `lookupNutrition`'s exact-only, fail-closed behavior is the
  architecturally correct default today, confirmed by reading the actual call site, not an oversight to
  "fix" by adding fuzziness.
- **Which relationships require exact identity?** Food ↔ Nutrient Profile (already exact); Food ↔
  Restriction/Allergen exclusion (not yet built, but must be exact once it is, for the same reason
  above); Recipe Ingredient ↔ Food (currently exact, via bare `foodId` strings).
- **Which existing IDs can potentially serve as anchors?** `nutrition.name_tr` is already the de facto
  Food identity — both `combos.json`'s `foodId` and `meal_entries.food_id` reference it verbatim, with no
  FK (a documented, accepted risk per the `meal_entries` migration comment: "nutrition rows can be
  renamed/removed independently"). Using a display string as an identity key is a real, named limitation
  of this anchor, not a reason to abandon it — replacing it is a decision this pass does not make.
  `households.id` / `app_users.id` are already solid anchors, unrelated to this specific problem.
- **Where is an explicit mapping layer required?** Between a shopping-list item's free-text `name` and a
  Food identity — none exists today beyond the narrow exact-normalize check in `NutritionView.tsx`, which
  doesn't even reuse `nutrition`'s alias list the way `fetchNutrition` itself does server-side. Also,
  potentially, between `item_category_memory`'s key space and a Food identity, if categorization and
  nutrition are ever meant to share knowledge about the same real-world item — not decided here, and not
  required by anything currently shipped.

### 14.4 `combos.json` Capability Assessment

| Capability | Classification | Basis |
|---|---|---|
| Recipe construction | **SUPPORTED WITH EXTENSION** | Already expresses "named thing = set of (Food, grams) lines." Extension needed for anything beyond a flat ingredient list. |
| Recipe modification | **NOT CURRENTLY JUSTIFIED** | No user-facing edit path exists (build-time, hand-authored file); building one isn't justified before `DEC-067` decides whether recipes are even the exposed unit. |
| Ingredient substitution | **REQUIRES NEW DOMAIN CONCEPT** | No substitution field or logic anywhere in `Combo` or `comboMatch.ts`. |
| Scaling | **REQUIRES NEW DOMAIN CONCEPT** | No yield field exists to scale from or to; grams are fixed absolute quantities, not derived from a servings count. |
| Portion conversion | **REQUIRES NEW DOMAIN CONCEPT** | Same reasoning — only grams exist; nothing to convert between. |
| Nutrient calculation | **CURRENTLY SUPPORTED** | `comboTotals()`/`comboMatch.ts` already does this, live, for macros. |
| Restriction filtering | **SUPPORTED WITH EXTENSION** | `scoreAllCombos`/`matchCombos` already filter by `excludedFoodIds` (exact match). Extension needed to be safety-grade (§14.6) or to filter by anything beyond an exact `foodId`. |
| Preparation metadata | **NOT CURRENTLY JUSTIFIED** | `prepMinutes` is the only such field; anything beyond a single rough number isn't justified before `DEC-067`/`068`. |
| Shopping-list expansion | **REQUIRES NEW DOMAIN CONCEPT** | Confirmed by code inspection: no path from a `Combo` to `items[]` rows exists (`listActions.ts` has zero combo/nutrition references). Needs §14.3's identity-mapping layer first. |

`combos.json` is treated here as existing evidence of a v0 floor, per §5's own governing principle — not
automatically the final recipe architecture. Nothing above proposes changing it.

### 14.5 Nutrition-Data Boundary

**Two conflations checked for, not just asserted absent:**

- *"Food composition data = user nutrition target"* — **not conflated.** The `nutrition` table
  (food-scoped, per-100g composition) and `personal_plan`'s derived energy/macro targets (user-scoped,
  computed from Mifflin-St Jeor + activity + goal, per `docs/architecture.md`'s Personal Plan section) are
  structurally separate tables and computations. `comboMatch.ts` compares a combo's *computed* totals
  against a `remaining` budget value; it never stores or treats a food's composition as itself a target —
  a one-directional comparison, not an identity merge.
- *"Recipe nutrition calculation = prescription"* — **not conflated**, but the boundary is a documented
  convention, not a structural safeguard. `docs/architecture.md` explicitly states Personal Plan targets
  are "estimates," not diagnoses; nothing in `mealNutrition.ts`, `comboMatch.ts`, or `localMealPlan.ts`
  generates prescriptive language, and Domain C (clinical) stays separately gated behind `DEC-099`/`100`,
  untouched by any of this. Worth naming plainly: this holds today because no code path currently produces
  prescriptive output, not because anything would structurally prevent one from being added carelessly
  later. That is a design-discipline note for future work, not a defect found now.

**Conceptual layers, distinguished:** food identity (§14.3) → nutrient composition (`nutrition` table,
per-food) → nutrient calculation (`mealNutrition.ts`, a pure function of composition × quantity) →
nutrition target (`personal_plan`, per-user, independently derived) → meal-level nutrition (a calculation
*result*, summed over a Meal's items, never persisted) → longitudinal observation (`meal_entries`, the
persisted record of what quantity of what food was logged when — never the calculation result itself).
Each layer is currently implemented by a different, non-overlapping piece of code, which is exactly why
the two conflations above don't currently occur — but also why nothing yet enforces that they can't.

**Additional nutrient information eventually required:** per-food micronutrient values (vitamins/
minerals) sufficient to serve Domain G's already-`SPECIFIED` targets (`DEC-041`–`045`), which in turn feed
`DEC-062`'s nutrient-density ranking. This is stated at the category level only — *which* specific
vitamins/minerals matter, and at what dosing, is exactly the part of Domain G that Phase 7 already marked
`NEEDS JUDGMENT`; naming a specific list here would be inventing nutrient content this pass is not
authorized to invent. No commercial source is proposed for this, per the critical boundary.

### 14.6 Safety-Boundary Findings

**Concrete evidence, not a hypothetical:** `PersonalPlanView.tsx`'s "Önerilmesin" ("Don't suggest this")
section reads: *"Sevmediğin veya yiyemediğin besinleri işaretle"* — "Mark foods you dislike **or can't
eat**." Both reasons write into the same `excludedFoodIds` array, with no field or UI distinguishing
which is which. That array is consumed by exactly one thing, `comboMatch.ts`'s suggestion filter — it is
never read by `NutritionView.tsx`, never applied to the shopping list, and has no allergen-taxonomy
backing of any kind.

**Where the current architecture is insufficient for safety-grade behavior:**

- `excluded_food_ids` cannot today distinguish allergy/intolerance (safety-relevant — `DEC-061`'s own
  framing: "a false negative here is a real-harm failure mode") from a bare dislike (not safety-relevant).
  Treating today's mechanism as already satisfying `DEC-061` would be exactly the false-negative risk
  `DEC-061`'s own safety-boundary note warns about.
- Neither recipe modification nor substitution (`DEC-063`, `074` — both unbuilt per §14.4) has any
  exclusion-aware hook today. If either were built without first resolving the point above, a "safe"
  substitute could be chosen with no path to check it against whatever exclusion list exists.
- The exact-identity requirement from §14.3 compounds this: even a well-designed allergen taxonomy would
  be unsafe layered on top of unresolved Food identity, since a fuzzy or missed identity match could let
  an excluded food through unrecognized.

**Classification:** this is a **PRODUCT/SAFETY DECISION**, not resolved here and not a taxonomy this pass
invents. It is a *third* item that behaves like an open human-decision candidate alongside `DEC-067` and
`DEC-069`'s v1-necessity, though it wasn't named as one in §8 — flagged here as new information this pass
surfaced, not silently added to §8's list or decided on the user's behalf. It is also entangled with the
already-blocked `DEC-099`/`100` (Domain C's detailed clinical criteria), so a full resolution may not even
be fully available yet regardless of product intent.

### 14.7 Shopping / Pantry Boundary

The chain **Recipe → Required Ingredients → Shopping List → On-Hand Inventory → Remaining Need**,
examined link by link:

- **Recipe → Required Ingredients:** already a `DERIVED CONCEPT` (Recipe Ingredient, §14.1) — the shape
  `combos.json` already uses.
- **Required Ingredients → Shopping List:** **not wired** — confirmed, `listActions.ts` has zero
  combo/nutrition references. Requires §14.3's identity mapping before it could be correct rather than
  accidentally correct (matching by exact string today would silently drop or duplicate on any spelling
  difference).
- **Shopping List → On-Hand Inventory:** the on-hand side doesn't exist (§12.1, reconfirmed §14.1), so
  this link doesn't exist either. If introduced, subtracting "on hand" from "required" is only meaningful
  once quantities are comparable — i.e., it needs dependency #5's unit normalization from §12, since a
  recipe requirement is in grams and a shopping-list `qty` is free text today.
- **Whether pantry is required for v1:** not decided here — a product decision, consistent with §12's
  existing "deferrable" finding.
- **Whether shopping can function without pantry:** **yes, architecturally.** `DEC-071` (consolidation)
  only needs the first link (Recipe → Shopping List); the on-hand step only matters once the product wants
  to avoid suggesting to buy what's already owned (`DEC-065`/`072`'s stated purpose). Pantry is an
  enhancement layered on top of a working shopping translation, not a prerequisite for it.
- **Can `lists`/`items` represent the shopping side without a duplicate system?** Yes — its existing shape
  (`name`/`qty`/`checked`/`category`) already fits "things to buy"; what's missing is only the
  *population* path (Recipe → Items) and the identity link, not a new list concept. Worth noting for
  whoever eventually builds this: `docs/architecture.md` already documents `src/lib/sync/lists.ts` and
  `sync/items.ts` as unwired, per-row Supabase scaffolding built for an *unrelated* reason (normalized
  sync, not recipe integration) — a future implementer should confirm those two motivations for touching
  the same tables don't end up working against each other, rather than assuming either one owns the file.

### 14.8 Implementation-Readiness Matrix

`READY` means the domain boundaries and inputs are sufficiently understood to scope real work — not that
something is technically codeable. `BLOCKED` means a specific, already-named decision gates it.

| Capability | Existing foundation | Missing foundation | External data | Product decision | Safety concern | Readiness |
|---|---|---|---|---|---|---|
| Food identity | `nutrition.name_tr`+aliases, shared `normalize()` | Cross-system resolution (list/recipe don't resolve through it) | No | Whether/how to unify (§14.3) | Yes, if identity errors bypass an exclusion | **PARTIALLY READY** |
| Recipe representation | `combos.json` v0 shape | Any representation beyond ingredient-list level | No | `DEC-067` | No direct | **BLOCKED** (on `DEC-067`) |
| Recipe construction | Same as above | Same as above | No | `DEC-067` | No | **BLOCKED** (on `DEC-067`) |
| Recipe modification | None | User-facing edit path; a target shape to edit | No | `DEC-067` first | No | **NOT READY** |
| Substitution | Knowledge only (Phase 8) | Any repo representation or logic | No | Aggressiveness policy (unscoped) | Must route through restriction filtering once built (§14.6) | **NOT READY** |
| Portioning | Raw grams everywhere | A portion concept distinct from grams | No | `DEC-067` | No | **BLOCKED** (on `DEC-067`) |
| Scaling | None | Yield concept | No | `DEC-069` v1-necessity | No | **BLOCKED** (on `DEC-069`) |
| Nutrient calculation (macro) | `mealNutrition.ts`, deployed | None for its current scope | No | None outstanding | No | **READY** |
| Micronutrient calculation | Calculation *shape* only (extends macro function) | Per-food micronutrient data entirely | **Yes** | Domain G dosing (`NEEDS JUDGMENT`, carried) | No direct | **NOT READY** |
| Restriction filtering | `excluded_food_ids` + `comboMatch.ts` filter (preference-grade) | Safety-grade taxonomy | No | §14.6's new decision | **Yes — the pass's one hard-blocker candidate** | **PARTIALLY READY** (preference only) |
| Meal composition | `Meal`/`MealItem`/`meal_entries`, working | Plan-vs-log differentiation (§14.2) | No | Whether that differentiation is ever needed | No | **PARTIALLY READY** |
| Shopping (recipe→list translation) | `lists`/`items`, fully wired as a destination | Recipe→Items population path + identity link | No | None outstanding beyond §14.3 | No | **PARTIALLY READY** |
| Pantry | None | Everything | No | Whether v1 needs it | No | **NOT READY** |
| Preparation | Knowledge only (Phase 8) | Any repo representation | No | `DEC-067` | No | **BLOCKED** (on `DEC-067`) |
| Storage | Knowledge only (Phase 8, `STRONG`/`ADEQUATE` non-batch) | Any repo representation | No | None single decision gates it — could ship at any detail level | Yes — storage-safety guidance is safety-relevant, not just convenience (§2.2) | **NOT READY** |
| Longitudinal feedback | `meal_entries`, real logging | None for logging itself | No | Adaptation policy (`DEC-070`, Domain O — carried-open, not new) | No new concern | **PARTIALLY READY** |

### 14.9 True Blockers vs. Soft Blockers vs. Deferrable vs. Human Decisions

**Hard blocker** (implementation cannot safely proceed without resolving):

- Treating `excluded_food_ids`, or anything built on it, as equivalent to allergy/medical-safety before a
  product/human decision distinguishes preference from safety-relevant restriction (§14.6). This is the
  one place this pass finds a real potential-harm path, not just incompleteness.

**Soft blockers** (can proceed with bounded scope):

- Food-identity unification (§14.3) — single-system features (nutrition-only, list-only, as shipped today)
  remain fine; only cross-system features (recipe→shopping, combo→pantry) are actually blocked.
- Recipe representation beyond `combos.json`'s current floor — today's bounded scope (macro totals +
  preference-grade filtering) already ships; going further is what's gated, on `DEC-067`.

**Deferrable dependencies** (useful later, not required for this milestone):

- Pantry/on-hand inventory.
- Yield/scaling and portion-as-distinct-from-grams.
- Micronutrient data and calculation.
- Pricing/store-availability data (carried from §12, not re-derived here).
- Meal Plan vs. Longitudinal Meal Entry differentiation (§14.2) — real, but nothing today actively breaks
  because of it; worth resolving before Domain O adaptation logic is ever built, not before.

**Human decisions** (cannot legitimately be resolved by inference):

- `DEC-067`'s preparation-detail level — still open, unchanged.
- `DEC-069`'s batch-production v1-necessity — still open, unchanged.
- **New this pass:** whether/how to distinguish allergy/intolerance/medical-restriction from dislike/
  preference in whatever exclusion mechanism the product uses — entangled with the still-blocked
  `DEC-099`/`100`.
- Whether pantry is a genuine v1 requirement — a product decision, not resolved here.

### 14.10 Recommended Implementation Order

The example order in the prompt (identity → composition → recipe → calculation → meal composition →
shopping → pantry → feedback) was checked against what's actually built, not assumed correct. **Two
corrections came out of that check:** nutrient calculation (macro) and meal composition are *already
working today*, independent of any recipe representation — they don't need to wait behind it, unlike the
example order implies. And the example order has no place for §14.6's newly surfaced safety decision,
which this evidence says belongs very early, not as an afterthought to restriction filtering.

**Recommended order:**

1. Resolve `DEC-067` and `DEC-069`'s v1-necessity — unchanged highest-leverage unblock from §13, repeated
   as a pointer, not re-derived.
2. Decide the preference/restriction/allergy-safety split (§14.6) — before restriction filtering is
   extended past today's bounded, already-labeled-as-preference-only combo filter.
3. Unify canonical food identity (§14.3) — unlocks cross-system correctness for shopping↔nutrition↔recipe
   alike; nothing downstream of this list is safe to build generally without it.
4. Extend food-composition coverage incrementally — already the right shape, just needs more rows.
5. Nutrient calculation — already `READY`; no architecture work implied, only more identity-resolved foods
   to run it over.
6. Recipe representation, portioning, scaling, preparation/storage metadata — all sit behind step 1's
   decisions; proceed once answered.
7. Shopping translation (`DEC-071`) — needs step 3, not the full depth of step 6; can target
   `combos.json`'s existing shape at v0.
8. Meal composition — already usable today independent of the above; resolve the plan/log differentiation
   (§14.2) opportunistically, not urgently.
9. Pantry — only if a deferred product decision says v1 needs it.
10. Longitudinal feedback policy (Domain O thresholds) — already carried-open from Phase 7/8, unaffected
    by this ordering.

### 14.11 Self-Audit — This Pass Specifically

- **Every claim about existing functionality was checked against actual repository evidence** — §14.2's
  table cites the specific file read for each of the nine named mechanisms, plus the newly discovered
  tenth (`NutritionView.tsx`), not recalled from §12's prior pass.
- **No hypothetical feature was described as existing.** Yield, Portion-as-distinct-concept, Preparation
  Method, Cooking Method, Pantry, and safety-grade Restriction are all explicitly marked absent, not
  partially built.
- **No schema was invented.** §14.3 and §14.7 answer entirely in terms of "what must resolve to what,"
  never a table or column.
- **No product decision was silently made.** `DEC-067`, `DEC-069`'s v1-necessity, the new preference/
  safety split, and pantry's v1-necessity are all listed as open in §14.9, not defaulted.
- **No safety boundary was weakened.** §14.6 argues the *opposite* of weakening — that today's
  undifferentiated exclusion list must not be treated as safety-adequate until a decision says otherwise;
  §14.3 argues fuzzy matching must stay out of anything safety-adjacent.
- **No stable DEC ID changed.** Every `DEC-###` cited above is reused from `APP_DECISION_INVENTORY.md` as
  already cited in §2; none invented, none renumbered.
- **No historical Phase 8 information was rewritten.** Nothing above touches
  `PRACTICAL_TRANSLATION_ANALYSIS.md`, `CULINARY_SOURCE_EXTENSION.md`, or
  `ON_COOKING_7E_EXECUTION_RECORD.md`.
- **`combos.json` was treated as existing evidence, not the final architecture** — stated explicitly at
  the end of §14.4, echoing §5's own governing principle.
- **The three (now: one shared transform, two key spaces, plus one independent fuzzy matcher) identity
  mechanisms were analyzed without prematurely merging them** — §14.2's `normalize()` row corrects last
  pass's looser framing ("three separate mechanisms") with the more precise finding that the *transform*
  is shared but the *key spaces* are not, and §14.3 recommends unifying identity resolution without
  proposing to merge the underlying category and nutrition data.
- **Macro-only nutrition data was not treated as complete food-composition data** — §14.5 states the
  micronutrient gap explicitly and declines to name specific nutrients or a source.
- **Shopping was not conflated with pantry** — §14.7 treats them as separate links in one chain and shows
  shopping can function without pantry existing at all.
- **Allergy/restriction/dislike were not conflated** — §14.6 is built entirely around the finding that the
  *current app* conflates them (in its own UI copy) and states plainly that this pass does not fix that
  conflation, only names it.
- **"Implementation ready" meant architecturally understood, not merely technically possible** — §14.8
  marks several technically-codeable-today items (recipe modification, substitution, storage) as
  `NOT READY` specifically because their domain boundaries aren't settled, not because the code would be
  hard to write.

---

## 15. Status — Updated After the Domain-Boundary Pass

**Phase 9, third milestone: domain-boundary and implementation-readiness analysis complete.** Still not
started: any implementation, schema, migration, or provider selection. Still open, unchanged: `DEC-067`,
`DEC-069`'s v1-necessity. **Newly surfaced, also left open:** whether/how to distinguish allergy/
intolerance/medical-restriction from dislike/preference in the exclusion mechanism (§14.6) — recommended
to be resolved early (§14.10 step 2), alongside rather than after the two already-open decisions, given
that it is the one hard-blocker-grade item this pass identified.

No further document is needed to carry this forward — this artifact continues to be extended in place,
per the same instruction §11 and §13 already recorded.

---

## 16. Human Decision Package — Phase 9 Domain Boundaries

**Trigger:** §14's domain-boundary pass surfaced three decisions with real architectural consequences —
two already open (`DEC-067`, `DEC-069`'s v1-necessity) and one newly discovered (§14.6's preference/
allergy conflation). This section packages all three for human decision, using freshly re-checked
`APP_DECISION_INVENTORY.md` and `DECISION_LOGIC_SPECIFICATION.md` text (not recalled from §2/§8) so each
package's "current state" is exact, not paraphrased. **None of the three is resolved below.** Where a
recommendation is offered, it is offered as advisory input to the human decision, not as this document
answering on the user's behalf.

### 16.1 Decision Package A — Canonical Food Identity

**Current state.** No canonical Food identity exists. `nutrition.name_tr` (a display string) is used as
a de facto identity by every consumer that needs one (`combos.json`'s `foodId`, `meal_entries.food_id`),
with no FK and no separate key. Three independent name-matching mechanisms exist (§14.2/§14.3) and share
no key space with each other or with the shopping list's item names.

**Evidence from repository:**
- `data/README.md` / `supabase/01-schema.sql`: `nutrition.name_tr` is both the row's display name and its
  only lookup key; `aliases[]` maps variant spellings onto it.
- `supabase/07-meal-entries.sql`'s own comment: `food_id` deliberately carries **no FK** to `nutrition`,
  "so a nutrition row can be renamed/removed independently of past meal entries" — an accepted,
  documented risk of using a display string as an identity anchor.
- `src/components/NutritionView.tsx`: shopping-list items are matched to nutrition rows by
  exact-normalized `item.name`, with no fuzzy fallback — a live feature that already silently loses data
  (`missing` list, console-only) whenever a list item's name and its nutrition counterpart diverge even
  slightly.
- `src/lib/fuzzyMatch.ts` (`isCloseMatch`): a working, safe fuzzy matcher already exists — but only
  for shopping-list catalog dedupe, never for nutrition or safety-adjacent lookups.

**Problem.** Every cross-system feature this architecture depends on — recipe→shopping translation
(`DEC-071`), substitution (`DEC-063`), restriction filtering at the identity level (`DEC-061`) — requires
resolving "is this the same food?" correctly. Today that question is answered three different,
non-communicating ways, and the one place two of them actually meet (`NutritionView.tsx`) already shows
the failure mode: silent, unlogged-to-the-user data loss on any spelling mismatch.

**Why Food is sufficient as the canonical identity, and Ingredient does not need a separate one:**
repo evidence never treats "ingredient" as anything other than "a Food referenced with a quantity" —
`combos.json`'s `items[].foodId` and `meal_entries.food_id` both resolve straight through the same
identity a bare nutrition lookup would use. Introducing a second "Ingredient" identity would duplicate
Food without a demonstrated need (§14.1). **Recipe Ingredient** stays a derived relationship — the
(Food × quantity) pairing inside a Recipe — never an identity of its own; this requires no decision to
preserve, since nothing in the repository or the decision model treats it otherwise.

**Limitations of using a display string as identity** (named, not treated as disqualifying): renaming a
food's display name changes its identity unless a mapping layer is added; there is no way today to
correct a typo'd `name_tr` without either breaking every existing reference or accepting the rename as a
new, disconnected identity; two different real-world foods could theoretically collide if their names
happen to normalize identically (not observed, but not structurally prevented either).

**Where canonical identity must be authoritative (exact match only, §14.3):** Food ↔ Nutrient Profile;
Food ↔ Restriction/Allergen exclusion (not yet built, but must be exact once it is); Recipe Ingredient ↔
Food. **Where fuzzy matching is explicitly prohibited:** anywhere a match feeds a nutrient calculation, an
exclusion/allergen check, or a substitution decision — a false-positive match there could silently
misattribute nutrition or let an excluded food through under a near-spelling. **Where fuzzy matching is
acceptable:** shopping-list catalog dedupe and autocomplete only (`isCloseMatch`'s existing, narrow scope)
— its worst-case failure is a wrong autocomplete grouping, never a nutrient or safety error.

**Implications:**
- *Nutrition calculation* — already safe today (exact-match only), but coverage is incomplete: any list
  item whose name doesn't exactly normalize-match a `nutrition` row or alias silently gets no nutrition,
  not wrong nutrition. Resolving identity would close that coverage gap without changing the calculation
  logic itself (`mealNutrition.ts` is unaffected either way).
- *Exclusions/restrictions* — cannot be safety-grade without exact identity resolution first (§14.6); a
  missed or fuzzy match here is the specific failure mode that would let an excluded food through
  unrecognized.
- *Substitutions* — `DEC-063`'s "preserve the original nutrient contribution" requirement is only checkable
  if both the original and the substitute resolve to an exact, identity-linked composition row.
- *Shopping-list matching* — `DEC-071`/`072` cannot correctly translate a recipe ingredient into a list
  item, or reconcile a list against pantry, without a shared identity between "what a recipe calls this"
  and "what the shopping list calls this" — confirmed unbuilt (§14.7).

**Options:**

| Option | Description | Consequences |
|---|---|---|
| A1 — Keep `name_tr` as the anchor, add an explicit mapping/alias layer for cross-system resolution | Extend the existing alias mechanism so shopping-list and future recipe ingredient names resolve through it too, without introducing a new key | Cheapest to reason about; inherits the display-string-as-identity limitation (renames still require care) |
| A2 — Introduce a Food identity distinct from its display name | A stable key that display name, aliases, and cross-system references all point at | Removes the rename fragility; is a real new domain concept, not just a data-model tweak — the kind of change this pass is not authorized to schema-design |
| A3 — Defer identity unification entirely | Keep the three mechanisms independent, accept today's silent-miss behavior as a known limitation | No architecture work now; every cross-system feature (`DEC-063`, `071`, `072`) stays blocked exactly as §12/§14 already found |

**Safety implications:** identity is a prerequisite for §16.2's taxonomy to be enforceable at all — a
correct taxonomy applied through a broken identity match is not actually safe (§14.3, §14.6).

**Dependencies:** upstream of restriction filtering, substitution, and shopping translation (§16.4).
Independent of, and does not need to wait for, `DEC-067`/`DEC-069`.

**Recommendation, if appropriate:** A1 is the smallest step that removes the *NutritionView.tsx*-observed
failure mode without inventing a new concept; A2 is worth revisiting only if A1's rename fragility proves
costly in practice. This is offered as input, not a resolution.

**What remains a human decision:** whether to pursue A1, A2, or A3, and on what timeline — not decided
here.

### 16.2 Decision Package B — Safety / Exclusion Taxonomy (highest priority)

**Current state, exact.** `personal_plan.excluded_food_ids text[]` (`supabase/10-personal-plan-
exclusions.sql`) is a single flat array. Its own migration comment describes it as covering "allergies,
dislikes" without distinguishing them. It is populated exclusively through `PersonalPlanView.tsx`'s
"Önerilmesin" section, whose copy reads: *"Sevmediğin veya yiyemediğin besinleri işaretle"* — "Mark foods
you dislike **or can't eat**." Both reasons write into the same array. It is read in exactly one place,
`comboMatch.ts`'s suggestion filter — never by `NutritionView.tsx`, never by the shopping list, never by
any allergen-specific code path.

**Where the conflation exists, precisely:** `src/components/PersonalPlanView.tsx` (the "Önerilmesin"
section, single free-text-search-and-tag UI for both reasons) and `src/components/
OnboardingQuickSetup.tsx` (a code comment there independently confirms `excludedFoodIds` is collected as
one undifferentiated list even during onboarding). No code path anywhere distinguishes *why* a food is in
the array.

**The problem is not what it first appears to be.** It is *not* that Grocery's decision model lacks a
taxonomy for this. Re-checking `APP_DECISION_INVENTORY.md` and `DECISION_LOGIC_SPECIFICATION.md` directly
for this pass found the opposite:

- **`DEC-053`** (Domain I, `SPECIFIED` §3.9) already specifies a three-way self-report triage:
  *"Intolerance — soft constraint"* / *"Allergy — hard exclusion"* / *"Unclear — flag for clinical
  confirmation."* Its own notes are explicit that this is a **provisional, self-reported triage, not a
  diagnosis** — true allergy diagnosis is out of scope by design, not by omission.
- **`DEC-061`** (Domain K, `SPECIFIED` §3.11) already specifies that `DEC-053`'s classification
  hard-excludes or soft-constrains candidates, and that **disclosed preferences filter further** — i.e.,
  preference is already modeled as a distinct, weaker, later step than allergy/intolerance, not the same
  operation.
- **`DEC-038`** (Domain F, `SPECIFIED` §3.3) already specifies disclosed dietary pattern/restriction
  (vegan, low-carb, ketogenic, etc.) as its own decision, feeding both macro allocation and, downstream,
  `DEC-060`/`061`.
- **`DEC-099`/`100`** (Domain Q, **BLOCKED**, not reopened here) already own "medical/clinical
  restriction" as a category — deliberately fenced off, not silently absorbed into any of the above.

**So: the decision model already contains the necessary distinction for allergy, intolerance, preference,
and dietary pattern.** The actual problem is that Grocery's shipped implementation never built `DEC-053`
at all, and instead built only a flattened version of `DEC-061`'s "preferences filter further" half —
collapsing categories the decision model had already kept separate. This reframes the fix from "invent a
taxonomy" to "stop silently discarding one that was already specified."

**One category with no existing home, found by checking rather than assumed absent:** *temporary
exclusion* (time-boundedness — e.g., "avoiding this while testing a suspected intolerance," a
Ramadan-style temporary pattern) has no corresponding `DEC-###`. `DEC-054` (Domain I) comes closest — a
4–6-week re-test interval for *fixed vs. adapting GI tolerance* — but that governs when to *revisit* a
classification, not a user-declared temporary exclusion. This is flagged as a **possible new decision
candidate**, not created, not numbered, and not required to resolve the other six categories.

**Category behavior, per the decision model as already specified (not invented here):**

| Category | Existing DEC ID | Effect | May be inferred from another? |
|---|---|---|---|
| Preference / dislike | `DEC-061` ("preferences filter further") | **Ranking/soft** — narrows suggestions, not a hard block | No — must be explicitly disclosed, not inferred from an allergy |
| Allergy | `DEC-053` ("hard exclusion") | **Hard-filter** — no exception | No — must not be inferred from a bare exclusion or a dislike |
| Intolerance | `DEC-053` ("soft constraint") | **Soft-filter**, per the decision model's own already-made call — notably *not* hard, unlike a plain reading of "can't eat" might assume | No — must come from `DEC-053`'s own triage, not inferred from an allergy or a preference |
| Unclear (self-report ambiguous) | `DEC-053` ("flag for clinical confirmation") | **Escalation** — the app must not silently resolve this either way | N/A — this bucket exists precisely because inference is unsafe |
| Medical/clinical restriction | `DEC-099`/`100` (**BLOCKED**) | Must defer entirely; not to be handled by app logic until those resolve | No — must not be approximated by any of the above |
| Dietary pattern | `DEC-038` | Structural — adjusts macro allocation and filtering; not itself safety-relevant | Not established either direction by the decision model |
| Temporary exclusion | **None** — possible new candidate | Unresolved | Unresolved |

**Do NOT assume every category needs a separate database entity** (per the user's instruction) — the
table above is a *behavioral* distinction (hard-filter vs. soft-filter vs. escalate vs. structural), not a
prescribed set of tables; how many storage shapes that collapses into is an implementation question for
later, not decided here.

**Options** (for how the product responds to this finding — not for the taxonomy itself, which the
decision model already supplies):

| Option | Description | Consequences |
|---|---|---|
| B1 — Build `DEC-053`'s triage now, before extending any exclusion-consuming feature | Ask users to classify each exclusion (dislike / intolerance / allergy / unclear) using `DEC-053`'s own three-way output | Directly closes the §14.6 hard blocker; scoped, since `DEC-053` is already fully specified — no new nutrition-science content required |
| B2 — Keep the flat list, but stop calling it (or treating it as) safety-relevant anywhere | Rename/reframe the existing mechanism as preference-only, explicitly not for allergy/medical use, until B1 is done | Removes the immediate risk without new build work; requires a product/UX decision to change or caveat the current "yiyemediğin" copy |
| B3 — Do nothing now | Leave `excluded_food_ids` as-is, undocumented as to reliability | Not recommended — this is the option that leaves the hard-blocker-grade risk from §14.6/§14.9 live |

**Architectural consequences:** B1 requires the identity work in §16.1 to be safety-grade first
(§14.3/§14.6) — building a correct taxonomy on top of unresolved identity would not actually be safe.
B2 requires no new domain concept, only a product/UX decision.

**Safety implications:** this is the pass's one hard-blocker-grade item (§14.6/§14.9, reconfirmed here
with exact decision-model citations). A false negative (an allergen shown as safe) is explicitly named in
`DEC-061`'s own framing as a real-harm failure mode, not a UX defect.

**Dependencies:** downstream of §16.1 (identity) for any safety-grade implementation; independent of
`DEC-067`/`DEC-069`.

**Recommendation, if appropriate:** at minimum, adopt B2 immediately (a product/copy decision, not an
architecture change) so the current mechanism is not mistaken for allergy-safe while B1 is scoped; treat
B1 as the substantive fix, reusing `DEC-053` rather than drafting a new taxonomy, since none is needed for
six of the seven categories the user asked about.

**What remains a human decision:** whether/when to build `DEC-053`; whether B2's reframing happens in the
interim; whether "temporary exclusion" warrants a new decision candidate. None of these is resolved here.

### 16.3 Decision Package C — Recipe Depth and Batch-Production Scope

#### `DEC-067` — Preparation-detail level

**Current state, exact.** `DEC-067` (Domain L, **BLOCKED** at Phase 7 alongside the rest of Domain L, per
`GAP-A`) asks the app to choose among recipe-level / ingredient-list-level / general-guidance-only detail.
Its own inventory notes: *"Recipe/preparation-detail decisions have no direct counterpart in the 213-topic
universe... flagged for Section 11"* — i.e., this was never going to be answered by the nutrition
corpus; it was always a product question. Phase 8 added On Cooking 7e evidence that the *knowledge* to
support any of the three levels exists (`STRONG` for recipe-level, per Ch.4); it did not, and could not,
pick one.

**Evidence from repository:** `data/combos.json` already ships at the *ingredient-list* level (name +
{food, grams} lines + a rough `prepMinutes` number) — no method, no steps. This is the only real evidence
of what Grocery has actually chosen to expose so far, informally, not as a `DEC-067` resolution.

**Options, compared for architectural consequence, not chosen:**

| Option | What it requires that doesn't exist today | What already exists that it can reuse |
|---|---|---|
| **General guidance only** | Almost nothing new — a step below `combos.json`'s current shape | Everything already shipped |
| **Ingredient-list-level** (current de facto floor) | Portion (only if human-scale units are wanted over raw grams), possibly Yield if scaling is wanted | `combos.json`, `mealNutrition.ts`, `comboMatch.ts` — all already work at this level |
| **Structured/standardized-recipe-level** (On Cooking Ch.4 shape: ingredients + method + yield + portions + variations) | Preparation Method, Cooking Method, Yield, Portion, and a materially larger `combos.json`-successor structure — all currently `FUTURE/OPTIONAL` per §14.1 | Only the ingredient-list floor; everything else is new |
| **Recipe modification only** (no construction — Grocery adapts a recipe the user already has, rather than generating one) | A different engine shape entirely: substitution/scaling logic applied to arbitrary user-supplied input, not a construction pipeline off `DEC-060`–`066`'s candidate-food chain | Substitution's *knowledge* (Phase 8, §5 primitives); nothing of `combos.json`'s construction shape carries over directly |

**Architectural consequences:** the further right along this table the product goes, the more of §14.1's
`FUTURE/OPTIONAL` concepts (Yield, Portion, Preparation Method, Cooking Method) become load-bearing rather
than deferrable. "Recipe modification only" is architecturally distinct from the other three, not simply
a smaller version of them — it does not build on `DEC-060`–`066`'s construction chain at all, per §7
point 3's own construction-vs-modification distinction, already established in Phase 8/9.

**Safety implications:** none directly from the detail-level choice itself; but whichever level is chosen,
it inherits §16.2's restriction-filtering requirement once it exposes anything beyond what `comboMatch.ts`
already filters today.

#### `DEC-069` — Batch/leftovers/storage scope

**Current state, exact.** `DEC-069` (Domain L, **BLOCKED**, `GAP-A`) asks how batch cooking, leftovers,
and storage are incorporated into a multi-day plan. Phase 8's own finding (`ON_COOKING_7E_EXECUTION_RECORD.md`
§6, cited already at §3/§4.5 above) is that scaling, yield/portion conversion, and storage/preservation
are `STRONG`/`ADEQUATE` in the knowledge corpus, while true **quantity-food** (restaurant/professional-
scale) batch production is confirmed **absent**, a named bounded limitation.

**Options, compared without assuming the largest one:**

| Option | Knowledge support (Phase 8) | What it requires architecturally |
|---|---|---|
| **Household-scale recipe scaling only** (e.g., "serves 4" → "serves 2") | `ADEQUATE`/`STRONG` | Yield concept (§14.1) — a single scale factor applied to a recipe's ingredient quantities; the smallest addition |
| **Meal-prep / batch cooking** (make-ahead across several days, storage-aware) | `ADEQUATE`/`STRONG` for the storage/scaling parts | Yield, plus a storage/preservation metadata concept (§14.1's Preparation Method-adjacent); no new knowledge source needed |
| **True restaurant/professional-scale batch production** | Confirmed **absent** (`PARTIAL` rating, Phase 8) | A ninth knowledge source or an explicit, deliberate scope narrowing — Phase 8's own conditional (§11.2) says this is the one path that would reopen a knowledge question, not just a product one |

**Explicitly not assumed:** restaurant-scale production is not treated as in-scope merely because On
Cooking 7e contains professional-kitchen chapters — this is the same "chapters existing ≠ chapters in
scope" rule already binding since `CULINARY_SOURCE_EXTENSION.md` §5 rule 4 and restated at §7 point 6
above. Nothing about the corpus's *content* answers this scope question.

**What changes if restaurant-scale production is included:** per §11.2's own conditional, this becomes
the first candidate for a Gate-7-adjacent review — a knowledge question reopens, not just an architecture
one, since the corpus does not currently support it. Every other option in the table stays within Phase
8's already-established knowledge boundary.

**Dependencies (both `DEC-067`/`069`):** both gate Portion, Yield, Preparation Method, and Cooking Method
directly (§14.1, §14.8) and, through those, gate Storage's representation. Neither depends on §16.1 or
§16.2 to be *decided*, but any resulting implementation would still need §16.1's identity work to be
correct and §16.2's taxonomy to be safe.

**What remains a human decision:** both `DEC-067` and `DEC-069`'s v1-necessity, exactly as left open at
§8 and §13. Not resolved here.

### 16.4 Cross-Dependency Analysis

The chain the user asked to check — **Food identity → restriction filtering → substitution → recipe
construction → portioning → scaling → shopping** — was checked link by link against what §14 already
established, rather than assumed correct:

- **Food identity → restriction filtering:** holds, and is a hard dependency (§14.3/§14.6) — restriction
  filtering cannot be safety-grade without it.
- **Restriction filtering → substitution:** holds — `DEC-063` substitution must not silently cross a
  restriction boundary (already stated at §2.1's own safety-boundary note on `DEC-063`).
- **Substitution → recipe construction:** **does not hold as a hard dependency.** Substitution operates on
  a candidate food (`DEC-062`'s ranked list), not on an assembled recipe — a v1 recipe could simply omit
  an unavailable ingredient or prompt the user, without any substitution engine existing yet. The linear
  chain overstates this link.
- **Recipe construction → portioning:** holds, but only because `DEC-067`'s answer is what determines
  whether Portion needs to exist as a concept distinct from raw grams at all (§14.1) — this is a decision
  dependency, not a data dependency.
- **Portioning → scaling:** holds in the sense that Yield/scaling (`DEC-069`) is meaningless without a
  portion/quantity concept to scale — but scaling does not require portioning to go beyond grams; grams
  alone are sufficient to scale, per `combos.json`'s existing shape.
- **Scaling → shopping:** **does not hold as a hard dependency**, and this is the second place the linear
  chain overstates itself. Per §14.7, shopping translation (`DEC-071`) only needs an identity-resolved
  ingredient+quantity list — even `DEC-067`'s narrowest answer (ingredient-list-level, already shipped in
  `combos.json`) would supply that. Shopping does not need scaling, portioning, or a resolved `DEC-069` to
  proceed.

**Corrected dependency picture:** Food identity (§16.1) and the safety taxonomy (§16.2) are the two true
upstream, foundational decisions — nearly everything else depends on one or both. `DEC-067` gates recipe
depth, portioning, and preparation/storage representation, but **not** shopping's minimal case. `DEC-069`
gates only scaling/yield and, downstream of that, meal-prep-style batching — it is the most deferrable of
the three, confirmed by its already-`OPTIONAL` `App Priority` in `APP_DECISION_INVENTORY.md` (unlike
`DEC-067`'s `IMPORTANT`).

**No circular dependency was introduced or found.** Identity and taxonomy are each other's peers, not
each other's prerequisites at the *decision* level (deciding the taxonomy's categories doesn't require
identity to be resolved first; only *implementing* it safely does) — stated explicitly so this isn't
mistaken for a cycle.

**Upstream (resolve first):** Food identity (§16.1), safety taxonomy (§16.2, highest priority per the
hard-blocker finding). **Can be deferred relative to the others:** `DEC-069`'s batch-production depth;
shopping translation's *full* depth (though not its minimal case, which only needs identity). **Gates a
specific downstream slice, not the whole chain:** `DEC-067` (recipe depth, portioning, preparation/
storage — not shopping's minimal case, not substitution).

### 16.5 Self-Audit

- **No code was changed.** This section is documentation only.
- **No stable IDs changed.** `DEC-053`, `061`, `038`, `063`, `067`, `069`, `099`/`100` are all cited
  exactly as they appear in `APP_DECISION_INVENTORY.md`/`DECISION_LOGIC_SPECIFICATION.md`, re-read for
  this pass, not recalled. No new ID was created; the one candidate gap (temporary exclusion) is flagged,
  not numbered.
- **No human decision was silently made.** §16.1's identity options, §16.2's B1/B2/B3, and §16.3's
  `DEC-067`/`069` option tables are all left open; recommendations are labeled as such, not as decisions.
- **Safety semantics are explicit.** §16.2's table states hard-filter vs. soft-filter vs. escalate vs.
  structural for every category, sourced to an exact decision citation, not inferred.
- **Food identity is separated from display names.** §16.1 states this as the central problem, not a
  detail — `name_tr` is named explicitly as a display string doing double duty.
- **Fuzzy matching boundaries are explicit.** §16.1 restates §14.3's safe/unsafe split by name.
- **Preference is not conflated with exclusion.** §16.2 treats "exclusion" as the mechanism/operation, and
  preference/allergy/intolerance/pattern as the reasons that mechanism can be triggered by — not as
  synonyms.
- **Allergy/intolerance/clinical restrictions are not treated as ordinary preferences.** §16.2's table
  gives each a distinct effect (hard-filter / soft-filter / deferred-entirely), sourced to `DEC-053`/
  `099`/`100`, not defaulted to the same behavior as a dislike.
- **Recipe construction is not conflated with recipe modification.** §16.3's `DEC-067` table lists
  "recipe modification only" as architecturally distinct from the three construction-depth options, per
  §7 point 3's already-established construction-vs-modification line.
- **Household batch preparation is not conflated with restaurant-scale production.** §16.3's `DEC-069`
  table separates all three explicitly and states plainly that On Cooking's professional content does not
  by itself justify the largest option.
- **Phase 8 remains CLOSED.** Nothing above edits `PRACTICAL_TRANSLATION_ANALYSIS.md`,
  `CULINARY_SOURCE_EXTENSION.md`, or `ON_COOKING_7E_EXECUTION_RECORD.md`; all citations from them are
  read-only references.

---

## 17. Decision-to-Implementation Reconciliation Audit — `DEC-038` / `DEC-053` / `DEC-061`

**Trigger:** §16.2's finding that the decision model already distinguishes allergy, intolerance,
preference, and dietary pattern, while the application appears to collapse them. This section traces all
three decisions into actual code to establish **exactly what is wrong before anything is changed.** No
code, schema, DEC definition, or `excluded_food_ids` behavior was modified; no DEC ID was created.

**Two corrections to this document's own earlier sections, stated up front rather than buried.** Both are
errors in §14/§16 found by this pass's deeper trace. Per the precedent set at §0.1 and §12.1, the earlier
sections are **not rewritten** — these supersede them for anyone reading forward:

1. **§14.4 and §14.7 were wrong that no Recipe→Shopping-List path exists.** One does:
   `TodayView.tsx`'s `addComboToList()` (lines 143–147) iterates `combo.items` and calls
   `onAddItem(item.foodId, "<grams>g")`, wired in `App.tsx` to `createListActions`' `addItem`. The
   earlier claim was based on grepping `src/lib/listActions.ts` (which indeed has no combo/nutrition
   references) — but the wiring is component-level, passed as props. `combos.json`'s shopping-list
   expansion should have been classified **CURRENTLY SUPPORTED**, not `REQUIRES NEW DOMAIN CONCEPT`.
2. **§14.3 and §16.1 were wrong that fuzzy matching "never touches nutrition or exclusion data."** The
   path in correction 1 feeds nutrition-derived food identities straight into the fuzzy key space:
   `addItem()` (`listActions.ts:40–72`) runs `findCanonicalName(name, catalog)` and an `isCloseMatch`
   comparison against existing items, so a combo ingredient's `foodId` **can be silently rewritten to a
   near-spelling already established in that household's shopping catalog**. The boundary this document
   twice described as already respected is in fact already crossed at exactly one point. Scoped
   precisely: this affects the *shopping-list line's name and its re-matching* (`isComboOnList`,
   `removeComboFromList`), **not** the exclusion decision itself, which runs upstream on exact `foodId`
   equality in `comboMatch.ts`.

### 17.1 What Was Inspected

`src/components/PersonalPlanView.tsx`, `OnboardingQuickSetup.tsx`, `TodayView.tsx`, `MealFoodPicker.tsx`,
`NutritionView.tsx`; `src/hooks/useMealPersonalization.ts`, `useRemainingToday.ts`, `useFoodCatalog.ts`;
`src/lib/mealPersonalization.ts`, `personalPlan.ts`, `comboMatch.ts`, `listActions.ts`, `fuzzyMatch.ts`,
`combos.ts`; `src/App.tsx` (prop wiring); `netlify/functions/personal-plan.ts`;
`supabase/08`–`10-personal-plan*.sql`; `data/nutrition.json`, `data/combos.json`, `data/README.md`.

### 17.2 Collection Surfaces — Where Each Concept Is (and Is Not) Collected

| Concept | Collected where? | Evidence |
|---|---|---|
| Food preference / dislike | `PersonalPlanView.tsx`, "Önerilmesin" section (search box → tag list) | `addExclusion()` → `update("excludedFoodIds", …)` |
| Exclusion (the mechanism) | Same one surface — the only exclusion input in the app | Grep for `excludedFoodIds`: only `PersonalPlanView`, `OnboardingQuickSetup` (placeholder `[]` only), `TodayView` (read) |
| **Allergy** | **Nowhere as a distinct input** — but *solicited* into the same box by the copy "veya yiyemediğin" | No allergy field in `PersonalProfile`, `personal_plan` schema, or the API's validation |
| **Intolerance** | **Nowhere** | Same as above; no `DEC-053` triage UI exists |
| **Dietary pattern** | **Nowhere** | `PersonalProfile` has no pattern field; `calculateTargets()` takes no pattern input |
| Medical/clinical restriction | Nowhere (correctly — `DEC-099`/`100` are BLOCKED) | Only a static blanket disclaimer, §17.6 |

**Vocabulary bound, found by inspection:** `PersonalPlanView`'s exclusion search filters
`useFoodCatalog()`'s rows — i.e. **a user can only exclude foods that already exist in the `nutrition`
table.** The inspectable seed (`data/nutrition.json`) holds 64 rows; the live Supabase table is the actual
source of truth and may differ, since the Besin tab writes to it. In the seed there is no "yer fıstığı"
(peanut) row at all, and no standalone "süt" (milk) row — so those exclusions are simply not expressible
through this UI. The server (`netlify/functions/personal-plan.ts:125–127`) accepts any string array
without checking that entries resolve to real foods.

### 17.3 The Four Semantic Pipelines

Traced as `User input → stored representation → decision logic → filtering/selection → downstream`.

**Preference / dislike — `PARTIALLY IMPLEMENTED`**
`PersonalPlanView` "Önerilmesin" → `excludedFoodIds: string[]` (values are `nutrition.name_tr` display
strings) → `useMealPersonalization` (localStorage cache + 600 ms-debounced `PUT /api/personal-plan`) →
`personal_plan.excluded_food_ids text[]` → `useRemainingToday` → `TodayView` → `comboMatch.scoreAllCombos`
→ *a combo is dropped entirely if any of its items' `foodId` is in the list*. Matches `DEC-061`'s
"disclosed preferences filter further" in spirit, and errs conservative (drops rather than de-ranks). But
it is implemented at **exactly one surface**: `MealFoodPicker` ("Besin ekle" in Yemek Planı) offers the
full catalog unfiltered, `NutritionView`/`AllFoodsBrowser` show everything, and the shopping list applies
nothing.

**Allergy — `NOT IMPLEMENTED`** (the aggravating detail: *input for it is actively solicited anyway*)
No collection, no representation, no distinct behavior. `DEC-053` specifies allergy → **hard exclusion**;
the application has no hard-exclusion concept at all. Whatever a user enters because they "can't eat" it
lands in the same array as a dislike and receives the same suggestion-layer-only treatment.

**Intolerance — `NOT IMPLEMENTED`**
Same absence. Note the asymmetry this creates: `DEC-053` specifies intolerance as a **soft constraint**,
so today's flat "drop the whole combo" behavior is *stricter* than specified for intolerance (a utility
cost, not a safety risk) while being *far weaker* than specified for allergy (a safety risk). The single
flattened mechanism is simultaneously too strict for one category and too weak for another.

**Dietary pattern — `NOT IMPLEMENTED`**
`DEC-038` specifies a disclosed pattern (vegan, low-carb, ketogenic…) adjusting macro allocation and
feeding `DEC-060`/`061`. `calculateTargets()` derives everything from weight/height/age/sex/activity/goal
only. The **only** trace of the concept anywhere is `data/combos.json`'s `tags` (three rows tagged
`"vejetaryen"`) — and `tags` is parsed into the `Combo` type in `TodayView.tsx:30` and then **never read
again** anywhere in the codebase. `data/README.md` already says as much: "free-form, not filtered on yet."
Inert data, not an implementation.

**`DEC-053`'s "unclear" outcome — `NOT IMPLEMENTED`**
No escalation or flagging path exists per disclosure. The nearest thing is a static blanket disclaimer
inside a collapsed panel (`PersonalPlanView.tsx:374–378`: consult a dietitian/physician in cases of
medication, chronic illness, pregnancy, breastfeeding, or eating-disorder history) — a Domain-C-flavored
general caveat, **not** `DEC-053`'s per-disclosure routing.

### 17.4 `DEC-053` Focus — Can the Application Execute the Specified Decision?

**No.** Not because the logic is hard, but because the required representation does not exist: executing
`DEC-053` requires (a) capturing a *reason* per disclosed food, (b) a place to store that reason, and
(c) at least two distinct downstream behaviors (hard vs. soft) plus an escalation route. The application
has none of the three — one reasonless array and one behavior.

**What "soft constraint" means at the decision-model level** (quoted, not reinterpreted): `DEC-053`
outputs "Intolerance — soft constraint" and `DEC-061` consumes it as "hard-excludes **or**
soft-constrains candidates," with disclosed preferences filtering further. The model therefore already
says intolerance should narrow or de-prioritise rather than absolutely forbid, while allergy absolutely
forbids. **What the product actually does:** one uniform, absolute drop at the suggestion layer only,
with no enforcement anywhere else. **Are the two consistent?** No — and the inconsistency runs in *both*
directions simultaneously (§17.3).

**Flagged for human review, not resolved here:** whether "intolerance = soft constraint" is the intended
posture for Grocery specifically. It is a defensible clinical-triage stance (intolerance severity is
dose-dependent), but the current UI collects "yiyemediğin" (foods you cannot eat) — wording under which a
user may reasonably enter an intolerance expecting absolute avoidance. Anything stricter or looser than
`DEC-053`'s existing text is a human decision (§17.10 Q1). **No clinical rule or threshold was invented
here, and `DEC-053` was not changed.**

### 17.5 `excluded_food_ids` — Semantic Audit

| Property | Finding |
|---|---|
| Source | Exactly one UI: `PersonalPlanView`'s "Önerilmesin" section. Onboarding never writes it (passes `[]` as a validation placeholder only) |
| Persistence | `personal_plan.excluded_food_ids text[] not null default '{}'`, **per user**, plus a device-local `localStorage` cache |
| Consumers | Exactly one: `comboMatch.ts` (`scoreAllCombos` → `matchCombos`), reached via `useRemainingToday` → `TodayView` |
| Identity basis | `nutrition.name_tr` display strings; no FK, no validation server-side, no resolution against aliases |
| Preference-oriented? | Yes — its only implemented behavior is suggestion filtering |
| Safety-oriented? | **No** — no hard exclusion, no enforcement outside combo suggestions, no allergen semantics |
| Semantic collision | **Yes, confirmed.** One field carries at minimum: dislike, "cannot eat" (allergy and/or intolerance, indistinguishable), and — by the migration comment's own words — "allergies, dislikes" |

**A scope mismatch worth naming separately:** exclusions are stored **per user** (`personal_plan` is keyed
by `app_users.id`), while the shopping list and its combo-driven population are **per household**. A combo
filtered against one user's exclusions can be pushed by `addComboToList` onto a list shared with household
members whose own exclusions were never consulted. This is an observation about existing scoping, not a
proposed rule.

**Not redesigned here**, per instruction — only documented.

### 17.6 UI Audit — What the User Is Actually Asked to Express

Heading: **"Önerilmesin"** ("Don't suggest this"). Body copy: *"Sevmediğin veya yiyemediğin besinleri
işaretle — öneriler bunları hiç göstermez"* ("Mark foods you dislike **or cannot eat** — suggestions will
never show them"). One search box, one tag list, one array. Mapping the user's possible intents against
what the data can express:

| User intent | Expressible? | What actually happens |
|---|---|---|
| "I dislike this" | Yes | Combo suggestions containing it are dropped |
| "I don't want this" | Yes | Identical handling |
| "I cannot eat this" | Entered, **not distinguished** | Identical handling — no hard exclusion |
| "I have an allergy" | No dedicated input | Falls into the same array; the promise "öneriler bunları hiç göstermez" is true *only* for combo suggestions, not for `MealFoodPicker`, the food browser, or the shopping list |
| "I have an intolerance" | No dedicated input | Same |
| "I follow this dietary pattern" | **No** | Nothing to enter; no macro or filtering effect |

The copy's promise is scoped to suggestions and is accurate *for suggestions*. The safety-relevant gap is
that a user reading "yiyemediğin" may reasonably infer app-wide protection that does not exist.

**Second-order finding — exclusion granularity.** Exclusion is per **food row**, so it cannot express an
allergen *class*. In the inspectable seed, a tree-nut allergy would require separately excluding `badem`,
`ceviz`, and `fındık`; a dairy allergy would require `yoğurt`, `beyaz peynir`, `kaşar peyniri`,
`eski kaşar`, `krem peynir`, `tereyağı` — and would still not cover any dairy row added to the table
later. Neither `DEC-053` nor `DEC-061` specifies the *unit* of exclusion (item vs. class), so this is not
a spec violation — it is a genuinely unsettled representation question (§17.10 Q3).

### 17.7 Minimum Required Correction — Classification

**Is this a missing product implementation, a data-model problem, a decision-logic problem, or a
combination?** Evidence says: **a missing product implementation first, a data-model problem second, and
explicitly *not* a decision-logic problem.** `DEC-038`, `DEC-053`, and `DEC-061` are all `SPECIFIED` and
unambiguous about the required behaviors; nothing in the decision layer needs to be written or changed to
know what should happen.

| Correction type | Needed? | Why |
|---|---|---|
| UI/data-collection correction | **Yes — primary** | The reason behind an exclusion is never asked for; `DEC-053`'s triage has no input surface. Also covers the copy's over-broad promise (§16.2's B2) |
| Mapping correction | **Yes** | Exclusion values are unvalidated display strings; nothing maps them to a resolved food identity (§16.1) |
| Representation correction | **Yes — secondary** | One field carrying ≥3 meanings, plus no way to express an allergen class |
| Decision-engine integration correction | **Yes** | Only one of `DEC-061`'s inputs is wired, at one of many surfaces; `DEC-038` is wired nowhere |
| New domain concept | **Only one candidate** — allergen *class/grouping* (§17.6). Not settled by any existing DEC |
| Genuinely new DEC decision | **No** — for allergy/intolerance/preference/pattern. `DEC-053`/`061`/`038` already cover them |

### 17.8 Temporary Exclusion — Investigated, Not Created

Searched the decision model rather than assumed. The closest existing semantics: **`DEC-054`** (fixed vs.
adapting GI tolerance — a recommended 4–6-week re-test interval before revisiting a "fixed constraint"
classification) and **`DEC-011`**'s ~3–6-month profile-staleness window. Both establish that a
classification may be *revisited over time*; neither represents a **user-declared, time-bounded
exclusion**, and `DEC-054` is scoped to GI tolerance (Domain I), not to arbitrary food exclusions.

**Assessment:** temporary exclusion is not a missing *category* — it reads as a possible *attribute*
(a validity window) on an exclusion that already has a category. Nothing in the repository or the decision
model currently requires it. **Documented as a candidate only; no DEC ID was created, and none is
proposed as necessary on current evidence.**

### 17.9 Human Review — Only What Existing Evidence Cannot Answer

Deliberately excludes anything already settled by `DEC-038`/`053`/`061` (their category definitions and
hard/soft behaviors are not re-asked below).

1. **Is `DEC-053`'s "intolerance = soft constraint" intentional and acceptable for Grocery?** The decision
   model says soft; the current UI collects "foods you cannot eat," under which a user may expect absolute
   avoidance. Evidence establishes the mismatch but cannot establish the intent. *(Consequential safety
   decision — this pass stops here rather than choosing.)*
2. **Does temporary exclusion require a first-class concept?** Evidence (§17.8) suggests it is at most an
   attribute, and possibly not needed at all — but whether Grocery's users need it is a product question.
3. **Is any other semantic distinction genuinely missing from the decision model?** Exactly one candidate
   found: the **unit of exclusion** — item-level vs. allergen-class-level (§17.6). `DEC-053` and `DEC-061`
   specify *what* to exclude and *how hard*, but not *at what granularity*. Item-level exclusion cannot
   express a real allergy; this is the gap most likely to matter in practice.

**Not asked, because evidence already answers them:** whether allergy should hard-exclude (`DEC-053`:
yes); whether preference is weaker than allergy (`DEC-061`: yes); whether dietary pattern is a separate
concept (`DEC-038`: yes); whether medical/clinical restriction belongs in this mechanism (`DEC-099`/`100`:
out of scope, BLOCKED).

### 17.10 Validation

- **`DEC-038` traced** — §17.2/§17.3: no collection surface, no effect in `calculateTargets()`; only inert
  `combos.json` tags.
- **`DEC-053` traced** — §17.3/§17.4: no representation for any of its three outcomes.
- **`DEC-061` traced** — §17.3/§17.5: one of its two input classes wired, at one surface.
- **Actual code paths inspected** — file list at §17.1, with line references throughout.
- **`excluded_food_ids` semantics verified, not guessed** — source, persistence, single consumer,
  identity basis, and confirmed semantic collision at §17.5.
- **UI behavior inspected** — §17.6, including data flow behind the copy, not copy alone.
- **Decision semantics not changed** — `DEC-053`'s soft/hard split is quoted and questioned, never edited.
- **No code modified.** No file under `src/`, `netlify/`, `api/`, `supabase/`, or `data/` was touched.
- **No new DEC ID created** — the one candidate (§17.8) and the one genuine gap (§17.9 Q3) are flagged
  only.
- **No clinical rule or threshold invented** — no allergen list, severity scale, or exposure rule appears
  anywhere above; the allergen-class examples are drawn from existing `nutrition.json` row names.
- **Phase 8 remains CLOSED** — no Phase 8 artifact was read for edit or modified.
- **Existing stable IDs unchanged** — every `DEC-###` above is quoted from
  `APP_DECISION_INVENTORY.md`/`DECISION_LOGIC_SPECIFICATION.md`.

---

## 18. HUMAN SAFETY DECISION REVIEW PACKAGE

**Purpose:** give a human/ChatGPT reviewer enough precise information to decide the three unresolved
safety questions from §17 **without reconstructing the analysis.** §§0–17 are unchanged. This section
decides nothing, creates no DEC ID, and proposes no implementation.

**Verification note:** every decision-model claim below was re-read from `APP_DECISION_INVENTORY.md`,
`DECISION_LOGIC_SPECIFICATION.md`, and — new to this pass —
`APP_DECISION_DEPENDENCY_GRAPH.md`, rather than carried forward from §16/§17. **Three facts surfaced
that the earlier passes did not have**, and they materially change the shape of the questions:

1. **The dependency graph already dispositions the "unclear" branch.** Its `DEC-053 → DEC-061` edge
   carries the risk note: *"Unclear/unconfirmed status should bias toward the safer hard-exclusion
   treatment."* Decision A is therefore **only about the intolerance branch** — the unclear branch is
   already specified as bias-to-hard, and is not open for decision.
2. **`DEC-053` is a root decision in timing class 1** — *"can occur immediately, stays fixed until an
   explicit trigger"* — with `Longitudinal Data Required?: NO`. Its classifications do not expire on
   their own; something must trigger a change.
3. **Neither existing reassessment mechanism reaches the exclusion path.** `DEC-011`'s downstream is
   `DEC-006`/`023`/`105`; `DEC-054`'s is `DEC-057`/`063`. **Neither lists `DEC-061`.** The *pattern* of
   reassessment exists twice in the model, but not connected to exclusions.

### 18.1 Decision A — Intolerance Semantics

**What `DEC-053` specifies (verbatim output):** *"Intolerance — soft constraint"* / *"Allergy — hard
exclusion"* / *"Unclear — flag for clinical confirmation."* Domain I, `CLASSIFICATION`, **App Priority:
CORE**, root decision, `Downstream Use: DEC-061`. Its note bounds it: true allergy diagnosis is out of
scope; this classifies a *self-reported* status only, with ambiguity routed to confirmation rather than
assumed.

**What `DEC-061` specifies:** *"Determine how restrictions, allergies, and preferences filter or
hard-exclude candidate foods."* Inputs: `DEC-060` candidate set, **`DEC-053` classification**, and
disclosed preferences — three distinct inputs. Phase 7 §3.11: `DEC-053`'s classification *"hard-excludes
or soft-constrains candidates; disclosed preferences filter further."* Personalization: **VERY HIGH**.
Knowledge basis `CLIN-03`, rated CORE/SAFETY/HIGH and `existing-corpus` in
`APP_DECISION_KNOWLEDGE_MAPPING.md` — the knowledge to execute this exists.

**What the UI communicates:** one section, "Önerilmesin," reading *"Sevmediğin **veya yiyemediğin**
besinleri işaretle"* ("foods you dislike **or cannot eat**"), promising *"öneriler bunları hiç
göstermez"* ("suggestions will never show them").

**What the implementation enforces:** one flat `excluded_food_ids` array, one consumer
(`comboMatch.ts`), one behavior — drop the entire combo on exact `foodId` match. No hard/soft
distinction, no escalation path, and no enforcement in `MealFoodPicker`, the food browser, or the
shopping list (§17.3).

**Is "intolerance = soft" internally consistent with the model? Yes.** `DEC-053`'s three-way output maps
cleanly onto `DEC-061`'s "hard-exclude **or** soft-constrain," with the dependency graph reserving hard
treatment for allergy *and* unclear, leaving soft for confirmed intolerance only. **The inconsistency is
not inside the model — it is between the model and the product's own UI wording**, which invites "cannot
eat" into a mechanism the model would treat as soft. The reviewer is not repairing an incoherent
specification; they are deciding whether a coherent one matches Grocery's product intent.

| Option | Consequences the reviewer should weigh |
|---|---|
| **Keep intolerance soft** (as specified) | Matches the model and `CLIN-03`'s dose-dependent framing. **Not the cheap option**: the product has no soft channel at all today — only a binary drop — so "keep soft" requires *building* two-tier filtering (de-prioritise vs. exclude) plus UI that sets the expectation honestly. Residual risk: a user who entered an intolerance under "yiyemediğin" still sees the food suggested. |
| **Make intolerance hard** | Cheapest to implement (matches today's single binary path). Diverges from `DEC-053`'s specified output, so it requires either amending `DEC-053` under its own authorization or overriding at the `DEC-061` layer — **neither is done here**. Cost: over-restriction against a 64-row catalog and 16 combos, where dropping foods materially shrinks an already-small candidate set. |
| **Conditional / severity-aware handling** | Closest to real-world variability, but **changes `DEC-053`'s own data profile**: it is currently a root with `Longitudinal Data Required?: NO`, and a "start soft, harden on logged reaction" model would introduce a longitudinal input it does not have. Highest complexity. |

**Edge cases the two-bucket model may not cover** (conditions that are neither IgE allergy nor simple
dose-dependent intolerance) belong to the **clinical-scope decisions `DEC-099`/`DEC-100`, which remain
BLOCKED** — flagged so the reviewer knows the two buckets are bounded by design, not by oversight. **No
clinical rule or threshold is proposed here.**

**Affected downstream decisions:** `DEC-061` → `DEC-062` (ranking) and `DEC-061` → `DEC-066` (meal
construction) are both `REQUIRED` edges, so the hard/soft choice propagates into ranking and meal
composition; `DEC-063` substitution must not substitute into an excluded food. **Affected implementation
surfaces:** the collection UI, the `excluded_food_ids` representation, `comboMatch`, `MealFoodPicker`,
the food browser, and the combo→shopping path.

**Human decision required: YES**

### 18.2 Decision B — Unit of Exclusion

**Currently represented:** item-level only — a flat array of `nutrition.name_tr` display strings,
matched by exact equality against a combo's `foodId`s. **Missing:** any class or grouping concept; any
allergen attribute on a nutrition row (the table carries macros and fiber only); and any
ingredient-composition data — **a food row is atomic and opaque**, so a composite food's constituents are
invisible to any filter.

**B5 — allergen present through an ingredient rather than as a standalone food.** Verified against the
real catalog, not hypothesised: `combos.json` contains `kiyma-makarna-domates` (`makarna` — pasta) and
`hindi-bulgur-patlican` (`bulgur`), and the nutrition table carries `beyaz ekmek` and
`tam buğday ekmeği`. **Each carries wheat while bearing no allergen-identifying name.** A user excluding
`un` (flour) is still offered every one of them. Item-level exclusion is structurally incapable of seeing
this.

**B6 — allergen absent from the catalog.** The inspectable seed has **no peanut row and no standalone
milk row**, so those exclusions cannot be entered at all today under any option. Class-level exclusion
partially *rescues* this (a "peanuts" class could pre-emptively cover a peanut row added later); item-level
cannot, because there is nothing to select.

| Option | Failure modes | Additional identity/data required |
|---|---|---|
| **B1 — item level** (today) | **False negatives**: composite foods (above), catalog gaps, and enumeration burden — a tree-nut allergy needs `badem` + `ceviz` + `fındık` today *and* every nut row added later. Fails open by default. | Canonical Food identity only |
| **B2 — allergen class** | **False negatives** if a food is unmapped — and the default for an unmapped row is itself safety-critical, since "no allergen tag" would silently read as "safe." **False positives** if a class maps too broadly, shrinking an already-small catalog. | An allergen attribute per food (**data that does not exist and is not derivable from a name**), a class vocabulary, and an explicit unmapped-row default |
| **B3 — hybrid** | Covers both, but introduces a **precedence question** (class says exclude, item says allow — which wins?) that must be answered or it becomes ambiguous under pressure | Both of the above, plus precedence rules |

**B7 — shopping.** `TodayView.addComboToList()` copies a combo's `foodId`s onto the **household** list;
exclusions are applied upstream at suggestion time only, and that write path passes through the fuzzy
rename documented in §17's correction 2. Whatever unit is chosen governs suggestions, not the list itself.

**B8 — multiple people, one list.** `household_shares` is a real multi-member invite table, and
**no exclusion or nutrition path consults it** (it is imported only by `TenantSwitcher.tsx`). Exclusions
are stored per user (`personal_plan`); the list they populate is shared. See §18.4 — this is flagged as a
*separate* unresolved question, not folded into Decision B.

**Downstream decisions depending on this choice:** `DEC-061` directly, then `DEC-062`, `DEC-063`
(a substitute must not cross the same boundary), `DEC-066`, and `DEC-071`/`072`. Canonical Food identity
is an **upstream prerequisite** for any option — a correct unit applied through a broken identity match is
not actually safe. **Downstream dependency — not decided in this package.**

**Human decision required: YES**

### 18.3 Decision C — Temporary Exclusion

**What `DEC-011` establishes:** a root `MONITORING` decision — profile data staleness by elapsed time,
output *"a re-confirmation trigger,"* downstream `DEC-006`/`DEC-023` (and `DEC-105`). Its own note: *"Staleness
windows are not set here (numeric threshold, out of scope)."*

**What `DEC-054` establishes:** *"Fixed constraint"* vs. *"Adapting — re-test periodically"* for **GI
tolerance**, driven by a longitudinal symptom log, downstream `DEC-057`/`DEC-063`, **App Priority:
OPTIONAL**, and noted as *"relevant mainly to the structured-training subset of users."*

**Is temporary exclusion already covered? Structurally, no.** Both decisions establish the *pattern* of
time-based reassessment, but **neither lists `DEC-061` downstream**, and `DEC-054` is scoped to GI/training
adaptation rather than arbitrary exclusions. Meanwhile `DEC-053` sits in timing class 1 — *fixed until an
explicit trigger* — so under the current model an exclusion persists indefinitely by default. A validity
window would function as exactly the "explicit trigger" that class already anticipates.

| Option | What it costs / implies |
|---|---|
| **C1 — no special representation** | Zero complexity. Exclusions persist until manually removed; the user does the bookkeeping. |
| **C2 — validity window** (`from`/`until`/`reason`) | Small addition, and **the decisions themselves are unchanged** — what to exclude and how hard are untouched; only an entry's lifetime is new. Requires expiry semantics and a reassessment path that does not exist today. |
| **C3 — first-class concept** | Largest. **No evidence was found that a window is insufficient**, so on current evidence this would be complexity without a demonstrated driver. |

**C4/C5 — what happens at expiry** is the safety-relevant sub-question. Silent auto-removal **fails open**,
which is the dangerous direction if the entry was an allergy; a re-confirmation prompt matches the
model's own existing bias, since **both `DEC-011` and `DEC-054` produce a trigger/prompt, never a silent
deletion.** That is an observation about existing precedent, not a decision.

**C6 — interaction with category:** a window on a preference is harmless; on an allergy it is the
dangerous case. **Whether a window is even offered per category is part of this decision**, and it depends
on Decision A/B having drawn the categories first.

**C7 — longitudinal:** `DEC-053` currently declares `Longitudinal Data Required?: NO`; time-bounded
exclusions would give it a temporal dimension it does not have. `DEC-054` is the model's existing home for
time-varying tolerance.

**C9 — is a new DEC necessary?** On the evidence gathered: **not demonstrably**, since C2 changes an
entry's lifetime rather than any decision's logic. Recorded as analysis only — **no DEC ID was created,
and none is proposed as required.**

**Human decision required: YES**

### 18.4 Cross-Decision Interaction

Along the chain `DEC-053` → classification → exclusion semantics → Food/allergen identity →
recommendation filtering → meal composition → shopping → longitudinal reassessment:

- **Allergy + exclusion unit — the sharpest interaction.** Deciding "allergy hard-excludes" (already
  specified) delivers *no actual safety* if the unit stays item-level, because §18.2's composite-food and
  catalog-gap failures let an allergen through before hardness is ever consulted. **A hard rule over an
  insufficient unit is a false assurance.** Decisions A and B must be read together.
- **Intolerance + exclusion unit — the reverse risk.** With one shared list and one code path, a soft
  intolerance **becomes accidentally hard** — which is exactly what ships today. Preserving softness
  requires the representation to carry the reason, so B's unit choice and A's hard/soft choice both land in
  the same mechanism.
- **Temporary exclusion + classification.** A single representation *can* carry preference, intolerance,
  allergy, and a validity window **only if it stores the reason alongside the entry**. The current failure
  is precisely that it stores no reason — so the semantics flatten to whatever the single consumer does.
  Whether that is one tagged mechanism or several is an implementation question. **Downstream dependency —
  not decided in this package.**
- **Canonical Food identity** is upstream of all three. **Downstream dependency — not decided in this
  package.**

**Separately unresolved — user vs. household scope.** Exclusions are per user; the combo→list path writes
to a shared household list; `household_shares` allows multiple members; nothing reconciles them. None of
Decisions A, B, or C strictly *requires* resolving this, so **it is labelled here as a fourth, separate
unresolved question rather than silently added to the decision set.** It is not part of this package.

### 18.5 Decision Impact Matrix

| Decision | Current model | Current implementation | Main risk | Major downstream impact | Human decision |
|---|---|---|---|---|---|
| **A — Intolerance semantics** | `DEC-053`: soft for intolerance, hard for allergy, unclear biased to hard (`DEC-061` consumes all three) | Neither hard nor soft — one flat binary drop; `DEC-053` not implemented at all | Model/UI mismatch: "cannot eat" collected, suggestion-only filtering delivered | `DEC-061`→`062`/`066`; substitution `DEC-063`; every exclusion-consuming surface | **YES** |
| **B — Exclusion unit** | Neither `DEC-053` nor `DEC-061` specifies a granularity | Item-level, display-string keyed, exact match only | False negatives via composite foods and catalog gaps — hardness cannot compensate | `DEC-061`/`062`/`063`/`066`/`071`/`072`; requires allergen data that does not exist | **YES** |
| **C — Temporary exclusion** | Reassessment exists (`DEC-011`, `DEC-054`) but neither reaches `DEC-061`; `DEC-053` is fixed-until-trigger | No temporal dimension at all | Expiry that fails open on a safety-relevant entry | `DEC-053` data profile; reassessment path; filtering surfaces | **YES** |

### 18.6 Unresolved Status

**All three decisions remain OPEN.** No option in §18.1–18.3 was selected, ranked as a recommendation, or
implied as preferred. No DEC ID was created, amended, or renumbered; no clinical rule, threshold, or
allergen list was invented; no code, schema, or API was touched; §§0–17 are unchanged.

Also carried, unchanged and explicitly not decided here: canonical Food identity (§16.1), `DEC-067`,
`DEC-069`'s v1 scope, `DEC-099`/`DEC-100`, and the user-vs-household scope question newly flagged in
§18.4.

**Next action: human/ChatGPT decision review of A, B, and C.** Implementation must not cross the safety
boundary until they are resolved.

---

## 19. HUMAN SAFETY DECISION RATIFICATION

**The three §18 decisions have been decided by the human/ChatGPT reviewer (2026-09-07): A1 · B3 · C2.**
Formal record: `00_PROJECT_CONTROL/DECISIONS/2026-09-07-phase-9-safety-decisions-ratification.md`.
§§0–18 are unchanged. **No `DEC` definition was amended and no `DEC` ID was created** — these are
ratifications at the Phase 9 architecture/governance level. **This section authorizes no
implementation.**

Reconciled against `APP_DECISION_INVENTORY.md`, `DECISION_LOGIC_SPECIFICATION.md`,
`APP_DECISION_DEPENDENCY_GRAPH.md`, `APP_DECISION_KNOWLEDGE_MAPPING.md` and `APP_DECISION_MODEL.md`
before recording: **no contradiction found.** The precise standing of each is in §5 of the decision
record and summarised per decision below.

### 19.1 Decision A — Intolerance: **A1, keep soft**

`DEC-053`'s existing semantics are ratified unchanged: **allergy → hard exclusion; unclear → safer
hard-exclusion treatment / confirmation; intolerance → soft constraint; preference → weaker filtering
(`DEC-061`)**.

**Model standing:** an affirmation, not a change. Six independent statements across four artifacts
already agreed on this split; A1 contradicts none of them.

**Recorded consequence:** the implementation has no soft channel today — only a binary drop (§17.3).
**A1 makes that a future implementation requirement, explicitly rather than a reason to bend the model
toward the current code.** Not authorized by A1: amending `DEC-053`, severity tiers, or longitudinal
reaction-based hardening.

### 19.2 Decision B — Exclusion Unit: **B3, hybrid**

The exclusion model must conceptually support **both food-level and allergen-class-level exclusion**,
because food-level alone cannot see an allergen carried inside a composite food (§18.2's verified
`makarna` / `bulgur` / bread cases).

**Binding semantic rule:** *a safety-level allergen-class exclusion must not be defeated by a food-level
"allow" or omission.*

**Model standing — stated precisely:** `DEC-053` and `DEC-061` **do not specify exclusion granularity at
all**; the model is silent, and B3 supplies that missing semantic. It would be false to claim the
existing decisions already specify hybrid granularity.

### 19.3 Decision C — Temporary Exclusion: **C2, validity window**

Exclusions may carry a validity period — conceptually active-from, active-until/review, and
reason/category. **Semantic only, not schema.**

**Binding safety invariant:** *expiry must not silently remove a safety-relevant exclusion*; an allergy
exclusion must never fail open on elapsed time alone. Required flow: `active exclusion → review /
reconfirmation trigger → user confirmation → retain / modify / remove`.

**Model standing — stated precisely:** `DEC-061` has exactly two inbound dependency edges (`DEC-060`,
`DEC-053`); **neither `DEC-011` nor `DEC-054` reaches it**, so it would be false to claim they already
provide this. C2 needs no new decision because `DEC-053` is timing class 1 — *fixed until an explicit
trigger* — and C2's review trigger is exactly such a trigger. Not authorized by C2: amending `DEC-011`
or `DEC-054`, numeric validity periods, or trigger implementation.

### 19.4 Downstream Consequences (consequences only — no implementation)

- **A1 obliges a two-tier filtering semantic** (exclude vs. de-prioritise) where only one tier exists
  today, and obliges the collection surface to distinguish reasons, since a soft outcome is
  indistinguishable from a hard one once the reason is discarded.
- **B3 obliges the exclusion representation to carry an allergen-class dimension** that no current data
  source provides: the nutrition table holds macros and fiber only, and a food row is atomic, so
  composite foods are opaque to any filter. It also obliges an explicit default for foods with no
  allergen mapping — a fail-open default would negate the decision's own purpose.
- **B3 raises a precedence question** (class excludes, item allows) whose *semantic* answer is fixed by
  the binding rule above; its implementation is downstream.
- **C2 obliges a reconfirmation path** that does not exist anywhere in the product today, and gives
  `DEC-053`-classified entries a temporal dimension the decision itself does not carry
  (`Longitudinal Data Required?: NO`). Whether the dependency graph should eventually record a new edge
  into `DEC-061` is downstream and unauthorized here.
- **Enforcement surfaces implicated by all three** (from §17): the collection UI, the exclusion
  representation, `comboMatch`, `MealFoodPicker`, the food browser, and the combo→shopping path — several
  of which apply no exclusion filtering at all today.
- **A1 + B3 read together:** a hard rule over an insufficient unit is a false assurance (§18.4). The two
  decisions must be satisfied jointly, not separately.

### 19.5 Explicitly Unresolved — Unchanged by This Ratification

- **Canonical Food identity** (§16.1) — upstream prerequisite for B3 being enforceable at all.
- **User-vs-household exclusion scope** (§18.4) — exclusions are per user, the shopping list they
  populate is per household, `household_shares` permits multiple members, nothing reconciles them.
  **Preserved as its own separate question; deliberately not folded into Decision B.**
- **Allergen vocabulary** and the unmapped-food default.
- **`DEC-067`** (recipe depth) and **`DEC-069`** (batch scope).
- **`DEC-099`/`DEC-100`** — remain BLOCKED, untouched.
- **Schema, API, UI, and implementation architecture** — all downstream.

**Implementation remains unauthorized.** The next step is post-ratification architectural
reconciliation — determining what A1/B3/C2 require of the architecture — not building them.

---

## 20. POST-RATIFICATION IMPLEMENTATION READINESS & ARCHITECTURAL RECONCILIATION

**Trigger:** §19 ratified A1 · B3 · C2 and closed with *"the next step is post-ratification architectural
reconciliation — determining what A1/B3/C2 require of the architecture — not building them."* This section
is that reconciliation, and it is the last architecture pass before implementation may begin. **§§0–19 are
unchanged.** Nothing below implements anything, creates a `DEC` ID, amends a decision definition, changes a
stable ID, selects an allergen vocabulary, or resolves any open human decision.

**Method.** Every claim about the application below was re-verified by reading the file in this pass, not
carried forward from §14/§17/§18. Files read for §20: `src/lib/comboMatch.ts`, `mealNutrition.ts`,
`nutrition.ts`, `listActions.ts`, `fuzzyMatch.ts`, `mealPersonalization.ts`, `localMealPlan.ts`,
`categorization/itemCategories.ts`, `store.ts` (`findCanonicalName`); `src/hooks/useRemainingToday.ts`,
`useMealPersonalization.ts`, `useFoodCatalog.ts`; `src/components/PersonalPlanView.tsx`, `TodayView.tsx`,
`NutritionView.tsx`, `MealFoodPicker.tsx`, `MealPlanView.tsx`; `netlify/functions/personal-plan.ts`,
`nutrition.ts`, `_auth.ts`; `supabase/01-schema.sql`, `05-household-ownership.sql`, `07-meal-entries.sql`,
`10-personal-plan-exclusions.sql`; `data/combos.json` (16 combos), `data/nutrition.json` (64 rows).
Decision-model text re-read from `APP_DECISION_INVENTORY.md`, `DECISION_LOGIC_SPECIFICATION.md` §3.11 and
`APP_DECISION_DEPENDENCY_GRAPH.md` line 423.

**Both §17 corrections are preserved and re-verified, not quietly dropped:**

1. A Recipe/Combo → Shopping path **does** exist: `TodayView.addComboToList()` iterates `combo.items` and
   calls `onAddItem(item.foodId, "<grams>g")`, wired through `App.tsx` to `createListActions().addItem`.
2. `isCloseMatch` **does** already touch food identity on that path — `listActions.addItem`
   (`listActions.ts:44–51`) runs `findCanonicalName(name, catalog) ?? name` and an `isCloseMatch`
   comparison against existing rows. Scope restated exactly as §17 scoped it: this affects **the shopping
   line's name and its re-matching**, and it is **not** the upstream authority for the exclusion decision,
   which runs earlier in `comboMatch.ts` on exact `foodId` equality.

### 20.0 Section-label collision warning (documentation hazard, flagged not fixed)

This document now contains two independent option sets that reuse the same letters, and a future reader
acting on "A1/B3/C2" could land on the wrong table. **The ratified decisions are §18/§19's, never §16's.**

| Ratified label | Correct meaning (§18/§19) | Colliding, **incorrect** reading (§16) |
|---|---|---|
| **A1** | Decision A option 1 — *keep intolerance a soft constraint* (§18.1, §19.1) | §16.1's identity option A1 — *keep `name_tr` as the anchor, add a mapping layer*. **Undecided.** |
| **B3** | Decision B option 3 — *hybrid: food-level **and** allergen-class exclusion* (§18.2, §19.2) | §16.2's option B3 — *"do nothing now"*, which that table itself marks **"Not recommended."** Reading the ratification against §16.2 inverts its meaning entirely. |
| **C2** | Decision C option 2 — *validity window on an exclusion* (§18.3, §19.3) | §16.3 is "Decision Package **C** — Recipe Depth and Batch-Production Scope", an unrelated package with no C1/C2/C3 options. |

Per the precedent at §0.1, §12.1 and §17, §16 is **not rewritten**; this note supersedes it for anyone
reading forward. Canonical Food identity's A1/A2/A3 (§16.1) remain **open**.

### 20.1 Layer Assignment and the Non-Collapsible Distinctions

The seven `≠` boundaries, each assigned to the layer that owns it (§1's five-layer model), with where the
boundary lives in today's code and what would violate it. **None of these is a naming convention — each is
a place where a real conflation is architecturally possible.**

| Boundary | Owning layer | Where it lives today | What would violate it |
|---|---|---|---|
| **Food identity ≠ Food composition** | Translation (3) | `nutrition.name_tr` is doing both jobs — it is the display name, the lookup key, and the reference used by `combos.json`'s `foodId` and `meal_entries.food_id` (no FK, by documented design) | Treating "has a composition row" as "is a known Food" — a Food with no composition row is still a Food, and today it is simply invisible |
| **Food composition ≠ Nutrient target** | Composition = reference data consumed by Translation (3); Target = Decision (2) | Structurally separate: `nutrition` table (per-100 g, food-scoped) vs. `calculateTargets()` in `mealPersonalization.ts` (per-user, Mifflin-St Jeor + PAL + goal). `comboMatch` compares computed totals against `remaining` — a one-directional comparison | Deriving a target from what the catalog happens to contain, or letting catalog coverage change a target |
| **Nutrient target ≠ Prescription** | Decision (2) vs. **out of scope** | `docs/architecture.md` and `PersonalPlanView`'s own disclaimer both frame targets as estimates; no code path emits prescriptive output | Any per-condition tailoring — that is `DEC-099`/`DEC-100`, **BLOCKED** (§20.10) |
| **Prescription ≠ Meal composition** | Out of scope vs. Translation (3) | Not currently crossable: nothing prescriptive exists to feed a meal | Building meal construction that consumes a clinical condition directly rather than through `DEC-100` |
| **Meal composition ≠ Recipe** | Translation (3) vs. Translation+Product (3/4) | `meal_entries` (a (date, slot) set of `(food_id, quantity_g)`) is genuinely separate from `combos.json`; the only join is the optional `combo_id` tag | Making a combo the only way to compose a meal, or treating a logged slot as a recipe |
| **Recipe ≠ Shopping item** | Product (4) | `addComboToList()` maps `Combo.items[].foodId` → a shopping line `name`, and `grams` → the free-text `qty` string `"<n>g"` — a *translation*, and a lossy one | Assuming the shopping line still carries the recipe's identity or quantity semantics; it carries neither (§20.6 C1/C2) |
| **Shopping item ≠ Pantry item** | Product (4) | The pantry side does not exist. `items.checked` means "bought within *this* list", not "on hand" | Reading `checked` as inventory — the boundary is currently protected only by the absence of the second concept |

**Knowledge layer** stays as Phase 8 left it: On Cooking 7e supplies *primitives* (§5), never recipe
content, and never a nutrition target (§6's authority rule, unchanged). **Nothing in §20 moves a
responsibility across a layer**; it only names which layer each capability belongs to.

### 20.2 What A1 / B3 / C2 Require of the Architecture

Stated in the three columns the ratification insisted on, so no one can later claim the decision model
already contained what the human decided.

| | **What the decision model specifies** | **What the human ratification adds** | **What implementation must eventually provide** |
|---|---|---|---|
| **A1 — intolerance** | `DEC-053` (Domain I, CLASSIFICATION, App Priority CORE, root, `Downstream Use: DEC-061`): *"Intolerance — soft constraint" / "Allergy — hard exclusion" / "Unclear — flag for clinical confirmation."* `DEC-061` consumes it: *"hard-excludes or soft-constrains candidates; disclosed preferences filter further"* (Phase 7 §3.11). The `DEC-053 → DEC-061` edge already carries *"Unclear/unconfirmed status should bias toward the safer hard-exclusion treatment"* (dependency graph line 423) | **Nothing to the model.** A1 is an affirmation: the reviewer chose to keep the model and change the product, rather than bend the model toward the shipped binary drop | A **reason carried per exclusion entry**, and **two distinct filtering tiers** (exclude vs. de-prioritise) where exactly one exists today. Neither exists in any form |
| **B3 — exclusion unit** | **Nothing.** `DEC-053` and `DEC-061` specify *what* to exclude and *how hard*, never *at what granularity*. A targeted search of the Phase 3 and Phase 7 artifacts found no allergen-class, food-group, or precedence language; `APP_DECISION_MODEL.md` §31's granularity discussion is about unrelated items (§19.2). **It would be false to say the model already specifies hybrid granularity — it is silent** | The hybrid unit itself (food-level **and** allergen-class-level), plus the binding rule: *a safety-level allergen-class exclusion must not be defeated by a food-level "allow" or omission* | An **allergen-class dimension** on the exclusion representation; an **allergen attribute per Food** (data that does not exist and is not derivable from a name); **precedence mechanics** implementing the binding rule; an **explicit default for unmapped foods** |
| **C2 — temporary exclusion** | `DEC-011` (profile staleness → *"a re-confirmation trigger"*, `Downstream Use: DEC-006, DEC-023`) and `DEC-054` (fixed vs. adapting **GI tolerance**, `Downstream Use: DEC-057, DEC-063`, App Priority OPTIONAL) establish the *pattern* of time-based reassessment. **Neither reaches `DEC-061`** — `DEC-061`'s only inbound edges are `DEC-060` and `DEC-053`. **It would be false to say `DEC-011`/`DEC-054` already provide this** | Validity/review semantics on an exclusion entry, plus the invariant: *expiry must not silently remove a safety-relevant exclusion*, with the flow `active → review trigger → user confirmation → retain / modify / remove` | A **validity/review attribute** on an exclusion, a **review trigger**, and a **reconfirmation surface**. None exists. `DEC-053` is timing class 1 (*fixed until an explicit trigger*) with `Longitudinal Data Required?: NO`, so the trigger is the kind that class already anticipates |

**Illustrative only, explicitly not a schema and not field names:** the shape these three imply is *an
exclusion entry that knows (a) what it refers to — a Food or an allergen class, (b) why it exists — the
`DEC-053`/`DEC-061` reason, and (c) how long it stands — start / review point / reason for review.* The
words `start`, `end / review point`, `reason`, `reconfirmation` are used here as **concepts named by the
ratification**, not as column names, and **no duration, interval, or numeric window is proposed anywhere in
this section.**

**Preserved as unresolved by B3, per the ratification's own §7/§8 — none is answered below:** the allergen
**vocabulary**; allergen **mapping completeness**; the **unmapped-food safety default**; **precedence
mechanics**; **canonical Food identity**.

### 20.3 Implementation Readiness Map — 26 Capabilities

`READY` = the domain boundary is settled and the existing code can carry it. `READY WITH ADAPTER` = the
mechanism exists and needs a bounded, additive change, no unresolved decision. `BLOCKED BY …` = a specific,
named thing gates it. `DEFERRED` = not required for the near-term path and nothing breaks by waiting.

| # | Capability | Current state (verified) | Target state | Blocking dependency | DEC IDs | Code / data | Independent start? | **Classification** |
|---|---|---|---|---|---|---|---|---|
| 1 | **Canonical Food identity** | `nutrition.name_tr` is the de facto identity (display string, no FK). Three key spaces: the alias-aware server lookup, the alias-**blind** client catalog map, and `item_category_memory` | One resolution point every consumer uses; exact wherever safety or nutrition depends on it | The **anchor choice** (§16.1 A1/A2/A3) is open — but a single resolver *onto today's anchor* is common to A1 **and** A2 and pre-empts neither | 060, 061, 063, 065, 071, 072 | `nutrition.ts`, `itemCategories.normalize`, `store.findCanonicalName`, `useFoodCatalog.ts` | **Yes** — the resolver seam only; **not** the anchor replacement | **READY WITH ADAPTER** (anchor replacement remains BLOCKED BY HUMAN DECISION) |
| 2 | **Food aliases / normalization** | `normalize()` = `trim().toLocaleLowerCase("tr-TR")`, shared by `nutrition.ts` and `itemCategories.ts`. Aliases resolve **only** in `POST /api/nutrition` (`name_tr=in.(…)` ∪ `aliases=ov.(…)`); the browse path's client mapper `pickNutrition` **drops `aliases`**, so `useFoodCatalog`'s catalog map cannot resolve one | One alias-aware resolution used by every consumer; fuzzy matching stays quarantined | None | 060, 061, 063 | `src/lib/nutrition.ts`, `netlify/functions/nutrition.ts:144–162`, `useFoodCatalog.ts` | Yes | **READY WITH ADAPTER** |
| 3 | **Food composition lookup** | Live: `nutrition` table (`kcal_per_100`, `protein_g`, `fat_g`, `carbs_g`, `fiber_g`, `aliases[]`); 64 seed rows, macro+fiber only | Same shape, broader coverage; micronutrients are a separate capability | None for macro scope | 060, 062, 066 | `data/nutrition.json`, `netlify/functions/nutrition.ts` | Yes | **READY** |
| 4 | **Allergen representation** | **Absent.** No allergen attribute on any row; a food row is atomic, so a composite food's constituents are invisible to any filter | A class vocabulary, a per-Food mapping, and an explicit unmapped default | **Vocabulary and unmapped default must be chosen before the data can be collected** — collection is downstream of the decision | 061 (B3) | none | No | **BLOCKED BY HUMAN DECISION** |
| 5 | **Allergy enforcement** | **Not implemented.** No hard-exclusion concept exists anywhere; `DEC-053` has no input surface | Hard exclusion, class-aware, enforced on every food-presenting surface | #4 and #1. Per §18.4, hardness over an item-level unit is a **false assurance**, so this cannot ship as an allergy-safety claim before #4 | 053, 061 | `comboMatch.ts` (sole consumer today) | No | **BLOCKED BY ARCHITECTURE** |
| 6 | **Intolerance soft constraints** | **Not implemented**, and today's behavior is *stricter* than specified: one flat drop | A de-prioritise tier distinct from exclusion (A1) | The reason-carrying representation (#1/#8 foundation). No human decision outstanding — A1 is ratified | 053, 061 | `comboMatch.scoreAllCombos` already ranks (by protein), so a second tier has somewhere to live | After the foundation | **BLOCKED BY ARCHITECTURE** |
| 7 | **Unclear-status handling** | **Not implemented.** The only nearby artifact is a static blanket disclaimer inside a collapsed `<details>` panel in `PersonalPlanView` | Capture "unclear", bias to the safer hard treatment (already specified), and route to a **generic** confirmation prompt | The reason-carrying representation. Anything beyond a generic "consult a professional" prompt is behind `DEC-099`/`100` | 053, 061, (099/100 for anything condition-specific) | `PersonalPlanView.tsx` | After the foundation | **BLOCKED BY ARCHITECTURE** |
| 8 | **Preference filtering** | **Shipped, at one surface.** `excluded_food_ids` → `useRemainingToday` → `TodayView` → `comboMatch.scoreAllCombos`/`matchCombos`, which drops a combo when any `item.foodId` is in the array | Same behavior, explicitly reason-tagged as preference-grade, with a decided surface coverage | None | 061 | `comboMatch.ts:30`, `personal_plan.excluded_food_ids` | Yes | **READY WITH ADAPTER** |
| 9 | **Dietary pattern** | **Not implemented.** `PersonalProfile` has no pattern field; `calculateTargets()` takes none. `combos.json` `tags` (incl. `"vejetaryen"`) are parsed at `TodayView.tsx:30` and **never read again** — re-verified this pass | Disclosed pattern adjusts macro allocation and feeds `DEC-060`/`061` | None — `DEC-038` is `SPECIFIED`. Deliberately kept out of the first milestone because it changes macro output (invariant 8) | 038, 060, 061 | `mealPersonalization.calculateTargets`, `data/combos.json` | Yes, but sequence after the safety foundation | **READY WITH ADAPTER** |
| 10 | **Meal composition** | **Shipped.** `MEAL_SLOTS` + `meal_entries` + `MealPlanView`/`MealFoodPicker`; nutrition always derived, never stored | Same, plus an eventual plan-vs-log distinction | None for current scope | 066 | `localMealPlan.ts`, `supabase/07-meal-entries.sql` | Yes | **READY** |
| 11 | **Macro calculation** | **Shipped.** `scaleNutrition` (× `quantityG/100`) + `sumMacros`; sole engine, used identically by `comboMatch` and `localMealPlan` | Unchanged. Micronutrients extend the record, not the function | None | 060, 062 | `mealNutrition.ts` | Yes — but see invariant 8: this must not change | **READY** |
| 12 | **Recipe representation** | `combos.json`: 16 build-time, hand-authored combos, snake_case in the file and normalized to camelCase at `TodayView.tsx:25–31`. No method, no yield, no user edit path | Whatever depth `DEC-067` selects | `DEC-067` | 066, 067 | `data/combos.json`, `src/lib/combos.ts` | No | **BLOCKED BY HUMAN DECISION** |
| 13 | **Recipe construction** | Absent (the 16 combos are authored, not constructed) | Construct a meal from `DEC-060`–`065` outputs | `DEC-067` | 066, 067 | — | No | **BLOCKED BY HUMAN DECISION** |
| 14 | **Recipe modification** | Absent; no edit path of any kind | Adapt an existing recipe (distinct from construction — Gate 6's own line) | `DEC-067` first | 063, 067 | — | No | **BLOCKED BY HUMAN DECISION** |
| 15 | **Recipe scaling** | Absent. Grams are fixed absolutes; **no yield concept exists anywhere** | A (source yield → target yield) factor over a recipe's quantities | The **Yield concept** and a recipe representation to attach it to. **`DEC-069` does *not* gate this** — household-scale scaling is rated `ADEQUATE`/`STRONG` by Phase 8; `DEC-069`'s open question is restaurant/quantity-food scale only | 066, 069 | — | No | **BLOCKED BY ARCHITECTURE** |
| 16 | **Portion conversion** | Grams only, everywhere nutrition-linked | A human-scale portion only if `DEC-067` says the product exposes one | `DEC-067` | 060, 066, 067 | `meal_entries.quantity_g`, `combos.json` grams | No | **BLOCKED BY HUMAN DECISION** |
| 17 | **Preparation guidance** | Knowledge exists (On Cooking 7e Ch.4/6/9, Phase 8). Repo has exactly one field: `prep_minutes` | Whatever `DEC-067` selects | `DEC-067` | 067, 068 | `combos.json` `prep_minutes` | No | **BLOCKED BY HUMAN DECISION** |
| 18 | **Batch preparation** | Absent. **Split, deliberately:** household meal-prep/leftovers/storage is `ADEQUATE`/`STRONG` in the corpus and needs only Yield + storage metadata; restaurant/quantity-food scale is confirmed **absent** from the corpus | Household meal-prep, storage-aware | **Household scale: BLOCKED BY ARCHITECTURE** (Yield + storage metadata + a recipe to attach them to). **Restaurant scale: BLOCKED BY HUMAN DECISION (`DEC-069`)** and would reopen a knowledge question per Phase 8 §11.2 | 069 | — | No | **BLOCKED BY ARCHITECTURE** (household); restaurant-scale variant BLOCKED BY HUMAN DECISION |
| 19 | **Nutrient retention / cooking effects** | Absent. Phase 8 supplies **qualitative** patterns only, explicitly *"not a quantitative model"* (§5). Phase 8's U3 is the one usability assumption with correctness rather than convenience consequences | Preparation-aware composition, if ever | **No retention dataset exists in the corpus, and inventing factors is prohibited** | 066–069, feeds back to D–G | — | No | **BLOCKED BY DATA** |
| 20 | **Recipe → shopping-list expansion** | **Shipped** (§17 correction 1): `TodayView.addComboToList()` → `onAddItem(foodId, "<grams>g")` → `listActions.addItem`, which canonicalises the name through `findCanonicalName`/`isCloseMatch` | Same path, routed through canonical identity instead of the shopping catalog's fuzzy space | #1 | 071 | `TodayView.tsx:143–147`, `listActions.ts:40–72` | Yes, after #1 | **READY WITH ADAPTER** |
| 21 | **Shopping-list identity** | `items.name` and `items.qty` are both free text. `addItem` writes a fuzzily-canonicalised name; `isOnList`/`removeItemByName` (`listActions.ts:180–192`) compare by **exact** `tr-TR` lowercase equality | A list line that can resolve to a Food when it needs to, without losing free-text entry | #1; structured quantity is a separate, later need | 071, 072 | `supabase/01-schema.sql` `items` | Yes, after #1 | **READY WITH ADAPTER** |
| 22 | **Pantry** | **Absent** — reconfirmed by grep this pass. `items.checked` means "bought in this list", never "on hand" | Quantity-on-hand per Food per household | Whether v1 needs it (product decision), then unit normalization | 065, 072 | — | No | **DEFERRED** |
| 23 | **Household vs. user scope** | Exclusions are stored **per user** (`personal_plan`, keyed by `app_users.id`); the list they populate is **per household**; `household_shares` is a real multi-member invite table that **no exclusion or nutrition path consults** | Undecided — see §20.7 | **Explicitly unresolved human decision. Not decided here.** | 061, 071, 072 | `supabase/05-household-ownership.sql`, `netlify/functions/_auth.ts:81–101` | No | **BLOCKED BY HUMAN DECISION** |
| 24 | **Temporary exclusion / reconfirmation** | Absent. No temporal dimension on anything in `personal_plan` | C2's validity/review semantics with a non-silent expiry | The reason-carrying representation (foundation) | 053, 061; pattern precedent 011, 054 | — | After the foundation | **BLOCKED BY ARCHITECTURE** |
| 25 | **Feedback / adjustment** | Logging is **real** (`meal_entries`, per household/date/slot). The *policy* that consumes it is not | `DEC-070` same-day adjustment; Domain O adaptation | Carried-open specification work: `DEC-090` circuit-breaker values, `DEC-021`/`110` deviation cap. Not new, not Phase 9's to close | 070, 076–080, 081–091 | `meal_entries`, `useMealPlan.ts` | Yes for logging (already done); no for policy | **DEFERRED** |
| 26 | **Clinical escalation boundary** | Only a static blanket disclaimer. Nothing interprets a disclosed condition — which is **correct** | Stays closed until `DEC-099`/`DEC-100` resolve | `DEC-099`/`DEC-100`, **BLOCKED**; `DEC-012 ⇄ DEC-099` is the model's only bidirectional `REQUIRED` pair | 012–016, 099, 100 | `PersonalPlanView.tsx` disclaimer | No | **BLOCKED BY SAFETY/SCOPE** |

**Counts:** READY 3 · READY WITH ADAPTER 6 · BLOCKED BY ARCHITECTURE 5 · BLOCKED BY HUMAN DECISION 8 ·
BLOCKED BY DATA 1 · BLOCKED BY SAFETY/SCOPE 1 · DEFERRED 2. **Nothing was marked READY because it would be
easy to code** — #14, #15 and #19 are all technically writable today and are not ready.

### 20.4 Implementation Dependency Order

Ordered for **safety → architectural correctness → reuse → minimal rework → preservation of existing
behavior**, in that priority. Foundations are separated from features because everything in Stage 1 is
unsafe or wasteful without Stage 0.

```text
STAGE 0 — FOUNDATION (no unresolved decision blocks any of this)
  F1  One canonical Food resolution point, alias-aware, exact-only, fail-closed
  F2  An exclusion entry that carries its DEC-053 / DEC-061 reason
  F3  Consistent enforcement surface for whatever the filter decides

STAGE 1 — SAFETY SEMANTICS (requires Stage 0)
  S1  Two-tier filtering: hard exclude vs. de-prioritise            [A1]
  S2  Unclear -> bias-to-hard + generic confirmation prompt         [DEC-053 + graph line 423]
  S3  Allergen vocabulary + unmapped-food default                   [HUMAN DECISION — blocks S4]
  S4  Allergen-class dimension + class-over-food precedence         [B3]
  S5  Validity / review window + reconfirmation trigger             [C2]

STAGE 2 — DECISION INTEGRATION (requires Stage 1 for anything safety-facing)
  D1  DEC-038 dietary pattern: collection + macro-allocation effect
  D2  DEC-060/061 candidate filtering over the whole catalog, not only combos
  D3  DEC-062 nutrient-density ranking                              [BLOCKED BY DATA: micronutrients]

STAGE 3 — RECIPE (entirely gated on DEC-067)
  R1 representation -> R2 construction -> R3 modification -> R4 yield/scaling -> R5 preparation

STAGE 4 — SHOPPING / EXECUTION
  H1  Route the existing combo->list path through F1                (does NOT wait for Stage 3)
  H2  Structured quantity on shopping lines
  H3  User-vs-household scope decision                              [HUMAN DECISION]
  H4  Pantry, then deviation handling                               [needs H2 + H3]

STAGE 5 — FEEDBACK
  L1  DEC-070 same-day deviation policy
  L2  Domain O adaptation + circuit breaker                         [DEC-090 / DEC-021 / DEC-110 values open]
```

**Five reorderings against the intuitive sequence, each with its reason:**

1. **`DEC-067`/`DEC-069` are no longer step 1.** §13 and §14.10 both put them first, when they were the
   only known blockers. After the ratification the safety foundation is both more urgent and *unblocked*,
   while `DEC-067` still is not — so Stage 0/1 now precede Stage 3. This supersedes §14.10's ordering for
   anyone reading forward; §14.10 is not rewritten.
2. **Shopping's minimal case does not wait for recipes** (§16.4, re-verified): the combo→list path already
   exists and needs only F1. H1 can run concurrently with Stage 1.
3. **Macro calculation and meal composition are not downstream of recipe representation** — both ship
   today (§14.10 already corrected this; it still holds).
4. **S3 (vocabulary) is placed *inside* Stage 1 rather than at the front**, because F1/F2/S1/S2 are all
   buildable without it. Putting the blocked item first would stall the entire safety stage behind a human
   decision that nothing else needs.
5. **Household batch preparation is not sequenced behind `DEC-069`.** `DEC-069`'s open question is
   restaurant/quantity-food scale; household meal-prep sits behind `DEC-067`'s representation instead.

### 20.5 Minimum First Implementation Milestone

**Verified against the repository rather than assumed.** The expectation that the first milestone should be
Food identity + the restriction/safety foundation holds, and the repository gives three independent reasons:
(a) `comboMatch.ts:30` is the **only** consumer of `excluded_food_ids` in the entire codebase, so the blast
radius of changing exclusion semantics is exactly one call site plus its two `TodayView` callers;
(b) `mealNutrition.ts` is the **sole** calculation engine and is untouched by either change, so macro
behavior can be held constant while safety architecture is introduced; (c) every other stage in §20.4
depends on F1, F2 or both, and nothing else does not.

> **MILESTONE 1 — Food resolution + exclusion-reason foundation**

**Exact capability delivered**

1. **One Food resolution point.** A single alias-aware, exact-match, fail-closed function that answers
   "which Food is this string?", used by every nutrition/exclusion consumer instead of the three key spaces
   in use today. Anchored on today's `name_tr` — **which does not choose §16.1's A1 over A2**, because A2
   needs the same single resolution point in order to ever swap the anchor behind it.
2. **An exclusion entry that carries its reason** — `DEC-053`'s three outputs plus `DEC-061`'s preference —
   replacing a bare string in a flat array.
3. **Consistent enforcement of whatever that reason implies**, across the surfaces that currently present
   food (`comboMatch`, `MealFoodPicker`, the food browser), instead of one surface.
4. **Honest labeling.** The "Önerilmesin" copy currently reads *"Sevmediğin veya yiyemediğin besinleri
   işaretle — öneriler bunları hiç göstermez"* and solicits "cannot eat" into a suggestion-only mechanism.
   Until an allergen-class dimension exists, the product must not present any exclusion as allergy-safe.

**Files/modules likely touched** (named for scoping, not as a plan to execute here): `src/lib/nutrition.ts`
and `src/hooks/useFoodCatalog.ts` (single alias-aware resolver; the catalog path currently drops
`aliases`); `src/lib/mealPersonalization.ts` (`PersonalProfile` shape), `src/hooks/useMealPersonalization.ts`,
`src/lib/personalPlan.ts`, `netlify/functions/personal-plan.ts` (validation currently accepts any string
array, `:125–127`), and one new additive `supabase/13-*.sql` migration;
`src/components/PersonalPlanView.tsx` (reason capture + copy); `src/lib/comboMatch.ts` (reason-aware
filtering); `src/components/TodayView.tsx`, `MealFoodPicker.tsx`, `MealPlanView.tsx`,
`NutritionAllFoodsBrowser.tsx` (surface coverage).

**Existing behavior that must remain unchanged**

- `scaleNutrition`/`sumMacros` arithmetic and every number `calculateTargets()` produces (Mifflin-St Jeor
  coefficients, `ACTIVITY_OPTIONS` PALs, `CARB_G_PER_KG`, `MIN_CALORIES`, the protein/fat/fiber rules).
  These are Phase 7 territory; changing them is a decision-model change, not an implementation choice.
- Free-text shopping-list entry and `isCloseMatch`'s typo tolerance for **human typing** — that path's
  worst case is a wrong autocomplete grouping and it must stay available (§14.3).
- The daily rollover, sync, tenant, and auth behavior — untouched.
- **Today's effective protection level for every existing exclusion.** See the safety properties below.

**Tests required — and a gap that must be named.** This repository has **no test suite and no lint script**;
`npm run build`'s `tsc -b` is the only automated check (`CLAUDE.md`). Introducing a safety-relevant behavior
with no automated way to protect it is itself a risk. The milestone therefore needs, at minimum, a test
capability plus cases for: resolver exactness (an alias resolves; a near-spelling does **not**); fail-closed
behavior on an unknown name; a hard-reason entry excluding at every enforcing surface; a soft-reason entry
de-prioritising **without** disappearing; and the legacy-migration property below. **Whether to add a test
runner, and which, is a tooling decision for the user — not one this section makes.**

**Safety properties that must hold**

- No exclusion loses protection. Legacy entries have no reason; they must **retain today's exclude-from-
  suggestions behavior** and be routed to reconfirmation rather than defaulted to "preference" — defaulting
  would silently downgrade an entry a user may have entered as "cannot eat". This is C2's
  no-silent-weakening invariant applied to the migration itself, and the reconfirmation prompt it needs is
  the same seam S5 later generalises.
- **No allergy-safety claim.** Capturing "allergy" as a reason is permitted; presenting protection as
  allergy-safe is not, until the allergen-class dimension exists (§18.4: a hard rule over an insufficient
  unit is a false assurance).
- The resolver stays exact and fail-closed; `isCloseMatch` gets no new reach into nutrition or exclusion.
- An exclusion that fails to persist server-side must not be silently local-only (§20.6 C7).

**Explicitly NOT in this milestone:** allergen vocabulary or classes; class-over-food precedence; validity
windows; `DEC-038` dietary pattern; any recipe work; pantry; micronutrients; structured quantity parsing;
user-vs-household scope; replacing `name_tr` as the anchor; any change to macro math.

**Prerequisite data:** none beyond what ships. Deliberately — the milestone is scoped so that it needs no
allergen data, no new composition rows, and no external provider.

**Unresolved decisions that would still block it:** **none**, provided the four exclusions above hold. If
the milestone were widened to include allergen classes it would immediately become blocked by S3.

### 20.6 Reconciliation of the Existing Implementation

**Reuse as-is:** `mealNutrition.ts` (minimal, single-purpose, correct); `normalize()`; `fuzzyMatch.ts`
(kept quarantined to the shopping catalog); the `lists`/`items` shape as the shopping destination;
`meal_entries`' structured `(food_id, quantity_g)` shape; `households`/`app_users`/`household_shares`
identities; `_auth.ts`'s membership resolution.

**Adapt:** `nutrition.ts` + `useFoodCatalog.ts` (one alias-aware resolver); `comboMatch.ts` (reason-aware,
two-tier); `personal_plan`'s exclusion field (reason-carrying); `PersonalPlanView` (reason capture, honest
copy); the combo→list path (route through the resolver, keep fuzzy matching for human typing).

**Eventually replace:** `excluded_food_ids text[]` as the *sole* exclusion representation (it cannot express
a class, a reason, or a validity window); `combos.json` as the recipe representation — **only** once
`DEC-067` answers; `name_tr`-as-identity, **only** if §16.1's A2 is ever chosen.

**Must remain untouched:** every `DEC` definition and every stable ID; the Phase 1–8 artifacts; the
`calculateTargets` formulas and constants; `scaleNutrition`'s arithmetic; `isCloseMatch`'s thresholds.

**Accidental couplings found (all verified this pass; none fixed here):**

| | Coupling | Evidence | Why it matters |
|---|---|---|---|
| **C1** | The recipe→shopping path runs a Food identity through the shopping catalog's fuzzy space | `TodayView.addComboToList` → `listActions.addItem:44–51` (`findCanonicalName` + `isCloseMatch`) | A combo's `foodId` can be silently rewritten to a household's near-spelling. **Not** the exclusion authority (that runs upstream on exact equality) — §17 correction 2, restated |
| **C2** | `addItem` writes a fuzzily-canonicalised name; `isOnList`/`removeItemByName` compare by **exact** `tr-TR` lowercase equality | `listActions.ts:44–51` vs. `:180–192`; `TodayView.isComboOnList`/`removeComboFromList` | After a rename the two disagree: "Listeye ekle" can never flip to the on-list state, and combo removal can silently miss the row it created |
| **C3** | Two lookup disciplines against the same catalog map | `comboMatch` uses `lookupNutrition` (which normalizes); `localMealPlan.calculateItemsNutrition` uses `catalog.get(item.foodId)` raw | Same conceptual question, two resolution rules — exactly what one resolver removes |
| **C4** | Two opposite failure behaviors for the same identity miss | `comboTotals` returns `null` → the **whole combo** is dropped; `calculateItemsNutrition` **skips the item** → silently partial totals | Both are "identity missed"; one fails safe-conservative, one fails silently-wrong-looking. Identity work must not change either accidentally (invariant 8) |
| **C5** | Alias asymmetry | `POST /api/nutrition` resolves `name_tr` ∪ `aliases`; the browse path's `pickNutrition` drops `aliases`, so `useFoodCatalog`'s map is alias-blind | `NutritionView` can resolve an alias; `TodayView`, `MealFoodPicker` and `PersonalPlanView`'s exclusion search cannot. A user searching an alias spelling to exclude a food finds nothing |
| **C6** | Per-user exclusions gate a per-household write | `personal_plan` (user-keyed) → `comboMatch` → `addComboToList` → household `items` | §20.7 |
| **C7** | An exclusion write shares a whole-row, debounced upsert with anthropometrics, and a failed save is only a console warning | `useMealPersonalization.ts:106–126` (600 ms debounce, whole-`PersonalProfile` PUT) and `:119–122` (`console.warn("[personalPlan] profile saved locally but failed to persist")`) | A safety-relevant exclusion can end up device-local only, with no user-visible signal — a **safety gap**, not just a UX one |
| **C8** | Exclusions are enforced at exactly one surface | `MealFoodPicker.tsx` takes `foods: Nutrition[]` and applies no exclusion filter; `NutritionAllFoodsBrowser` and `NutritionView` apply none either | The UI's promise *"öneriler bunları hiç göstermez"* is literally true only for combo suggestions |

### 20.7 User vs. Household Scope — Collision Mapped, Decision Preserved

**Not decided here, and deliberately not folded into Decision B** (§18.4, §19.5).

```text
   individual safety constraints            household shopping list
   (personal_plan, per app_users.id)        (lists/items, per households.id)
                |                                        |
                v                                        v
   individual recommendations   --addComboToList-->  shared execution surface
   (TodayView / comboMatch)                          (ActiveList, NutritionView)
```

**Where an implementation could leak, in both directions:**

- **Leak 1 — over-restriction outward.** User A's exclusions shape the suggestions A acts on; the combo A
  adds writes to the shared list. B sees a list quietly shaped by A's constraints with no indication why. A
  utility/fairness cost, not a safety failure.
- **Leak 2 — false assurance inward (the dangerous direction).** B opens the shared list and may reasonably
  read it as respecting *their* constraints. Nothing on that path consults B's exclusions — not
  `addComboToList`, not `ActiveList`, not `NutritionView`. If B has an allergy, a household list is not
  protective for B, and a class-aware exclusion built only against the *acting* user would not change that.
- **Leak 3 — aggregation without consent.** The naive fix (union every member's exclusions) leaks a
  member's health-relevant disclosures to the rest of the household by inference. Not decided here;
  named so it is not adopted by default because it looks safer.

**The architectural seam where a future decision plugs in:** `netlify/functions/_auth.ts`'s
`assertHouseholdAccess` (`:81–101`) is already the one place that resolves household membership server-side
— `households.owner_id` first, then a `household_shares` row matched by email. Any future scope rule
therefore has an existing, single join point: *household → member `app_users.id`s → their exclusion sets*.
Placing the seam there (rather than in a component) keeps the decision reversible and keeps per-user
disclosures out of client state. **Which rule goes in that seam is the unresolved human decision.**

### 20.8 `DEC-067` / `DEC-069` — What They Block and What They Do Not

**Neither is decided here.** `DEC-067` (preparation-detail depth) and `DEC-069` (restaurant-scale
batch-production scope) remain exactly as open as §8, §13, §14.9, §16.3 and §19.5 left them.

| Stage / capability | `DEC-067` | `DEC-069` |
|---|---|---|
| Milestone 1 (F1–F3) | **Independent** | **Independent** |
| Stage 1 safety (S1–S5) | **Independent** | **Independent** |
| Stage 2 `DEC-038` / candidate filtering | **Independent** | **Independent** |
| Stage 4 H1 combo→list through canonical identity | **Independent** (§16.4) | **Independent** |
| Recipe representation / construction / modification | **Blocks** | Independent |
| Portion as distinct from grams | **Blocks** | Independent |
| Yield + **household** scaling and meal-prep | **Blocks** (needs a recipe to attach yield to) | **Does not block** — Phase 8 rates household scaling/storage `ADEQUATE`/`STRONG` |
| Restaurant / quantity-food batch production | Independent | **Blocks**, and answering "yes" reopens a *knowledge* question per Phase 8 §11.2 |
| Preparation/storage metadata representation | **Blocks** | Independent |

**Stated plainly because the temptation runs the other way:** `DEC-069` must not be allowed to block
ordinary household batch preparation. Its unresolved question is *restaurant/professional scale*, which is
the only part the corpus does not support. `App Priority` confirms the asymmetry: `DEC-067` is `IMPORTANT`,
`DEC-069` is `OPTIONAL`.

### 20.9 `DEC-099` / `DEC-100` — Surfaces That Must Stay Behind the Clinical Boundary

**Both remain BLOCKED. Nothing below infers clinical scope.** The implementation surfaces that must stay
behind the boundary:

- Any **per-condition tailored guidance**, and any interpretation of a disclosed medical condition into an
  energy, macro, micronutrient or food-selection change — that is `DEC-100`'s own definition.
- Domain C's **detailed escalation criteria** (`DEC-012`–`016`); the conservative posture is `SPECIFIED`,
  the criteria are not. `DEC-012 ⇄ DEC-099` is the model's only bidirectional `REQUIRED` pair, so touching
  one reaches the other.
- Any handling of the **`DEC-053` "unclear" outcome beyond** the two things already specified: bias toward
  the safer hard treatment, and a **generic** prompt to consult a professional.
- Any **severity tiering** of an allergy or intolerance — explicitly not authorized by A1 either.
- Any output that reads as a **prescription** rather than an estimate.

**What is *not* behind the boundary, so it is not over-fenced:** conservatively excluding a **self-reported**
allergy. `DEC-053`'s own note is explicit that true allergy diagnosis is out of scope while classification
of a self-report is in scope, and it is `App Priority: CORE`.

### 20.10 Data Gaps — Four Distinct Kinds

Kept separate because the remedies are entirely different: one needs research, one needs an integration,
one needs a human decision, and one needs a rule.

| Kind | Items | Remedy |
|---|---|---|
| **Knowledge / data gap** | Per-Food allergen mapping (does not exist, not derivable from a name); micronutrient composition; nutrient-retention factors; food-composition coverage beyond 64 rows | Acquire or curate data. **Downstream of the vocabulary decision for allergens** — you cannot map to a vocabulary you have not chosen |
| **Product / data-integration gap** | Ingredient pricing (`DEC-073`); store availability (`DEC-074`); pantry state; structured quantity on `items.qty` (free text today) | Build or integrate a source. Already `FUTURE FEATURE`/deferred per Phase 3 for the first two |
| **Specification gap** | Recipe depth (`DEC-067`); batch scope (`DEC-069`); user-vs-household behavior; deviation policy (`DEC-070`); Domain O thresholds (`DEC-090`, `DEC-021`/`110`); **allergen class vocabulary**; **precedence mechanics** | A human/product decision. No amount of data closes any of these |
| **Safety gap** | The **unmapped-allergen default** (a fail-open default negates B3); enforcement at one surface only (C8); an exclusion silently persisted device-local on save failure (C7); an identity miss bypassing a check; expiry semantics (C2's invariant) | A rule plus a mechanism — and each must be decided *before* the mechanism it governs ships, not after |

**The allergen problem is deliberately split across two rows**: the *vocabulary* is a specification gap; the
*per-food mapping* is a knowledge/data gap; the *unmapped default* is a safety gap. Treating them as one
problem is what produces a fail-open default by accident.

### 20.11 Implementation-Safety Invariants

Architecture-level, not implementation detail. **1–8 are the required set; 9–11 are derived from A1/B3/C2
plus repository evidence and are marked as such.**

1. **An allergy cannot be downgraded to a preference.** Not by a migration default, not by a discarded
   reason, not by a UI that offers only one kind of entry.
2. **An intolerance cannot silently become a hard exclusion merely because the UI uses a binary list.**
   A1 is ratified; today's flat drop is *stricter* than specified, and "the code already does it" is not a
   reason to change the model.
3. **Unclear safety status cannot fail open.** It biases to the safer hard treatment (`DEC-053` +
   dependency-graph line 423) and routes to confirmation.
4. **An allergen-class restriction cannot be bypassed by omitting a food-level restriction** — B3's binding
   rule, verbatim. This includes the unmapped-food case: absence of an allergen tag must not read as "safe".
5. **Temporary safety restrictions cannot silently disappear at expiry.** Expiry produces a review, never a
   removal: `active → review trigger → user confirmation → retain / modify / remove`.
6. **Nutrition fuzzy matching cannot become an authority for safety decisions.** `isCloseMatch` stays in
   the shopping-catalog/autocomplete key space. Exclusion and composition lookups stay exact and
   fail-closed.
7. **Household shopping must not silently redefine an individual's safety constraints** — in either
   direction (§20.7's Leak 1 and Leak 2).
8. **Existing macro-calculation behavior must not be broken while safety architecture is introduced.**
   `scaleNutrition`/`sumMacros` and `calculateTargets`' outputs are held constant, *including* the two
   existing divergent missing-food behaviors (C4) — changing them is a separate, deliberate decision.
9. *(Derived — C7)* **A safety-relevant exclusion must not be silently unpersisted.** A failed save is a
   user-visible condition, not a console warning.
10. *(Derived — C2 applied to migration)* **No migration may weaken an existing exclusion.** Unclassified
    legacy entries retain the stricter behavior until the user reconfirms.
11. *(Derived — §20.1)* **The seven layer boundaries stay one-directional.** Composition never becomes a
    target; a calculation result never becomes a prescription; a shopping line never becomes inventory.

### 20.12 The First Implementation Boundary

```text
IMPLEMENTATION MAY START:
  Milestone 1 only — one canonical Food resolution point (alias-aware, exact,
  fail-closed) + an exclusion entry that carries its DEC-053/DEC-061 reason +
  consistent enforcement of that reason across the surfaces that present food +
  honest labeling that claims no allergy safety.

IMPLEMENTATION MUST NOT START YET:
  - Allergen vocabulary, allergen-class data, class-over-food precedence   (S3/S4 — human decision)
  - Any allergy-safety claim in product copy or behavior                   (false assurance, §18.4)
  - Validity windows / reconfirmation as a general feature                 (C2 — after the foundation)
  - DEC-038 dietary pattern and any change to macro allocation             (invariant 8)
  - Recipe representation, construction, modification, portion, preparation (DEC-067)
  - Restaurant-scale batch production                                      (DEC-069)
  - Pantry, structured quantity parsing, pricing, availability             (deferred / external data)
  - Household-vs-user scope behavior                                       (human decision)
  - Anything condition-specific or prescriptive                            (DEC-099/DEC-100, BLOCKED)
  - Replacing name_tr as the identity anchor                               (§16.1 A2, undecided)

FIRST IMPLEMENTATION MILESTONE:
  Food resolution + exclusion-reason foundation.

PREREQUISITES:
  - A1/B3/C2 ratification record (present).
  - This reconciliation (§20).
  - A decision from the user on test tooling, since the repo has no test suite
    and this milestone introduces safety-relevant behavior.
  - Nothing else. No new data, no external provider, no further human decision.

SAFETY INVARIANTS:
  §20.11 items 1, 2, 3, 6, 8, 9, 10 apply in full to this milestone.
  Items 4, 5, 7, 11 apply to what the milestone must NOT claim or pre-empt.

OUT OF SCOPE:
  Everything under "IMPLEMENTATION MUST NOT START YET", plus any change to a DEC
  definition, a stable ID, a Phase 1-8 artifact, or the macro arithmetic.
```

### 20.13 Status After This Pass

**Phase 9, sixth milestone: post-ratification implementation readiness and architectural reconciliation
complete.** Gate 7 (end of Phase 9) remains unopened. **Implementation has not started**; this section
defines the boundary at which it may.

**Still open, unchanged:** canonical Food identity's anchor (§16.1 A1/A2/A3); allergen vocabulary, mapping
completeness, the unmapped-food default and precedence mechanics (B3's own carve-outs); user-vs-household
scope (§18.4); `DEC-067`; `DEC-069`; `DEC-099`/`DEC-100`; `DEC-090` and `DEC-021`/`110` numeric values.

### 20.14 Self-Audit — This Pass Specifically

- **No implementation occurred.** No file under `src/`, `netlify/`, `supabase/`, `data/`, or `api/` was
  modified; the only files changed by this pass are this artifact, `docs/SESSION_CHECKPOINT.md`, and the
  stale descriptive text in `00_PROJECT_CONTROL/DECISIONS/README.md`.
- **§§0–19 are untouched.** Every correction and supersession above (§20.0's label collision, §20.4's
  reordering of §14.10) is recorded here rather than by editing an earlier section — the same precedent
  §0.1, §12.1 and §17 already set.
- **No `DEC` ID was created, amended, or renumbered**, and no stable ID changed. Every `DEC-###` above is
  quoted from `APP_DECISION_INVENTORY.md`, `DECISION_LOGIC_SPECIFICATION.md` §3.11 or
  `APP_DECISION_DEPENDENCY_GRAPH.md`, re-read this pass.
- **No open human decision was resolved.** `DEC-067`, `DEC-069`, `DEC-099`/`DEC-100`, canonical identity's
  anchor, the allergen vocabulary, the unmapped-food default, precedence mechanics, and user-vs-household
  scope are all carried forward as open; §20.7 maps the household collision without deciding it.
- **The ratification was not rewritten as pre-existing.** §20.2 states in its own column that `DEC-053`/
  `DEC-061` are **silent** on granularity and that `DEC-011`/`DEC-054` do **not** reach `DEC-061` — the two
  claims the ratification specifically warned against inverting.
- **No allergen list, class vocabulary, default behavior, duration, or numeric window was invented.** C2's
  `start` / `end / review point` / `reason` / `reconfirmation` appear once, labeled illustrative concepts,
  never as field names.
- **No clinical rule or threshold was invented**, and §20.9 fences the clinical surfaces without narrowing
  `DEC-099`/`DEC-100`.
- **Every repository claim was re-verified this pass**, and three findings are new rather than carried:
  the alias asymmetry between the fetch and browse paths (C5), the `addItem`-vs-`isOnList` matching
  disagreement (C2), and the console-only failure of a safety-relevant exclusion save (C7).
- **Both §17 corrections were preserved and re-verified**, including their exact scoping: `isCloseMatch`
  influences the shopping line, not the exclusion decision.
- **Readiness meant architecturally settled, not codeable.** #14, #15 and #19 are technically writable
  today and are classified blocked.
- **`DEC-069` was not allowed to over-block.** §20.8 separates household batch preparation from
  restaurant-scale production explicitly.
- **Phase 1–8 artifacts were read only.** Nothing in `03_`–`07_`, `09_`, `10_`, `11_` was modified.
