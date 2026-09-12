# Daily Macros Card Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Haiku 4.5 — a fully-specified layout/style change in one file.

**Scope:** Frontend only.

**Goal:** Reflow `MacroSummaryCard` ("GÜNLÜK MAKROLAR") into two rows — Kalori + Protein on top,
Karbonhidrat + Yağ + Lif below — and shrink the card overall.

**Architecture:** Pure presentational change inside `MacroSummaryCard.tsx`: split the existing
flat 5-item `metrics` array into two ordered groups and render two grids instead of one, with
reduced padding/gap/font-size tokens throughout.

**Tech Stack:** Preact function components, Tailwind utility classes.

**Spec:** No separate spec doc — derived from the product owner's request (2026-09-12): "Kalori
ve protein üst satırda yer alacak şekilde karbonhidrat, yağ ve lifi alt satırda yer alacak
şekilde düzenleyelim. Günlük makrolar kısmını biraz daha küçültmüş olalım." Ground truth:
`src/components/MacroSummaryCard.tsx`, used by `MealPlanView.tsx` and `MealTrackingView.tsx`
(both pass it `remaining`/`target: MacroTotals` — no prop changes needed).

## Global Constraints

- No test suite exists; verify with `npm run build` and `npm run vercel:dev`.
- Never commit without an explicit request; branch first.
- `MacroSummaryCard`'s prop signature (`remaining`, `target`, `isEstimated?`) must not change —
  it's consumed by two call sites and this is a layout-only request.

---

## File Structure

- Modify: `src/components/MacroSummaryCard.tsx` — split metrics into two rows, shrink spacing.

## Task 1: Two-row macro layout, more compact card

**Files:**
- Modify: `src/components/MacroSummaryCard.tsx`

**Interfaces:**
- Consumes: `MacroTotals` from `@/lib/mealNutrition` (unchanged: `kcal`, `proteinG`, `carbsG`,
  `fatG`, `fiberG`).
- Produces: no new exports.

- [ ] **Step 1: Split the metrics list into two ordered groups**

Replace the single `metrics` array with two, keeping each entry's existing `label`/`key`/
`borderColor` shape:

```typescript
  const topMetrics: Array<{ label: string; key: keyof MacroTotals; borderColor: string }> = [
    { label: "Kalori", key: "kcal", borderColor: "border-l-blue-500" },
    { label: "Protein", key: "proteinG", borderColor: "border-l-red-500" },
  ];
  const bottomMetrics: Array<{ label: string; key: keyof MacroTotals; borderColor: string }> = [
    { label: "Karbonhidrat", key: "carbsG", borderColor: "border-l-green-500" },
    { label: "Yağ", key: "fatG", borderColor: "border-l-yellow-500" },
    { label: "Lif", key: "fiberG", borderColor: "border-l-purple-500" },
  ];
```

- [ ] **Step 2: Extract the per-tile renderer so both rows share it**

```typescript
  function renderTile({ label, key, borderColor }: (typeof topMetrics)[number]) {
    const totalValue = Math.round(target[key]);
    const remainingValue = Math.round(remaining[key]);
    return (
      <div key={label} className={`rounded-lg border-l-4 bg-background p-2 ${borderColor}`}>
        <p className="text-[0.7rem] font-medium text-muted-foreground">{label}</p>
        <p className="ledger mt-1 text-base font-bold text-foreground">{totalValue}</p>
        <p className="ledger text-xs font-light text-muted-foreground">+{remainingValue}</p>
      </div>
    );
  }
```

This is the same three lines the old inline JSX rendered per tile (`p`/`p`/`p` with
`totalValue`/`remainingValue`), just pulled out and shrunk: `p-3`→`p-2`, `text-lg`→`text-base`,
`text-sm`→`text-xs`, `mt-2`→`mt-1`, and the label gets a slightly smaller `text-[0.7rem]` instead
of `text-xs` to match the overall size reduction.

- [ ] **Step 3: Replace the single grid with two stacked grids**

Replace the current:

```typescript
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {metrics.map(({ label, key, borderColor }) => { ... })}
      </div>
```

with:

```typescript
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">{topMetrics.map(renderTile)}</div>
        <div className="grid grid-cols-3 gap-2">{bottomMetrics.map(renderTile)}</div>
      </div>
```

- [ ] **Step 4: Shrink the outer card and heading**

Change the outer wrapper from `className="rounded-lg border border-border bg-card p-4"` to
`className="rounded-lg border border-border bg-card p-3"`, and the heading from
`className="mb-4 text-sm font-semibold text-muted-foreground"` to `className="mb-2 text-xs
font-semibold text-muted-foreground"`.

- [ ] **Step 5: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors (the `metrics` identifier no longer exists — make sure nothing else in the
file still references it).

- [ ] **Step 6: Manual verification**

Run: `npm run vercel:dev`, open "Yemek Planı". Expected: the daily macros card shows Kalori and
Protein side by side on the first row, Karbonhidrat/Yağ/Lif on a three-column second row below,
and the whole card reads visibly more compact than before (less padding, smaller numbers). Check
both light and one dark theme (`ThemeSwitcher`) — border colors and text remain legible in both.
Also open "Bugün"/wherever `MealTrackingView` (if it's actually mounted anywhere — see note
below) to confirm the shared component didn't break there either.

> Note: `MealTrackingView.tsx` imports `MacroSummaryCard` but as of this writing is not imported
> by any other component (dead code) — grep for `MealTrackingView` before spending QA time on it;
> if it's still unused, this step is a no-op.

- [ ] **Step 7: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Self-Review Notes

- **Spec coverage:** row split → Task 1 Step 3; "biraz daha küçültmüş olalım" (make it a bit
  smaller) → Steps 2 and 4's padding/font-size reductions.
- **Placeholder scan:** none.
- **Type consistency:** `renderTile`'s parameter type `(typeof topMetrics)[number]` matches both
  `topMetrics` and `bottomMetrics` entries since they share the same literal shape.
