-- supabase/17-preparation-batches.sql
--
-- DEC-069 (batch cooking, leftovers, storage-aware planning) — Option 3, v1
-- scope ratification: nutrition-curriculum/00_PROJECT_CONTROL/DECISIONS/
-- 2026-09-09-dec-069-v1-scope-ratification.md. Architecture:
-- nutrition-curriculum/08_APP_TRANSLATION/DEC-069_IMPLEMENTATION_PLAN.md.
--
-- preparation_batches records an immutable snapshot of what was actually
-- prepared in one cooking occasion, so meal_entries rows on later dates can
-- reference it (batch_id) instead of re-entering quantities. `composition`
-- is written once at creation and never updated by any code path in this
-- repo — a live pointer back to a Combo is unsafe here, since
-- data/combos.json has no versioning and every existing read path resolves
-- combo data live (see DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md).
--
-- composition[].food_id uses the SAME value space as meal_entries.food_id /
-- Combo.items[].foodId (nutrition.name_tr) — NOT the opaque, unrelated
-- Nutrition.food_id UUID from 16-nutrition-food-id.sql. See the
-- implementation plan §6.1 for why these two different "food_id" concepts
-- must not be conflated.
--
-- source_combo_id is optional, informational provenance only — never read
-- back to reconstruct composition; only `composition` is authoritative.
--
-- No RLS: this app enforces authorization entirely at the Netlify function
-- layer (requireHouseholdAccess in _auth.ts), matching every other
-- household-scoped table except app_users (see
-- 11-fix-anon-read-rls-drift.sql for why RLS is deliberately off here).
--
-- Idempotent: safe to re-run.

create table if not exists public.preparation_batches (
  id              text primary key,
  household_id    text not null references public.households(id) on delete cascade,
  prepared_date   date not null,
  storage_note    text,
  source_combo_id text,
  composition     jsonb not null,
  created_at      timestamptz not null default now()
);

create index if not exists preparation_batches_household_date_idx
  on public.preparation_batches (household_id, prepared_date);

alter table public.meal_entries
  add column if not exists batch_id text;

-- Backs the leftover-derivation query (fetch every meal_entries row
-- allocated from a given batch, across any date). Partial: the vast
-- majority of existing/future rows have batch_id null and never need this
-- index.
create index if not exists meal_entries_batch_id_idx
  on public.meal_entries (batch_id)
  where batch_id is not null;
