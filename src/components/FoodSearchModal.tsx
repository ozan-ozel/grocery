import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Nutrition } from "@/lib/nutrition";

type Props = {
  title: string;
  foods: Nutrition[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (food: Nutrition, quantityG: number) => void;
  recommendationTags?: Array<{ label: string; badge?: string }>;
  onSelectTag?: (tag: string) => void;
};

export function FoodSearchModal({
  title,
  foods,
  isOpen,
  onClose,
  onSelect,
  recommendationTags = [],
  onSelectTag,
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
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full rounded-t-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={resetModal}
            className="p-1 text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Yemek veya ürün ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Recommendation Tags */}
        {recommendationTags.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Kalan makroya göre önerilen
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendationTags.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    onSelectTag?.(tag.label);
                    resetModal();
                  }}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  {tag.label}
                  {tag.badge && (
                    <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary">
                      {tag.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Item Quantity Picker */}
        {selected ? (
          <div className="border-t border-border pt-4 space-y-3">
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
                onChange={(e) => setQuantity(e.target.value)}
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
                className="flex-1 rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary/90">
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 rounded-lg border border-border px-3 py-2 font-medium text-foreground hover:bg-accent">
                Geri
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Food List */}
            <div className="max-h-96 overflow-y-auto space-y-2 mb-3">
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
                    className="w-full text-left rounded-lg border border-border bg-background p-3 hover:bg-accent transition-colors">
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
      </div>
    </div>
  );
}
