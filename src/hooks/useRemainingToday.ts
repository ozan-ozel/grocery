import { useMealPersonalization } from "./useMealPersonalization";
import { useMealPlan } from "./useMealPlan";
import { useFoodCatalog } from "./useFoodCatalog";
import type { MacroTotals } from "@/lib/mealNutrition";
import type { PersonalTargets } from "@/lib/mealPersonalization";
import type { NutritionMap } from "@/lib/nutrition";
import type { MealSlot } from "@/lib/localMealPlan";

export type RemainingToday =
  | {
      status: "no-profile";
      catalogMap: NutritionMap;
      logConsumption: (foodId: string, grams: number) => void;
    }
  | {
      status: "ready";
      target: MacroTotals;
      consumed: MacroTotals;
      remaining: MacroTotals;
      excludedFoodIds: string[];
      catalogMap: NutritionMap;
      logConsumption: (foodId: string, grams: number) => void;
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
  const { targets, profile } = useMealPersonalization(userId);
  const { catalogMap } = useFoodCatalog();
  const { dailyNutrition, addItem } = useMealPlan(householdId, catalogMap);

  function logConsumption(foodId: string, grams: number) {
    addItem(inferSlot(), foodId, grams);
  }

  if (!targets) {
    return { status: "no-profile", catalogMap, logConsumption };
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
    logConsumption,
  };
}
