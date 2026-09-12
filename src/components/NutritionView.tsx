import { useEffect, useMemo, useState } from "react";
import { Pencil, ChevronDown } from "lucide-react";
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
  const [showNutritionValues, setShowNutritionValues] = useState(false);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);

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
          "[nutrition] fetch failed — if you're running locally, npm run vercel:dev serves /api/*, npm run dev does not:",
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
    <div className="mb-3 flex items-center gap-1">
      <div className="inline-flex items-center rounded-lg bg-accent/50 p-1">
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
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setScopeDropdownOpen(!scopeDropdownOpen)}
          className="inline-flex items-center gap-1 rounded-lg bg-accent/50 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className="size-4" />
        </button>

        {scopeDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 z-10 rounded-lg bg-card border border-border shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setScope("all");
                setScopeDropdownOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm font-medium transition-colors",
                scope === "all"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => {
                setScope("compare");
                setScopeDropdownOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm font-medium transition-colors",
                scope === "compare"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              Karşılaştır
            </button>
          </div>
        )}
      </div>
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
      {scope === "list" && (
        <div className="mb-3 flex items-center gap-2 px-1">
          <input
            type="checkbox"
            id="showNutrition"
            checked={showNutritionValues}
            onChange={(e) => setShowNutritionValues((e.target as HTMLInputElement).checked)}
            className="size-4 rounded cursor-pointer"
          />
          <label htmlFor="showNutrition" className="text-xs font-medium cursor-pointer">
            Besin değerlerini göster
          </label>
        </div>
      )}
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

      {scope === "list" && (
        <div className="space-y-2">
          {status === "loading"
            ? items.map((item) => (
                <div key={item.id} className="border-b border-border/60 py-2">
                  <div className="pr-2 text-sm font-medium">{item.name}</div>
                  <div className="mt-2 ml-1">
                    <LoadingBlock className="h-3 w-24" />
                  </div>
                </div>
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
                  <div
                    key={item.id}
                    className={cn(
                      "border-b border-border/60 py-2",
                      !nutrition && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between pr-2">
                      <div className="text-sm font-medium">{item.name}</div>
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
                    </div>
                    {showNutritionValues && nutrition && (
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs px-1">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">kcal</span>
                          <span className="font-medium">{nutrition.kcal_per_100.toFixed(0)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">P</span>
                          <span className="font-medium">{nutrition.protein_g.toFixed(1)}g</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Y</span>
                          <span className="font-medium">{nutrition.fat_g.toFixed(1)}g</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">K</span>
                          <span className="font-medium">{nutrition.carbs_g.toFixed(1)}g</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">L</span>
                          <span className="font-medium">{nutrition.fiber_g.toFixed(1)}g</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

          {status === "ready" && totals.matched > 0 && (
            <div className="border-t border-border pt-2 mt-2">
              <div className="text-xs text-muted-foreground">
                Toplam ({totals.matched}/{items.length})
              </div>
              {showNutritionValues && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs px-1 font-medium">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">kcal</span>
                    <span>{totals.kcal.toFixed(0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">P</span>
                    <span>{totals.protein.toFixed(1)}g</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Y</span>
                    <span>{totals.fat.toFixed(1)}g</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">K</span>
                    <span>{totals.carbs.toFixed(1)}g</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">L</span>
                    <span>{totals.fiber.toFixed(1)}g</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {status === "error" && (
        <p className="px-1 pt-3 text-xs text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}
    </div>
  );
}
