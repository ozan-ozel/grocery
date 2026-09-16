# 2026-09-16-07 — Meat meals + hindi göğsü sort-to-bottom

Branch: `feature/meat-meals-and-hindi-sort`

## Request

Add more meat-based meal combos to the app (beef and chicken cuts beyond
what already existed), and make hindi göğsü (turkey breast) sort to the
very bottom of both the meal-suggestion list and the "ürünler" (products)
browse list — an explicit household preference, not a nutritional ranking.

## What changed

**New foods** (added to `data/nutrition.json` and, via the app's own
"JSON yükle" panel in the Besin tab, upserted into the live Supabase
`nutrition` table so they actually appear in the running app):
- `biftek (antrikot)` (aliases `biftek`, `antrikot`)
- `kontrfile` (alias `dana kontrfile`)
- `tavuk but (kemikli)` (aliases `tavuk but`, `kemikli but`)

`biftek` was renamed to `biftek (antrikot)` mid-session (see Rename below)
— the live Supabase row was updated in place via a one-off script using
the service-role key (`UPDATE ... WHERE name_tr = 'biftek'`), not a second
upsert, so there's no orphaned `biftek` row left behind.

**New combos** (`data/combos.json`), plus matching `eveningRecommend.ts`
candidate patterns so they show up in "Akşam için öneriler":
- Biftek (antrikot) ve pirinç pilavı
- Et sote (kontrfile) ve bulgur pilavı
- Tavuk ızgara tava (tavuk göğsü + patates)
- Fırında tavuk but (kemikli) (+ patates)

**Rename pass** (requested after initial implementation):
- "Izgara tavuk tava" → "Tavuk ızgara tava"
- "biftek" (food) → "biftek (antrikot)"; combo name updated to
  "Biftek (antrikot) ve pirinç pilavı"
- "Dana sote veya kontrfile ve bulgur pilavı" → "Et sote (kontrfile) ve
  bulgur pilavı"

`eveningRecommend.ts`'s comment block explaining why these were previously
omitted (no authenticated access to confirm live catalog names) is now
stale and was removed — the names are confirmed live.

**Turkey sort-to-bottom**, added in two independent places since they're
separate ranking engines:
- `src/lib/comboMatch.ts` (`scoreAllCombos`) — any combo containing a
  `hindi*` food id now sorts after every non-turkey combo, ahead of the
  existing soft-conflict/protein tiebreakers. Backs `matchCombos`,
  `BatchPlanner`, and any future `scoreAllCombos` consumer.
- `src/lib/eveningRecommend.ts` (`matchEveningCombos`) — same rule,
  independently applied (it has its own sort, doesn't call
  `scoreAllCombos`).
- `src/components/NutritionAllFoodsBrowser.tsx` — the "ürünler" browse
  list now sorts any `hindi*`-named row to the end of its category group
  before grouping, instead of relying on alphabetical order.

**Follow-up: bone-in chicken thigh deprioritized too** (requested after
the rename pass) — both `comboMatch.ts` and `eveningRecommend.ts`'s single
turkey boolean check were refactored into a `preferenceTier()` function
(0 = normal, 1 = bone-in chicken thigh, 2 = turkey), so "Fırında tavuk but
(kemikli)" now sinks low as well, just not as low as turkey. Verified live:
it dropped out of the top-8 "Akşam için öneriler" entirely (previously
ranked 2nd).

`kontrfile` and `tavuk but (kemikli)` were also added to
`eveningRecommend.ts`'s `HIGHER_FAT_PROTEIN_IDS` set (their fat content is
close to `dana kıyma`'s), which narrows the gram-search bounds the solver
uses for them.

## Verification

- `tsc -b` and `npm run build` both clean; no bundle-size regression
  (main chunk still 221.31 kB / 71.33 kB gzip).
- Live-tested via Playwright against `vercel:dev` (agent-login session):
  - Used the app's own "JSON yükle" panel (Besin tab) to upsert the 3 new
    foods into Supabase — confirmed "3 satır kaydedildi."
  - "Tümü" (all-foods) browse: biftek/kontrfile show under Kırmızı Et,
    tavuk but (kemikli) under Kanatlı, and hindi göğsü now renders after
    tavuk göğsü in that group instead of before it (alphabetically it
    would sort first).
  - Yemek Planı → "Akşam için öneriler": new combos (Tavuk ızgara tava,
    Fırında tavuk but (kemikli), Biftek (antrikot) ve pirinç pilavı)
    appear with the renamed labels; hindi combo dropped out of the top-8
    list entirely once ranked behind every non-turkey option, confirming
    the sink-to-bottom rule fired.
  - After the rename, re-verified: Besin tab shows `biftek (antrikot)`
    (still 92 besin, no duplicate row from the rename), and the evening
    suggestion resolved `biftek (antrikot)` as a food id correctly (proof
    the DB rename and the code's `proteinFoodId` stayed in sync).

## Out of scope / not done

- `data/nutrition.json` had already drifted behind the live Supabase table
  (it has several rows — e.g. `kıyma`, `baldo pirinç`, `kinoa` — added via
  the JSON-upload panel over time but never written back to the repo
  file). This session did not attempt to reconcile that; it only added the
  3 new rows to both places.
- `TodayView.tsx`'s "Diğer kombinasyonlar" list (also backed by
  `scoreAllCombos`) is currently unmounted/unused in the app (superseded
  by `MealPlanView`), so the turkey-sort fix there was verified by reading
  the code path, not by live UI exercise.
