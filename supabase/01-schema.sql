-- Grocery app: households / lists / items schema.
-- Paste into Supabase SQL editor and run once.
-- Idempotent: safe to re-run.

create table if not exists public.households (
  id           text primary key,
  name         text not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.lists (
  id                text primary key,
  household_id      text not null references public.households(id) on delete cascade,
  title             text not null,
  created_at        timestamptz not null,
  closed_at         timestamptz,
  group_by_category boolean not null default true
);

create index if not exists lists_household_created_at_idx
  on public.lists (household_id, created_at desc);

-- At most one open (active) list per household.
create unique index if not exists lists_one_open_per_household
  on public.lists (household_id)
  where closed_at is null;

create table if not exists public.items (
  id         text primary key,
  list_id    text not null references public.lists(id) on delete cascade,
  name       text not null,
  qty        text not null default '',
  checked    boolean not null default false,
  category   text,
  added_at   timestamptz not null,
  position   integer
);

create index if not exists items_list_added_at_idx
  on public.items (list_id, added_at);

create index if not exists items_list_checked_idx
  on public.items (list_id, checked);

create table if not exists public.item_category_memory (
  household_id text not null references public.households(id) on delete cascade,
  name_lower   text not null,
  category     text not null,
  updated_at   timestamptz not null default now(),
  primary key (household_id, name_lower)
);

-- Meal plan entries: a food + quantity per slot per day. Nutrition is always
-- derived from public.nutrition at render time, never stored here (see
-- src/lib/localMealPlan.ts) — food_id has no FK so a nutrition row can be
-- renamed/removed independently of past meal entries.
create table if not exists public.meal_entries (
  id           text primary key,
  household_id text not null references public.households(id) on delete cascade,
  date         date not null,        -- local calendar day, e.g. 2026-08-27
  slot         text not null,        -- 'kahvalti' | 'ogle' | 'aksam' | 'ara'
  food_id      text not null,        -- nutrition.name_tr
  quantity_g   numeric not null,
  position     integer not null default 0,  -- orders multiple items within a slot
  created_at   timestamptz not null default now()
);

create index if not exists meal_entries_household_date_idx
  on public.meal_entries (household_id, date);

-- Kişisel Plan (personal_plan) is NOT defined here: it references
-- public.app_users(id), which only exists after 03-app-users.sql runs —
-- defining it in this file would break a fresh install run in numbered
-- order. See 08-personal-plan.sql, which runs after 03.
