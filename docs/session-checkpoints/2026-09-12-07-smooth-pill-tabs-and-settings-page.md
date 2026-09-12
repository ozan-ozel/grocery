# 2026-09-12-07: Smooth Pill tab system, dedicated Settings page, layout cleanup

**Date:** 2026-09-12
**Branch:** `refactor/smooth-pill-tabs-settings-layout` → `master` (merged)
**Status:** ✅ Complete

## Summary

A UI-polish session driven by screenshot comparisons against a reference design. Standardized
every tab group in the app on one named style ("Smooth Pill"), extracted it into a reusable
module, converted the Settings bottom-sheet modal into a real page, removed several pieces of
dead tab-routing code discovered along the way, and trimmed the top padding stacked above every
main-tab screen.

## Changes Made

### New: Smooth Pill (SP) tab pattern
#### [src/components/ui/smooth-pill.tsx](../../src/components/ui/smooth-pill.tsx)
- `<SmoothPillTabs>` — plain-button tab group for anywhere not already wired to a Radix `Tabs`
  root (used by `NutritionView.tsx`'s scope toggle).
- `SP_CONTAINER_CLASS` / `SP_BASE_CLASS` / `SP_ACTIVE_CLASS` / `SP_INACTIVE_CLASS` /
  `SP_TRIGGER_CLASS` — shared class constants for a Radix `TabsTrigger` that must also drive a
  `Tabs` root elsewhere (used by `AppHeader.tsx`'s Liste/Geçmiş tabs).
- Style: light `bg-accent/50` container, active tab as its own `bg-background` pill, inactive
  tabs as plain `text-muted-foreground`. Recovered from git history (commit `97c0ff0`,
  2026-08-28) — it's the actual origin of the reference screenshots the user was comparing
  against.
- `SP_TRIGGER_CLASS` explicitly cancels the base `TabsTrigger`'s default
  `border-b-2`/`data-[state=active]:border-foreground` underline (from
  [src/components/ui/tabs.tsx](../../src/components/ui/tabs.tsx)), which otherwise draws a dark
  line through the pill background.

### Fixed: active-tab shadow silently doing nothing on Radix tabs
- Root cause: the shadow was a hand-written `.shadow-signal-sm` class inside `@layer utilities`
  in [src/index.css](../../src/index.css). That works fine applied directly (plain-button tabs,
  boolean JS class toggle) but Tailwind v4 does not generate a variant like
  `data-[state=active]:shadow-signal-sm` for a class that wasn't declared via `@utility` —
  so on `AppHeader.tsx`'s Radix-driven tabs the shadow class was present in the DOM but produced
  no CSS rule at all.
- Fix: moved the shadow off the Tailwind-class system entirely into one global CSS selector,
  keyed off a shared `.sp-trigger` marker class plus whichever active-state signal the element
  actually carries — Radix's native `data-state="active"`, or a manually-set `data-active="true"`
  on the plain-button variant:
  ```css
  .sp-trigger[data-state="active"],
  .sp-trigger[data-active="true"] {
    box-shadow: 0 1px 2px 0 color-mix(in oklab, var(--color-signal) 22%, transparent);
  }
  ```
  Every future SP tab gets this for free just by using `SP_BASE_CLASS`/`SP_TRIGGER_CLASS` or
  `<SmoothPillTabs>` — no per-usage variant composition to get wrong again.

### Removed dead tab-routing code
- **`Kategoriler` sub-tab under Alışveriş** — categories view had already moved to Besin
  değerleri's `CategoriesView`; the Alışveriş trigger had no corresponding `TabsContent` left in
  `AppShoppingTabs.tsx` and rendered nothing on click.
- Removed the now-fully-dead `"cats"` value from the `Tab` type and `TABS` list in
  [src/hooks/useUiPrefs.ts](../../src/hooks/useUiPrefs.ts) and from `SHOPPING_TAB_ORDER` in
  `App.tsx`, so a left/right swipe on Alışveriş can no longer land on that blank tab either.

### New: Settings as a real page, not a modal
#### [src/components/SettingsView.tsx](../../src/components/SettingsView.tsx) (new)
- Full-page version of the old `ProfileMenu` bottom-sheet: theme switcher, tenant/group
  switcher, sign out, delete account — styled like `PersonalPlanView`'s header pattern
  (eyebrow label + `h1` + sections) instead of a modal overlay.
- Fixed a latent bug while wiring this through: the old modal always passed
  `currentUserId={null}` to `TenantSwitcher`, so "you" was never actually highlighted in the
  tenant list. `SettingsView` now receives the real `currentUserId`.
- `src/components/ProfileMenu.tsx` deleted — fully superseded, no remaining references.
- `Section` type gained `"ayarlar"` ([src/hooks/useUiPrefs.ts](../../src/hooks/useUiPrefs.ts));
  `NavTab` gained `"settings"` ([src/components/BottomNavigation.tsx](../../src/components/BottomNavigation.tsx)).
- `BottomNavigation.tsx` simplified to a plain 5-button nav bar — no more embedded
  `profileMenuOpen` state or `ProfileMenu` import; the Settings button behaves exactly like the
  other four (`onTabChange`, no special case).
- `App.tsx` renders `<SettingsView>` for `section === "ayarlar"`, passing through the same
  tenant/theme/auth props that used to go to `BottomNavigation`.

### Layout: consistent top spacing, no more empty header shell
- Root cause: `AppHeader` rendered a mostly-empty shell (sync icon slot + filler div + border
  line) for Besin değerleri/Kişisel Plan, while Yemek Planı had no header at all — so each main
  tab started at a different vertical offset, with Besin/Kişisel wasting real space on
  boilerplate that had no actual content.
- Fix:
  - Moved the sync/offline indicator out of `AppHeader` into `App.tsx`, rendered once above
    every section, occupying **zero height when synced**.
  - `AppHeader` now returns `null` for every section except `"alisveris"` — the only one with
    real header content (title, tally, tabs) — instead of rendering empty boilerplate for the
    others.
  - Trimmed the stacked top padding: page container `py-6` → `pt-3`, `<main>` `pt-5` → `pt-3`,
    `AppHeader`'s own `pt-6` → `pt-2`.
  - Net effect: all main tabs (Alışveriş, Besin değerleri, Yemek Planı, Kişisel Plan, Ayarlar)
    now start from the same top margin, and there's noticeably less dead space above the fold.

### Other small fixes
- `BottomNavigation.tsx`: removed `hidden sm:inline` from all 5 tab labels (and the old
  "Ayarlar" button) so names always show under their icons, not just on wider screens.
- Sync indicator: removed `animate-spin` from the `RefreshCw` icon — it still appears/disappears
  under the exact same sync/offline conditions, just without the spin animation.

### Documentation
#### [CLAUDE.md](../../CLAUDE.md)
- New "UI patterns" section documenting Smooth Pill (SP): what it is, where the reference
  implementations live, and the two gotchas discovered this session (Radix's default underline
  needs cancelling; a hand-written Tailwind utility class needs `@utility`, not `@layer
  utilities`, to support a variant — worked around here with a global CSS rule instead).

## Build Status

- ✅ TypeScript: `tsc -b` passes
- ✅ Vite build: successful throughout (each step verified independently)
- ⚠️ Not exercised in a live browser this session — verify Ayarlar page, all 5 main tabs' top
  spacing, and the Liste/Geçmiş active-tab shadow in `npm run vercel:dev` before considering this
  fully done.

## Notes / follow-ups

- `readSectionFromUrl`/`writeSectionToUrl` in `lib/store.ts` are generic string passthroughs, so
  adding `"ayarlar"` needed no changes there — only `useUiPrefs.ts`'s `initialSection()` switch.
- If a future tab group needs the Smooth Pill look, prefer `<SmoothPillTabs>` (plain buttons) —
  reach for the `SP_*` class constants directly only when the tab must also drive an existing
  Radix `Tabs` root.

---

**Co-Authored-By:** Claude Sonnet 5 <noreply@anthropic.com>
