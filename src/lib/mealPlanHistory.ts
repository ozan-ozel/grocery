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
