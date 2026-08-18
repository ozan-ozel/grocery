-- Grocery app: households / lists / items schema.
-- Paste into Supabase SQL editor and run once.
-- Idempotent: safe to re-run.

create table if not exists public.households (
  id           text primary key,
  name         text not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.lists (
  id                text primary key,
  household_id      text not null references public.households(id) on delete cascade,
  title             text not null,
  created_at        timestamptz not null,
  closed_at         timestamptz,
  group_by_category boolean not null default true
);

create index if not exists lists_household_created_at_idx
  on public.lists (household_id, created_at desc);

-- At most one open (active) list per household.
create unique index if not exists lists_one_open_per_household
  on public.lists (household_id)
  where closed_at is null;

create table if not exists public.items (
  id         text primary key,
  list_id    text not null references public.lists(id) on delete cascade,
  name       text not null,
  qty        text not null default '',
  checked    boolean not null default false,
  category   text,
  added_at   timestamptz not null,
  position   integer
);

create index if not exists items_list_added_at_idx
  on public.items (list_id, added_at);

create index if not exists items_list_checked_idx
  on public.items (list_id, checked);

create table if not exists public.item_category_memory (
  household_id text not null references public.households(id) on delete cascade,
  name_lower   text not null,
  category     text not null,
  updated_at   timestamptz not null default now(),
  primary key (household_id, name_lower)
);
