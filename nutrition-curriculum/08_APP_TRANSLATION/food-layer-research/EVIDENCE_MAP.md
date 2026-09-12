# Food layer evidence and source map

## L. Source hierarchy and applicability

The project's governance, ratifications, canonical decision inventory, and knowledge mappings remain authoritative for scope. The seven-book science baseline is preserved. Food composition is a **separate measurement/data layer**: it estimates what a particular food contains; it does not decide what a particular person should eat.

The existing bounded culinary extension, **On Cooking 7e**, is already documented in the corpus. No additional textbook is admitted here. External official datasets, guidelines, and an original modeling study are investigated to address the specific composition and translation questions authorized for this research. Their use here is not blanket adoption as future policy.

**Access limitation:** `nutrition-curriculum/01_SOURCE_BOOKS/` is absent from this checkout. Book links below are the project's previously verified TOC extractions and prior substantive analyses, not fresh full-text readings. Page numbers are navigation pointers supplied by those records, not claims that those pages were reread. Scientific thresholds or recipe yields cannot be ratified from a chapter title.

## Seven-book map

| Existing core source | Existing repository navigation | Role in this research / DEC connection | Evidence boundary |
|---|---|---|---|
| Dan Benardot, *Advanced Sports Nutrition*, 3e, 2021 | [TOC](../../02_TOC_AND_SOURCE_ANALYSIS/01_Advanced_Sports_Nutrition_3e/01_advanced_sports_nutrition_3e.md): Ch.1 p.2; Ch.2 p.52; Ch.6 p.188; App.B p.418, App.C p.429 | Energy nutrients, micronutrients, timing, food sources; DEC-031–037, DEC-041–043, DEC-055–057 | Sports context; no direct claim that its examples establish general-user meal amounts |
| Dan Benardot/ACSM, *ACSM's Nutrition for Exercise Science*, 1e, 2018 | [TOC](../../02_TOC_AND_SOURCE_ANALYSIS/02_ACSM_Nutrition_for_Exercise_Science_1e/02_acsm_nutrition_for_exercise_science_1e.md): Ch.2–6 and 15; Apps.A/I/J | Macro and vitamin/mineral roles; diet planning; DEC-060/062 informed by DEC-031–043 | EPUB has no reliable printed page numbers; none invented |
| Keith N. Frayn and Rhys D. Evans, *Human Metabolism: A Regulatory Perspective*, 4e, 2019 | [TOC](../../02_TOC_AND_SOURCE_ANALYSIS/03_Human_Metabolism_Regulatory_Perspective_4e/03_human_metabolism_regulatory_perspective_4e.md): Ch.1, §§1.2–1.3 | Metabolic interpretation; keeps composition, metabolism, and observed response distinct; energy/macros/feedback | Mechanistic explanation is not a validated recommendation algorithm |
| David A. Bender, *Introduction to Nutrition and Metabolism*, 3e, 2002 | [TOC](../../02_TOC_AND_SOURCE_ANALYSIS/04_Introduction_to_Nutrition_and_Metabolism_3e/04_introduction_to_nutrition_and_metabolism_3e.md): Ch.11 p.322; §11.1 p.323 | Requirements and reference-intake concepts; DEC-041/045/112 | Older source; current numeric references need contemporary authority |
| Lovegrove, Hodson, Sharma, Lanham-New, *Nutrition Research Methodologies*, 2015 | [TOC](../../02_TOC_AND_SOURCE_ANALYSIS/05_Nutrition_Research_Methodologies/05_nutrition_research_methodologies_2015.md): Ch.4 p.48, food matching p.69, Ch.5 p.71, Ch.6 p.90 | Intake measurement, composition/matching, biomarkers; DEC-076–082, DEC-108–112 | Intake records and database estimates are not clinical status measurements |
| Asker Jeukendrup and Michael Gleeson, *Sport Nutrition*, 4e, 2025 | [TOC](../../02_TOC_AND_SOURCE_ANALYSIS/06_Sport_Nutrition_4e/06_sport_nutrition_4e.md): micronutrient functions p.346, assessment p.374, exercise requirements p.377 | Athletic macro/micro context; DEC-031–045 and training/timing decisions | Copyright year 2025 per corpus verification; sport adjustments require actual inputs and scope |
| Janice L. Raymond and Kelly Morrow, *Krause and Mahan's Food and the Nutrition Care Process*, 16e, 2023 | [TOC](../../02_TOC_AND_SOURCE_ANALYSIS/07_Krause_Mahan_Food_Nutrition_Care_Process_16e/07_krause_mahan_food_nutrition_care_process_16e.md): Ch.4 p.57; Ch.10 p.178 | Food-history assessment, culturally competent diet planning; profile, monitoring, DEC-041–045/059/064 | Clinical content does not extend the app's clinical scope; lower-level bookmark pages often unavailable |

Existing relevant topic mappings in the canonical inventory include NUT-02/NUT-04 for DEC-060/062/063, VIT/MIN topics for DEC-041–045, and PRO/CHO/LIP domains for macros. These are reused references, not additions to the 213-topic universe.

## Existing culinary and application evidence

| Source | What it establishes | What it does not establish |
|---|---|---|
| [On Cooking 7e execution record](../../11_PHASE_8_PRACTICAL_TRANSLATION/ON_COOKING_7E_EXECUTION_RECORD.md), 2026-09-07, §§2–6 | Prior substantive inspection of recipe formulation, ingredient function, preparation, scaling, storage; bounded practical knowledge | No app-specific nutrient targets, universal retention coefficients, validated 24-recipe dataset, or full restaurant production system |
| [DEC-067 ratification](../../00_PROJECT_CONTROL/DECISIONS/2026-09-08-dec-067-preparation-detail-ratification.md), 2026-09-08 | Ingredient list + quantities + optional concise prep text | Structured steps, general formal yield system, automatic cooked adjustment |
| [DEC-069 ratification](../../00_PROJECT_CONTROL/DECISIONS/2026-09-09-dec-069-v1-scope-ratification.md), 2026-09-09; [current batch code](../../../src/lib/preparationBatch.ts) | Household batch/leftovers scope; current immutable composition snapshots | Measured cooked yield, predictive storage safety, general recipe scaling |
| [Decision inventory](../../05_PHASE_3_APP_DECISION_MODEL/APP_DECISION_INVENTORY.md), DEC-043/060–069 | Macro-to-food boundary, micronutrient soft guidance, substitution and construction ownership | Implementation readiness |
| [DEC register](../../DEC_REGISTER.md) | Current readiness, including blocked micronutrients/substitution and partial allergen coverage | Scientific evidence or scope ratification |
| [Live catalog snapshot](food-catalog-2026-09-12.json), 2026-09-12 | Actual 89 records, fields, source labels, UUIDs, allergen metadata | Truth of nutrient values or representativeness of Turkish products |
| [Combos](../../../data/combos.json), [matching](../../../src/lib/comboMatch.ts), [nutrition arithmetic](../../../src/lib/mealNutrition.ts) | Sixteen fixed combos, current kcal/protein behavior, gram scaling | Multimacro optimizer or micronutrient adequacy capability |

## External sources

Accessed 2026-09-12. Dates below identify the publication/release where established; a web crawl date is not treated as a publication date.

| # | Publisher / source / date | Evidence used | Limits and adoption status |
|---|---|---|---|
| 1 | USDA ARS, [Foundation Foods Documentation](https://fdc.nal.usda.gov/Foundation_Foods_Documentation/), April 2024 | Per-100-g edible portion, food state, missing components, analytical variation, carbohydrate-by-difference | Some analytical foods use special moisture bases. US food matching/fortification cannot be assumed applicable locally |
| 2 | USDA ARS, [API Guide](https://fdc.nal.usda.gov/api-guide/) and [Data Documentation](https://fdc.nal.usda.gov/data-documentation/), living documentation | Search/details API, downloadable datasets; distinctions between Foundation, SR Legacy, FNDDS, branded data | API key required; keep server-side; source versions and record types must be retained. API guide examples may name older dataset cycles |
| 3 | FAO/INFOODS, [Food Matching Guidelines v1.2](https://www.fao.org/fileadmin/templates/food_composition/documents/upload/INFOODSGuidelinesforFoodMatching_version_1_2.pdf), 2012 | Match food description/state and preparation; recipe calculations preferable to arbitrary similar-food substitution | Method guidance, not Turkish product matching results |
| 4 | Greenfield and Southgate, FAO, *Food Composition Data*, [recipe procedure](https://www.fao.org/4/y4705e/y4705e23.htm) and [calculation/quality context](https://www.fao.org/4/y4705e/y4705e15.htm), 2003 | Ingredient composition, edible portion, yield, nutrient retention, final output | Calculated recipes are estimates; method/temperature variation matters |
| 5 | USDA ARS, [Table of Nutrient Retention Factors](https://www.ars.usda.gov/ARSUserFiles/80400535/Data/retn/retn06.pdf), Release 6, December 2007 | External source for nutrient-specific cooking retention factors | Old release; do not adopt indiscriminately or confuse with cooked mass yield |
| 6 | WHO, [Healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet), 26 January 2026 | Adequacy, balance, moderation, diversity; produce/whole-food pattern and appropriate preserved produce | Does not prescribe the proposed engine, its weights, or recipe library |
| 7 | Institute of Medicine, [Dietary Reference Intakes: Applications in Dietary Planning, Summary](https://www.ncbi.nlm.nih.gov/books/NBK221361/), 2003 | Usual-intake planning, RDA/AI/UL distinctions | Methodological source, not a current table of all nutrient reference values |
| 8 | EFSA, [DRV update explanation](https://www.efsa.europa.eu/en/press/news/updating-drvs-job-done-after-10-years-and-34-nutrients), 2019 | Population reference values need appropriate translation into recommendations | Does not establish individualized micronutrient prescriptions |
| 9 | Maillot, Vieux, Amiot, Darmon, [Individual diet modeling translates nutrient recommendations into realistic and individual-specific food choices](https://pubmed.ncbi.nlm.nih.gov/19939986/), AJCN, 2010 | Original modeling precedent combining nutrient constraints with proximity to observed diets | Abstract inspected; French population/model, not Turkish app validation, no adoption of its numeric parameters |
| 10 | Türkiye Ministry of Agriculture, [TürKomp main](https://turkomp.tarimorman.gov.tr/main), [about](https://turkomp.tarimorman.gov.tr/about), [use conditions](https://turkomp.tarimorman.gov.tr/useofdata), current pages | National Turkish food-composition source; local food matching; terms specify paid commercial software/web use | Do not assume free API/download/reuse permission. Exact license and permitted usage require review before importing |
| 11 | Public Health England, [CoFID 2021](https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid) | Official downloadable UK food-composition alternative and user guide | UK products/preparation may be proxies; inspect data coverage, guide, and reuse terms before choosing |
| 12 | Türkiye Ministry of Health, [TÜBER 2022](https://hsgm.saglik.gov.tr/depo/birimler/saglikli-beslenme-ve-hareketli-hayat-db/Dokumanlar/Rehberler/Turkiye_Beslenme_Rehber_TUBER_2022_min.pdf), 2022 | Identified as relevant national dietary-reference/food-group source | PDF retrieval failed here; no new numeric policy is attributed to its unread contents. Must retrieve relevant sections before adoption |
| 13 | NIH ODS, [Calcium, Health Professional](https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/), living fact sheet | Dairy/fortified products/bone-in fish as source candidates; bioavailability differs | Do not equate spinach/tahini/tofu/dairy by name; product/preparation matters |
| 14 | NIH ODS, [Iron, Consumer](https://ods.od.nih.gov/factsheets/Iron-Consumer/), updated 2023 | Animal and plant iron sources; nonheme-iron context | Does not supply an individual absorption coefficient |
| 15 | NIH ODS, [Vitamin C, Consumer](https://ods.od.nih.gov/factsheets/VitaminC/Consumer/), living fact sheet | Fruit/vegetable sources and assistance with plant iron absorption | Food pairing principle, not a quantified absorbed-iron model |
| 16 | NIH ODS, [Vitamin D, Health Professional](https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/), living fact sheet | Fatty fish, fortification, and mushroom variability | Catalog presence cannot establish vitamin-D adequacy |
| 17 | NIH ODS, [Vitamin B12, Consumer](https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/), living fact sheet | Animal foods and explicitly fortified foods | Unfortified plant foods are not presumed reliable substitutes |
| 18 | NIH ODS, [Iodine, Health Professional](https://ods.od.nih.gov/factsheets/Iodine-HealthProfessional/), living fact sheet | Iodized salt, variable food content, geographic relevance | Generic salt and US food values do not establish Turkish iodine intake |
| 19 | NIH ODS, [Potassium](https://ods.od.nih.gov/factsheets/Potassium-HealthProfessional/), [Magnesium](https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/), [Folate](https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/), living fact sheets | Qualitative roles in fruit/vegetables, pulses, nuts, whole grains | Practical portions and complete matched data required before contribution claims |
| 20 | NIH ODS, [Vitamin A](https://ods.od.nih.gov/factsheets/VitaminA-Consumer/) and [Choline](https://ods.od.nih.gov/factsheets/Choline-Consumer/), living fact sheets | Carotenoid-rich vegetables and egg/animal-food choline roles | Preserve nutrient forms; no profile values imported |
| 21 | NIH ODS, [The Scoop, Spring 2017](https://ods.od.nih.gov/News/The_Scoop_-_Spring_2017.aspx), with [Omega-3 Health Professional](https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/?source=organic) | ALA versus EPA/DHA food-source distinction | No conversion coefficient or fish-frequency rule adopted |
| 22 | Türkiye Ministry of Agriculture, Dr. Sami Süzer, [Çilek Tarımı](https://arastirma.tarimorman.gov.tr/ttae/Sayfalar/Detay.aspx?SayfaId=82), undated page | Cultivar and cultivation context | Not a validated monthly Turkish availability calendar |
| 23 | NIH ODS, [Zinc, Consumer](https://ods.od.nih.gov/factsheets/Zinc-Consumer/) and [Vitamin E, Consumer](https://ods.od.nih.gov/factsheets/vitamine-consumer/), living fact sheets | Meat/seafood zinc; nuts/oils as vitamin-E source candidates | Exact local food-state profiles and portions still required |

### Composition-source strategy

**Proposed:** match specific Turkish products with reliable local composition or labels where appropriate, then use well-matched FDC records for generic foods. Evaluate TürKomp as the local analytical source with permissions resolved first. CoFID is a possible comparison/fallback, not an automatic replacement. Manufacturer labels can establish that product's declared macros and fortification but often cannot fill a complete micronutrient profile.

Choose the best food/state match, not the newest record indiscriminately. Foundation Foods can provide analytical detail; SR Legacy supplies historical breadth; FNDDS includes survey-oriented foods; branded records reflect labels. Their nutrient completeness and portion conventions differ. FDC data are public-domain/CC0 as described in its API documentation; preserve attribution and source IDs even where not legally required. Download/API availability is not evidence that a given cheese or prepared dish matches a Turkish product.

If borrowing individual missing nutrients from another source is considered, explicitly tag each borrowed component, match state and preparation, preserve nutrient definition, and review whether combining sources creates a misleading synthetic profile. Do not silently splice US-fortified milk micronutrients onto local macro values.

An ingestion record should retain provider, dataset/release, record ID, source description, acquisition date, food/state mapping rationale, nutrient units/forms, method or label basis, missingness, and licensing status. This is proposed data architecture, not a new application schema.

## Claim-to-evidence map

| Claim or design choice | Evidence | Classification / outstanding work |
|---|---|---|
| 89 foods, 24 missing sources, 19 mapped rows | Live snapshot + catalog audit | Observed, reproducible |
| Seed 64 differs from live 89 | Seed/live name comparison | Observed; do not overwrite live from seed |
| No micronutrient calculation possible from current fields | Snapshot/schema/API/arithmetic | Observed capability limit |
| Macro-driven selection can include broader dietary quality | WHO + DRI planning + Maillot + DEC-043/062 | Evidence-supported principles; specific architecture proposed |
| Per-100-g edible state with yield/retention separation | USDA + FAO + existing U3 uncertainty in curriculum | Evidence-supported representation recommendation; schema and factors unapproved |
| Recipe nutrition derived from ingredients | FAO recipe calculation + current macro arithmetic | Supported concept; versions/cache/historical behavior are proposed software choices |
| More foods are not the first priority | Coverage matrix and missing data | Analytical judgment, not a mathematically proven minimum |
| Seasonal role-based substitution | Existing DEC-063 + culinary execution record + food-composition matching | Product proposal; regional calendar and numerical tolerances unresolved |
| Current-source proxy mismatches | FDC Foods endpoint description reads | Observed descriptions; local nutrient accuracy not fully reconciled |
| 24 simple preparations are useful | Existing ingredients and reusable roles | Editorial proposal; no clinical/kitchen acceptability validation |
| Iron/zinc/B12-oriented meat role | NIH ODS iron/zinc/B12 food-source materials | Qualitative matching target, not verified recipe contribution |
| Local dietary reference authority | TÜBER identified; EFSA/DRI methodological context | Unresolved; TÜBER contents not newly verified |
| Food and source updates should preserve history | Existing stable-ID and batch immutability rules | Proposed versioning policy; no migration decision |

## Remaining evidence work before implementation

Retrieve the relevant original book sections if exact interpretation or scientific rules are needed; use the source map above rather than claiming chapter headings are evidence. Retrieve TÜBER and select an appropriate reference policy for the actual supported population. Finish nutrient-by-nutrient source reconciliation, local product matching, and permissions. Select applicable yield/retention evidence and validate representative home preparations. Obtain a maintained regional seasonal source if month-based availability becomes a feature.

No source proves that these 89 foods cover every micronutrient under every restriction, that all 24 recipes are adequate complete meals, or that the recommendation algorithm improves health outcomes. Those claims are deliberately absent.
