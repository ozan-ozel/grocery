import { useMemo, useState } from "react";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { MealItem, MealSlot } from "@/lib/localMealPlan";
import { MacroSummaryCard } from "./MacroSummaryCard";
import { MealContainer } from "./MealContainer";
import { FoodSearchModal } from "./FoodSearchModal";
import type { MacroTotals } from "@/lib/mealNutrition";

type Props = {
  foods: Nutrition[];
  items: MealItem[];
  catalog: NutritionMap;
  targetMacros: MacroTotals;
  currentMacros: MacroTotals;
  isEstimated?: boolean;
  onAddItem: (foodId: string, quantityG: number, mealSlot: MealSlot) => void;
  onRemoveItem: (itemId: string) => void;
};


export function MealTrackingView({
  foods,
  items,
  catalog,
  targetMacros,
  currentMacros,
  isEstimated = false,
  onAddItem,
  onRemoveItem,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<MealSlot | null>(null);

  // Group items by meal slot
  const itemsBySlot = useMemo(() => {
    const slots: Record<MealSlot, MealItem[]> = {
      kahvalti: [],
      ogle: [],
      aksam: [],
      ara: [],
    };
    for (const item of items) {
      const slot = (item as MealItem & { slot?: MealSlot }).slot || "kahvalti";
      if (slots[slot]) {
        slots[slot].push(item);
      }
    }
    return slots;
  }, [items]);

  function handleSelectFood(slot: MealSlot) {
    setActiveSlot(slot);
    setModalOpen(true);
  }

  function handleSelectRecipe(slot: MealSlot) {
    // Recipe selection would follow same flow as food for now
    handleSelectFood(slot);
  }

  function handleFoodSelect(food: Nutrition, quantityG: number) {
    if (activeSlot) {
      onAddItem(food.name_tr, quantityG, activeSlot);
      setModalOpen(false);
      setActiveSlot(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Daily Macro Summary */}
      <MacroSummaryCard
        remaining={currentMacros}
        target={targetMacros}
        isEstimated={isEstimated}
      />

      {/* Meal Containers */}
      <div className="space-y-3">
        <MealContainer
          mealType="ilk"
          items={itemsBySlot.kahvalti}
          catalog={catalog}
          onSelectFood={() => handleSelectFood("kahvalti")}
          onSelectRecipe={() => handleSelectRecipe("kahvalti")}
          onRemoveItem={onRemoveItem}
        />
        <MealContainer
          mealType="ara"
          items={itemsBySlot.ara}
          catalog={catalog}
          onSelectFood={() => handleSelectFood("ara")}
          onSelectRecipe={() => handleSelectRecipe("ara")}
          onRemoveItem={onRemoveItem}
        />
        <MealContainer
          mealType="son"
          items={itemsBySlot.aksam}
          catalog={catalog}
          onSelectFood={() => handleSelectFood("aksam")}
          onSelectRecipe={() => handleSelectRecipe("aksam")}
          onRemoveItem={onRemoveItem}
        />
      </div>

      {/* Food Search Modal */}
      <FoodSearchModal
        title={activeSlot ? "Ürün Seç / Ara" : "Yemek Ara"}
        foods={foods}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActiveSlot(null);
        }}
        onSelect={handleFoodSelect}
      />
    </div>
  );
}
