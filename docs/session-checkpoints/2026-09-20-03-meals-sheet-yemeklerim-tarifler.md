# 2026-09-20-03 — Yemekler sheet: Yemeklerim / Hazır Yemekler / Tarifler

Branch: `feature/meals-sheet-yemeklerim-tarifler` — implemented and verified in the real app on 2026-09-20.
The feature work is **uncommitted** (nothing merged or pushed; the owner said not to commit until they say so).
The branch already carries two commits: `3c4c39d` (`supabase/28-saved-meals.sql`) and `dbe9ea2` (Task 1 cleanup:
unused code removed, `data/combos.json` tags trimmed). The working-tree `data/combos.json` restores the original
`"tags": [...]` spacing that `dbe9ea2` had compacted, so commit the tree as it is.

Plan: [`docs/superpowers/plans/2026-09-20-meals-sheet-yemeklerim-tarifler.md`](../superpowers/plans/2026-09-20-meals-sheet-yemeklerim-tarifler.md)
(supersedes `2026-09-12-saved-meal-templates.md`, now `SUPERSEDED`). The owner approved the plan's
Decisions 1-7 as written, including Decision 2 (`DEC-067` re-scoped, not overturned).

## What changed

The Meal Plan's "Yemekler" button opens one bottom sheet for any slot with three tabs, replacing
`RecipeSearchModal.tsx` (deleted). The meal cards still have only `Ürünler` / `Yemekler`.

- **Yemeklerim** — the user's own saved meals. Build once (foods from the nutrition catalog + grams, plus
  optional "Hazırlama adımları ekle" steps), then add to any slot in one tap at the saved grams. "Kaydet" and
  "Kaydet ve ekle"; edit and delete (delete asks for confirmation). Meals blocked by an allergy/exclusion or a
  food that left the catalog are shown disabled with the reason.
- **Hazır Yemekler** — the built-in combos, with a deterministic **"Sana uygun"** block above the full list.
- **Tarifler** — meals that have steps: the user's saved meals with steps, plus built-in meals with a
  `prepNote`. There is no separate recipe type.
- **Per user, not per household**: `saved_meals` table (`supabase/28-saved-meals.sql`), RLS on `user_id`.
- **No new function**: the API is `api/personal-plan.ts?_resource=saved-meals`, exposed as `/api/saved-meals` by a
  `vercel.json` rewrite (the project is at 12/12 functions).
- **"Sana uygun"** is `src/lib/mealRecommend.ts` — pure, no AI: filter the meals a slot accepts, give the slot a
  share of the day's remaining macros, pick the best Küçük/Normal/Büyük tier per meal with `scoreInstance`, rank.
  The slot weights (`SLOT_WEIGHT`, snack = 0.5) are MVP tuning constants.

New: `src/components/MealsSheet.tsx`, `MealRow.tsx`, `SavedMealForm.tsx`, `MealCompositionEditor.tsx`,
`src/hooks/useSavedMeals.ts`, `src/lib/savedMeals.ts`, `src/lib/mealRecommend.ts`, `supabase/28-saved-meals.sql`.
Changed: `api/personal-plan.ts`, `vercel.json`, `data/combos.json` (unused tags dropped), `src/lib/combos.ts`,
`comboMatch.ts`, `eveningRecommend.ts`, `src/components/MealPlanView.tsx`, `BatchCreateForm.tsx`,
`ConfirmModal.tsx` (optional `onTop`).

## Verification (2026-09-20)

Live check in the real app (`npm run vercel:dev`, throwaway account,
`agent-login`) passed:

- saved-meals API: create / patch / delete / 404 / 400 / 401 / 409 (per-user cap);
- per-user isolation;
- Yemeklerim, Tarifler and "Sana uygun" flows, including blocked-by-allergy meals shown disabled and
  edit / delete;
- unchanged: Ürünler picker, Hazır rows, "Akşam için öneriler". (Toplu Hazırlıklar was also checked here, but its
  UI was hidden afterwards, see "Batch prep UI hidden" below.)

## Batch prep UI hidden

The owner decided to hide the batch-preparation UI (DEC-069) for now, because the naming inside the Yemekler sheet
changed and batch prep has to be re-wired to it later. Hide only: `api/preparation-batches.ts`, the database tables,
`useBatches`, `BatchSheet`, `BatchAllocateSheet`, `BatchCreateForm` and the `lib` files are all still in place.

- **What is hidden**: the "Toplu Hazırlıklar" row on Yemek Planı and the per-slot "add from a batch" action
  (`onSelectBatch`, the "Partiden" button on the meal cards). Entries already allocated from a batch keep their
  "Parti · <date>" label.
- **Where**: module-level constant `BATCH_PREP_VISIBLE = false` near the top of `src/components/MealPlanView.tsx`
  (only file changed for this).
- **How to bring it back**: flip `BATCH_PREP_VISIBLE` to `true`. Nothing else has to change for it to reappear.
- **Re-wiring still needed**: make the batch UI (the sheets, the batch form's "Yemekten" list, the "Partiden" action)
  consistent with the Yemekler sheet's new naming and tabs; the batch form's "Yemekten" list also still lists only
  built-in meals, not saved meals (see Known limits).
- **Verification**: `npm run build` and `npx tsc -p api/tsconfig.json --noEmit` only. The change was not checked in
  the running app.

## Needs a real phone (not verified)

- swipe-to-dismiss while a list in the sheet is scrolled;
- the soft keyboard in the name / food-picker / steps fields;
- the three-pill tab row at 360 px width;
- the delete confirmation sitting above the sheet with the keyboard open (iOS `--visual-top`). `ConfirmModal`'s
  `onTop` is an optional prop that only `MealsSheet` uses, and it is not worth a line in `CLAUDE.md`, so that file
  was intentionally not changed.

## Before this is deployed anywhere else

`supabase/28-saved-meals.sql` is applied to the developer's Supabase project only. Run it in the SQL editor of
every other environment that will run this code, or `/api/saved-meals` fails there. Deploys are manual
(`npm run deploy:prod`); nothing has been deployed.

## Known limits

- Only 6 of the 20 built-in meals carry a slot tag, so "Sana uygun" is only as good as those tags. In the live
  check the snack ("Ara") slot's four suggestions were all breakfast-tagged meals of 410-460 kcal, not light items.
- Follow-up (a): the snack slot's "Sana uygun" can offer breakfast-tagged meals. `fitsSlot` admits `kahvalti`-tagged
  meals into `ara`, and after the tag trim only 2 of the 20 built-in meals carry `ara-ogun` / `atistirmalik`, so on a
  partly filled day an egg-and-bread breakfast (about 414 kcal) can outrank the two real snacks. The fix is data
  (tag more light meals in `data/combos.json`), not code.
- Follow-up (b): when all four slots are already filled, `mealRecommend.ts` scores a snack against the whole day's
  remaining budget (the slot weight collapses to 1.0), which amplifies (a).
- The batch form's "Yemekten" list still shows only built-in meals (saved meals are not listed there).
- The slot weights are unvalidated tuning constants.
- A saved meal stores only foods and grams; totals come from the live catalog, so editing a food's nutrition
  changes them.
- Food-safety guidance (cooling / freezing / reheating) is still out of scope; a user's steps are their own text.
- Deliberately not done: a dedicated "Sana Uygun" tab, AI ranking, caching, household-shared meals, "save this
  slot as a meal" from a meal card, merging or removing "Akşam için öneriler".

## Docs updated together (trio rule)

`docs/mvp-scope/meal-construction-mvp.md` (update note + Item 2 / Item 3 rewritten), `docs/roadmap_v2.md`,
`nutrition-curriculum/DEC_REGISTER.md` (`DEC-066` / `DEC-067` notes), `docs/mvp-scope/README.md`,
`docs/superpowers/plans/README.md` (row flipped to `SHIPPED`), `docs/architecture.md` ("Saved meals (Yemeklerim)"),
`docs/SESSION_FOLLOWUP.md`, this file.
