import { useState } from "react";
import { Search } from "lucide-react";
import type { Nutrition } from "@/lib/nutrition";
import { BottomSheet } from "@/components/ui/bottom-sheet";

type Props = {
  title: string;
  foods: Nutrition[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (food: Nutrition, quantityG: number) => void;
};

export function FoodSearchModal({
  title,
  foods,
  isOpen,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Nutrition | null>(null);
  const [quantity, setQuantity] = useState("100");

  const queryLower = query.trim().toLowerCase();
  const results = queryLower
    ? foods.filter((food) =>
        food.name_tr.toLowerCase().includes(queryLower),
      )
    : foods.slice(0, 30);

  function handleSelect(food: Nutrition) {
    const quantityG = Number(quantity);
    if (!Number.isFinite(quantityG) || quantityG <= 0) return;
    onSelect(food, quantityG);
    resetModal();
  }

  function resetModal() {
    setQuery("");
    setSelected(null);
    setQuantity("100");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <BottomSheet
      title={title}
      titleId="food-search-modal-title"
      onClose={resetModal}>
      {/* Search Input */}
      <div className="relative mb-4 shrink-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Yemek veya ürün ara..."
          value={query}
          onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
          autoFocus
          className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Selected Item Quantity Picker */}
      {selected ? (
        <div className="shrink-0 space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{selected.name_tr}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(selected.kcal_per_100 * (Number(quantity) / 100))} kcal
              </p>
            </div>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity((e.target as HTMLInputElement).value)}
              className="ledger w-24 rounded border border-border px-2 py-1.5 text-right text-sm"
              aria-label="Quantity"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            P: {Math.round(selected.protein_g * (Number(quantity) / 100))}g · K:{" "}
            {Math.round(selected.carbs_g * (Number(quantity) / 100))}g · Y:{" "}
            {Math.round(selected.fat_g * (Number(quantity) / 100))}g
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSelect(selected)}
              className="flex-1 rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary/90 active:bg-primary/90">
              Ekle
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex-1 rounded-lg border border-border px-3 py-2 font-medium text-foreground hover:bg-accent active:bg-accent">
              Geri
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Food List */}
          {/* min-h-0 + overscroll-contain: the list — not the search field —
              is what gives when the keyboard shrinks the sheet, and a
              scroll that hits its end must not chain into the sheet drag
              or the page behind. */}
          <div className="mb-3 min-h-0 max-h-96 space-y-2 overflow-y-auto overscroll-contain">
            {results.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                "{query.trim()}" ile eşleşen yemek yok
              </div>
            ) : (
              results.map((food) => (
                <button
                  key={food.name_tr}
                  type="button"
                  onClick={() => setSelected(food)}
                  className="w-full text-left rounded-lg border border-border bg-background p-3 hover:bg-accent active:bg-accent transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm">
                        {food.name_tr}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        100g: {Math.round(food.kcal_per_100)} kcal · P:{" "}
                        {Math.round(food.protein_g)}g · K:{" "}
                        {Math.round(food.carbs_g)}g · Y:{" "}
                        {Math.round(food.fat_g)}g
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </BottomSheet>
  );
}
