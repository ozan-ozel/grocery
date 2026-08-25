-- Per-user hidden households. Run after 03-app-users.sql.
-- Hiding is a UI-only preference: the household row and its data still exist,
-- and the user can unhide from the tenant switcher at any time.
-- Idempotent: safe to re-run.

create table if not exists public.hidden_households (
  user_id      text not null references public.app_users(id) on delete cascade,
  household_id text not null references public.households(id) on delete cascade,
  hidden_at    timestamptz not null default now(),
  primary key (user_id, household_id)
);

create index if not exists hidden_households_user_idx
  on public.hidden_households (user_id);
