-- supabase/15-personal-plan-allergen-exclusions.sql
-- Adds allergen-class exclusions alongside the existing food-level
-- food_exclusions (13-personal-plan-food-exclusions.sql) — B3's hybrid
-- exclusion unit, food-level and allergen-class-level. A separate column
-- rather than reshaping food_exclusions: a food-level entry and a
-- class-level entry are not interchangeable (B3's own binding rule), and
-- this keeps the already-tested FoodExclusion type untouched. Each element:
--   { "allergenClass": one of the Türkiye/EU 14 canonical IDs
--       (gluten_cereals|crustaceans|eggs|fish|peanuts|soybeans|milk|
--        tree_nuts|celery|mustard|sesame|sulphites|lupin|molluscs),
--     "reason": "allergy"|"intolerance"|"unclear"|"preference"|"unclassified",
--     "createdAt": string }
--
-- No legacy column to backfill from — this is a brand new exclusion kind
-- with no undifferentiated predecessor, unlike food_exclusions.
--
-- Idempotent: safe to re-run.

alter table public.personal_plan
  add column if not exists allergen_class_exclusions jsonb not null default '[]';
