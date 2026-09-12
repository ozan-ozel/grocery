import { Plus } from "lucide-react";
import { useState } from "react";
import type { MealItem } from "@/lib/localMealPlan";
import type { NutritionMap } from "@/lib/nutrition";
import { MealItemCard } from "./MealItemCard";

export type MealType = "ilk" | "ara" | "son";
type TabType = "products" | "combos";

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
  catalog,
  onSelectFood,
  onSelectRecipe,
  onRemoveItem,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("products");
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

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border -mx-4 px-4">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}>
          Ürünler
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("combos")}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "combos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}>
          Kombo
        </button>
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={activeTab === "products" ? onSelectFood : onSelectRecipe}
        className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
        <Plus className="size-4" />
        {activeTab === "products" ? "Ürün Seç" : "Kombo Seç"}
      </button>

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
