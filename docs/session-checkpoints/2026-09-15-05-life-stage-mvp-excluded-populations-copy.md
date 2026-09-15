# 2026-09-15: Life Stage MVP — excluded-populations copy

**Date:** 2026-09-15
**Branch:** `docs/life-stage-mvp-excluded-populations-copy`
**Status:** done

## Current Objective

Close out the one remaining unbuilt item in `docs/life-stage-mvp.md`'s MVP scope: state the app's
excluded populations (under-18, pregnancy, lactation, eating-disorder treatment) plainly in the UI
rather than only in the docs. Picked up via `COL` after `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md`
came back empty (Active table empty, all 4 Closed-table PROVISIONAL DECs already `IMPLEMENTED` per
`DEC_REGISTER.md`) — user redirected to continue from an unimplemented `docs/*-mvp.md` file instead,
and picked `life-stage-mvp.md`.

## Current State

- Added a short Turkish-language note near the age field in both places a profile's age is set:
  `OnboardingQuickSetup.tsx` step 0 and `PersonalPlanView.tsx`'s Profil section.
- `docs/life-stage-mvp.md` given a Status section noting what's implemented vs. still `BLOCKED`
  (`DEC-103`/`DEC-104`/`DEC-105`, unchanged, out of scope).
- `docs/roadmap_v2.md`'s Life Stage line flipped from `SCOPED` to `DONE`.
- `npm run build` (tsc -b + vite build) passes clean.
- Not committed — per standing project preference, implement and verify, then stop; user commits
  manually after testing.

## Files Changed

- `src/components/OnboardingQuickSetup.tsx` — excluded-populations note under step 0's age/height/weight
  fields.
- `src/components/PersonalPlanView.tsx` — same note under the Profil section's age/height/weight fields.
- `docs/life-stage-mvp.md` — new Status section.
- `docs/roadmap_v2.md` — Life Stage line marked `DONE`.

## Important Decisions

- Left `nutrition-curriculum/DEC_REGISTER.md`'s `DEC-103`/`DEC-104`/`DEC-105` rows untouched: their
  `BLOCKED` status and note are still accurate (no life-stage fields exist, and this change
  deliberately doesn't add any) — nothing to update there.
- Did not touch the pre-existing uncommitted `CLAUDE.md` diff found on `master` at session start (a
  new rule about keeping `*-mvp.md`/`roadmap_v2.md`/`DEC_REGISTER.md` in sync) — it predates this
  branch and this session's work followed it, but committing it is a separate decision for the user.

## Next Steps

- User reviews in the running app (`npm run vercel:dev`), then commits/merges per their own workflow
  (BCMP if they want it folded into `master`).
