# Remaining budget MVP ("Kalan Bütçe") — design

**Status:** approved, not yet implemented
**Author:** Ege Özel (with Claude)
**Date:** 2026-09-01
**Context:** Follows the 2026-09-01 product strategy review (published as an artifact; not
yet filed as a Linear issue — see Open items).

## Problem

The app has two correct, independently-shipped systems that never talk to each other.
`Kişisel Plan` computes daily nutrition targets (Mifflin-St Jeor + DRI-informed macro
ranges) from a user's profile. `Yemek Planı` records what was actually eaten each day.
Nothing in the codebase computes "target minus consumed," and nothing recommends what to
eat next. The shopping list and the food diary are also unconnected — picking something to
eat doesn't get its ingredients onto the list, and having something on the list doesn't
offer to log it as eaten. A user who has already set nutrition goals still has to do all of
this arithmetic in their head, every day.

## Scope note — why this is one spec, not four

The product strategy review identified four interdependent MVP pieces: a remaining-today
calculation, a new default landing view, a rule-based suggestion engine, and one-tap
list/log actions. Shipping the calculation with nowhere to see it, or the view with no
suggestions to show, proves nothing about whether the loop works — so this spec treats them
as one design. It's still broken into six independently reviewable parts (A–F) below, and
the implementation plan (next step, via writing-plans) will sequence them as ordered tasks.

## Non-goals

- **AI/LLM-generated suggestions.** Matching combos to remaining budget is deterministic
  rule-matching over a hand-authored list (Part C). No LLM call anywhere in this spec —
  the strategy review's explicit call was to prove the loop before adding AI cost.
- **Recipes with steps/instructions.** Combos are ingredient lists with quantities, not
  cooking instructions.
- **Pantry/inventory tracking** ("what's already at home").
- **Budget/price-aware suggestions** — no `price` column exists on any table yet.
- **Restaurant/delivery integration.**
- **Per-user meal-entry attribution in shared households.** `meal_entries` is
  household-scoped, not user-scoped (unlike `personal_plan`, which is per-user). This spec
  compares the signed-in user's own target against the household's shared consumption log
  and documents that as a known limitation for multi-person households — it does not add a
  `user_id` column or otherwise solve per-person attribution.
- **Editing the combo catalog from within the app.** `data/combos.json` is dev-edited and
  deployed, the same pattern `data/nutrition.json` started with — not the live-edited
  Besin-tab path.

## Users and success criteria

- Opening the app lands on "Bugün" instead of the shopping list, showing today's remaining
  kcal/protein/fat/carb/fiber: the signed-in user's Kişisel Plan target minus the
  household's logged Yemek Planı consumption for today.
- Below that, up to 5 combo suggestions that fit the remaining budget, each showing a name,
  prep time, and per-serving macros.
- Tapping "Listeye ekle" on a suggestion adds its ingredients to the active shopping list.
  Tapping "Yedim de" logs its ingredients as meal entries in an inferred slot, and the
  remaining-budget numbers update immediately without navigating away.
- A user with no Kişisel Plan profile sees a setup prompt instead of blank or fabricated
  numbers.
- A user can mark foods as excluded from their Kişisel Plan profile; excluded foods never
  appear in a suggested combo.
- The first-run Kişisel Plan form shows live target numbers immediately — only age, height,
  and weight are presented as required; activity, sex, and goal are pre-filled with a
  sensible default and editable inline.

## Architecture

```
TodayView (Alışveriş's new default sub-tab, before Liste)
        │
        ▼
useRemainingToday(userId, householdId, date)
        │
        ├──► useMealPersonalization(userId)     ──► personal_plan target      (existing)
        │
        └──► useMealPlan(householdId)'s already-
             fetched entries for `date`          ──► meal_entries consumption (existing)
        │
        ▼
{ status: 'no-profile' | 'ready', target, consumed, remaining }
        │
        ▼
comboMatch.matchCombos(combos, remaining, excludedFoodIds)
        │                          ▲
        │                          └── data/combos.json (static, bundled at build time)
        ▼
Suggestion cards, each with two actions:
        │
        ├─ "Listeye ekle" ──► listActions.addItem() once per ingredient      (existing, reused)
        │
        └─ "Yedim de"     ──► POST /api/meal-entries once per ingredient    (existing, reused)
                                       │
                                       ▼
                          useRemainingToday re-derives → numbers update in place
```

No changes to the shopping-list sync engine, auth, or categorization. No new Netlify
function. The only new backend surface is one additive column (Part E).

## Data model

### New migration — `supabase/10-personal-plan-exclusions.sql`

```sql
alter table public.personal_plan
  add column if not exists excluded_food_ids text[] not null default '{}';
```

Additive, nullable-equivalent (defaults to empty), no backfill needed.

### New static file — `data/combos.json`

```json
[
  {
    "id": "tavuk-pilav-salata",
    "name_tr": "Tavuklu pirinç ve salata",
    "items": [
      { "food_id": "tavuk göğsü", "grams": 150 },
      { "food_id": "pirinç", "grams": 150 },
      { "food_id": "domates", "grams": 100 }
    ],
    "prep_minutes": 20,
    "tags": ["hizli", "yuksek-protein"]
  }
]
```

`food_id` references `nutrition.name_tr`, unenforced by a foreign key — the same
convention `meal_entries.food_id` already uses, per `07-meal-entries.sql`'s own comment
that this is deliberate. Launches with roughly 15–20 hand-authored combos drawn from the
current 64-item nutrition catalog, covering a spread of prep times and macro profiles.

### New client types — `src/lib/combos.ts`

```ts
export type Combo = {
  id: string;
  nameTr: string;
  items: { foodId: string; grams: number }[];
  prepMinutes: number;
  tags: string[];
};
```

## Components

### `src/lib/comboMatch.ts` (new)

Pure function, no I/O: `matchCombos(combos: Combo[], remaining: MacroTotals, excludedFoodIds:
string[], catalog: NutritionMap): ScoredCombo[]` (the plan added the `catalog` parameter
during implementation, needed to look up each ingredient's actual macros — this spec's
earlier draft omitted it). Filters out any combo containing an excluded `food_id`, hard-
filters to combos whose total kcal doesn't exceed `remaining.kcal` (a combo that's over
budget on calories is dropped outright, not merely penalized), then ranks the survivors by
protein descending — protein was chosen over a full weighted fit-to-remaining score as the
simpler MVP heuristic, since it's the macro this app's target persona finds hardest to hit
without deliberate planning. Returns the top 5. Corrected here after the final whole-branch
review found this spec's original wording ("penalize combos that exceed... prefer
close-but-under") described a softer, multi-macro scoring approach that was never actually
implemented — the simpler kcal-filter-then-protein-sort approach that shipped is a
deliberate, approved MVP choice (see Task 4 in the implementation plan), not a shortfall.

### `src/hooks/useRemainingToday.ts` (new)

Composes `useMealPersonalization(userId)` (existing target) with the current day's entries
already fetched by `useMealPlan(householdId)` (existing ±3-day window includes today, so
this adds no new network call) into `{ status, target, consumed, remaining }`. `remaining`
is allowed to go negative — the UI shows it as-is rather than clamping to zero, per the
strategy review's point that hiding an over-budget day is what breaks trust in the number.

### `data/combos.json` + `data/README.md` (new data, doc update)

Document the combo row shape the same way `data/README.md` already documents nutrition
rows.

### `src/components/TodayView.tsx` (new)

Renders the remaining-macro summary, then up to 5 suggestion cards from `comboMatch`, each
with "Listeye ekle" / "Yedim de" actions. Three states: no profile (setup prompt, linking to
Kişisel Plan), ready with matches, ready with no matches (honest empty state explaining the
budget is too tight for any authored combo today — not a forced irrelevant suggestion).

### `src/components/AppShoppingTabs.tsx` (modify)

Add "Bugün" as a new first tab trigger in the existing Radix `Tabs` group, before "Liste",
and make it the default active sub-tab.

### `src/hooks/useUiPrefs.ts` (modify)

Extend the Alışveriş sub-tab type with the new `"bugun"` value and make it the default
instead of `"liste"`.

### `src/components/PersonalPlanView.tsx` (modify)

Pre-fill activity/sex/goal with sensible defaults so target numbers render on first paint;
only age/height/weight are presented as blank-required. Add a small excluded-foods
multi-select, writing to the new `excludedFoodIds` field.

### `src/lib/mealPersonalization.ts` (modify)

Extend the profile type and the read/write path to include `excludedFoodIds: string[]`,
mirroring how the other profile fields are already handled.

### `src/lib/listActions.ts`, `netlify/functions/meal-entries.ts` (unchanged)

Both reused as-is: `addItem` for the "Listeye ekle" action, the existing `POST
/api/meal-entries` for "Yedim de" (called once per combo ingredient — combos are 2–4
ingredients, so no bulk endpoint is needed at this scale).

## Error handling

- No Kişisel Plan profile → setup prompt, not fabricated numbers.
- No combo fits the remaining budget → honest empty state, not an irrelevant suggestion.
- Remaining goes negative → shown as a negative/over-budget value, not clamped or hidden.
- "Yedim de" partial failure (one ingredient's POST fails mid-sequence) → matches
  `useMealPlan`'s actual existing mutator behavior, not the meal-planner spec's original
  aspiration: the optimistic local update stays regardless of API outcome, and a failed
  `createMealEntry` call only `console.warn`s — there is no retry-UI affordance anywhere in
  `useMealPlan` today. The entries that succeeded stay either way; a failed one silently
  doesn't persist server-side rather than rolling back. Corrected here after the final
  whole-branch review found this spec's original wording claimed a retry affordance that
  was never actually built — implementing one is deferred, not a defect in what shipped.

## Testing

No automated test suite in this repo (per `CLAUDE.md`); `npm run build` is the only
automated check. Manual QA via `npm run netlify:dev` (real Supabase + meal-entries writes):

- Fresh user, no Kişisel Plan profile → Bugün shows the setup prompt, not zeros.
- After setting a profile with no meals logged, remaining equals the target exactly.
- Logging a meal in Yemek Planı updates Bugün's remaining numbers.
- "Listeye ekle" adds the right items and quantities to the active list.
- "Yedim de" creates the right `meal_entries` rows in the inferred slot and updates
  remaining immediately, in place.
- Excluding a food in Kişisel Plan removes any combo containing it from suggestions.
- Two users sharing one household, each with their own profile: confirm the documented
  limitation behaves as expected (each sees their own target against the shared log) rather
  than crashing or showing the wrong person's target.

## Deployment

- Apply `supabase/10-personal-plan-exclusions.sql` against the same Supabase project.
- No new environment variables.
- No new Netlify function.

## Migration / rollout

Fresh feature, no data migration beyond the additive column above. Ship all six parts
together in one PR — per the scope note, there's no useful intermediate state to release
separately.

## Open items post-approval

- No Linear issue filed yet for this work. Recommend creating one before merging, per the
  repo's LCMP convention, so the branch/PR can link back to it.
- The combo catalog launches hand-authored (~15–20 entries); the strategy review's V1 phase
  is where this becomes data-driven from real usage instead of curated by hand.
- The time-of-day → meal-slot mapping for "Yedim de" is a starting guess (morning →
  kahvaltı, etc.); tune once real usage shows how people actually use it.
