# UI Polish Pass — Buttons, Spacing, Macro Rings, Nav Feel (2026-09-16)

Follow-up to [`ui-ux-audit-2026-09.md`](ui-ux-audit-2026-09.md) (that backlog is fully closed).
Scoped to a direct request: button size, margins/padding (especially around the bottom nav),
macro progress rings, and general color/feel polish. Reviewed live via `npm run vercel:dev` +
Playwright at a 390×844 mobile viewport, not just source reading.

## Findings and fixes

1. **Dead space above the bottom nav (real bug, fixed).** The root `<Tabs>` container in
   [`src/App.tsx`](../src/App.tsx) had `pb-32` (128px), and
   [`BottomNavigation`](../src/components/BottomNavigation.tsx) *also* renders its own in-flow
   spacer (`h-20 sm:h-16`) to keep content clear of the `fixed` nav bar. Both applied at once,
   so every screen had ~130px of pure blank scroll space between its last element and the nav —
   confirmed live: the day's "Bu günü alışveriş listesine ekle" CTA sat with a huge gap below it
   instead of resting near the nav. Fix: dropped `pb-32` from `App.tsx`; the spacer alone is
   sufficient clearance.
2. **Macro progress rings unreadable (fixed).** [`MacroSummaryCard`](../src/components/MacroSummaryCard.tsx)'s
   `MacroRing` SVGs were 22px with a 2.5px stroke — at that size the ring read as a colored dot,
   not a progress indicator, on a real device. Enlarged to 32px / 3.5px stroke, gave the tile
   more breathing room (`p-2` → `p-2.5`), and restacked the total/remaining numbers so the larger
   ring doesn't crowd them.
3. **Icon-button touch targets too tight (fixed).** `MealItemCard`'s edit/shopping-cart/remove
   icon row and the `FoodSearchModal`/`RecipeSearchModal` header close (X) buttons used `p-1`
   (~24px target) with no hover affordance. Bumped to `p-2` with a `hover:bg-accent` rounded
   background so each button reads as a distinct tappable region, not just a bare icon glyph.
   Also gave `FoodSearchModal`'s close button an `aria-label` it was missing.
4. **Bottom nav's active tab was color-only (fixed).** The only signal for the active tab was a
   text-color swap (`text-muted-foreground` → `text-primary`) — easy to miss at a glance,
   inconsistent with every other tab surface in the app, which uses the Smooth Pill
   background-pill convention (see `CLAUDE.md` § UI patterns). Reused that same convention here
   (`sp-trigger` marker + `data-active`) so the active tab now gets a `bg-accent` pill with the
   shared signal-tinted shadow, matching the Liste/Geçmiş tabs' visual language instead of
   inventing a new one.

## Reviewed, no change made

- **Settings action rows** ("Çıkış Yap" / "Hesabı Sil") looked like bare text in a screenshot,
  but `SettingsView.tsx` already gives them `px-4 py-3` — touch target is fine, it's a hover-only
  background that just doesn't show in a static screenshot.
- **Onboarding step's "İleri" button gap** (`OnboardingQuickSetup.tsx`, `min-h-[70dvh]
  flex-col justify-between`) is a deliberate fixed-height wizard shell so the CTA doesn't jump
  between steps of different content heights. Confirmed this is intentional, not a leftover
  spacing bug — left as-is.
- **Shopping list's empty space below a short list** is just sparse test data (2 items), not a
  layout issue.

## Follow-up (same day, from real-device screenshots on Arduvaz)

The user tested the branch on a real phone (dark/Arduvaz theme) and flagged three more things,
all fixed and re-verified live in both themes:

5. **Macro rings looked flat, not "digitalized."** Enlarged again (32px → 40px, stroke 3.5 → 4.5)
   and gave each ring a faded color-mix disc backdrop (`color-mix(in oklab, ${color} 12%,
   transparent)`) instead of sitting bare on the tile background — reads as a lit badge/indicator
   now instead of a thin colored line. Checked the North Star mockup
   (`public/mockups/grocery-ui-options.html`) for a reference pattern first; it only has bar
   meters, no circular rings, so this was an original treatment rather than a borrowed one.
6. **Bottom nav active tab was nearly invisible on Arduvaz.** The `bg-accent` pill from the first
   pass used `--color-accent: #1a222e` on Arduvaz, which sits almost on top of
   `--color-background`/`--color-card` (#0a0e14/#121822) — real but nearly imperceptible contrast.
   Switched the active tab to `bg-signal/10 text-signal` (icon + label both take the signal
   color), consistent with how the rest of the app already uses `--color-signal` for
   "active/selected" state (the shopping-tally fill, checked-item counts). This is
   theme-independent by construction — signal is `#d8402f` on Nane and `#4f8cff` on Arduvaz, both
   high-contrast against their own neutral background — confirmed visibly correct in both themes.
7. **Settings screen felt unfinished** — flat list items floating directly on the page background
   with a large empty void below, unlike every other screen in the app which wraps content in
   `rounded-lg border border-border bg-card` cards. Wrapped the Tema/Grup/account-actions sections
   in that same card treatment for consistency; this also reduces the perceived dead space since
   the sections now carry their own visual weight instead of reading as a half-finished list.

## Follow-up 2: macro-cap status icons/colors

Direct feature request: show a status signal on each macro ring once its daily target is reached
or exceeded, instead of just filling to 100% and stopping. Implemented in
[`MacroSummaryCard.tsx`](../src/components/MacroSummaryCard.tsx) as four tiers keyed off
`consumed/target` ratio (thresholds are a judgment call, not a nutrition guideline):

| Ratio | Icon | Color | `+value` text |
|---|---|---|---|
| < 1.0 | none (ring still filling) | — | default muted |
| 1.0 – 1.1 | check | green `#22c55e` | default muted |
| 1.1 – 1.25 | check | yellow `#eab308` | default muted |
| 1.25 – 1.5 | triangle | amber `#d97706` (Karşılaştır tab's existing "higher value" tint) | amber |
| ≥ 1.5 | triangle | red (`--color-destructive`, theme-aware) | red |

**Found and fixed a real bug while building this.** `MacroSummaryCard`'s `remaining` prop was
actually being fed the day's *consumed* totals from both live callers (`MealPlanView`,
`MealTrackingView`) — not remaining budget. The ring's fill math (`consumed = target - remaining`)
assumed the opposite, so on an over-target day the "consumed" it computed went negative, clamped to
0, and the ring rendered empty instead of full — exactly the "rings look wrong" symptom in the
screenshot that prompted this request (2470 target, 3019 actually eaten, ring showing almost
nothing). Renamed the prop to `consumed` end-to-end and fixed the ring math to `percent =
consumed/target` (clamped to 1 for the visual fill; the unclamped ratio drives the status tiers
above). Verified live by adding real food items to push each macro through all four tiers
one at a time (confirmed via computed `style` color, not just visual read, since the yellow tier's
icon sits next to carbs' own green ring and can look similar at 14px in a screenshot).

## Follow-up 3: quick device-testing round

Three more concrete fixes from live phone testing:

8. **Meal-item quantity edit's Tamam/İptal buttons too small.** They were `px-2 py-1` at 10px
   font — easy to miss-tap, which read as "Escape doesn't work" (there's no hardware Escape key
   on mobile to begin with; the desktop `onKeyDown` handler for it was always there and still
   works, but on a touch device the tappable İptal button *is* the escape, so its size is what
   actually matters). Bumped both to `px-3 py-1.5` at 12px font, matching the icon-button sizing
   from the first pass.
9. **Theme switch track on Arduvaz was the wrong color.** Its "on" state used `bg-foreground/85`,
   and `--color-foreground` is a light near-white *in Arduvaz* — so toggling into dark mode drew
   a bright, near-white track on an otherwise dark settings page. Switched the "on" track to
   `bg-signal/25`, which is already theme-aware in the right direction (red-tinted on Nane,
   blue-tinted on Arduvaz), and enlarged the whole control (`h-8 w-14`/`size-6` knob → `h-9 w-16`/
   `size-7` knob) since it read as small for a settings-page control.
10. **Shopping list's "Ürün ekle" suggestion panel stayed open after adding an item.** `commit()`
    cleared the input but never closed the panel, so it immediately re-populated with the full
    "en çok alınan" list — on a short list that ate most of the visible screen and felt stuck.
    Fixed by closing the panel on commit while leaving the input focused (so a fast multi-item
    add can keep typing), and reopening it from `onInput` the moment a character lands — the idle
    "most bought" list no longer reappears uninvited, but live search-as-you-type is unaffected.

## Follow-up 4: swipe-down-to-close on bottom sheets

Scoped version of a feature request inspired by the native mobile image-preview sheet (swipe down
to dismiss, no gesture library, CSS-only touch tracking). Added to `FoodSearchModal`,
`RecipeSearchModal`, and `MealNutritionDetailSheet`:

- New [`useSwipeToDismiss`](../src/hooks/useSwipeToDismiss.ts) hook: tracks `touchstart`/
  `touchmove`/`touchend` on a small handle element, follows the finger 1:1 (no transition while
  actively dragging, so it doesn't lag), and calls the dismiss callback if released past a 90px
  threshold; otherwise snaps back with the existing entrance-animation transition.
- New [`SheetDragHandle`](../src/components/ui/sheet-drag-handle.tsx) component: the grabber-bar
  visual (a small rounded pill, matching the native convention) plus the touch target — scoped to
  just that strip, not the whole sheet, so it doesn't hijack scrolling the results list or the
  nutrition-detail content underneath it.
- Swipe-up-to-expand-fullscreen (the other half of the native pattern) was explicitly left out of
  this pass — it needs meaningfully more state (partial/full/closed, resistance at the top edge)
  for a payoff that's real but secondary to the dismiss gesture.

Verified: builds clean, the handle renders correctly on all three sheets, and existing
click-based dismissal (backdrop, X button, Escape) all still work unchanged. The actual drag
gesture itself could not be verified in this environment — synthetic `TouchEvent` dispatch in a
headless browser doesn't reliably reach Preact's touch listeners the way a real touchscreen does,
so this needs a check on a real device before being treated as fully confirmed.

## Follow-up 5: tap feedback on mobile (active: alongside hover:)

Direct request: every `hover:` color/opacity/decoration class across the app is invisible on a
touch device (no hover state exists), so buttons and clickable rows gave zero visual feedback on
tap. Added a matching `active:` variant next to every existing `hover:` utility — same value, so
tapping now flashes the identical color/opacity change a mouse user gets on hover, without
touching any `hover:` class itself. Mechanical, codebase-wide: 25 files, 89 insertions via a
one-off script (not left behind — see `CLAUDE.md`'s no-standing-scripts rule), spot-checked and
one class of bug fixed: a handful of buttons already had a manually-added `active:` for the same
value from earlier session work, and the blind insertion duplicated those — found and fixed 4
exact-duplicate spots (`ActiveListRow.tsx`, `CategoriesView.tsx`, `NutritionView.tsx`,
`TenantSwitcher.tsx`) before verifying zero duplicates remained across all 25 files. Deliberately
left `group-hover:`/`peer-hover:` and the existing `[@media(pointer:fine)]:`-gated hover reveals
(`TenantSwitcher`'s row-action icons) untouched — those are already scoped to fine-pointer devices
on purpose and don't need a touch equivalent.

## Follow-up 6: macro ring visual polish ("more elegant"), a structural rebuild, then reverted

First pass refined `MacroRing` in `MacroSummaryCard.tsx` for finish rather than size/status: a
two-stop SVG gradient on the arc, a soft color-tinted `box-shadow` glow replacing the hard outer
border, and the status icon moved into its own small `bg-card` plate.

The user then asked for a structural change: the progress indicator redrawn as a literal "strip
bent into a ring" — an SVG `<path>` computing both an outer and inner arc, stroked in the metric's
full-strength color around its entire perimeter and filled with a pale tint of that color, on top
of a plain thin track circle. Built and verified at multiple fill levels (a small sliver, ~50%,
full/over-target) in both themes. A follow-up ask to further "make it more elegant" led to adding
small rounded-corner fillets to that band shape (quadratic-curve corner trims, since the band's
four corners are all local right angles).

After testing live, the user preferred the original gradient-stroke version over the whole
band/fillet direction and asked to revert. Reverted `MacroRing` to the first-pass gradient-stroke
version exactly — confirmed via an identical build output hash for the resulting CSS bundle before
and after. The band-shape/fillet code (`ringSegmentPath`, `pointOnCircle`) was removed entirely,
not just unused — no dead code left behind.

## Follow-up 7: full-app pass (Meal Plan + every other screen + boot skeleton)

Direct request to re-audit the Meal Plan page, then extend to every other screen and the boot
skeleton. Reviewed live via `npm run vercel:dev` + Playwright at 390×844, in both themes.

**Clean, no change needed:** Meal Plan (macro card, meal-slot cards, evening-suggestion cards in
default/"Hazırlanıyor"/eaten states, the full Yedim → eaten-flip → Geri al round trip, day-nav
gating), Alışveriş (Liste + Geçmiş), Besin Değerleri (Tümü + Kategoriler layout itself +
Karşılaştır), Kişisel Plan, Ayarlar, and `AppBootSkeleton` (`App.tsx`) — its per-section shape
(Alışveriş/Yemek/shared Besin-Kişisel-Ayarlar) matches the real layout correctly in both themes,
confirmed by catching it live on cold navigation rather than just reading the source.

Two real issues found and fixed:

11. **Category names truncating on mobile** (`CategoriesView.tsx`, Besin Değerleri → Kategoriler).
    Root cause: the row had *two* `flex-1` elements — the label span and a leftover spacer `<div
    className="flex-1" />` meant to push the eye/hide button to the row's end. The label's own
    `flex-1` already does that by itself once it's the last flexible element before fixed-width
    siblings, so the spacer was redundant and was splitting the row's remaining width 50/50
    between itself and the label instead of giving it all to the label. Removed the spacer and
    tightened the row gap (`gap-2` → `gap-1`). Confirmed live: "Meyve & Sebze", "Balık & Deniz
    Ürünleri", "Fırın & Pastane", "Baharat & Çeşni", "Hazır & Konserve", "Kuruyemiş & Tohum" all
    render in full at 390px now, previously truncated to "Meyve & ...", etc.
12. **Fiber target showing a fake range** (`PersonalPlanView.tsx`'s `TargetSummary`). The daily
    fiber target is minimum-only (`fiberG.min`/`fiberG.max` in `mealPersonalization.ts` both derive
    from the same kcal-based value once it clears both floors), so at common calorie targets it
    rendered as "35-35 g" next to a "minimum" label instead of a real range like the other macro
    cards. Fixed at the display layer only (the underlying min/max calculation is untouched): show
    a single value when `min === max`, the range otherwise.

Also found, not a UI bug: a leftover eaten "Dana kıyma ve pirinç" entry sitting in the real
household's Son Öğün from an earlier live-verification session that was never undone — test
pollution in real data, not a code issue. Cleaned up via the card's own "Geri al" and confirmed
Son Öğün reverted to its actual state.

## Deferred / worth a follow-up look

- **`UndoToast`** (`fixed bottom-0 mb-5`) is positioned independent of the bottom nav's height and
  wasn't verified live against the nav in this pass (no undo action was triggered during testing).
  Worth confirming it doesn't sit under/behind the nav bar on a future pass.
- Broader color palette ("general feel") beyond the nav's active-state fix wasn't found to have
  a concrete issue — the app's tokens (`src/index.css`) already passed the WCAG contrast pass
  from the prior round. If there's a specific screen that still feels off, point it out with a
  screenshot for a targeted pass rather than a blanket palette change.

## Files changed

`src/App.tsx`, `src/components/MacroSummaryCard.tsx`, `src/components/MealItemCard.tsx`,
`src/components/FoodSearchModal.tsx`, `src/components/RecipeSearchModal.tsx`,
`src/components/BottomNavigation.tsx`, `src/components/SettingsView.tsx`.

Build verified (`npm run build`, clean). Not yet committed — on branch `audit/ui-polish-pass-2`,
left for manual review/testing before commit per standing instruction.

Follow-up 7 additionally touched `src/components/CategoriesView.tsx` and
`src/components/PersonalPlanView.tsx` — committed and merged to `master` directly (BCMP), `tsc -b`
clean.
