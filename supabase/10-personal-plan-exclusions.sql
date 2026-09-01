-- supabase/10-personal-plan-exclusions.sql
-- Additive: lets a user mark foods that should never appear in a suggested
-- combo (allergies, dislikes). Defaults to empty so existing rows are valid
-- with no backfill needed. Idempotent: safe to re-run.

alter table public.personal_plan
  add column if not exists excluded_food_ids text[] not null default '{}';
