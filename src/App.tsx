import { useMemo, useRef } from "react";
import { Tabs } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader";
import { AppShoppingTabs } from "@/components/AppShoppingTabs";
import { NutritionView } from "@/components/NutritionView";
import { MealPlanView } from "@/components/MealPlanView";
import { PersonalPlanView } from "@/components/PersonalPlanView";
import { UndoToast } from "@/components/UndoToast";
import { LoginGate } from "@/components/LoginGate";
import { LoadingBlock } from "@/components/LoadingBlock";
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
import { useMealPersonalization } from "@/hooks/useMealPersonalization";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingQuickSetup } from "@/components/OnboardingQuickSetup";

export function App() {
  const { session, checked, signInWithGoogle, signOut } = useAuth();

  if (!checked) {
    return <AppBootSkeleton />;
  }

  if (!session) {
    return <LoginGate onSignIn={signInWithGoogle} />;
  }

  return <AppShell onSignOut={signOut} currentUserId={session.userId} />;
}

// Mimics AppHeader + AppShoppingTabs' actual layout (tenant chip, section
// tabs, date title with count, tally line, secondary tab row, list rows)
// instead of a generic block stack, so the very first paint already reads as
// "this exact screen, still loading" rather than an unrelated placeholder —
// and instead of a bare spinner, in the app's own loading-flow language. That
// spinning icon is reserved for AppHeader's background sync status, a
// different concern from "content hasn't arrived yet".
function AppBootSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col px-5 pt-6"
      role="status"
      aria-label="Yükleniyor">
      <div className="flex items-center justify-between gap-2 pb-2">
        <LoadingBlock className="h-7 w-20 rounded-md" />
        <div className="flex items-center gap-1">
          <LoadingBlock className="size-8 rounded-md" />
          <LoadingBlock className="size-8 rounded-md" />
        </div>
      </div>

      <LoadingBlock className="h-10 rounded-lg" />

      <div className="mt-4 flex items-end justify-between gap-2">
        <LoadingBlock className="h-8 w-40" />
        <LoadingBlock className="h-6 w-14" />
      </div>
      <LoadingBlock className="mt-3 h-1 w-full rounded-full" />

      <div className="mt-3 flex items-center gap-4">
        <LoadingBlock className="h-5 w-12" />
        <LoadingBlock className="h-5 w-10" />
        <LoadingBlock className="h-5 w-14" />
        <LoadingBlock className="h-5 w-8" />
      </div>

      <div className="mt-4 space-y-2">
        <LoadingBlock className="h-16" />
        <LoadingBlock className="h-16" />
        <LoadingBlock className="h-16" />
        <LoadingBlock className="h-16" />
      </div>
    </div>
  );
}

// Bugün → Liste → Geçmiş → Kategoriler, matching AppHeader's TabsTrigger
// order, so a left/right swipe moves the same direction the tab bar reads.
const SHOPPING_TAB_ORDER: Tab[] = ["today", "list", "history", "cats"];
const SWIPE_MIN_DISTANCE_PX = 60;
// Anything that owns its own horizontal touch gesture (a list row's
// swipe-to-check/delete when swipeMode is on, the horizontally-scrolling tab
// strip itself) or is just a normal tap target opts out, so a page-level
// swipe never fights a more specific one.
const SWIPE_IGNORE_SELECTOR =
  'button, input, a, textarea, select, [role="switch"], [data-swipe-row], .overflow-x-auto, details, summary';

// Swipe left/right anywhere in the Alışveriş section's content to move
// between its sub-tabs — only wired up there (not Besin/Yemek/Kişisel),
// since those don't have a matching row of sibling tabs to move between.
function useSwipeTabs(section: string, tab: Tab, setTab: (t: Tab) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(e: TouchEvent) {
    start.current = null;
    if (section !== "alisveris") return;
    if ((e.target as HTMLElement).closest(SWIPE_IGNORE_SELECTOR)) return;
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: TouchEvent) {
    const from = start.current;
    start.current = null;
    if (!from || section !== "alisveris") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - from.x;
    const dy = t.clientY - from.y;
    // Horizontal-dominant and past a real swipe distance, so an ordinary
    // vertical scroll (even a slightly diagonal one) never triggers this.
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE_PX || Math.abs(dx) < Math.abs(dy) * 1.5)
      return;
    const idx = SHOPPING_TAB_ORDER.indexOf(tab);
    if (idx === -1) return;
    if (dx < 0 && idx < SHOPPING_TAB_ORDER.length - 1) {
      setTab(SHOPPING_TAB_ORDER[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      setTab(SHOPPING_TAB_ORDER[idx - 1]);
    }
  }

  return { onTouchStart, onTouchEnd };
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

  const swipeTabs = useSwipeTabs(section, tab, setTab);

  const {
    tenants,
    hiddenIds,
    activeTenantId,
    selectTenant,
    addTenant,
    renameTenant,
    deleteTenant,
    toggleHiddenTenant,
    consumeFreshTenantId,
  } = useTenants();

  const { state, setState, updateState, stateRef, syncStatus } = useListSync(
    activeTenantId,
    consumeFreshTenantId
  );

  const { undo, showUndo, restore, dismiss } = useUndo(updateState, setState);
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

  const personalization = useMealPersonalization(currentUserId);
  const onboarding = useOnboarding(currentUserId, personalization.hasSavedProfile);

  const catalog = useMemo(
    () => buildCatalog(state?.lists ?? []),
    [state?.lists],
  );

  const selection = useSelection(state?.activeId ?? undefined);

  if (!tenants || !activeTenantId || !state) {
    return <AppBootSkeleton />;
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
    removeItemByName,
    bulkRemove,
    startNewList,
    reuseList,
    deleteList,
    renameActive,
    toggleGrouping,
    categorizeActive,
    isOnList,
  } = createListActions({
    state,
    active,
    catalog,
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

      <main
        className="pt-5"
        onTouchStart={swipeTabs.onTouchStart as never}
        onTouchEnd={swipeTabs.onTouchEnd as never}>
        {onboarding.status === "unseen" ? (
          <OnboardingQuickSetup
            initialProfile={personalization.profile}
            onFinish={(answers) => {
              personalization.update("ageYears", answers.ageYears);
              personalization.update("heightCm", answers.heightCm);
              personalization.update("weightKg", answers.weightKg);
              personalization.setEquationSex(answers.equationSex);
              personalization.setActivity(answers.activity);
              personalization.setGoal(answers.goal);
            }}
            onSkip={onboarding.skip}
          />
        ) : section === "besin" ? (
          <NutritionView items={active.items} />
        ) : section === "yemek" ? (
          <MealPlanView householdId={activeTenantId} />
        ) : section === "kisisel" ? (
          <PersonalPlanView userId={currentUserId} />
        ) : (
          <AppShoppingTabs
            catalog={catalog}
            onAddItem={addItem}
            userId={currentUserId}
            householdId={activeTenantId}
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
            onDeleteList={deleteList}
            isOnList={isOnList}
            onRemoveItemByName={removeItemByName}
            onRenameCategory={renameCat}
            onToggleHiddenCategory={toggleHidden}
            onMoveCategory={moveCat}
            onReorderCategories={reorderCats}
            onAddCategory={addCategory}
            onRemoveCategory={removeCategory}
          />
        )}
      </main>

      {undo && <UndoToast undo={undo} onRestore={restore} onDismiss={dismiss} />}
    </Tabs>
  );
}
