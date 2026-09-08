import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Nutrition } from "@/lib/nutrition";
import {
  hasHardExclusion,
  hasSoftConstraint,
  hasHardAllergenClassExclusion,
  hasSoftAllergenClassConstraint,
  type FoodExclusion,
  type AllergenClassExclusion,
} from "@/lib/foodExclusions";

type Props = {
  foods: Nutrition[];
  onAdd: (foodId: string, quantityG: number) => void;
  // Optional so existing/other callers aren't forced to thread it through
  // before they have a source for it; treated as "no exclusions" when
  // omitted, never as "skip the check".
  exclusions?: FoodExclusion[];
  allergenExclusions?: AllergenClassExclusion[];
};

export function MealFoodPicker({
  foods,
  onAdd,
  exclusions = [],
  allergenExclusions = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Nutrition | null>(null);
  const [quantity, setQuantity] = useState("100");

  const queryLower = query.trim().toLocaleLowerCase("tr-TR");
  // Hard-tier (allergy/unclear/unclassified/preference) foods are removed
  // outright — this is a "what did you eat" logging surface, not a
  // reference lookup (Phase 9 §20 Milestone 1). Soft-tier (intolerance)
  // foods stay pickable, just flagged. Allergen-class exclusions apply the
  // same split — a food UNKNOWN for an excluded hard-tier class is removed
  // too (conservative escalation, this milestone's own decision), not just
  // a confirmed PRESENT match.
  const visibleFoods = foods.filter(
    (food) =>
      // Passing the full food object (not just .name_tr) lets a food-level
      // exclusion match by its canonical food_id too, once one exists
      // (Canonical Food Identity decision 6).
      !hasHardExclusion(exclusions, food) &&
      !hasHardAllergenClassExclusion(allergenExclusions, food)
  );
  const results = queryLower
    ? visibleFoods.filter(food =>
        food.name_tr.toLocaleLowerCase("tr-TR").includes(queryLower),
      )
    : visibleFoods.slice(0, 30);

  function reset() {
    setOpen(false);
    setQuery("");
    setSelected(null);
    setQuantity("100");
  }

  function confirmAdd() {
    if (!selected) return;
    const quantityG = Number(quantity);
    if (!Number.isFinite(quantityG) || quantityG <= 0) return;
    onAdd(selected.name_tr, quantityG);
    reset();
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="quiet"
        size="sm"
        onClick={() => setOpen(true)}
        className="mt-2 active:text-foreground">
        <Plus className="size-3.5" />
        Besin ekle
      </Button>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-border bg-card p-2 shadow-sm">
      {selected ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 text-sm">{selected.name_tr}</span>
          <Input
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            value={quantity}
            aria-label={`${selected.name_tr} miktarı (gram)`}
            onInput={(event: Event) =>
              setQuantity((event.target as HTMLInputElement).value)
            }
            className="ledger h-9 w-20 px-2 text-right tabular-nums"
          />
          <span className="text-xs text-muted-foreground">g</span>
          <Button
            type="button"
            size="sm"
            onClick={confirmAdd}
            className="active:bg-primary/80">
            Ekle
          </Button>
          <Button type="button" variant="quiet" size="sm" onClick={reset}>
            Vazgeç
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              autoFocus
              placeholder="Besin ara"
              aria-label="Besin ara"
              className="pl-9"
              onInput={(event: Event) =>
                setQuery((event.target as HTMLInputElement).value)
              }
            />
          </div>
          <ul className="mt-1 max-h-56 overflow-y-auto">
            {results.length === 0 && (
              <li className="px-2 py-3 text-sm text-muted-foreground">
                "{query.trim()}" ile eşleşen besin yok.
              </li>
            )}
            {results.map(food => (
              <li key={food.name_tr}>
                <button
                  type="button"
                  onClick={() => setSelected(food)}
                  className="flex w-full items-center justify-between px-2 py-2 text-left text-sm hover:bg-accent">
                  <span>
                    {food.name_tr}
                    {(hasSoftConstraint(exclusions, food) ||
                      hasSoftAllergenClassConstraint(allergenExclusions, food)) && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {" "}(hassasiyetin var)
                      </span>
                    )}
                  </span>
                  <span className="ledger text-xs text-muted-foreground">
                    {Math.round(food.kcal_per_100)} kcal/100g
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={reset}
            className="mt-1">
            Kapat
          </Button>
        </>
      )}
    </div>
  );
}
