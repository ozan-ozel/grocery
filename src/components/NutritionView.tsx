import { useEffect, useState } from "react";
import { readNutritionScopeFromUrl, writeNutritionScopeToUrl, type AnyCategoryId } from "@/lib/store";
import { SmoothPillTabs } from "@/components/ui/smooth-pill";
import { AllFoodsBrowser } from "@/components/NutritionAllFoodsBrowser";
import { NutritionCompareView } from "@/components/NutritionCompareView";
import { CategoriesView } from "@/components/CategoriesView";
import type { CategoryOverlay, MergedCategory } from "@/lib/categorization/userCategories";

type Props = {
  mergedCategories: MergedCategory[];
  overlay: CategoryOverlay;
  onRenameCategory: (id: AnyCategoryId, label: string) => void;
  onToggleHiddenCategory: (id: string, hidden: boolean) => void;
  onMoveCategory: (id: AnyCategoryId, direction: "up" | "down") => void;
  onReorderCategories: (ids: AnyCategoryId[]) => void;
  onAddCategory: (label: string) => void;
  onRemoveCategory: (id: string) => void;
};

// "Listem" (the current list's own nutrition values, grouped by category)
// used to be a scope here; it's now embedded directly in the Alışveriş
// screen's own "Besin değerleri" toggle (ActiveList.tsx) instead of living
// as a second, duplicate place to see the same list. This screen is food
// *database* browsing/comparison/category management now, not "my list".
type Scope = "all" | "cats" | "compare";

function initialScope(): Scope {
  const fromUrl = readNutritionScopeFromUrl();
  if (fromUrl === "compare") return "compare";
  if (fromUrl === "cats") return "cats";
  return "all";
}

export function NutritionView({
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

  useEffect(() => {
    writeNutritionScopeToUrl(scope);
  }, [scope]);

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
        items={[
          { value: "all", label: "Tümü" },
          { value: "cats", label: "Kategoriler" },
          { value: "compare", label: "Karşılaştır" },
        ]}
      />
    </div>
  );

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
