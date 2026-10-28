# 2026-10-28: readyMeal rename, nutrition source citations, DEC-012/013/020 safety posture

**Date:** 2026-10-28
**Branch:** `refactor/combo-to-ready-meal` (merged into `master`)
**Status:** done; live QA pending (`QATEST` after the push)

## Current Objective

Three pieces of work landed on one branch:

1. The code-only rename of "combo" to Meal / readyMeal (open item from 2026-10-27).
2. A check of whether the eight source books actually reach the code, followed by corrected citations for
   the numbers the app shows.
3. An MVP safety posture for the first three blocked safety decisions (DEC-012, DEC-013, DEC-020).

## Current State

- **Rename.** `src/lib/combos.ts` → `readyMeals.ts`, `comboMatch.ts` → `mealMatch.ts`, `data/combos.json` →
  `data/ready-meals.json`, plus a new `src/lib/meals.ts`; identifiers updated across ~20 files. Kept for
  compatibility: DB columns `combo_id` / `source_combo_id`, the API's `combo_id`, the local cache's `comboId`
  and the existing ids.
- **Books.** Corpus clarified as 7 nutrition textbooks + 1 culinary (*On Cooking*, Gate 6), moved locally to
  `01_SOURCE_BOOKS/08_On_Cooking/`; "cited, never redistributed" rule added to
  `nutrition-curriculum/README.md`. Code trace: SN4 direct, On Cooking limited, KM16/ACSM indirect; AS3, HM4,
  Bender3 and NRM had none.
- **Citations fixed** (Kişisel Plan sources, `PersonalPlanView.tsx`):
  - PAL values attributed to FAO/WHO/UNU 2004 (Table 5.3), not "WHO" or "DRI/IOM".
  - Water: Krause 16e p. 218 (30–35 mL/kg), DRI AI as context. The card now says "toplam sıvı, yiyecekler
    dahil"; the hydration open question is resolved as total fluid.
  - Per-meal protein: AS3 p. 44 and Schoenfeld & Aragon 2018.
  - Food values: USDA FoodData Central (CC0) and Turkish labels.
  - Numbers themselves are unchanged.
- **Safety posture** (owner decision; DEC statuses stay `BLOCKED`):
  - **DEC-012.** A self-attestation checkbox (`ScopeCheck`) in onboarding and Kişisel Plan. When checked,
    calorie/macro targets, the per-meal protein target and recommendations are hidden; lists, meals and
    recipes keep working. Stored in the browser only, as `grocery.scopeAttestation.v1:<userId>`.
  - **DEC-013.** An always-visible red-flag note.
  - **DEC-020.** A "starting estimate, re-check in 2–3 weeks" note.
  - All copy is in `src/lib/safetyCopy.ts` (provisional, for dietitian review).
- Trio docs (`roadmap_v2.md`, `mvp-scope` files, `DEC_REGISTER.md`) and `architecture.md` updated together.
- `tsc -b` and `npm run build` clean. Not yet browser-verified.

## Open

- Live `QATEST` of the safety posture and the rename flows.
- Persisting the attestation across devices needs a `personal_plan` column (live migration); not done.
