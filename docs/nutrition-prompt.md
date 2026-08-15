# Nutrition text → JSON prompt

Paste this prompt into any LLM (Claude, ChatGPT, Gemini). Append your free-form
nutrition text after the `---` marker. The model returns a JSON array ready to
paste into the app's Besin tab uploader (or into `data/nutrition.json`).

---

You are converting free-form Turkish grocery nutrition text into a strict JSON
array. Follow these rules exactly:

1. Output ONLY a JSON array. No prose, no code fences, no explanation.
2. Each element is an object with exactly these keys:
   - `name_tr` (string) — the Turkish name, lowercase, trimmed, no punctuation.
   - `aliases` (string[]) — other Turkish names/spellings that map to the same
     food. Include common variants (yağlı / yarım yağlı, tam / az yağlı, etc.).
     Do NOT include `name_tr` itself. Empty array `[]` if none.
   - `kcal_per_100` (number) — kilocalories per 100 g or 100 ml.
   - `protein_g` (number) — protein grams per 100 g / 100 ml.
   - `fat_g` (number) — fat grams.
   - `carbs_g` (number) — carbohydrate grams.
   - `fiber_g` (number) — fiber grams. Use 0 if unknown or not applicable
     (dairy, meat, oils).
   - `source` (string, optional) — where the numbers came from
     (e.g. "USDA fdc_id 171265", "TÜBER 2015", "manufacturer label", "estimate").
3. All numeric fields are per 100 g of solid food, or per 100 ml of liquid.
   Convert if the input gives per-serving values.
4. All numbers non-negative. Use decimals with a period (0.3, not 0,3).
5. Round to at most 1 decimal place, except kcal which is a whole number.
6. If the input mentions the same food twice, merge into one entry, preferring
   the more specific / more sourced numbers.
7. If a food's values are obviously missing or nonsensical, drop the entry
   rather than guessing.
8. `name_tr` normalization: trim, lowercase using Turkish rules (İ → i, I → ı),
   no trailing punctuation, no size qualifiers ("500 g", "büyük boy" — strip
   these). Preserve two-word names like "eski kaşar", "tavuk göğsü".

Example output:

```json
[
  {
    "name_tr": "süt",
    "aliases": ["tam yağlı süt", "yarım yağlı süt", "uht süt"],
    "kcal_per_100": 61,
    "protein_g": 3.2,
    "fat_g": 3.3,
    "carbs_g": 4.8,
    "fiber_g": 0,
    "source": "USDA fdc_id 171265"
  },
  {
    "name_tr": "kabak",
    "aliases": ["yeşil kabak"],
    "kcal_per_100": 17,
    "protein_g": 1.2,
    "fat_g": 0.3,
    "carbs_g": 3.1,
    "fiber_g": 1.0,
    "source": "USDA fdc_id 11477"
  }
]
```

Now convert the following:

---

<paste your nutrition text here>
