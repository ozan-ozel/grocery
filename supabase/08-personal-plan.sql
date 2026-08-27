-- Personal Plan (Kişisel Plan) persistence. Run after 07-meal-entries.sql.
-- (If you already ran an earlier household_id-keyed version of this file,
-- also run 09-personal-plan-user-scoped.sql — it re-keys this table to
-- user_id instead.)
--
-- One profile per logged-in user (matches the current one-profile UI — see
-- src/hooks/useMealPersonalization.ts) — a personal profile (weight/height/
-- age/goal) is inherently per-person, not per-household, since a household
-- can have multiple invited members (household_shares).
--
-- Idempotent: safe to re-run.

create table if not exists public.personal_plan (
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
