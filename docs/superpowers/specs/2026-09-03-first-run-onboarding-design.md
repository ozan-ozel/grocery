# First-run onboarding ("Hızlı kurulum") — design

**Status:** implemented (2026-09-03)
**Author:** Ege Özel (with Claude)
**Date:** 2026-09-03
**Context:** Follow-up to the 2026-09-01 [Kalan Makrolar Birleşik Roadmap](https://linear.app/nutrition-grocery-planner/document/urun-yol-haritasi-kalan-makrolar-birlesik-roadmap-c917755d08f2)
doc, §05 open item "Onboarding: Kişisel Plan'ın tam klinik formu yerine hızlı varsayımla ilk
değeri hemen göster." Not yet tracked as its own NUT issue — create one alongside the
implementation plan.

## Problem

The app now opens on "Bugün" (per [NUT-46](https://linear.app/nutrition-grocery-planner/issue/NUT-46)'s
MVP), and Bugün's entire value proposition — remaining daily macros and matching meal
suggestions — depends on a filled-in `Kişisel Plan` profile. A brand-new user instead sees a
static message ("Bugün için önerilerin olsun diye önce Kişisel Plan'ını doldurman gerekiyor")
with no link or button to act on it. If they do find their way to Kişisel Plan, the first thing
they see is the full clinical form: profile name, age, height, weight, an expandable section
for equation sex / waist / activity / goal, an exclusion-food picker, a "Nasıl hesaplanıyor?"
methodology panel, and a sources panel. Nothing in this path is broken — `useMealPersonalization`
already has a `DEFAULT_PROFILE` fallback and a `hasSavedProfile` flag distinguishing "real
profile" from "unfilled defaults" — but nothing surfaces a fast path to a first real number.

## Non-goals

- **Redesigning Kişisel Plan itself.** The full form stays exactly as-is, as the place to
  refine waist, exclusions, profile name, or revisit any quick-setup answer later.
- **A household-level welcome/tour.** Kişisel Plan is per-user (a household can have multiple
  members with independent targets), so this onboarding is scoped to "this signed-in user has
  never set a profile," not "this household is new."
- **Cross-device skip sync.** Skipping is device-local for v1 (see Data model below) — skipping
  on one device and opening the app on another re-prompts once. Acceptable v1 gap, not solved
  here.
- **A separate welcome/value-prop screen.** Per the research below, the quiz starts immediately
  — no extra screen to click through first.

## Research basis (see chat log for full citations)

- Short (3–7 step), skippable flows with visible progress get 60–80% completion; long or
  non-skippable intake forms regularly fall below 40%. Forcing onboarding without a skip path
  is a named anti-pattern.
- For goal-based/personalization apps specifically (Noom, Fabulous), a short *guided quiz*
  outperforms a passive form — each question reads as purposeful ("this shapes your plan"),
  which the existing single-scroll form doesn't communicate. The failure mode isn't asking
  questions, it's asking too many of them without visible purpose.
- Conclusion applied here: a short, skippable, step-by-step flow — the middle path between a
  blocking wizard and a passive inline card.

## Users and success criteria

- A signed-in user who has never saved a `Kişisel Plan` profile sees a 4-step quick-setup
  overlay the first time the app loads, regardless of which tab/section they land on.
- Each step asks for one thing (or one tightly-related group): (1) yaş/boy/kilo, (2) denklem
  seçimi, (3) günlük aktivite, (4) hedef — all pre-filled with today's `DEFAULT_PROFILE`
  values so "tap through without typing" is a valid, fast path.
- "Atla" is reachable from every step. Skipping is permanent (until the user opens Kişisel Plan
  themselves) — it does not re-prompt next session.
- Completing the flow writes through the same `update()` calls `useMealPersonalization` already
  exposes, so Kişisel Plan (opened later) shows these answers pre-filled, not a second copy of
  the data.
- After skip, Bugün shows real numbers computed from `DEFAULT_PROFILE`, visibly marked as
  estimates — not the old blocking message. A user should never see a dead end with no numbers
  and no path forward.
- No new failure modes: reuses the existing best-effort `localStorage` pattern and the existing
  debounced Supabase save path for the profile itself.

## Architecture

```
AppShell (App.tsx)
    │
    ├─ useOnboarding(userId) ──────────────► onboarding status: "unseen" | "skipped" | "completed"
    │                                         (localStorage "skipped" flag, device-local;
    │                                          "completed" is derived from hasSavedProfile,
    │                                          which already syncs to Supabase)
    │
    ├─ <OnboardingQuickSetup>  ── shown only when status === "unseen", overlays whatever
    │      (new component)          tab/section is active underneath
    │      writes via the same useMealPersonalization(userId).update() the
    │      Kişisel Plan form already calls — no second profile-storage path
    │
    └─ <Tabs> ... (unchanged) ...
             │
             ▼
       TodayView → useRemainingToday(userId, householdId)
             │
             └─ "ready" status gains `isEstimated: boolean`
                (true when hasSavedProfile is false but a skip has happened —
                 replaces the old "no-profile" blocking status)
```

## Components

**`useOnboarding(userId)`** (new hook, `src/hooks/useOnboarding.ts`)
- Reads/writes a device-local `localStorage` key `grocery.onboarding.v1:<userId>` holding
  `"skipped"` once the user explicitly skips. Same pattern as `theme`/`swipeMode` in
  `src/lib/preferences.ts` — best-effort try/catch, no throw on unavailable storage.
- Derives the actual tri-state exposed to callers:
  - `hasSavedProfile` (from `useMealPersonalization`) → `"completed"`
  - else the stored `"skipped"` flag → `"skipped"`
  - else → `"unseen"`
- Exposes `{ status, skip(): void }`. `skip()` just writes the localStorage flag — it does not
  touch the profile itself, so `DEFAULT_PROFILE`'s existing "never persist the untouched
  fallback" invariant (see `useMealPersonalization.ts`'s comment on identity-equality) stays
  intact.

**`OnboardingQuickSetup`** (new component, `src/components/OnboardingQuickSetup.tsx`)
- Full-screen step overlay (fits the app's existing `max-w-[30rem]` mobile-first shell),
  rendered in `AppShell` alongside `<Tabs>` when `useOnboarding(userId).status === "unseen"`.
- Takes the same `profile`/`update`/`setEquationSex`/`setActivity`/`setGoal` from
  `useMealPersonalization` that `PersonalPlanView` uses — one hook instance, shared via props
  from `AppShell`, not a second instance.
- 4 steps, progress dots, "Atla" visible at every step:
  1. Yaş / Boy / Kilo — three `NumberInput`s (reuse `PersonalPlanView`'s pattern), pre-filled
     from `DEFAULT_PROFILE`.
  2. Denklem seçimi — the same two-option select as today's form.
  3. Günlük aktivite — the same `ACTIVITY_OPTIONS` 5-option select.
  4. Hedef — the same three-option `maintain`/`loss`/`gain` select.
- Finishing step 4 just dismisses the overlay — `hasSavedProfile` is already `true` by then
  (any `update()` call flips it, per existing `useMealPersonalization` behavior), so
  `useOnboarding` re-derives `"completed"` on next render. No explicit "finish" write needed
  beyond what the form fields already do.
- Tapping "Atla" calls `useOnboarding(userId).skip()` and dismisses.
- Note: because `useMealPersonalization` already flips `hasSavedProfile` to `true` the instant
  *any* field is touched (identity-check against `DEFAULT_PROFILE`), a user who adjusts one
  field (say, weight on step 1) and then taps "Atla" on a later step ends up `"completed"`, not
  `"skipped"` — `useOnboarding` re-derives status from `hasSavedProfile` first, so this resolves
  correctly without special-casing. A partially-real profile is treated as real, which is the
  right outcome (more accurate than pure defaults), not a bug.

**`useRemainingToday` / `TodayView`** (existing files, modified)
- The `"no-profile"` status is removed from the `RemainingToday` union. `useRemainingToday` now
  computes targets from whatever profile is present (`DEFAULT_PROFILE` or real) unconditionally,
  same as `calculateTargets` already tolerates.
- The `"ready"` variant gains `isEstimated: boolean` = `!hasSavedProfile`.
- `TodayView` drops its `"no-profile"` early-return block. `RemainingSummary` (or a wrapper
  around it) shows a small "tahmini" tag when `isEstimated` is true — same visual weight as
  existing muted-text badges elsewhere in the app, not an alarming warning.
- Note: with `OnboardingQuickSetup` mounted at the `AppShell` level, a genuinely first-ever
  load (`status === "unseen"`) shows the overlay on top of Bugün's now-always-computed estimated
  numbers underneath — consistent, no separate blank state to design for.

## Data model

New: one `localStorage` key, `grocery.onboarding.v1:<userId>` (or bare key if signed out,
matching `useMealPersonalization`'s `storageKey` fallback), value `"skipped"` when present.
No new Supabase table or column — "completed" already has a source of truth
(`hasSavedProfile`, backed by the existing `personal_plan` table).

## Error handling

No new failure modes. `localStorage` reads/writes are wrapped in the same best-effort
try/catch pattern already used throughout `preferences.ts` and `useMealPersonalization.ts` —
an unavailable/blocked `localStorage` degrades to "always show the quick-setup overlay" (status
never resolves past `"unseen"` without a real saved profile), which is safe, if mildly
repetitive, rather than broken.

## Testing

No test suite in this repo (per `CLAUDE.md`) — verification is `tsc -b` plus a manual
click-through via `netlify:dev` + Playwright, using the `auth-test-login` route with a fresh
`email` param (so `hasSavedProfile` starts false):
- Fresh user, any tab → quick-setup overlay appears once.
- Tap "Atla" on step 1 → overlay dismisses, Bugün shows estimated numbers tagged "tahmini",
  reload does not re-show the overlay.
- Complete all 4 steps → overlay dismisses, Bugün shows non-estimated numbers, Kişisel Plan
  shows the same answers pre-filled, reload does not re-show the overlay.
- A user who already has `hasSavedProfile === true` (existing test households) never sees the
  overlay.

## Open items / future

- Sync the "skipped" flag to Supabase alongside `personal_plan` if cross-device re-prompting
  turns out to annoy real users (currently accepted as a v1 gap).
- The roadmap doc's own §05 also flags "Besin ekranı: 'Listedeki ürünler' görünümüne kalan
  hedef karşılaştırması eklemek" as a separate open item — unrelated to this spec, not folded
  in here.
