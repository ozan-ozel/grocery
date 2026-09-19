-- 27-account-deletion-feedback.sql
-- Paste into the Supabase SQL editor and run once.
--
-- Why people delete their account, collected by the 3-step "Hesabı Sil" flow
-- in Settings and written by api/auth-delete-account.ts *after* the deletion
-- succeeds. Deliberately anonymous: no user id, no email, no household — the
-- row has to outlive the account it came from, and a link back to the person
-- would defeat the point of deleting them. `other_text` is free text the
-- person typed, capped at 300 chars (the UI also tells them not to enter
-- personal details).
--
-- Never exposed via PostgREST to anon/authenticated roles: RLS is enabled with
-- no policies (default-deny), and only the service_role key — which bypasses
-- RLS — can insert or read. Same pattern as agent_login_tokens (25-...).
--
-- The `reason` codes mirror DELETE_REASONS in src/components/DeleteAccountFlow.tsx
-- and api/auth-delete-account.ts; add a value in all three places together.
create table if not exists public.account_deletion_feedback (
  id         uuid primary key default gen_random_uuid(),
  reason     text not null check (
    reason in (
      'not_using',
      'missing_features',
      'hard_to_use',
      'switched_app',
      'privacy',
      'bugs',
      'other',
      'prefer_not_to_say'
    )
  ),
  other_text text check (other_text is null or char_length(other_text) <= 300),
  created_at timestamptz not null default now()
);

alter table public.account_deletion_feedback enable row level security;

revoke all on public.account_deletion_feedback from anon, authenticated;
