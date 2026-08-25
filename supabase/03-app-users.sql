-- Grocery app: self-built Google OAuth identity table.
-- Paste into Supabase SQL editor and run once.
--
-- public.app_users is the identity table: id is the Google `sub` claim
-- (stable per-account string), not a DB-generated uuid — same convention as
-- households/lists/items in 01-schema.sql (app-generated text ids).

create table if not exists public.app_users (
  id         text primary key,        -- Google `sub`
  email      text not null,
  created_at timestamptz not null default now()
);

alter table public.app_users enable row level security;
