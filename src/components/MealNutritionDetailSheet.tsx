import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "@/components/NutritionTableCell";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { MealItem } from "@/lib/localMealPlan";
import { scaleNutrition, type MacroTotals } from "@/lib/mealNutrition";

type Props = {
  title: string;
  macros: MacroTotals;
  items: MealItem[];
  catalog: NutritionMap;
  onClose: () => void;
};

const MACRO_FIELDS: { key: keyof MacroTotals; label: string; unit: string }[] =
  [
    { key: "kcal", label: "Kalori", unit: "kcal" },
    { key: "proteinG", label: "Protein", unit: "g" },
    { key: "fatG", label: "Yağ", unit: "g" },
    { key: "carbsG", label: "Karbonhidrat", unit: "g" },
    { key: "fiberG", label: "Lif", unit: "g" },
  ];

export function MealNutritionDetailSheet({
  title,
  macros,
  items,
  catalog,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20"
      />
      <div className="relative z-10 max-h-[80vh] w-full max-w-[30rem] overflow-y-auto rounded-t-xl border-t border-border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-sm font-semibold">{title} · Besin değerleri</h2>
          <Button
            type="button"
            variant="quiet"
            size="icon"
            onClick={onClose}
            aria-label="Kapat">
            <X className="size-4" />
          </Button>
        </div>
        <ul className="divide-y divide-border/60">
          {MACRO_FIELDS.map(({ key, label, unit }) => (
            <li
              key={key}
              className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="ledger tabular-nums">
                {format(macros[key])} {unit}
              </span>
            </li>
          ))}
        </ul>
        {items.length > 0 && (
          <>
            <p className="ledger pb-1 pt-4 text-xs uppercase tracking-widest text-muted-foreground">
              Besinler
            </p>
            <ul className="divide-y divide-border/60">
              {items.map(item => {
                const food: Nutrition | undefined = catalog.get(item.foodId);
                const itemMacros = food
                  ? scaleNutrition(food, item.quantityG)
                  : null;
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-2 text-sm">
                    <span>
                      {food?.name_tr ?? item.foodId} · {item.quantityG} g
                    </span>
                    <span className="ledger text-xs text-muted-foreground tabular-nums">
                      {itemMacros ? `${format(itemMacros.kcal)} kcal` : "-"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
