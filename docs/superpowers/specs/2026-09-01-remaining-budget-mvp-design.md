# Remaining budget MVP ("Kalan Bütçe") — design

**Status:** implemented, reviewed, and QA'd (2026-09-02) — not yet merged to `master`
**Author:** Ege Özel (with Claude)
**Date:** 2026-09-01
**Context:** Follows the 2026-09-01 product strategy review (published as an artifact).
Tracked in Linear as [NUT-46](https://linear.app/nutrition-grocery-planner/issue/NUT-46).

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
- Each suggestion has three actions: "Listeye ekle" adds its ingredients to the active
  shopping list; "Hazırlanıyor" is a purely visual, non-persisted toggle marking a combo as
  mid-prep (no timer, resets on reload); "Yedim" logs its ingredients as meal entries in an
  inferred slot, and the remaining-budget numbers update immediately without navigating away.
  Renamed from "Yedim de" and given the "Hazırlanıyor" toggle post-launch, per user feedback —
  see the TodayView section below for the full rationale.
- A combo that's been logged as eaten does not just disappear from suggestions the instant
  the shrunk budget no longer fits it — it moves to a "Bugün yediklerin" section below, with a
  persistent "Geri al" that actually deletes the `meal_entries` rows it created (not a
  UI-only revert).
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
Suggestion cards, each with three actions:
        │
        ├─ "Listeye ekle"  ──► listActions.addItem() once per ingredient      (existing, reused)
        │
        ├─ "Hazırlanıyor"  ──► local component state only, no request (visual toggle)
        │
        └─ "Yedim"         ──► POST /api/meal-entries once per ingredient    (existing, reused)
                                       │
                                       ▼
                          useRemainingToday re-derives → numbers update in place,
                          combo moves to "Bugün yediklerin" (client-side only — see below)
                                       │
                                       ▼
                          "Geri al" ──► DELETE /api/meal-entries per logged entry
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
with "Listeye ekle" / "Hazırlanıyor" / "Yedim" actions. Three states: no profile (setup
prompt, linking to Kişisel Plan), ready with matches, ready with no matches (honest empty
state explaining the budget is too tight for any authored combo today — not a forced
irrelevant suggestion).

Post-launch revision, from user feedback on the shipped copy/flow: "Yedim de" read awkwardly
and tapping it made the combo vanish from the suggestion list the instant the shrunk
remaining budget no longer fit it — no confirmation, no way back. Now:

- The button reads "Yedim" (single word).
- A "Hazırlanıyor" toggle sits to its left — purely a visual "I'm cooking this now" flag
  (reuses the app's `.gradient-edge` accent as a thick card border), no backend write, no
  timer, resets on reload. A real cook-time tracker is a later idea, not this one.
- Logging a combo as eaten moves it — rather than deletes it — into a new "Bugün yediklerin"
  section below the suggestions, rendered with the same `.gradient-edge` treatment. Each
  entry there has a persistent "Geri al" that calls `DELETE /api/meal-entries` for every
  entry that combo created, via a new `undoConsumption` on `useRemainingToday` (and a new
  `LoggedEntry` return value from `logConsumption`/`addItem` so the ids are known). This is a
  real undo — the meal_entries rows are actually removed and the budget recalculates
  accordingly — not a client-side-only revert.
- Update, 2026-09-02: which `meal_entries` rows belong to which eaten combo turned out to
  need persisting after all — the client-state-only version above meant "Bugün yediklerin"
  reset on every reload while the real consumption numbers didn't, which read as a bug in
  practice. `supabase/12-meal-entries-combo-id.sql` adds a nullable `combo_id` column;
  `netlify/functions/meal-entries.ts`'s `POST` accepts and stores it (manual "Besin ekle"
  entries from Yemek Planı leave it `null`, unaffected). `TodayView` no longer keeps
  `eatenCombos` in `useState` — it derives the grouping every render from
  `useRemainingToday`'s new `todaysItems` (today's real meal_entries, slot + comboId
  attached), grouped by `combo_id` and summed via `calculateItemsNutrition` against each
  group's actual logged quantities (not the catalog combo's nominal ones, so a later
  quantity edit in Yemek Planı stays reflected). Eating the same combo twice in one day
  without undoing in between now merges into one "Bugün yediklerin" card showing the
  combined totals, rather than two separate cards — a deliberate simplification enabled by
  keying the grouping on `combo_id` alone.

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

### `src/lib/listActions.ts` (unchanged), `netlify/functions/meal-entries.ts` (modify, 2026-09-02)

`meal-entries.ts` now accepts an optional `combo_id` on `POST` and returns/selects it
everywhere — see the "Bugün yediklerin" update above.

Both reused as-is: `addItem` for the "Listeye ekle" action, the existing `POST
/api/meal-entries` for "Yedim" (called once per combo ingredient — combos are 2–4
ingredients, so no bulk endpoint is needed at this scale) and `DELETE /api/meal-entries` for
"Geri al" (also existing, already used elsewhere in Yemek Planı).

## Error handling

- No Kişisel Plan profile → setup prompt, not fabricated numbers.
- No combo fits the remaining budget → honest empty state, not an irrelevant suggestion.
- Remaining goes negative → shown as a negative/over-budget value, not clamped or hidden.
- "Yedim" partial failure (one ingredient's POST fails mid-sequence) → matches
  `useMealPlan`'s actual existing mutator behavior, not the meal-planner spec's original
  aspiration: the optimistic local update stays regardless of API outcome, and a failed
  `createMealEntry` call only `console.warn`s — there is no retry-UI affordance anywhere in
  `useMealPlan` today. The entries that succeeded stay either way; a failed one silently
  doesn't persist server-side rather than rolling back. Corrected here after the final
  whole-branch review found this spec's original wording claimed a retry affordance that
  was never actually built — implementing one is deferred, not a defect in what shipped.

## Testing

No automated test suite in this repo (per `CLAUDE.md`); `npm run build` is the only
automated check. Manual QA via `npm run netlify:dev` (real Supabase + meal-entries writes) —
**completed 2026-09-02**, all items below passed, via a dev-only test-login route
(`netlify/functions/auth-test-login.ts`, disabled in production) plus a Playwright MCP
browser, since the app has no other way to reach an authenticated session in an automated
session:

- Fresh user, no Kişisel Plan profile → Bugün shows the setup prompt, not zeros. ✅
- After setting a profile with no meals logged, remaining equals the target exactly. ✅
- Logging a meal in Yemek Planı updates Bugün's remaining numbers, and vice versa. ✅
- "Listeye ekle" adds the right items and quantities to the active list. ✅
- "Yedim" creates the right `meal_entries` rows in the inferred slot and updates remaining
  immediately, in place; "Geri al" deletes them again and the budget recovers. ✅
- Excluding a food in Kişisel Plan removes any combo containing it from suggestions. ✅
- Two users sharing one household, each with their own profile: each sees their own target
  against the shared log, no crash, no cross-contamination. ✅
- Browsing a stale date in Yemek Planı, then switching to Bugün → "Yedim"/logging still
  writes against today's date, not the stale one (the final review's fix, re-verified). ✅
- Cold/loading catalog state renders a distinct "Yükleniyor…" message, never a false "no
  combo fits" empty state (verified by code inspection of the status union in
  `useRemainingToday`, exercised live via a full page reload). ✅

**This QA pass also surfaced a critical, pre-existing bug unrelated to this feature's own
code:** the live Supabase project had row level security enabled on `meal_entries` and
`personal_plan` with zero policies — not set by any migration in this repo — which silently
returned empty reads to the anon key used by `netlify/functions/meal-entries.ts` and
`personal-plan.ts`. Writes (service_role, bypasses RLS) kept working, so the bug was
invisible within a single browser tab's optimistic UI state but meant no consumption or
profile data survived a reload, a tab switch, or a second device. Fixed by
`supabase/11-fix-anon-read-rls-drift.sql` (disables RLS on both tables, matching every other
table in this schema) and confirmed fixed by re-running this QA pass end to end after
applying it.

## Deployment

- Apply `supabase/10-personal-plan-exclusions.sql` against the same Supabase project.
- Apply `supabase/11-fix-anon-read-rls-drift.sql` — an equally real pre-deploy blocker,
  discovered during this pass's manual QA (see Testing above), not present when this spec
  was first written.
- No new environment variables in production. `TEST_LOGIN_SECRET` is local-dev-only, must
  never be set on the deployed site (see `netlify/functions/auth-test-login.ts`'s own
  comment and `docs/architecture.md`).
- No new Netlify function shipped to production; `auth-test-login.ts` is dev QA tooling and
  is inert (404s) whenever `CONTEXT === "production"`.

## Migration / rollout

Fresh feature, no data migration beyond the additive column above. Ship all six parts
together in one PR — per the scope note, there's no useful intermediate state to release
separately.

## Open items post-approval

- Filed as [NUT-46](https://linear.app/nutrition-grocery-planner/issue/NUT-46).
- The combo catalog launches hand-authored (~15–20 entries); the strategy review's V1 phase
  is where this becomes data-driven from real usage instead of curated by hand.
- The time-of-day → meal-slot mapping for "Yedim" is a starting guess (morning →
  kahvaltı, etc.); tune once real usage shows how people actually use it.
