# Phase 8 Execution Record — On Cooking 7e

**Date:** 2026-09-07
**Phase:** 8 — Practical Translation
**Relationship to Gate 6:** Execution of the already-authorized bounded eighth-source extension. This record
does not reopen Gate 6 or alter its high-level decision.
**Selected candidate in the original Gate 6 record:** Brown, _Understanding Food: Principles and
Preparation_, 7th ed.
**Actual source inspected:** Labensky, Martel, Hause, _On Cooking: A Textbook of Culinary Fundamentals_,
7th Edition (2023 update), Pearson.

## 1. Source identity and verification

- **Title:** _On Cooking: A Textbook of Culinary Fundamentals_
- **Authors:** Sarah R. Labensky, Priscilla A. Martel, Alan M. Hause
- **Edition/update:** 7th Edition, 2023 update, based on the filename, PDF metadata, and 2023 document
  creation/modification metadata.
- **Publisher metadata:** Pearson Education (US).
- **Format:** PDF (`%PDF-1.4`), 660,745,012 bytes.
- **Readability/completeness evidence:** 1,249 pages; not encrypted; first and final pages are readable;
  extraction succeeded across all pages; the final page is an intentional blank page. The file is therefore
  sufficiently complete for this inspection. This is a verification conclusion, not a claim that every
  edition page is semantically perfect.
- **Source location:** `nutrition-curriculum/01_SOURCE_BOOKS/` (git-ignored source area). The source file
  itself was not modified.

The Gate 6 record's Brown selection remains a historical record of the initial candidate. Brown was not
available for inspection. On Cooking 7e is recorded here as the actual bounded source used for execution
because it satisfies the same bounded practical-translation intent and provides directly inspectable
coverage. This substitution is explicit, not a silent rewrite of the Gate 6 decision record.

## 2. Inspection method and inspected sections

The PDF was text-extracted outside the repository and searched by high-specificity terms. Hits were read
in page context; marker counts were not treated as evidence by themselves. The inspection covered the
front matter and the substantive text of these sections:

- Chapter 2, Food Safety and Sanitation (approximately PDF pages 57-77)
- Chapter 3, Nutrition and Healthy Cooking (approximately pages 78-105)
- Chapter 4, Menus and Recipes (approximately pages 106-127)
- Chapter 6, Knife Skills (approximately pages 128-150)
- Chapter 9, Mise en Place (approximately pages 208-238)
- Chapter 10, Principles of Cooking (approximately pages 239-262)
- Chapter 11, Stocks and Sauces (approximately pages 263-297)
- Chapter 13, Principles of Meat Cookery and the food-class chapters for poultry, fish, vegetables,
  fruits, grains/pasta, and plant-based cooking
- Chapters 23-27, bakeshop and plant-based preparation material where relevant
- Chapter 28, Charcuterie, for preservation and batch/storage evidence
- Chapter 30, Principles of the Bakeshop, for formulation, scaling, and yield examples
- Chapter 31, Quick Breads; Chapters 32-35, yeast breads, pies/pastries/cookies, cakes/frostings, and
  desserts, for recipe formulation and ingredient-function examples

The book's index and table of contents were used for navigation only. The conclusions below come from
substantive page text, not solely from headings.

## 3. Coverage classification

| Knowledge category                | Coverage | Evidence from inspected text                                                                                                                                                                            | Boundary                                                                                              |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Recipe construction               | STRONG   | Chapter 4 explains standardized recipes, recipe development, ingredient quantities, method, yield, and portion size; recipe examples include ingredients, mise en place, method, yield, and variations. | Standardized culinary recipes are evidence; Grocery-specific generation rules are not supplied.       |
| Recipe modification               | STRONG   | Recipe variations and low-calorie/low-fat or plant-based variants are presented as controlled changes to existing preparations.                                                                         | Does not authorize unrestricted recipe generation.                                                    |
| Ingredient substitution           | ADEQUATE | Substitution notes and food-class chapters discuss alternatives, functional consequences, and diet-driven changes.                                                                                      | Every substitution still requires product-level compatibility and allergy handling.                   |
| Preparation workflow              | STRONG   | Chapter 9 defines mise en place and prep lists; recipe sections identify preparation steps and required tools.                                                                                          | Workflow sequencing for Grocery is a later translation task.                                          |
| Cooking-method selection          | STRONG   | Chapter 10 distinguishes dry-heat, moist-heat, and combination methods and relates methods to food properties; food-class chapters apply those methods.                                                 | Method choice is not automatically a nutrition target rule.                                           |
| Ingredient-function knowledge     | STRONG   | Sauce, bakeshop, egg, dairy, grain, vegetable, and meat sections explain ingredient roles and functional effects.                                                                                       | Culinary function is not a substitute for nutrition-science evidence.                                 |
| Scaling / yield conversion        | STRONG   | Chapter 4 explicitly covers measurement/conversion, recipe yield and portion conversion, conversion factors, yield tests, and large recipe changes.                                                     | Extreme batch production may exceed the book's practical scope.                                       |
| Portioning                        | ADEQUATE | Standardized recipe portion sizes, yield, serving counts, and portion conversion are explicit.                                                                                                          | Does not replace KM16 exchange-list methodology or establish clinical portions.                       |
| Batch preparation                 | PARTIAL  | Large-batch conversion examples, batch-size effects, sauce/bakeshop batch guidance, and yield calculations are present.                                                                                 | Quantity-food production and restaurant operations are not established as a full v1 knowledge system. |
| Storage                           | ADEQUATE | Food safety/sanitation and preservation sections cover refrigeration, freezing, storage separation, reheating, and preservation methods.                                                                | Operational app retention policies remain product decisions.                                          |
| Food safety                       | STRONG   | Chapter 2 covers foodborne hazards, HACCP, cross-contamination, allergens/intolerances, temperature control, receiving, storage, and sanitation.                                                        | Core-corpus safety authority remains governing where the subjects overlap.                            |
| Nutrient retention / food quality | ADEQUATE | Chapter 3 and food-class chapters connect preparation/cooking with nutrient and quality effects; recipe nutrition analyses are provided as references.                                                  | The book is not authority for Grocery nutrient targets or clinical guidance.                          |
| Special-diet adaptation           | ADEQUATE | Plant-based cooking, vegetarian/vegan examples, gluten-free and allergen-aware adaptations, and low-calorie/low-fat variations are present.                                                             | Medical therapeutic diets and unrestricted health claims remain out of scope.                         |
| Nutritional analysis of recipes   | ADEQUATE | The edition includes nutritional analysis for recipes and frames the information as reference material with margin-of-error limitations.                                                                | Analysis output is not a replacement for Grocery's authoritative nutrient data.                       |

## 4. Decision mapping

| Decision                                                                      | Evidence-supported mapping                                                                                                                                      | Coverage/status after inspection                                                                                              |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| DEC-067 — Recipe Construction                                                 | Standardized recipe structure, ingredient list, preparation/method, yield, portion size, variations, and ingredient-function explanations.                      | **Supported by source; translation-ready subject to Phase 9 boundaries.**                                                     |
| DEC-068 — Preparation / Cooking                                               | Mise en place, prep lists, knife skills, food-specific preparation, cooking-method categories, method selection, and cooking effects on food quality/nutrients. | **Supported by source; no autonomous nutrition rule inferred.**                                                               |
| DEC-069 — Scaling / Adaptation                                                | Conversion factors, measurement systems, yield/portion conversion, large recipe changes, batch-size effects, storage and preservation.                          | **Partially supported:** recipe scaling and storage are supported; true quantity-food batch-production depth remains limited. |
| DEC-060 — Portion / serving translation                                       | Recipe yields, serving counts, portion sizes, and conversions.                                                                                                  | **Adequate culinary support; core exchange-list evidence remains authoritative.**                                             |
| DEC-061 — Restriction filtering                                               | Food allergies/intolerances, allergen cross-contact, vegetarian/vegan and plant-based alternatives.                                                             | **Adequate support; filtering policy remains product logic.**                                                                 |
| DEC-062 — Portion construction                                                | Yield, serving-size conversion, and standardized recipe portions.                                                                                               | **Adequate support; target calculation remains outside this source.**                                                         |
| DEC-063 — Substitution                                                        | Functional substitution examples and diet-driven variations.                                                                                                    | **Adequate support; compatibility and nutrient-equivalence checks remain necessary.**                                         |
| DEC-065/066 — Shopping and grocery implications                               | Purchasing, receiving, edible yield/waste, ingredient quantities, and recipe yield connect recipes to shopping inputs.                                          | **Partial evidence; list consolidation and pantry behavior remain translation/product logic.**                                |
| DEC-070-075 — Execution, pantry, deviation, and related practical translation | Storage, safety, preparation planning, leftovers, substitutions, yield, and operational sequencing.                                                             | **Partial-to-adequate support; app workflows and deviation policy are not supplied by the book.**                             |

## 5. Knowledge versus decision logic versus product implementation

**Scientific/culinary knowledge:** the source teaches standardized recipe structure, ingredient functions,
preparation workflows, cooking methods, conversions, yields, food safety, storage, and food-quality effects.

**Decision logic:** Grocery may later choose how to constrain recipe detail, apply a conversion factor, handle
an allergen, or route a preparation method. Those are application decisions and must cite this source plus
the core nutrition corpus where applicable. The source alone does not determine those policies.

**Product/UX implementation:** recipe schemas, ingredient databases, shopping-list consolidation, pantry
state, user-facing warnings, and meal-generation behavior belong to Phase 9. None is implemented or
specified as executable logic by this record.

## 6. Residual-gap determination

| Area                      | Finding                                                                                                  | Gap classification                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Recipe construction       | On Cooking 7e closes the previously genuine knowledge gap for standardized culinary recipe construction. | B: translation/product layer remains.                                                                                        |
| Preparation/cooking       | Broadly covered through mise en place, food-specific prep, and cooking methods.                          | B: product translation remains; no new source needed.                                                                        |
| Modification/substitution | Adequately covered with functional and diet-driven examples.                                             | B/C: product safeguards and scope boundaries remain.                                                                         |
| Scaling                   | Recipe and portion conversion are explicitly covered.                                                    | B: conversion implementation remains.                                                                                        |
| Batch preparation         | Only partially covered; true quantity-food production is not established.                                | C: bounded scope unless a consequential v1 requirement appears. A new source is not recommended now.                         |
| Storage                   | Adequately covered for practical culinary storage/preservation concepts.                                 | B: app retention and reminder policy remain product logic.                                                                   |
| Food safety               | Strongly covered, with the core corpus still governing overlap.                                          | B/C: operational UX and safety policy remain bounded.                                                                        |
| Nutrient retention        | Adequate qualitative coverage, including preparation effects and recipe nutrition references.            | D/B: quantitative nutrient accounting must use authoritative Grocery nutrition data and may require targeted evidence later. |

The answer to the original GAP-A question is therefore **partially closed at the knowledge layer, not fully
closed as an application capability**. Recipe construction, preparation/cooking, modification, scaling,
storage, and practical safety now have an inspectable route. Batch-production depth and quantitative nutrient
retention remain bounded or insufficiently evidenced for autonomous product rules.

## 7. Self-audit

- Actual PDF content was inspected after extraction; conclusions do not rely only on the TOC.
- The source file was not modified.
- The seven-book baseline remains 213 topics and 112 stable decision IDs.
- Brown's original Gate 6 selection was not rewritten; this record makes the execution substitution explicit.
- No new decision ID was created.
- Recipe construction was kept distinct from recipe modification.
- Culinary knowledge, decision logic, and Phase 9 product implementation were kept separate.
- No application code, schema, UI, API, recipe algorithm, or shopping algorithm was added.
- No additional source is recommended at this point.
- Phase 8 closure was completed through the formal closure audit recorded in
  `PRACTICAL_TRANSLATION_ANALYSIS.md` §10–§11.2; Phase 9 is the next authorized phase.
