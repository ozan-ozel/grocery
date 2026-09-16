# Lazy-load App sections (perf: first-load bundle size)

_2026-09-16 — branch `refactor/lazy-load-app-sections`_

## Problem

Performance analysis of first-load time found the production build emits one 667 KB JS bundle
(141 KB gzipped) with no code-splitting. `App.tsx`'s `AppShell` eagerly imports all five mutually
exclusive sections (`AppShoppingTabs`, `NutritionView`, `MealPlanView`, `PersonalPlanView`,
`SettingsView`) even though only one renders at a time — every visitor downloads and parses all
five before the default shopping-list view paints. Confirmed via `npm run build` output (Vite's
own >500 kB chunk warning) and reading `src/App.tsx`'s section-routing branch.

Two secondary findings from the same analysis, not part of this branch's scope:
- Fully sequential boot waterfall (auth-session → tenants → list-sync pull).
- `useFoodCatalog()` fetches the full ~1000-row nutrition catalog unconditionally on every mount,
  regardless of which section is open.

## Plan (this branch)

Route-split the four non-default sections with `lazy()`/`Suspense` (available via
`preact/compat`, which this project already aliases React onto — see `vite.config.ts`):

1. Convert `NutritionView`, `MealPlanView`, `PersonalPlanView`, `SettingsView` imports in
   `src/App.tsx` to `lazy(() => import(...))`.
2. Wrap the section-routing branch in `<Suspense>` with a fallback that reuses the existing
   `AppBootSkeleton`/section-skeleton pieces already in `App.tsx`, so a section switch shows the
   same loading language instead of a blank gap.
3. Leave `AppShoppingTabs` (the default/shopping section) as a static import — it's the landing
   view for most sessions per North Star, so splitting it out would just move the "pay upfront"
   cost rather than remove it.
4. Verify with `npm run build`: confirm the main chunk shrinks and four new lazy chunks appear.
5. Manually exercise all five sections via `npm run vercel:dev` to confirm no regression in
   section switching (no flash of unstyled skeleton, no lost state on tab return).

Out of scope for this branch: the sequential-fetch waterfall and the unconditional nutrition
catalog fetch (items 2–3 of the original analysis) — flagged as possible follow-ups, not started.

## Implementation notes

- Converted `NutritionView`, `MealPlanView`, `PersonalPlanView`, `SettingsView` in `src/App.tsx`
  to `lazy(() => import(...).then(m => ({ default: m.X })))` — all four are named exports, so each
  needed the `.then()` default-export shim. Wrapped each section's JSX in its own `<Suspense>`
  with `BootSkeletonBody({ section })` as fallback (already existed for the boot skeleton).
- Found and fixed a chunk-merge blocker: `OnboardingQuickSetup.tsx` statically imported `Field`/
  `NumberInput` from `PersonalPlanView.tsx`, and `OnboardingQuickSetup` itself is imported
  statically in `App.tsx` — this pulled the entire `PersonalPlanView` module (including
  `SourceBadge`) back into the main chunk regardless of the `lazy()` wrapper (Vite's build flagged
  this explicitly). Fixed by extracting `Field`, `NumberInput`, `SourceBadge` into a new shared
  module, `src/components/PersonalPlanFields.tsx`, imported by both `OnboardingQuickSetup` and
  `PersonalPlanView`.

## Result

`npm run build` output:
- Before: one `index-*.js` at 667 KB (141 KB gzip).
- After: main chunk 564 KB (115.6 KB gzip) + four on-demand chunks —
  `NutritionView` 29 KB, `MealPlanView` 41 KB, `PersonalPlanView` 23.5 KB, `SettingsView` 12 KB
  (gzipped: 8.2 / 12.1 / 6.9 / 3.7 KB respectively). These now only download when a user actually
  opens that section.
- `tsc -b` passes clean.

Manually verified via `npm run vercel:dev` (the user's already-running dev server on :3000,
agent-login redeem flow) + Playwright: clicked through all five sections (Alışveriş, Besin
Değerleri, Yemek Planı, Kişisel Plan, Ayarlar) including the `OnboardingQuickSetup` wizard path —
zero console errors, all four lazy chunks rendered their real content correctly.

## Status

Done, not yet committed — implementation verified, awaiting user's own commit per standing
no-auto-commit preference.

## Out of scope / follow-ups noted, not started

- Sequential boot waterfall (auth-session → tenants → list-sync pull).
- Unconditional `useFoodCatalog()` fetch in `AppShell` regardless of active section.
- Main chunk is still 564 KB — further wins would need splitting shared deps
  (`@supabase/supabase-js`, Radix, `AppShoppingTabs`) via `manualChunks`, not attempted here.
