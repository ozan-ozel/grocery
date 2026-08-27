-- Re-key personal_plan from household_id to user_id. Run after 08-personal-plan.sql.
--
-- A personal profile (weight/height/age/goal) is inherently per-person, not
-- per-household — two different people sharing the same household (see
-- household_shares, 05-household-ownership.sql) would otherwise share one
-- profile. Since 08-personal-plan.sql was just run and the table is brand
-- new (no real data yet to migrate), this drops and recreates it keyed on
-- the logged-in user instead.
--
-- Idempotent: safe to re-run.

drop table if exists public.personal_plan;

create table public.personal_plan (
  user_id      text primary key references public.app_users(id) on delete cascade,
  name         text not null,
  equation_sex text not null,        -- 'female' | 'male'
  age_years    integer not null,
  height_cm    numeric not null,
  weight_kg    numeric not null,
  activity     text not null,        -- 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high'
  goal         text not null,        -- 'maintain' | 'loss' | 'gain'
  waist_cm     numeric,
  updated_at   timestamptz not null default now()
);
