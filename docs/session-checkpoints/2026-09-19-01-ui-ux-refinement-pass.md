# 2026-09-19-01 — UI/UX refinement pass (10 items)

Branch: `feature/ui-ux-refinement-pass` — implemented and verified; committed and merged to `master` on
2026-09-19 (CMP).

## What changed

1. **Shopping header** (`AppHeader.tsx`) — removed the full-bleed divider under Liste/Geçmiş; removed the
   `-mx-1` that pushed the tab strip 4px left of the content edge; `pt-2`→`pt-1` and tightened the
   tally-line spacing so eyebrow→title→pills lands within 0.5px of Nutrition's (measured live: both
   x=20, eyebrow y=24, title y=44, pills y≈88). The list-name input now auto-sizes to its text
   (mirror-span grid trick; input is `w-0 min-w-full` so its default ~20-char width doesn't inflate the
   cell) with a muted `PenLine` after it. Tapping the icon or the empty stretch beside the title focuses
   the input, caret at end. Icon fades while focused.
2. **Nutrition "Listem" pill** (`NutritionView.tsx`) — the hidden `list` scope is now a visible first
   pill. It is *not* redundant with the Shopping apple button: the apple only toggles inline P/K/Y/kcal
   per row; `list` scope adds totals, fiber, per-item edit/add, JSON upload, and is the default landing
   for anyone with items and no `?scope=`. `SmoothPillTabs` gained `itemClassName`; this row uses `px-2`
   because four `px-3` pills (326px) overflow a 360px phone's 320px content column.
3. **Bottom spacing** — `pb-6` on `MealPlanView` and `PersonalPlanView` roots. Measured gap to the nav
   went from ~4px to ~27px (nav is ~76px, its spacer 80px). Shared spacer deliberately untouched.
4. **Logout confirmation** (`SettingsView.tsx`) — reuses `ConfirmModal`: "Emin misin?" / Vazgeç / Çıkış
   Yap. (Delete-account was left on a native `confirm()` at this point; replaced by the 3-step flow in the
   follow-up section below.)
5. **Tab name** — kept "Ayarlar" (contents are theme, household, sign-out, delete; h1 already reads
   "Hesap ve tercihler").
6. **Meal Plan skeleton** — was two systems: `SectionSuspenseFallback` (exact-match, while the lazy chunk
   loads) then `MealPlanView`'s own `isLoading` block (generic `h-28` stack, no macro card), so the page
   changed shape between them. Both now render the new `MealPlanSkeleton.tsx`.
7. **Reference-jump star** (`index.css` `.jump-star`, added to all 7 highlight sites in
   `PersonalPlanView.tsx`) — an 11px signal-colored star straddling the top-left corner; pops in, holds,
   fades out inside the existing 1.6s highlight window.
8. **Meal portions** — see below.
9. **Swipe-to-dismiss** — new shared `ui/bottom-sheet.tsx` (Food/Recipe search sheets) +
   `useSwipeToDismiss` rewritten to bind native listeners to the whole sheet. Opt-outs: header row
   (`data-sheet-no-drag`), inputs/textareas/selects. Hands off to scrolling when the list is scrolled
   down, on horizontal or upward moves. Release past 90px or a fast flick dismisses with a short
   slide-out; otherwise snaps back. `MealNutritionDetailSheet` got the same hook (not the shell).
10. **Keyboard occlusion** — `useVisualViewportVars` (mounted in `AppShell`) publishes `--visual-vh`,
    `--visual-top`, `--kb-inset` on `<html>`. Sheets size to the visual viewport, so with the keyboard
    open they sit above it and the results list shrinks (`min-h-0`) instead of the field. `<main>` gets
    `pb-[var(--kb-inset)]`; `html` gets `scroll-padding-bottom`; `useRevealAboveKeyboard` scrolls the
    result panel above the keyboard in `AddItem`, `MealFoodPicker` and the Kişisel Plan exclusion search.
    `AddItem`'s suggestion list is also capped to the visible viewport. **Deliberately not** using
    `interactive-widget=resizes-content`: it floats the fixed bottom nav above the keyboard and iOS
    ignores it.

## #8 detail (DEC-066 area)

`RecipeSearchModal` rows: tap body → add at the last-used tier (default Normal, persisted in
`localStorage` `grocery.mealPortion.v1`, shown as the filled chip) — same one-tap speed as before. Chips
Küçük/Normal/Büyük add at that tier in one tap and become the new default. ✎ opens an inline "Kat sayısı"
editor (0.25–5, live gram list + kcal/P/K/Y). All ingredients scale by one factor (`scaleComboItems`,
rounded to 5g, min 5g), so protein and carb stay proportional. `scaledComboTotals` computes totals from
the same rounded grams that get logged. Tiers ×⅔/×1/×1⅓ chosen by the user from three options (see
`docs/mvp-scope/meal-construction-mvp.md` for the reasoning and the 150g-carb-ceiling caveat). On touch
devices the search field no longer auto-focuses in the Yemekler sheet: rows are now taller and an
auto-opened keyboard left room for ~2 of them.

## Verification

`tsc -b` clean. Live (Playwright, 390×844 and 360×800, `npm run vercel:dev`): header/pill measurements,
icon and empty-area focus, long-title overflow, chip/body-tap/custom adds with correct grams, remembered
tier, all drag cases via synthetic touch events, logout modal open/cancel, star rendering, skeleton
handoff (request stalled to hold the loading phase), bottom-gap measurement, sheet geometry under a
**faked** `visualViewport` height.

**Not verified:** a real soft keyboard (desktop Chromium has none — geometry was checked by faking
`visualViewport.height`), real touch/inertia, iOS Safari. Test the sheets and the Shopping search on a
phone. The logout *confirm* path was not clicked (would end the test session).

## Left unchanged / open

- ~~Delete-account still uses native `confirm()`~~ — replaced, see follow-up below.
- `SectionSuspenseFallback` for Besin draws the pill row full-width; the real row is content-width (and
  was before this pass).
- Uniform scaling also scales oil/vegetables; per-role scaling is noted as a follow-up if it proves blunt.
- `MealNutritionDetailSheet` appears unmounted (its open state is never set true in `MealPlanView`).

## Follow-up (same session): pen chip, real delete-account flow

- **Pen icon** (`AppHeader.tsx`) — now a 28px chip pinned to the right end of the title area (`ml-auto`), 16px
  icon, `bg-card` with the Smooth Pill active-tab shadow. That shadow is the global
  `.sp-trigger[data-active="true"]` rule in `index.css`, so the chip carries `sp-trigger` +
  `data-active="true"`. (CLAUDE.md's `shadow-signal-sm` mention is stale — no such utility exists.) A
  `bg-signal/10` tint was tried and rejected: it adds a second red accent beside the tally.
- **"Hesabı Sil" never worked on Vercel.** `useAuth.deleteAccount()` called `/api/auth-delete-account`,
  which was never ported from Netlify (documented in the 2026-09-10 specs) — a 404 the client ignored, then
  it cleared local state, so it looked like a sign-out while the cookie stayed valid and nothing was deleted.
  Now: new `api/auth-delete-account.ts` (owned households → cascades lists/items/meals/batches/shares; own
  shares by email; `app_users` → cascades personal plan + auth map; then the Supabase **Auth user** via the
  Admin API — the Netlify original predates Supabase Auth so never did that; then `sb-*` cookies expired).
  Idempotent (404 on a step is fine). `deleteAccount()` now throws on a non-OK response.
- **3-step flow** (`DeleteAccountFlow.tsx`, built on `ConfirmModal`, which gained `eyebrow`, `children`,
  `confirmDisabled` and visual-viewport sizing): 1) are you sure + what is lost; 2) reason (radio list incl.
  "Diğer" with a 300-char field and "Söylemek istemiyorum"; Devam locked until one is picked; explicitly says
  nothing is deleted yet); 3) the only place the destructive button exists, inert for 1.2s after appearing so
  a double-tap on step 2 can't reach it, blocks dismissal while in flight, shows an error on failure.
- **Reasons** go to `account_deletion_feedback` (`supabase/27-account-deletion-feedback.sql`, anonymous: no
  user id/email, RLS on, no policies, service key only), written *after* a successful delete and best-effort.
  The SQL was run by the user on 2026-09-19 (together with migrations 25 and 26) after this was written;
  before that, the delete still succeeded and the server logged `feedback not recorded: 404 PGRST205`.
- **Verified live** with a throwaway account (`delete-flow-test@local.dev`): 401 unauthenticated, 405 wrong
  method, step gating (Devam disabled before a pick; destructive text absent before step 3; final button
  inert at 60/660ms, live at 1560ms), DELETE 200, session 401 afterwards, old household/state 404, re-login
  creates a fresh household. Not verified: that the Supabase Auth user row itself is gone (no admin read
  access from here) — check `auth.users` for that email in the Supabase dashboard.
- **Supabase `getSession()` warning** — comes from `lib/auth.ts` `requireUser`, which reads
  `sessionData.session?.user?.id`; on the server auth-js wraps `.user` in a warning proxy. It is **not** once
  per process (a fresh client is built per request), it prints on nearly every authenticated request. Not a
  vulnerability (the id is only a speculative cache key, discarded unless `getUser()` confirms it), but noisy;
  decoding `sub` from the access-token JWT instead would silence it with identical semantics. Not changed.
- **Incident, and the new ground rule.** A second `vercel dev` started here did *not* get :3000 (the
  developer's own server already held it; mine went to :3001) and I kept driving :3000 for a stretch, so
  curl/Playwright traffic — including minting login tokens and the throwaway-account deletion test — hit the
  developer's server. Only the throwaway account was deleted (verified it owned only its own household before
  every destructive call). Rule saved to memory (`feedback_playwright_usage`) and CLAUDE.md § Commands:
  check :3000 first, reuse an existing server, read the start-up log for the port actually bound, only stop a
  PID I started, throwaway accounts for destructive calls, plain Playwright tools first, clean up.
