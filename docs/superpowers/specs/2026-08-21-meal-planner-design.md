# Daily meal planner (v1: free-text entries) — design

**Status:** approved, not yet implemented
**Author:** Ozan (with Claude)
**Date:** 2026-08-21
**Linear:** [NUT-11](https://linear.app/nutrition-grocery-planner/issue/NUT-11/daily-meal-planner-v1-free-text-entries) (sub-issue of [NUT-7](https://linear.app/nutrition-grocery-planner/issue/NUT-7/nut-1-project-roadmap), roadmap item #7)

## Problem

There's no way to plan or record what a household actually eats, day to
day. The shopping list tracks what to buy; the nutrition tab shows
per-item values for whatever's currently on the list. Neither answers
"what are we eating Wednesday" or "how much protein did we get today."

## Scope note — reconciling with NUT-7 #7

NUT-7's roadmap item #7 describes a recipe layer: dishes expand into an
ingredient list drawn from the `nutrition` table, and planned meals
auto-generate the shopping list. This spec deliberately **does not**
build that. v1 is free-text dish names with manually-entered whole-meal
nutrition values — no ingredient breakdown, no link to the `nutrition`
table, no shopping-list generation. Chosen for speed over the full
recipe model; that model remains open on NUT-7 as a later, separate
piece of work, not solved here.

## Non-goals

- Ingredient-level recipes or shopping-list generation (see above).
- Per-100g nutrition math — values entered are whole-dish totals, as
  actually eaten, not looked up or computed.
- Week-at-a-glance view. v1 is single-day with prev/next navigation.
- Offline editing / conflict resolution. Plain CRUD against Supabase;
  no offline queue (see Architecture).
- Meal suggestions, recipe reuse, or templates.
- Linking a meal entry back to shopping-list items.

## Users and success criteria

- Opening the new "Yemek Planı" section shows today's plan: three fixed
  slots (Kahvaltı / Öğle / Akşam) plus an open "Ara öğün" list.
- Typing a dish name into a slot and navigating away saves it — no
  explicit save button required for the name itself.
- Optionally entering kcal/protein/fat/carbs/fiber for an entry shows
  those values next to the entry, and a totals row at the bottom of the
  day sums them across every entry.
- Prev/next-day arrows move the whole view to a different date; past
  days show whatever was actually entered (the log), future days are
  editable the same way (the plan) — one continuous UI, no separate
  "planning mode."

## Architecture

Three pieces:

1. **Supabase table** (`public.meal_entries`) — one row per dish entry,
   scoped to a household and a calendar date.
2. **Netlify function** (`netlify/functions/meal-entries.ts`) — thin
   REST proxy, same pattern as `households.ts`/`items.ts`: anon key for
   reads, service_role key for writes.
3. **Client module + hook + view** (`src/lib/mealPlan.ts`,
   `src/hooks/useMealPlan.ts`, `src/components/MealPlanView.tsx`) —
   fetches a window of days, renders the day view, handles optimistic
   edits.

### Why plain CRUD, not the list-sync engine

`src/lib/sync/sync.ts` exists for exactly one shared mutable object per
tenant (the active shopping list) — debounced push, periodic pull,
version-based merge, because multiple devices may edit that one object
concurrently. Meal entries are independent rows keyed by
`(household_id, date, slot)`; there's no shared object to merge. Each
edit is a normal create/update/delete call. This is simpler and matches
how nutrition-value editing already works elsewhere in the app
(`NutritionEditorRow` — immediate `saveNutrition` call, then local state
update).

### Data flow

```
MealPlanView (viewing date D)
        │
        ▼
useMealPlan(D) ── fetches [D-3, D+3] window on date change ──► GET /api/meal-entries
        │                                                            │
        │  optimistic local update on edit                           ▼
        ▼                                                    public.meal_entries
lib/mealPlan.ts create/update/delete ── fire immediately ──► POST/PATCH/DELETE
```

## Data model

### Supabase table

```sql
create table if not exists public.meal_entries (
  id           text primary key,
  household_id text not null references public.households(id) on delete cascade,
  date         date not null,        -- local calendar day, e.g. 2026-08-21
  slot         text not null,        -- 'kahvalti' | 'ogle' | 'aksam' | 'ara'
  text         text not null,
  kcal         numeric,
  protein_g    numeric,
  fat_g        numeric,
  carbs_g      numeric,
  fiber_g      numeric,
  position     integer not null default 0,  -- orders multiple 'ara' entries
  created_at   timestamptz not null default now()
);

create index if not exists meal_entries_household_date_idx
  on public.meal_entries (household_id, date);
```

Kahvaltı/öğle/akşam are constrained to at most one entry per day by the
UI, not a DB constraint — consistent with how other per-day invariants
(e.g. one open list per household) are enforced where they matter, and
not enforced where the cost of a DB constraint isn't worth it. Ara öğün
allows multiple rows, ordered by `position`. All five nutrition columns
are nullable — entering them is optional.

### Client types (`src/lib/mealPlan.ts`)

```ts
export type MealSlot = "kahvalti" | "ogle" | "aksam" | "ara";

export type MealEntry = {
  id: string;
  date: string;          // YYYY-MM-DD
  slot: MealSlot;
  text: string;
  kcal?: number;
  proteinG?: number;
  fatG?: number;
  carbsG?: number;
  fiberG?: number;
  position: number;
};
```

## Components

### `netlify/functions/meal-entries.ts`

- `GET /api/meal-entries?householdId=...&from=YYYY-MM-DD&to=YYYY-MM-DD`
  → `MealEntry[]` in range (anon key; RLS restricts to reads).
- `POST /api/meal-entries` → create one entry. Client generates `id`
  via the existing `uid()` helper and sends it in the body, same as
  shopping-list items — the server inserts as-is. (service_role key)
- `PATCH /api/meal-entries?id=...` → update `text` and/or the five
  nutrition fields and/or `position`. (service_role key)
- `DELETE /api/meal-entries?id=...` → remove. (service_role key)

Same trade-off note as the existing functions: no auth, anyone with the
app URL can write. Acceptable for a personal household app; flagged
here for consistency with `nutrition.ts`'s existing comment on the same
trade-off.

### `src/lib/mealPlan.ts`

Thin wrappers: `fetchMealEntries(householdId, from, to)`,
`createMealEntry(entry)`, `updateMealEntry(id, patch)`,
`deleteMealEntry(id)`. Mirrors `households.ts`'s client-side shape.

### `src/hooks/useMealPlan.ts`

- Owns `date: string` (YYYY-MM-DD), persisted to the URL via a new
  query param (same pattern as `section`/`tab` in `useUiPrefs`).
- On `date` (or `activeTenantId`) change, fetches entries for
  `[date - 3, date + 3]` so arrow navigation doesn't hit the network on
  every click; keeps a `Map<string /* date|slot */, MealEntry[]>` in
  local state.
- Exposes `entriesFor(date, slot)`, `saveEntryText(slot, text)` (creates
  if absent, updates if present, deletes if text is emptied — mirrors
  the shopping-list title's empty-clears-to-default pattern but here
  empty just removes the entry), `saveEntryNutrition(id, values)`,
  `addAraEntry(text)`, `removeEntry(id)`, `goToDate(date)`.
- All mutators are optimistic: update local state first, fire the API
  call, and on failure leave the local (unsaved) value in place and
  mark that one entry with an error flag rather than reverting it —
  losing typed input on a network blip is worse than showing a retry
  affordance. No auto-retry/backoff.

### `src/components/MealPlanView.tsx`

- Date header: formatted with the same TR-locale approach as
  `defaultTitle` in `store.ts`, prev/next-day buttons.
- Three fixed-slot rows (Kahvaltı/Öğle/Akşam): a text input for the
  dish name (save on blur, same UX as the shopping list's title input)
  plus, once a name exists, a small row of five optional number inputs
  (kcal/P/Y/K/L) — same visual language as `NutritionEditorRow`'s
  `NumInput` fields, but not the same component (this form is simpler:
  no async save-in-place editor state machine, just optimistic local
  update via the hook).
- "Ara öğün" section: a list of existing entries (name + its own
  kcal/P/Y/K/L, a remove button — same visual pattern as
  `ActiveListRow`'s row actions) plus an add-input at the bottom.
- Totals row: sums kcal/protein/fat/carbs/fiber across every entry
  (all four slots) for the viewed day, rendered the same way as
  `NutritionView`'s existing "Toplam" footer row.

### `src/App.tsx` / `AppHeader.tsx` wiring

- Extend `Section` (currently `"alisveris" | "besin"` in
  `useUiPrefs.ts`) to include `"yemek"`.
- Add a third toggle button in `AppHeader` ("Yemek Planı") alongside
  Alışveriş / Besin değerleri.
- Render `<MealPlanView />` when `section === "yemek"`, same branch
  structure as the existing `besin` → `NutritionView` case in `App.tsx`.

## Error handling

- **Network failure on save:** local edit stays visible; the entry
  shows an inline "kaydedilemedi · tekrar dene" retry button that
  resends the same payload. No background retry loop — this is a
  foreground single-row edit, not the list-sync engine's unattended
  case.
- **Fetch failure (loading a date window):** the day view shows a
  lightweight error state ("Besin verilerine ulaşılamadı" — reuse the
  existing nutrition-view error copy pattern) with a manual retry.
- **Malformed row from Supabase:** dropped from the result with a
  console warning, same posture as `nutrition.ts`'s existing handling.

## Testing

No automated test suite in this repo (per `CLAUDE.md`). Manual/visual
QA, same approach used for the recent App.tsx/ActiveList/NutritionView
split (Playwright driver script against `netlify dev`, screenshots,
console-error check):

- Add/edit/remove entries in each of the four slots.
- Enter partial nutrition values (e.g. only kcal) and confirm the
  totals row sums only what's present, doesn't error on missing fields.
- Navigate prev/next across a date where entries exist vs. don't.
- Switch to "Yemek Planı" and back, confirm no state leaks into
  Alışveriş/Besin değerleri.
- Empty a fixed-slot entry's text and confirm it's removed, not left as
  a blank row.
- Kill the network mid-edit (or point at a bad API base) and confirm
  the retry affordance appears and works once network returns.

## Deployment

- Run the `meal_entries` table SQL above against the same Supabase
  project (append to `supabase/01-schema.sql`, matching how existing
  tables are defined there).
- No new env vars — reuses `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` already configured
  for the other Netlify functions.
- No RLS policy beyond what the other household-scoped tables already
  have (reads via anon key on a table with FK-scoped rows; writes via
  service_role only, matching `households`/`items`).

## Migration / rollout

Fresh feature, no migration.
1. Apply the `meal_entries` table SQL.
2. Ship `meal-entries.ts`, `lib/mealPlan.ts`, `useMealPlan.ts`,
   `MealPlanView.tsx`, and the `App.tsx`/`AppHeader.tsx` wiring together
   (no useful intermediate state to ship separately).
3. Deploy. The new section appears on the next release.

## Open items post-approval

- Whether "Ara öğün" entries need their own drag-reorder UI, or adding
  in order (position = insertion order) is good enough for v1. Starting
  with insertion order; reorder UI only if it turns out to matter in
  practice.
- Whether the prefetch window (±3 days) is the right size — arbitrary
  starting guess, easy to tune once real usage shows how far people
  actually jump.
