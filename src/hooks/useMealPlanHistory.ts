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
