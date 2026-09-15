-- 25-agent-login-tokens.sql
-- Short-lived, single-use login tokens for agent/QA sign-in (bypasses Google
-- OAuth). Never exposed via PostgREST to anon/authenticated roles — every
-- read/write goes through api/agent-login.ts using SUPABASE_SECRET_KEY, the
-- same pattern as api/_auth-test-login.ts's use of the Admin API. RLS is
-- enabled with no policies at all, which is PostgREST's default-deny: any
-- request using the anon/authenticated key is rejected outright; only the
-- service_role key (which bypasses RLS entirely) can touch this table.
create table if not exists public.agent_login_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.agent_login_tokens enable row level security;

create index if not exists agent_login_tokens_expires_at_idx
  on public.agent_login_tokens (expires_at);
