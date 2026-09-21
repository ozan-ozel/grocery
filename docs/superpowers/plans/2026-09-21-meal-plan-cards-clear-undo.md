# Meal Plan: Meal Cards, Bulk Clear, 5-Step Undo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On Yemek Planı, show meals added from Yemekler as cards, let the user clear a slot or the day, and give every meal-plan change a 5-step undo reachable from a persistent button plus a swipeable toast.

**Architecture:** Grouping reads the already-persisted `combo_id` (no schema change). A small module-level history store records inverse changes from every `useMealPlan` mutator (two hook instances share the query cache, so history cannot live in component state). Undo re-applies the inverse through the same optimistic-cache-plus-API cores the mutators use. The undo toast becomes a shared swipeable shell.

**Tech Stack:** Preact via `preact/compat` (imports say `"react"`), TanStack Query (`@tanstack/preact-query`), Tailwind v4, Vite, Vercel Functions (untouched).

**Spec:** [docs/superpowers/specs/2026-09-21-meal-plan-cards-clear-undo-design.md](../specs/2026-09-21-meal-plan-cards-clear-undo-design.md)

## Global Constraints

- **Branch:** all work on `feature/meal-plan-cards-clear-undo` (already created). Never write code on `master`.
- **No commits.** CLAUDE.md: "Commit only when asked" — implement and verify, then stop; the owner commits (CMP). This overrides the skill's usual commit steps, so this plan has none.
- **No tests, no test framework, no test files** (CLAUDE.md). Verification is `npm run build` (`tsc -b && vite build`), the smallest possible one-off script (written in the scratchpad, run, then deleted), and exercising the real app.
- **No new endpoint, table, env var or persisted key.** The 12-function Vercel limit is untouched: bulk delete is N parallel `DELETE /api/meal-entries?id=` calls.
- **User-facing copy is Turkish.** Reuse existing tokens and classes (`border-border`, `bg-card`, `text-muted-foreground`, `bg-foreground`, `text-background`); no new colors.
- **Imports:** `@/` alias; hooks/components import from `"react"` (aliased to `preact/compat`); for a children prop type use `ComponentChildren` from `"preact"`.
- **Secrets boundary:** never read `.env*` files or secret values; the agent-session login is minted by the developer (Task 7).
- **History capacity 5, in memory only, no redo.** One user action = one undo step.

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/mealGroups.ts` (new) | Pure: `groupSlotItems` — group a slot's items into meal cards + singles |
| `src/components/MealGroup.tsx` (new) | The card container (name header + kcal + children) |
| `src/components/MealContainer.tsx` | Render groups; "Temizle" button |
| `src/hooks/useSwipeToDismissX.ts` (new) | Horizontal swipe-to-dismiss gesture (pointer events) |
| `src/components/ui/swipe-toast.tsx` (new) | Shared toast shell: message, "Geri al", close, swipe |
| `src/components/UndoToast.tsx` | Shopping-list undo toast, now a thin wrapper over `SwipeToast` |
| `src/lib/mealPlanHistory.ts` (new) | History store: steps, toast, `recordChange`, `runAsOneStep`, `popStep`, `dismissHistoryToast` (no React) |
| `src/hooks/useMealPlanHistory.ts` (new) | Subscribe a component to the store |
| `src/hooks/useMealPlan.ts` | `apply*` cores, recording mutators, `clearSlot`, `clearDay`, `undoLast` |
| `src/components/MealPlanView.tsx` | Wire cards' names, `runAsOneStep` call sites, Geri al button, toast, "Günü temizle" |
| `src/App.tsx` | Pass `shoppingUndoVisible` to `MealPlanView` |

## Task 1: `groupSlotItems` (pure grouping)

**Files:**
- Create: `src/lib/mealGroups.ts`

**Interfaces:**
- Produces: `type SlotGroup`, `groupSlotItems(items: MealItem[], nameFor: (comboId: string) => string | undefined): SlotGroup[]` (used by Task 2).

- [ ] **Step 1: Create the module**

```ts
// src/lib/mealGroups.ts
import type { MealItem } from "@/lib/localMealPlan";

// A slot's items, grouped for display. `meal` groups are items added together
// from the Yemekler sheet: same comboId, contiguous, and every food distinct.
// Everything else — a lone item, an item without a comboId, an item whose
// comboId no longer resolves to a name — renders plain. A group only exists
// while it has 2+ items, so deleting down to one dissolves the card with no
// extra state.
export type SlotGroup =
  | { kind: "single"; item: MealItem }
  | { kind: "meal"; comboId: string; name: string; items: MealItem[] };

type Run = { comboId: string; name: string; items: MealItem[]; foods: Set<string> };

// A repeated food inside a run starts a new group: that is how "the same meal
// added twice to one slot" is told apart without a per-instance id. It is a
// heuristic — a meal that itself lists one food twice would split.
export function groupSlotItems(
  items: MealItem[],
  nameFor: (comboId: string) => string | undefined
): SlotGroup[] {
  const groups: SlotGroup[] = [];
  let run: Run | null = null;

  function flush() {
    if (!run) return;
    if (run.items.length >= 2) {
      groups.push({ kind: "meal", comboId: run.comboId, name: run.name, items: run.items });
    } else {
      for (const item of run.items) groups.push({ kind: "single", item });
    }
    run = null;
  }

  for (const item of items) {
    const name = item.comboId ? nameFor(item.comboId) : undefined;
    if (!item.comboId || !name) {
      flush();
      groups.push({ kind: "single", item });
      continue;
    }
    if (run && run.comboId === item.comboId && !run.foods.has(item.foodId)) {
      run.items.push(item);
      run.foods.add(item.foodId);
      continue;
    }
    flush();
    run = { comboId: item.comboId, name, items: [item], foods: new Set([item.foodId]) };
  }
  flush();
  return groups;
}
```

- [ ] **Step 2: One-off check (scratchpad, deleted afterwards)**

Write `C:\Users\4D\AppData\Local\Temp\claude\d--CodeSpace-grocery\b7e4bf61-864f-44c0-b424-3a8702921956\scratchpad\check-groups.ts`:

```ts
import { groupSlotItems } from "D:/CodeSpace/grocery/src/lib/mealGroups.ts";

const it = (id: string, foodId: string, comboId?: string) => ({ id, foodId, quantityG: 100, comboId });
const names = (c: string) => ({ m1: "Menemen", m2: "Yulaf" } as Record<string, string>)[c];
const shape = (g: ReturnType<typeof groupSlotItems>) =>
  g.map((x) => (x.kind === "single" ? x.item.id : `[${x.items.map((i) => i.id).join(",")}]`)).join(" ");
const eq = (got: string, want: string, label: string) => {
  if (got !== want) { console.error(`FAIL ${label}: got "${got}" want "${want}"`); process.exitCode = 1; }
  else console.log(`ok   ${label}`);
};

eq(shape(groupSlotItems([it("a", "yumurta", "m1"), it("b", "domates", "m1"), it("c", "biber", "m1")], names)), "[a,b,c]", "three items form a card");
eq(shape(groupSlotItems([it("a", "yumurta", "m1"), it("b", "domates", "m1")].slice(0, 1), names)), "a", "one item is plain");
eq(shape(groupSlotItems([it("a", "yumurta", "m1"), it("b", "domates", "m1"), it("c", "yumurta", "m1"), it("d", "domates", "m1")], names)), "[a,b] [c,d]", "same meal twice splits on repeated food");
eq(shape(groupSlotItems([it("a", "elma"), it("b", "yumurta", "m1"), it("c", "domates", "m1")], names)), "a [b,c]", "plain item before a card");
eq(shape(groupSlotItems([it("a", "yumurta", "gone"), it("b", "domates", "gone")], names)), "a b", "unresolvable name is not carded");
eq(shape(groupSlotItems([it("a", "yumurta", "m1"), it("b", "yulaf", "m2"), it("c", "sut", "m2")], names)), "a [b,c]", "different meals do not merge");
```

Run: `npx tsx C:\Users\4D\AppData\Local\Temp\claude\d--CodeSpace-grocery\b7e4bf61-864f-44c0-b424-3a8702921956\scratchpad\check-groups.ts`
Expected: six `ok` lines, exit code 0.

- [ ] **Step 3: Delete the scratch script**

Run: `Remove-Item C:\Users\4D\AppData\Local\Temp\claude\d--CodeSpace-grocery\b7e4bf61-864f-44c0-b424-3a8702921956\scratchpad\check-groups.ts`

## Task 2: Meal cards in the UI

**Files:**
- Create: `src/components/MealGroup.tsx`
- Modify: `src/components/MealContainer.tsx`
- Modify: `src/components/MealPlanView.tsx`

**Interfaces:**
- Consumes: `groupSlotItems`, `SlotGroup` from Task 1; `calculateItemsNutrition` from `@/lib/localMealPlan` (already used in `MealContainer`).
- Produces: `MealContainer` prop `mealNameFor: (comboId: string) => string | undefined` (required).

- [ ] **Step 1: Create `MealGroup.tsx`**

```tsx
// src/components/MealGroup.tsx
import type { ComponentChildren } from "preact";

type Props = {
  name: string;
  kcal: number;
  children: ComponentChildren;
};

// The card around items that were added together from the Yemekler sheet.
// The item cards inside keep their own border, so this is deliberately a
// light tint + thin outline rather than a second heavy box.
export function MealGroup({ name, kcal, children }: Props) {
  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-2">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <h4 className="min-w-0 truncate text-sm font-semibold text-foreground">{name}</h4>
        <p className="shrink-0 text-xs text-muted-foreground">{Math.round(kcal)} kcal</p>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: `MealContainer.tsx` — imports and prop**

Add imports after the existing `MealItemCard` import:

```tsx
import { MealGroup } from "./MealGroup";
import { groupSlotItems } from "@/lib/mealGroups";
```

In `Props`, after `batchLabelFor?`, add:

```tsx
  // Resolves a comboId to the meal's display name (built-in, saved or evening
  // pattern). An id that resolves to nothing is not carded.
  mealNameFor: (comboId: string) => string | undefined;
```

In the destructured parameters, add `mealNameFor,` after `batchLabelFor,`.

- [ ] **Step 3: `MealContainer.tsx` — render groups**

Immediately after `const totals = ...;` add:

```tsx
  const renderItem = (item: MealItem) => (
    <MealItemCard
      key={item.id}
      item={item}
      nutrition={catalog.get(item.foodId)}
      onRemove={() => onRemoveItem(item.id)}
      onUpdateQuantity={quantityG => updateItemQuantity(item.id, quantityG)}
      isOnShoppingList={isOnShoppingList(item.foodId)}
      onToggleShoppingList={() => onToggleShoppingList(item)}
      batchLabel={batchLabelFor?.(item)}
    />
  );
```

Replace the whole `{items.length > 0 && ( ... )}` block at the bottom with:

```tsx
      {items.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          {groupSlotItems(items, mealNameFor).map(group =>
            group.kind === "single" ? (
              renderItem(group.item)
            ) : (
              <MealGroup
                key={group.items[0].id}
                name={group.name}
                kcal={calculateItemsNutrition(group.items, catalog).kcal}>
                {group.items.map(renderItem)}
              </MealGroup>
            ),
          )}
        </div>
      )}
```

- [ ] **Step 4: `MealPlanView.tsx` — name lookup**

Just before `const scoredCombos = scoreAllCombos(` add:

```tsx
  // comboId -> display name, for the meal cards in each slot. Built-in meals,
  // the user's saved meals (their id is the comboId) and evening patterns all
  // stamp their id on the entries they add.
  const mealNameById = new Map<string, string>();
  for (const combo of ALL_COMBOS) mealNameById.set(combo.id, combo.nameTr);
  for (const meal of savedMeals.savedMeals) mealNameById.set(meal.id, meal.name);
  for (const [id, pattern] of EVENING_PATTERN_BY_ID) mealNameById.set(id, pattern.nameTr);
```

In the `<MealContainer ... />` element, after `batchLabelFor={batchLabelFor}` add:

```tsx
                mealNameFor={id => mealNameById.get(id)}
```

- [ ] **Step 5: Type-check**

Run: `npm run build`
Expected: `tsc -b` and `vite build` both succeed with no errors.

## Task 3: Swipeable toast shell

**Files:**
- Create: `src/hooks/useSwipeToDismissX.ts`
- Create: `src/components/ui/swipe-toast.tsx`
- Modify: `src/components/UndoToast.tsx`

**Interfaces:**
- Produces: `useSwipeToDismissX<T extends HTMLElement>(onDismiss): { ref, dragX, isDragging }`; `SwipeToast` props `{ message: string; onAction: () => void; onDismiss: () => void; bottomRem?: number }` (used by Task 6).

- [ ] **Step 1: Create the hook**

```ts
// src/hooks/useSwipeToDismissX.ts
import { useEffect, useRef, useState } from "react";

// Same feel as useSwipeToDismiss (the vertical bottom-sheet hook), turned on
// its side for a toast: drag left or right, past the threshold or with a
// quick flick and it slides off and dismisses; otherwise it snaps back.
const DISMISS_THRESHOLD_PX = 80;
const FLICK_VELOCITY_PX_PER_MS = 0.5;
const FLICK_MIN_DISTANCE_PX = 24;
// Movement under this is still a tap; past it the gesture is classified once
// (horizontal drag vs. vertical scroll) and stays that way until release.
const SLOP_PX = 8;
const SLIDE_OUT_MS = 180;

type Mode = "idle" | "pending" | "drag" | "scroll";

// Pointer events (not touch) so it also works with a mouse for desktop QA.
// The element must set `touch-action: pan-y`, so the browser keeps vertical
// scrolling and hands horizontal movement to us. Pointer capture starts only
// once a horizontal drag is recognised, so a plain tap on the buttons inside
// the toast still clicks.
export function useSwipeToDismissX<T extends HTMLElement = HTMLDivElement>(
  onDismiss: () => void
) {
  const ref = useRef<T | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let mode: Mode = "idle";
    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let current = 0;
    let dismissTimer: number | undefined;

    function onDown(e: PointerEvent) {
      if (dismissTimer !== undefined || pointerId !== null) return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startY = e.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      current = 0;
      mode = "pending";
    }

    function onMove(e: PointerEvent) {
      if (e.pointerId !== pointerId || mode === "idle" || mode === "scroll") return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (mode === "pending") {
        if (Math.abs(dx) < SLOP_PX && Math.abs(dy) < SLOP_PX) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          mode = "scroll";
          return;
        }
        mode = "drag";
        setIsDragging(true);
        el!.setPointerCapture(e.pointerId);
      }
      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = e.timeStamp;
      current = dx;
      setDragX(current);
    }

    function onUp(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      const wasDrag = mode === "drag";
      pointerId = null;
      mode = "idle";
      if (!wasDrag) return;
      setIsDragging(false);
      const distance = Math.abs(current);
      const shouldDismiss =
        distance > DISMISS_THRESHOLD_PX ||
        (Math.abs(velocity) > FLICK_VELOCITY_PX_PER_MS && distance > FLICK_MIN_DISTANCE_PX);
      if (!shouldDismiss) {
        setDragX(0);
        return;
      }
      // Slide the rest of the way off-screen (the toast's own transition
      // animates it — isDragging is already false), then dismiss.
      setDragX(Math.sign(current) * el!.offsetWidth);
      dismissTimer = window.setTimeout(() => onDismissRef.current(), SLIDE_OUT_MS);
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };
  }, []);

  return { ref, dragX, isDragging };
}
```

- [ ] **Step 2: Create `SwipeToast`**

```tsx
// src/components/ui/swipe-toast.tsx
import { X } from "lucide-react";
import { useSwipeToDismissX } from "@/hooks/useSwipeToDismissX";

type Props = {
  message: string;
  onAction: () => void;
  onDismiss: () => void;
  // Distance from the bottom of the viewport, in rem. 1.25 is the toast's
  // original mb-5; a second toast stacks above it with a larger value.
  bottomRem?: number;
};

// The undo toast shell shared by the shopping list (UndoToast) and the meal
// plan. Swiping it away only dismisses the toast — it never triggers the
// action.
export function SwipeToast({ message, onAction, onDismiss, bottomRem = 1.25 }: Props) {
  const { ref, dragX, isDragging } = useSwipeToDismissX<HTMLDivElement>(onDismiss);
  return (
    <div
      ref={ref}
      role="status"
      style={{
        marginBottom: `${bottomRem}rem`,
        touchAction: "pan-y",
        transform: dragX ? `translateX(${dragX}px)` : undefined,
        opacity: dragX ? Math.max(0, 1 - Math.abs(dragX) / 240) : undefined,
      }}
      className={`fixed inset-x-0 bottom-0 z-20 mx-auto flex w-[calc(100%-2.5rem)] max-w-[27.5rem] items-center justify-between gap-3 rounded-lg bg-foreground px-4 py-3 text-background shadow-lg ${isDragging ? "" : "transition-[transform,opacity] duration-200"}`}>
      <span className="truncate text-sm">{message}</span>
      <span className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onAction}
          className="text-sm underline underline-offset-4">
          Geri al
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Kapat"
          className="rounded p-0.5 text-background/70 hover:text-background active:text-background">
          <X className="size-4" />
        </button>
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `UndoToast.tsx` as a wrapper (same props and messages)**

```tsx
import type { Undo } from "@/hooks/useUndo";
import { SwipeToast } from "@/components/ui/swipe-toast";

type Props = {
  undo: Undo;
  onRestore: () => void;
  onDismiss: () => void;
};

function undoMessage(undo: Undo): string {
  switch (undo.kind) {
    case "remove":
      return `${undo.item.name} kaldırıldı`;
    case "bulkRemove":
      return `${undo.items.length} ürün kaldırıldı`;
    case "deleteList":
      return `${undo.list.title} silindi`;
    default:
      return "Bugün için yeni liste başlatıldı";
  }
}

export function UndoToast({ undo, onRestore, onDismiss }: Props) {
  return (
    <SwipeToast message={undoMessage(undo)} onAction={onRestore} onDismiss={onDismiss} />
  );
}
```

- [ ] **Step 4: Type-check**

Run: `npm run build`
Expected: success. (Behavior of the shopping toast is checked in Task 7.)

## Task 4: History store

**Files:**
- Create: `src/lib/mealPlanHistory.ts`
- Create: `src/hooks/useMealPlanHistory.ts`

**Interfaces:**
- Produces (consumed by Tasks 5 and 6):
  - `type Change = { kind: "added"; entry: MealEntry } | { kind: "removed"; entry: MealEntry; index: number } | { kind: "quantity"; entry: MealEntry; from: number; to: number }`
  - `type Step = { id: number; label: string; householdId: string; changes: Change[] }`
  - `recordChange(householdId: string, label: string, changes: Change[]): void`
  - `runAsOneStep(label: string, fn: () => void): void`
  - `popStep(householdId: string): Step | null`
  - `dismissHistoryToast(): void`, `getHistorySnapshot()`, `subscribeHistory(listener)`, `HISTORY_CAPACITY`
  - `useMealPlanHistory(householdId: string | null): { steps: Step[]; toast: Step | null }`

**Ordering convention (important):** `changes` are stored in the order they were applied, and each `removed` change carries `index` = the entry's position in that date's cache array *at the moment it was removed*. Undo applies the inverses **in reverse order**, which makes every re-insert land exactly where it came from.

- [ ] **Step 1: Create the store (no React import, so a Node script can load it)**

```ts
// src/lib/mealPlanHistory.ts
import type { MealEntry } from "@/lib/mealPlan";

// Undo history for the meal plan. A module-level store rather than component
// state because two useMealPlan instances (Yemek Planı's and useRemainingToday's,
// which backs "Yedim") mutate the same query cache and must record into one
// history. In memory only: cleared on reload, no redo.
export type Change =
  | { kind: "added"; entry: MealEntry }
  // `index` is the entry's position in that date's cache array when it was removed.
  | { kind: "removed"; entry: MealEntry; index: number }
  | { kind: "quantity"; entry: MealEntry; from: number; to: number };

export type Step = {
  id: number;
  label: string;
  householdId: string;
  // In the order applied; undo runs the inverses in reverse.
  changes: Change[];
};

export const HISTORY_CAPACITY = 5;

type State = {
  steps: Step[];
  // The step whose toast is showing; null once dismissed, expired or undone.
  toast: Step | null;
};

let state: State = { steps: [], toast: null };
let nextStepId = 1;
let group: { householdId: string | null; changes: Change[] } | null = null;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function pushStep(householdId: string, label: string, changes: Change[]) {
  if (changes.length === 0) return;
  const step: Step = { id: nextStepId++, label, householdId, changes };
  // History belongs to one household; a push for another one drops the rest.
  const kept = state.steps.filter((s) => s.householdId === householdId);
  setState({ steps: [...kept, step].slice(-HISTORY_CAPACITY), toast: step });
}

// Called by every meal-plan mutator. Inside runAsOneStep the changes join the
// open group instead of becoming a step of their own.
export function recordChange(householdId: string, label: string, changes: Change[]) {
  if (group) {
    group.householdId ??= householdId;
    group.changes.push(...changes);
    return;
  }
  pushStep(householdId, label, changes);
}

// Everything `fn` records (synchronously) becomes ONE undo step named `label`:
// adding a 3-food meal, "Yedim" on an evening card, undoing one.
export function runAsOneStep(label: string, fn: () => void) {
  if (group) {
    fn();
    return;
  }
  const own = { householdId: null as string | null, changes: [] as Change[] };
  group = own;
  try {
    fn();
  } finally {
    group = null;
    if (own.householdId) pushStep(own.householdId, label, own.changes);
  }
}

// Removes and returns the newest step of this household (undo hides its toast).
export function popStep(householdId: string): Step | null {
  for (let i = state.steps.length - 1; i >= 0; i--) {
    if (state.steps[i].householdId === householdId) {
      const step = state.steps[i];
      setState({ steps: state.steps.filter((_, j) => j !== i), toast: null });
      return step;
    }
  }
  return null;
}

export function dismissHistoryToast() {
  if (state.toast) setState({ ...state, toast: null });
}

export function getHistorySnapshot(): State {
  return state;
}

export function subscribeHistory(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
```

- [ ] **Step 2: Create the subscription hook**

```ts
// src/hooks/useMealPlanHistory.ts
import { useEffect, useState } from "react";
import {
  getHistorySnapshot,
  subscribeHistory,
  type Step,
} from "@/lib/mealPlanHistory";

// The history steps and toast for one household (a component sees nothing
// from another household's history).
export function useMealPlanHistory(householdId: string | null): {
  steps: Step[];
  toast: Step | null;
} {
  const [snapshot, setSnapshot] = useState(getHistorySnapshot);
  useEffect(() => {
    setSnapshot(getHistorySnapshot());
    return subscribeHistory(() => setSnapshot(getHistorySnapshot()));
  }, []);
  if (!householdId) return { steps: [], toast: null };
  return {
    steps: snapshot.steps.filter((s) => s.householdId === householdId),
    toast: snapshot.toast?.householdId === householdId ? snapshot.toast : null,
  };
}
```

- [ ] **Step 3: One-off check of the store (scratchpad, deleted afterwards)**

Write `...\scratchpad\check-history.ts` (same scratchpad directory as Task 1):

```ts
import {
  HISTORY_CAPACITY, dismissHistoryToast, getHistorySnapshot, popStep, recordChange, runAsOneStep,
} from "D:/CodeSpace/grocery/src/lib/mealPlanHistory.ts";

const entry = (id: string) => ({
  id, date: "2026-09-21", slot: "kahvalti" as const, foodId: "yumurta", quantityG: 50,
  position: 0, comboId: null, batchId: null,
});
let failed = false;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${label}`);
  if (!ok) failed = true;
};

// capacity
for (let i = 0; i < 7; i++) recordChange("h1", `a${i}`, [{ kind: "added", entry: entry(`e${i}`) }]);
check(getHistorySnapshot().steps.length === HISTORY_CAPACITY, "capacity is 5");
check(getHistorySnapshot().steps[0].label === "a2", "oldest two were dropped");
check(getHistorySnapshot().toast?.label === "a6", "toast is the newest step");

// grouping
runAsOneStep("meal", () => {
  recordChange("h1", "x", [{ kind: "added", entry: entry("g1") }]);
  recordChange("h1", "y", [{ kind: "added", entry: entry("g2") }]);
});
const newest = getHistorySnapshot().steps.at(-1)!;
check(newest.label === "meal" && newest.changes.length === 2, "group is one step with 2 changes");
check(getHistorySnapshot().steps.length === HISTORY_CAPACITY, "still capped at 5");

// empty group records nothing
const before = getHistorySnapshot().steps.length;
runAsOneStep("nothing", () => {});
check(getHistorySnapshot().steps.length === before, "empty group records nothing");

// pop
const popped = popStep("h1");
check(popped?.label === "meal", "pop returns the newest step");
check(getHistorySnapshot().toast === null, "pop hides the toast");
check(getHistorySnapshot().steps.length === 4, "pop removes it");

// toast dismiss keeps history
recordChange("h1", "z", [{ kind: "added", entry: entry("z1") }]);
dismissHistoryToast();
check(getHistorySnapshot().toast === null && getHistorySnapshot().steps.length === 5, "dismiss keeps steps");

// household switch drops the other household's steps
recordChange("h2", "other", [{ kind: "added", entry: entry("o1") }]);
check(getHistorySnapshot().steps.length === 1 && popStep("h1") === null, "other household starts fresh");

process.exitCode = failed ? 1 : 0;
```

Run: `npx tsx C:\Users\4D\AppData\Local\Temp\claude\d--CodeSpace-grocery\b7e4bf61-864f-44c0-b424-3a8702921956\scratchpad\check-history.ts`
Expected: every line `ok`, exit code 0.

- [ ] **Step 4: Delete the scratch script**

Run: `Remove-Item C:\Users\4D\AppData\Local\Temp\claude\d--CodeSpace-grocery\b7e4bf61-864f-44c0-b424-3a8702921956\scratchpad\check-history.ts`

- [ ] **Step 5: Type-check**

Run: `npm run build`
Expected: success.

## Task 5: `useMealPlan` — cores, recording, clear, undo

**Files:**
- Modify: `src/hooks/useMealPlan.ts` (replace the file with the version below; the top helpers and the long explanatory comment are unchanged)

**Interfaces:**
- Consumes: `recordChange`, `popStep`, `type Change` from Task 4.
- Produces (consumed by Task 6): from `useMealPlan(...)`, existing names unchanged plus `clearSlot(slot: MealSlot): void`, `clearDay(): void`, `undoLast(): void`. `addItem`, `updateItemQuantity`, `removeItem` keep their signatures and now also record history.

Behavior notes baked into the code:
- **Cores** (`applyAdd`, `applyRemove`, `applyQuantity`) do exactly today's optimistic-cache-write + API call and never record; both mutators and undo call them, so undoing never pushes to history.
- `applyAdd(entry, at?)` re-inserts at a cache index (used by undo); without `at` it appends, as `addItem` always did.
- A date that is not cached and not the viewed one gets no optimistic write (writing into `[]` would cache a partial day); after the server writes settle, that date is invalidated so it refetches whole.
- Undo is not invalidated when the date is cached, so a restored entry keeps its original place in the list instead of being re-sorted by the server.

- [ ] **Step 1: Replace `src/hooks/useMealPlan.ts` with**

```ts
// src/hooks/useMealPlan.ts
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/preact-query";
import { defaultTitle, readMealDateFromUrl, writeMealDateToUrl, uid } from "@/lib/store";
import type { NutritionMap } from "@/lib/nutrition";
import {
  MEAL_SLOTS,
  calculateItemsNutrition,
  type MealItem,
  type MealSlot,
} from "@/lib/localMealPlan";
import { sumMacros, type MacroTotals } from "@/lib/mealNutrition";
import {
  createMealEntry,
  deleteMealEntry,
  fetchMealEntries,
  updateMealEntry,
  type MealEntry,
} from "@/lib/mealPlan";
import { popStep, recordChange, type Change } from "@/lib/mealPlanHistory";

function dateToStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function strToDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDaysStr(dateStr: string, delta: number): string {
  const dt = strToDate(dateStr);
  dt.setDate(dt.getDate() + delta);
  return dateToStr(dt);
}

export function todayDateStr(): string {
  return dateToStr(new Date());
}

function initialDate(): string {
  const fromUrl = readMealDateFromUrl();
  return fromUrl && /^\d{4}-\d{2}-\d{2}$/.test(fromUrl) ? fromUrl : todayDateStr();
}

type DayPlan = Record<MealSlot, MealItem[]>;

function emptyDayPlan(): DayPlan {
  return { kahvalti: [], ogle: [], aksam: [], ara: [] };
}

function toDayPlan(entries: MealEntry[]): DayPlan {
  const plan = emptyDayPlan();
  for (const entry of entries) {
    plan[entry.slot].push({
      id: entry.id,
      foodId: entry.foodId,
      quantityG: entry.quantityG,
      comboId: entry.comboId ?? undefined,
      batchId: entry.batchId ?? undefined,
    });
  }
  return plan;
}

// Persisted per household+date via api/meal-entries.ts (Supabase
// meal_entries table) — see supabase/07-meal-entries.sql. Nutrition is never
// stored server-side, only { foodId, quantityG }; calculateItemsNutrition
// always derives it from the live catalog. Without a household (no tenant
// selected yet) the plan stays in-memory only, same as before this landed.
//
// Backed by TanStack Query rather than a bare useEffect+useState: the
// today-pinned instance (useRemainingToday) and Yemek Planı (browsing today) end up with the exact
// same queryKey when they overlap, so they share one fetch and one cache
// entry — a mutation from either is instantly visible in the other, and
// switching tabs away and back repaints from cache instead of flashing
// empty while a fresh request round-trips.
//
// `options.pinnedDate` opts a caller out of the shared ?date URL param entirely:
// the plan is fixed to that date and never reads or writes the URL. useRemainingToday
// needs this — it must always mean today, while Yemek Planı's prev/next-day navigation
// keeps steering the URL param for its own instance.
//
// Every mutation is recorded in src/lib/mealPlanHistory.ts (5-step undo). The
// apply* cores below do the optimistic write + API call and never record, so
// the public mutators record and undo (which calls the cores) never does.
export function useMealPlan(
  householdId: string | null,
  catalog: NutritionMap,
  options?: { pinnedDate?: string },
) {
  const [date, setDate] = useState<string>(() => options?.pinnedDate ?? initialDate());
  const queryClient = useQueryClient();

  useEffect(() => {
    if (options?.pinnedDate) return;
    writeMealDateToUrl(date);
  }, [date, options?.pinnedDate]);

  // Re-pin when the caller's date moves under us (midnight rollover while mounted).
  useEffect(() => {
    if (options?.pinnedDate && options.pinnedDate !== date) {
      setDate(options.pinnedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.pinnedDate]);

  const queryKeyFor = (d: string) => ["mealEntries", householdId ?? "local", d] as const;
  const queryKey = queryKeyFor(date);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchMealEntries(householdId as string, date, date),
    enabled: !!householdId,
    // Edits happen via this same UI far more often than from elsewhere, so a
    // short staleTime avoids a refetch-flash on every tab switch while still
    // catching a change made on another device within half a minute or so.
    staleTime: 30_000,
  });

  const dayPlan = toDayPlan(householdId ? (query.data ?? []) : []);

  // The viewed date's entries as they are in the cache right now — fresher than
  // `dayPlan`, which is a render-time snapshot (several mutations can land in
  // one tick, e.g. adding a meal's items in a loop).
  function currentEntries(): MealEntry[] {
    return queryClient.getQueryData<MealEntry[]>(queryKey) ?? [];
  }

  function setEntriesFor(entryDate: string, updater: (prev: MealEntry[]) => MealEntry[]) {
    // An undo can target a day that is neither viewed nor cached. Writing
    // updater([]) there would cache a partial day, so skip the optimistic
    // write — undoLast invalidates that date once the server writes settle.
    if (entryDate !== date && queryClient.getQueryData(queryKeyFor(entryDate)) === undefined) {
      return;
    }
    queryClient.setQueryData<MealEntry[]>(queryKeyFor(entryDate), (prev) => updater(prev ?? []));
  }

  function goToPrevDay() {
    setDate((d) => addDaysStr(d, -1));
  }

  function goToNextDay() {
    setDate((d) => addDaysStr(d, 1));
  }

  function itemsForSlot(slot: MealSlot): MealItem[] {
    return dayPlan[slot];
  }

  // Every item across all slots for the pinned date, slot attached — backs
  // MealPlanView's reconstruction of eaten evening combos from real data (grouped
  // by comboId) instead of only component state that resets on reload.
  function allItems(): (MealItem & { slot: MealSlot })[] {
    return MEAL_SLOTS.flatMap(({ slot }) => dayPlan[slot].map((item) => ({ ...item, slot })));
  }

  // DEC-069: an entry linked to a batch changes what's left of that batch.
  // Refetch the batch ledger only AFTER the server write has landed —
  // invalidating earlier would refetch the old allocations and leave the
  // "kaldı" grams stale.
  function refreshBatchLedger() {
    queryClient.invalidateQueries({
      queryKey: ["batchAllocations", householdId ?? "local"],
    });
  }

  // --- apply* cores: optimistic cache write + API call, never recorded -------

  // `at` re-inserts at a cache index (undo of a removal); without it, append.
  function applyAdd(entry: MealEntry, at?: number): Promise<void> {
    setEntriesFor(entry.date, (prev) => {
      if (at === undefined || at >= prev.length) return [...prev, entry];
      return [...prev.slice(0, at), entry, ...prev.slice(at)];
    });
    if (!householdId) return Promise.resolve();
    return createMealEntry({
      id: entry.id,
      householdId,
      date: entry.date,
      slot: entry.slot,
      foodId: entry.foodId,
      quantityG: entry.quantityG,
      position: entry.position,
      comboId: entry.comboId ?? undefined,
      batchId: entry.batchId ?? undefined,
    }).then((saved) => {
      if (!saved) console.warn("[mealPlan] entry created locally but failed to persist:", entry.id);
      else if (entry.batchId) refreshBatchLedger();
    });
  }

  function applyRemove(entries: MealEntry[]): Promise<void> {
    const ids = new Set(entries.map((entry) => entry.id));
    for (const entryDate of new Set(entries.map((entry) => entry.date))) {
      setEntriesFor(entryDate, (prev) => prev.filter((entry) => !ids.has(entry.id)));
    }
    if (!householdId) return Promise.resolve();
    return Promise.all(
      entries.map((entry) =>
        deleteMealEntry(entry.id).then((ok) => {
          if (!ok) console.warn("[mealPlan] entry removed locally but failed to delete remotely:", entry.id);
          else if (entry.batchId) refreshBatchLedger();
        })
      )
    ).then(() => undefined);
  }

  function applyQuantity(entry: MealEntry, quantityG: number): Promise<void> {
    setEntriesFor(entry.date, (prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, quantityG } : e))
    );
    if (!householdId) return Promise.resolve();
    return updateMealEntry(entry.id, { quantityG }).then((saved) => {
      if (!saved) console.warn("[mealPlan] quantity updated locally but failed to persist:", entry.id);
      else if (entry.batchId) refreshBatchLedger();
    });
  }

  // --- recorded mutators ------------------------------------------------------

  const nameOf = (foodId: string) => catalog.get(foodId)?.name_tr ?? foodId;

  function record(label: string, changes: Change[]) {
    if (householdId) recordChange(householdId, label, changes);
  }

  function addItem(
    slot: MealSlot,
    foodId: string,
    quantityG: number,
    comboId?: string,
    batchId?: string
  ): string {
    const id = uid();
    const position = dayPlan[slot].length;
    const entry: MealEntry = {
      id,
      date,
      slot,
      foodId,
      quantityG,
      position,
      comboId: comboId ?? null,
      batchId: batchId ?? null,
    };
    applyAdd(entry);
    record(`${nameOf(foodId)} eklendi`, [{ kind: "added", entry }]);
    return id;
  }

  function updateItemQuantity(slot: MealSlot, itemId: string, quantityG: number) {
    const entry = currentEntries().find((e) => e.slot === slot && e.id === itemId);
    if (!entry || entry.quantityG === quantityG) return;
    applyQuantity(entry, quantityG);
    record(`${nameOf(entry.foodId)} ${entry.quantityG}g → ${quantityG}g`, [
      { kind: "quantity", entry, from: entry.quantityG, to: quantityG },
    ]);
  }

  function removeItem(slot: MealSlot, itemId: string) {
    const entries = currentEntries();
    const index = entries.findIndex((e) => e.slot === slot && e.id === itemId);
    if (index < 0) return;
    const entry = entries[index];
    applyRemove([entry]);
    record(`${nameOf(entry.foodId)} kaldırıldı`, [{ kind: "removed", entry, index }]);
  }

  // Removes every entry `match` accepts, as ONE undo step. Recorded highest
  // index first, so each recorded index is still right when undo re-inserts
  // them in reverse (lowest first).
  function clearEntries(label: (count: number) => string, match: (entry: MealEntry) => boolean) {
    const targets = currentEntries()
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => match(entry))
      .reverse();
    if (targets.length === 0) return;
    applyRemove(targets.map(({ entry }) => entry));
    record(
      label(targets.length),
      targets.map(({ entry, index }): Change => ({ kind: "removed", entry, index }))
    );
  }

  function clearSlot(slot: MealSlot) {
    const slotLabel = MEAL_SLOTS.find((s) => s.slot === slot)?.label ?? slot;
    clearEntries((count) => `${slotLabel} temizlendi · ${count} ürün`, (entry) => entry.slot === slot);
  }

  function clearDay() {
    clearEntries((count) => `Gün temizlendi · ${count} ürün`, () => true);
  }

  // --- undo -------------------------------------------------------------------

  function applyInverse(change: Change): Promise<void> {
    switch (change.kind) {
      case "added":
        return applyRemove([change.entry]);
      case "removed":
        return applyAdd(change.entry, change.index);
      case "quantity":
        return applyQuantity(change.entry, change.from);
    }
  }

  // Reverses the newest step. If it happened on another day, the view moves
  // there so the change is visible (the today-pinned instance never navigates).
  function undoLast() {
    if (!householdId) return;
    const step = popStep(householdId);
    if (!step) return;
    const day = step.changes[0].entry.date;
    const wasCached = queryClient.getQueryData(queryKeyFor(day)) !== undefined;
    if (!options?.pinnedDate && day !== date) setDate(day);
    Promise.all([...step.changes].reverse().map(applyInverse)).then(() => {
      // A cached day already shows the exact result; only a day that was not
      // cached needs a refetch to be whole.
      if (!wasCached) queryClient.invalidateQueries({ queryKey: queryKeyFor(day) });
    });
  }

  function slotNutrition(slot: MealSlot): MacroTotals {
    return calculateItemsNutrition(dayPlan[slot], catalog);
  }

  function dailyNutrition(): MacroTotals {
    return sumMacros(MEAL_SLOTS.map(({ slot }) => slotNutrition(slot)));
  }

  return {
    date,
    dateLabel: defaultTitle(strToDate(date).getTime()),
    // True only on a cold load (no cached data yet for this household+date).
    // Background revalidation after that never flips this back on, so
    // already-shown data doesn't flash back to a loading state.
    isLoading: !!householdId && query.isLoading,
    goToPrevDay,
    goToNextDay,
    itemsForSlot,
    allItems,
    addItem,
    updateItemQuantity,
    removeItem,
    clearSlot,
    clearDay,
    undoLast,
    slotNutrition,
    dailyNutrition,
  };
}
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: success. If `tsc` reports `Property 'position'...` or a `MealEntry` mismatch, `MealEntry` in `src/lib/mealPlan.ts` is the source of truth: `{ id, date, slot, foodId, quantityG, position, comboId: string | null, batchId: string | null }`.

## Task 6: Wire `MealPlanView` (call sites, Geri al button, toast, clear buttons)

**Files:**
- Modify: `src/components/MealPlanView.tsx`
- Modify: `src/components/MealContainer.tsx`
- Modify: `src/App.tsx:706-712`

**Interfaces:**
- Consumes: `clearSlot`, `clearDay`, `undoLast` (Task 5); `runAsOneStep`, `dismissHistoryToast` (Task 4); `useMealPlanHistory` (Task 4); `SwipeToast` (Task 3).
- Produces: `MealContainer` prop `onClear: () => void` (required); `MealPlanView` prop `shoppingUndoVisible?: boolean`.

- [ ] **Step 1: `MealContainer.tsx` — Temizle button**

Add to `Props` (after `mealNameFor`):

```tsx
  // Removes every item in this slot as one undoable step.
  onClear: () => void;
```

Add `onClear,` to the destructured parameters (after `mealNameFor,`).

Inside the `{items.length > 0 && ( <div className="space-y-2 border-t border-border pt-3"> ... )}` block from Task 2, add this after the `groupSlotItems(...)` expression (as the last child of that `div`):

```tsx
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClear}
              className="rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground active:text-foreground">
              Temizle
            </button>
          </div>
```

- [ ] **Step 2: `MealPlanView.tsx` — imports**

Change the first import line to:

```tsx
import { useEffect, useState } from "react";
```

Change the lucide import to:

```tsx
import { ChevronLeft, ChevronRight, Undo2 } from "lucide-react";
```

After the `useSavedMeals` import add:

```tsx
import { useMealPlanHistory } from "@/hooks/useMealPlanHistory";
import { SwipeToast } from "@/components/ui/swipe-toast";
import { dismissHistoryToast, runAsOneStep } from "@/lib/mealPlanHistory";
```

- [ ] **Step 3: `MealPlanView.tsx` — props**

In `Props` add after `onRemoveShoppingItem`:

```tsx
  // True while App's shopping-list undo toast is showing, so the meal-plan
  // toast stacks above it instead of covering it.
  shoppingUndoVisible?: boolean;
```

Add `shoppingUndoVisible,` to the destructured parameters of `MealPlanView`.

- [ ] **Step 4: `MealPlanView.tsx` — hook wiring**

In the `useMealPlan(householdId, catalogMap)` destructure add `clearSlot, clearDay, undoLast,` (after `dailyNutrition`). Immediately after that call add:

```tsx
  const history = useMealPlanHistory(householdId);
  const historyToast = history.toast;
  // The toast hides after 6 s (like the shopping-list one); the history itself
  // stays, reachable from the Geri al button.
  useEffect(() => {
    if (!historyToast) return;
    const timer = window.setTimeout(dismissHistoryToast, 6000);
    return () => window.clearTimeout(timer);
  }, [historyToast?.id]);
```

- [ ] **Step 5: `MealPlanView.tsx` — one undo step per user action**

Replace `handleComboSelect` with:

```tsx
  function handleComboSelect(combo: Combo, factor: number) {
    if (!activeSlot) return;
    runAsOneStep(`${combo.nameTr} eklendi`, () => {
      for (const item of scaleComboItems(combo.items, factor)) {
        const nutrition = lookupNutrition(catalogMap, item.foodId);
        if (nutrition) {
          addItem(activeSlot, nutrition.name_tr, item.grams, combo.id);
        }
      }
    });
    setComboModalOpen(false);
    setActiveSlot(null);
  }
```

In `eatEveningCombo`, replace the loop

```tsx
    for (const item of combo.items) {
      remainingToday.logConsumption(item.foodId, item.grams, combo.id);
    }
```

with

```tsx
    runAsOneStep(`${combo.nameTr} eklendi`, () => {
      for (const item of combo.items) {
        remainingToday.logConsumption(item.foodId, item.grams, combo.id);
      }
    });
```

In `undoEveningCombo`, replace `remainingToday.undoConsumption(found.entries);` with:

```tsx
    runAsOneStep(`${found.combo.nameTr} kaldırıldı`, () => {
      remainingToday.undoConsumption(found.entries);
    });
```

- [ ] **Step 6: `MealPlanView.tsx` — Geri al button**

Replace

```tsx
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Yemek Planı
      </p>
```

with

```tsx
      <div className="flex min-h-6 items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Yemek Planı
        </p>
        {history.steps.length > 0 && (
          <Button
            type="button"
            variant="quiet"
            size="sm"
            className="h-6 gap-1 px-2"
            onClick={undoLast}
            aria-label={`Son işlemi geri al, ${history.steps.length} adım`}>
            <Undo2 className="size-3.5" />
            Geri al · {history.steps.length}
          </Button>
        )}
      </div>
```

- [ ] **Step 7: `MealPlanView.tsx` — clear buttons and toast**

In the `<MealContainer ... />` element add, after `mealNameFor={...}`:

```tsx
                onClear={() => clearSlot(slot)}
```

Immediately before the `{/* Add to shopping list button */}` comment add:

```tsx
      {dayItems.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={clearDay}>
          Günü temizle
        </Button>
      )}

```

Just before the closing `</div>` of the component's returned JSX (after the shopping-list button block), add:

```tsx
      {historyToast && (
        <SwipeToast
          key={historyToast.id}
          message={historyToast.label}
          onAction={undoLast}
          onDismiss={dismissHistoryToast}
          bottomRem={shoppingUndoVisible ? 4.75 : 1.25}
        />
      )}
```

- [ ] **Step 8: `App.tsx` — pass the shopping-undo flag**

In the `<MealPlanView ... />` usage add after `onRemoveShoppingItem={removeItemByName}`:

```tsx
              shoppingUndoVisible={!!undo}
```

- [ ] **Step 9: Type-check**

Run: `npm run build`
Expected: success, no `tsc` errors.

## Task 7: Verify in the real app

**Files:** none (no code changes unless a defect is found — then fix it in the file the defect lives in and rerun `npm run build`).

CLAUDE.md rules for this task: check `:3000` first and reuse a server that already answers, never start a second one, never stop one Claude did not start. Claude runs `npm run agent-session -- up | down | status`; **the developer** runs `npm run agent-mint` in their own terminal and pastes the redeem URL. Claude never reads `.env*` or any secret. Use plain Playwright tools (`navigate`/`click`/`snapshot`/`screenshot`), keep screenshots out of the repo root, and leave the test account as found (remove entries you add).

- [ ] **Step 1: Get a signed-in local session**

Run `npm run agent-session -- status`. If `:3000` does not answer, run `npm run agent-session -- up`. Ask the developer to run `npm run agent-mint` and paste the redeem URL, then open it in the browser.

- [ ] **Step 2: Meal cards**

Add a 3-food meal from Yemekler to a slot: it shows as one tinted card with the meal name and kcal. Delete two of its foods: the last one renders plain (no card). Add the same meal twice to one slot: two cards. Add a single food from Ürünler: plain. Screenshot the card; if it reads as cluttered, switch `MealGroup` to the spec's fallback (header line + left rail, no box) and re-check.

- [ ] **Step 3: Clear + undo**

"Temizle" on a slot with a card and a plain item: everything in that slot goes, toast says `<slot> temizlendi · N ürün`, "Geri al · 1" appears. Tap Geri al: entries return in their original order, cards re-form. "Günü temizle": all four slots clear; undo restores all. Reload the page after an undo: the server matches what is shown.

- [ ] **Step 4: Five-step limit**

Do six single actions (add, edit grams, delete, …). The button reads "Geri al · 5"; five taps undo the five newest; a sixth tap is not offered (button gone); the oldest action stays applied.

- [ ] **Step 5: Other-day undo**

Act on today, go to the next day, tap Geri al: the view returns to today and shows the restored/reverted entries.

- [ ] **Step 6: "Yedim"**

On an evening suggestion card, "Yedim" then Geri al: one step adds and one step removes all the pattern's entries; the card returns to a suggestion.

- [ ] **Step 7: Toast swipe**

At phone width (browser device emulation, touch): drag the toast left, then right past ~80 px: it slides off and disappears, and the "Geri al · N" button still shows the same count. A short drag snaps back. Vertical page scroll over the toast still works. Tap "Geri al" and "×" on the toast: both still click. Repeat the swipe on the shopping-list toast (remove an item from the shopping list).

- [ ] **Step 8: Toast stacking and position**

Raise the shopping-list toast (e.g. "Bu günü alışveriş listesinden çıkar", then act on the meal plan within 6 s): the meal-plan toast sits above the shopping toast, both readable, neither hidden by the bottom nav. Check the single-toast position against the bottom nav on a 360 px-wide viewport.

- [ ] **Step 9: Leave things as found**

Undo or delete any entries added for the test; then `npm run agent-session -- down` only if this session started the server.

## Task 8: Docs close-out (CLAUDE.md checklist)

**Files:**
- Modify: `docs/mvp-scope/meal-construction-mvp.md`, `docs/roadmap_v2.md`, `docs/mvp-scope/README.md`, `nutrition-curriculum/DEC_REGISTER.md`, `docs/superpowers/plans/README.md`, `docs/architecture.md`, `docs/CURRENT_STATE.md`
- Create: a dated record in `docs/session-checkpoints/` (+ index line in its `README.md`)

This touches Domain L / `DEC-070`, so the trio rule applies: the `*-mvp.md` file, the `roadmap_v2.md` line and the `DEC_REGISTER.md` row note are updated **together**, plus the `mvp-scope/README.md` status column.

- [ ] **Step 1: `docs/mvp-scope/meal-construction-mvp.md`** — add after the "Update 2026-09-20 — Yemeklerim / Tarifler" paragraph:

```markdown
**Update 2026-09-21 — meal cards, clear, undo.** Yemek Planı now shows meals added from the Yemekler
sheet as cards inside their slot (items sharing a persisted `comboId`; a card exists only while it has 2+
items, so deleting down to one dissolves it; the same meal added twice is split where a food repeats — a
heuristic, there is no per-instance id). Each slot has a "Temizle" action and the day a "Günü temizle";
both are one undoable step with no confirm dialog. Every meal-plan change — add, add a meal, grams edit,
remove, clear, "Yedim" — is recorded in an in-memory history of the last 5 steps, reachable from a
"Geri al · N" button beside the date and from a swipeable toast (also used by the shopping-list undo).
History is cleared on reload and has no redo. This extends `DEC-070` (adjusting when the user deviates).
Plan: `docs/superpowers/plans/2026-09-21-meal-plan-cards-clear-undo.md`. Still open: an undone removal
keeps its place in the list, but a later server refetch may re-order entries that share a `position`.
```

- [ ] **Step 2: `docs/roadmap_v2.md`** — in the "Meal Construction/Prep" section (line ~64 area), add one line:

```
	Meal plan deviation tools (DEC-070): meal cards, slot/day clear and a 5-step undo shipped 2026-09-21, see docs/mvp-scope/meal-construction-mvp.md
```

- [ ] **Step 3: `docs/mvp-scope/README.md`** — in the Domain L row's status cell, append `; meal cards, slot/day clear and 5-step undo on Yemek Planı added 2026-09-21`.

- [ ] **Step 4: `nutrition-curriculum/DEC_REGISTER.md`** — append to the `DEC-070` row's Note: `; meal cards, slot/day clear and a 5-step undo added 2026-09-21, see docs/mvp-scope/meal-construction-mvp.md`. Readiness stays `SHIPPED`; counts unchanged.

- [ ] **Step 5: `docs/superpowers/plans/README.md`** — this plan's row already exists as `NOT_STARTED`. Once Task 7 has passed, flip it to `SHIPPED` in the same commit that ships the feature, and replace its Evidence cell with: `Implemented and verified in the real app on <date> (mealGroups.ts, MealGroup.tsx, mealPlanHistory.ts, useMealPlan.ts, swipe-toast.tsx); spec in docs/superpowers/specs/. Still pending: phone-only checks (toast swipe, card layout)`.

- [ ] **Step 6: `docs/architecture.md`** — run `grep -n "^## \|^### " docs/architecture.md`; under the state/persistence section covering the meal plan, add: *"Meal-plan undo history: `src/lib/mealPlanHistory.ts` is a module-level, in-memory store (last 5 steps, cleared on reload, no redo) that every `useMealPlan` mutator records into; `useMealPlan` splits each mutator into an unrecorded `apply*` core and a recording wrapper, and `undoLast` replays inverses in reverse order. One user action is one step (`runAsOneStep`). No endpoint, table or persisted key is involved."* Under "Design tokens & theming → UI patterns", add: *"Toasts: `src/components/ui/swipe-toast.tsx` is the shared toast shell (swipe left/right to dismiss via `useSwipeToDismissX`); use it rather than a hand-rolled toast."*

- [ ] **Step 7: Session checkpoint** — this is significant work (new subsystem, 3 features): run the `session-checkpoint` skill and add it to `docs/session-checkpoints/README.md`.

- [ ] **Step 8: `docs/CURRENT_STATE.md`** — refresh per `.claude/skills/current-state-update/SKILL.md` (verify branch/HEAD with git; add the phone-only checks — toast swipe and card layout on a real phone — to Open items, since only the browser was exercised).

- [ ] **Step 9: Final check and hand-off**

Run `npm run build` once more, then `git status --short` and confirm only the files in this plan changed (no scratch scripts, no screenshots). Run `SYNC` if the owner wants it. **Do not commit** — report the wrap-up (which Close-out checklist items applied) and let the owner run CMP (the branch already exists).

## Self-Review

- **Spec coverage:** meal cards → Tasks 1-2; bulk clear → Tasks 5-6; history store → Task 4; `useMealPlan` cores/recording/undo/`goToDate`-equivalent navigation → Task 5; call sites as one step → Task 6 Step 5; Geri al button, toast, 6 s timer → Task 6; swipeable shared toast → Task 3; stacking with the shopping toast → Task 6 Steps 3, 7, 8; out-of-scope items unchanged; verification list → Task 7; close-out → Task 8.
- **Deviations from the spec, made deliberately:** (1) the subscription uses a small `useState`/`useEffect` hook (`useMealPlanHistory`) instead of `useSyncExternalStore`, avoiding a dependency on a `preact/compat` version; (2) restored entries are re-inserted at their recorded cache index (not sorted by `position`), because a combo's items share one `position`; (3) `goToDate` is not exported — `undoLast` navigates internally; (4) the "stack above the shopping toast" is done with a `shoppingUndoVisible` prop from `App`.
- **Type consistency:** `Change`/`Step` defined in Task 4 and used unchanged in Task 5; `clearSlot`/`clearDay`/`undoLast` defined in Task 5 and consumed in Task 6; `SwipeToast` props defined in Task 3 and used in Task 6; `MealContainer` props `mealNameFor` (Task 2) and `onClear` (Task 6) are both passed from `MealPlanView`.
- **Found during Task 7 and fixed:** the server orders by `(date, slot, position)` only, and `addItem` gave every item of one meal the same `position` (from a render-time snapshot), so order was arbitrary after a reload. `addItem` now uses one past the slot's highest position, read from the live cache. Entries saved before the fix may still share a position.
- **Also changed after Task 7:** `SwipeToast`'s message wraps to two lines (`line-clamp-2`) instead of truncating.
