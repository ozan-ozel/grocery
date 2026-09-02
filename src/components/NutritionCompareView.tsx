import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFoodCatalog, type Status } from "@/hooks/useFoodCatalog";
import { format } from "@/components/NutritionTableCell";
import { NutritionRadarChart } from "@/components/NutritionRadarChart";
import { NutritionBarChart } from "@/components/NutritionBarChart";
import { LoadingBlock } from "@/components/LoadingBlock";
import { cn } from "@/lib/utils";
import type { Nutrition } from "@/lib/nutrition";

const ROWS: { key: keyof Nutrition; label: string }[] = [
  { key: "kcal_per_100", label: "kcal" },
  { key: "protein_g", label: "Protein (P)" },
  { key: "fat_g", label: "Yağ (Y)" },
  { key: "carbs_g", label: "Karbonhidrat (K)" },
  { key: "fiber_g", label: "Lif (L)" },
];

// Compares exactly two foods, per 100g (same basis as every other nutrition
// table in the app — no serving-size input). Deliberately not N-way: a fixed
// 3-column table (nutrient + 2 values) stays mobile-friendly with no
// horizontal scroll, whatever the screen width.
export function NutritionCompareView() {
  const { foods, status } = useFoodCatalog();
  const [foodA, setFoodA] = useState<Nutrition | null>(null);
  const [foodB, setFoodB] = useState<Nutrition | null>(null);
  const [chartType, setChartType] = useState<"radar" | "bar">("radar");

  if (status === "error") {
    return (
      <p className="px-1 py-8 text-sm text-muted-foreground">
        Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <FoodSlot
          label="1. besin"
          foods={foods}
          catalogStatus={status}
          selected={foodA}
          otherSelected={foodB}
          onSelect={setFoodA}
          onClear={() => setFoodA(null)}
        />
        <FoodSlot
          label="2. besin"
          foods={foods}
          catalogStatus={status}
          selected={foodB}
          otherSelected={foodA}
          onSelect={setFoodB}
          onClear={() => setFoodB(null)}
        />
      </div>

      {foodA || foodB ? (
        <>
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-2 pr-2 text-left font-normal">100g</th>
              <th className="py-2 px-1 text-right font-normal">
                {foodA ? foodA.name_tr : "—"}
              </th>
              <th className="py-2 pl-1 text-right font-normal">
                {foodB ? foodB.name_tr : "—"}
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ key, label }) => {
              const a = foodA ? (foodA[key] as number) : undefined;
              const b = foodB ? (foodB[key] as number) : undefined;
              const aHigher = a !== undefined && b !== undefined && a > b;
              const bHigher = a !== undefined && b !== undefined && b > a;
              return (
                <tr key={key} className="border-b border-border/60">
                  <td className="py-2 pr-2 text-muted-foreground">{label}</td>
                  <td
                    className={cn(
                      "ledger px-1 py-2 text-right tabular-nums",
                      aHigher && "rounded bg-secondary text-amber-600"
                    )}
                  >
                    {a !== undefined ? format(a) : "—"}
                  </td>
                  <td
                    className={cn(
                      "ledger pl-1 py-2 text-right tabular-nums",
                      bHigher && "rounded bg-secondary text-amber-600"
                    )}
                  >
                    {b !== undefined ? format(b) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 inline-flex items-center gap-1 rounded-lg bg-accent/50 p-1">
          <button
            type="button"
            onClick={() => setChartType("radar")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              chartType === "radar"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Radar
          </button>
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              chartType === "bar"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sütun
          </button>
        </div>

        {chartType === "radar" ? (
          <NutritionRadarChart foodA={foodA} foodB={foodB} />
        ) : (
          <NutritionBarChart foodA={foodA} foodB={foodB} />
        )}
        </>
      ) : (
        <p className="px-1 pt-6 text-sm text-muted-foreground">
          Karşılaştırmak için besin seç.
        </p>
      )}
    </div>
  );
}

function FoodSlot({
  label,
  foods,
  catalogStatus,
  selected,
  otherSelected,
  onSelect,
  onClear,
}: {
  label: string;
  foods: Nutrition[];
  catalogStatus: Status;
  selected: Nutrition | null;
  otherSelected: Nutrition | null;
  onSelect: (food: Nutrition) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  if (!open && selected) {
    return (
      <div className="flex items-center justify-between gap-1 rounded-md border border-border bg-card px-2 py-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-w-0 flex-1 truncate text-left text-sm"
        >
          {selected.name_tr}
        </button>
        <button
          type="button"
          aria-label={`${selected.name_tr} seçimini kaldır`}
          onClick={onClear}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-signal"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  const queryLower = query.trim().toLocaleLowerCase("tr-TR");
  const results = (
    queryLower
      ? foods.filter((f) => f.name_tr.toLocaleLowerCase("tr-TR").includes(queryLower))
      : foods
  ).filter((f) => f.name_tr !== otherSelected?.name_tr);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-dashed border-border px-2 py-2 text-left text-sm text-muted-foreground hover:text-foreground"
      >
        {label} seç
      </button>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-2 shadow-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          autoFocus
          placeholder="Besin ara"
          aria-label={`${label} ara`}
          className="h-8 pl-8 text-sm"
          onInput={(e: Event) => setQuery((e.target as HTMLInputElement).value)}
          onBlur={() => {
            if (!query.trim()) setOpen(false);
          }}
        />
      </div>
      <ul className="mt-1 max-h-48 overflow-y-auto">
        {catalogStatus === "loading" && (
          <li className="space-y-1 p-1">
            <LoadingBlock className="h-7" />
            <LoadingBlock className="h-7" />
            <LoadingBlock className="h-7" />
          </li>
        )}
        {catalogStatus !== "loading" && results.length === 0 && (
          <li className="px-2 py-2 text-xs text-muted-foreground">Eşleşen besin yok.</li>
        )}
        {catalogStatus !== "loading" && results.map((food) => (
          <li key={food.name_tr}>
            <button
              type="button"
              onMouseDown={(e: Event) => e.preventDefault()}
              onClick={() => {
                onSelect(food);
                setQuery("");
                setOpen(false);
              }}
              className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              {food.name_tr}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
