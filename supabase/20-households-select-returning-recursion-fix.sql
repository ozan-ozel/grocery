-- supabase/20-households-select-returning-recursion-fix.sql
--
-- Fixes a live bug in 19-auth-user-map-and-rls.sql's `households_select`
-- policy: household creation (POST /api/households) was failing with
-- "new row violates row-level security policy for table households"
-- (42501) on every attempt, even though households_insert's own WITH CHECK
-- (owner_id = current_app_user_id()) was proven correct via live debugging
-- (byte-identical owner_id/current_app_user_id() values, confirmed via a
-- raw INSERT in the SQL editor).
--
-- Root cause: api/households.ts sends `Prefer: return=representation` on
-- every write, so PostgREST always does `INSERT ... RETURNING *`. Returning
-- the new row requires it to also pass the table's SELECT policy
-- (households_select, via has_household_access(id)). has_household_access()
-- runs its own fresh sub-query against households
-- (`select 1 from households h where h.id = hh_id and h.owner_id = ...`) --
-- and that sub-query's snapshot can't see the row this same INSERT command
-- is in the middle of creating. So has_household_access(id) returns false
-- for the brand-new row, and Postgres reports it with the exact same
-- "new row violates row-level security policy" message as a WITH CHECK
-- failure -- even though the INSERT's own check already passed. Confirmed
-- live: the identical INSERT succeeds when RETURNING is omitted.
--
-- Fix: households_select no longer re-queries households for the owner
-- case -- it compares the row's own owner_id column directly, so there's
-- no self-referential sub-query for RETURNING to trip over. The
-- household_shares half still needs RLS bypassed (household_shares' own
-- policy queries households, so calling it inline here -- outside a
-- security definer function -- would recurse: households_select ->
-- household_shares (RLS) -> households (RLS) -> households_select ...,
-- which was hit and confirmed live as error 42P17 "infinite recursion
-- detected in policy for relation households" during this fix's first
-- draft). has_household_share() isolates that lookup in its own security
-- definer function, same pattern as has_household_access(), so it bypasses
-- RLS on household_shares instead of recursing.
--
-- has_household_access() itself is untouched and still correct for every
-- other table that uses it (lists, items, item_category_memory,
-- meal_entries, preparation_batches, sync_state, household_shares) -- none
-- of those has this self-insert-then-return-itself scenario, since they're
-- never the table being inserted into when households rows are created.
--
-- Idempotent: safe to re-run.

create or replace function public.has_household_share(hh_id text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.household_shares s
    where s.household_id = hh_id and lower(s.email) = lower(auth.email())
  )
$$;

drop policy if exists households_select on public.households;
create policy households_select on public.households
  for select using (
    owner_id = public.current_app_user_id()
    or public.has_household_share(id)
  );
