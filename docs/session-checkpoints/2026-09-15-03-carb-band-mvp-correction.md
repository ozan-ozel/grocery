# 2026-09-15: Carbohydrate-Band MVP Correction (DEC-034)

**Date:** 2026-09-15
**Branch:** `fix/carb-band-mvp-correction`
**Status:** done, not yet merged/pushed

## Current Objective

Following `COL` on `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` (Active and Closed tables both
empty, zero `READY` decisions left after backfilling the four MVP-1 `PROVISIONAL` closures), the
user redirected to pick up one of the `docs/*-mvp.md` roadmap_v2 scope docs instead of stopping.
`docs/macros-mvp.md`'s "Fix first" section flagged a safety-relevant misstatement already shipped
in `src/lib/mealPersonalization.ts`.

## Current State

Implemented all three corrections `macros-mvp.md` bundled under "Fix first," all backed by
`DECISION_LOGIC_SPECIFICATION.md` §3.3 (Gate 6, 2026-09-07) — no new values invented:

1. **`very_high` carb band capped**: was `{min: 10, max: 12}` g/kg/day, presenting the 8-12
   pre-event carbohydrate-loading protocol as a routine daily target. Now `{min: 6, max: 10}`,
   matching `high`'s ceiling — there is no fourth routine band in the spec, only three
   volume-graduated ones topping out at 6-10.
2. **130 g/day DRI floor added**: previously unenforced; now `Math.max(...)`-clamped on both the
   training (`moderate`/`high`/`very_high`) and general-population (`sedentary`/`light`) paths.
3. **Sedentary/light switched to AMDR**: previously used the same sports-nutrition g/kg table as
   trained activity levels (3-5 g/kg), which the spec doesn't license for the general population.
   Now computed as 45-65% of total energy (`safeTarget`), divided by 4 kcal/g.

Verified with a throwaway script (`calculateTargets` across all five activity levels at a fixed
70kg/175cm/30yo profile, deleted after use): `high` and `very_high` both now return 420-700g;
`sedentary`/`light` return 260-375g/288-416g instead of the old g/kg-derived figures. `tsc -b` is
clean.

Also updated `nutrition-curriculum/DEC_REGISTER.md`'s `DEC-034` note to describe the correction
(readiness word unchanged — still `SHIPPED`, per the no-invented-ID/no-status-change rule the
original roadmap_v2 commit itself followed).

Separately, `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md`'s Closed table was backfilled this
session with DEC-009/033/046/071 (previously implemented but never recorded there) — see the `COL`
exchange earlier in this session for that reasoning. That edit is still uncommitted, on whatever
branch was checked out before this one (`chore/remove-active-work-vscode-tracker`), not on this
branch.

## Files Changed

- `src/lib/mealPersonalization.ts` — `CARB_G_PER_KG` narrowed to the three trained-activity keys
  and its `very_high` band corrected; added `CARB_DRI_FLOOR_G` and `CARB_AMDR_ENERGY_SHARE`
  constants; `calculateTargets()`'s carb-range calculation branches on activity level between the
  two bases.
- `nutrition-curriculum/DEC_REGISTER.md` — `DEC-034` row note expanded to describe the fix.

## Important Decisions

- Did not touch `sedentary`/`light`'s protein or fat calculations, or anything outside carbs —
  `macros-mvp.md` scoped the fix to the carbohydrate figure only.
- Did not implement the two out-of-scope items `macros-mvp.md` explicitly excludes from this fix:
  dietary-pattern macro overrides (`DEC-038`, blocked) and pre-event carbohydrate loading (needs a
  disclosed event date, `DEC-094`, which doesn't exist).
- Kept `DEC-034`'s readiness word as `SHIPPED` — this is a bugfix to an already-shipped
  implementation, not a new ratification.

## Next Steps

1. BCMP/CMP this branch: commit, merge to `master`, push, per this repo's git shorthand — not yet
   done as of this record.
2. The unrelated `IMPLEMENTATION_HANDOFF.md` backfill (see above) still needs its own commit on its
   own branch; don't bundle it into this one since they're unrelated changes.
3. `macros-mvp.md` also lists further (out-of-scope-for-this-fix) work: per-occasion protein
   distribution needs a consumer, min/max macros per meal needs slot-bound derivation, and dietary
   pattern-as-exclusion-set is unbuilt — any of these could be the next roadmap_v2 item picked up.
