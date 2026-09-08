-- supabase/16-nutrition-food-id.sql
-- Canonical Food Identity — Phase 9 implementation of the six approved
-- decisions in nutrition-curriculum/08_APP_TRANSLATION/
-- CANONICAL_FOOD_IDENTITY_INVESTIGATION.md §17.
--
-- Adds an opaque, stable `food_id` to the existing nutrition-backed model
-- (decision 1: no separate Food table). Never derived from name_tr, an
-- alias, an FDC id, or any nutrition value (requirement §5) — a random
-- UUID, assigned once and never touched by a rename or by the nutrition
-- API's `resolution=merge-duplicates` upsert (which only overwrites columns
-- present in its payload; the application never sends food_id — see
-- netlify/functions/nutrition.ts's WriteRow, which has no food_id field).
--
-- The default lets every future INSERT (a genuinely new food) get an id for
-- free, with zero application code needed for generation; existing rows are
-- backfilled once by the UPDATE below.
--
-- Idempotent: safe to re-run. `pgcrypto` (gen_random_uuid) is enabled by
-- default on Supabase projects.

alter table public.nutrition
  add column if not exists food_id uuid;

update public.nutrition
set food_id = gen_random_uuid()
where food_id is null;

alter table public.nutrition
  alter column food_id set not null,
  alter column food_id set default gen_random_uuid();

create unique index if not exists nutrition_food_id_key
  on public.nutrition (food_id);
