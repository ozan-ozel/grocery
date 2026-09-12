# Session Record: Mobile Bottom-Nav Redesign

## Current Objective

Branch: `feature/mobile-bottom-nav-redesign`. Complete the comprehensive mobile-first UI refactor.
Thirteen changes are complete; remaining work includes shopping integration with the basket button,
moving JSON upload to NutritionView, and additional UI refinements.

## Current State

The mobile navigation and UI polish phase is in progress. Recent changes include bottom navigation,
ProfileMenu, macro-card redesign, settings relocation, theme relocation, the nutrition-value toggle,
app padding, NutritionView scope dropdown and compact nutrition grid, and collapsible sections in
MealPlanView and PersonalPlanView.

The branch has approximately 15 commits and is not merged or pushed. The last recorded verification
had clean TypeScript, Vite, API typecheck, and Vitest results (108/108).

## Files Changed

- `NutritionView.tsx` — scope dropdown and compact nutrition-value grid.
- `MealPlanView.tsx` — collapsible recommended-foods section.
- `PersonalPlanView.tsx` — collapsible exclusions and allergen-group sections.
- Earlier work also removed retired Netlify functions/configuration and dependencies, added
  `vercel:dev`, and updated related documentation.

## Important Decisions

- Bottom navigation replaces the old top-section pills; settings are available through ProfileMenu.
- The theme switcher belongs in ProfileMenu.
- Nutrition values are shown only when enabled in list scope and are hidden by default in all/compare.
- ProfileMenu is a bottom-sheet modal with theme, tenant, logout, and account-deletion actions.
- The implementation used quick mode, so browser verification was deferred.

## Constraints

- Continue coding on a feature branch, never directly on `master`.
- The user requested no testing, review, or re-check after implementation for this work.
- The branch is intended for manual testing before merge.

## Problems / Unresolved Issues

- JSON upload relocation, basket-button shopping integration, and remaining visual polish are pending.
- Browser QA and actual phone-width responsiveness have not been completed.
- PSM Iteration 1 is committed as `b09d90b`; browser QA remains open there too.

## Next Steps

1. Continue the remaining mobile UI refactor.
2. Test with `npm run vercel:dev` at phone width when the no-check constraint is lifted.
3. Polish, then BCMP into `master` when ready.

## Important Context

The previous session also removed obsolete Netlify deployment artifacts and corrected stale docs about
the deleted per-row CRUD scaffold. Supabase SQL migrations and historical planning/spec documents
were deliberately left untouched.
