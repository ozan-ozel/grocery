# 2026-09-02 — Nutrition/Personal Plan UX Polish (session summary)

Branch: `feature/nutrition-view-ux-polish` (merged to `master`, pushed). A long, iterative
UI/UX session across `PersonalPlanView.tsx`, `NutritionCompareView.tsx`, `TodayView.tsx`,
`AddItem.tsx`, `App.tsx`, and shared CSS/hooks. Recorded here as a single reference since the
work happened across many small, back-and-forth requests rather than one plan.

## "Nasıl hesaplanıyor?" (Kişisel Plan)

- Rewrote the explanation to map every displayed number to its actual formula (Mifflin-St Jeor
  coefficients, activity multipliers, goal kcal adjustment, DRI macro ranges) instead of vague prose.
- New "i" icon: a small `border-signal/70 + bg-signal/10 + text-signal` chip, matching the app's
  existing badge language (`SourceBadge`), replacing an invented solid-gradient circle that didn't
  match anything else in the app.
- Background gradient wash on open was removed per feedback — plain `bg-background` for readability.

## Gradient border system

- `.gradient-edge` (existing) reversed direction (signal starts at the top-left corner) and now
  fades into `--color-secondary` instead of `--color-primary`.
- New animated variant `.gradient-edge-flow`: a ping-pong sweep via `transform: translateX()`
  (compositor-only, no per-frame repaint) — several iterations to get direction, easing, and
  contrast right, landed on `linear` timing with `alternate` and a wide single (non-tiled) gradient
  so both ends read as genuinely different, resolved states.
- **Real bug found and fixed:** the original border technique (`p-px` padding + an inner opaque box
  covering everything but 1px) only stays a hairline if the two boxes' geometry stays in sync every
  frame. During a `<details>` height transition it doesn't, so the "border" briefly rendered as a
  full color fill. Fixed by adding two new CSS utilities that use a genuine `border` property
  instead: `.border-signal-solid` (flat color) and `.border-gradient-edge` (the padding-box /
  border-box double-background trick) — both are architecturally immune to this, regardless of
  what's animating inside.
- `.glow-signal` (soft box-shadow) — tried a settle-gated fade in/out to avoid it "chasing" the
  growing/shrinking box during the height transition; ultimately reverted to always-on per feedback,
  since the border fix above addressed the actual visible bug.

## Smooth open/close for every `<details>`

- One shared CSS rule (`details::details-content` + `interpolate-size: allow-keywords`) gives every
  `<details>` in the app a smooth height transition instead of an instant snap — progressive
  enhancement, silently falls back to the old behavior in unsupported browsers.
- `useDetailsTransition` hook: bundles the "wait for the transition to settle" timing with an
  optional scroll-into-view on open (`"start"` aligns the row to the top of the viewport;
  `"nearest"` only nudges the minimum needed — used for "Diğer kombinasyonlar" specifically so a
  long list doesn't drag the page trying to fit all of it).
- "Kaynakları göster" converted from a checkbox + conditional render into a real `<details>`, so it
  gets the same open/close treatment "for free."

## TodayView

- "Listeye ekle" is now a real add/remove toggle against actual list state (`isOnList` /
  `removeItemByName`, new in `listActions.ts`) instead of a button that said "Eklendi" for 1.5s and
  silently reverted.
- "Diğer kombinasyonlar" chevron restyled to match the Kişisel Plan icon chip.
- "Bugün yediklerin" card: gradient-fill trick replaced with a real border + light `bg-signal/10`.
- Dropped the monospace `.ledger` styling from the kcal/protein and time lines specifically.

## App-wide font pass

- `.ledger` no longer sets `font-family: var(--font-mono)` — kept `tabular-nums` for column
  alignment, dropped the monospace stack. Most monospace fonts render a slashed zero to disambiguate
  it from "O" in source code; that read as a stray/confusing mark in a nutrition/shopping context.
  This is a single shared class, so the fix applies everywhere `.ledger` is used, not just the
  screens that prompted it.

## Boot skeleton

- Replaced a generic block-stack loading placeholder with one that mimics the real
  header/tabs/title/list layout (`AppBootSkeleton` in `App.tsx`), so the very first paint already
  reads as "this screen, loading" rather than an unrelated placeholder.
- `LoadingBlock` now uses `cn()` so callers can override its default `rounded-lg` (e.g. `rounded-full`
  for a pill-shaped placeholder) instead of both classes fighting.

## "Bul" merged into "Ürün ekle"

- `SearchView.tsx` (a full tab) was a near-duplicate of `AddItem.tsx`'s autocomplete — same
  catalog, same suggestion shape. Folded into `AddItem.tsx`: shows "en çok alınan" on focus even
  before typing, with a "Tümünü göster" expand for the full catalog. `SearchView.tsx` deleted, the
  "Bul" tab and its `Tab` type entry removed.

## Swipe navigation

- Swipe left/right anywhere in the Alışveriş section's content moves between its sub-tabs
  (Bugün/Liste/Geçmiş/Kategoriler). Scoped specifically to avoid the existing per-row `swipeMode`
  gesture (`ActiveListRow.tsx`'s swipe-to-check/delete) — touches starting on a `[data-swipe-row]`,
  button, input, or other interactive element are ignored entirely.

## UndoToast

- Added a dismiss (`×`) button independent of "Geri al" (`useUndo`'s new `dismiss()`).

## Deploy / infra note

- A `vercel --prod` deploy was run manually mid-session (uncommitted local state — the CLI deploys
  the filesystem, not a git ref). Documented in `docs/architecture.md`'s new "Deployment" section:
  `git push origin master` separately auto-deploys Netlify production via GitHub integration, with
  no confirmation step — the two deploy paths are fully independent of each other.

## Docs touched

- `docs/architecture.md`: new "Deployment" section; fixed two stale references (`.ledger` no longer
  monospace; the "Find tab" no longer exists, folded into `AddItem.tsx`).
