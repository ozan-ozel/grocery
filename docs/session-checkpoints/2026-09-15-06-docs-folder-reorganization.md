# 2026-09-15: docs/ Folder Reorganization

**Date:** 2026-09-15
**Branch:** `docs/reorganize-docs-folder`
**Status:** done, not yet merged/pushed

## Current Objective

Following a filename-only audit of `docs/` this session (requested by the user), reorganize the
folder so it's actually navigable: group the 14 loose `roadmap_v2.md`-scope files, archive genuinely
superseded docs, fill in the never-completed `knowledge-map.md` routing index, and make `CLAUDE.md`
point through it instead of listing individual files that go stale.

## Current State

- Moved 14 `*-mvp.md` files from `docs/` root into `docs/mvp-scope/`, with a new
  `docs/mvp-scope/README.md` index (domain, `DEC` range, MVP status per file — backfilled from this
  session's findings).
- Moved 3 files into a new `docs/archive/`: `MEAL_TRACKING_IMPLEMENTATION.md` (superseded — its
  described macro-summary-card layout is shipped in `MacroSummaryCard.tsx`), `netlify-vercel-migration-plan.md`
  (Netlify is retired), and `docs/roadmap.md` (kept live-content-wise — it's a *different* doc from
  `roadmap_v2.md`, not actually superseded — but archived anyway per explicit user decision after I
  flagged the distinction).
- **Did not delete `docs/knowledge-map.md`** — found it's the designated fill-in target for
  `.copilot-agent-kit-adaptation.md` (a GitHub Copilot onboarding config, root of the repo), whose
  task #1 is literally "Fill or improve docs/knowledge-map.md... do not leave placeholders." Filled
  in its routing table for real instead of creating a competing `docs/README.md`.
- Added `docs/superpowers/plans/README.md` — the plans-status index discussed earlier this session,
  backfilled with all 21 existing plan files' status (13 `SHIPPED`, 3 `NOT_STARTED`, 5 `UNCLEAR`).
- Rewrote `CLAUDE.md`'s "Where things live" to point to `docs/knowledge-map.md` as the entry point,
  keeping only `architecture.md`/`claude-interaction-model.md` inline as load-bearing exceptions.
  Updated the earlier-added `*-mvp.md`/`DEC_REGISTER.md`/`roadmap_v2.md` sync rule's paths for the
  move, and added a parallel rule for the two new `README.md` indexes.
- Fixed every live reference to the 17 moved files across `CLAUDE.md`, `README.md`,
  `docs/architecture.md`, `docs/claude-interaction-model.md`, `docs/roadmap_v2.md`, and
  `nutrition-curriculum/DEC_REGISTER.md`.
- **Deliberately left stale** the references inside dated historical records — `docs/session-checkpoints/*.md`
  and `nutrition-curriculum/00_PROJECT_CONTROL/DECISIONS/*.md` — since both systems' own conventions
  treat those as frozen snapshots of what was true when written, not live navigation.
- `tsc -b` clean (docs-only change; not expected to affect it, confirmed anyway).

## Files Changed

- 14 files moved `docs/*-mvp.md` → `docs/mvp-scope/*-mvp.md`
- 3 files moved to `docs/archive/`: `MEAL_TRACKING_IMPLEMENTATION.md`, `netlify-vercel-migration-plan.md`, `roadmap.md`
- `docs/knowledge-map.md` — rewritten, no longer a placeholder template
- `docs/mvp-scope/README.md`, `docs/superpowers/plans/README.md` — new indexes
- `CLAUDE.md`, `README.md`, `docs/architecture.md`, `docs/claude-interaction-model.md`,
  `docs/roadmap_v2.md`, `nutrition-curriculum/DEC_REGISTER.md` — path references updated

## Important Decisions

- `docs/roadmap.md` and `docs/roadmap_v2.md` are **not** the same document at two versions — one is
  the general app-engineering roadmap, the other is the nutrition-curriculum MVP scope. Flagged this
  to the user before archiving; user chose to archive `roadmap.md` anyway despite it not being
  superseded. Its content is unchanged, just relocated — still fully readable at the new path.
- Chose to fill in `docs/knowledge-map.md` rather than create a separate `docs/README.md`, once its
  role as a Copilot-adaptation-kit integration point was discovered — avoids two competing indexes.
- Historical/dated records (checkpoints, ratification decisions) are exempt from the path-fixing pass
  — their own conventions already treat them as frozen, and "fixing" them would misrepresent what was
  actually true at the time they were written.

## Next Steps

1. CMP this branch into `master`.
2. The 5 `UNCLEAR` rows in `docs/superpowers/plans/README.md` (2026-09-02 UX polish summary,
   2026-09-04 sport-nutrition handoff, 2026-09-12 header cleanup, 2026-09-12 shopping cleanup) could
   be read properly and reclassified whenever there's time — not urgent, flagged honestly as unverified
   rather than guessed.
