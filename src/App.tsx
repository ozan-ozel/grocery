import { useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader";
import { AppShoppingTabs } from "@/components/AppShoppingTabs";
import { NutritionView } from "@/components/NutritionView";
import { MealPlanView } from "@/components/MealPlanView";
import { PersonalPlanView } from "@/components/PersonalPlanView";
import { UndoToast } from "@/components/UndoToast";
import { LoginGate } from "@/components/LoginGate";
import { buildCatalog } from "@/lib/store";
import { createListActions } from "@/lib/listActions";
import { useUiPrefs, type Tab } from "@/hooks/useUiPrefs";
import { useTenants } from "@/hooks/useTenants";
import { useListSync } from "@/hooks/useListSync";
import { useRollover } from "@/hooks/useRollover";
import { useUndo } from "@/hooks/useUndo";
import { useCategoryOverlay } from "@/hooks/useCategoryOverlay";
import { useItemCategories } from "@/hooks/useItemCategories";
import { useSelection } from "@/hooks/useSelection";
import { useAuth } from "@/hooks/useAuth";

export function App() {
  const { session, checked, signInWithGoogle, signOut } = useAuth();

  if (!checked) {
    return (
      <div
        className="mx-auto flex min-h-dvh w-full max-w-[30rem] items-center justify-center px-5"
        role="status"
        aria-label="Yükleniyor">
        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <LoginGate onSignIn={signInWithGoogle} />;
  }

  return <AppShell onSignOut={signOut} currentUserId={session.userId} />;
}

function AppShell({
  onSignOut,
  currentUserId,
}: {
  onSignOut: () => void;
  currentUserId: string | null;
}) {
  const {
    theme,
    setTheme,
    swipeMode,
    toggleSwipeMode,
    section,
    setSection,
    tab,
    setTab,
  } = useUiPrefs();

  const {
    tenants,
    hiddenIds,
    activeTenantId,
    selectTenant,
    addTenant,
    renameTenant,
    deleteTenant,
    toggleHiddenTenant,
  } = useTenants();

  const { state, setState, updateState, stateRef, syncStatus } =
    useListSync(activeTenantId);

  const { undo, showUndo, restore } = useUndo(updateState, setState);
  useRollover(activeTenantId, stateRef, setState, showUndo);

  const {
    overlay,
    mergedCategories,
    renameCat,
    toggleHidden,
    moveCat,
    reorderCats,
    addCategory,
    removeCategory,
  } = useCategoryOverlay();

  const { itemCategories, rememberCategory } =
    useItemCategories(activeTenantId);

  const catalog = useMemo(
    () => buildCatalog(state?.lists ?? []),
    [state?.lists],
  );

  const selection = useSelection(state?.activeId ?? undefined);

  if (!tenants || !activeTenantId || !state) {
    return (
      <div
        className="mx-auto flex min-h-dvh w-full max-w-[30rem] items-center justify-center px-5"
        role="status"
        aria-label="Yükleniyor">
        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Everything past the guard runs only with a hydrated state, so
  // createListActions below can assume State (never null).
  const active =
    state.lists.find(l => l.id === state.activeId) ?? state.lists[0];
  const past = state.lists.filter(l => l.id !== active.id);
  const groupByCategory = state.groupByCategory ?? false;

  const {
    addItem,
    toggleItem,
    editItem,
    removeItem,
    bulkRemove,
    startNewList,
    reuseList,
    renameActive,
    toggleGrouping,
    categorizeActive,
    isOnList,
  } = createListActions({
    state,
    active,
    updateState,
    itemCategories,
    rememberCategory,
    showUndo,
    selectedIds: selection.selectedIds,
    exitSelectMode: selection.exitSelectMode,
  });

  return (
    <Tabs
      value={tab}
      onValueChange={v => setTab(v as Tab)}
      className="mx-auto min-h-dvh w-full max-w-[30rem] px-5 pb-28">
      <AppHeader
        tenants={tenants}
        activeTenantId={activeTenantId}
        hiddenTenantIds={hiddenIds}
        currentUserId={currentUserId}
        onSelectTenant={selectTenant}
        onAddTenant={addTenant}
        onRenameTenant={renameTenant}
        onDeleteTenant={deleteTenant}
        onToggleHiddenTenant={toggleHiddenTenant}
        syncStatus={syncStatus}
        theme={theme}
        onSelectTheme={setTheme}
        section={section}
        onSelectSection={setSection}
        active={active}
        onRenameActive={renameActive}
        onStartNewList={startNewList}
        onSignOut={onSignOut}
      />

      <main className="pt-5">
        {section === "besin" ? (
          <NutritionView items={active.items} />
        ) : section === "yemek" ? (
          <MealPlanView householdId={activeTenantId} />
        ) : section === "kisisel" ? (
          <PersonalPlanView userId={currentUserId} />
        ) : (
          <AppShoppingTabs
            catalog={catalog}
            onAddItem={addItem}
            active={active}
            past={past}
            groupByCategory={groupByCategory}
            mergedCategories={mergedCategories}
            overlay={overlay}
            selectMode={selection.selectMode}
            selectedIds={selection.selectedIds}
            onToggleSelect={selection.toggleSelectItem}
            onToggleSelectMode={selection.toggleSelectMode}
            onSelectAll={() => selection.selectAll(active.items.map(i => i.id))}
            onSelectCategory={selection.selectCategory}
            onBulkRemove={bulkRemove}
            swipeMode={swipeMode}
            onToggleSwipeMode={toggleSwipeMode}
            onToggleItem={toggleItem}
            onRemoveItem={removeItem}
            onEditItem={editItem}
            onCategorize={categorizeActive}
            onToggleGrouping={toggleGrouping}
            onReuseList={reuseList}
            isOnList={isOnList}
            onRenameCategory={renameCat}
            onToggleHiddenCategory={toggleHidden}
            onMoveCategory={moveCat}
            onReorderCategories={reorderCats}
            onAddCategory={addCategory}
            onRemoveCategory={removeCategory}
          />
        )}
      </main>

      {undo && <UndoToast undo={undo} onRestore={restore} />}
    </Tabs>
  );
}
