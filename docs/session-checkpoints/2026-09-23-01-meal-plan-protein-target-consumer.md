# 2026-09-23: DEC-033 per-occasion protein target consumer

**Date:** 2026-09-23
**Branch:** `master` (feature branch `feature/meal-plan-protein-target-consumer` merged and deleted)
**Status:** done

## Current Objective

Give the existing, previously-unused `occasionProteinTargetG()` function (in
`src/lib/mealPersonalization.ts`, tagged `MVP-1 PROVISIONAL (PSM Iteration 1, DEC-033)`) a display
consumer: show each meal-plan slot's protein target next to the protein already logged there.

## Current State

Complete and merged to `master` (`d77c0ef`), pushed to `origin`.

Sequence for this session, end to end:
1. **Dead-code audit and cleanup** (separate, smaller piece of work earlier in the session):
   removed two confirmed-unused exports (`auditFoodIdentityCollisions`, `DEFAULT_TENANT_ID`) and the
   stale `architecture.md` line describing the latter. Deliberately left `occasionProteinTargetG`
   alone at that point, since it's tied to a nutrition-curriculum DEC.
2. **`COL`** (nutrition-curriculum collaboration checkpoint): read all five continuity indexes
   (`IMPLEMENTATION_HANDOFF.md`, `DEC_REGISTER.md`, `docs/mvp-scope/README.md`,
   `docs/superpowers/plans/README.md`, `docs/CURRENT_STATE.md`) — no drift found. Active table was
   empty and the Closed table's backfilled entries gave no unambiguous next DEC, so asked the user
   which to resume; they chose DEC-033.
3. **Planning:** wrote
   [`nutrition-curriculum/09_HANDOFF_SPECS/DEC-033-per-occasion-protein-consumer.md`](../../nutrition-curriculum/09_HANDOFF_SPECS/DEC-033-per-occasion-protein-consumer.md)
   after tracing the actual code (existing `P: {consumed}g` header in `MealContainer.tsx`, the single
   `<MealContainer>` call site in `MealPlanView.tsx`, `personalizationProfile.weightKg` already
   available there).
4. Confirmed with the user that the dead-code cleanup in step 1 was unrelated to this function
   (it wasn't touched).
5. Pushed the DEC-033 row in `IMPLEMENTATION_HANDOFF.md`'s Active table, branched
   (`feature/meal-plan-protein-target-consumer`), wrote a single-task SDD plan
   ([`docs/superpowers/plans/2026-09-23-meal-plan-protein-target-consumer.md`](../superpowers/plans/2026-09-23-meal-plan-protein-target-consumer.md))
   wrapping the spec, and ran it through `superpowers:subagent-driven-development`.
6. Implementer (haiku) built the change; task review (sonnet) found one Important, plan-mandated bug
   — a JSX whitespace-collapse issue dropping the space in "Xg / Y-Zg hedef" for any slot with items
   logged. Fixed in one round, re-review clean.
7. Final whole-branch review (opus) found two Important findings, both docs-only: the trio-rule docs
   (`macros-mvp.md`, `mvp-scope/README.md`, `roadmap_v2.md`, `DEC_REGISTER.md`) weren't synced, and
   `docs/superpowers/plans/README.md` had no row for the new plan. Also flagged that
   `IMPLEMENTATION_HANDOFF.md`'s Active row needed closing without duplicating the pre-existing
   backfilled DEC-033 Closed row. One fix dispatch addressed both; scoped re-review clean.
8. Merged to `master` locally (build verified before and after merge), pushed, feature branch
   deleted, SDD workspace deleted.

## Files Changed

- `src/components/MealContainer.tsx` — new required prop `proteinTargetG: {min, max}`; header now
  shows `P: {consumed}g / {min}-{max}g hedef` for every slot, including one with nothing logged yet.
- `src/components/MealPlanView.tsx` — computes `occasionProteinTargetG(personalizationProfile.weightKg)`
  once per render, passes the same object to every `<MealContainer>`.
- `src/lib/foodIdentity.ts`, `src/lib/store.ts`, `docs/architecture.md` — separate dead-code removal
  (see step 1 above), unrelated to DEC-033.
- `docs/mvp-scope/macros-mvp.md`, `docs/mvp-scope/README.md`, `docs/roadmap_v2.md`,
  `nutrition-curriculum/DEC_REGISTER.md` — trio-rule sync: all now describe the consumer as shipped.
- `docs/superpowers/plans/README.md` — new row for this plan, `SHIPPED`.
- `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` — Active table back to empty; existing DEC-033
  Closed row's Notes appended (not duplicated).
- New: `nutrition-curriculum/09_HANDOFF_SPECS/DEC-033-per-occasion-protein-consumer.md`,
  `docs/superpowers/plans/2026-09-23-meal-plan-protein-target-consumer.md`.

## Important Decisions

- Kept the flat 0.3-0.4 g/kg band identical across all displayed slots — no redistribution by
  occasion size/timing/training, per the spec's explicit scope fence (DEC-035/DEC-057 stay blocked).
- Display-only: no gating, warning color, or blocking behavior tied to the target range.
- Four Minor findings from the final review were parked (not fixed), with the ruling recorded in the
  SDD ledger before it was deleted — repeated here since the ledger no longer exists:
  - `MealPlanView.tsx`'s once-per-render computation uses an IIFE where a plain `const` would be
    simpler — cosmetic, no functional issue.
  - `occasionProteinTargetG` doesn't share `validateProfile`'s guard; a corrupted cached `weightKg`
    could in theory render `NaN-NaNg hedef`. Deemed unlikely (the profile form validates input) and
    not load-bearing.
  - With no saved profile, the target is computed from the 70 kg default and shown as if personal —
    the spec explicitly accepts this, consistent with existing `MacroSummaryCard` behavior.
  - Phone-width header wrapping (the header line is now longer) was not manually verified in
    `vercel:dev` — folded into the phone-check backlog below.

## Problems / Unresolved Issues

None blocking. See Next Steps for the deferred phone check.

## Next Steps

- Real-phone check of the new meal-slot header (does "P: Xg / Y-Zg hedef · K: ... · Y: ..." wrap
  acceptably at narrow widths, including an empty slot) — add to the existing real-phone-checks
  backlog in `docs/CURRENT_STATE.md`'s Open items rather than treating as separately blocking.
- `docs/CURRENT_STATE.md` itself was not refreshed as part of this session (no `SYNC` was run after
  this merge) — due for a refresh before the next `BCMP`/`CMP`.
