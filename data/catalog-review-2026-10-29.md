# Catalog and portion review — 2026-10-29

Local implementation on `fix/catalog-portions-polish`. **Migration 29 is prepared, not yet applied.**
Supabase remains the runtime source of truth; changing this seed alone does not update the live catalog.

## Data decisions

- Inspected the authenticated `/api/nutrition?limit=1000` response: 92 rows, including all three meat rows
  that the older Artifact could not confirm. This patch contains 103 rows, 98 selectable, on that baseline.
- Preserve every existing `food_id` UUID and historical meal/profile/batch/shopping reference. Retire the
  duplicate `ceviz içi`, `kuru soğan`, `beyaz pirinç` rows with explicit canonical redirects. Both members
  retain their UUIDs and carry equivalent ids/names, preserving old food-level exclusions. No deletion.
- Keep `baldo pirinç` distinct; its values differ. Remove its generic `pirinç` alias. Keep the two ground-beef
  rows distinct and label their actual fat levels: `dana kıyma` 15%, `kıyma` 20%, not the Artifact's suggested 10%.
- Retire cooked `bulgur pilavı` and the ambiguous bone-in thigh from new choices without converting their
  old grams. Add raw boneless/skinless thigh meat. Existing records remain readable at their original grams.
- Remove `süzme yoğurt` from ordinary yogurt's aliases and add a separately sourced strained-yogurt row.
- No generic "glutensiz makarna" assertion: the new corn-pasta row uses its specific USDA corn formulation;
  no gluten-free certification or confirmed-absent allergen mapping is invented for arbitrary products.
- Add only known PRESENT allergen mappings. Missing mappings remain UNKNOWN. Generic absence is not
  inferred from a short ingredient list. The overall DEC-061 coverage task remains PARTIAL.

## Primary sources checked

USDA [SR Legacy bulk dataset](https://fdc.nal.usda.gov/download-datasets/) was downloaded outside the repo
and streamed as CSV. Existing SR ids were checked against their descriptions and nutrient values; all
previously numbered SR records matched to rounding. `kabak`'s old NDB 11477 becomes FDC 169291. Selected
records can also be inspected through the official FoodData Central API/food detail pages.

| Food | Source and resulting values (kcal / P / fat / carb per 100 g) |
| --- | --- |
| Antrikot | [USDA 173402](https://fdc.nal.usda.gov/food-details/173402/nutrients), raw boneless rib eye, lean and fat: 228 / 19.3 / 16.7 / 0.1 |
| Kontrfile | [USDA 171751](https://fdc.nal.usda.gov/food-details/171751/nutrients), raw boneless top loin, lean and fat: 171 / 22.2 / 9.2 / 0 |
| Boneless thigh | [USDA 173627](https://fdc.nal.usda.gov/food-details/173627/nutrients): 121 / 19.7 / 4.1 / 0 |
| Whole-wheat pasta | [USDA 169738](https://fdc.nal.usda.gov/food-details/169738/nutrients): 352 / 13.9 / 2.9 / 73.4; fiber 9.2 |
| Corn pasta | [USDA 168899](https://fdc.nal.usda.gov/food-details/168899/nutrients): 357 / 7.5 / 2.1 / 79.3; fiber 11 |
| Light tuna | [Dardanel Light](https://www.dardanel.com.tr/EN/2-lezzetlerimiz/159-ton-baligi/190-light-ton/) and [Pınar Light](https://www.pinar.com.tr/urunler/detay-et/Light-Ton-Balik/697/249/0): both 95 / 21.4 / 0.4 / 0.8 |
| Oily tuna | [Dardanel olive-oil tuna](https://www.dardanel.com.tr/EN/2-lezzetlerimiz/159-ton-baligi/180-zeytinyagli-ton/): 212 / 23.5 / 12.4 / 0.1 |
| Canned turkey breast | [Pınar](https://www.pinar.com.tr/urunler/detay-et/Pinar-Hindi-Fileto-Konserve/3770/5170/0): 122 / 26 / 2 / 0; the page's 120 g can has 80 g drained serving |
| Canned turkey thigh | [Bahar producer store](https://baharlezzeti.com/product/bahar-hindi-tandir-120-g-2/), linked from its corporate site: 158 / 24 / 6.5 / 0; replaces the unverified 125-kcal proposal |
| Sardines | [Dardanel Çanakkale](https://www.dardanel.com.tr/2-lezzetlerimiz/232-canakkale-sardalya/): 213 / 21.8 / 13.8 / 0.4 |
| Mackerel | [Dardanel](https://www.dardanel.com.tr/2-lezzetlerimiz/244-uskumru/): 207 / 22.3 / 13 / 0.2; a different formulation from its legacy EN lemon-sauce page |
| Canned Turkish salmon | [Dardanel](https://www.dardanel.com.tr/2-lezzetlerimiz/246-somon/): 305 / 21.3 / 24.5 / 0; no averaging different formulations |
| Anchovies | [Dardanel](https://www.dardanel.com.tr/EN/2-lezzetlerimiz/191-kucuk-balik/246-hamsi/): 323 / 21 / 25.9 / 5.1 |
| Strained yogurt | [Gıdapro 5.5% fat](https://www.gidapro.com/tr/prd/1/suzme-yogurt): 102 / 7.5 / 5.5 / 6.5; one named reference product, not a universal brand median |
| Mustard | [Pınar](https://www.pinar.com.tr/urunler/detay-sut/Hardal/3712/5011/0): 66 / 4 / 2.2 / 5.9; fiber 3.3 |
| Ketchup | [Pınar](https://www.pinar.com.tr/urunler/detay-sut/Ketcap/618/163/0): 101 / 1.2 / 0 / 24; fiber is not declared, represented as 0 by the existing numeric-only contract and explicitly noted in provenance |

Other formerly unsourced dry/raw records are mapped to individually reviewed USDA records in the seed.
The existing feta/cheddar proxies remain explicitly labelled as approximate counterparts, and kale is marked
as an approximate counterpart for karalahana. Manufacturer formulations vary; the source product and weight
basis are exposed in the app. Brand values are reference products, not synthetic nutrient-by-nutrient medians.
For tins, do not convert net weight to drained weight unless that product's source explicitly supplies it.
Undeclared fiber remains the existing schema's numeric zero; it must not be interpreted as a laboratory result.

The jambon "1.3 g fiber" warning in the Artifact was a false positive: official USDA 173864 really reports 1.3.
It is preserved. Kcal need not equal a simple 4/4/9 calculation because labels, fiber and food-specific energy
factors differ; a difference alone does not authorize changing a source's energy value.

## Portions and meals

The owner authorized the Artifact's proposed authored portions. These are editable product defaults, not
clinical serving recommendations or inferred cooked-to-dry conversions. Existing meal ids stay stable and
previously logged grams are not rewritten.

| Meal | Old → new dry grams |
| --- | --- |
| Tavuklu pirinç ve brokoli | rice 150 → 60 |
| Mercimek çorbası | lentils 100 → 50 |
| Nohutlu salata | chickpeas 150 → 60 |
| Hindi ve bulgur | bulgur 150 → 60 |
| Biftek ve pirinç | rice 150 → 60 |
| Et sote ve bulgur | bulgur 150 → 60 |
| Dana kıyma ve makarna | pasta 150 → 80 |
| Kuru fasulye ve pirinç | beans 150 → 70; rice 100 → 60 |

Add the ten proposed canned-food meals, plus two small snack-tagged fruit/yogurt/nut meals. Snack
recommendations require an explicit snack tag instead of treating all breakfasts as snacks. Dry-legume meals
no longer claim 10–15 minutes from raw; their notes direct users to pack preparation instructions and
exclude soaking from approximate preparation time. No cooling/reheating/safety instructions are introduced.

## Rollout and limits

Apply `supabase/29-nutrition-catalog-polish.sql` in the owner's Supabase SQL Editor. It adds optional read
metadata, snapshots the original catalog in a private table, updates by name without changing UUIDs, adds
the reviewed equivalence groups/PRESENT mappings, and records a one-shot marker. Re-running preserves
subsequent edits. The API retries legacy read columns only for missing-column errors until migration is applied.
No new endpoint, write privilege or RLS relaxation is introduced. Identity/status fields remain maintenance-only.

Still unverified: baldo's exact brand record, eski kaşar and karabuğday ekmeği labels. Their source text says so;
they are not assigned invented source ids. Tomato-sauce sardines and canned corn are not seeded without a
verified Turkish primary label. These are data follow-ups, not permission to copy a mixed or stale product page.

The seed can carry provenance, status and redirect names, but equivalence UUID arrays and reviewed allergen
mapping updates are established by migration 29 against the actual database ids. A plain macro upload is
not a substitute for that migration. Preserve the backup and marker until the owner has validated rollout.
