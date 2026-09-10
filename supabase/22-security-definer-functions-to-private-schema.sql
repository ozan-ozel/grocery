-- supabase/22-security-definer-functions-to-private-schema.sql
--
-- Supersedes 21-security-definer-execute-grants.sql's approach. Revoking
-- EXECUTE from anon (21) cleared the anon linter warning, but Supabase's
-- linter then flagged the same functions for being callable by authenticated
-- via /rest/v1/rpc/<fn> -- and that grant can't be dropped, since RLS policy
-- evaluation runs as the querying role (authenticated), which needs EXECUTE
-- on these functions for every policy that calls them to work at all.
--
-- The actual fix: PostgREST only auto-exposes functions/tables living in a
-- schema listed under Project Settings -> API -> Exposed schemas (just
-- `public` by default). Moving these three security definer helpers into a
-- schema that is never in that list makes /rest/v1/rpc/current_app_user_id
-- (etc.) 404 for every role, anon and authenticated alike -- while RLS
-- policies, which call functions via plain schema-qualified SQL and are
-- untouched by the PostgREST exposed-schema setting, keep working exactly
-- as before.
--
-- Idempotent: safe to re-run.

create schema if not exists app_private;
grant usage on schema app_private to authenticated;

create or replace function app_private.current_app_user_id()
returns text
language sql stable security definer set search_path = public
as $$
  select app_user_id from public.auth_user_map where supabase_uid = auth.uid()
$$;

create or replace function app_private.has_household_access(hh_id text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.households h
    where h.id = hh_id and h.owner_id = app_private.current_app_user_id()
  ) or exists (
    select 1 from public.household_shares s
    where s.household_id = hh_id and lower(s.email) = lower(auth.email())
  )
$$;

create or replace function app_private.has_household_share(hh_id text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.household_shares s
    where s.household_id = hh_id and lower(s.email) = lower(auth.email())
  )
$$;

grant execute on function app_private.current_app_user_id() to authenticated;
grant execute on function app_private.has_household_access(text) to authenticated;
grant execute on function app_private.has_household_share(text) to authenticated;

-- Re-point every policy from 19-auth-user-map-and-rls.sql and
-- 20-households-select-returning-recursion-fix.sql at the app_private copies.

drop policy if exists households_select on public.households;
create policy households_select on public.households
  for select using (
    owner_id = app_private.current_app_user_id()
    or app_private.has_household_share(id)
  );

drop policy if exists households_update on public.households;
create policy households_update on public.households
  for update using (app_private.has_household_access(id))
  with check (app_private.has_household_access(id));

drop policy if exists households_insert on public.households;
create policy households_insert on public.households
  for insert with check (owner_id = app_private.current_app_user_id());

drop policy if exists households_delete on public.households;
create policy households_delete on public.households
  for delete using (owner_id = app_private.current_app_user_id());

drop policy if exists lists_select on public.lists;
create policy lists_select on public.lists
  for select using (app_private.has_household_access(household_id));

drop policy if exists items_select on public.items;
create policy items_select on public.items
  for select using (
    exists (
      select 1 from public.lists l
      where l.id = items.list_id and app_private.has_household_access(l.household_id)
    )
  );

drop policy if exists item_category_memory_all on public.item_category_memory;
create policy item_category_memory_all on public.item_category_memory
  for all using (app_private.has_household_access(household_id))
  with check (app_private.has_household_access(household_id));

drop policy if exists meal_entries_all on public.meal_entries;
create policy meal_entries_all on public.meal_entries
  for all using (app_private.has_household_access(household_id))
  with check (app_private.has_household_access(household_id));

drop policy if exists preparation_batches_all on public.preparation_batches;
create policy preparation_batches_all on public.preparation_batches
  for all using (app_private.has_household_access(household_id))
  with check (app_private.has_household_access(household_id));

drop policy if exists sync_state_all on public.sync_state;
create policy sync_state_all on public.sync_state
  for all using (app_private.has_household_access(household_id))
  with check (app_private.has_household_access(household_id));

drop policy if exists personal_plan_all on public.personal_plan;
create policy personal_plan_all on public.personal_plan
  for all using (user_id = app_private.current_app_user_id())
  with check (user_id = app_private.current_app_user_id());

drop policy if exists hidden_households_all on public.hidden_households;
create policy hidden_households_all on public.hidden_households
  for all using (user_id = app_private.current_app_user_id())
  with check (user_id = app_private.current_app_user_id());

drop policy if exists household_shares_owner_all on public.household_shares;
create policy household_shares_owner_all on public.household_shares
  for all using (
    exists (
      select 1 from public.households h
      where h.id = household_shares.household_id
        and h.owner_id = app_private.current_app_user_id()
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_shares.household_id
        and h.owner_id = app_private.current_app_user_id()
    )
  );

-- Now safe to drop -- no policy references the public.* versions any more.
drop function if exists public.current_app_user_id();
drop function if exists public.has_household_access(text);
drop function if exists public.has_household_share(text);
