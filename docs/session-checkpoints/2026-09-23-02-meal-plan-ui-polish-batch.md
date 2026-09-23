# 2026-09-23: Meal-plan UI polish batch

**Date:** 2026-09-23
**Branch:** `master` (merged from `feature/meal-plan-ui-polish-batch`, fast-forwarded, deleted after merge)
**Status:** done

## Current Objective

Address six UI feedback items from real-device screenshots: a long saved-meal `MealGroup` card needed
collapse/expand plus a quick edit path; the sparse "Listem" tab under Besin Değerleri duplicated
Alışveriş's own richer macro view; the Yemekler-sheet sub-tabs' active-tab color didn't match the sheet
(later re-reported and root-caused this same session); the "Kaydet ve ekle" save button gave misleading
loading feedback; and meal-group cards needed a lighter, source-distinguishing background tint. A
mid-batch correction from the user replaced "enrich Listem" with "remove Listem entirely, embed its
functionality in Alışveriş," and added a request for a delete-spinner in Yemeklerim.

## Current State

- All items implemented, live-verified via `QATEST` (the mint/redeem + Playwright flow), committed, and
  merged to `master` (`75abe85`). Pushed to `origin/master`.
- The Yemekler-sheet tab-color bug was investigated twice: an earlier pass in this session could not
  reproduce it (found the test account had defaulted to light theme). A later, more specific user report
  ("Yemeklerim/Hazır Yemekler/Tarifler sub-tabs vs. Besin Değerleri sub-tabs") led to the actual root
  cause: `SmoothPillTabs`' active pill hardcoded `bg-background`, which blends correctly on pages that sit
  directly on the page background, but reads as mismatched inside a `bg-card` surface (`BottomSheet`) since
  dark theme's `--color-background` (`#0a0e14`) differs from `--color-card` (`#121822`). Fixed with a new
  `surface` prop (`"page"` default vs `"card"`) on `SmoothPillTabs`, applied to both `MealsSheet` and
  `BatchCreateForm` (the latter has the same BottomSheet placement, confirmed by the user to fix as well).
- `QATEST` — a new shorthand for one-off live Playwright verification via the `agent-mint`/`agent-login`
  flow — was proposed, used, and then documented in `CLAUDE.md` and `docs/operations.md`, mirroring how
  `MOBILEUP`/`MOBILEDOWN` were documented earlier.
- `docs/CURRENT_STATE.md` was refreshed as part of `SYNC` before committing; it had been stale since before
  the DEC-033 merge.

## Files Changed

- `src/components/MealGroup.tsx` — collapse/expand toggle, edit-pencil for saved meals, per-source
  background tint (`saved`/`builtin`/`evening`, same primary-color family via `bg-primary/{5,10,15}`
  variants).
- `src/lib/mealGroups.ts` — `MealGroupSource`/`MealGroupInfo` types threaded through grouping.
- `src/components/MealContainer.tsx`, `src/components/MealPlanView.tsx` — wire `onEditSavedMeal`, tagged
  `mealInfoById` map, open `MealsSheet` straight into edit mode.
- `src/components/MealsSheet.tsx` — `openEditMealId` prop; delete-spinner (`Loader2`) replacing the trash
  icon per-row while a delete is in flight; `surface="card"` on its `SmoothPillTabs`.
- `src/components/NutritionView.tsx` — "Listem" scope removed entirely (rewritten twice: first enriched it,
  then removed per the user's correction); now Tümü/Kategoriler/Karşılaştır only.
- `src/components/ActiveList.tsx`, `src/components/ActiveListRow.tsx`, `src/lib/nutrition.ts` — new shared
  `scaledNutritionForItem()` helper; `ActiveList` gained an aggregate totals footer (matched-item count +
  5-column macro grid) in its existing "Besin değerleri" toggle. Also fixed a latent `NaN` risk: unparsable
  `qty` previously fed straight into `parseFloat` with no `Number.isFinite` guard.
- `src/components/SavedMealForm.tsx` — `submittingVariant: "save" | "saveAndAdd" | null` replacing a single
  `submitting` boolean, fixing the bug where the wrong button showed the loading label; both buttons now
  show a spinner + "Kaydediliyor…" correctly scoped to the one actually clicked.
- `src/components/ui/smooth-pill.tsx` — new `surface` prop and `SP_ACTIVE_CLASS_CARD` export.
- `src/components/BatchCreateForm.tsx` — `surface="card"` applied (same BottomSheet placement bug).
- `src/App.tsx` — `NutritionView` call site updated for its narrowed props (no more `items`/
  `showNutritionValues`).
- `CLAUDE.md`, `docs/operations.md` — `QATEST` shorthand documented; SP `surface` rule added to UI patterns.
- `docs/CURRENT_STATE.md` — refreshed (SYNC).

## Important Decisions

- **Listem removal, not enrichment**: the user's mid-batch correction was explicit — "Listem" is fully
  removed from Besin Değerleri, not just enriched; its functionality lives only in Alışveriş's own toggle
  now. Besin Değerleri is food-database browsing/comparison only going forward.
- **SP `surface` prop over a one-off override**: rather than hand-restyling the Yemekler sheet's tabs,
  extended the shared `SmoothPillTabs` component with a `surface` prop, and documented it in `CLAUDE.md` as
  a standing rule for any future tabs rendered inside a `bg-card` container — this was an explicit ask
  ("add ... the note for these sub tabs as all new tabs should have this rule, until a big change in the UI
  happens").
- **Fast-forward merge, not `--no-ff`**: the merge was initially done with `--no-ff`, producing a merge
  commit inconsistent with this repo's fully linear history. Caught before pushing, reset, and redone as
  `--ff-only` — `master` stayed a straight line.
- **`QATEST` scope**: documented as a one-off verification shorthand, not a git operation — it never
  commits/merges/pushes by itself, same posture as `MOBILEUP`/`MOBILEDOWN`.

## Problems / Unresolved Issues

- None outstanding for this batch — all six original items plus the delete-spinner addition were
  live-verified. See Open item 1 in `docs/CURRENT_STATE.md` for the still-pending real-phone pass (QATEST
  ran against a desktop-viewport Playwright browser, not a real device).

## Next Steps

- Real-phone verification of this batch's changes (collapse/edit/tint on `MealGroup`, the Alışveriş totals
  footer, both spinners, and the Yemekler-sheet tab-color fix) — tracked as part of `docs/CURRENT_STATE.md`
  Open item 1.
