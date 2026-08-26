-- Grocery app: sync_state table — replaces Netlify Blobs as the /api/state store.
-- Paste into Supabase SQL editor and run once.
-- Idempotent: safe to re-run.
--
-- Before deploying the state.ts change that reads from this table, run
-- scripts/migrate-blobs-to-supabase.ts to copy existing Blobs data over —
-- otherwise every household's active list falls back to hydrateFromSupabase()
-- (lists/items), which the app doesn't keep in sync today.

create table if not exists public.sync_state (
  household_id text primary key references public.households(id) on delete cascade,
  version       integer not null default 0,
  state         jsonb not null,
  updated_at    timestamptz not null default now()
);
