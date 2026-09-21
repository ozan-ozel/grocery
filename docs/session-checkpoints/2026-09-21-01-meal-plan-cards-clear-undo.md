# 2026-09-21: Meal plan — meal cards, bulk clear, 5-step undo

**Date:** 2026-09-21
**Branch:** `feature/meal-plan-cards-clear-undo` (uncommitted at the time of writing)
**Status:** implemented and verified in a desktop browser; docs closed out; not committed; phone-only checks pending

## Current Objective

Three owner-requested features on Yemek Planı: (1) show meals added from the Yemekler sheet as cards inside
their slot, (2) clear a slot or the whole day in one action, (3) an undo the owner widened to "5 undos for
every action on the meal plan screen", with a swipeable toast. Extends `DEC-070` (Domain L). Spec:
`docs/superpowers/specs/2026-09-21-meal-plan-cards-clear-undo-design.md`; plan:
`docs/superpowers/plans/2026-09-21-meal-plan-cards-clear-undo.md`.

## Current State

- All eight plan tasks are done. `npm run build` passes.
- Verified in a 390 px-wide desktop browser through the agent-session flow: a 4-food meal renders as one card
  and dissolves to a plain item at one food; the same meal added twice gives two cards; slot clear and day
  clear each undo as one step; six actions leave "Geri al · 5" and the oldest stays applied; undo from another
  day returns the view to the original day; "Yedim" adds and undoes as one step; the toast swipes away both
  ways and snaps back on a short drag; the toast's "Geri al" link and × still click; the day was left empty.
- Docs updated together: `meal-construction-mvp.md`, `roadmap_v2.md`, `mvp-scope/README.md`,
  `DEC_REGISTER.md` (`DEC-070` note), the plans index (`SHIPPED`), `architecture.md`.

## Files Changed

- New: `src/lib/mealGroups.ts`, `src/lib/mealPlanHistory.ts`, `src/components/MealGroup.tsx`,
  `src/components/ui/swipe-toast.tsx`, `src/hooks/useMealPlanHistory.ts`, `src/hooks/useSwipeToDismissX.ts`.
- Changed: `src/hooks/useMealPlan.ts`, `src/components/MealPlanView.tsx`, `src/components/MealContainer.tsx`,
  `src/components/UndoToast.tsx`, `src/App.tsx`.
- Docs: the spec and plan above, and the files listed under Current State.

## Important Decisions

- Meal cards read the already-persisted `combo_id`; no schema, endpoint or persisted-key change (the project
  is at the 12-function limit). A card exists only while it has 2+ items; a repeated food starts a new group.
- Undo history is a module-level in-memory store, not component state, because Yemek Planı's `useMealPlan`
  and `useRemainingToday`'s ("Yedim") share the query cache but not React state. 5 steps, cleared on reload,
  no redo. Shopping-list buttons on this screen are not in this history (the shopping list keeps its own undo).
- One user action is one step (`runAsOneStep`). Undo replays inverses in reverse order through unrecorded
  `apply*` cores; a removal records its cache index so a restored entry returns to its place.
- Found during verification: the server orders by `(date, slot, position)` only, and `addItem` gave every
  item of one meal the same `position`, so order was arbitrary after a reload. `addItem` now uses one past the
  slot's highest position, read from the live cache.
- The toast message wraps to two lines instead of truncating.
- Skipping onboarding in the test browser only sets a `localStorage` flag (no database change); a `--email`
  agent-mint account would persist in Supabase Auth, `app_users` and `auth_user_map`.

## Constraints

- No commit was made (CLAUDE.md: commit only when asked). `.vercelignore` was restored by
  `agent-session down`; run `SYNC` before committing.

## Problems / Unresolved Issues

- Not verified on a real phone: toast swipe feel, card layout, soft-keyboard interaction.
- Toast stacking above the shopping-list toast (`shoppingUndoVisible`) was not exercised in the browser.
- Entries saved before the position fix can still share a `position` and reorder on reload.
- The card box was judged acceptable on desktop; the owner may still prefer the header-only fallback on a phone.
- A missing `favicon.ico` (404) shows in the console; unrelated to this work.

## Next Steps

1. Owner checks the phone-only items above and the toast stacking, then commits (branch already exists, so CMP).
2. If the card box reads as clutter on a phone, switch `MealGroup` to the header line plus left rail described
   in the spec.
