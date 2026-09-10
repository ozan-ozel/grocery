-- supabase/23-hidden-households-fk-index.sql
--
-- hidden_households_household_id_fkey (household_id -> households.id) had no
-- covering index: the table's only index is the (user_id, household_id)
-- primary key, which is only useful for lookups that start with user_id.
-- Every unhide-on-delete cascade and any query filtering by household_id
-- alone has to scan the table. Supabase's linter flags this as "Unindexed
-- foreign keys".
--
-- Idempotent: safe to re-run.

create index if not exists hidden_households_household_id_idx
  on public.hidden_households (household_id);
