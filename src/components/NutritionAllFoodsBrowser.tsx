import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { groupByCategory } from "@/lib/categorization/categories";
import type { Nutrition } from "@/lib/nutrition";
import { Input } from "@/components/ui/input";
import { Cell } from "@/components/NutritionTableCell";

// Browses/searches the whole nutrition table, independent of the active
// list. The catalog is loaded once in full (useFoodCatalog already owns that
// fetch + cache) and grouped by aisle client-side — no more paginated
// "daha fazla göster", no per-keystroke network round trip.
export function AllFoodsBrowser() {
  const [query, setQuery] = useState("");
  const { foods, status } = useFoodCatalog();

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return foods;
    return foods.filter(
      (f) =>
        f.name_tr.toLocaleLowerCase("tr-TR").includes(q) ||
        (f.aliases ?? []).some((a) => a.toLocaleLowerCase("tr-TR").includes(q))
    );
  }, [foods, query]);

  const groups = useMemo(
    () => groupByCategory(filtered, (f) => f.name_tr),
    [filtered]
  );

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          aria-label="Besin ara"
          placeholder="Besin ara"
          className="pl-9"
          onInput={(e: Event) => setQuery((e.target as HTMLInputElement).value)}
        />
      </div>

      <p className="ledger px-1 pb-1 pt-4 text-xs uppercase tracking-widest text-muted-foreground">
        {query.trim() ? `${filtered.length} sonuç` : `${foods.length} besin`}
      </p>

      {status === "loading" && (
        <p className="px-1 py-8 text-sm text-muted-foreground">Yükleniyor…</p>
      )}
      {status === "ready" && filtered.length === 0 && (
        <p className="px-1 py-8 text-sm text-muted-foreground">
          {query.trim()
            ? `"${query.trim()}" ile eşleşen besin yok.`
            : "Henüz kayıtlı besin yok."}
        </p>
      )}
      {status === "error" && (
        <p className="px-1 py-8 text-sm text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}

      {groups.map(({ category, rows }) => (
        <FoodCategorySection key={category.id} label={category.label} rows={rows} />
      ))}
    </div>
  );
}

function FoodCategorySection({
  label,
  rows,
}: {
  label: string;
  rows: Nutrition[];
}) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="ledger px-1 pb-1 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="py-2 pr-2 text-left font-normal">Ürün</th>
            <th className="py-2 px-1 text-right font-normal">kcal</th>
            <th className="py-2 px-1 text-right font-normal">P</th>
            <th className="py-2 px-1 text-right font-normal">Y</th>
            <th className="py-2 px-1 text-right font-normal">K</th>
            <th className="py-2 px-1 text-right font-normal">L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n.name_tr} className="border-b border-border/60">
              <td className="py-2 pr-2">{n.name_tr}</td>
              <Cell value={n.kcal_per_100} />
              <Cell value={n.protein_g} />
              <Cell value={n.fat_g} />
              <Cell value={n.carbs_g} />
              <Cell value={n.fiber_g} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
