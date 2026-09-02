-- supabase/12-meal-entries-combo-id.sql
--
-- Lets "Bugün yediklerin" (TodayView.tsx) reconstruct which meal_entries rows
-- came from logging a combo as eaten, so that grouping survives a page
-- reload instead of only living in component state (a known limitation
-- documented in docs/superpowers/specs/2026-09-01-remaining-budget-mvp-design.md).
-- Entries created via Yemek Planı's manual "Besin ekle" flow leave this
-- null, same as today. Additive, no backfill needed.

alter table public.meal_entries
  add column if not exists combo_id text;
