# First-run onboarding ("Hızlı kurulum") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Bugün's blocking "fill in Kişisel Plan first" message with a short,
skippable 4-step quick-setup quiz, so a first-time user gets real (or clearly-marked
estimated) numbers within seconds instead of a dead end.

**Architecture:** A new `useOnboarding(userId, hasSavedProfile)` hook derives a tri-state
status (`unseen`/`skipped`/`completed`) from a device-local localStorage flag plus the
already-existing `hasSavedProfile` signal. A new `OnboardingQuickSetup` component — a
self-contained 4-step wizard holding its own local draft state — replaces `<main>`'s content
in `AppShell` while status is `"unseen"`, and commits its answers through
`useMealPersonalization`'s existing `update`/`setEquationSex`/`setActivity`/`setGoal` calls
only once, on finish. `useRemainingToday` drops its `"no-profile"` status entirely — it now
always computes targets (falling back to `DEFAULT_PROFILE` when needed) and exposes
`isEstimated: boolean` on the `"ready"` state instead, so Bugün always shows real numbers,
tagged "Tahmini" when they're not personalized yet.

**Tech Stack:** Preact (React-compatible) + TypeScript, existing `useMealPersonalization`/
`useRemainingToday` hooks, Tailwind utility classes matching the existing component style
(see `PersonalPlanView.tsx`, `TodayView.tsx`).

**Spec:** [docs/superpowers/specs/2026-09-03-first-run-onboarding-design.md](../specs/2026-09-03-first-run-onboarding-design.md)

## Global Constraints

- **No test suite, no lint script** (per `CLAUDE.md`) — the only automated check is
  `npm run build` (`tsc -b && vite build`). Every task below substitutes "run `npm run build`,
  confirm it exits clean" for the skill template's usual "write a failing test" step. The final
  task additionally does a real manual click-through via `npm run netlify:dev` (or reuse an
  already-running instance — check `netstat -ano | grep 8888` before starting a second one)
  plus Playwright, the same pattern used for NUT-47.
- **Branch first.** Per `CLAUDE.md`, create a branch before writing any code — do not commit to
  `master` directly. Suggested branch name: `feature/first-run-onboarding`.
- **All UI copy is Turkish**, matching every existing screen in this app. Do not introduce
  English strings.
- **Manual verification uses the `auth-test-login` route** (`netlify/functions/auth-test-login.ts`)
  with a *fresh* `email` query param per test run, so `hasSavedProfile` starts `false`. Read
  `TEST_LOGIN_SECRET` from `.env.local` — never paste its value into a committed file, commit
  message, or this plan.
- **Commit after every task**, using the message style already established in this repo (see
  `git log` for examples) and ending with the `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`
  trailer.

---

## Task 1: `useOnboarding` hook

**Files:**
- Create: `src/hooks/useOnboarding.ts`

**Interfaces:**
- Consumes: nothing new — takes `userId: string | null` and `hasSavedProfile: boolean` as
  plain arguments (the latter comes from `useMealPersonalization(userId).hasSavedProfile`,
  called by whoever uses this hook — Task 5 wires that up).
- Produces: `useOnboarding(userId, hasSavedProfile): { status: "unseen" | "skipped" | "completed"; skip: () => void }` — Task 5 (`App.tsx`) consumes this exact shape.

- [ ] **Step 1: Write the hook**

```ts
import { useEffect, useState } from "react";

const STORAGE_PREFIX = "grocery.onboarding.v1";

export type OnboardingStatus = "unseen" | "skipped" | "completed";

// Device-local only, same pattern as theme/swipeMode in lib/preferences.ts —
// this is "has this device seen the quick-setup prompt," not part of the
// synced profile itself. Deliberately does not sync to Supabase (see the
// spec's "Open items" — cross-device re-prompting is an accepted v1 gap).
function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;
}

function loadSkipped(userId: string | null): boolean {
  try {
    return localStorage.getItem(storageKey(userId)) === "skipped";
  } catch {
    return false;
  }
}

function saveSkipped(userId: string | null) {
  try {
    localStorage.setItem(storageKey(userId), "skipped");
  } catch {
    // Best-effort, same as preferences.ts — the flag just won't persist.
  }
}

// hasSavedProfile always wins over a stale "skipped" flag: if the user later
// opens Kişisel Plan directly and fills it in, onboarding should read as
// "completed," not stay stuck on "skipped" from an earlier session.
export function useOnboarding(
  userId: string | null,
  hasSavedProfile: boolean,
): { status: OnboardingStatus; skip: () => void } {
  const [skipped, setSkipped] = useState(() => loadSkipped(userId));

  useEffect(() => {
    setSkipped(loadSkipped(userId));
  }, [userId]);

  function skip() {
    saveSkipped(userId);
    setSkipped(true);
  }

  const status: OnboardingStatus = hasSavedProfile
    ? "completed"
    : skipped
      ? "skipped"
      : "unseen";

  return { status, skip };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: exits 0, no TypeScript errors mentioning `useOnboarding.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useOnboarding.ts
git commit -m "$(cat <<'EOF'
feat: add useOnboarding hook for first-run quick-setup status

Tracks unseen/skipped/completed, deriving completed from the existing
hasSavedProfile signal and skipped from a device-local localStorage
flag — same best-effort pattern as theme/swipeMode in preferences.ts.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `OnboardingQuickSetup` component

**Files:**
- Modify: `src/components/PersonalPlanView.tsx:415` and `:434` (export the two local helpers)
- Create: `src/components/OnboardingQuickSetup.tsx`

**Interfaces:**
- Consumes: `Field`/`NumberInput` from `PersonalPlanView.tsx` (exported by this task);
  `ACTIVITY_OPTIONS`, `ActivityLevel`, `EquationSex`, `PersonalGoal`, `PersonalProfile` from
  `@/lib/mealPersonalization` (already exported today).
- Produces: `OnboardingQuickSetup({ initialProfile, onFinish, onSkip })` and the exported type
  `QuickAnswers = Pick<PersonalProfile, "ageYears"|"heightCm"|"weightKg"|"equationSex"|"activity"|"goal">`.
  Task 5 (`App.tsx`) renders this component and implements `onFinish`/`onSkip`.

**Design note (refines the spec):** the spec described the wizard as writing through
`update()` "live." In practice that can't drive the wizard's own step progression — every
`update()` call flips `hasSavedProfile` to `true` immediately (even on step 1 of 4), and
`AppShell` uses `hasSavedProfile` to decide whether onboarding is done, which would dismiss
the wizard after a single field edit instead of after all 4 steps. So the wizard instead keeps
its own local draft (`useState`), seeded from `initialProfile`, and calls the real setters only
once, in `onFinish`, when the user finishes the last step. Skip is unaffected — it never
touches the profile at all.

- [ ] **Step 1: Export `Field` and `NumberInput` from `PersonalPlanView.tsx`**

In `src/components/PersonalPlanView.tsx`, change:
```tsx
function Field({
```
to:
```tsx
export function Field({
```
and change:
```tsx
function NumberInput({
```
to:
```tsx
export function NumberInput({
```

- [ ] **Step 2: Write `OnboardingQuickSetup.tsx`**

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, NumberInput } from "@/components/PersonalPlanView";
import {
  ACTIVITY_OPTIONS,
  type ActivityLevel,
  type EquationSex,
  type PersonalGoal,
  type PersonalProfile,
} from "@/lib/mealPersonalization";

export type QuickAnswers = Pick<
  PersonalProfile,
  "ageYears" | "heightCm" | "weightKg" | "equationSex" | "activity" | "goal"
>;

type Props = {
  initialProfile: PersonalProfile;
  onFinish: (answers: QuickAnswers) => void;
  onSkip: () => void;
};

const STEP_COUNT = 4;

export function OnboardingQuickSetup({ initialProfile, onFinish, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuickAnswers>({
    ageYears: initialProfile.ageYears,
    heightCm: initialProfile.heightCm,
    weightKg: initialProfile.weightKg,
    equationSex: initialProfile.equationSex,
    activity: initialProfile.activity,
    goal: initialProfile.goal,
  });

  function update<K extends keyof QuickAnswers>(key: K, value: QuickAnswers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  const isLastStep = step === STEP_COUNT - 1;

  function next() {
    if (isLastStep) {
      onFinish(answers);
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="flex min-h-[70dvh] flex-col justify-between py-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i <= step ? "bg-signal" : "bg-border"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground">
            Atla
          </button>
        </div>

        <div className="mt-8">
          {step === 0 && (
            <StepBody
              title="Birkaç bilgi, hemen başlayalım"
              subtitle="Günlük hedefini hesaplamak için — istersen varsayılanları değiştirmeden devam et.">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Yaş">
                  <NumberInput
                    value={answers.ageYears}
                    onChange={(value) => update("ageYears", value)}
                  />
                </Field>
                <Field label="Boy (cm)">
                  <NumberInput
                    value={answers.heightCm}
                    onChange={(value) => update("heightCm", value)}
                  />
                </Field>
                <Field label="Kilo (kg)">
                  <NumberInput
                    value={answers.weightKg}
                    onChange={(value) => update("weightKg", value)}
                  />
                </Field>
              </div>
            </StepBody>
          )}

          {step === 1 && (
            <StepBody
              title="Denklem seçimi"
              subtitle="Enerji tahminindeki biyolojik katsayıyı belirtir; cinsiyet kimliğinden otomatik çıkarılmaz.">
              <div className="grid grid-cols-2 gap-2">
                <ChoiceButton
                  label="Kadın katsayısı"
                  selected={answers.equationSex === "female"}
                  onClick={() => update("equationSex", "female")}
                />
                <ChoiceButton
                  label="Erkek katsayısı"
                  selected={answers.equationSex === "male"}
                  onClick={() => update("equationSex", "male")}
                />
              </div>
            </StepBody>
          )}

          {step === 2 && (
            <StepBody
              title="Günlük aktivite"
              subtitle="Çoğu günün nasıl geçtiğine en yakın olanı seç.">
              <div className="space-y-2">
                {ACTIVITY_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    label={option.label}
                    selected={answers.activity === option.value}
                    onClick={() => update("activity", option.value)}
                    fullWidth
                  />
                ))}
              </div>
            </StepBody>
          )}

          {step === 3 && (
            <StepBody
              title="Hedefin ne?"
              subtitle="İstediğin zaman Kişisel Plan'dan değiştirebilirsin.">
              <div className="space-y-2">
                <ChoiceButton
                  label="Kilomu korumak"
                  selected={answers.goal === "maintain"}
                  onClick={() => update("goal", "maintain")}
                  fullWidth
                />
                <ChoiceButton
                  label="Kademeli kilo kaybı"
                  selected={answers.goal === "loss"}
                  onClick={() => update("goal", "loss")}
                  fullWidth
                />
                <ChoiceButton
                  label="Kilo almak / performans"
                  selected={answers.goal === "gain"}
                  onClick={() => update("goal", "gain")}
                  fullWidth
                />
              </div>
            </StepBody>
          )}
        </div>
      </div>

      <Button type="button" size="lg" className="w-full" onClick={next}>
        {isLastStep ? "Bitir" : "İleri"}
      </Button>
    </div>
  );
}

function StepBody({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ChoiceButton({
  label,
  selected,
  onClick,
  fullWidth,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-md border px-3 py-2.5 text-sm transition-colors ${
        fullWidth ? "w-full text-left" : ""
      } ${
        selected
          ? "border-signal/70 bg-signal/10 text-signal"
          : "border-border hover:bg-accent"
      }`}>
      {label}
    </button>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run build`
Expected: exits 0, no TypeScript errors mentioning `PersonalPlanView.tsx` or
`OnboardingQuickSetup.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/PersonalPlanView.tsx src/components/OnboardingQuickSetup.tsx
git commit -m "$(cat <<'EOF'
feat: add OnboardingQuickSetup 4-step quick-setup wizard

Self-contained local-draft wizard (yaş/boy/kilo, denklem seçimi,
aktivite, hedef), pre-filled from the caller's profile, committing
through the real profile setters only once on finish — not wired up
yet, App.tsx does that next.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `useRemainingToday` drops `"no-profile"`, adds `isEstimated`

**Files:**
- Modify: `src/hooks/useMealPersonalization.ts:13` (export `DEFAULT_PROFILE`)
- Modify: `src/hooks/useRemainingToday.ts`

**Interfaces:**
- Consumes: newly-exported `DEFAULT_PROFILE` from `useMealPersonalization.ts`; existing
  `calculateTargets` from `@/lib/mealPersonalization` (not currently imported in this file —
  add it).
- Produces: `RemainingToday`'s `"ready"` variant gains `isEstimated: boolean`. The
  `"no-profile"` status is removed from the union entirely. Task 4 (`TodayView.tsx`) consumes
  both changes.

- [ ] **Step 1: Export `DEFAULT_PROFILE`**

In `src/hooks/useMealPersonalization.ts`, change:
```ts
const DEFAULT_PROFILE: PersonalProfile = {
```
to:
```ts
export const DEFAULT_PROFILE: PersonalProfile = {
```

- [ ] **Step 2: Update `useRemainingToday.ts`'s imports**

In `src/hooks/useRemainingToday.ts`, change:
```ts
import { useMealPersonalization } from "./useMealPersonalization";
import { todayDateStr, useMealPlan } from "./useMealPlan";
import { useFoodCatalog } from "./useFoodCatalog";
import type { MacroTotals } from "@/lib/mealNutrition";
import type { PersonalTargets } from "@/lib/mealPersonalization";
import type { NutritionMap } from "@/lib/nutrition";
import type { MealItem, MealSlot } from "@/lib/localMealPlan";
```
to:
```ts
import { useMealPersonalization, DEFAULT_PROFILE } from "./useMealPersonalization";
import { todayDateStr, useMealPlan } from "./useMealPlan";
import { useFoodCatalog } from "./useFoodCatalog";
import type { MacroTotals } from "@/lib/mealNutrition";
import { calculateTargets, type PersonalTargets } from "@/lib/mealPersonalization";
import type { NutritionMap } from "@/lib/nutrition";
import type { MealItem, MealSlot } from "@/lib/localMealPlan";
```

- [ ] **Step 3: Remove the `"no-profile"` variant, add `isEstimated` to `"ready"`**

Change:
```ts
export type RemainingToday =
  | {
      status: "no-profile";
      catalogMap: NutritionMap;
      logConsumption: (foodId: string, grams: number, comboId?: string) => LoggedEntry;
      undoConsumption: (entries: LoggedEntry[]) => void;
    }
  // Without the catalog every combo's totals lookup fails and matchCombos
  // returns [] — indistinguishable from an honest "nothing fits your budget"
  // unless the loading/error state is carried through to the view.
  | {
      status: "loading-catalog";
      logConsumption: (foodId: string, grams: number, comboId?: string) => LoggedEntry;
      undoConsumption: (entries: LoggedEntry[]) => void;
    }
  | {
      status: "catalog-error";
      logConsumption: (foodId: string, grams: number, comboId?: string) => LoggedEntry;
      undoConsumption: (entries: LoggedEntry[]) => void;
    }
  | {
      status: "ready";
      target: MacroTotals;
      consumed: MacroTotals;
      remaining: MacroTotals;
      excludedFoodIds: string[];
      catalogMap: NutritionMap;
      // Every ingredient logged today, slot attached — TodayView groups
      // whichever of these carry a comboId to reconstruct "Bugün
      // yediklerin" from real data, so it survives a reload.
      todaysItems: (MealItem & { slot: MealSlot })[];
      logConsumption: (foodId: string, grams: number, comboId?: string) => LoggedEntry;
      undoConsumption: (entries: LoggedEntry[]) => void;
    };
```
to:
```ts
export type RemainingToday =
  // Without the catalog every combo's totals lookup fails and matchCombos
  // returns [] — indistinguishable from an honest "nothing fits your budget"
  // unless the loading/error state is carried through to the view.
  | {
      status: "loading-catalog";
      logConsumption: (foodId: string, grams: number, comboId?: string) => LoggedEntry;
      undoConsumption: (entries: LoggedEntry[]) => void;
    }
  | {
      status: "catalog-error";
      logConsumption: (foodId: string, grams: number, comboId?: string) => LoggedEntry;
      undoConsumption: (entries: LoggedEntry[]) => void;
    }
  | {
      status: "ready";
      target: MacroTotals;
      consumed: MacroTotals;
      remaining: MacroTotals;
      // True when there's no real saved profile — target is computed off
      // DEFAULT_PROFILE (or a real-but-invalid profile fell back the same
      // way). TodayView shows a "Tahmini" tag when this is true instead of
      // blocking the screen the way the old "no-profile" status did.
      isEstimated: boolean;
      excludedFoodIds: string[];
      catalogMap: NutritionMap;
      // Every ingredient logged today, slot attached — TodayView groups
      // whichever of these carry a comboId to reconstruct "Bugün
      // yediklerin" from real data, so it survives a reload.
      todaysItems: (MealItem & { slot: MealSlot })[];
      logConsumption: (foodId: string, grams: number, comboId?: string) => LoggedEntry;
      undoConsumption: (entries: LoggedEntry[]) => void;
    };
```

- [ ] **Step 4: Replace the no-profile early return with an estimated-fallback computation**

Change:
```ts
  // `targets` alone can't answer this: calculateTargets(DEFAULT_PROFILE)
  // returns valid numbers for a body nobody entered.
  if (!hasSavedProfile || !targets) {
    return { status: "no-profile", catalogMap, logConsumption, undoConsumption };
  }

  if (catalogStatus === "error") {
```
to:
```ts
  // A real profile that somehow fails validation (targets === null) is
  // treated the same as no profile at all — both fall back to
  // DEFAULT_PROFILE's guaranteed-valid numbers, tagged as estimated.
  const isEstimated = !hasSavedProfile || !targets;
  const effectiveTargets = targets ?? calculateTargets(DEFAULT_PROFILE)!;

  if (catalogStatus === "error") {
```

- [ ] **Step 5: Use `effectiveTargets` and return `isEstimated`**

Change:
```ts
  const target = targetToMacros(targets);
  const consumed = dailyNutrition();
  const remaining = subtractMacros(target, consumed);

  return {
    status: "ready",
    target,
    consumed,
    remaining,
    excludedFoodIds: profile.excludedFoodIds,
    catalogMap,
    todaysItems: allItems(),
    logConsumption,
    undoConsumption,
  };
```
to:
```ts
  const target = targetToMacros(effectiveTargets);
  const consumed = dailyNutrition();
  const remaining = subtractMacros(target, consumed);

  return {
    status: "ready",
    target,
    consumed,
    remaining,
    isEstimated,
    excludedFoodIds: profile.excludedFoodIds,
    catalogMap,
    todaysItems: allItems(),
    logConsumption,
    undoConsumption,
  };
```

- [ ] **Step 6: Typecheck**

Run: `npm run build`
Expected: exits 0. If `TodayView.tsx` fails to compile at this point because it still
references `remaining.status === "no-profile"`, that's expected — Task 4 fixes it next. Confirm
specifically that `useMealPersonalization.ts` and `useRemainingToday.ts` themselves have no
errors before moving on.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useMealPersonalization.ts src/hooks/useRemainingToday.ts
git commit -m "$(cat <<'EOF'
refactor: useRemainingToday always computes targets, adds isEstimated

Drops the "no-profile" status — Bugün should never be a dead end.
Falls back to DEFAULT_PROFILE's guaranteed-valid targets when there's
no real saved profile (or a real one somehow fails validation),
exposing isEstimated so the view can tag it instead of blocking.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `TodayView` drops the blocking message, shows a "Tahmini" tag

**Files:**
- Modify: `src/components/TodayView.tsx`

**Interfaces:**
- Consumes: `RemainingToday`'s `"ready"` variant's new `isEstimated: boolean` (Task 3).
- Produces: no new exports — this is the last file that needed updating for the `"no-profile"`
  removal.

- [ ] **Step 1: Remove the no-profile early return**

Delete this block entirely (currently right after the `visibleSuggestionIds`/`otherCombos`
computation, before the `"loading-catalog"` check):
```tsx
  if (remaining.status === "no-profile") {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Bugün için önerilerin olsun diye önce Kişisel Plan'ını doldurman
        gerekiyor.
      </div>
    );
  }

```

- [ ] **Step 2: Show a "Tahmini" tag next to the heading**

Change:
```tsx
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Kalan Makrolar
      </h3>
      <RemainingSummary remaining={remaining.remaining} />
```
to:
```tsx
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Kalan Makrolar
        </h3>
        {remaining.status === "ready" && remaining.isEstimated && (
          <span className="rounded-full border border-border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Tahmini
          </span>
        )}
      </div>
      <RemainingSummary remaining={remaining.remaining} />
```

- [ ] **Step 3: Typecheck**

Run: `npm run build`
Expected: exits 0, no TypeScript errors anywhere (this was the last file referencing the
removed `"no-profile"` status).

- [ ] **Step 4: Commit**

```bash
git add src/components/TodayView.tsx
git commit -m "$(cat <<'EOF'
feat: TodayView shows estimated numbers with a tag instead of blocking

Matches useRemainingToday's dropped "no-profile" status — Bugün now
always shows real numbers, marked "Tahmini" when they're computed off
DEFAULT_PROFILE rather than a real saved one.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Wire `OnboardingQuickSetup` into `AppShell`, verify end-to-end

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useOnboarding` (Task 1), `OnboardingQuickSetup` + `QuickAnswers` (Task 2),
  `useMealPersonalization` (existing, not previously called at this level).
- Produces: nothing further downstream — this is the last task.

- [ ] **Step 1: Add imports**

In `src/App.tsx`, change:
```tsx
import { useUiPrefs, type Tab } from "@/hooks/useUiPrefs";
import { useTenants } from "@/hooks/useTenants";
import { useListSync } from "@/hooks/useListSync";
import { useRollover } from "@/hooks/useRollover";
import { useUndo } from "@/hooks/useUndo";
import { useCategoryOverlay } from "@/hooks/useCategoryOverlay";
import { useItemCategories } from "@/hooks/useItemCategories";
import { useSelection } from "@/hooks/useSelection";
import { useAuth } from "@/hooks/useAuth";
```
to:
```tsx
import { useUiPrefs, type Tab } from "@/hooks/useUiPrefs";
import { useTenants } from "@/hooks/useTenants";
import { useListSync } from "@/hooks/useListSync";
import { useRollover } from "@/hooks/useRollover";
import { useUndo } from "@/hooks/useUndo";
import { useCategoryOverlay } from "@/hooks/useCategoryOverlay";
import { useItemCategories } from "@/hooks/useItemCategories";
import { useSelection } from "@/hooks/useSelection";
import { useAuth } from "@/hooks/useAuth";
import { useMealPersonalization } from "@/hooks/useMealPersonalization";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingQuickSetup } from "@/components/OnboardingQuickSetup";
```

- [ ] **Step 2: Call the new hooks in `AppShell`**

Change:
```tsx
  const { itemCategories, rememberCategory } =
    useItemCategories(activeTenantId);

  const catalog = useMemo(
```
to:
```tsx
  const { itemCategories, rememberCategory } =
    useItemCategories(activeTenantId);

  const personalization = useMealPersonalization(currentUserId);
  const onboarding = useOnboarding(currentUserId, personalization.hasSavedProfile);

  const catalog = useMemo(
```

- [ ] **Step 3: Swap `<main>`'s content while onboarding is unseen**

Change:
```tsx
      <main
        className="pt-5"
        onTouchStart={swipeTabs.onTouchStart as never}
        onTouchEnd={swipeTabs.onTouchEnd as never}>
        {section === "besin" ? (
          <NutritionView items={active.items} />
        ) : section === "yemek" ? (
```
to:
```tsx
      <main
        className="pt-5"
        onTouchStart={swipeTabs.onTouchStart as never}
        onTouchEnd={swipeTabs.onTouchEnd as never}>
        {onboarding.status === "unseen" ? (
          <OnboardingQuickSetup
            initialProfile={personalization.profile}
            onFinish={(answers) => {
              personalization.update("ageYears", answers.ageYears);
              personalization.update("heightCm", answers.heightCm);
              personalization.update("weightKg", answers.weightKg);
              personalization.setEquationSex(answers.equationSex);
              personalization.setActivity(answers.activity);
              personalization.setGoal(answers.goal);
            }}
            onSkip={onboarding.skip}
          />
        ) : section === "besin" ? (
          <NutritionView items={active.items} />
        ) : section === "yemek" ? (
```

(The rest of the ternary chain — `section === "yemek"`, `section === "kisisel"`, and the final
`<AppShoppingTabs .../>` fallback — stays exactly as-is; only the opening condition changes.)

- [ ] **Step 4: Typecheck**

Run: `npm run build`
Expected: exits 0, no TypeScript errors.

- [ ] **Step 5: Manual end-to-end verification**

Start (or reuse) the dev stack: `npm run netlify:dev` (check `netstat -ano | grep 8888` first —
if something's already listening there, use that instance instead of starting a second one).

Using Playwright (or a browser), for each check below, log in via
`http://localhost:8888/api/auth-test-login?secret=<TEST_LOGIN_SECRET from .env.local>&email=<fresh-address>&returnTo=/`
with a **new** `email` each time so `hasSavedProfile` starts `false`:

1. **Fresh user, quiz appears:** Log in with a brand-new email. Confirm the quick-setup
   overlay appears immediately (step 1 of 4, "Birkaç bilgi, hemen başlayalım", progress dots,
   "Atla" visible, fields pre-filled with 30/170/70).
2. **Tap through without typing:** Click "İleri" three times, then "Bitir" on step 4 without
   touching any field. Confirm: overlay dismisses, Bugün is shown with real (non-blocking)
   numbers, and no "Tahmini" tag (since real setters were called with the default values,
   `hasSavedProfile` is now `true`).
3. **Skip path (new fresh email):** Log in with another new email. On step 1, click "Atla".
   Confirm: overlay dismisses immediately, Bugün shows numbers tagged "Tahmini". Reload the
   page (same session) — confirm the overlay does **not** reappear and Bugün still shows the
   "Tahmini"-tagged numbers.
4. **Edit-then-skip (new fresh email):** Log in with another new email. On step 1, change the
   weight field, then click "İleri" to step 2, then click "Atla". Confirm: overlay dismisses,
   Bugün shows numbers **without** the "Tahmini" tag (since editing a field already flipped
   `hasSavedProfile` to `true` before the skip).
5. **Returning user never sees it again:** Using an existing test household from earlier work
   (one with `hasSavedProfile === true`, e.g. any of the households used for NUT-47's
   verification), confirm the quick-setup overlay does not appear on load.
6. Clean up: no persistent test data needs removal (the profile writes are harmless
   Kişisel Plan rows scoped to the throwaway test emails; nothing shared is touched).

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "$(cat <<'EOF'
feat: wire OnboardingQuickSetup into AppShell

First-time users (no saved Kişisel Plan profile) now see the 4-step
quick-setup overlay in place of whichever tab/section would otherwise
render, regardless of which one is active — matches the design spec's
"any tab, account-level" trigger scope.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Post-plan: merge

Once all 5 tasks are done and verified, this branch is ready for the usual CMP flow (commit
already done per-task; merge `feature/first-run-onboarding` into `master` and push) —
ask the user before merging, per this repo's git conventions.
