# UI/UX Audit — September 2026

**Date:** 2026-09-16
**Branch:** `docs/ui-ux-audit-north-star-review`
**Status:** Analysis complete; no code changes made as part of this document

## What this is

A structured UI/UX review of the shipped app, cross-checked against the documented
[Version 2 North Star direction](v2-north-star-design.md) and the
[5-option comparison mockup](../public/mockups/grocery-ui-options.html), plus a first pass at
identifying where motion would clarify state changes. See
[docs/session-checkpoints/](session-checkpoints/) for how to log follow-up work; this document is
the Pass 1–6 findings artifact referenced from the audit plan.

Screens were reviewed live via an authenticated session (`api/agent-login.ts`, once its
`vercel dev` env-loading issue was worked around — see that file's own comments for the intended
usage; the fix was launching with `AGENT_LOGIN_SECRET=<value> npm run vercel:dev` rather than
relying on `.env.local` pickup for that one key) at desktop (1280px) and mobile (390px) widths,
covering: onboarding, shopping list (empty/populated/checked), nutrition view, meal plan, personal
plan, and settings.

## Pass 1 — Baseline visual audit

**Palette discipline is already strong.** `src/index.css` implements exactly the "two-color,
one-accent" system North Star asks for: a paper/ink base (`--color-background`/`--color-foreground`)
plus a single reserved accent (`--color-signal`, price-sticker red) for the tally and destructive
actions — explicitly commented "Nothing else may use it." A grep across `src/**/*.tsx` found **zero**
hardcoded hex colors outside `index.css` — every component consumes the token system. This is a
foundation most audits have to build; here it already exists and is being followed.

**Typography and card structure are consistent** across the meal plan, personal-plan, and nutrition
screens: a small uppercase muted label, a bold heading, then a bordered white card grid (see the
"GÜNLÜK MAKROLAR" strip on Yemek Planı and the "Günlük hedeflerin" grid on Kişisel Plan — same card
pattern, same spacing rhythm).

**Finding — Smooth Pill is followed correctly.** Both real consumers of the pattern
(`NutritionView.tsx`, `AppHeader.tsx`) use `SmoothPillTabs`/`SP_TRIGGER_CLASS` as documented in
`CLAUDE.md`; no component reimplements a competing tab style.

## Pass 2 — North Star validation

Verdict: **adopt the hierarchy shift, not a visual rebuild.**

The North Star mockup's visual system (palette, card shapes, spacing) is already substantially what
the real app uses today — Pass 1 confirms the token system North Star describes is implemented, not
aspirational. The actual gap between today's app and the North Star mockup is **information
priority**, not visual style:

- Today's real entry point is the shopping list (`section=alisveris`); meal planning and macros are
  one tab over. North Star's "05" option reframes the *same data* (daily kcal target, macro grid,
  meal slots) as the landing view under a "Plan my day" framing, with shopping pushed to "Build
  shopping list from this day" as a downstream action.
  Today's `Yemek Planı` view (see the "İlk Öğün / Ara Öğün / Son Öğün" structure captured live) is
  already close in *content* to North Star's meal-slot list — the difference is which screen the
  user lands on first, and how much narrative framing surrounds the numbers ("remaining" vs. a bare
  macro grid).
- **Reject** treating the mockup's English copy as a target — the real app's Turkish strings
  ("Günlük hedeflerin", "İlk Öğün") are the actual product language; the mockup's English labels
  were just placeholder text for the design exercise and shouldn't be read as a localization
  decision.

Recommendation: if North Star proceeds, scope it as **default-tab reordering + a "today" summary
card on the meal-plan view**, reusing the existing macro-grid and meal-slot components already
built for `Yemek Planı` and `Kişisel Plan`, rather than a new visual system.

## Pass 3 — Responsive / mobile-UX audit

Tested at 390×844 (iPhone-class width).

- Layout reflows cleanly at mobile width for every screen checked — no horizontal overflow, no
  clipped text, cards stack to full width correctly (Kişisel Plan's 2-column macro grid, meal-plan
  cards, shopping-list rows).
- Bottom navigation stays clear of content at true scroll-end (verified by scrolling to
  `document.body.scrollHeight` and screenshotting the real viewport — a `fullPage` screenshot alone
  is misleading here since Playwright's page-stitching redraws `position: fixed` elements at every
  stitched segment, which can look like an overlap bug in the raw capture but isn't one at runtime).
- **Finding — checkbox touch target is under the mobile minimum.**
  `src/components/ui/checkbox.tsx:13` sets `size-5` (20×20px) with no padding wrapper enlarging the
  tappable area — confirmed via `getBoundingClientRect()` on the live shopping-list checkbox: both
  the visible box and its clickable ancestor (`<button>`) measure exactly 20×20px. This is well
  under the ~44×44px mobile touch-target guideline (Apple HIG / Android Material both recommend
  44–48px), and it's shared UI — every checkbox in the app (shopping items, `PersonalPlanView`
  toggles) inherits the same small hit area. **This is the single highest-value fix from this
  audit**: one change to the shared primitive fixes hit-area everywhere it's used, without changing
  the visual 20px box (e.g. a padded wrapper or `::before` hit-slop).
- Add-item autocomplete on the shopping list ("EN ÇOK ALINAN" suggestion panel) renders correctly
  but sits directly over the list below it until dismissed — not a mobile-specific bug (same
  behavior at desktop width) but worth a follow-up check on whether it should close automatically
  once a suggestion is accepted vs. requiring a tap-away.

## Pass 4 — Design-system consistency

- No hardcoded color values found outside `src/index.css` (Pass 1).
- Smooth Pill pattern followed correctly in both real consumers (Pass 1).
- No duplicate tab/pill implementations found elsewhere in `src/components/`.
- Card/spacing rhythm (bordered white card, uppercase muted eyebrow label, bold value) repeats
  consistently across `PersonalPlanView`, `TodayView`/meal plan, and `NutritionView` — this is a
  candidate for extracting a shared `StatCard`-style primitive if it isn't one already, since three
  screens currently hand-roll the same visual pattern (worth a follow-up code-level check, not
  confirmed as duplicated *code*, only as duplicated *visual pattern*, during this pass).

## Pass 5 — Animation opportunities (where, not how)

No animation library is installed (`package.json` has no Framer Motion, `tailwindcss-animate`,
etc.). Current motion is plain CSS: hover-state `transition-colors` in ~27 components, plus two real
keyframe animations (`loading-flow` shimmer skeleton, `gradient-edge-flow`) in `src/index.css`. Per
the standing instruction for this audit: **default to CSS-only recommendations below; a library is
only worth considering if a specific item turns out to need orchestrated/interruptible sequences
that plain CSS transitions can't express cleanly** — none of the candidates below reach that bar.

**Correction (2026-09-16):** the two items below were re-checked against actual component code
before implementation, not just screenshots, and revised accordingly — the original text claimed
the shopping-list progress bar had no transition (wrong: it already does) and treated "macro
progress bars/rings" as an existing-but-unanimated element (wrong: no such bar/ring element exists
anywhere in the real app yet — `PersonalPlanView` and the Yemek Planı macro strip show plain numbers
in cards, no bar). Corrected findings:

Ranked by where motion would clarify a real state change (not decoration):

1. **Shopping-list item entrance** (`ActiveListRow.tsx`, `AddItem.tsx`). Confirmed no transition on
   insert: a newly-added item and a checked item reappearing in the separate "SEPETTE" (in-cart)
   list (`ActiveList.tsx:86-87` filters into two separate arrays, so this is an unmount/remount
   across lists, not a reorder) both currently pop in with no treatment. Fix: apply this codebase's
   existing entrance-animation convention (`starting:opacity-0 starting:scale-95` etc., already used
   in the select-mode checkbox and the `AddItem` autocomplete dropdown) to the row itself. Animating
   the *exit* from the old list (so a row visibly slides from "pending" into "sepette") would need
   either manual FLIP position math or a library's layout animation — real added complexity for a
   cosmetic gain, and the first candidate in this pass that would justify considering a library. Not
   done as part of this pass; flagged if it's ever wanted.
2. ~~Macro progress bars / rings~~ — **does not apply**; no bar/ring UI element exists in
   `PersonalPlanView` or the Yemek Planı macro strip today (both are plain number grids). This is a
   genuinely new feature (add rings), not an animation fix to something unanimated, and is tracked
   separately below rather than folded into this pass's "add a transition" framing.
3. **Modal/sheet open** (`FoodSearchModal.tsx`, `RecipeSearchModal.tsx`). Not checked for existing
   transition in this pass — flagged as a follow-up, since bottom-sheet-style entrances are one of
   the highest-value animation spots on mobile per general UX practice, but confirming current
   behavior needs a dedicated look at those two components before recommending specific timing.

**Follow-up feature (tracked separately, not part of this animation pass) — Done.**
Added per-tile progress rings to `MacroSummaryCard.tsx` (the real "GÜNLÜK MAKROLAR" component
rendered on Yemek Planı via `MealPlanView.tsx:188-192` — not `TodayView.tsx`'s `RemainingSummary`,
which turned out to be dead code, unreferenced anywhere in `App.tsx`). `PersonalPlanView` still does
not get rings — it remains a goal-setting screen with no "consumed" value to show progress against.
Ring color matches each tile's existing (pre-token-system, hardcoded Tailwind) per-metric border
color rather than the app's single `--color-signal` accent, since the tiles already establish
per-metric color identity — a single-accent ring would have visually mismatched its own tile.
Scoped via the `dataviz` skill (form: "a single ratio against a limit" → meter, same-ramp track).

**Explicit library-adoption note (per this audit's scope instruction):** none of the above need a
library. If a future task adds drag-to-reorder shopping items or a swipe-to-delete gesture, that's
the point at which plain CSS stops being sufficient and a library (e.g. Framer Motion) should be
evaluated — not before.

## Pass 6 — Accessibility & production-quality gate (lightweight)

- Semantic structure looked correct where inspected: real `<button>`/`checkbox` roles, labeled
  form inputs (`Yaş`, `Boy (cm)`, `Kilo (kg)` all read as accessible names in the snapshot tree), a
  proper `tablist`/`tab`/`tabpanel` structure on the Liste/Geçmiş tabs.
- Checkbox touch-target finding (Pass 3) is also an accessibility issue, not just a UX one — WCAG
  2.5.5/2.5.8 target-size guidance.
- Did not do a full contrast/keyboard-trap audit in this pass — flagged as a follow-up, not
  attempted here given this pass was scoped as lightweight per the audit plan.

## Prioritized backlog

Ordered by the priority list this audit was scoped against (mobile UX → core interaction →
responsive → hierarchy → design-system consistency → accessibility → performance → motion → visual
polish → decoration):

1. **Fix checkbox touch target** (`src/components/ui/checkbox.tsx`) — one shared-primitive change,
   benefits every checkbox in the app. (Mobile UX / accessibility) — **Done**, `5885f90`.
2. **Decide and scope North Star's hierarchy shift** (Pass 2) — reorder default tab / add a "today"
   summary rather than rebuild visuals. (Hierarchy) — **Done** (default-tab reorder only, scoped
   down from the full "today summary" via brainstorming), `db1a606`.
3. **Animate the check/uncheck + progress-bar fill** on the shopping list (Pass 5, #1–2) — CSS-only,
   reinforces the app's own progress-focused copy. (Core interaction / motion)
4. **Follow-up look at `FoodSearchModal`/`RecipeSearchModal` entrance behavior** before committing to
   a specific animation treatment there. (Motion — needs more investigation first)
5. **Confirm whether the repeated stat-card visual pattern should become a shared component**
   (Pass 4) — a code-level check, not yet confirmed as actual duplication.
6. **Full accessibility pass** (contrast, keyboard traps) if the app is heading toward a wider
   release — not urgent today given Pass 6's spot checks found no red flags.

## What this audit did not cover

- `Geçmiş` (history) tab content.
- Full `FoodSearchModal`/`RecipeSearchModal` interaction review.
- Dark/`grafit` theme variants (only the default `paper` theme was reviewed live).
- Populated nutrition-comparison view (`NutritionCompareView`) — the test account had no items with
  nutrition data loaded.
