import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { MEAL_SLOTS, type MealItem } from "@/lib/localMealPlan";
import { scaleNutrition, type MacroTotals } from "@/lib/mealNutrition";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import { format } from "@/components/NutritionTableCell";
import { MealFoodPicker } from "@/components/MealFoodPicker";
import { MealNutritionDetailSheet } from "@/components/MealNutritionDetailSheet";

type Props = { householdId: string | null };

export function MealPlanView({ householdId }: Props) {
  const { foods, catalogMap, status } = useFoodCatalog();
  const {
    dateLabel,
    goToPrevDay,
    goToNextDay,
    itemsForSlot,
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

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
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
        <p className="px-1 pb-3 text-xs text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}
      <div className="flex flex-col gap-4">
        {MEAL_SLOTS.map(({ slot, label }) => (
          <MealSection
            key={slot}
            label={label}
            items={itemsForSlot(slot)}
            foods={foods}
            catalog={catalogMap}
            macros={slotNutrition(slot)}
            onAddItem={(foodId, quantityG) => addItem(slot, foodId, quantityG)}
            onUpdateQuantity={(itemId, quantityG) =>
              updateItemQuantity(slot, itemId, quantityG)
            }
            onRemoveItem={itemId => removeItem(slot, itemId)}
          />
        ))}
      </div>
      {hasTotals && (
        <div className="mt-6 rounded-lg border border-border px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Günlük toplam
            </span>
            <div className="flex items-center gap-2">
              <MacroSummary macros={totals} />
              <button
                type="button"
                onClick={() => setDailyDetailOpen(true)}
                aria-label="Günlük besin detayı"
                className="rounded p-1 text-muted-foreground hover:text-foreground">
                <Info className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {dailyDetailOpen && (
        <MealNutritionDetailSheet
          title="Günlük toplam"
          macros={totals}
          items={MEAL_SLOTS.flatMap(({ slot }) => itemsForSlot(slot))}
          catalog={catalogMap}
          onClose={() => setDailyDetailOpen(false)}
        />
      )}
    </div>
  );
}

function MealSection({
  label,
  items,
  foods,
  catalog,
  macros,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
}: {
  label: string;
  items: MealItem[];
  foods: Nutrition[];
  catalog: NutritionMap;
  macros: MacroTotals;
  onAddItem: (foodId: string, quantityG: number) => void;
  onUpdateQuantity: (itemId: string, quantityG: number) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border p-3">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {items.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">
          Henüz besin eklenmedi.
        </p>
      ) : (
        <ul className="mt-1">
          {items.map(item => (
            <MealItemRow
              key={item.id}
              item={item}
              food={catalog.get(item.foodId)}
              onUpdateQuantity={quantityG =>
                onUpdateQuantity(item.id, quantityG)
              }
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </ul>
      )}
      <MealFoodPicker foods={foods} onAdd={onAddItem} />
      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <span className="text-xs text-muted-foreground">
          {items.length} besin
        </span>
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          aria-label={`${label} besin detayı`}
          className="rounded p-1 text-muted-foreground hover:text-foreground">
          <Info className="size-4" />
        </button>
      </div>
      {detailOpen && (
        <MealNutritionDetailSheet
          title={label}
          macros={macros}
          items={items}
          catalog={catalog}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
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
        <div className="text-[0.975rem]">{name}</div>
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
