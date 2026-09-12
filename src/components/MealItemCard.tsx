import { useEffect, useRef, useState } from "react";
import { Pencil, ShoppingCart, X } from "lucide-react";
import type { MealItem } from "@/lib/localMealPlan";
import type { Nutrition } from "@/lib/nutrition";
import { scaleNutrition } from "@/lib/mealNutrition";

type Props = {
  item: MealItem;
  nutrition: Nutrition | undefined;
  onRemove: () => void;
  onUpdateQuantity: (quantityG: number) => void;
  isOnShoppingList: boolean;
  onToggleShoppingList: () => void;
};

export function MealItemCard({
  item,
  nutrition,
  onRemove,
  onUpdateQuantity,
  isOnShoppingList,
  onToggleShoppingList,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftQuantity, setDraftQuantity] = useState(String(item.quantityG));
  const quantityInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }
  }, [isEditing]);

  if (!nutrition) return null;

  const scaled = scaleNutrition(nutrition, item.quantityG);
  const macroString = `P: ${Math.round(scaled.proteinG)}g K: ${Math.round(scaled.carbsG)}g Y: ${Math.round(scaled.fatG)}g ${Math.round(scaled.kcal)} kcal`;

  function commitEdit() {
    const nextValue = Number(draftQuantity);
    if (!Number.isFinite(nextValue) || nextValue <= 0) {
      setDraftQuantity(String(item.quantityG));
      setIsEditing(false);
      return;
    }
    onUpdateQuantity(nextValue);
    setIsEditing(false);
  }

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-background p-3">
      <div className="h-full w-1 bg-blue-500 rounded-full" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {nutrition.name_tr}
            </h4>
            {isEditing ? (
              <div className="mt-1 flex items-center gap-2">
                <input
                  ref={quantityInputRef}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={draftQuantity}
                  onChange={event =>
                    setDraftQuantity((event.target as HTMLInputElement).value)
                  }
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitEdit();
                    } else if (event.key === "Escape") {
                      event.preventDefault();
                      setDraftQuantity(String(item.quantityG));
                      setIsEditing(false);
                    }
                  }}
                  className="ledger h-7 w-20 rounded border border-border bg-background px-2 text-right text-xs text-foreground"
                  aria-label={`${nutrition.name_tr} gram miktarı`}
                />
                <span className="text-xs text-muted-foreground">g</span>
                <button
                  type="button"
                  onClick={commitEdit}
                  className="rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90">
                  Tamam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftQuantity(String(item.quantityG));
                    setIsEditing(false);
                  }}
                  className="rounded border border-border px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground">
                  İptal
                </button>
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.quantityG}g
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`${nutrition.name_tr} gram miktarını düzenle`}
                title="Gram miktarını düzenle">
                <Pencil className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onToggleShoppingList}
              className={`p-1 transition-colors ${isOnShoppingList ? "text-signal" : "text-muted-foreground hover:text-foreground"}`}
              aria-label={
                isOnShoppingList
                  ? "Alışveriş listesinden çıkar"
                  : "Alışveriş listesine ekle"
              }
              title={
                isOnShoppingList
                  ? "Alışveriş listesinden çıkar"
                  : "Alışveriş listesine ekle"
              }>
              <ShoppingCart className="size-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Remove item">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{macroString}</p>
      </div>
    </div>
  );
}
