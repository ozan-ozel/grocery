import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { LoadingBlock } from "@/components/LoadingBlock";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { useMealPersonalization } from "@/hooks/useMealPersonalization";
import { MEAL_SLOTS, type MealItem, type MealSlot } from "@/lib/localMealPlan";
import { occasionProteinTargetG, calculateTargets } from "@/lib/mealPersonalization";
import { scaleNutrition, type MacroTotals } from "@/lib/mealNutrition";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import { format } from "@/components/NutritionTableCell";
import { MealFoodPicker } from "@/components/MealFoodPicker";
import { MealNutritionDetailSheet } from "@/components/MealNutritionDetailSheet";
import { BatchPlanner } from "@/components/BatchPlanner";
import { MacroSummaryCard } from "@/components/MacroSummaryCard";
import { MealContainer } from "@/components/MealContainer";
import { FoodSearchModal } from "@/components/FoodSearchModal";

type Props = {
  userId: string | null;
  householdId: string | null;
  // MVP-1 PROVISIONAL (PSM Iteration 1, DEC-071): reuses the shopping tab's
  // existing addItem exactly as-is (name + free-text qty, no unit parsing or
  // quantity aggregation across duplicate ingredients). REVISIT AFTER QA-1.
  onAddShoppingItem: (name: string, qty: string) => void;
};

export function MealPlanView({ userId, householdId, onAddShoppingItem }: Props) {
  const { foods, catalogMap, status } = useFoodCatalog();
  // Own instance, matching PersonalPlanView's and useRemainingToday's own
  // pattern — NOT App.tsx's top-level `personalization`, which is mounted
  // once at the app root and never remounts on a tab switch, so it would
  // never observe an edit made through one of those other instances
  // (confirmed by manual QA: threading App.tsx's stale copy down as a prop
  // showed exclusions set moments earlier in Kişisel Plan as absent here).
  const { profile: personalizationProfile } = useMealPersonalization(userId);
  const foodExclusions = personalizationProfile.foodExclusions;
  const allergenExclusions = personalizationProfile.allergenExclusions;
  const {
    date,
    dateLabel,
    isLoading,
    goToPrevDay,
    goToNextDay,
    itemsForSlot,
    allItems,
    addItem,
    updateItemQuantity,
    removeItem,
    slotNutrition,
    dailyNutrition,
  } = useMealPlan(householdId, catalogMap);
  const totals = dailyNutrition();
  const hasTotals =
    totals.kcal > 0 ||
    totals.proteinG > 0 ||
    totals.fatG > 0 ||
    totals.carbsG > 0;
  const [dailyDetailOpen, setDailyDetailOpen] = useState(false);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<MealSlot | null>(null);

  const targets = calculateTargets(personalizationProfile);
  const targetMacros: MacroTotals = {
    kcal: targets.targetKcal,
    proteinG: (targets.proteinG.min + targets.proteinG.max) / 2,
    fatG: (targets.fatG.min + targets.fatG.max) / 2,
    carbsG: (targets.carbsG.min + targets.carbsG.max) / 2,
    fiberG: (targets.fiberG.min + targets.fiberG.max) / 2,
  };

  function handleFoodSelect(food: Nutrition, quantityG: number) {
    if (activeSlot) {
      addItem(activeSlot, food.name_tr, quantityG);
      setFoodModalOpen(false);
      setActiveSlot(null);
    }
  }

  // MVP-1 PROVISIONAL (DEC-071): the smallest viable meal-plan -> shopping
  // translation — walk this day's planned items and add each one's food name
  // + gram quantity to the active shopping list via the existing addItem
  // (same name/alias resolution and near-duplicate dedup shopping already
  // uses; no quantity aggregation across repeated ingredients, no
  // pantry/store/budget awareness). REVISIT AFTER QA-1.
  function addDayToShoppingList() {
    for (const item of allItems()) {
      const food = catalogMap.get(item.foodId);
      onAddShoppingItem(food?.name_tr ?? item.foodId, `${item.quantityG}g`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="quiet"
          size="icon"
          onClick={goToPrevDay}
          aria-label="Önceki gün">
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-lg font-semibold tracking-tight">
          {dateLabel}
        </span>
        <Button
          type="button"
          variant="quiet"
          size="icon"
          onClick={goToNextDay}
          aria-label="Sonraki gün">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {status === "error" && (
        <p className="px-1 text-xs text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}

      {!isLoading && (
        <>
          {/* Daily Macro Summary */}
          <MacroSummaryCard
            remaining={totals}
            target={targetMacros}
            isEstimated={false}
          />

          {/* Meal Containers */}
          <div className="space-y-3">
            {MEAL_SLOTS.map(({ slot, label }) => (
              <MealContainer
                key={slot}
                mealType={getMealType(slot)}
                items={itemsForSlot(slot)}
                catalog={catalogMap}
                onSelectFood={() => {
                  setActiveSlot(slot);
                  setFoodModalOpen(true);
                }}
                onSelectRecipe={() => {
                  setActiveSlot(slot);
                  setFoodModalOpen(true);
                }}
                onRemoveItem={itemId => removeItem(slot, itemId)}
              />
            ))}
          </div>
        </>
      )}

      {isLoading && (
        <div className="space-y-2">
          {MEAL_SLOTS.map(({ slot }) => (
            <LoadingBlock key={slot} className="h-28" />
          ))}
        </div>
      )}

      {/* Food Search Modal */}
      <FoodSearchModal
        title={activeSlot ? "Ürün Seç / Ara" : "Yemek Ara"}
        foods={foods}
        isOpen={foodModalOpen}
        onClose={() => {
          setFoodModalOpen(false);
          setActiveSlot(null);
        }}
        onSelect={handleFoodSelect}
      />
      {dailyDetailOpen && (
        <MealNutritionDetailSheet
          title="Günlük toplam"
          macros={totals}
          items={MEAL_SLOTS.flatMap(({ slot }) => itemsForSlot(slot))}
          catalog={catalogMap}
          onClose={() => setDailyDetailOpen(false)}
        />
      )}

      <BatchPlanner
        householdId={householdId}
        foods={foods}
        catalog={catalogMap}
        exclusions={foodExclusions}
        allergenExclusions={allergenExclusions}
        defaultDate={date}
      />

      {/* Add to shopping list button */}
      {hasTotals && (
        <Button
          type="button"
          variant="default"
          size="sm"
          className="w-full"
          onClick={addDayToShoppingList}>
          Bu günü alışveriş listesine ekle
        </Button>
      )}
    </div>
  );
}

function getMealType(slot: MealSlot): "ilk" | "ara" | "son" {
  if (slot === "kahvalti") return "ilk";
  if (slot === "aksam") return "son";
  return "ara";
}

function MealItemRow({
  item,
  food,
  onUpdateQuantity,
  onRemove,
}: {
  item: MealItem;
  food: Nutrition | undefined;
  onUpdateQuantity: (quantityG: number) => void;
  onRemove: () => void;
}) {
  const [text, setText] = useState(String(item.quantityG));
  useEffect(() => setText(String(item.quantityG)), [item.quantityG]);
  function commit() {
    const quantityG = Number(text);
    if (Number.isFinite(quantityG) && quantityG > 0)
      onUpdateQuantity(quantityG);
    else setText(String(item.quantityG));
  }
  const name = food?.name_tr ?? item.foodId;
  const itemMacros = food ? scaleNutrition(food, item.quantityG) : null;
  return (
    <li className="flex items-center gap-2 border-b border-border py-2">
      <div className="min-w-0 flex-1">
        <div className="text-[0.975rem]">
          {name}
          {item.batchId && (
            <span className="ml-1.5 rounded-full border border-border px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wide text-muted-foreground">
              Parti
            </span>
          )}
        </div>
        {itemMacros && (
          <div className="ledger mt-0.5 text-xs tabular-nums text-muted-foreground">
            {Math.round(itemMacros.kcal)} kcal · P {format(itemMacros.proteinG)}{" "}
            · Y {format(itemMacros.fatG)} · K {format(itemMacros.carbsG)} · L{" "}
            {format(itemMacros.fiberG)}
          </div>
        )}
      </div>
      <Input
        type="number"
        inputMode="decimal"
        min="1"
        step="1"
        value={text}
        aria-label={`${name} miktarı (gram)`}
        onInput={(event: Event) =>
          setText((event.target as HTMLInputElement).value)
        }
        onBlur={commit}
        className="ledger h-9 w-16 px-2 text-right tabular-nums"
      />
      <span className="text-xs text-muted-foreground">g</span>
      <ConfirmDeleteButton
        onConfirm={onRemove}
        label={`${name} kaldır`}
        triggerIcon={X}
        iconClassName="size-4"
      />
    </li>
  );
}

function MacroSummary({ macros }: { macros: MacroTotals }) {
  return (
    <span className="ledger tabular-nums text-sm">
      {Math.round(macros.kcal)} kcal · P {format(macros.proteinG)} · Y{" "}
      {format(macros.fatG)} · K {format(macros.carbsG)}
    </span>
  );
}
