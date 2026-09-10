-- supabase/21-security-definer-execute-grants.sql
--
-- Supabase's linter flags security definer functions as publicly callable
-- because Postgres grants EXECUTE to PUBLIC by default on function create,
-- and PostgREST auto-exposes every function in the `public` schema as an
-- RPC endpoint (/rest/v1/rpc/<fn>) reachable by the `anon` role.
--
-- public.current_app_user_id(), public.has_household_access(text), and
-- public.has_household_share(text) (supabase/19-auth-user-map-and-rls.sql,
-- supabase/20-households-select-returning-recursion-fix.sql) are only meant
-- to be called from inside RLS policies, evaluated as the querying role
-- (authenticated). They don't leak data to anon today — auth.uid() is null
-- for anon, so they just return null/false — but there's no reason anon
-- should be able to call them directly, so revoke that and keep only what
-- policy evaluation needs (authenticated).
--
-- Idempotent: safe to re-run.

revoke execute on function public.current_app_user_id() from public;
revoke execute on function public.current_app_user_id() from anon;
grant execute on function public.current_app_user_id() to authenticated;

revoke execute on function public.has_household_access(text) from public;
revoke execute on function public.has_household_access(text) from anon;
grant execute on function public.has_household_access(text) to authenticated;

revoke execute on function public.has_household_share(text) from public;
revoke execute on function public.has_household_share(text) from anon;
grant execute on function public.has_household_share(text) to authenticated;
