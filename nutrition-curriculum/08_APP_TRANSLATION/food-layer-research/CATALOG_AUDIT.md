# Food catalog audit

## A. Scope and conclusion

The live Supabase `public.nutrition` table contained **89 rows** on 2026-09-12. The read returned HTTP 200 with `Content-Range: 0-88/89`. The checked-in seed has **64 rows**, all represented by name in the live catalog; 25 live names are absent from the seed. Evidence is preserved in [the snapshot](food-catalog-2026-09-12.json), which is an audit artifact, not an import or replacement seed.

**The catalog is broadly sufficient to design a small omnivorous macro-completion and meal-component library, but its current data is insufficient to validate micronutrient adequacy or reliable cooked portions.** Adding more fruit, grains, or nuts before repairing identity and composition metadata would not solve those problems.

This is a qualitative coverage judgment, not proof that every target or restriction combination is feasible. No approved target grid, portion limits, or complete micronutrient matrix exists for numerical feasibility analysis. Vegan, dairy-free, and heavily restricted profiles require separate checks.

## Observed schema and calculation basis

| Aspect | Observed state | Consequence |
|---|---|---|
| Identity | `name_tr`, `aliases`, opaque UUID `food_id`; all 89 UUIDs distinct | Preserve UUIDs; audit aliases |
| Nutrients | `kcal_per_100`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g` | All 89 have finite nonnegative values in these five fields |
| Provenance | `source`, `updated_at` | 64 USDA strings, 24 null sources, 1 literally “Google”; update time is not analytical date |
| Allergens | `allergen_classes` | 19 rows have some mapping; 70 empty arrays. Some mapping is not full class coverage |
| State | No raw/cooked, drained, skin/bone, edible-fraction, or moisture-basis fields | Nutrient magnitude cannot establish state |
| Portions | No density/portion/yield fields | Grams cannot imply cooked weight, cups, or purchased weight |
| Micronutrients | No vitamin/mineral columns | Calcium, iron, sodium, etc. are unknown, not zero |
| Other quality nutrients | No saturated fat, sugars, ALA/EPA/DHA | Fat amount alone cannot represent fat quality |
| Categories | No category column | Browsing derives aisle categories from code; nutritional roles below are annotations |

[scaleNutrition](../../../src/lib/mealNutrition.ts) multiplies stored nutrients by grams / 100. This establishes the **per-100-g computational contract**, not correctness of every source conversion. Liquid grams are not automatically millilitres. USDA's edible-portion convention supports keeping refuse separate.[^1]

The [nutrition API](../../../api/nutrition.ts) omits source and updated_at from its selected response and does not accept provenance through its general macro editor. A future provenance-aware pipeline requires a curation path.

## Source-description verification

FoodData Central's Foods endpoint was queried for the 64 USDA identifiers in the live table: **63 returned records; 11477 did not appear in the response**. Descriptions were inspected; a complete nutrient-by-nutrient reconciliation was not performed.

| Local row / FDC identifier | Source description or finding | Implication |
|---|---|---|
| tavuk göğsü / 171077 | Skinless boneless breast meat, raw | Raw edible reference; cooked grams need a separate state |
| pirinç / 169756 | White long-grain rice, raw, unenriched | Not a verified baldo profile |
| bulgur / 170688 | Bulgur, dry | Not cooked bowl weight |
| nohut / 173756; kırmızı mercimek / 174284 | Mature chickpeas raw; pink/red lentils raw | Dry ingredients, not cooked salad/soup weights |
| kuru fasulye / 175193 | Kidney beans, mature seeds, raw | Verify match to Turkish white-bean variety |
| yoğurt / 171284 | Plain whole-milk yogurt | Does not establish strained-yogurt composition |
| beyaz peynir / 173420 | Feta | Turkish product proxy needing review |
| kaşar peyniri / 173414 | Cheddar | Turkish product proxy needing review |
| süt / 171265 | Whole milk with added vitamin D | Do not transfer US fortification into Turkish milk |
| un / 168894 | Enriched, bleached all-purpose flour | Local fortification cannot be assumed |
| somon / 173686 | Wild Atlantic salmon, raw | Species/farmed differences matter |
| siyah zeytin / 169095 | Ripe canned olives, jumbo size | Not verified Turkish cured olives |
| sosis / 174614 | Beef frankfurter, heated | Catalog mixes raw and heated references |
| kabak / “fdc_id 11477” | No returned FDC record | Investigate identifier namespace; no automatic correction |
| eski kaşar / “Google” | No identifiable composition record | Source replacement needed |

Read-only source: [FDC API](https://fdc.nal.usda.gov/api-guide/); individual records follow `https://fdc.nal.usda.gov/food-details/<identifier>/nutrients`, e.g. [chicken](https://fdc.nal.usda.gov/food-details/171077/nutrients), [milk](https://fdc.nal.usda.gov/food-details/171265/nutrients). Verified identity of a referenced record does not certify local numbers.

## Duplicates and aliases

| Cluster | Finding | Later review |
|---|---|---|
| ceviz / ceviz içi | Five identical nutrient fields; overlapping alias; only ceviz has nut mapping | Duplicate candidate; preserve historical UUID links |
| soğan / kuru soğan | Five identical fields; reciprocal aliases | Duplicate candidate |
| pirinç / beyaz pirinç / baldo pirinç | First two identical; baldo differs | Generic duplicate plus possible cultivar distinction |
| dana kıyma / kıyma | Fat differs: 15 versus 20 g/100 g; reciprocal aliases | Keep fat variants, review false synonymy |
| yoğurt / süzme yoğurt alias | One ordinary-yogurt profile | Verified strained product requires separate representation |
| cheese varieties | Different products | Not duplicates merely because all are dairy |
| bulgur / bulgur pilavı | Dry grain versus unspecified prepared dish | Plain cooked ingredient is not automatically oily pilaf |
| olive / sunflower oil | Five identical fields | Not duplicates; fatty acids/function differ |
| water / salt | All-zero macro profiles | Not substitutes; missing sodium is consequential |

Seven normalized strings have multiple owners across names and aliases: baldo pirinç, pirinç, ceviz, dana kıyma, kıyma, kuru soğan, soğan. The [identity resolver](../../../src/lib/foodIdentity.ts) prioritizes exact canonical names, so not all ownership collisions become runtime ambiguity; contradictory synonym claims still need attention. Legacy display maps can resolve differently.

The built-in [classifier](../../../src/lib/categorization/categories.ts) was exercised on all names without household overrides. It returned `diger` for arpa, karalahana, mısır and placed fındık and salatalık in `sarkuteri`. These are observed classifier defects; no fix is included.

## Complete inventory by analytical role

One primary group per row for counting; multiple nutritional roles remain possible. Potato is grouped as starch, dried fruit as fruit, butter as fat. These are not changes to app categories.

| Analytical group | Rows | All current foods |
|---|---:|---|
| Protein — poultry | 2 | tavuk göğsü, hindi göğsü |
| Protein — eggs | 1 | yumurta |
| Protein — seafood | 3 | somon, karides, ton balığı |
| Protein — red meat | 3 | dana kıyma, kıyma, kuzu but |
| Dairy | 6 | süt, yoğurt, beyaz peynir, kaşar peyniri, eski kaşar, krem peynir |
| Legumes | 3 | kırmızı mercimek, nohut, kuru fasulye |
| Starch — grains | 13 | arpa, baldo pirinç, beyaz pirinç, pirinç, esmer pirinç, bulgur, bulgur pilavı, karabuğday, kinoa, makarna, mısır, un, yulaf ezmesi |
| Starch — bread | 3 | beyaz ekmek, tam buğday ekmeği, karabuğday ekmeği |
| Starch — tuber | 1 | patates |
| Nuts and seeds | 9 | antep fıstığı, badem, ceviz, ceviz içi, chia tohumu, fındık, kabak çekirdeği, kaju, yer fıstığı |
| Fats and spreads | 5 | ayçiçek yağı, zeytinyağı, tereyağı, tahin, siyah zeytin |
| Vegetables and aromatics | 15 | brokoli, domates, havuç, ıspanak, kabak, karalahana, karnabahar, kuru soğan, soğan, mantar, marul, patlıcan, salatalık, sarımsak, yeşil biber |
| Fruit | 12 | armut, çilek, elma, karpuz, kavun, kayısı, limon, muz, portakal, şeftali, üzüm, kuru üzüm |
| Processed meats | 3 | jambon, salam, sosis |
| Other cooking and discretionary items | 7 | bal, bitter çikolata, hardal, instant maya, ketçap, şeker, tuz |
| Beverages | 3 | çay, kahve, su |

## B. Coverage matrix

Micronutrient roles are **potential food-class roles for source matching**, not measured catalog coverage. Nutrition evidence and limitations are in [EVIDENCE_MAP.md](EVIDENCE_MAP.md).

| Category | Macro role | Practical role | Potential micronutrient/quality role | Judgment |
|---|---|---|---|---|
| Poultry | Lean protein | Chicken/rice, turkey/bulgur | B vitamins | Strong base; no additional poultry necessary |
| Eggs | Protein + fat | Breakfast, binding, main | B12, choline | Present; shell-free weight needed |
| Seafood | Lean/fatty protein | Salmon, shrimp, tuna | B12; salmon vitamin D, EPA/DHA | Broad start; local oily fish useful |
| Red meat | Protein + variable fat | Mince sauce, meat/potato | Iron, zinc, B12 | Present; define variants |
| Dairy/calcium | Mixed macros | Yogurt bowls/sides, milk, cheese | Calcium, B12 | Broad; product matching needed |
| Legumes/plant protein | Protein + carbs/fiber | Soup, stew, salad | Folate, nonheme iron, magnesium | Three staples sufficient base; green lentil adds texture |
| Rice/bulgur/oats/pasta | Starch, varying fiber | Adjustable grain component | Whole-grain mineral contribution | Already covered |
| Alternative grains | Starch + some protein | Quinoa, buckwheat, barley, corn | Fiber/minerals | Already beyond minimal variety |
| Potato/bread | Carbohydrate | Tray meal, breakfast | Potato potassium; whole-grain fiber | Covered |
| Oils/nuts/seeds/tahini | Fat; mixed macros in seeds | Energy adjustment, topping, sauce | Vitamin E/magnesium; walnut/chia ALA | Strong; avocado/flax not essential additions |
| Leafy greens | Vegetable/fiber | Spinach, karalahana | Folate/carotenoids; calcium availability varies | Present; karalahana botanical match unverified |
| Crucifers | Vegetable/fiber | Broccoli/cauliflower | Vitamin C/folate | Present |
| Orange/red vegetables | Vegetable | Carrot, tomato, pepper | Carotenoids/vitamin C | Present |
| Salad/aromatics | Bulk/flavor | Cucumber, lettuce, onion, garlic | Portion-dependent contributions | Broad; not macro anchors |
| Common fruits | Carbs/fiber | Fruit side, bowl topping | Multiple roles | Broad Turkish everyday selection |
| Potassium-oriented fruits | Carbs | Banana, apricot, melon, raisins | Potassium; potato/legumes also relevant | Present; do not issue “high” claims without source/portion validation |
| Vitamin-C-oriented fruits | Carbs | Orange, strawberry | Vitamin C; lemon in smaller amounts | Summer/winter anchors present |
| Fiber-oriented fruits | Carbs/fiber | Pear/apple | Fiber, skin-state dependent | Present |
| Dairy-free calcium | Variable | Greens/tahini available | Realistic portions and bioavailability matter | Conditional gap; fortified alternative useful |
| Meal-prep staples | Multiple | Grain, pulses, oil, aromatics, flour, water | Dish dependent | Strong; tomato paste adds practical Turkish use |
| Seasonal substitutes | Context | Existing summer fruit/winter citrus | Preserve selected role, recalculate | Foods exist; metadata absent |
| Iodine/vitamin D | Not macro-driven | Verified salt/fish/fortified products | Adequacy cannot be established | Data/policy gap, not solved by row count |

## Practical roles and minimum-set reasoning

Lean poultry or verified drained tuna can help a protein gap without the larger fat/carbohydrate changes from cheese, legumes, or nuts. Rice/bulgur/pasta/potato/oats are adjustable starch components. Olive oil is an adjustable fat component; nuts and tahini also contribute other nutrients.

Vegetables and fruit contribute dietary quality even when poor tools for closing a large protein gap. Garlic, yeast, condiments, and salt need realistic culinary portions. Per-100-g yeast protein is not a reason to recommend a protein-sized yeast portion. Tea, coffee, sugar, chocolate, and processed meats can remain loggable without being default anchors. Every database item need not be a recipe ingredient.

For an initial curated selection, nominate existing representatives: chicken, eggs, salmon, one verified mince, yogurt, milk, chickpeas, lentils, beans; rice, bulgur, oats, potato, whole-wheat bread, pasta; olive oil, walnuts, tahini; spinach, broccoli, carrot, tomato, pepper, cucumber, onion, garlic; apple/pear, banana, orange, strawberry; water/salt as preparation inputs. This is a **candidate working subset**, not a deletion list, exact minimum, nutritional guarantee, or mandatory shopping list. Keep alternatives for restrictions and seasonality. Verify feasibility after approved data and portion constraints exist.

## Full 89-row inventory

kcal is stored energy per 100 g; P/C/F/fiber are stored grams per 100 g. Values are transcribed, not corrected or endorsed. “Some mapping” does not mean allergy clearance. Snapshot preserves UUIDs, aliases, timestamps, and mapping contents.

| # | Food | Built-in aisle category | Analytical group | kcal | P | C | F | Fiber | Stored source | Allergen metadata |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|
| 1 | antep fıstığı | kuruyemis-tohum | Nuts and seeds | 560 | 20.2 | 27.5 | 45.3 | 10.3 | Missing | Unknown |
| 2 | armut | meyve-sebze | Fruit | 57 | 0.4 | 15.2 | 0.1 | 3.1 | USDA fdc_id 169118 | Unknown |
| 3 | arpa | diger | Starch — grains | 354 | 12.5 | 73.5 | 2.3 | 17.3 | Missing | Unknown |
| 4 | ayçiçek yağı | yag | Fats and spreads | 884 | 0 | 0 | 100 | 0 | USDA fdc_id 171017 | Unknown |
| 5 | badem | kuruyemis-tohum | Nuts and seeds | 579 | 21.2 | 21.6 | 49.9 | 12.5 | USDA fdc_id 170567 | Some mapping |
| 6 | bal | kahvaltilik | Other cooking and discretionary items | 304 | 0.3 | 82.4 | 0 | 0.2 | USDA fdc_id 169640 | Unknown |
| 7 | baldo pirinç | tahil-bakliyat | Starch — grains | 358 | 6.7 | 79 | 0.7 | 1.4 | Missing | Unknown |
| 8 | beyaz ekmek | firin | Starch — bread | 266 | 8.9 | 49.4 | 3.3 | 2.7 | USDA fdc_id 174924 | Some mapping |
| 9 | beyaz peynir | sut-urunleri | Dairy | 265 | 14.2 | 3.9 | 21.5 | 0 | USDA fdc_id 173420 | Some mapping |
| 10 | beyaz pirinç | tahil-bakliyat | Starch — grains | 365 | 7.1 | 80 | 0.7 | 1.3 | Missing | Unknown |
| 11 | bitter çikolata | atistirmalik | Other cooking and discretionary items | 598 | 7.8 | 45.9 | 42.6 | 10.9 | USDA fdc_id 170273 | Unknown |
| 12 | brokoli | meyve-sebze | Vegetables and aromatics | 34 | 2.8 | 6.6 | 0.4 | 2.6 | USDA fdc_id 170379 | Unknown |
| 13 | bulgur | tahil-bakliyat | Starch — grains | 342 | 12.3 | 75.9 | 1.3 | 12.5 | USDA fdc_id 170688 | Some mapping |
| 14 | bulgur pilavı | tahil-bakliyat | Starch — grains | 115 | 3.5 | 24 | 0.8 | 3.8 | Missing | Unknown |
| 15 | çay | sicak-icecek | Beverages | 1 | 0 | 0.3 | 0 | 0 | USDA fdc_id 173227 | Unknown |
| 16 | ceviz | kuruyemis-tohum | Nuts and seeds | 654 | 15.2 | 13.7 | 65.2 | 6.7 | USDA fdc_id 170187 | Some mapping |
| 17 | ceviz içi | kuruyemis-tohum | Nuts and seeds | 654 | 15.2 | 13.7 | 65.2 | 6.7 | Missing | Unknown |
| 18 | chia tohumu | kuruyemis-tohum | Nuts and seeds | 486 | 16.5 | 42.1 | 30.7 | 34.4 | Missing | Unknown |
| 19 | çilek | meyve-sebze | Fruit | 32 | 0.7 | 7.7 | 0.3 | 2 | USDA fdc_id 167762 | Unknown |
| 20 | dana kıyma | kirmizi-et | Protein — red meat | 215 | 18.6 | 0 | 15 | 0 | USDA fdc_id 171796 | Unknown |
| 21 | domates | meyve-sebze | Vegetables and aromatics | 18 | 0.9 | 3.9 | 0.2 | 1.2 | USDA fdc_id 170457 | Unknown |
| 22 | elma | meyve-sebze | Fruit | 61.8 | 0.2 | 14.8 | 0.2 | 2 | USDA fdc_id 1750339 | Unknown |
| 23 | eski kaşar | sut-urunleri | Dairy | 360 | 26 | 1.5 | 26 | 0 | Google | Some mapping |
| 24 | esmer pirinç | tahil-bakliyat | Starch — grains | 370 | 7.9 | 77.2 | 2.9 | 3.5 | Missing | Unknown |
| 25 | fındık | sarkuteri | Nuts and seeds | 628 | 15 | 16.7 | 60.8 | 9.7 | USDA fdc_id 170581 | Some mapping |
| 26 | hardal | hazir-gida | Other cooking and discretionary items | 66 | 4.4 | 5.3 | 4 | 3.3 | Missing | Unknown |
| 27 | havuç | meyve-sebze | Vegetables and aromatics | 41 | 0.9 | 9.6 | 0.2 | 2.8 | USDA fdc_id 170393 | Unknown |
| 28 | hindi göğsü | kanatli | Protein — poultry | 114 | 23.7 | 0.1 | 1.5 | 0 | USDA fdc_id 171098 | Unknown |
| 29 | instant maya | baharat-cesni | Other cooking and discretionary items | 325 | 40.4 | 41.2 | 7.6 | 26.9 | Missing | Unknown |
| 30 | ıspanak | meyve-sebze | Vegetables and aromatics | 23 | 2.9 | 3.6 | 0.4 | 2.2 | USDA fdc_id 168462 | Unknown |
| 31 | jambon | sarkuteri | Processed meats | 164 | 16.6 | 3.6 | 8.8 | 1.3 | USDA fdc_id 173864 | Unknown |
| 32 | kabak | meyve-sebze | Vegetables and aromatics | 17 | 1.2 | 3.1 | 0.3 | 1 | USDA fdc_id 11477 | Unknown |
| 33 | kabak çekirdeği | kuruyemis-tohum | Nuts and seeds | 559 | 30.2 | 10.7 | 49 | 6 | Missing | Unknown |
| 34 | kahve | sicak-icecek | Beverages | 1 | 0.1 | 0 | 0 | 0 | USDA fdc_id 171890 | Unknown |
| 35 | kaju | kuruyemis-tohum | Nuts and seeds | 553 | 18.2 | 30.2 | 43.8 | 3.3 | Missing | Unknown |
| 36 | karabuğday | tahil-bakliyat | Starch — grains | 343 | 13.3 | 71.5 | 3.4 | 10 | Missing | Unknown |
| 37 | karabuğday ekmeği | firin | Starch — bread | 250 | 8 | 47 | 3 | 6.5 | Missing | Unknown |
| 38 | karalahana | diger | Vegetables and aromatics | 49 | 4.3 | 9 | 0.9 | 4.2 | Missing | Unknown |
| 39 | karides | balik-deniz-urunleri | Protein — seafood | 85 | 20.1 | 0 | 0.5 | 0 | USDA fdc_id 175179 | Some mapping |
| 40 | karnabahar | meyve-sebze | Vegetables and aromatics | 25 | 1.9 | 5 | 0.3 | 2 | USDA fdc_id 169986 | Unknown |
| 41 | karpuz | meyve-sebze | Fruit | 30 | 0.6 | 7.6 | 0.2 | 0.4 | USDA fdc_id 167765 | Unknown |
| 42 | kaşar peyniri | sut-urunleri | Dairy | 403 | 22.9 | 3.4 | 33.3 | 0 | USDA fdc_id 173414 | Some mapping |
| 43 | kavun | meyve-sebze | Fruit | 34 | 0.8 | 8.2 | 0.2 | 0.9 | USDA fdc_id 169092 | Unknown |
| 44 | kayısı | meyve-sebze | Fruit | 48 | 1.4 | 11.1 | 0.4 | 2 | USDA fdc_id 171697 | Unknown |
| 45 | ketçap | hazir-gida | Other cooking and discretionary items | 101 | 1 | 25.8 | 0.1 | 0.3 | Missing | Unknown |
| 46 | kinoa | tahil-bakliyat | Starch — grains | 368 | 14.1 | 64 | 6.1 | 7 | Missing | Unknown |
| 47 | kırmızı mercimek | tahil-bakliyat | Legumes | 358 | 23.9 | 63.1 | 2.2 | 10.8 | USDA fdc_id 174284 | Unknown |
| 48 | kıyma | kirmizi-et | Protein — red meat | 254 | 17.2 | 0 | 20 | 0 | Missing | Unknown |
| 49 | krem peynir | sut-urunleri | Dairy | 350 | 6.2 | 5.5 | 34.4 | 0 | USDA fdc_id 173418 | Some mapping |
| 50 | kuru fasulye | tahil-bakliyat | Legumes | 333 | 23.6 | 60 | 0.8 | 24.9 | USDA fdc_id 175193 | Unknown |
| 51 | kuru soğan | meyve-sebze | Vegetables and aromatics | 40 | 1.1 | 9.3 | 0.1 | 1.7 | Missing | Unknown |
| 52 | kuru üzüm | kuruyemis-tohum | Fruit | 301 | 3.3 | 80 | 0.2 | 3.3 | USDA fdc_id 168164 | Unknown |
| 53 | kuzu but | kirmizi-et | Protein — red meat | 230 | 17.9 | 0 | 17.1 | 0 | USDA fdc_id 174311 | Unknown |
| 54 | limon | meyve-sebze | Fruit | 29 | 1.1 | 9.3 | 0.3 | 2.8 | USDA fdc_id 167746 | Unknown |
| 55 | makarna | tahil-bakliyat | Starch — grains | 371 | 13 | 74.7 | 1.5 | 3.2 | USDA fdc_id 168927 | Some mapping |
| 56 | mantar | meyve-sebze | Vegetables and aromatics | 22 | 3.1 | 3.3 | 0.3 | 1 | USDA fdc_id 169251 | Unknown |
| 57 | marul | meyve-sebze | Vegetables and aromatics | 14 | 0.9 | 3 | 0.1 | 1.2 | USDA fdc_id 169248 | Unknown |
| 58 | mısır | diger | Starch — grains | 365 | 9.4 | 74.3 | 4.7 | 7.3 | Missing | Unknown |
| 59 | muz | meyve-sebze | Fruit | 89 | 1.1 | 22.8 | 0.3 | 2.6 | USDA fdc_id 173944 | Unknown |
| 60 | nohut | tahil-bakliyat | Legumes | 378 | 20.5 | 63 | 6 | 12.2 | USDA fdc_id 173756 | Unknown |
| 61 | patates | meyve-sebze | Starch — tuber | 77 | 2.1 | 17.5 | 0.1 | 2.1 | USDA fdc_id 170026 | Unknown |
| 62 | patlıcan | meyve-sebze | Vegetables and aromatics | 25 | 1 | 5.9 | 0.2 | 3 | USDA fdc_id 169228 | Unknown |
| 63 | pirinç | tahil-bakliyat | Starch — grains | 365 | 7.1 | 80 | 0.7 | 1.3 | USDA fdc_id 169756 | Some mapping |
| 64 | portakal | meyve-sebze | Fruit | 47 | 0.9 | 11.8 | 0.1 | 2.4 | USDA fdc_id 169097 | Unknown |
| 65 | salam | sarkuteri | Processed meats | 299 | 10.9 | 4.3 | 26.1 | 0 | USDA fdc_id 172012 | Unknown |
| 66 | salatalık | sarkuteri | Vegetables and aromatics | 15 | 0.7 | 3.6 | 0.1 | 0.5 | USDA fdc_id 168409 | Unknown |
| 67 | sarımsak | meyve-sebze | Vegetables and aromatics | 149 | 6.4 | 33.1 | 0.5 | 2.1 | USDA fdc_id 169230 | Unknown |
| 68 | şeftali | meyve-sebze | Fruit | 39 | 0.9 | 9.5 | 0.3 | 1.5 | USDA fdc_id 169928 | Unknown |
| 69 | şeker | baharat-cesni | Other cooking and discretionary items | 387 | 0 | 100 | 0 | 0 | USDA fdc_id 169655 | Unknown |
| 70 | siyah zeytin | kahvaltilik | Fats and spreads | 81 | 1 | 5.6 | 6.9 | 2.5 | USDA fdc_id 169095 | Unknown |
| 71 | soğan | meyve-sebze | Vegetables and aromatics | 40 | 1.1 | 9.3 | 0.1 | 1.7 | USDA fdc_id 170000 | Unknown |
| 72 | somon | balik-deniz-urunleri | Protein — seafood | 142 | 19.8 | 0 | 6.3 | 0 | USDA fdc_id 173686 | Some mapping |
| 73 | sosis | sarkuteri | Processed meats | 322 | 11.7 | 2.7 | 29.4 | 0 | USDA fdc_id 174614 | Unknown |
| 74 | su | icecek | Beverages | 0 | 0 | 0 | 0 | 0 | Missing | Unknown |
| 75 | süt | sut-urunleri | Dairy | 61 | 3.2 | 4.8 | 3.3 | 0 | USDA fdc_id 171265 | Unknown |
| 76 | tahin | kahvaltilik | Fats and spreads | 570 | 17.8 | 26.2 | 48 | 9.3 | USDA fdc_id 169410 | Some mapping |
| 77 | tam buğday ekmeği | firin | Starch — bread | 252 | 12.5 | 42.7 | 3.5 | 6 | USDA fdc_id 172688 | Some mapping |
| 78 | tavuk göğsü | kanatli | Protein — poultry | 120 | 22.5 | 0 | 2.6 | 0 | USDA fdc_id 171077 | Unknown |
| 79 | tereyağı | sut-urunleri | Fats and spreads | 717 | 0.9 | 0.1 | 81.1 | 0 | USDA fdc_id 173410 | Some mapping |
| 80 | ton balığı | hazir-gida | Protein — seafood | 116 | 25.5 | 0 | 1 | 0 | Missing | Unknown |
| 81 | tuz | baharat-cesni | Other cooking and discretionary items | 0 | 0 | 0 | 0 | 0 | USDA fdc_id 173468 | Unknown |
| 82 | un | tahil-bakliyat | Starch — grains | 364 | 10.3 | 76.3 | 1 | 2.7 | USDA fdc_id 168894 | Some mapping |
| 83 | üzüm | meyve-sebze | Fruit | 69 | 0.7 | 18.1 | 0.2 | 0.9 | USDA fdc_id 174683 | Unknown |
| 84 | yer fıstığı | kuruyemis-tohum | Nuts and seeds | 567 | 25.8 | 16.1 | 49.2 | 8.5 | Missing | Unknown |
| 85 | yeşil biber | meyve-sebze | Vegetables and aromatics | 20 | 0.9 | 4.6 | 0.2 | 1.7 | USDA fdc_id 170427 | Unknown |
| 86 | yoğurt | sut-urunleri | Dairy | 61 | 3.5 | 4.7 | 3.3 | 0 | USDA fdc_id 171284 | Some mapping |
| 87 | yulaf ezmesi | kahvaltilik | Starch — grains | 389 | 16.9 | 66.3 | 6.9 | 10.6 | Missing | Unknown |
| 88 | yumurta | yumurta | Protein — eggs | 143 | 12.6 | 0.7 | 9.5 | 0 | USDA fdc_id 171287 | Some mapping |
| 89 | zeytinyağı | kahvaltilik | Fats and spreads | 884 | 0 | 0 | 100 | 0 | USDA fdc_id 171413 | Unknown |

## Sources and limits

[^1]: USDA ARS, [Foundation Foods Documentation](https://fdc.nal.usda.gov/Foundation_Foods_Documentation/), Weights section, April 2024; accessed 2026-09-12.

Primary project evidence: [data README](../../../data/README.md), [seed](../../../data/nutrition.json), code links above, and live snapshot. No household or intake records were inspected. This audit does not diagnose nutrient status or certify any food as allergy-safe.
