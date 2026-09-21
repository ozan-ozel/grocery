# Meal Plan: meal cards, bulk clear, 5-step undo — Design

Date: 2026-09-21. Status: draft for owner review. Domain L (Meal Construction/Prep), extends `DEC-070`
("adjust the plan when the user deviates", already `SHIPPED`); see
[`docs/mvp-scope/meal-construction-mvp.md`](../../mvp-scope/meal-construction-mvp.md).

## Goal

Three related changes to the Yemek Planı screen (`src/components/MealPlanView.tsx`):

1. **Meal cards.** Items added together from the Yemekler sheet are visibly grouped inside their slot.
2. **Bulk clear.** Clear one slot, or the whole day, in one action.
3. **5-step undo for every meal-plan change**, reachable from a persistent button, with a swipeable toast.

## Findings that shape the design

- Every add from the Yemekler sheet (built-in meals, saved meals, evening patterns) already stamps each
  entry with the same `comboId` (`meal_entries.combo_id`, persisted). Grouping needs **no schema change**.
- Meal-plan mutations are optimistic writes into the TanStack Query cache
  (`["mealEntries", householdId, date]`) plus one API call per entry (`createMealEntry` /
  `updateMealEntry` / `deleteMealEntry`). Entry ids are client-generated, so a removed entry can be
  re-created with its original id.
- There are **two** `useMealPlan` instances on the screen (Yemek Planı's and `useRemainingToday`'s, used
  by "Yedim"). They share the query cache but not React state, so undo history cannot live in component
  state.
- The only undo today is the shopping list's (`useUndo` + `UndoToast`, in-memory, one step). The meal plan
  has none; the entry X button deletes immediately.
- `UndoToast` is a floating toast, not a bottom sheet. The existing swipe hook
  (`src/hooks/useSwipeToDismiss.ts`) is vertical-only.

## 1. Meal cards

Pure grouping function `groupSlotItems(items)` in a new `src/lib/mealGroups.ts`:

- Walk a slot's items in order. Items with the same `comboId` in a contiguous run form a group; a food
  that repeats inside a run starts a new group (this separates "same meal added twice" without a
  per-instance id — a heuristic, documented as such).
- A group with **2 or more items** renders as a card; a group of 1, or items without a `comboId`, render
  plain. So deleting down to one item dissolves the card with no extra state.
- The card header shows the meal name and the group's kcal subtotal. The name comes from a
  `mealNameFor(comboId)` lookup built in `MealPlanView` from built-in `ALL_COMBOS`, the user's saved
  meals, and `EVENING_PATTERN_BY_ID`. An id that resolves to nothing (deleted saved meal) is not carded.
- Visual: a light tinted container with the header, item cards inside. Item cards already have borders,
  so the outer treatment must not add a second heavy box. Check in the real app; if cluttered, fall back
  to a header line plus a left rail with no box.
- Rendered by a small `MealGroup` component used from `MealContainer`.

## 2. Bulk clear

- `MealContainer` gets a "Temizle" action in its header when the slot has items. `MealPlanView` gets one
  "Günü temizle" for all four slots.
- No confirm dialog; the undo step replaces it.
- Each is one history step (see §3), named e.g. "Ara öğün temizlendi · 3 ürün".

## 3. Five-step undo

### History store

New module `src/lib/mealPlanHistory.ts` — a tiny external store (module-level, no React import),
subscribed by components through a small `useMealPlanHistory` hook (`useState` + `useEffect`), so every
`useMealPlan` instance records into the same history.

```
type Change =
  | { kind: "added"; entry: MealEntry }
  | { kind: "removed"; entry: MealEntry; index: number }   // index in that date's cache array
  | { kind: "quantity"; entry: MealEntry; from: number; to: number };
type Step = { id: number; label: string; householdId: string; changes: Change[] };
```

Changes are stored in the order applied; undo runs the inverses in **reverse** order. A removal records
the entry's cache index at that moment, so a restored entry goes back exactly where it was (sorting by
`position` would not work: a meal's items all share one `position`). A step's date is its first change's
`entry.date`.

- Capacity **5**; the oldest step is dropped. **In memory only**: cleared on reload and when the household
  changes. No redo (YAGNI).
- Undo pops the newest step and applies the inverse of each change (added → delete, removed → re-create
  with the original id/slot/position/`comboId`/`batchId`, quantity → patch back).
- **One user action is one step.** Adding a meal (N entries), "Yedim" on an evening card (N entries),
  clearing a slot or the day, are each a single step. Implemented as `runAsOneStep(label, fn)`: mutators
  called inside `fn` collect their changes into one step instead of pushing their own.

### `useMealPlan` changes (`src/hooks/useMealPlan.ts`)

- Split each mutator into an unrecorded `apply*` core (optimistic cache write + API call, exactly today's
  behaviour) and the public mutator, which calls the core and records the change. Undo calls the cores, so
  undoing never pushes to history.
- New: `clearSlot(slot)`, `clearDay()` (one optimistic cache update, parallel per-id DELETEs — **no API
  change**, the 12-function limit is untouched) and `undoLast()`.
- Applying an inverse to a date that is not cached: skip the optimistic write, do the API call, then
  invalidate that date's query. If the date is not the one being viewed, `undoLast` navigates there so the
  change is visible. A cached date is not invalidated, so a restored entry keeps its place.
- Restored entries are re-inserted at their recorded cache index. The server orders by
  `(date, slot, position)` only, so entries sharing a `position` come back in arbitrary order after a
  reload; found during verification, `addItem` therefore now gives each new entry one past the slot's
  highest position (read from the live cache). Entries saved before this change may still share a
  position.
- Batch-linked entries keep calling `refreshBatchLedger()` after the server write, as today.
- Failure handling stays as today: a failed API call logs a `console.warn` and leaves the optimistic state.
  An undo whose target no longer exists (already deleted elsewhere) is a no-op for that change.

### Call sites that become single steps

- `handleComboSelect` in `MealPlanView` (loop of `addItem`) → `runAsOneStep`.
- `eatEveningCombo` (loop of `logConsumption`) → `runAsOneStep`; `undoEveningCombo` /
  `undoConsumption` (loop of `removeItem`) → `runAsOneStep`.
- Grams edit (`updateItemQuantity`), entry X (`removeItem`), single add from Ürünler (`addItem`) record
  one step each.
- The shopping-list buttons on this screen are **not** part of this history; the shopping list keeps its
  own existing undo.

### UI

- **Persistent button** next to the date header: "Geri al · N" (N = steps available, ≤ 5), hidden when
  the history is empty. Each tap reverses the newest step.
- **Toast** after every recorded action: the step's label and a "Geri al" link (same action as the button).
  Auto-hides after 6 s like the shopping-list toast; hiding or swiping it away never touches the history.
- Undo itself shows no toast; the count on the button is the feedback.

### Swipeable toast

`UndoToast.tsx` is refactored into a shared `SwipeToast` shell (message, action, close, swipe) used by
both the shopping-list `UndoToast` and the new meal-plan toast. A horizontal drag moves the toast with the
finger and fades it; past about 80 px, or a quick flick, it dismisses like the X; otherwise it snaps back.
Uses `touch-action: pan-y` so vertical scrolling is unaffected. A horizontal variant sits next to
`useSwipeToDismiss` rather than changing it. Dismiss by swipe = dismiss the toast only (no restore).

If the shopping-list toast and the meal-plan toast are visible together (the day's "add to shopping list"
can raise the former), the meal-plan toast stacks above it: `App` passes `shoppingUndoVisible` to
`MealPlanView`, which raises the toast's `bottomRem`. Verify placement against the fixed bottom nav in the
real app.

## Out of scope

- Redo; persisting history across reloads; a "remove whole meal" button on a card; select mode.
- Any schema, endpoint or persisted-key change. History is in memory; grouping reads existing `combo_id`.
- Batch-preparation UI (still hidden behind `BATCH_PREP_VISIBLE`).

## Files

New: `src/lib/mealGroups.ts`, `src/lib/mealPlanHistory.ts`, `src/components/MealGroup.tsx`,
`src/components/ui/swipe-toast.tsx`, `src/hooks/useSwipeToDismissX.ts` (horizontal swipe). Changed: `src/hooks/useMealPlan.ts`, `src/components/MealPlanView.tsx`,
`src/components/MealContainer.tsx`, `src/components/UndoToast.tsx`.

## Verification

No test suite (CLAUDE.md). `npm run build` (`tsc -b`), then exercise in the real app via
`npm run vercel:dev` and the agent-session flow (the developer runs `agent-mint`):

- A meal of 3 foods shows as a card; delete two of them, the last renders plain.
- The same meal added twice to one slot shows two cards.
- Clear slot, clear day, then undo each; entries return in their original order and with their original
  `comboId`; a reload confirms the server matches.
- Six actions in a row: the button shows 5, and the oldest of the six actions cannot be undone.
- Action on day A, navigate to day B, undo: the view returns to day A and shows the restored entries.
- "Yedim" on an evening card and its undo are one step each.
- Toast swipe left and right on a phone; snap-back on a short drag; vertical scroll unaffected.

## Close-out (per CLAUDE.md)

Update together: `docs/mvp-scope/meal-construction-mvp.md` status note, the Domain L line in
`docs/roadmap_v2.md`, `docs/mvp-scope/README.md`, and the `DEC-070` note in
`nutrition-curriculum/DEC_REGISTER.md`; add a session checkpoint (significant work); refresh
`docs/CURRENT_STATE.md`. `docs/architecture.md` gets the meal-plan history pattern and the swipeable toast
under its UI/state sections. No endpoint, table, env var or persisted key changes.
