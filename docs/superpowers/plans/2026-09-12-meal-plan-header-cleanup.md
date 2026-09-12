# Meal Plan Header Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Haiku 4.5 — a single, fully-specified conditional in one file.

**Scope:** Frontend only.

**Goal:** Remove the sticky header chrome (sync-status row and the divider line beneath it) above
the "Yemek Planı" (`section === "yemek"`) screen, since that screen carries no title, no tabs, and
already has its own compact day-navigator at the top of `MealPlanView`.

**Architecture:** `AppHeader.tsx` is a single component shared by every section; today it only
special-cases `section === "alisveris"` (list title, progress bar, tab list). This plan adds one
more special case — `section === "yemek"` renders nothing at all — rather than adding a second
generic "hide chrome" flag, since the other two non-shopping sections (`besin`, `kisisel`) are
unaffected by this request and should keep their current header exactly as-is.

**Tech Stack:** Preact function components, Tailwind utility classes (no new dependencies).

**Spec:** No separate spec doc — derived directly from the product owner's request
(2026-09-12, "section=yemek. Sync butonunun olduğu tab barı kaldıralım. Ve divider'ı da."). Ground
truth: `src/components/AppHeader.tsx`, `src/App.tsx` (renders `AppHeader` unconditionally above
`<main>`, and passes `section` down).

## Global Constraints

- No test suite exists; verify with `npm run build` (`tsc -b`) and by exercising the app via `npm
  run vercel:dev`, switching between all four bottom-nav tabs.
- Never commit without an explicit request; branch first.
- Do not change `AppHeader`'s behavior for `section === "alisveris"`, `"besin"`, or `"kisisel"` —
  this is scoped to `"yemek"` only.

---

## File Structure

- Modify: `src/components/AppHeader.tsx` — early-return `null` when `section === "yemek"`.

## Task 1: Hide the header for the Yemek Planı tab

**Files:**
- Modify: `src/components/AppHeader.tsx:18-158`

**Interfaces:**
- Consumes: `Section` type from `@/hooks/useUiPrefs` (already imported), unchanged.
- Produces: no new exports; `AppHeader`'s external prop signature is unchanged, so `App.tsx`
  needs no edits.

- [ ] **Step 1: Confirm what actually renders today for `section === "yemek"`**

Read `src/components/AppHeader.tsx:55-142`. For any non-`"alisveris"` section this currently
renders: the sync-status icon (only visible when `syncStatus !== "synced"`), an empty `pt-3`
spacer div, and a full-width divider (`<div className="-mx-5 h-px bg-border" />`). There is no
`TabsList` for `"yemek"` today — the "tab bar with the Sync button" the request refers to is this
whole status/spacer/divider block, which sits above `MealPlanView`'s own day-navigator with
nothing useful in it for that screen.

- [ ] **Step 2: Add the early return**

In `AppHeader`, right after the existing derived values (`total`, `done`, `progress`,
`confirmingNewList` state, `tabScrollRef`/`tabScrollFade` state and the `useEffect` that updates
them), add:

```typescript
  if (section === "yemek") {
    return null;
  }
```

Place this immediately before the `return (` that starts the JSX (i.e., after all hooks, so the
hook-call order stays identical on every render regardless of `section` — never put an early
return before a `useState`/`useEffect` call).

- [ ] **Step 3: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run vercel:dev`, open the app, switch to the "Yemek Planı" bottom-nav tab.
Expected: no header bar renders above the day-navigator (no sync icon row, no divider line); the
page starts directly at the "◀ [date] ▶" row. Switch to "Alışveriş", "Besin Değerleri", and
"Kişisel Plan" — expected: header renders exactly as before (list title/progress/tabs for
Alışveriş; sync-icon-row + divider, no tabs, for the other two).

- [ ] **Step 5: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Self-Review Notes

- **Spec coverage:** "Sync butonunun olduğu tab barı kaldıralım. Ve divider'ı da." → Task 1
  removes the entire header (which is where the sync icon and divider live) for this section.
- **Placeholder scan:** none.
- **Type consistency:** no new types introduced; `Section` union already includes `"yemek"` (used
  elsewhere in the same file's existing conditionals).
