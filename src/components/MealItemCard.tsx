import { X } from "lucide-react";
import type { MealItem } from "@/lib/localMealPlan";
import type { Nutrition } from "@/lib/nutrition";
import { scaleNutrition } from "@/lib/mealNutrition";

type Props = {
  item: MealItem;
  nutrition: Nutrition | undefined;
  onRemove: () => void;
};

export function MealItemCard({ item, nutrition, onRemove }: Props) {
  if (!nutrition) return null;

  const scaled = scaleNutrition(nutrition, item.quantityG);
  const macroString = `P: ${Math.round(scaled.proteinG)}g K: ${Math.round(scaled.carbsG)}g Y: ${Math.round(scaled.fatG)}g ${Math.round(scaled.kcal)} kcal`;

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-background p-3">
      <div className="h-full w-1 bg-blue-500 rounded-full" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {nutrition.name_tr}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.quantityG}g
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Remove item">
            <X className="size-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{macroString}</p>
      </div>
    </div>
  );
}
