-- Meal plan persistence. Run after 06-sync-state.sql.
--
-- The `meal_entries` table originally appended to 01-schema.sql (2026-08-21)
-- was never shipped as its own migration and modeled free-text entries
-- (text/kcal/protein_g/...), a shape the meal planner never actually used —
-- it stores structured { foodId, quantityG } items and always derives
-- nutrition from the `nutrition` table at render time (see
-- src/lib/localMealPlan.ts). That table was confirmed never created live, so
-- this migration defines the correct structured shape directly rather than
-- migrating stale data. 01-schema.sql's block is being corrected to match,
-- for any future fresh install.
--
-- Idempotent: safe to re-run.

drop table if exists public.meal_entries;

create table public.meal_entries (
  id           text primary key,
  household_id text not null references public.households(id) on delete cascade,
  date         date not null,        -- local calendar day, e.g. 2026-08-27
  slot         text not null,        -- 'kahvalti' | 'ogle' | 'aksam' | 'ara'
  food_id      text not null,        -- nutrition.name_tr (no FK: nutrition rows can be renamed/removed independently)
  quantity_g   numeric not null,
  position     integer not null default 0,  -- orders multiple items within a slot
  created_at   timestamptz not null default now()
);

create index if not exists meal_entries_household_date_idx
  on public.meal_entries (household_id, date);
