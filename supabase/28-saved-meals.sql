-- supabase/28-saved-meals.sql
--
-- "Yemeklerim": a user's own reusable meals (and recipes — a saved meal with
-- non-empty `steps` is a recipe; there is no separate recipe table). Run in the
-- Supabase SQL editor (postgres role), like migrations 19-27.
--
-- Per USER, not per household (matches personal_plan): a household can have
-- several members with different foods and exclusions, and exclusions are
-- personal. Deleting the app_users row cascades here, so account deletion
-- (api/auth-delete-account.ts) needs no change.
--
-- items[].food_id is nutrition.name_tr — the SAME value space as
-- meal_entries.food_id / Combo.items[].foodId — NOT the opaque
-- Nutrition.food_id UUID from 16-nutrition-food-id.sql.
--
-- RLS uses the private-schema helper from 22-security-definer-functions-to-
-- private-schema.sql (app_private.current_app_user_id()), like personal_plan.
--
-- Idempotent: safe to re-run.

create table if not exists public.saved_meals (
  id         text primary key,
  user_id    text not null references public.app_users(id) on delete cascade,
  name       text not null,
  items      jsonb not null,   -- [{ "food_id": "tavuk göğsü", "quantity_g": 180 }, ...]
  steps      jsonb,            -- ["Tavuğu haşla", ...] or null / [] for a plain meal
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_meals_user_created_idx
  on public.saved_meals (user_id, created_at desc);

alter table public.saved_meals enable row level security;

drop policy if exists saved_meals_all on public.saved_meals;
create policy saved_meals_all on public.saved_meals
  for all using (user_id = app_private.current_app_user_id())
  with check (user_id = app_private.current_app_user_id());
