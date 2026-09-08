-- supabase/13-personal-plan-food-exclusions.sql
-- Replaces the undifferentiated `excluded_food_ids text[]` with a
-- reason-tagged exclusion list (see src/lib/foodExclusions.ts) — Phase 9 §20
-- Milestone 1, post-A1/B3/C2 ratification. Each element:
--   { "foodId": string, "reason": "allergy"|"intolerance"|"unclear"|"preference"|"unclassified", "createdAt": string }
--
-- `excluded_food_ids` is left in place (not dropped) as a read-only
-- historical column — cheap rollback insurance. It is no longer written by
-- the application after this migration ships; `food_exclusions` is the sole
-- source of truth going forward.
--
-- Idempotent: safe to re-run.

alter table public.personal_plan
  add column if not exists food_exclusions jsonb not null default '[]';

-- Backfill: every legacy id becomes reason "unclassified" (hard-tier, same
-- behavior as today) — never "preference". An allergy must not be silently
-- downgraded by a migration (Phase 9 §20.11 invariant 10). The `where`
-- guard makes this safe to re-run: a row already backfilled (non-empty
-- food_exclusions) is never touched again.
update public.personal_plan
set food_exclusions = (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'foodId', id,
        'reason', 'unclassified',
        'createdAt', now()::text
      )
    ),
    '[]'::jsonb
  )
  from unnest(excluded_food_ids) as id
)
where food_exclusions = '[]'::jsonb
  and excluded_food_ids is not null
  and array_length(excluded_food_ids, 1) > 0;
