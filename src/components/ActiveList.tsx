import { useEffect, useMemo, useRef, useState } from "react";
import { Apple, Check, LayoutList, MoreHorizontal, ShoppingBasket, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { type AnyCategoryId, type List } from "@/lib/store";
import {
  labelFor,
  type CategoryOverlay,
  type MergedCategory,
} from "@/lib/categorization/userCategories";
import { groupItems } from "@/lib/categorization/groupItems";
import { Row } from "@/components/ActiveListRow";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { scaledNutritionForItem, type NutritionMap } from "@/lib/nutrition";

type Props = {
  list: List;
  groupByCategory: boolean;
  categories: MergedCategory[];
  overlay: CategoryOverlay;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (itemId: string) => void;
  onToggleSelectMode: () => void;
  onSelectAll: () => void;
  onSelectCategory: (itemIds: string[], selected: boolean) => void;
  onBulkRemove: () => void;
  swipeMode: boolean;
  onToggleSwipeMode: () => void;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onEdit: (
    itemId: string,
    name: string,
    qty: string,
    category?: AnyCategoryId,
  ) => void;
  onCategorize: () => void;
  onToggleGrouping: () => void;
  showNutritionValues: boolean;
  onToggleShowNutritionValues: () => void;
};

export function ActiveList({
  list,
  groupByCategory,
  categories,
  overlay,
  selectMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectMode,
  onSelectAll,
  onSelectCategory,
  onBulkRemove,
  swipeMode,
  onToggleSwipeMode,
  onToggle,
  onRemove,
  onEdit,
  onCategorize,
  onToggleGrouping,
  showNutritionValues,
  onToggleShowNutritionValues,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // One lookup map for every row's inline nutrition line (see Row).
  const { foods } = useFoodCatalog();
  const foodsByName: NutritionMap = useMemo(
    () => new Map(foods.map(f => [f.name_tr.toLocaleLowerCase("tr-TR"), f])),
    [foods],
  );

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);
  // Newest at the top so the item just added is visible without scrolling.
  const sorted = [...list.items].sort((a, b) => b.addedAt - a.addedAt);
  const pending = sorted.filter(i => !i.checked);
  const done = sorted.filter(i => i.checked);

  const pendingGrouped = useMemo(
    () => groupItems(pending, categories),
    [pending, groupByCategory, categories], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Aggregate macro total across the whole list (pending + sepette), scaled
  // by each item's own quantity — the one thing the old standalone "Listem"
  // nutrition tab had that this grouped view didn't; embedded here instead
  // of keeping a second, duplicate place to see it.
  const nutritionTotals = useMemo(() => {
    let kcal = 0, protein = 0, fat = 0, carbs = 0, fiber = 0, matched = 0;
    for (const item of list.items) {
      const scaled = scaledNutritionForItem(foodsByName, item);
      if (!scaled) continue;
      kcal += scaled.kcal;
      protein += scaled.protein_g;
      fat += scaled.fat_g;
      carbs += scaled.carbs_g;
      fiber += scaled.fiber_g;
      matched += 1;
    }
    return { kcal, protein, fat, carbs, fiber, matched };
  }, [list.items, foodsByName]);

  if (list.items.length === 0) {
    return (
      <p className="px-1 py-10 text-sm text-muted-foreground">
        Bu listede henüz bir şey yok. İlk ürünü yukarıdan ekle — yazdıkça geçmiş
        ürünler önerilmeye başlayacak.
      </p>
    );
  }

  const rowProps = {
    editingId,
    foodsByName,
    categories,
    overlay,
    selectMode,
    selectedIds,
    onToggleSelect,
    swipeMode,
    onStartEdit: (id: string) => setEditingId(id),
    onFinishEdit: () => setEditingId(null),
    onToggle,
    onRemove,
    onEdit,
    showNutritionValues,
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-2 pb-2">
        {/* flex-wrap: with the "Besin değerleri" label the two buttons are wider
            than a phone's content column, so the grouping button drops to a
            second line rather than pushing the ⋯ menu off-screen. */}
        <div className="flex min-w-0 flex-wrap items-center gap-x-1">
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={onToggleShowNutritionValues}
            aria-pressed={showNutritionValues}
            title={
              showNutritionValues
                ? "Besin değerlerini gizle"
                : "Besin değerlerini göster"
            }
            className={cn(
              // Border is always 1px, just transparent when off — a border
              // that only appears on activation shifts every button after it
              // sideways by its own width, since an auto-width element with
              // no border renders 2px narrower than one with a 1px border.
              "border",
              showNutritionValues
                ? "border-signal bg-signal/10 text-signal"
                : "border-transparent"
            )}>
            <Apple className="size-3.5" />
            Besin değerleri
          </Button>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={onToggleGrouping}
            title={
              groupByCategory
                ? "Düz listeye geri dön"
                : "Ürünleri kategorilere göre grupla"
            }>
            {groupByCategory ? (
              <>
                <LayoutList className="size-3.5" />
                Düz liste
              </>
            ) : (
              <>
                <Tags className="size-3.5" />
                Kategorilere göre grupla
              </>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {groupByCategory &&
            pending.some(i => !i.category || i.category === "diger") && (
              <Button
                type="button"
                variant="quiet"
                size="sm"
                onClick={onCategorize}
                title="Kategorisi olmayan ürünleri otomatik ata">
                Otomatik kategorize et
              </Button>
            )}

          <div className="relative" ref={menuRef}>
            <Button
              type="button"
              variant="quiet"
              size="icon"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
              title="Toplu işlemler">
              <MoreHorizontal className="size-4" />
            </Button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 min-w-[9rem] origin-top-right rounded-md border border-border bg-card py-1 shadow-md transition-[opacity,transform] duration-150 starting:scale-95 starting:opacity-0">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelectAll();
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent active:bg-accent">
                  Hepsini Seç
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={swipeMode}
                  onClick={() => {
                    onToggleSwipeMode();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent active:bg-accent">
                  Kaydırma hareketleri
                  {swipeMode && <Check className="size-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          selectMode ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        aria-hidden={!selectMode}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "flex items-center justify-end gap-2 pb-2 transition-opacity duration-200",
              selectMode ? "opacity-100 delay-100" : "pointer-events-none opacity-0",
            )}
          >
            {selectedIds.size > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onBulkRemove}>
                <Trash2 className="size-3.5" />
                Sil ({selectedIds.size})
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onToggleSelectMode}>
              İptal
            </Button>
          </div>
        </div>
      </div>

      {groupByCategory ? (
        <div>
          {pendingGrouped.map(({ id, items }) => {
            const selectedCount = items.filter(i =>
              selectedIds.has(i.id),
            ).length;
            const catChecked =
              selectedCount === 0
                ? false
                : selectedCount === items.length
                  ? true
                  : "indeterminate";
            const CategoryIcon = categories.find(c => c.id === id)?.icon;
            return (
              <section key={id} className="pt-3">
                <div className="flex items-center gap-3 pb-1">
                  {selectMode && (
                    <Checkbox
                      checked={catChecked}
                      onCheckedChange={() =>
                        onSelectCategory(
                          items.map(i => i.id),
                          selectedCount !== items.length,
                        )
                      }
                      aria-label={`${labelFor(overlay, id)} kategorisini seç`}
                      className="starting:scale-75 starting:opacity-0 transition-[transform,opacity] duration-200"
                    />
                  )}
                  {CategoryIcon && (
                    <CategoryIcon
                      aria-hidden="true"
                      className="size-3.5 text-muted-foreground"
                    />
                  )}
                  <span className="ledger text-xs uppercase tracking-widest text-muted-foreground">
                    {labelFor(overlay, id)}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                  <span className="ledger text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <ul>
                  {items.map(item => (
                    <Row key={item.id} item={item} {...rowProps} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul>
          {pending.map(item => (
            <Row key={item.id} item={item} {...rowProps} />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <div className="flex items-center gap-3 pb-1 pt-6">
            <span className="flex items-center gap-1.5 ledger text-xs uppercase tracking-widest text-muted-foreground">
              <ShoppingBasket className="size-4 shrink-0 rounded-full bg-secondary p-0.5 text-secondary-foreground" />
              sepette
            </span>
            <span className="h-px flex-1 bg-border" />
            <span className="ledger text-xs text-muted-foreground">
              {done.length}
            </span>
          </div>
          <ul>
            {done.map(item => (
              <Row key={item.id} item={item} {...rowProps} />
            ))}
          </ul>
        </>
      )}

      {showNutritionValues && nutritionTotals.matched > 0 && (
        <div className="border-t border-border pt-2 mt-6">
          <div className="text-xs text-muted-foreground">
            Toplam ({nutritionTotals.matched}/{list.items.length})
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 px-1 text-xs font-medium">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">kcal</span>
              <span>{nutritionTotals.kcal.toFixed(0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">P</span>
              <span>{nutritionTotals.protein.toFixed(1)}g</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Y</span>
              <span>{nutritionTotals.fat.toFixed(1)}g</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">K</span>
              <span>{nutritionTotals.carbs.toFixed(1)}g</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">L</span>
              <span>{nutritionTotals.fiber.toFixed(1)}g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
