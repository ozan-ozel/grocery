import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Nutrition } from "@/lib/nutrition";

type Props = {
  foods: Nutrition[];
  onAdd: (foodId: string, quantityG: number) => void;
};

export function MealFoodPicker({ foods, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Nutrition | null>(null);
  const [quantity, setQuantity] = useState("100");

  const queryLower = query.trim().toLocaleLowerCase("tr-TR");
  const results = queryLower
    ? foods.filter(food =>
        food.name_tr.toLocaleLowerCase("tr-TR").includes(queryLower),
      )
    : foods.slice(0, 30);

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
        className="mt-2">
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
          <Button type="button" size="sm" onClick={confirmAdd}>
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
                  <span>{food.name_tr}</span>
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
