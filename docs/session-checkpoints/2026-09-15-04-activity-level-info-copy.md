# 2026-09-15: Activity-Level Info Copy

**Date:** 2026-09-15
**Branch:** `feature/carb-band-fix-and-activity-info`
**Status:** done, not yet merged/pushed

## Current Objective

Finish the "Final MVP plan, locked in" from this session's roadmap_v2 discussion: the carb-band fix
(`DEC-034`, prior checkpoint 03) plus a second, independent item — elaborating the five vague
activity-dropdown labels ("Hareketsiz/Az aktif/Orta aktif/Aktif/Çok aktif") that testing this session
found gave users no way to judge which one actually described their week.

## Current State

Added an "i" info toggle next to the "Günlük aktivite" field in `PersonalPlanView.tsx`. Clicking it
shows a short paragraph: a fixed intro (activity level is about the whole day, not just workouts) plus
the description for whichever activity level is currently selected. Descriptions are anchored to the
IOM/DRI walking-equivalent framework (2002/2005, cited in Krause & Mahan ch.2) rather than invented
category boundaries — verified by reading that source directly (see conversation for the exact
mileage/PAL figures).

The **range-based calorie target** feature (the other item discussed at length this session) was
explicitly **not** built — `docs/governance-confidence-mvp.md` says the typed band/range output is
"a V2 upgrade... do not start it here," which directly contradicts building it as part of this MVP
pass. Left for a human decision on whether to override that note; nothing implemented.

Browser verification was attempted but blocked by the app's Google-OAuth login gate, which isn't
reachable from a plain `vite` dev server (no `/api/*`) or scriptable without real credentials.
Verified instead via `tsc -b` (clean) and manual trace of the render logic, which follows the same
conditional-render pattern already used for `sourceBadge` on the same `Field` component.

## Files Changed

- `src/lib/mealPersonalization.ts` — added `ACTIVITY_INFO_INTRO` and `ACTIVITY_DESCRIPTIONS` (Turkish,
  keyed by `ActivityLevel`).
- `src/components/PersonalPlanView.tsx` — `Field` gained an optional `info` prop rendering a toggle
  button + expandable paragraph; wired into the "Günlük aktivite" field only.

## Important Decisions

- Info panel shows only the *currently selected* activity's description, not all five at once —
  avoids overwhelming the field with five paragraphs.
- No new UI primitive added (no tooltip/popover library) — kept to local `useState` inside `Field`,
  matching the app's existing minimal-dependency style (`src/components/ui/` has no
  tooltip/popover/dialog component, and this didn't need one).
- Range-based calorie target intentionally excluded from this pass — see Problems below.

## Constraints

- Browser/UI verification is still outstanding — needs a real login session (or a test-account
  bypass) to confirm the toggle renders and reads correctly at phone width.

## Problems / Unresolved Issues

- The range-based calorie target (maintenance shown as a band, goal target as a band) is unresolved:
  `governance-confidence-mvp.md` explicitly says not to build it as MVP work, but this session's whole
  discussion converged on it as the main thing worth adding. Needs a human call on whether to override
  that note before it's built, and if so, a doc recording why (see conversation — this was flagged as
  the one case in this session actually worth a `docs/superpowers/plans/` entry).
- `+250/−400` kcal (asymmetric) vs. the curriculum's flat `±500` was decided **for a future range
  feature** ("flat 500 is good") but that decision has no effect yet, since the range feature itself
  is on hold.

## Next Steps

1. CMP this branch (carb-band fix + activity-info copy) into `master`.
2. Update `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md`'s reference if useful, and check whether
   `docs/roadmap_v2.md`'s Macros line ("DONE, TO BE CHECKED") should be updated now that the carb-band
   fix is complete.
3. Resolve the range-feature question with the user before starting any of that work.
4. Real browser verification of the info toggle once there's a way past the login gate in this
   environment.
