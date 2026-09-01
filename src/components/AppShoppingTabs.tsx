import { TabsContent } from "@/components/ui/tabs";
import { AddItem } from "@/components/AddItem";
import { ActiveList } from "@/components/ActiveList";
import { CategoriesView } from "@/components/CategoriesView";
import { HistoryView } from "@/components/HistoryView";
import { SearchView } from "@/components/SearchView";
import { TodayView } from "@/components/TodayView";
import type { AnyCategoryId, CatalogEntry, List } from "@/lib/store";
import type { CategoryOverlay, MergedCategory } from "@/lib/categorization/userCategories";

type Props = {
  catalog: CatalogEntry[];
  onAddItem: (name: string, qty: string) => void;
  userId: string | null;
  householdId: string | null;
  active: List;
  past: List[];
  groupByCategory: boolean;
  mergedCategories: MergedCategory[];
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
  onToggleItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (itemId: string, name: string, qty: string, category?: AnyCategoryId) => void;
  onCategorize: () => void;
  onToggleGrouping: () => void;
  onReuseList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
  isOnList: (name: string) => boolean;
  onRenameCategory: (id: AnyCategoryId, label: string) => void;
  onToggleHiddenCategory: (id: string, hidden: boolean) => void;
  onMoveCategory: (id: AnyCategoryId, direction: "up" | "down") => void;
  onReorderCategories: (ids: AnyCategoryId[]) => void;
  onAddCategory: (label: string) => void;
  onRemoveCategory: (id: string) => void;
};

export function AppShoppingTabs({
  catalog,
  onAddItem,
  userId,
  householdId,
  active,
  past,
  groupByCategory,
  mergedCategories,
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
  onToggleItem,
  onRemoveItem,
  onEditItem,
  onCategorize,
  onToggleGrouping,
  onReuseList,
  onDeleteList,
  isOnList,
  onRenameCategory,
  onToggleHiddenCategory,
  onMoveCategory,
  onReorderCategories,
  onAddCategory,
  onRemoveCategory,
}: Props) {
  return (
    <>
      <TabsContent value="today">
        <TodayView userId={userId} householdId={householdId} onAddItem={onAddItem} />
      </TabsContent>

      <TabsContent value="list">
        <AddItem catalog={catalog} onAdd={onAddItem} />
        <div className="pt-2">
          <ActiveList
            list={active}
            groupByCategory={groupByCategory}
            categories={mergedCategories}
            overlay={overlay}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onToggleSelectMode={onToggleSelectMode}
            onSelectAll={onSelectAll}
            onSelectCategory={onSelectCategory}
            onBulkRemove={onBulkRemove}
            swipeMode={swipeMode}
            onToggleSwipeMode={onToggleSwipeMode}
            onToggle={onToggleItem}
            onRemove={onRemoveItem}
            onEdit={onEditItem}
            onCategorize={onCategorize}
            onToggleGrouping={onToggleGrouping}
          />
        </div>
      </TabsContent>

      <TabsContent value="history">
        <HistoryView lists={past} onReuse={onReuseList} onDelete={onDeleteList} />
      </TabsContent>

      <TabsContent value="find">
        <SearchView catalog={catalog} onAdd={onAddItem} isOnList={isOnList} />
      </TabsContent>

      <TabsContent value="cats">
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
      </TabsContent>
    </>
  );
}
