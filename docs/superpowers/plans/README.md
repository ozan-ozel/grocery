# Feature Plans — Index

Each file here is a dated implementation plan for one app feature, usually paired with a design doc
of the same name (`+design`) in `docs/superpowers/specs/`. **The plans' own checkbox lists
(`- [ ]`) are not a reliable status signal** — every plan in this folder shows 0 checked boxes as of
2026-09-15, including several already shipped. This table is the real status; update it, don't rely
on the checkboxes.

| Plan | Date | Status | Evidence |
| --- | --- | --- | --- |
| [2026-08-21-meal-planner.md](2026-08-21-meal-planner.md) | 2026-08-21 | `SHIPPED` | Meal tracking UI shipped (`9d2231e`, `2073759`) |
| [2026-08-22-meal-planner-local-food-based.md](2026-08-22-meal-planner-local-food-based.md) | 2026-08-22 | `SHIPPED` | Same feature line as above |
| [2026-08-25-household-ownership-sharing.md](2026-08-25-household-ownership-sharing.md) | 2026-08-25 | `SHIPPED` | `household` is a core concept across most hooks (`useAuth`, `useBatches`, `useMealPlan`, ...) |
| [2026-08-27-nutrition-compare-view.md](2026-08-27-nutrition-compare-view.md) | 2026-08-27 | `SHIPPED` | "Karşılaştır" (Compare) dropdown shipped in `NutritionView` |
| [2026-08-27-vercel-migration-handoff-prompt.md](2026-08-27-vercel-migration-handoff-prompt.md) | 2026-08-27 | `SHIPPED` | Vercel is the live deploy target today |
| [2026-09-01-remaining-budget-mvp.md](2026-09-01-remaining-budget-mvp.md) | 2026-09-01 | `SHIPPED` | Matches `useRemainingToday.ts` |
| [2026-09-02-nutrition-personal-plan-ux-polish-summary.md](2026-09-02-nutrition-personal-plan-ux-polish-summary.md) | 2026-09-02 | `UNCLEAR` | Reads as a retrospective summary, not a fresh feature — not verified |
| [2026-09-03-first-run-onboarding.md](2026-09-03-first-run-onboarding.md) | 2026-09-03 | `SHIPPED` | `OnboardingQuickSetup.tsx` + `useOnboarding.ts` exist |
| [2026-09-04-sport-nutrition-integration-handoff.md](2026-09-04-sport-nutrition-integration-handoff.md) | 2026-09-04 | `UNCLEAR` | Not verified |
| [2026-09-09-supabase-auth-migration.md](2026-09-09-supabase-auth-migration.md) | 2026-09-09 | `SHIPPED` | Supabase is the live auth/backend today |
| [2026-09-10-backend-only-oauth.md](2026-09-10-backend-only-oauth.md) | 2026-09-10 | `SHIPPED` | Direct Google OAuth code exchange shipped (`5cf2350`) |
| [2026-09-12-agent-test-login.md](2026-09-12-agent-test-login.md) | 2026-09-12 | `SHIPPED` | `api/agent-login.ts` (mint/redeem) + `supabase/25-agent-login-tokens.sql` shipped in `20f3f46` (2026-09-16) and used for live Playwright QA since. Local-only: `.vercelignore` excludes it from deploys (12-function Hobby limit), and `vercel dev` honors that file too — see `CLAUDE.md`'s `agent-login` note. `api/_auth-test-login.ts` is a different, earlier bypass (and unroutable: underscore prefix) |
| [2026-09-12-daily-macros-layout.md](2026-09-12-daily-macros-layout.md) | 2026-09-12 | `SHIPPED` | `MacroSummaryCard.tsx`'s tile layout matches |
| [2026-09-12-editable-meal-item-grams.md](2026-09-12-editable-meal-item-grams.md) | 2026-09-12 | `SHIPPED` | "Gram miktarını düzenle" edit UI in `MealItemCard.tsx` |
| [2026-09-12-gram-unit-conversion-ux.md](2026-09-12-gram-unit-conversion-ux.md) | 2026-09-12 | `NOT_STARTED` | No unit-conversion UI found anywhere in `src/` |
| [2026-09-12-meal-plan-header-cleanup.md](2026-09-12-meal-plan-header-cleanup.md) | 2026-09-12 | `UNCLEAR` | Not verified |
| [2026-09-12-meal-plan-shopping-cleanup.md](2026-09-12-meal-plan-shopping-cleanup.md) | 2026-09-12 | `UNCLEAR` | Not verified |
| [2026-09-12-meal-row-macro-totals.md](2026-09-12-meal-row-macro-totals.md) | 2026-09-12 | `SHIPPED` | `calculateItemsNutrition` wired into `MealContainer.tsx` |
| [2026-09-12-meal-to-shopping-list-toggle.md](2026-09-12-meal-to-shopping-list-toggle.md) | 2026-09-12 | `SHIPPED` | Its own checkpoint says "Implementation complete," merged in `eace7f0` |
| [2026-09-12-recent-favorites-quick-add.md](2026-09-12-recent-favorites-quick-add.md) | 2026-09-12 | `NOT_STARTED` | No "favorite"/"quick add" trace anywhere in `src/` |
| [2026-09-12-recipe-picker.md](2026-09-12-recipe-picker.md) | 2026-09-12 | `SHIPPED` | `RecipeSearchModal.tsx` existed; replaced by `MealsSheet.tsx` on 2026-09-20 (see the meals-sheet plan below) |
| [2026-09-12-saved-meal-templates.md](2026-09-12-saved-meal-templates.md) | 2026-09-12 | `SUPERSEDED` | Replaced on 2026-09-20 by [2026-09-20-meals-sheet-yemeklerim-tarifler.md](2026-09-20-meals-sheet-yemeklerim-tarifler.md): per-user `saved_meals` served from `api/personal-plan.ts` instead of a household-scoped `meal_templates` + new `api/meal-templates.ts` (the project is at the 12-function limit). Do not implement this one |
| [2026-09-17-boot-performance-waterfall.md](2026-09-17-boot-performance-waterfall.md) | 2026-09-17 | `SHIPPED` | Phases 0-3 + 4a/4b/4c implemented on `perf/boot-waterfall`; boot calls now start within 2ms of each other vs 1.7s/3.5s/5.7s — see [2026-09-17-02 checkpoint](../../session-checkpoints/2026-09-17-02-boot-performance-waterfall.md). Phase 4d (`getClaims()`) and the asset work were out of scope by the plan's own decision |
| [2026-09-19-batch-preparation-ui.md](2026-09-19-batch-preparation-ui.md) | 2026-09-19 | `SHIPPED` | `BatchSheet.tsx` / `BatchAllocateSheet.tsx` mounted in `MealPlanView.tsx`; `BatchPlanner.tsx` removed |
| [2026-09-20-meals-sheet-yemeklerim-tarifler.md](2026-09-20-meals-sheet-yemeklerim-tarifler.md) | 2026-09-20 | `SHIPPED` | Implemented and verified in the real app on 2026-09-20 (`MealsSheet.tsx`, `MealRow.tsx`, `SavedMealForm.tsx`, `MealCompositionEditor.tsx`, `src/lib/savedMeals.ts`, `src/lib/mealRecommend.ts`, `useSavedMeals.ts`; `saved_meals` served from `api/personal-plan.ts` via the `/api/saved-meals` rewrite; `RecipeSearchModal.tsx` removed) — see [2026-09-20-03 checkpoint](../../session-checkpoints/2026-09-20-03-meals-sheet-yemeklerim-tarifler.md). Decisions 1-7 approved by the owner. Still pending: phone-only checks and the commit/merge (the feature work is uncommitted; the branch already carries `3c4c39d`, the sql migration, and `dbe9ea2`, the Task 1 cleanup); `supabase/28-saved-meals.sql` is applied to the developer's project and must be applied wherever else this is deployed |

## Status vocabulary

- `SHIPPED` — verified in the source tree or an existing checkpoint
- `NOT_STARTED` — plan exists, nothing built
- `UNCLEAR` — not verified; needs an actual read to classify
- `SUPERSEDED` — replaced by a newer plan for the same capability; do not implement
- `ABANDONED` — decided against, won't build (none yet)

## Keeping this current

Per `CLAUDE.md`'s "Session continuity" rule: flip a row to `SHIPPED` in the same commit that ships
the feature, not as a later cleanup pass.
