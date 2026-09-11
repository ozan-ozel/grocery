import { Plus } from "lucide-react";
import type { MealItem } from "@/lib/localMealPlan";
import type { NutritionMap } from "@/lib/nutrition";
import { MealItemCard } from "./MealItemCard";

export type MealType = "ilk" | "ara" | "son";

type Props = {
  mealType: MealType;
  items: MealItem[];
  catalog: NutritionMap;
  onSelectFood: () => void;
  onSelectRecipe: () => void;
  onRemoveItem: (itemId: string) => void;
};

const MEAL_LABELS: Record<MealType, { tr: string; en: string }> = {
  ilk: { tr: "İlk Öğün", en: "First Meal" },
  ara: { tr: "Ara Öğün", en: "Snack" },
  son: { tr: "Son Öğün", en: "Last Meal" },
};

export function MealContainer({
  mealType,
  items,
  onSelectFood,
  onSelectRecipe,
  onRemoveItem,
}: Props) {
  const label = MEAL_LABELS[mealType];

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{label.tr}</h3>
        <button
          type="button"
          className="text-sm font-medium text-primary hover:text-primary/80">
          Öğün Hazırla ↓
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSelectFood}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Plus className="size-4" />
          Ürün Seç
        </button>
        <button
          type="button"
          onClick={onSelectRecipe}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Plus className="size-4" />
          Yemek Seç
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          {items.map((item) => (
            <MealItemCard
              key={item.id}
              item={item}
              nutrition={catalog.get(item.foodId)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
