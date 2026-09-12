# Food recommendation and recipe layer research

## Status and reading guide

**Research proposal for human review — 2026-09-12.** No production code, food values, stable IDs, decision readiness, or ratified scope is changed. The COL tracker has no active item. This cross-decision investigation is not a PUSHED implementation spec and does not unlock blocked decisions.

The recommended direction is **a curated food-state and portion layer, with macro-driven candidate selection and a secondary micronutrient evaluation, followed by reusable meal components and optional ingredient-list recipes**. The current 89 foods provide a broad starting set. Identity, provenance, raw/cooked state, and missing nutrients are more limiting than food count.

| Deliverable | Location |
|---|---|
| A. Live food audit; B. coverage matrix | [Catalog audit](CATALOG_AUDIT.md), including all 89 rows |
| C. Prioritized additions | Section C below |
| D/E. Recommendation and micronutrient models | Sections D/E |
| F/G. Weight and substitution specifications | Sections F/G |
| H/I. Components and 24 recipe proposals | [Recipe proposal](RECIPE_PROPOSAL.md) |
| J/K. Recipe model and DEC mapping | Sections J/K |
| L. Evidence/source map | [Evidence map](EVIDENCE_MAP.md) |
| M/N. Human decisions and future requirements | Sections M/N |
| Reproducible audit input | [89-row snapshot](food-catalog-2026-09-12.json) |

**Evidence labels:** “Observed” means inspected live data or current code. “Evidence-supported” identifies an external or established curriculum source. “Proposed” is a design recommendation requiring review. “Unresolved” is neither an adopted parameter nor permission to implement.

## Findings that change the planning priority

Observed: live Supabase has 89 foods; the seed has 64. All major requested macro groups are represented, including oats, quinoa, milk, tahini, seeds, legumes, and seasonal fruits. No micronutrient columns exist. Twenty-four rows lack provenance, and only 19 contain any allergen-class mapping.

Observed: chicken/rice/bulgur/pulses reference raw or dry USDA records, while the UI and combos only record grams. Some reference matches are proxies: kaşar→cheddar, beyaz peynir→feta, Turkish milk→US vitamin-D-fortified milk. These must be reviewed before attaching micronutrients.

Observed: 16 existing combos are fixed ingredient lists, not recipes with measured yield. `matchCombos` filters by remaining kcal and ranks by soft-conflict status then protein; it does not solve the remaining carbohydrate/fat gaps. The source comments describe this as deliberate MVP behavior. A future balanced selector must not be presented as already shipped.

Proposed: prioritize a **data qualification pass**, then a representative chicken/rice/broccoli portion specification, then the broader component and recipe library. No universally essential new food is established by this audit. Some additions are conditional on dairy-free/vegetarian support or needed to represent a product already hidden behind an alias.

## C. Recommended additions

“Essential” below means essential to the stated conditional capability, not that every person needs that food. Nutrient roles are qualitative expectations, not newly supplied values. Each added record would require an exact product/state match, nutrient provenance, and allergen review. Seasonal descriptions are broad planning assumptions, not verified local availability or calendar rules.

| Food and category | Primary role / macro contribution | Important potential micronutrients | Practical use / substitutes | Seasonality | Necessity / priority | Evidence and data rationale |
|---|---|---|---|---|---|---|
| Verified plain strained yogurt; dairy | Convenient protein component; fat/carbs depend on product | Calcium/B12 vary with manufacture | Breakfast, bowl, sauce; ordinary yogurt or verified lor with recalculation | Year-round product | **Essential if “süzme yoğurt” remains selectable**; identity split, not variety expansion | Current alias points to ordinary whole-milk yogurt. Manufacturer composition needed; do not assign a generic high-protein value |
| Verified unsweetened calcium-fortified soy beverage; dairy alternative | Plant protein plus variable fat/carbs | Calcium; B12/D only if label confirms | Oat bowl, beverage; milk if acceptable, verified alternative product | Year-round shelf product | **Essential alternative capability if dairy-free users need a comparable calcium/protein option**; exact product selection conditional | Fortification is product-specific; soy is an allergen. Almond/oat beverages are not assumed protein equivalents.[^7] |
| Calcium-set tofu; plant protein | Savory protein component, different carb/fat tradeoff from pulses | Calcium only with verified coagulant/profile; iron | Vegetable/grain bowl; legumes with larger macro recalculation | Year-round product; local access unverified | **Recommended**, especially vegetarian/dairy-free scope; not required for omnivorous launch | Adds a function not served identically by starch-rich pulses; calcium varies by preparation.[^7] |
| One sardine product/state; seafood | Protein plus fat; oily-fish alternative | B12/D; calcium only if edible bones are included | Fish/grain plate; salmon, or locally available hamsi after distinct matching | Canned year-round; fresh availability regional | **Recommended**, not essential | Adds affordable/local-style option in principle, not a price claim; species/draining/bones and fatty acids need exact source.[^8] |
| Green/brown lentil, dry reference plus cooked route; legumes | Protein/carbs/fiber | Folate, iron, magnesium | Holds shape in salad/grain dish; chickpeas/beans | Shelf-stable year-round | **Recommended** for culinary function; existing red lentil cannot always preserve texture | Match lentil type/state, not a new “superfood”; current red-lentil soup role already covered |
| Domates salçası, defined salt status; preparation staple | Concentrated tomato base; measured carb contribution | Carotenoids; sodium must be captured | Stews/sauces; existing tomato with adjusted water and cooking | Preserved year-round | **Recommended** for Turkish meal-prep practicality | Distinct ingredient from ketçap; manufacturer or licensed Turkish data preferred |
| İyotlu tuz, specified product; seasoning | No macro role | Iodine and sodium | Replace the recipe's chosen salt when appropriate; plain salt is not iodine-equivalent | Year-round | **Essential metadata distinction if iodine accounting is offered**, not advice to use more salt | Existing “tuz” does not establish iodization; iodine varies. Sodium constraints must remain visible.[^9] |
| One verified lor product; dairy | Potential convenient protein component | Calcium/B12 depend on manufacturing | Egg plate, bread filling; strained yogurt or existing cheese | Year-round product | **Optional** after yogurt/product cleanup | “Lor” cannot inherit cottage-cheese values automatically; may duplicate the strained-yogurt protein role |
| Mandarin; fruit | Practical portable carbohydrate/fruit portion | Vitamin C | Orange substitute; apple is functionally similar but different C contribution | Broad autumn/winter candidate | **Optional** | Orange already covers winter vitamin-C fruit; add only for preference/access demand |
| Semizotu; leafy vegetable | Summer salad/side role, little energy | Candidate mineral/carotenoid contribution; profile needed | Yogurt side; spinach/karalahana with preparation change | Broad warm-season candidate | **Optional** | Adds Turkish culinary flexibility, not a proven micronutrient necessity |

Before new foods, qualify existing raw/cooked states for chicken, rice, bulgur, pasta, potatoes, eggs, and pulses. These are **state records or conversion data**, not evidence that the food set itself lacks those foods. Verify generic beans, cheese, milk, karalahana, drained tuna, and salt before enrichment. No immediate addition is proposed for avocado, more nuts, quinoa, oats, milk, exotic fruit, protein powders, or organ meats: existing roles suffice, or a separate need has not been established.

The smallest useful set is context-dependent. Define a candidate universe of qualified existing foods; demonstrate a feasible set of realistic meal components for approved target/restriction scenarios; add a food only when it resolves a named failure. No exact minimum count is asserted.

## D. Food recommendation architecture

The proposed operating sequence keeps the upstream personalized target authoritative:

The concurrent [energy-individualization research](../../12_ENERGY_INDIVIDUALIZATION/ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md), §§7 and 12–13, proposes targets carrying value, interval, source, evidence basis, and as-of time. Preserve that information at this interface; do not collapse an uncertain target to a falsely exact food portion. That document is also a research draft, not an implemented dependency. Its inherited energy → macro adjustment boundary is respected: food selection does not alter the energy prescription, and consumption/feedback can influence targets only through the separately governed reassessment path.

```text
Versioned personalized target + intake completeness
                 ↓
Consumed food → remaining energy/macros
                 ↓
Background micronutrient context (or explicit unknown)
                 ↓
Qualified food candidates → identity/allergen/preference filters
                 ↓
Practical state-specific portions ↔ nutrient recalculation
                 ↓
Meal component → optional recipe variant → user choice
                 ↓
Confirmed consumption → monitoring → governed feedback
```

Hard exclusions should be applied as early as practical and rechecked after every substitution. The diagram is an operational proposal, **not new formal DEC dependency edges**. Planned food and consumed food are separate: optionally show projected remaining needs after planned meals, but never silently count a plan as intake.

| Stage | Required inputs | Output | Decision character | Uncertainty |
|---|---|---|---|---|
| Target interface | Upstream target version, date, applicable profile/scope, units | Target contract, no recalculated prescription | Deterministic consumption of personalized result | Target estimate versus individualized evidence |
| Intake accounting | Food-state IDs, actual amounts, time/day, source version, logging completeness | Logged nutrient totals plus completeness | Deterministic arithmetic | Missing meals and uncertain portion sizes |
| Remaining need | Target and consumed totals; optional separately labeled planned totals | Signed remaining vector, overages, unknown fields | Deterministic under an approved missing-data policy | No certainty that unlogged intake is zero |
| Micronutrient context | Per-nutrient composition and provenance; approved reference set; history if available | Known contributions and unresolved coverage | Personalized interpretation; longitudinal for repeated patterns | Unknown nutrient values, incomplete days |
| Candidate construction | Approved food roles, macro need, meal occasion | Foods/components that can address the need | Personalized selection; policy deterministic once approved | Infeasible combinations, food match confidence |
| Filtering | Canonical identity, allergies/exclusions, preference/restriction inputs | Eligible set with reasons | Deterministic safety semantics, personalized inputs | Unknown allergens cannot become “safe” |
| Portion proposal | State profile, portion vocabulary, feasible bounds, portion mode | Practical grams and projected totals | Deterministic calculation under reviewed bounds | Yield/measurement approximation |
| Meal assembly | Allowed roles and combinations | Component/ingredient-list proposal | Curated product/culinary judgment | Nutrient fit does not prove palatability |
| Recipe association | Versioned recipe ingredients, supported variants | Optional named preparation | Deterministic lookup or approved variant generation | No generic recipe-generation authority |
| Feedback | Actual consumption, acceptance/rejection, complete histories | Updated recommendation context | Longitudinal personalization | Rejection is not nutrient intolerance; weight change is not direct causation |

The engine should emit food name, gram amount **with explicit state**, meal/component name, expected macro contribution, one useful reason, substitutions if eligible, and a compact data limitation where it matters. It should preserve an inspectable explanation: target version, input totals, excluded candidates, portion assumptions, composition sources, and any unresolved constraint.

Examples of conceptual responses: “This chicken-and-rice component addresses the remaining protein and carbohydrate need”; “No suitable option under the current exclusions”; “Today's log is incomplete, so the remaining estimate may be high.” These are proposed semantics, not finalized Turkish UI copy.

When one macro is already above target, keep that fact rather than issuing negative portions or automatically removing eaten food. When targets cannot be jointly satisfied, offer transparent tradeoffs or no suggestion. No weights between kcal, protein, fat, carbohydrate, convenience, or variety are selected here. A target band and an allowable departure are human/scientific decisions, not hidden constants.

### Architecture alternatives

| Model | Benefit | Failure mode | Recommendation |
|---|---|---|---|
| Current kcal cap + protein sort | Simple and present in code | Ignores carbohydrate/fat balance and nutrient coverage | Baseline comparator only |
| Curated components + transparent macro matching + background nutrient evaluation | Explainable; bounded culinary space | Needs approved portion rules and composition metadata | Preferred initial design |
| Full diet optimization solver | Can express simultaneous nutrient and food constraints | False precision, infeasibility, unrealistic portions if acceptability poorly modeled | Research/validation option later |
| Unrestricted language-model food/recipe generation | Flexible language and suggestions | Unsupported values, unsafe substitutions, untraceable constraints | Not a nutrient or safety authority |

Original diet-modeling research demonstrates that nutrient constraints can be combined with proximity to habitual food choices; it does not validate this app's proposed ranking rule or a minimal Turkish catalog.[^4] Candidate enumeration, lexicographic policies, or optimization are implementation alternatives to evaluate after approved constraints exist.

## E. Micronutrient background layer

**Evidence-supported principle:** dietary quality includes adequacy, balance, diversity, and moderation, rather than macro fit alone.[^2] **Proposed product architecture:** let macro need drive the practical selection, with micronutrient quality informing choices and an explicit inability to assess when composition is missing. “Secondary” refers to the interface and selection role, not biological importance.

This aligns with existing **DEC-043**, whose output is food-source guidance as a **soft preference/boost**, feeding **DEC-062** under a fixed macro budget. Turning every micronutrient into an absolute daily feasibility gate would change that design; it is not adopted here.

Dietary reference methods distinguish planning usual intake from interpreting an individual's inadequacy. RDA/AI are not diagnosis thresholds, and an intake below AI does not by itself establish inadequacy. Excess assessment depends on the specific nutrient and applicable upper-limit scope.[^3] Reference choice for Turkey—TÜBER, EFSA, or DRI-derived policy—remains open; never mix convenient values across systems without documenting why.

### Proposed representation

Maintain a vector of nutrient contributions and evidence states, not an arbitrary aggregate score. Candidate panel for review: calcium, iron, zinc, magnesium, potassium, iodine; vitamins A, C, D, E, K, B12, folate, and relevant B vitamins. The panel is not a ratified screen. Sodium, saturated fat, fiber, and fatty-acid classes belong in adjacent dietary-quality evaluation; omega-3 fatty acids are not micronutrients.

For each field distinguish **known value**, **measured zero**, **below quantification**, **missing**, and **estimated/imputed**. Preserve units and forms (e.g. folate versus DFE, vitamin A RAE versus other expressions). Sum only compatible quantities; unknown portions remain unknown. A total from partially known ingredients is an incomplete contribution, not a complete daily total.

Proposed progressive capabilities:

1. **Current data:** macro contributions only; food-group diversity observations may support a qualitative pattern explanation, never a micronutrient-adequacy badge.
2. **Qualified composition:** show a candidate's sourced nutrient contributions; mark coverage unknown for missing components.
3. **Approved references and sufficient intake context:** interpret repeated potential gaps with DEC-041/042 semantics and use DEC-043 guidance to influence eligible candidates.
4. **Future longitudinal feedback:** consider repeated accepted meals, dietary pattern, and logging reliability through monitoring decisions. Do not adjust prescription here.

No fixed number of days, coverage percentage, scoring weights, deficiency threshold, or food-frequency rule is invented. A single poorly logged day cannot establish chronic inadequacy. Food-log coverage cannot prove absorption or clinical status.

Selected food-level constraints matter: dairy and some fortified products can support calcium; spinach is not an equivalent calcium replacement merely because a table lists calcium.[^7] Vitamin C can help absorption of plant-source iron, but this does not supply an individual absorption multiplier.[^10] Ordinary mushrooms are not assumed rich in vitamin D; species and UV exposure matter.[^11] Walnut/chia ALA is not interchangeable with fish EPA/DHA.[^8]

The visible user experience can remain a meal recommendation and an occasional reason such as “adds a vegetable component.” Do not claim “micronutrients covered” until the referenced scope, ingredient completeness, and interpretation rules support it. Hard allergy rules never yield to nutritional benefit.

## F. Raw/cooked weight specification

### Evidence-supported recommendation, pending approval

Use **per 100 g edible portion in an explicitly defined food state**, with separate state-specific nutrient profiles or approved conversions. Do not impose “all raw” or “all cooked” across the entire catalog. USDA documents edible-portion quantities and food descriptions; FAO recipe methods distinguish yield from nutrient retention and allow appropriate cooked composition or calculation from raw ingredients.[^1][^5]

| Concept | Meaning | Proposed record responsibility |
|---|---|---|
| Food identity | Which real-world food/product | Preserve current opaque Food UUID; aliases are names, not nutrition equivalence |
| Reference state | Raw, dry, boiled/drained, roasted, canned/drained, ready-to-eat, etc. | State descriptor, edible material, method, additions, moisture/reference basis |
| Nutrient profile | Amounts per 100 g in that state | Source ID/version, component units, missingness, applicability |
| Practical portion | A measured amount of the selected state | Grams; optional household measure with food/state-specific evidence |
| As-purchased quantity | Includes bone/peel/shell/liquid where relevant | Separate from edible grams; documented edible fraction if converted |
| Yield observation | Relationship between prepared input/output mass | Food/method or batch-specific, measured or sourced; provenance |
| Retention estimate | Nutrient-specific change through preparation | Separate from mass yield; source/method, uncertainty, applicability |
| Meal component | Nutrient/culinary role and compatible foods | No hidden state conversion |
| Recipe | Ingredient-state references and preparation/output | Final edible yield and portions, once that capability is approved |

FAO's recipe method supports using cooked composition with appropriate weight handling, or raw composition with yield/retention corrections.[^5] **Do not apply retention factors a second time to already cooked composition.** USDA retention tables provide nutrient/method factors, but the available Release 6 is from 2007; availability is not authorization to apply a universal factor.[^6]

### Chicken + rice example without invented ratios

A preparation-oriented view may propose **raw boneless chicken grams + dry rice grams + raw edible vegetable grams** once portions are specified. A ready-to-eat logging view may use **cooked chicken + cooked rice + cooked vegetable grams**. Both views must reference their own state or a documented transformation.

Record dry rice and water separately, then measure final cooked rice yield if batch-specific portioning is desired. Water absorption changes mass; it does not create carbohydrate. Chicken can lose water and fat/drippings; output mass change alone does not reveal nutrient retention. Added oil or sauce is a separate ingredient with consumed/retained amount accounted for, not an invisible cooking default.

For a mixed dish, sum applicable ingredient nutrient contributions and allocate them to final edible output using measured/sourced yield. Uniform allocation by cooked mass assumes a reasonably homogeneous mixture. A plate with a separate chicken piece and rice mound should retain component-level allocations; one fraction of total plate weight does not establish the fraction of protein.

No fixed “rice triples” or “chicken loses a quarter” rule is adopted. If no defensible cooked conversion exists, show the raw/dry weighing instruction or request the actual state instead of inventing a cooked equivalent. Dry-food-basis data (e.g. zero-moisture analytical records) must not be treated as edible product as purchased.

### Food-specific planning rules

| Food/use | Preparation-oriented quantity | Consumption-oriented quantity | Required clarification |
|---|---|---|---|
| Rice/bulgur/pasta | Dry edible grams | Cooked grams, method/draining specified | Water gain, oil/sauce, distinct prepared recipe |
| Chicken/meat/fish | Raw edible flesh, cut/fat/skin/bone specified | Cooked edible flesh | Method, drippings, bone removal, oil |
| Eggs | Shell-free raw egg ingredient or verified count-to-mass | Prepared edible egg | Shell discard; cooking fats separate |
| Dry pulses | Dry cleaned edible seeds | Cooked/drained pulses | Soaking/cooking, discarded liquid, salt |
| Canned tuna/pulses | Drained edible solids if profile is drained | Same drained state | Oil/brine retained or discarded |
| Yogurt/cheese/bread | Ready-to-eat product weight | Same state if unmodified | Brand, fat, fortification, moisture |
| Fruit/vegetables | Specified edible peel/skin/core basis | Raw edible or named cooked state | Purchased weight differs from edible portion |
| Oil/tahini/nuts | Grams of actual edible ingredient | Consumed grams | Shells, spoon density, oil left in pan |
| Soup | State-defined ingredients plus water | Final soup mass/verified serving | Final water yield and homogeneity |

### Existing risk and migration boundary

The current chicken-rice combo includes 150 g “pirinç” and uses the dry reference. Its rice contribution calculates to **547.5 kcal** from the existing 365 kcal/100 g row. That is a correct calculation of the stored dry reference, not evidence that the intended bowl contains 150 g dry rice or that a cooked 150 g portion has this energy. The chickpea salad has the same state ambiguity. Existing recipe quantities must be revalidated, not reused as researched serving recommendations.

Future migration must not relabel historical gram entries raw/cooked retrospectively without evidence. Preserve their original value, source, and unknown-state status; distinguish revised recipes from prior logs. Whether a state is a child record or a separate linked Food identity remains a product/schema decision. This research proposes the semantic separation only.

## G. Seasonal substitution model

A good substitute is **eligible for the user, serves the relevant culinary role, and preserves the selected nutritional purpose sufficiently under approved tolerances after portion recalculation**. It need not have an identical nutrient profile. Equivalence is contextual and can be directional.

Represent separate dimensions: Food UUID and state; component role; source/target relation; macro contribution at a realistic portion; known micronutrient change; culinary function/texture; relevant dietary exclusions; region and seasonal availability evidence; preference; uncertainty. Seasonal availability should distinguish locally harvested, stored, greenhouse, imported, frozen/canned, and user-reported available. A country-level month flag cannot prove store stock or price.

| Proposed exchange | Preserved role | Recalculate / disclose | Boundaries |
|---|---|---|---|
| Strawberry → orange | Vitamin-C-oriented fruit side | Carbs, portion mass, texture/acidity | Broad seasonal example; not verified month rule |
| Peach → pear/apple | Fruit topping/snack | Carbs/fiber; raw versus cooked topping | Does not promise same vitamin C |
| Banana → apple | Portable fruit/carbs | Portion and potassium contribution | Not an automatic potassium-equivalent swap |
| Rice → bulgur | Starch side | State, fiber/protein, realistic portion | Bulgur has gluten; allergy filter first |
| Chicken → turkey | Lean-protein role | Cut/state and portion | Confirm preference and allergens in prepared products |
| Salmon → tuna | Fish/protein role | Fat, EPA/DHA, vitamin D | Not equivalent for oily-fish role; species guidance needed |
| Summer zucchini → winter cauliflower | Cooked vegetable side | Cooking method, texture, nutrient changes | Functional, not identical nutrient exchange |
| Chickpeas → green lentils | Whole pulse component | Carbs/protein/fiber and texture | Red lentils may not hold shape |
| Yogurt → fortified soy product | Bowl base/calcium-protein role | Actual label, consistency, B12/D | No unverified fortification; soy exclusion respected |
| Fresh vegetable → plain frozen same vegetable | Similar ingredient role | Blanching/state, moisture, additions | No blanket nutrient identity assumption |

WHO recognizes suitable frozen/canned produce as useful options, subject to additions such as salt or sugar.[^2] Local seasonal calendars still require a selected regional source. Ministry strawberry guidance illustrates that cultivar and cultivation conditions affect availability; it does not establish one universal calendar.[^12]

A substitution proposal should identify what is preserved and what changes. Re-run identity/allergen filters and nutrient evaluation after substitution; do not transfer safety metadata from the replaced food. Never use a same-group label, fuzzy name match, or nutrient similarity as an identity rule.

## J. Recipe data model

**Recommended conceptual relationship:** Recipe version → ingredient lines → Food identity + state-specific nutrient profile. Recipes should not maintain independently editable duplicate nutrient facts. Derived totals can be cached for performance or preserved for historical reproducibility, with input versions and calculation provenance.

| Object | Proposed information | Reason |
|---|---|---|
| Recipe definition/version | Name, ingredient lines, component roles, optional concise prep note, status | Curated reproducible proposal; retain prior versions |
| Ingredient line | Food UUID reference, state/profile reference, amount, unit/basis, role, mandatory/optional status | Eliminates ambiguous names and invisible ingredients |
| Variant/substitution | Exact replacement references, reason, role compatibility, recalculated quantities | Explicit variant, not silent mutation |
| Preparation result | Actual batch composition and final edible yield where approved | Distinguish plan from what was cooked |
| Serving/allocation | Ingredient amounts or documented output fraction; rounding policy | “Serves N” alone does not establish consumed mass |
| Nutrition result | Derived amounts, component missingness, source versions, retention/yield provenance | Reproducibility without duplicate authority |
| Consumption record | Chosen variant, actual state/quantity, date, composition version | Monitoring reflects food actually eaten |
| Preference/availability context | Explicit user inputs and timestamps | No inferred allergy or guaranteed stock |

Uniform whole-recipe scaling preserves ingredient ratios, whereas component adjustment changes the recipe and its macro balance. Both require recalculation. Culinary feasibility restricts independent changes: eggs may bind, water hydrates grains, oil affects a sauce, and removing a binding ingredient can invalidate a dish. No unrestricted optimizer should change every ingredient independently.

The existing immutable **PreparationBatch** already snapshots food-name-space composition. Reuse its ownership of a preparation event rather than introducing a competing batch ledger. Its quantity is not measured cooked yield. Current combo/meal/batch `food_id` values are names, while nutrition `food_id` is a UUID; future adapters/migrations must distinguish them explicitly and preserve stable IDs. No migration is supplied.

**Scope boundary:** DEC-067 ratifies ingredient list + quantities + optional concise text. Structured steps and formal preparation methods remain deferred; DEC-069 allows household batch capability, not a general recipe engine. The proposal's future yield model requires review of those boundaries. The [24 proposals](RECIPE_PROPOSAL.md) can be reviewed as ingredient-list concepts now without claiming structured-recipe implementation approval.

## K. DEC mapping and gaps

Definitions and formal edges remain owned by [APP_DECISION_INVENTORY](../../05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md) and its sibling dependency graph; readiness remains owned by [DEC_REGISTER](../../DEC_REGISTER.md).

| Area | Existing DEC IDs | Connection and current boundary |
|---|---|---|
| Profile/baseline | DEC-005–011 | Sufficiency, plausibility, refusal/conflict/staleness; optional personalization cannot assume nonexistent history |
| Goals/energy | DEC-001–004, DEC-017–024 | Consume upstream estimates/targets; do not reopen formulas or reconciliation |
| Body/weight | DEC-025–030 | Future observed-response context; blocked monitoring prerequisites remain |
| Macronutrients | DEC-031–040 | Existing daily/occasion targets; dietary-pattern and conflict rules not silently filled |
| Micronutrients | DEC-041–045 | Adequacy interpretation → guidance; all currently BLOCKED; panel and references unresolved |
| Meal structure/timing | DEC-033, DEC-055–059 | Allocate to occasions; training timing and schedule data cannot be inferred |
| Food candidates | DEC-060 | SHIPPED MVP; current calorie/protein sorting is not complete macro-gap optimization |
| Restrictions | DEC-053, DEC-061 | SHIPPED allergy/intolerance distinction; DEC-061 PARTIAL due to metadata coverage |
| Nutrient-quality ranking | DEC-062 | BLOCKED; consumes DEC-043 soft guidance within macro budget |
| Substitution | DEC-063 | BLOCKED; seasonal/functional matching belongs here; “preserving nutrient contribution” needs explicit operational interpretation |
| Cost/culture/pantry | DEC-064–065, DEC-106–107 | Regional preferences relevant; live prices/pantry absent; no presumed inventory |
| Meal construction | DEC-066 | COVERED by curated combos; proposed component/recipe library is a refinement |
| Preparation detail | DEC-067 | SHIPPED, ratified Level 1; structured steps/yield not silently introduced |
| Constraint matching | DEC-068 | DEFERRED; static complexity descriptions do not implement equipment/skill matching |
| Batch/leftovers | DEC-069 | SHIPPED household batches; measured yield and retention not already solved |
| Deviations/shopping | DEC-070–075 | Reflect actual changes; DEC-071 PROVISIONAL, pantry/cost/store remain blocked or deferred |
| Monitoring | DEC-076–080 | Intake capture exists in part; completeness/quality rules require further specification |
| Feedback/adaptation | DEC-081–091 | Future loop; no prescription adjustment from acceptance or single-day gaps |
| Training/supplements | DEC-092–098 | Context only if captured/authorized; no supplementation or sport-specific rules here |
| Clinical/life stage | DEC-012–016, DEC-099–105 | Preserve clinical and special-population boundaries |
| Evidence/uncertainty | DEC-108–112 | Provenance, conflict, confidence; governance update process remains deferred |

Possible **unnumbered requirements for human classification**:

- Food-state/composition provenance ownership, source-version correction, and missingness semantics span several DECs but are primarily data governance. Decide whether documentation under existing food identity and DEC-112 is sufficient.
- Reference nutrient panel/jurisdiction and evidence for adequacy interpretation belong under DEC-041/045; no new ID is needed merely for a list of nutrients.
- Seasonal metadata feeds DEC-063/064. Recipe-role equivalence may need a clarified interpretation of DEC-063, not an invented replacement decision.
- Culinary portion bounds and measured recipe yield span DEC-060/066/067/069. Determine whether extending existing ratification is necessary.
- A recipe library's publication/revision lifecycle may need a distinct product requirement if existing DEC-111 governance is insufficient; leave it unnamed and unnumbered.
- Source licensing and data permissions are operational prerequisites, not new nutrition decisions.

A research package can describe these blocked capabilities without reclassifying them as workable or adding them to the one-active-item handoff tracker.

## M. Open decisions for review

| Decision to approve or revise | Proposed direction | Still unresolved / implementation effect |
|---|---|---|
| Initial population and restrictions | Existing adult nonclinical scope; explicitly nominate supported dietary patterns | Determines whether dairy-free additions are essential |
| Catalog scope | Qualify existing foods first; selective conditional additions | No exact minimum count certified |
| Composition providers | FDC plus appropriately matched local data; evaluate TürKomp rights and CoFID fallback | No purchased license, automatic import, or major corpus admission |
| Identity/state ownership | Preserve Food UUID; explicit state/profile relationship | Child profile versus separate linked Food; migration mapping |
| Proxy cleanup | Review cheeses, milk, beans, rice, karalahana, kabak provenance | No silent correction or retrospective relabeling |
| Micronutrient panel and reference system | Approved small panel, explicit unknowns, usual-intake interpretation | Nutrients, jurisdiction, population and upper-limit scope |
| Micronutrient influence | DEC-043 soft guidance + DEC-062 ranking | No numeric score, weights, completeness threshold, or new hard constraint |
| Macro matching | Transparent multi-macro fit and realistic portions | Acceptable departure, ranking priorities, infeasibility behavior |
| Portion/yield model | State-specific grams; measured yield where appropriate | Source selection, retention applicability, density and rounding |
| Seasonal model | Regional, contextual, overrideable availability | Source/region/calendar maintenance and preference policy |
| Recipe scope | 24 Level-1 ingredient-list proposals, curated variants | Selection and kitchen calibration; structured steps remain outside approval |
| History/versioning | Preserve original input and source context | Recalculation versus historical snapshots and correction policy |
| DEC/handoff sequencing | Data qualification before dependent single-DEC specs | Any ratification amendment; nothing PUSHED by this research |

## N. Future implementation requirements and verification

These are prerequisites for later authorized work, not tasks executed here:

1. Approve the relevant Section M choices and select one bounded handoff item; write its “Build this,” exclusions, and self-close checklist under the existing template.
2. Define qualified food identity/state contracts, resolve documented collisions without losing historical links, and curate allergen coverage under existing semantics.
3. Acquire permitted composition data; reconcile source descriptions, units, carbohydrate conventions, fortification, nutrient forms, missingness, and profile versions. Do not fill absent values with zeros.
4. Define portion and state transformation contracts; validate chicken/rice and pulse examples using measured preparation and source-matched nutrient methods before generalization.
5. Define deterministic candidate selection and explicit tradeoffs using upstream target versions and logged versus planned intake.
6. Enable micronutrient interpretation only when the data, reference, population, and intake-completeness contracts are approved; otherwise report unknown coverage.
7. Calibrate the proposed meal components and recipes in home preparation; record actual edible yield, practical portion ranges, required cooking additions, substitution limitations, and observed acceptability.
8. Integrate with existing meal/batch/consumption ownership, then shopping, without treating shopping stock as pantry data.
9. Later implementation verification: `npm run build`, relevant backend typecheck if touched, and actual `npm run vercel:dev` flows. No test suite or standing test files are proposed.

A later scenario review should include chicken/dry-rice versus cooked-rice input; cooked/drained chickpeas versus dry; mixed plate versus homogeneous soup allocation; oil left in pan; shell/bone refuse; repeated ingredient; alias collisions; unknown allergens; ordinary versus strained yogurt; US-fortified versus local milk; incomplete intake; a macro overage; no eligible candidate; season swap changing a nutrient role; and historical recipe-version replay.

**Package verification completed:** snapshot has 89 rows and 89 distinct UUIDs; audit includes all 89 exactly once; all 64 seed names exist live, with 25 additional live names. All 141 backticked ingredient references on the 24 recipe ingredient lines exist in the snapshot. Seven existing combo IDs are referenced and preserved as candidate predecessors. Local document links resolve and every explicit DEC ID exists in the canonical inventory. The build passed with a Vite bundle-size warning. No production code or food records were edited; no standing verification script was created. Concurrent changes outside this package are not certified by this research review.

### Self-audit and limitations

The central architectural proposal is defensible, not clinically validated. Food presence does not prove intake adequacy. Complete nutrient data would not prove absorption. Matching macros does not guarantee palatability, adherence, affordability, or adequate long-term diet. Regional seasons and household preparation yields remain variable.

The seven original books are connected through the repository's existing verified TOCs and prior analyses; their source files are absent from this checkout, so no new direct reading of their full chapters is claimed. TürKomp is not an unrestricted free application dataset. No stored food values are corrected by this research. The final recipe grams, nutrient reference values, clinical boundaries, and ranking thresholds remain open.

## Sources

The [evidence map](EVIDENCE_MAP.md) supplies the full local-source hierarchy, bibliographic/source limitations, and claim-to-source mapping. External sources accessed 2026-09-12:

[^1]: USDA ARS, [Foundation Foods Documentation](https://fdc.nal.usda.gov/Foundation_Foods_Documentation/), April 2024, sections Food Descriptions, Nutrient Data, and Weights.
[^2]: WHO, [Healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet), 26 January 2026.
[^3]: Institute of Medicine, [Dietary Reference Intakes: Applications in Dietary Planning — Summary](https://www.ncbi.nlm.nih.gov/books/NBK221361/), 2003; use as methodology, not current nutrient-value table.
[^4]: Maillot et al., [Individual diet modeling translates nutrient recommendations into realistic and individual-specific food choices](https://pubmed.ncbi.nlm.nih.gov/19939986/), American Journal of Clinical Nutrition, 2010; abstract inspected.
[^5]: FAO, Greenfield and Southgate, [Food Composition Data — recipe calculation procedure](https://www.fao.org/4/y4705e/y4705e23.htm), 2003; [calculated composition and uncertainty](https://www.fao.org/4/y4705e/y4705e15.htm).
[^6]: USDA ARS, [Nutrient retention factors](https://www.ars.usda.gov/northeast-area/beltsville-md-bhnrc/beltsville-human-nutrition-research-center/methods-and-application-of-food-composition-laboratory/mafcl-site-pages/nutrient-retention-factors/), Release 6, 2007.
[^7]: NIH ODS, [Calcium — Health Professional Fact Sheet](https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/), Sources of Calcium.
[^8]: NIH ODS, [Omega-3 fatty acids](https://ods.od.nih.gov/News/The_Scoop_-_Spring_2017.aspx), Spring 2017; food-source distinction corroborated by [health professional fact sheet](https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/?source=organic).
[^9]: NIH ODS, [Iodine — Health Professional Fact Sheet](https://ods.od.nih.gov/factsheets/Iodine-HealthProfessional/), Sources of Iodine.
[^10]: NIH ODS, [Vitamin C — Consumer](https://ods.od.nih.gov/factsheets/VitaminC/Consumer/), food sources and nonheme-iron absorption.
[^11]: NIH ODS, [Vitamin D — Health Professional Fact Sheet](https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/), Sources of Vitamin D.
[^12]: Türkiye Ministry of Agriculture, Dr. Sami Süzer, [Çilek Tarımı](https://arastirma.tarimorman.gov.tr/ttae/Sayfalar/Detay.aspx?SayfaId=82), cultivation and cultivar context; page date not stated.
