import type { MealItem } from "@/lib/localMealPlan";
import { calculateItemsNutrition } from "@/lib/localMealPlan";
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
  onUpdateItemQuantity?: (itemId: string, quantityG: number) => void;
  isOnShoppingList: (foodId: string) => boolean;
  onToggleShoppingList: (item: MealItem) => void;
};

const MEAL_LABELS: Record<MealType, { tr: string; en: string }> = {
  ilk: { tr: "İlk Öğün", en: "First Meal" },
  ara: { tr: "Ara Öğün", en: "Snack" },
  son: { tr: "Son Öğün", en: "Last Meal" },
};

export function MealContainer({
  mealType,
  items,
  catalog,
  onSelectFood,
  onSelectRecipe,
  onRemoveItem,
  onUpdateItemQuantity,
  isOnShoppingList,
  onToggleShoppingList,
}: Props) {
  const updateItemQuantity = onUpdateItemQuantity ?? (() => {});
  const label = MEAL_LABELS[mealType];
  const totals =
    items.length > 0 ? calculateItemsNutrition(items, catalog) : null;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-semibold text-foreground">{label.tr}</h3>
        {totals && (
          <p className="text-xs text-muted-foreground">
            {Math.round(totals.kcal)} kcal · P: {Math.round(totals.proteinG)}g ·
            K: {Math.round(totals.carbsG)}g · Y: {Math.round(totals.fatG)}g
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSelectFood}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <span aria-hidden="true">+</span>
          Ürünler
        </button>
        <button
          type="button"
          onClick={onSelectRecipe}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <span aria-hidden="true">+</span>
          Yemekler
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          {items.map(item => (
            <MealItemCard
              key={item.id}
              item={item}
              nutrition={catalog.get(item.foodId)}
              onRemove={() => onRemoveItem(item.id)}
              onUpdateQuantity={quantityG =>
                updateItemQuantity(item.id, quantityG)
              }
              isOnShoppingList={isOnShoppingList(item.foodId)}
              onToggleShoppingList={() => onToggleShoppingList(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
