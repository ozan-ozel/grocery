# 2026-09-16: Evening Meal Recommendation MVP (DEC-060 extension)

**Date:** 2026-09-16
**Branch:** `feature/evening-meal-recommendation`
**Status:** implemented, typecheck/build clean, live-verified via an authenticated Playwright session,
committing now

## Current Objective

Multi-stage session: (1) a discovery-only architecture pass over the existing combo/comboMatch/
remaining-macro system for a proposed evening-meal recommendation feature, (2) a revision of the
quantity-solving design after the user rejected the initial "solve protein first, spend leftover kcal
on carbs" heuristic as blind to protein fat density, (3) implementation against `TodayView.tsx`,
(4) discovery that `TodayView.tsx` is dead code — not mounted anywhere in `App.tsx` — so the feature
was invisible in the live app, (5) a second discovery pass tracing the actually-live `MealPlanView.tsx`
route, (6) re-implementation there (mechanically extracting the shared `SuggestionCard` in the
process), (7) adding a per-card "eaten, with undo" state after the user found a plain per-ingredient
delete insufficient, (8) live verification via an authenticated Playwright session using the
`agent-login` dev mint/redeem flow.

## Current State

Implemented as `src/lib/eveningRecommend.ts`, a new additive module — `comboMatch.ts` is untouched.
Extends `DEC-060` (Domain K, Food Selection, already `SHIPPED` via `scoreAllCombos`/`matchCombos`),
not a new decision.

**Architecture**: `CandidatePattern` (protein food + carb food, no fixed grams) → bounded discrete
grid search over both foods' realistic gram ranges → `scoreInstance()` picks the best-fitting grams
per pattern against the caller's actual `remaining: MacroTotals` (from the existing
`useRemainingToday`, no second remaining-macro calculation) → output reshaped into the existing
`ScoredCombo` type so `TodayView.tsx`'s `SuggestionCard`, "Listeye ekle"/"Hazırlanıyor"/"Yedim", and
post-log gram editing all work unmodified.

**Gram-semantics finding (blocking question from the revised plan, resolved before implementing
bounds)**: every relevant `data/nutrition.json` row (`pirinç` 365 kcal/100g, `bulgur` 342, `makarna`
371, `tavuk göğsü` 120, `dana kıyma` 215, `hindi göğsü` 114) matches USDA **raw/dry** ingredient
density, not cooked — confirmed by comparing kcal/protein/fat signatures against known raw-vs-cooked
USDA reference values, and corroborated by `data/combos.json`'s own existing prep notes (e.g. "pirinci
pişirin" — cook the rice — attached to an existing 150g `pirinç` combo line). This is not a new
convention; it's the one already implicit across all 16 existing combos. Carb gram bounds (50-150g)
were sized on that dry-weight basis specifically because the original planning draft's 100-300g
proposal would have meant up to 300g of *dry* rice (≈750-900g cooked, several servings) — caught by
the temporary verification script before it shipped.

**Candidate set**: 7 patterns, all foods confirmed present in the checked-in `data/nutrition.json`
seed — `tavuk göğsü` / `dana kıyma` / `hindi göğsü` × `pirinç` / `bulgur` / `makarna` (hindi limited to
bulgur, matching an existing authored combo). Antrikot/bonfile/kontrfile/chicken thigh were
**deliberately excluded** — this session could not reach the live Supabase `nutrition` table (its
`/api/nutrition` route requires an authenticated session; `.env.local` was not accessible to this
session by design) to confirm whether those cuts exist there, and the task's own rules forbid
inventing nutrition rows.

**Bounds** (grams, all dry/raw weight):
- Lean protein (`tavuk göğsü`, `hindi göğsü`): 100-250g, step 25
- Higher-fat protein (`dana kıyma`): 100-200g, step 25 (lower ceiling — deliberately caps how much
  of the remaining fat budget one portion can consume before scoring even runs)
- Carb (all three): 50-150g, step 25

No invented "minimum 300 kcal practicality" floor (the task explicitly rejected this) — practicality
comes from the bounds themselves plus the asymmetric kcal-excess penalty in scoring.

**Scoring**: asymmetric per-macro shortfall/excess weights (fat excess weighted 2.0x vs. 0.3x
shortfall; protein shortfall 1.0x vs. 0.3x excess; kcal excess 1.5x vs. 0.5x shortfall; carbs
symmetric 0.5x/0.5x), combined via top-level weights kcal 0.35 / protein 0.30 / carbs 0.20 / fat 0.15.
All eight weights are named constants in `eveningRecommend.ts`, explicitly documented as MVP tuning
parameters, not derived values. Fiber is calculated and carried through `MacroTotals` but excluded
from scoring, per the task's explicit instruction.

**Verified** via a temporary script (`scripts/_verify-evening-recommend.ts`, deleted after use) across
7 scenarios: high/low remaining fat, high/low remaining carbs, fatty-vs-lean protein under the same
budget, very-low remaining kcal, and near-zero/negative remaining (no NaN, empty result as expected).
Confirmed the fat-aware behavior the whole feature exists for: with a tight fat budget (8g), `dana
kıyma` patterns drop to the bottom of the ranking (real fat totals 16-17g, over budget); with an ample
fat budget (60g), they rank at the top. `tsc -b` and `npm run build` both clean at every stage.

**`TodayView.tsx` is dead code — root cause of "the section isn't visible"**: after the first
implementation pass, the user reported the section didn't render at all. Tracing `App.tsx`'s actual
routing found `TodayView` has no importer anywhere — the "Bugün" sub-tab it belonged to was removed
from `SHOPPING_TAB_ORDER` in an earlier, unrelated session, leaving the component orphaned. This is
the same trap `docs/SESSION_FOLLOWUP.md`'s "Failed Approaches" section already recorded once before
("trace App.tsx's section routing... before editing screen-specific UI") — repeated here because the
original architecture-discovery pass never re-checked it. `MealPlanView.tsx` (the `yemek` section) is
the actual live daily meal-plan screen.

**Re-implemented against `MealPlanView.tsx`**: `SuggestionCard` was mechanically extracted from
`TodayView.tsx` into `src/components/ui/suggestion-card.tsx` (byte-for-byte, no visual/behavioral
change) so both files could render it. `MealPlanView.tsx` gained a `useRemainingToday(userId,
householdId)` call (today's real remaining macros, independent of whichever day is being browsed via
`goToPrevDay`/`goToNextDay`), gated by `date === todayDateStr()`, feeding `matchEveningCombos()`. The
section renders between the four `MealContainer`s and the existing modals — no other layout change.

**Eaten/undo card**: `SuggestionCard` gained optional `eaten`/`onUndo` props. `MealPlanView`
reconstructs which evening patterns were already logged today from `remainingToday.todaysItems`
(grouped by `comboId` against `EVENING_PATTERN_BY_ID`, same precedent as `TodayView.tsx`'s old
"Bugün yediklerin"), renders that pattern's own card in-place with its real logged totals, a
"Bugün yedin" label, and a "Geri al" button wired to `remainingToday.undoConsumption()` — instead of
requiring the user to find and delete each ingredient individually from whichever meal slot it landed
in.

**Live-verified** via an authenticated Playwright session (the dev-only `api/agent-login.ts` mint/
redeem flow — secret saved to this project's memory, see `agent_login_secret.md` in the memory store,
not committed anywhere in the repo). Confirmed live: the section renders with all 7 patterns once
remaining budget is positive; "Yedim" logs the exact solved grams into "Son Öğün" and updates consumed
macros immediately; the card flips to "Bugün yedin" + "Geri al" and is no longer duplicated as a fresh
suggestion; "Geri al" fully reverts consumed macros and removes the logged ingredients; navigating to
a previous day hides the entire section with no empty container.

## Files Changed

- `src/lib/eveningRecommend.ts` (new) — `CandidatePattern`, `EVENING_CANDIDATE_PATTERNS`,
  `EVENING_PATTERN_BY_ID`, bounds constants, `scoreInstance()`, `matchEveningCombos()`. Untouched since
  first written — never modified during the later re-integration or undo work.
- `src/components/ui/suggestion-card.tsx` (new) — `SuggestionCard`, extracted from `TodayView.tsx`,
  plus the new optional `eaten`/`onUndo` props for the in-place undo state.
- `src/components/TodayView.tsx` — kept its own evening-suggestions wiring (inert — this component is
  never mounted, see above) but now imports the shared `SuggestionCard` instead of a private copy.
- `src/components/MealPlanView.tsx` — the actual live integration: `useRemainingToday`, the
  `date === todayDateStr()` gate, `matchEveningCombos` call, the "Akşam için öneriler" section, and the
  eaten-pattern reconstruction/undo handler.
- `docs/mvp-scope/food-selection-mvp.md` — `DEC-060` reality note extended; new section describing
  the evening path.
- `docs/mvp-scope/macros-mvp.md` — noted the evening slice of the "min/max macros per meal" open item
  as addressed; the general four-slot version is still open.
- `nutrition-curriculum/DEC_REGISTER.md` — `DEC-060` row note extended.

## Important Decisions

- Did not modify `comboMatch.ts` at all — confirmed via `git diff --stat` before finishing.
- Did not add a new persisted entity for "recommendation instance" — it's a same-render calculation,
  reshaped into the existing `ScoredCombo` type at the end of `matchEveningCombos`.
- Rejected the original planning draft's sequential "protein-first, then spend leftover kcal on
  carbs" solver in favor of full bounded discrete search, per explicit user direction — every
  (proteinG, carbG) grid point gets a real `MacroTotals` and a real score, so a fatty protein's fat
  contribution is evaluated, not discovered too late.
- Did not implement a live-catalog check via a workaround (e.g. probing the dev-only `agent-login`
  route) — treated `.env.local`/session-credential access as out of bounds for this session and
  reported the resulting candidate-set limitation instead of guessing.

## Next Steps

1. Confirm the live `nutrition` table for antrikot/bonfile/kontrfile/chicken-thigh `name_tr` values
   (Besin tab or a direct Supabase check); add those patterns to `EVENING_CANDIDATE_PATTERNS` once
   confirmed — do not invent rows.
2. Consider whether the 50g carb-bound floor is too high for a genuinely low-carb remaining budget
   (scenario D in verification showed all results landing at the 50g floor when the carb target was
   15g) — a product judgment call, not a bug.
3. `TodayView.tsx` is now confirmed-dead code with two independent recommendation implementations
   living inside it (the original `matchCombos` suggestions and this session's now-superseded evening
   section). Worth a separate, deliberate decision on whether to delete it outright or leave it as
   reference — not decided in this session, and not something to do silently as a "while I'm here"
   cleanup.
4. `docs/superpowers/plans/README.md` doesn't have an entry for this feature (it wasn't planned via
   that flow) — flagging per `CLAUDE.md`'s close-out checklist item 2, but no action taken since there's
   no existing plan-index row to flip.
