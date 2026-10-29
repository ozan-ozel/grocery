import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealPlanSkeleton } from "@/components/MealPlanSkeleton";
import { SuggestionCard } from "@/components/ui/suggestion-card";
import { useMealPlan, todayDateStr } from "@/hooks/useMealPlan";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { useMealPersonalization } from "@/hooks/useMealPersonalization";
import { useRemainingToday } from "@/hooks/useRemainingToday";
import { useBatchLedger } from "@/hooks/useBatches";
import { useSavedMeals } from "@/hooks/useSavedMeals";
import { useMealPlanHistory } from "@/hooks/useMealPlanHistory";
import { SwipeToast } from "@/components/ui/swipe-toast";
import { dismissHistoryToast, runAsOneStep } from "@/lib/mealPlanHistory";
import {
  MEAL_SLOTS,
  calculateItemsNutrition,
  type MealItem,
  type MealSlot,
} from "@/lib/localMealPlan";
import { calculateTargets, occasionProteinTargetG } from "@/lib/mealPersonalization";
import { type MacroTotals } from "@/lib/mealNutrition";
import { lookupNutrition, type Nutrition } from "@/lib/nutrition";
import { MacroSummaryCard } from "@/components/MacroSummaryCard";
import { useScopeAttestation } from "@/hooks/useScopeAttestation";
import { OUT_OF_SCOPE_MESSAGE } from "@/lib/safetyCopy";
import { planningMacros, INCOMPATIBLE_TARGETS_MESSAGE } from "@/lib/planningMacros";
import { MealContainer, MEAL_LABELS } from "@/components/MealContainer";
import { BatchSheet } from "@/components/BatchSheet";
import { BatchAllocateSheet } from "@/components/BatchAllocateSheet";
import { FoodSearchModal } from "@/components/FoodSearchModal";
import { MealShoppingConfirmModal } from "@/components/MealShoppingConfirmModal";
import { MealsSheet } from "@/components/MealsSheet";
import { scaleMealItems, type Meal } from "@/lib/meals";
import { ALL_READY_MEALS } from "@/lib/readyMeals";
import { scoreAllMeals, type ScoredMeal } from "@/lib/mealMatch";
import {
  matchEveningMeals,
  EVENING_CANDIDATE_PATTERNS,
  EVENING_PATTERN_BY_ID,
} from "@/lib/eveningRecommend";
import { batchDateLabel, hasRemaining } from "@/lib/preparationBatch";
import type { LoggedEntry } from "@/hooks/useRemainingToday";
import type { MealGroupInfo } from "@/lib/mealGroups";

// DEC-069 batch-prep UI is hidden (2026-09-20): the Yemekler sheet was renamed and batch
// prep still has to be re-wired to it. Flip to true to bring the "Toplu Hazırlıklar" row
// and the per-slot "add from a batch" action back.
const BATCH_PREP_VISIBLE = false;

type Props = {
  userId: string | null;
  householdId: string | null;
  // MVP-1 PROVISIONAL (PSM Iteration 1, DEC-071): reuses the shopping tab's
  // existing addItem exactly as-is (name + free-text qty, no unit parsing or
  // quantity aggregation across duplicate ingredients). REVISIT AFTER QA-1.
  onAddShoppingItem: (name: string, qty: string) => void;
  isOnShoppingList: (name: string) => boolean;
  onRemoveShoppingItem: (name: string) => void;
  // True while App's shopping-list undo toast is showing, so the meal-plan
  // toast stacks above it instead of covering it.
  shoppingUndoVisible?: boolean;
  // Opens Kişisel Plan from the macro card's "Hedeflerini kişiselleştir".
  onOpenPersonalPlan?: () => void;
};

export function MealPlanView({
  userId,
  householdId,
  onAddShoppingItem,
  isOnShoppingList,
  onRemoveShoppingItem,
  shoppingUndoVisible,
  onOpenPersonalPlan,
}: Props) {
  const { foods, catalogMap, status } = useFoodCatalog();
  const {
    profile: personalizationProfile,
    hasSavedProfile,
    remoteChecked,
  } = useMealPersonalization(userId);
  // DEC-012: a user outside the app's scope sees no targets or target-based
  // suggestions here; logging, meals and the shopping list still work.
  const { outOfScope } = useScopeAttestation(userId);
  // Only label targets as an example once the server has confirmed there is
  // no profile — a returning user on a fresh device has no local cache yet.
  const targetsAreExample = !hasSavedProfile && remoteChecked;
  // Yemeklerim — fetched here (not inside the sheet) so the list is already
  // there when the "Yemekler" sheet opens.
  const savedMeals = useSavedMeals(userId);
  const {
    date,
    dateLabel,
    isLoading,
    goToPrevDay,
    goToNextDay,
    itemsForSlot,
    allItems,
    addItem,
    updateItemQuantity,
    removeItem,
    dailyNutrition,
    clearSlot,
    clearDay,
    undoLast,
  } = useMealPlan(householdId, catalogMap);
  const history = useMealPlanHistory(householdId);
  const historyToast = history.toast;
  // The toast hides after 6 s (like the shopping-list one); the history itself
  // stays, reachable from the Geri al button.
  useEffect(() => {
    if (!historyToast) return;
    const timer = window.setTimeout(dismissHistoryToast, 6000);
    return () => window.clearTimeout(timer);
  }, [historyToast?.id]);
  // Evening recommendations only make sense against *today's* actual
  // remaining budget — reuses the existing hook wholesale rather than
  // recomputing target-minus-consumed here (its internal useMealPlan call
  // shares this component's own TanStack Query cache entry whenever `date`
  // is today, since both resolve to the same ["mealEntries", householdId,
  // date] key — see useMealPlan.ts).
  const remainingToday = useRemainingToday(userId, householdId);
  const isToday = date === todayDateStr();
  const [eveningPreparingIds, setEveningPreparingIds] = useState<Set<string>>(
    new Set()
  );
  const totals = dailyNutrition();
  const dayItems = allItems();
  const hasTotals =
    totals.kcal > 0 ||
    totals.proteinG > 0 ||
    totals.fatG > 0 ||
    totals.carbsG > 0;
  const dayAlreadyOnList =
    dayItems.length > 0 &&
    dayItems.every(item =>
      isOnShoppingList(catalogMap.get(item.foodId)?.name_tr ?? item.foodId),
    );
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<MealSlot | null>(null);
  // Set when a MealGroup's edit pencil opens the sheet directly into the
  // "edit this saved meal" form, instead of the normal Yemeklerim list.
  const [editSavedMealId, setEditSavedMealId] = useState<string | null>(null);
  const [shoppingConfirm, setShoppingConfirm] = useState<{
    mode: "add" | "remove";
    item: MealItem;
  } | null>(null);

  // DEC-069 batch preparation. One ledger for the whole screen; the two
  // sheets and the origin chips below are all presentation over it.
  const { ledger, createBatch } = useBatchLedger(householdId);
  const [batchSheetOpen, setBatchSheetOpen] = useState(false);
  const [allocateSlot, setAllocateSlot] = useState<MealSlot | null>(null);
  const activeBatchCount = ledger.filter(({ remaining }) => hasRemaining(remaining)).length;
  const batchById = new Map(ledger.map(({ batch }) => [batch.id, batch]));

  function batchLabelFor(item: MealItem): string | undefined {
    if (!item.batchId) return undefined;
    const batch = batchById.get(item.batchId);
    return batch ? `Parti · ${batchDateLabel(batch.preparedDate)}` : "Parti";
  }

  function handleBatchAllocate(batchId: string, foodId: string, quantityG: number) {
    if (!allocateSlot) return;
    addItem(allocateSlot, foodId, quantityG, undefined, batchId);
  }

  // mealId -> display name + source, for the meal cards in each slot.
  // Built-in meals, the user's saved meals (their id is the mealId) and
  // evening patterns all stamp their id on the entries they add.
  const mealInfoById = new Map<string, MealGroupInfo>();
  for (const meal of ALL_READY_MEALS) mealInfoById.set(meal.id, { name: meal.nameTr, source: "builtin" });
  for (const meal of savedMeals.savedMeals) mealInfoById.set(meal.id, { name: meal.name, source: "saved" });
  for (const [id, pattern] of EVENING_PATTERN_BY_ID) mealInfoById.set(id, { name: pattern.nameTr, source: "evening" });

  const scoredReadyMeals = scoreAllMeals(
    ALL_READY_MEALS,
    personalizationProfile.foodExclusions,
    personalizationProfile.allergenExclusions,
    catalogMap,
  );

  const targets = calculateTargets(personalizationProfile);
  const planningTarget = targets ? planningMacros(targets) : null;
  const targetMacros: MacroTotals = planningTarget ?? {
        kcal: 0,
        proteinG: 0,
        fatG: 0,
        carbsG: 0,
        fiberG: 0,
      };

  // What is left of the viewed day's targets, and which slots already have
  // entries — the inputs "Sana uygun" (src/lib/mealRecommend.ts) needs.
  const remainingMacros: MacroTotals = {
    kcal: targetMacros.kcal - totals.kcal,
    proteinG: targetMacros.proteinG - totals.proteinG,
    fatG: targetMacros.fatG - totals.fatG,
    carbsG: targetMacros.carbsG - totals.carbsG,
    fiberG: targetMacros.fiberG - totals.fiberG,
  };
  const filledSlots = new Set<MealSlot>(
    MEAL_SLOTS.filter(({ slot }) => itemsForSlot(slot).length > 0).map(({ slot }) => slot),
  );

  // DEC-060 extension (src/lib/eveningRecommend.ts) — quantity-solved
  // protein+carb patterns against today's real remaining macros, distinct
  // from `scoredReadyMeals` above (fixed-gram authored meals for the manual
  // picker modal). Gated to today only: `remainingToday` is always today's
  // budget regardless of which day is being browsed via goToPrevDay/
  // goToNextDay, so showing it on a different day would misrepresent a
  // past/future day's plan as "tonight."
  const eveningSuggestions: ScoredMeal[] =
    isToday && remainingToday.status === "ready" && remainingToday.targetsCompatible
      ? matchEveningMeals(
          EVENING_CANDIDATE_PATTERNS,
          remainingToday.remaining,
          remainingToday.foodExclusions,
          remainingToday.allergenExclusions,
          remainingToday.catalogMap
        )
      : [];

  // Patterns already logged today (via "Yedim" below), grouped back to
  // their own card so undo lives right on it instead of requiring the
  // per-ingredient delete in whichever slot they landed in. Real logged
  // totals (not the nominal solved-quantity ones).
  const eatenEveningMeals: { meal: ScoredMeal; entries: LoggedEntry[] }[] =
    isToday && remainingToday.status === "ready"
      ? (() => {
          const byPattern = new Map<
            string,
            { entries: LoggedEntry[]; items: MealItem[] }
          >();
          for (const item of remainingToday.todaysItems) {
            if (!item.mealId || !EVENING_PATTERN_BY_ID.has(item.mealId)) continue;
            const bucket = byPattern.get(item.mealId) ?? { entries: [], items: [] };
            bucket.entries.push({ id: item.id, slot: item.slot });
            bucket.items.push(item);
            byPattern.set(item.mealId, bucket);
          }
          const result: { meal: ScoredMeal; entries: LoggedEntry[] }[] = [];
          for (const [patternId, bucket] of byPattern) {
            const pattern = EVENING_PATTERN_BY_ID.get(patternId);
            if (!pattern) continue;
            result.push({
              meal: {
                id: patternId,
                nameTr: pattern.nameTr,
                items: bucket.items.map((item) => ({
                  foodId: item.foodId,
                  grams: item.quantityG,
                })),
                prepMinutes: pattern.prepMinutes,
                tags: [],
                totals: calculateItemsNutrition(bucket.items, remainingToday.catalogMap),
                hasSoftConflict: false,
              },
              entries: bucket.entries,
            });
          }
          return result;
        })()
      : [];
  const eatenEveningIds = new Set(eatenEveningMeals.map((e) => e.meal.id));
  // A pattern already eaten today shouldn't also show as a fresh
  // recommendation card — matchEveningMeals doesn't know about "already
  // eaten" state, so this is filtered here rather than in eveningRecommend.ts.
  const visibleEveningSuggestions = outOfScope
    ? []
    : eveningSuggestions.filter((meal) => !eatenEveningIds.has(meal.id));

  function handleFoodSelect(food: Nutrition, quantityG: number) {
    if (activeSlot) {
      addItem(activeSlot, food.name_tr, quantityG);
      setFoodModalOpen(false);
      setActiveSlot(null);
    }
  }

  // `factor` is the chosen portion multiplier (see MEAL_PORTIONS in
  // meals.ts) — every ingredient is scaled together, so the meal's protein
  // and carb portions stay proportional. The logged mealId is unchanged:
  // it's provenance, the grams are what actually count.
  function handleMealSelect(meal: Meal, factor: number) {
    if (!activeSlot) return;
    runAsOneStep(`${meal.nameTr} eklendi`, () => {
      for (const item of scaleMealItems(meal.items, factor)) {
        const nutrition = lookupNutrition(catalogMap, item.foodId);
        if (nutrition) {
          addItem(activeSlot, nutrition.name_tr, item.grams, meal.id);
        }
      }
    });
    setMealModalOpen(false);
    setActiveSlot(null);
  }

  function requestShoppingToggle(item: MealItem) {
    const name = catalogMap.get(item.foodId)?.name_tr ?? item.foodId;
    setShoppingConfirm({
      mode: isOnShoppingList(name) ? "remove" : "add",
      item,
    });
  }

  function confirmShoppingToggle() {
    if (!shoppingConfirm) return;
    const food = catalogMap.get(shoppingConfirm.item.foodId);
    const name = food?.name_tr ?? shoppingConfirm.item.foodId;
    if (shoppingConfirm.mode === "add") {
      onAddShoppingItem(name, `${shoppingConfirm.item.quantityG}g`);
    } else {
      onRemoveShoppingItem(name);
    }
    setShoppingConfirm(null);
  }

  // MVP-1 PROVISIONAL (DEC-071): the smallest viable meal-plan -> shopping
  // translation — walk this day's planned items and add each one's food name
  // + gram quantity to the active shopping list via the existing addItem
  // (same name/alias resolution and near-duplicate dedup shopping already
  // uses; no quantity aggregation across repeated ingredients, no
  // pantry/store/budget awareness). REVISIT AFTER QA-1.
  function toggleDayShoppingList() {
    for (const item of dayItems) {
      const name = catalogMap.get(item.foodId)?.name_tr ?? item.foodId;
      if (dayAlreadyOnList) {
        onRemoveShoppingItem(name);
      } else {
        onAddShoppingItem(name, `${item.quantityG}g`);
      }
    }
  }

  // Mirrors toggleDayShoppingList's own name/qty pattern exactly — this
  // component's onAddShoppingItem has no `exact`-match option, so this is the same fuzzy-resolvable add every
  // other shopping-list action on this screen already uses.
  function addEveningMealToList(meal: ScoredMeal) {
    for (const item of meal.items) {
      const name = catalogMap.get(item.foodId)?.name_tr ?? item.foodId;
      onAddShoppingItem(name, `${item.grams}g`);
    }
  }

  function removeEveningMealFromList(meal: ScoredMeal) {
    for (const item of meal.items) {
      const name = catalogMap.get(item.foodId)?.name_tr ?? item.foodId;
      onRemoveShoppingItem(name);
    }
  }

  function isEveningMealOnList(meal: ScoredMeal) {
    return meal.items.every((item) =>
      isOnShoppingList(catalogMap.get(item.foodId)?.name_tr ?? item.foodId)
    );
  }

  function toggleEveningPreparing(mealId: string) {
    setEveningPreparingIds((prev) => {
      const next = new Set(prev);
      if (next.has(mealId)) next.delete(mealId);
      else next.add(mealId);
      return next;
    });
  }

  // Uses remainingToday.logConsumption directly — never touches `activeSlot`
  // (the food/recipe-picker modals' state), so this can never attach to
  // whatever slot a modal happens to have selected. logConsumption infers
  // its own slot from time-of-day (see useRemainingToday.ts's inferSlot),
  // independently of anything in this component.
  function eatEveningMeal(meal: ScoredMeal) {
    if (remainingToday.status !== "ready") return;
    runAsOneStep(`${meal.nameTr} eklendi`, () => {
      for (const item of meal.items) {
        remainingToday.logConsumption(item.foodId, item.grams, meal.id);
      }
    });
    setEveningPreparingIds((prev) => {
      if (!prev.has(meal.id)) return prev;
      const next = new Set(prev);
      next.delete(meal.id);
      return next;
    });
  }

  function undoEveningMeal(mealId: string) {
    if (remainingToday.status !== "ready") return;
    const found = eatenEveningMeals.find((e) => e.meal.id === mealId);
    if (!found) return;
    runAsOneStep(`${found.meal.nameTr} kaldırıldı`, () => {
      remainingToday.undoConsumption(found.entries);
    });
  }

  return (
    // pb-6: the fixed bottom nav is ~76px tall (its "Besin Değerleri" label
    // wraps to two lines) against a 80px spacer, which left the last card only
    // ~4px clear of it — this adds the breathing room (~28px total).
    <div className="space-y-4 pb-6">
      <div className="flex min-h-6 items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Yemek Planı
        </p>
        {history.steps.length > 0 && (
          <Button
            type="button"
            variant="quiet"
            size="sm"
            className="h-6 gap-1 px-2"
            onClick={undoLast}
            aria-label={`Son işlemi geri al, ${history.steps.length} adım`}>
            <Undo2 className="size-3.5" />
            Geri al · {history.steps.length}
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="quiet"
          size="icon"
          onClick={goToPrevDay}
          aria-label="Önceki gün">
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-lg font-semibold tracking-tight">
          {dateLabel}
        </span>
        <Button
          type="button"
          variant="quiet"
          size="icon"
          onClick={goToNextDay}
          aria-label="Sonraki gün">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {status === "error" && (
        <p className="px-1 text-xs text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}

      {!isLoading && (
        <>
          {/* Daily Macro Summary */}
          {outOfScope ? (
            <p className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
              {OUT_OF_SCOPE_MESSAGE}
            </p>
          ) : !planningTarget ? (
            <p className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
              {INCOMPATIBLE_TARGETS_MESSAGE}
            </p>
          ) : (
            <MacroSummaryCard
              consumed={totals}
              target={targetMacros}
              isEstimated={targetsAreExample}
              onPersonalize={onOpenPersonalPlan}
            />
          )}

          {/* Meal Containers */}
          <div className="space-y-3">
            {(() => {
              const proteinTarget = outOfScope || !planningTarget
                ? undefined
                : occasionProteinTargetG(personalizationProfile.weightKg);
              return MEAL_SLOTS.map(({ slot }) => (
                <MealContainer
                  key={slot}
                  mealType={getMealType(slot)}
                  items={itemsForSlot(slot)}
                  catalog={catalogMap}
                  onSelectFood={() => {
                    setActiveSlot(slot);
                    setFoodModalOpen(true);
                  }}
                  onSelectRecipe={() => {
                    setActiveSlot(slot);
                    setMealModalOpen(true);
                  }}
                  onRemoveItem={itemId => removeItem(slot, itemId)}
                  onUpdateItemQuantity={(itemId, quantityG) =>
                    updateItemQuantity(slot, itemId, quantityG)
                  }
                  isOnShoppingList={foodId =>
                    isOnShoppingList(catalogMap.get(foodId)?.name_tr ?? foodId)
                  }
                  onToggleShoppingList={requestShoppingToggle}
                  onSelectBatch={
                    BATCH_PREP_VISIBLE && activeBatchCount > 0
                      ? () => setAllocateSlot(slot)
                      : undefined
                  }
                  batchLabelFor={batchLabelFor}
                  mealNameFor={id => mealInfoById.get(id)}
                  onEditSavedMeal={id => {
                    setActiveSlot(slot);
                    setEditSavedMealId(id);
                    setMealModalOpen(true);
                  }}
                  onClear={() => clearSlot(slot)}
                  proteinTargetG={proteinTarget}
                />
              ));
            })()}
          </div>

          {BATCH_PREP_VISIBLE && householdId && (
            <button
              type="button"
              onClick={() => setBatchSheetOpen(true)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary active:border-primary">
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  Toplu Hazırlıklar
                </span>
                <span className="block text-xs text-muted-foreground">
                  {ledger.length === 0
                    ? "Bir kere pişir, birkaç güne yay"
                    : activeBatchCount > 0
                      ? `${activeBatchCount} aktif parti`
                      : "Tüm partiler tükendi"}
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )}

          {(visibleEveningSuggestions.length > 0 || eatenEveningMeals.length > 0) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Akşam için öneriler
              </h3>
              <ul className="space-y-2">
                {visibleEveningSuggestions.map((meal) => (
                  <SuggestionCard
                    key={meal.id}
                    meal={meal}
                    preparing={eveningPreparingIds.has(meal.id)}
                    added={isEveningMealOnList(meal)}
                    onAdd={() => addEveningMealToList(meal)}
                    onRemove={() => removeEveningMealFromList(meal)}
                    onTogglePreparing={() => toggleEveningPreparing(meal.id)}
                    onEat={() => eatEveningMeal(meal)}
                  />
                ))}
                {eatenEveningMeals.map(({ meal }) => (
                  <SuggestionCard
                    key={meal.id}
                    meal={meal}
                    preparing={false}
                    added={isEveningMealOnList(meal)}
                    eaten
                    onUndo={() => undoEveningMeal(meal.id)}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Same skeleton as the lazy-chunk Suspense fallback in App.tsx, so
          the chunk-loading -> data-loading handoff doesn't change shape. */}
      {isLoading && <MealPlanSkeleton />}

      {/* Food Search Modal */}
      <FoodSearchModal
        title={activeSlot ? "Ürün Seç / Ara" : "Yemek Ara"}
        foods={foods}
        isOpen={foodModalOpen}
        onClose={() => {
          setFoodModalOpen(false);
          setActiveSlot(null);
        }}
        onSelect={handleFoodSelect}
      />

      {/* Meal picker: Yemeklerim / Hazır Yemekler / Tarifler */}
      <MealsSheet
        isOpen={mealModalOpen}
        onClose={() => {
          setMealModalOpen(false);
          setActiveSlot(null);
          setEditSavedMealId(null);
        }}
        slot={activeSlot}
        readyMeals={scoredReadyMeals}
        catalog={catalogMap}
        foods={foods}
        exclusions={personalizationProfile.foodExclusions}
        allergenExclusions={personalizationProfile.allergenExclusions}
        remaining={remainingMacros}
        filledSlots={filledSlots}
        targetsEstimated={targetsAreExample}
          hideRecommendations={outOfScope || !planningTarget}
        canSaveMeals={!!userId}
        savedMeals={savedMeals.savedMeals}
        savedLoading={savedMeals.isLoading}
        onCreateSaved={savedMeals.create}
        onUpdateSaved={savedMeals.update}
        onDeleteSaved={savedMeals.remove}
        onSelect={handleMealSelect}
        openEditMealId={editSavedMealId}
      />

      {shoppingConfirm && (
        <MealShoppingConfirmModal
          mode={shoppingConfirm.mode}
          items={[
            {
              name:
                catalogMap.get(shoppingConfirm.item.foodId)?.name_tr ??
                shoppingConfirm.item.foodId,
              qty: `${shoppingConfirm.item.quantityG}g`,
            },
          ]}
          onConfirm={confirmShoppingToggle}
          onCancel={() => setShoppingConfirm(null)}
        />
      )}

      {batchSheetOpen && householdId && (
        <BatchSheet
          householdId={householdId}
          ledger={ledger}
          catalog={catalogMap}
          foods={foods}
          exclusions={personalizationProfile.foodExclusions}
          allergenExclusions={personalizationProfile.allergenExclusions}
          defaultDate={date}
          createBatch={createBatch}
          onClose={() => setBatchSheetOpen(false)}
        />
      )}

      {allocateSlot && (
        <BatchAllocateSheet
          subtitle={`${dateLabel} · ${MEAL_LABELS[getMealType(allocateSlot)].tr}`}
          ledger={ledger}
          catalog={catalogMap}
          exclusions={personalizationProfile.foodExclusions}
          allergenExclusions={personalizationProfile.allergenExclusions}
          onAdd={handleBatchAllocate}
          onClose={() => setAllocateSlot(null)}
        />
      )}

      {dayItems.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={clearDay}>
          Günü temizle
        </Button>
      )}

      {/* Add to shopping list button */}
      {hasTotals && (
        <Button
          type="button"
          variant="default"
          size="sm"
          className="w-full"
          onClick={toggleDayShoppingList}>
          {dayAlreadyOnList
            ? "Bu günü alışveriş listesinden çıkar"
            : "Bu günü alışveriş listesine ekle"}
        </Button>
      )}

      {historyToast && (
        <SwipeToast
          key={historyToast.id}
          message={historyToast.label}
          onAction={undoLast}
          onDismiss={dismissHistoryToast}
          bottomRem={shoppingUndoVisible ? 4.75 : 1.25}
        />
      )}
    </div>
  );
}

function getMealType(slot: MealSlot): "ilk" | "ara" | "son" {
  if (slot === "kahvalti") return "ilk";
  if (slot === "aksam") return "son";
  return "ara";
}
