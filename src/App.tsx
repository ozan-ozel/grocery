import { lazy, Suspense, useMemo, useRef } from "react";
import { Tabs } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader";
import { AppShoppingTabs } from "@/components/AppShoppingTabs";
import { UndoToast } from "@/components/UndoToast";
import { LoginGate } from "@/components/LoginGate";
import { LoadingBlock } from "@/components/LoadingBlock";
import { BottomNavigation, type NavTab } from "@/components/BottomNavigation";
import { buildCatalog } from "@/lib/store";
import { createListActions } from "@/lib/listActions";
import { useUiPrefs, initialSection, type Tab, type Section } from "@/hooks/useUiPrefs";
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
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { buildFoodIdentityIndex } from "@/lib/foodIdentity";

// Split out of the main bundle — each is a full section, mutually exclusive
// with the others at any given time (see the section-routing branch in
// AppShell), so there's no reason to pay their combined ~500 kB upfront just
// to show the shopping list, which is what most sessions land on.
const NutritionView = lazy(() =>
  import("@/components/NutritionView").then(m => ({ default: m.NutritionView }))
);
const MealPlanView = lazy(() =>
  import("@/components/MealPlanView").then(m => ({ default: m.MealPlanView }))
);
const PersonalPlanView = lazy(() =>
  import("@/components/PersonalPlanView").then(m => ({ default: m.PersonalPlanView }))
);
const SettingsView = lazy(() =>
  import("@/components/SettingsView").then(m => ({ default: m.SettingsView }))
);

export function App() {
  const { session, checked, signInWithGoogle, signOut, deleteAccount } =
    useAuth();
  // Read once per mount (not via useUiPrefs, which isn't mounted yet at this
  // gate) so the very first paint already mimics whichever section the URL
  // says we're landing on, instead of always guessing Alışveriş.
  const bootSection = useMemo(() => initialSection(), []);

  if (!checked) {
    return <AppBootSkeleton section={bootSection} />;
  }

  if (!session) {
    return <LoginGate onSignIn={signInWithGoogle} />;
  }

  return (
    <AppShell
      onSignOut={signOut}
      onDeleteAccount={deleteAccount}
      currentUserId={session.userId}
    />
  );
}

// Mimics each section's actual layout instead of a generic block stack, so
// the very first paint already reads as "this exact screen, still loading"
// rather than an unrelated placeholder — and instead of a bare spinner, in
// the app's own loading-flow language. That spinning icon is reserved for
// AppHeader's background sync status, a different concern from "content
// hasn't arrived yet". Section-specific because "yemek" (meal plan) is the
// actual default landing section (see initialSection() in useUiPrefs), not
// Alışveriş — a one-size skeleton would mispredict the common case.
function AppBootSkeleton({ section }: { section: Section }) {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col px-5 pt-6"
      role="status"
      aria-label="Yükleniyor">
      {/* Living gradient edge — the softened .gradient-edge-flow-soft variant
          (same mechanism PersonalPlanView/TodayView use at full strength for
          a small toggle, blended down here since it wraps the entire boot
          screen and full saturation read as too loud over a page of plain
          gray placeholders). Transform-only animation — no extra paint cost
          over the plain border it replaces. */}
      <div className="gradient-edge-flow-soft rounded-lg p-px">
        <div className="rounded-[calc(0.5rem-1px)] bg-background p-4">
          <BootSkeletonHeader section={section} />
          <BootSkeletonBody section={section} />
        </div>
      </div>
    </div>
  );
}

// AppHeader's icon buttons and MealPlanView's day-nav chevrons are all
// variant="quiet" — no visible button surface, just an icon glyph — so a
// filled size-9 square placeholder reads as the wrong shape entirely (a
// button box that doesn't exist). This mimics the actual glyph instead: a
// small round shimmer, centered in a same-footprint size-9 box so row
// spacing still matches the real header/nav once content arrives.
function QuietIconPlaceholder() {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center">
      <LoadingBlock className="size-4 rounded-full" />
    </div>
  );
}

// Mirrors each section's actual header shape: Alışveriş and Yemek Planı
// both now render a single-line title (no eyebrow+h1 pair — see
// AppHeader.tsx / MealPlanView.tsx), Besin/Kişisel/Ayarlar still use the
// two-line eyebrow+h1 pattern.
function BootSkeletonHeader({ section }: { section: Section }) {
  if (section === "alisveris") {
    return (
      <div className="pb-2">
        <LoadingBlock className="h-3 w-20 rounded" />
        <div className="mt-2 flex items-center justify-between gap-2">
          <LoadingBlock className="h-7 w-20 rounded-md" />
          <div className="flex items-center gap-1">
            <QuietIconPlaceholder />
            <QuietIconPlaceholder />
          </div>
        </div>
      </div>
    );
  }
  if (section === "yemek") {
    return (
      <div className="pb-3">
        <LoadingBlock className="h-3 w-24 rounded" />
      </div>
    );
  }
  return (
    <div className="pb-3">
      <LoadingBlock className="h-3 w-24 rounded" />
      <LoadingBlock className="mt-2 h-6 w-48 rounded-md" />
    </div>
  );
}

function BootSkeletonBody({ section }: { section: Section }) {
  switch (section) {
    case "yemek":
      return (
        <>
          <div className="flex items-center justify-between gap-2">
            <QuietIconPlaceholder />
            <LoadingBlock className="h-6 w-32 rounded-md" />
            <QuietIconPlaceholder />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <LoadingBlock className="h-16 rounded-lg" />
            <LoadingBlock className="h-16 rounded-lg" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <LoadingBlock className="h-16 rounded-lg" />
            <LoadingBlock className="h-16 rounded-lg" />
            <LoadingBlock className="h-16 rounded-lg" />
          </div>
          <div className="mt-4 space-y-2">
            <LoadingBlock className="h-24" />
            <LoadingBlock className="h-24" />
            <LoadingBlock className="h-24" />
          </div>
        </>
      );
    case "besin":
    case "kisisel":
    case "ayarlar":
      // These three all resolve to the same shape once loaded: an eyebrow+h1
      // header (already covered by BootSkeletonHeader) followed by a plain
      // stack of card-sized blocks — close enough across all three that a
      // dedicated layout per section wasn't worth the upkeep.
      return (
        <div className="mt-2 space-y-2">
          <LoadingBlock className="h-16" />
          <LoadingBlock className="h-16" />
          <LoadingBlock className="h-16" />
        </div>
      );
    case "alisveris":
    default:
      return (
        <>
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
        </>
      );
  }
}

// Liste → Geçmiş, matching AppHeader's TabsTrigger order, so a left/right
// swipe moves the same direction the tab bar reads.
const SHOPPING_TAB_ORDER: Tab[] = ["list", "history"];
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
    if (
      Math.abs(dx) < SWIPE_MIN_DISTANCE_PX ||
      Math.abs(dx) < Math.abs(dy) * 1.5
    )
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
  onDeleteAccount,
  currentUserId,
}: {
  onSignOut: () => void;
  onDeleteAccount: () => void;
  currentUserId: string | null;
}) {
  const {
    theme,
    setTheme,
    swipeMode,
    toggleSwipeMode,
    showNutritionValues,
    toggleShowNutritionValues,
    section,
    setSection,
    tab,
    setTab,
  } = useUiPrefs();

  const swipeTabs = useSwipeTabs(section, tab, setTab);

  const {
    tenants,
    activeTenantId,
    selectTenant,
    addTenant,
    renameTenant,
    deleteTenant,
    consumeFreshTenantId,
  } = useTenants();

  const { state, setState, updateState, stateRef } = useListSync(
    activeTenantId,
    consumeFreshTenantId,
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
  const onboarding = useOnboarding(
    currentUserId,
    personalization.hasSavedProfile,
  );

  const catalog = useMemo(
    () => buildCatalog(state?.lists ?? []),
    [state?.lists],
  );

  // Canonical Food Identity implementation: one useFoodCatalog() instance
  // here so createListActions' addItem can resolve a shopping add against
  // the nutrition catalog. Safe to add at this top level (unlike
  // useMealPersonalization, which caused a real staleness bug when tried
  // here previously) — useFoodCatalog is a TanStack Query hook already
  // called from several other components against the same shared cache
  // key, so this instance and theirs stay coherent automatically.
  const { foods: nutritionFoods } = useFoodCatalog();
  const foodIdentityIndex = useMemo(
    () => buildFoodIdentityIndex(nutritionFoods),
    [nutritionFoods],
  );

  const selection = useSelection(state?.activeId ?? undefined);

  // While onboarding is showing, any section pill tap is treated as if the
  // user had tapped "Atla" — it's a clearer read of intent than leaving the
  // pill silently inert, and the wizard would otherwise sit above app chrome
  // that looks interactive but does nothing (see Finding 3 of the
  // 2026-09-03 final review).
  function selectSection(next: Section) {
    if (onboarding.status === "unseen") onboarding.skip();
    setSection(next);
  }

  if (!tenants || !activeTenantId || !state) {
    return <AppBootSkeleton section={section} />;
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
    foodIdentityIndex,
  });

  const currentNavTab: NavTab =
    section === "alisveris"
      ? "shopping"
      : section === "besin"
        ? "nutrition"
        : section === "yemek"
          ? "meals"
          : section === "kisisel"
            ? "personal"
            : "settings";

  function handleNavTabChange(navTab: NavTab) {
    const sectionMap: Record<NavTab, Section> = {
      shopping: "alisveris",
      nutrition: "besin",
      meals: "yemek",
      personal: "kisisel",
      settings: "ayarlar",
    };
    selectSection(sectionMap[navTab]);
  }

  return (
    <Tabs
      value={tab}
      onValueChange={v => setTab(v as Tab)}
      className="mx-auto min-h-dvh w-full max-w-[30rem] px-5 pt-3">
      <AppHeader
        section={section}
        active={active}
        onRenameActive={renameActive}
        onStartNewList={startNewList}
      />

      <main
        className="pt-3"
        onTouchStart={swipeTabs.onTouchStart as never}
        onTouchEnd={swipeTabs.onTouchEnd as never}>
        {onboarding.status === "unseen" && personalization.remoteChecked ? (
          <OnboardingQuickSetup
            initialProfile={personalization.profile}
            onFinish={answers => {
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
          <Suspense fallback={<BootSkeletonBody section="besin" />}>
            <NutritionView
              items={active.items}
              showNutritionValues={showNutritionValues}
              mergedCategories={mergedCategories}
              overlay={overlay}
              onRenameCategory={renameCat}
              onToggleHiddenCategory={toggleHidden}
              onMoveCategory={moveCat}
              onReorderCategories={reorderCats}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
            />
          </Suspense>
        ) : section === "yemek" ? (
          <Suspense fallback={<BootSkeletonBody section="yemek" />}>
            <MealPlanView
              userId={currentUserId}
              householdId={activeTenantId}
              onAddShoppingItem={addItem}
              isOnShoppingList={isOnList}
              onRemoveShoppingItem={removeItemByName}
            />
          </Suspense>
        ) : section === "kisisel" ? (
          <Suspense fallback={<BootSkeletonBody section="kisisel" />}>
            <PersonalPlanView userId={currentUserId} />
          </Suspense>
        ) : section === "ayarlar" ? (
          <Suspense fallback={<BootSkeletonBody section="ayarlar" />}>
            <SettingsView
              onSignOut={onSignOut}
              onDeleteAccount={onDeleteAccount}
              tenants={tenants}
              activeTenantId={activeTenantId}
              currentUserId={currentUserId}
              onSelectTenant={selectTenant}
              onAddTenant={addTenant}
              onRenameTenant={renameTenant}
              onDeleteTenant={deleteTenant}
              theme={theme}
              onSelectTheme={setTheme}
            />
          </Suspense>
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
            onDeleteList={deleteList}
            isOnList={isOnList}
            showNutritionValues={showNutritionValues}
            onToggleShowNutritionValues={toggleShowNutritionValues}
          />
        )}
      </main>

      {undo && (
        <UndoToast undo={undo} onRestore={restore} onDismiss={dismiss} />
      )}

      <BottomNavigation
        activeTab={currentNavTab}
        onTabChange={handleNavTabChange}
      />
    </Tabs>
  );
}
