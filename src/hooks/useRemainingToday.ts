import { useMealPersonalization } from "./useMealPersonalization";
import { todayDateStr, useMealPlan } from "./useMealPlan";
import { useFoodCatalog } from "./useFoodCatalog";
import type { MacroTotals } from "@/lib/mealNutrition";
import type { PersonalTargets } from "@/lib/mealPersonalization";
import type { NutritionMap } from "@/lib/nutrition";
import type { MealItem, MealSlot } from "@/lib/localMealPlan";

// One ingredient logged via logConsumption — enough to undo it later
// (removeItem needs both the entry id and the slot it was filed under).
export type LoggedEntry = { id: string; slot: MealSlot };

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

// Target ranges (protein/fat/carbs/fiber) collapse to their midpoint for a
// single "remaining" number — the range itself stays visible in Kişisel Plan.
function targetToMacros(targets: PersonalTargets): MacroTotals {
  return {
    kcal: targets.targetKcal,
    proteinG: (targets.proteinG.min + targets.proteinG.max) / 2,
    fatG: (targets.fatG.min + targets.fatG.max) / 2,
    carbsG: (targets.carbsG.min + targets.carbsG.max) / 2,
    fiberG: (targets.fiberG.min + targets.fiberG.max) / 2,
  };
}

function subtractMacros(target: MacroTotals, consumed: MacroTotals): MacroTotals {
  return {
    kcal: target.kcal - consumed.kcal,
    proteinG: target.proteinG - consumed.proteinG,
    fatG: target.fatG - consumed.fatG,
    carbsG: target.carbsG - consumed.carbsG,
    fiberG: target.fiberG - consumed.fiberG,
  };
}

// Starting guess (per the design spec's Open Items) — morning/midday/evening/late
// map to breakfast/lunch/dinner/snack. Tune once real usage shows how people
// actually use "Yedim de" at different times of day.
function inferSlot(now: Date = new Date()): MealSlot {
  const hour = now.getHours();
  if (hour < 11) return "kahvalti";
  if (hour < 15) return "ogle";
  if (hour < 21) return "aksam";
  return "ara";
}

export function useRemainingToday(
  userId: string | null,
  householdId: string | null
): RemainingToday {
  const { targets, profile, hasSavedProfile } = useMealPersonalization(userId);
  const { catalogMap, status: catalogStatus } = useFoodCatalog();
  // Bugün always means today, whatever day Yemek Planı is currently browsing
  // (both read the same ?date URL param, so this instance opts out of it).
  const {
    dailyNutrition,
    addItem,
    removeItem,
    allItems,
    isLoading: entriesLoading,
  } = useMealPlan(householdId, catalogMap, {
    pinnedDate: todayDateStr(),
  });

  function logConsumption(foodId: string, grams: number, comboId?: string): LoggedEntry {
    const slot = inferSlot();
    const id = addItem(slot, foodId, grams, comboId);
    return { id, slot };
  }

  function undoConsumption(entries: LoggedEntry[]) {
    for (const entry of entries) removeItem(entry.slot, entry.id);
  }

  // `targets` alone can't answer this: calculateTargets(DEFAULT_PROFILE)
  // returns valid numbers for a body nobody entered.
  if (!hasSavedProfile || !targets) {
    return { status: "no-profile", catalogMap, logConsumption, undoConsumption };
  }

  if (catalogStatus === "error") {
    return { status: "catalog-error", logConsumption, undoConsumption };
  }

  // Anything short of "ready" (today: "loading"; "idle" is in useFoodCatalog's
  // Status union but unreachable) means an empty catalogMap, so no combo could
  // score even if one fit. Today's meal_entries still loading gets the same
  // treatment — otherwise remaining would flash the full target before
  // dropping to the real (already-consumed) value a moment later.
  if (catalogStatus !== "ready" || entriesLoading) {
    return { status: "loading-catalog", logConsumption, undoConsumption };
  }

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
}
