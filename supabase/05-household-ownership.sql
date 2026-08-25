-- Household ownership + invite-by-email sharing. Run after 04-hidden-households.sql.
-- Adds households.owner_id, the household_shares invite table, and backfills
-- owner_id for the three existing households so nobody gets locked out.
--
-- IMPORTANT: run this only after both Ege (egeozeldev@gmail.com) and Ozan
-- (ozandozel@gmail.com) have logged in at least once via Google, so their
-- app_users rows exist for the backfill subqueries below to find. Do not
-- deploy the enforcement code (households.ts / state.ts / etc. auth checks)
-- until this script has been run — owner_id IS NULL locks everyone out.
--
-- Idempotent: safe to re-run.

alter table public.households
  add column if not exists owner_id text references public.app_users(id) on delete set null;

create table if not exists public.household_shares (
  household_id text not null references public.households(id) on delete cascade,
  email        text not null,
  created_at   timestamptz not null default now(),
  primary key (household_id, email)
);

create index if not exists household_shares_email_idx on public.household_shares (email);

-- Backfill: Evim (default) + Ayrancı (yxq8fr4k) -> Ozan; Akbük (6e5xkctg) -> Ege.
-- The `exists` guard makes each statement a no-op if the target user hasn't
-- logged in yet, instead of silently setting owner_id to NULL.
update public.households
  set owner_id = (select id from public.app_users where email = 'ozandozel@gmail.com')
  where id in ('default', 'yxq8fr4k')
    and owner_id is null
    and exists (select 1 from public.app_users where email = 'ozandozel@gmail.com');

update public.households
  set owner_id = (select id from public.app_users where email = 'egeozeldev@gmail.com')
  where id = '6e5xkctg'
    and owner_id is null
    and exists (select 1 from public.app_users where email = 'egeozeldev@gmail.com');
