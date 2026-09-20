import { Input } from "@/components/ui/input";
import { MealFoodPicker } from "@/components/MealFoodPicker";
import type { Nutrition } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import type { BatchCompositionItem } from "@/lib/preparationBatch";

type Props = {
  items: BatchCompositionItem[];
  onChange: (items: BatchCompositionItem[]) => void;
  foods: Nutrition[];
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
};

// The "pick foods and grams by hand" editor shared by the batch form's manual
// mode and the Yemeklerim "Yeni Yemek" form: a list of food + grams rows (grams
// editable in place, "Kaldır" to drop one) and MealFoodPicker to add another.
// It only edits the array it is given — merging duplicates and validating is
// the caller's job (normalizeComposition in preparationBatch.ts).
export function MealCompositionEditor({
  items,
  onChange,
  foods,
  exclusions,
  allergenExclusions,
}: Props) {
  function setQuantity(index: number, quantityG: number) {
    onChange(items.map((item, i) => (i === index ? { ...item, quantityG } : item)));
  }

  return (
    <div>
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li
              key={`${item.foodId}-${index}`}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{item.foodId}</span>
              <Input
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={item.quantityG > 0 ? item.quantityG : ""}
                aria-label={`${item.foodId} miktarı (gram)`}
                onInput={(event: Event) => {
                  const value = Number((event.target as HTMLInputElement).value);
                  setQuantity(index, Number.isFinite(value) ? value : 0);
                }}
                className="ledger h-8 w-20 px-2 text-right tabular-nums"
              />
              <span className="text-xs text-muted-foreground">g</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="text-xs text-muted-foreground hover:text-foreground active:text-foreground">
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      )}
      <MealFoodPicker
        foods={foods}
        exclusions={exclusions}
        allergenExclusions={allergenExclusions}
        onAdd={(foodId, quantityG) => onChange([...items, { foodId, quantityG }])}
      />
    </div>
  );
}
