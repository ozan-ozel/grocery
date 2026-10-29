# 2026-10-29: Nutrition catalog, portions and planning-macro polish

**Date:** 2026-10-29
**Branch:** `fix/catalog-portions-polish`
**Status:** done locally — migration 29 applied by the owner and verified live; uncommitted, awaiting owner review

## Current Objective

- Finish the catalog/portion polish a Codex session left uncommitted when its usage limit ran out: verify
  the code, apply the close-out documentation, and check the result in the live local app.

## Current State

- Code (written by the Codex session, reviewed here): `npm run build` passes.
  - **Catalog:** migration 29 adds read columns `source`, `preparation_state`, `is_active`,
    `canonical_name`, `equivalent_food_ids` and `equivalent_names`. Duplicates are retired without
    deleting them, keeping their UUIDs, and added rows include boneless thigh, süzme yoğurt and corn pasta.
    Pickers, browse/compare and recommendations hide inactive rows. Exclusions follow equivalence groups.
  - **API:** `api/nutrition.ts` falls back to the legacy columns before 29 is applied.
  - **Caches:** the nutrition caches moved to `v2` with a 5-minute TTL.
  - **Meals:** `data/ready-meals.json` has lowered dry-weight grams and 10 canned + 2 snack meals. The
    `ara` slot now accepts snack-tagged meals only.
  - **Planning macros:** `src/lib/planningMacros.ts` replaces range midpoints with one energy-consistent
    point. When none exists it returns null, and the UI shows a neutral message and hides recommendations.
- The owner ran `supabase/29-nutrition-catalog-polish.sql` in the Supabase SQL Editor ("Run and enable
  RLS", which also enabled RLS on the private backup table — harmless, it has no grants).
- Live QA (agent@local.dev, onboarding skipped, nothing saved), all checks passed:
  - The API returns 103 rows, 98 of them active. The 5 inactive rows have the expected redirects, and
    6 rows carry equivalence groups. 35 rows have allergen mappings.
  - The meal-plan target is 2470 kcal, matching its 4/4/9 sum.
  - The snack slot recommends only snack meals, and portion grams scale with the selected tier.
  - The food picker hides all 5 retired rows.
  - The browser shows "98 besin" with preparation and source details.
  - The Kişisel Plan note renders.
- `planningMacros` was checked with a one-off script (since deleted): the normal case sums exactly to
  the calorie target, and the too-low, too-high and inverted-range cases return null.
- Docs updated: `architecture.md`, `operations.md`, `data/README.md`, the roadmap/mvp-scope/DEC trio
  (DEC-056, DEC-061, DEC-066), and the allergen-coverage counts (19/89 → 35/103).

## Important Decisions

- Data decisions and sources are recorded in `data/catalog-review-2026-10-29.md` (Codex session).
- Equivalence groups and allergen mappings are set only by migration 29, not by a seed upload. Seed
  after 29, not before (the seed now sends columns that do not exist pre-29).

## Problems / Unresolved Issues

- `agent-session down` reported "ERROR restoring .vercelignore". The file still had the
  `#AGENT-SESSION-TEMP#` line and was restored by hand with `git checkout -- .vercelignore`. The
  script's restore failure was not investigated.
- Still-unverified data (per the review): baldo brand record, eski kaşar and karabuğday ekmeği labels.
  DEC-061 stays `PARTIAL`.

## Next Steps

1. Owner reviews the diff and commits (CMP; branch already exists).
2. Optional: investigate why `agent-session down` failed to restore `.vercelignore`.
