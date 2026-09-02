import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import {
  readNutritionScopeFromUrl,
  writeNutritionScopeToUrl,
  type Item,
} from "@/lib/store";
import {
  fetchNutritionCached,
  lookupNutrition,
  rememberNutrition,
  type Nutrition,
  type NutritionMap,
} from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import { AllFoodsBrowser } from "@/components/NutritionAllFoodsBrowser";
import { NutritionCompareView } from "@/components/NutritionCompareView";
import { EditorRow } from "@/components/NutritionEditorRow";
import { UploadPanel, UploadTrigger } from "@/components/NutritionUpload";
import { Cell } from "@/components/NutritionTableCell";
import { LoadingBlock } from "@/components/LoadingBlock";

type Props = {
  items: Item[];
};

type Status = "idle" | "loading" | "ready" | "error";
type Scope = "list" | "all" | "compare";

function initialScope(): Scope {
  const fromUrl = readNutritionScopeFromUrl();
  return fromUrl === "all" || fromUrl === "compare" ? fromUrl : "list";
}

export function NutritionView({ items }: Props) {
  const [scope, setScope] = useState<Scope>(initialScope);
  const [map, setMap] = useState<NutritionMap>(() => new Map());
  const [status, setStatus] = useState<Status>("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const names = useMemo(() => items.map((i) => i.name), [items]);
  const namesKey = names.join(" ");

  useEffect(() => {
    writeNutritionScopeToUrl(scope);
  }, [scope]);

  useEffect(() => {
    if (names.length === 0) {
      setMap(new Map());
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetchNutritionCached(names)
      .then((next) => {
        if (cancelled) return;
        setMap(next);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          "[nutrition] fetch failed — if you're running locally, npm run netlify:dev serves /api/*, npm run dev does not:",
          err
        );
        setMap(new Map());
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [namesKey]);

  useEffect(() => {
    setEditingId(null);
  }, [namesKey]);

  const rows = items.map((item) => ({
    item,
    nutrition: lookupNutrition(map, item.name),
  }));

  useEffect(() => {
    if (status !== "ready") return;
    const missing = rows.filter((r) => !r.nutrition).map((r) => r.item.name);
    if (missing.length > 0) {
      console.info("[nutrition] missing:", missing);
    }
  }, [status, namesKey]);

  const totals = rows.reduce(
    (acc, r) => {
      if (!r.nutrition) return acc;
      acc.kcal += r.nutrition.kcal_per_100;
      acc.protein += r.nutrition.protein_g;
      acc.fat += r.nutrition.fat_g;
      acc.carbs += r.nutrition.carbs_g;
      acc.fiber += r.nutrition.fiber_g;
      acc.matched += 1;
      return acc;
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, matched: 0 }
  );

  function upsertLocal(saved: Nutrition, itemName: string) {
    setMap((prev) => {
      const next = new Map(prev);
      next.set(saved.name_tr, saved);
      next.set(itemName.trim().toLocaleLowerCase("tr-TR"), saved);
      return next;
    });
    rememberNutrition([saved]);
  }

  function upsertBulkLocal(savedRows: Nutrition[]) {
    rememberNutrition(savedRows);
    setMap((prev) => {
      const next = new Map(prev);
      for (const s of savedRows) next.set(s.name_tr, s);
      return next;
    });
  }

  const scopeToggle = (
    <div className="mb-3 inline-flex items-center gap-1 rounded-lg bg-accent/50 p-1">
      <button
        type="button"
        onClick={() => setScope("list")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          scope === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Listedeki ürünler
      </button>
      <button
        type="button"
        onClick={() => setScope("all")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          scope === "all"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Tümü
      </button>
      <button
        type="button"
        onClick={() => setScope("compare")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          scope === "compare"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Karşılaştır
      </button>
    </div>
  );

  if (scope === "all") {
    return (
      <div>
        {scopeToggle}
        <AllFoodsBrowser />
      </div>
    );
  }

  if (scope === "compare") {
    return (
      <div>
        {scopeToggle}
        <NutritionCompareView />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        {scopeToggle}
        <div className="flex items-center justify-between px-1 py-3">
          <p className="text-sm text-muted-foreground">
            Önce listene bir şeyler ekle. Besin değerleri burada görünür.
          </p>
          <UploadTrigger onClick={() => setUploadOpen(true)} />
        </div>
        {uploadOpen && (
          <UploadPanel
            onClose={() => setUploadOpen(false)}
            onSaved={upsertBulkLocal}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {scopeToggle}
      <div className="flex items-center justify-between px-1 pb-3">
        <p className="text-xs text-muted-foreground">
          Değerler 100 g / 100 ml içindir.
        </p>
        <UploadTrigger onClick={() => setUploadOpen(true)} />
      </div>

      {uploadOpen && (
        <UploadPanel
          onClose={() => setUploadOpen(false)}
          onSaved={upsertBulkLocal}
        />
      )}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="py-2 pr-2 text-left font-normal">Ürün</th>
            <th className="py-2 px-1 text-right font-normal">kcal</th>
            <th className="py-2 px-1 text-right font-normal">P</th>
            <th className="py-2 px-1 text-right font-normal">Y</th>
            <th className="py-2 px-1 text-right font-normal">K</th>
            <th className="py-2 px-1 text-right font-normal">L</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {status === "loading"
            ? items.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="py-2 pr-2">{item.name}</td>
                  <td colSpan={6} className="py-2">
                    <LoadingBlock className="ml-auto h-3 w-24" />
                  </td>
                </tr>
              ))
            : rows.map(({ item, nutrition }) => {
                const editing = editingId === item.id;
                if (editing) {
                  return (
                    <EditorRow
                      key={item.id}
                      itemName={item.name}
                      initial={nutrition}
                      onCancel={() => setEditingId(null)}
                      onSaved={(saved) => {
                        upsertLocal(saved, item.name);
                        setEditingId(null);
                      }}
                    />
                  );
                }
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-border/60",
                      !nutrition && "text-muted-foreground"
                    )}
                  >
                    <td className="py-2 pr-2">{item.name}</td>
                    <Cell value={nutrition?.kcal_per_100} />
                    <Cell value={nutrition?.protein_g} />
                    <Cell value={nutrition?.fat_g} />
                    <Cell value={nutrition?.carbs_g} />
                    <Cell value={nutrition?.fiber_g} />
                    <td className="py-2 pl-1 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        className="text-muted-foreground hover:text-foreground active:text-foreground"
                        aria-label={
                          nutrition
                            ? `${item.name} değerlerini düzenle`
                            : `${item.name} için değer ekle`
                        }
                        title={nutrition ? "Düzenle" : "Ekle"}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
        </tbody>
        {status === "ready" && totals.matched > 0 && (
          <tfoot>
            <tr className="border-t border-border font-medium">
              <td className="py-2 pr-2 text-xs text-muted-foreground">
                Toplam ({totals.matched}/{items.length})
              </td>
              <Cell value={totals.kcal} />
              <Cell value={totals.protein} />
              <Cell value={totals.fat} />
              <Cell value={totals.carbs} />
              <Cell value={totals.fiber} />
              <td />
            </tr>
          </tfoot>
        )}
      </table>

      {status === "error" && (
        <p className="px-1 pt-3 text-xs text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}
    </div>
  );
}
