-- supabase/24-nutrition-rls.sql
--
-- Documents live configuration drift on public.nutrition: it was never
-- created by any file in this repo (set up directly in the Supabase
-- dashboard) and 19-auth-user-map-and-rls.sql's RLS pass never covered it
-- either. Live inspection (`select * from pg_policies where tablename =
-- 'nutrition'`) confirms row level security is already enabled with exactly
-- one policy:
--
--   schemaname | tablename | policyname | permissive | roles                | cmd    | qual | with_check
--   public     | nutrition | read all   | PERMISSIVE | {anon,authenticated} | SELECT | true | null
--
-- Unlike the meal_entries/personal_plan/preparation_batches drift fixed in
-- 11-fix-anon-read-rls-drift.sql and 18-preparation-batches-rls-drift.sql
-- (RLS enabled with ZERO policies, silently denying every role but
-- service_role), this is already the correct end state and matches
-- docs/architecture.md's Nutrition section exactly: reads go through
-- SUPABASE_ANON_KEY (allowed by this policy), writes go through
-- SUPABASE_SERVICE_ROLE_KEY in api/nutrition.ts (bypasses RLS entirely,
-- since there's deliberately no insert/update/delete policy for anon or
-- authenticated). This migration just brings the repo's tracked schema back
-- in line with reality — it changes nothing live when run against a
-- database that already matches the snapshot above.
--
-- Idempotent: safe to re-run.

alter table public.nutrition enable row level security;

drop policy if exists "read all" on public.nutrition;
create policy "read all" on public.nutrition
  for select
  to anon, authenticated
  using (true);
