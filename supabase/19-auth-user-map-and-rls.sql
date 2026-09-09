-- supabase/19-auth-user-map-and-rls.sql
--
-- Real Supabase Auth migration (Vercel/api/*.ts only) — see
-- docs/superpowers/specs/2026-09-09-supabase-auth-migration-design.md.
--
-- Links Supabase Auth's uuid-per-user identity to this app's existing
-- Google-sub-as-text identity (public.app_users) without touching any
-- existing owner_id/user_id value, then enables real RLS keyed off
-- auth.uid() on every household/user-scoped table, as a second layer behind
-- the existing Netlify/Vercel-function-layer checks (requireHouseholdAccess
-- in lib/auth.ts) — not a replacement for them.
--
-- IMPORTANT: run this via the Supabase SQL editor (or any connection using
-- the `postgres` role) — NOT as an authenticated/anon PostgREST call. The
-- two helper functions below are `security definer`, owned by whichever
-- role runs this script; if that role is itself subject to RLS, every
-- policy that depends on these functions will silently deny every user.
-- This is the single most important thing to verify live after running
-- this migration (see Task 18).
--
-- Idempotent: safe to re-run.

create table if not exists public.auth_user_map (
  supabase_uid uuid primary key references auth.users(id) on delete cascade,
  app_user_id  text not null unique references public.app_users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

alter table public.auth_user_map enable row level security;
-- No policy: locked to service_role only, same as public.app_users already is.

create or replace function public.current_app_user_id()
returns text
language sql stable security definer set search_path = public
as $$
  select app_user_id from public.auth_user_map where supabase_uid = auth.uid()
$$;

create or replace function public.has_household_access(hh_id text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.households h
    where h.id = hh_id and h.owner_id = public.current_app_user_id()
  ) or exists (
    select 1 from public.household_shares s
    -- lower() on both sides: household-shares.ts always lowercases before
    -- writing (see handleInvite), but auth.email() reflects whatever case
    -- Google/Supabase returned — must normalize the same way the app layer
    -- does (_auth.ts's user.email.toLowerCase()), or this OR-branch can
    -- silently deny a legitimately shared user on a mixed-case address.
    where s.household_id = hh_id and lower(s.email) = lower(auth.email())
  )
$$;

-- households: members can read/rename, only the owner can delete; creating
-- one sets owner_id to yourself.
alter table public.households enable row level security;

drop policy if exists households_select on public.households;
create policy households_select on public.households
  for select using (public.has_household_access(id));

drop policy if exists households_update on public.households;
create policy households_update on public.households
  for update using (public.has_household_access(id))
  with check (public.has_household_access(id));

drop policy if exists households_insert on public.households;
create policy households_insert on public.households
  for insert with check (owner_id = public.current_app_user_id());

drop policy if exists households_delete on public.households;
create policy households_delete on public.households
  for delete using (owner_id = public.current_app_user_id());

-- lists, items: SELECT only — dead-write scaffolding today (see
-- docs/architecture.md's Sync section); nothing writes them live.
alter table public.lists enable row level security;

drop policy if exists lists_select on public.lists;
create policy lists_select on public.lists
  for select using (public.has_household_access(household_id));

alter table public.items enable row level security;

drop policy if exists items_select on public.items;
create policy items_select on public.items
  for select using (
    exists (
      select 1 from public.lists l
      where l.id = items.list_id and public.has_household_access(l.household_id)
    )
  );

-- item_category_memory, meal_entries, preparation_batches, sync_state: full
-- CRUD, actively read/written household-scoped tables.
alter table public.item_category_memory enable row level security;

drop policy if exists item_category_memory_all on public.item_category_memory;
create policy item_category_memory_all on public.item_category_memory
  for all using (public.has_household_access(household_id))
  with check (public.has_household_access(household_id));

alter table public.meal_entries enable row level security;

drop policy if exists meal_entries_all on public.meal_entries;
create policy meal_entries_all on public.meal_entries
  for all using (public.has_household_access(household_id))
  with check (public.has_household_access(household_id));

alter table public.preparation_batches enable row level security;

drop policy if exists preparation_batches_all on public.preparation_batches;
create policy preparation_batches_all on public.preparation_batches
  for all using (public.has_household_access(household_id))
  with check (public.has_household_access(household_id));

alter table public.sync_state enable row level security;

drop policy if exists sync_state_all on public.sync_state;
create policy sync_state_all on public.sync_state
  for all using (public.has_household_access(household_id))
  with check (public.has_household_access(household_id));

-- personal_plan, hidden_households: per-person, keyed by the owning user.
alter table public.personal_plan enable row level security;

drop policy if exists personal_plan_all on public.personal_plan;
create policy personal_plan_all on public.personal_plan
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

alter table public.hidden_households enable row level security;

drop policy if exists hidden_households_all on public.hidden_households;
create policy hidden_households_all on public.hidden_households
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

-- household_shares: owner-only for every operation (matches
-- requireHouseholdAccess(..., { ownerOnly: true }) used on every call in
-- household-shares.ts).
alter table public.household_shares enable row level security;

drop policy if exists household_shares_owner_all on public.household_shares;
create policy household_shares_owner_all on public.household_shares
  for all using (
    exists (
      select 1 from public.households h
      where h.id = household_shares.household_id
        and h.owner_id = public.current_app_user_id()
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_shares.household_id
        and h.owner_id = public.current_app_user_id()
    )
  );
