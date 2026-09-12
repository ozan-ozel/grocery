import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  readNutritionScopeFromUrl,
  writeNutritionScopeToUrl,
  type Item,
  type AnyCategoryId,
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
import { CategoriesView } from "@/components/CategoriesView";
import { EditorRow } from "@/components/NutritionEditorRow";
import { UploadPanel, UploadTrigger } from "@/components/NutritionUpload";
import { LoadingBlock } from "@/components/LoadingBlock";
import type { CategoryOverlay, MergedCategory } from "@/lib/categorization/userCategories";

type Props = {
  items: Item[];
  showNutritionValues: boolean;
  mergedCategories: MergedCategory[];
  overlay: CategoryOverlay;
  onRenameCategory: (id: AnyCategoryId, label: string) => void;
  onToggleHiddenCategory: (id: string, hidden: boolean) => void;
  onMoveCategory: (id: AnyCategoryId, direction: "up" | "down") => void;
  onReorderCategories: (ids: AnyCategoryId[]) => void;
  onAddCategory: (label: string) => void;
  onRemoveCategory: (id: string) => void;
};

type Status = "idle" | "loading" | "ready" | "error";
type Scope = "list" | "all" | "cats" | "compare";

function initialScope(): Scope {
  const fromUrl = readNutritionScopeFromUrl();
  if (fromUrl === "all") return "all";
  if (fromUrl === "compare") return "compare";
  if (fromUrl === "cats") return "cats";
  return "list";
}

export function NutritionView({
  items,
  showNutritionValues,
  mergedCategories,
  overlay,
  onRenameCategory,
  onToggleHiddenCategory,
  onMoveCategory,
  onReorderCategories,
  onAddCategory,
  onRemoveCategory,
}: Props) {
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

  // List view with checkbox and grid
  if (items.length > 0 && scope === "list") {
    return (
      <div>
        <div className="mb-3">
          <div className="inline-flex items-center rounded-lg bg-card border border-border/50 p-1 shadow-[0_4px_12px_rgba(232,86,74,0.15)]">
            <TabsList className="grid w-auto grid-cols-3 h-auto p-0.5">
              <TabsTrigger
                value="all"
                onClick={() => setScope("all")}
                className="px-3 py-1.5 text-sm rounded-md"
              >
                Tümü
              </TabsTrigger>
              <TabsTrigger
                value="cats"
                onClick={() => setScope("cats")}
                className="px-3 py-1.5 text-sm"
              >
                Kategoriler
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                onClick={() => setScope("compare")}
                className="px-3 py-1.5 text-sm"
              >
                Karşılaştır
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

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
                          <span className="font-medium">
                            {nutrition.kcal_per_100.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">P</span>
                          <span className="font-medium">
                            {nutrition.protein_g.toFixed(1)}g
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Y</span>
                          <span className="font-medium">
                            {nutrition.fat_g.toFixed(1)}g
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">K</span>
                          <span className="font-medium">
                            {nutrition.carbs_g.toFixed(1)}g
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">L</span>
                          <span className="font-medium">
                            {nutrition.fiber_g.toFixed(1)}g
                          </span>
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

        {status === "error" && (
          <p className="px-1 pt-3 text-xs text-muted-foreground">
            Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
          </p>
        )}
      </div>
    );
  }

  // All Foods scope
  if (scope === "all") {
    return (
      <div>
        <div className="mb-3">
          <div className="inline-flex items-center rounded-lg bg-card border border-border/50 p-1 shadow-[0_4px_12px_rgba(232,86,74,0.15)]">
            <TabsList className="grid w-auto grid-cols-3 h-auto p-0.5">
              <TabsTrigger
                value="all"
                onClick={() => setScope("all")}
                className="px-3 py-1.5 text-sm rounded-md"
              >
                Tümü
              </TabsTrigger>
              <TabsTrigger
                value="cats"
                onClick={() => setScope("cats")}
                className="px-3 py-1.5 text-sm"
              >
                Kategoriler
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                onClick={() => setScope("compare")}
                className="px-3 py-1.5 text-sm"
              >
                Karşılaştır
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <AllFoodsBrowser />
      </div>
    );
  }

  // Compare scope
  if (scope === "compare") {
    return (
      <div>
        <div className="mb-3">
          <div className="inline-flex items-center rounded-lg bg-card border border-border/50 p-1 shadow-[0_4px_12px_rgba(232,86,74,0.15)]">
            <TabsList className="grid w-auto grid-cols-3 h-auto p-0.5">
              <TabsTrigger
                value="all"
                onClick={() => setScope("all")}
                className="px-3 py-1.5 text-sm rounded-md"
              >
                Tümü
              </TabsTrigger>
              <TabsTrigger
                value="cats"
                onClick={() => setScope("cats")}
                className="px-3 py-1.5 text-sm"
              >
                Kategoriler
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                onClick={() => setScope("compare")}
                className="px-3 py-1.5 text-sm"
              >
                Karşılaştır
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <NutritionCompareView />
      </div>
    );
  }

  // Categories scope
  if (scope === "cats") {
    return (
      <div>
        <div className="mb-3">
          <div className="inline-flex items-center rounded-lg bg-card border border-border/50 p-1 shadow-[0_4px_12px_rgba(232,86,74,0.15)]">
            <TabsList className="grid w-auto grid-cols-3 h-auto p-0.5">
              <TabsTrigger
                value="all"
                onClick={() => setScope("all")}
                className="px-3 py-1.5 text-sm rounded-md"
              >
                Tümü
              </TabsTrigger>
              <TabsTrigger
                value="cats"
                onClick={() => setScope("cats")}
                className="px-3 py-1.5 text-sm"
              >
                Kategoriler
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                onClick={() => setScope("compare")}
                className="px-3 py-1.5 text-sm"
              >
                Karşılaştır
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <CategoriesView
          merged={mergedCategories}
          overlay={overlay}
          onRename={onRenameCategory}
          onToggleHidden={onToggleHiddenCategory}
          onMove={onMoveCategory}
          onReorder={onReorderCategories}
          onAdd={onAddCategory}
          onRemoveCustom={onRemoveCategory}
        />
      </div>
    );
  }

  // Empty state
  return (
    <div>
      <div className="mb-3">
        <div className="inline-flex items-center rounded-lg bg-accent/50 p-1">
          <TabsList className="grid w-auto grid-cols-3 h-auto p-1">
            <TabsTrigger
              value="all"
              onClick={() => setScope("all")}
              className="px-3 py-1.5 text-sm"
            >
              Tümü
            </TabsTrigger>
            <TabsTrigger
              value="cats"
              onClick={() => setScope("cats")}
              className="px-3 py-1.5 text-sm"
            >
              Kategoriler
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              onClick={() => setScope("compare")}
              className="px-3 py-1.5 text-sm"
            >
              Karşılaştır
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
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
