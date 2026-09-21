# Session Checkpoints

**Status: HISTORICAL snapshots — not the place to learn how the app works today.** Each file records
what one session did and believed on its date, and is normally preserved as written. Some statements in them
have since been superseded (for example how `vercel dev` loads env files, the theme count, or the sync
interval). For current behavior use [`../architecture.md`](../architecture.md) and
[`../operations.md`](../operations.md); for current work use [`../CURRENT_STATE.md`](../CURRENT_STATE.md).

**Historical does not mean immutable — it means a checkpoint is never rewritten into a current-state record.**
A factual or status correction (for example, a branch that has since been merged) may be made when needed.
These records are the historical collaboration/session log; `CURRENT_STATE.md` is the separate current
continuation guide, and neither replaces the other.

**Do not read these by default.** Open one only when you need the history of a specific piece of work
(why it was built a certain way, what was measured, what was left unverified) — find it in the index
below. Files are named `YYYY-MM-DD-NN-slug.md`, so they sort chronologically.

## Index

| # | Record |
| --- | --- |
| 1 | [Mobile bottom-nav redesign](2026-09-12-01-mobile-bottom-nav-redesign.md) |
| 2 | [Yemek Planı UX plan batch](2026-09-12-02-meal-plan-ux-plan-batch.md) |
| 3 | [Checkpoint-folder migration session](2026-09-12-03-checkpoint-folder-migration.md) |
| 4 | [Food recommendation and recipe research](2026-09-12-04-food-recommendation-recipe-research.md) |
| 5 | [Category dropdown button repositioning](2026-09-12-05-category-dropdown-positioning.md) |
| 6 | [DropdownChevronButton component](2026-09-12-06-dropdown-chevron-component.md) |
| 7 | [Smooth Pill tab system, dedicated Settings page, layout cleanup](2026-09-12-07-smooth-pill-tabs-and-settings-page.md) |
| 8 | [Meal shopping-list toggle](2026-09-12-08-meal-shopping-list-toggle.md) |
| 9 | [Version 2 North Star UI](2026-09-12-09-version-2-north-star-ui.md) |
| 10 | [Mobile bottom-nav redesign — follow-up note](2026-09-15-01-mobile-bottom-nav-redesign-followup.md) |
| 11 | [Active-work tracker removal and docs/ classification pass](2026-09-15-02-active-work-tracker-removal.md) |
| 12 | [Carbohydrate-band MVP correction (DEC-034)](2026-09-15-03-carb-band-mvp-correction.md) |
| 13 | [Activity-level info copy](2026-09-15-04-activity-level-info-copy.md) |
| 14 | [Life Stage MVP — excluded-populations copy](2026-09-15-05-life-stage-mvp-excluded-populations-copy.md) |
| 15 | [docs/ folder reorganization](2026-09-15-06-docs-folder-reorganization.md) |
| 16 | [UI/UX audit and North Star review](2026-09-16-01-ui-ux-audit-north-star-review.md) |
| 17 | [UI/UX audit backlog implementation](2026-09-16-02-ui-ux-audit-backlog-implementation.md) |
| 18 | [Evening meal recommendation MVP (DEC-060 extension)](2026-09-16-03-evening-meal-recommendation-mvp.md) |
| 19 | [Lazy-load App sections (perf: first-load bundle size)](2026-09-16-04-lazy-load-app-sections.md) |
| 20 | [Defer unconditional food-catalog fetch (perf follow-up)](2026-09-16-05-defer-food-catalog-fetch.md) |
| 21 | [Lazy-load the Turkish categorization engine (perf follow-up)](2026-09-16-06-lazy-load-categorizer.md) |
| 22 | [Meat meals + hindi göğsü sort-to-bottom](2026-09-16-07-meat-meals-and-hindi-sort.md) |
| 23 | [Kişisel Plan: sources/nav polish, hydration range, citation accuracy](2026-09-17-01-kisisel-plan-sources-nav-polish.md) |
| 24 | [Boot performance waterfall (3-tier → 1-tier API)](2026-09-17-02-boot-performance-waterfall.md) |
| 25 | [UI/UX refinement pass + real delete-account flow](2026-09-19-01-ui-ux-refinement-pass.md) |
| 26 | [Batch preparation UI (DEC-069 frontend re-surface)](2026-09-19-02-batch-preparation-ui.md) |
| 27 | [Nutrition write lockdown + hidden maintenance upload + UI tweaks](2026-09-20-01-nutrition-write-lockdown.md) |
| 28 | [Archive unused meal code](2026-09-20-02-archive-unused-meal-code.md) |
| 29 | [Yemekler sheet: Yemeklerim / Hazır Yemekler / Tarifler](2026-09-20-03-meals-sheet-yemeklerim-tarifler.md) |
| 30 | [agent-login `_debug` gate fix, secret rotation, `agent-session` / `agent-mint` split](2026-09-20-04-agent-login-debug-gate-and-secret-rotation.md) |
| 31 | [Meal plan: meal cards, bulk clear, 5-step undo](2026-09-21-01-meal-plan-cards-clear-undo.md) |

The UI polish pass of 2026-09-16 (buttons, spacing, macro rings, nav feel) has no checkpoint of its own; its
full record is [`../ui-ux-audit-2026-09-16-polish.md`](../ui-ux-audit-2026-09-16-polish.md).

## Adding a record

Create the next `YYYY-MM-DD-NN-slug.md` here (the `session-checkpoint` skill does this) and add a row to the
index above — this index replaces the numbered list that used to live in the current-state file. Only write
a record when the work is significant enough to need one (see `CLAUDE.md`, "Close-out checklist"); routine
state changes belong in `docs/CURRENT_STATE.md` instead.
