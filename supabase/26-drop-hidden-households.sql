-- supabase/26-drop-hidden-households.sql
--
-- Removes the per-household "hide from my tenant switcher" feature. The
-- frontend never actually filtered the switcher list with it (visibleTenants
-- was computed in useTenants.ts but never consumed anywhere) — its only
-- real effect was dimming a row's text and force-switching away if you hid
-- your active household, which read as an unexplained, purpose-unclear eye
-- icon. Removed instead of fixed (see docs/session-checkpoints/ for the
-- session that made this call): api/hidden-households.ts and
-- src/lib/hiddenHouseholds.ts are already deleted from the app; this drops
-- the now-orphaned table, its indexes, and its RLS policy behind it.
--
-- Run this in the Supabase SQL editor. Idempotent: safe to re-run.

drop table if exists public.hidden_households;
