# 2026-09-16: UI/UX Audit Backlog Implementation

**Date:** 2026-09-16
**Branch:** `feature/ui-ux-audit-followups`
**Status:** Implemented and build-verified; not yet committed/merged (this checkpoint precedes that)

## Current Objective

Work through the backlog from
[`docs/ui-ux-audit-2026-09.md`](../ui-ux-audit-2026-09.md) (written in the prior session, see
[2026-09-16-01](2026-09-16-01-ui-ux-audit-north-star-review.md)) one item at a time, plus two
adjacent requests the user made mid-session (theme retirement, an animated theme toggle).

## Current State

All backlog items are now implemented on `feature/ui-ux-audit-followups`:

- **Checkbox touch target** — done in a prior session (`5885f90`, already merged).
- **North Star default-tab reorder** — done in a prior session (`db1a606`, already merged).
- **Stat-card shared-component question** — investigated, verdict "don't extract" (doc-only, no
  code change; only 2 live call sites, not structurally identical).
- **Check/uncheck + progress-bar animation** — progress bar and checkbox color already animated;
  fixed the one real gap (the check/minus glyph popping in with no transition) in the shared
  `Checkbox` primitive (`src/components/ui/checkbox.tsx`).
- **`FoodSearchModal`/`RecipeSearchModal` entrance review** — both had zero entrance transition
  (hard mount/unmount). Fixed identically in both: backdrop fade-in, sheet slide-up-from-off-screen.
- **Full accessibility pass** — computed real contrast ratios; `--color-muted-foreground` failed
  WCAG AA on light themes (4.06:1/4.46:1 vs the 4.5:1 minimum). Darkened it
  (`#6b7b74` → `#5f6e68`) in `src/index.css`. Also audited keyboard-dismissal across all
  modal-style components; added Escape-to-close to 5 components that lacked it
  (`FoodSearchModal`, `RecipeSearchModal`, `MealNutritionDetailSheet`, `ConfirmModal`,
  `MealShoppingConfirmModal`) and backdrop-click-to-close to the 2 that also lacked that
  (`FoodSearchModal`, `RecipeSearchModal`, restructured onto the same absolute-button-backdrop
  pattern `ConfirmModal` already used).
- **Theme retirement (user-directed, not an audit finding)** — retired the theme system from 9
  themes down to 2: "Nane" (light, the original default) and "Arduvaz" (dark). Removed the other 7
  `:root[data-theme="..."]` blocks from `src/index.css` and trimmed `Theme`/`THEME_OPTIONS`/
  `THEME_META_COLOR`/`THEME_SIGNAL_COLOR` in `src/lib/preferences.ts` to just those two.
  `loadTheme()`'s existing `THEME_IDS`-membership fallback means a device with an old retired theme
  selected just resets to Nane on next load — no migration code needed.
- **Animated theme toggle (user-directed, follow-on to the retirement)** — with only 2 themes left,
  rebuilt `ThemeSwitcher.tsx` from a dropdown-menu button into a single sliding on/off switch
  (Sun/Moon icon crossfade, CSS-only transform+opacity transitions), a more direct match for a
  binary choice than a menu.

All of this was built across 4 separate branches during the session (one per task, per
`CLAUDE.md`'s branch-per-task rule) and then **consolidated onto one branch**
(`feature/ui-ux-audit-followups`, git-stash-applied in sequence) once it became clear the branches
touched overlapping files (`docs/ui-ux-audit-2026-09.md`, `FoodSearchModal.tsx`,
`RecipeSearchModal.tsx`) and would conflict if merged separately. The 3 now-empty source branches
(`feature/checkbox-check-icon-animation`, `feature/modal-entrance-animation`,
`feature/retire-themes-and-contrast-fix`) were deleted after confirming they had no unique commits.

`npm run build` (`tsc -b` + `vite build`) passes clean on the consolidated branch. Every change was
also verified live via Playwright against `npm run vercel:dev` (auth via the `agent-login`
QA-login endpoint) — not just build-checked.

## Files Changed

- `src/components/ui/checkbox.tsx` — check/minus glyph entrance transition.
- `src/components/FoodSearchModal.tsx`, `src/components/RecipeSearchModal.tsx` — entrance
  animation + Escape/backdrop-click dismissal (backdrop/sheet structure changed to match
  `ConfirmModal`'s pattern).
- `src/components/MealNutritionDetailSheet.tsx`, `src/components/ConfirmModal.tsx`,
  `src/components/MealShoppingConfirmModal.tsx` — Escape-to-close added.
- `src/index.css` — muted-foreground contrast darkened; 7 retired theme blocks removed; the
  Parşömen-specific texture rule removed along with its theme.
- `src/lib/preferences.ts` — `Theme` type and the 3 option/color maps trimmed to 2 entries.
- `src/components/ThemeSwitcher.tsx` — rewritten from dropdown to animated switch.
- `docs/ui-ux-audit-2026-09.md` — every backlog item updated with its resolution.

## Important Decisions

- Theme retirement and the toggle-switch rebuild were **explicit user directives given mid-session**
  ("We will continue with nane and Arduvaz. First retire others than make the darken change"; "and
  change theme button to a animated switch"), not audit findings — recorded here so a future session
  doesn't mistake them for something the audit recommended.
- Muted-foreground darkening was scoped to only the 2 surviving themes (per the user's own
  sequencing: retire first, then darken) rather than all 9 original themes.
- Exit animation for the two bottom-sheet modals was deliberately left out — would need delayed
  unmount (state + timeout, or a library), which is real added complexity for a cosmetic gain, out
  of step with this audit's CSS-only-by-default scope.
- Consolidating 4 branches into 1 (rather than doing 4 separate BCMPs) was my own call, made when
  `docs/ui-ux-audit-2026-09.md`'s edits started conflicting across branches — flagged to the user
  as "BCMP ALL those branches" was being executed, not decided silently.

## Constraints

- No test suite (project-wide rule, unchanged) — verified via `tsc -b`/`vite build` and live
  Playwright exercise instead.
- CSS-only animation by default, per this audit's original scope instruction — still honored; no
  animation library was added anywhere in this round.
- Standing instruction (from the audit-planning session): never install/add a skill or plugin
  without asking first. Not triggered this round — no new skills were installed.

## Problems / Unresolved Issues

- None carried over from the audit are still open — the two audit items that were explicitly
  deferred earlier (sepette reverse-order, needs a `checkedAt` schema decision) remain deferred; not
  part of this round's scope.
- `FoodSearchModal`/`RecipeSearchModal` still lack `role="dialog"`/`aria-modal` — noted during the
  accessibility pass but not fixed; a smaller, separate follow-up if wanted.

## Failed Approaches

- None new this round. (See the prior checkpoint for the `TodayView`/`MacroSummaryCard` mistake
  from the progress-rings work — not repeated here.)

## Next Steps

1. Commit, merge to `master`, and push (`CMP`, already on a dedicated branch) — in progress as of
   this checkpoint.
2. Optional, not yet raised again by the user: sepette reverse-order, `role="dialog"`/`aria-modal`
   on the two bottom-sheet modals.
