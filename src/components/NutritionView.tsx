import { useEffect, useMemo, useState } from "react";
import {
  readNutritionScopeFromUrl,
  writeNutritionScopeToUrl,
  type Item,
  type AnyCategoryId,
} from "@/lib/store";
import {
  fetchNutritionCached,
  lookupNutrition,
  type NutritionMap,
} from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import { SmoothPillTabs } from "@/components/ui/smooth-pill";
import { AllFoodsBrowser } from "@/components/NutritionAllFoodsBrowser";
import { NutritionCompareView } from "@/components/NutritionCompareView";
import { CategoriesView } from "@/components/CategoriesView";
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

  const scopeToggle = (
    <div className="mb-3">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Besin Değerleri
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Ürün ve öğün besin değerleri
        </h1>
      </div>
      <SmoothPillTabs
        value={scope}
        onChange={setScope}
        // px-2 (not the default px-3): four pills at px-3 are 326px wide,
        // wider than the 320px content column of a 360px phone.
        itemClassName="px-2"
        items={[
          { value: "list", label: "Listem" },
          { value: "all", label: "Tümü" },
          { value: "cats", label: "Kategoriler" },
          { value: "compare", label: "Karşılaştır" },
        ]}
      />
    </div>
  );

  // List view with checkbox and grid
  if (items.length > 0 && scope === "list") {
    return (
      <div>
        {scopeToggle}

        <p className="px-1 pb-3 text-xs text-muted-foreground">
          Değerler 100 g / 100 ml içindir.
        </p>

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
            : rows.map(({ item, nutrition }) => (
                <div
                  key={item.id}
                  className={cn(
                    "border-b border-border/60 py-2",
                    !nutrition && "text-muted-foreground"
                  )}
                >
                  <div className="pr-2 text-sm font-medium">{item.name}</div>
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
              ))}

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
        {scopeToggle}
        <AllFoodsBrowser />
      </div>
    );
  }

  // Compare scope
  if (scope === "compare") {
    return (
      <div>
        {scopeToggle}
        <NutritionCompareView />
      </div>
    );
  }

  // Categories scope
  if (scope === "cats") {
    return (
      <div>
        {scopeToggle}
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
      {scopeToggle}
      <p className="px-1 py-3 text-sm text-muted-foreground">
        Önce listene bir şeyler ekle. Besin değerleri burada görünür.
      </p>
    </div>
  );
}
