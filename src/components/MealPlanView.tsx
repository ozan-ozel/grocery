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
import { calculateTargets } from "@/lib/mealPersonalization";
import { type MacroTotals } from "@/lib/mealNutrition";
import { lookupNutrition, type Nutrition } from "@/lib/nutrition";
import { MacroSummaryCard } from "@/components/MacroSummaryCard";
import { MealContainer, MEAL_LABELS } from "@/components/MealContainer";
import { BatchSheet } from "@/components/BatchSheet";
import { BatchAllocateSheet } from "@/components/BatchAllocateSheet";
import { FoodSearchModal } from "@/components/FoodSearchModal";
import { MealShoppingConfirmModal } from "@/components/MealShoppingConfirmModal";
import { MealsSheet } from "@/components/MealsSheet";
import { ALL_COMBOS, scaleComboItems, type Combo } from "@/lib/combos";
import { scoreAllCombos, type ScoredCombo } from "@/lib/comboMatch";
import {
  matchEveningCombos,
  EVENING_CANDIDATE_PATTERNS,
  EVENING_PATTERN_BY_ID,
} from "@/lib/eveningRecommend";
import { batchDateLabel, hasRemaining } from "@/lib/preparationBatch";
import type { LoggedEntry } from "@/hooks/useRemainingToday";

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
};

export function MealPlanView({
  userId,
  householdId,
  onAddShoppingItem,
  isOnShoppingList,
  onRemoveShoppingItem,
  shoppingUndoVisible,
}: Props) {
  const { foods, catalogMap, status } = useFoodCatalog();
  const { profile: personalizationProfile, hasSavedProfile } = useMealPersonalization(userId);
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
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<MealSlot | null>(null);
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

  // comboId -> display name, for the meal cards in each slot. Built-in meals,
  // the user's saved meals (their id is the comboId) and evening patterns all
  // stamp their id on the entries they add.
  const mealNameById = new Map<string, string>();
  for (const combo of ALL_COMBOS) mealNameById.set(combo.id, combo.nameTr);
  for (const meal of savedMeals.savedMeals) mealNameById.set(meal.id, meal.name);
  for (const [id, pattern] of EVENING_PATTERN_BY_ID) mealNameById.set(id, pattern.nameTr);

  const scoredCombos = scoreAllCombos(
    ALL_COMBOS,
    personalizationProfile.foodExclusions,
    personalizationProfile.allergenExclusions,
    catalogMap,
  );

  const targets = calculateTargets(personalizationProfile);
  const targetMacros: MacroTotals = targets
    ? {
        kcal: targets.targetKcal,
        proteinG: (targets.proteinG.min + targets.proteinG.max) / 2,
        fatG: (targets.fatG.min + targets.fatG.max) / 2,
        carbsG: (targets.carbsG.min + targets.carbsG.max) / 2,
        fiberG: (targets.fiberG.min + targets.fiberG.max) / 2,
      }
    : {
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
  // from `scoredCombos` above (fixed-gram authored combos for the manual
  // picker modal). Gated to today only: `remainingToday` is always today's
  // budget regardless of which day is being browsed via goToPrevDay/
  // goToNextDay, so showing it on a different day would misrepresent a
  // past/future day's plan as "tonight."
  const eveningSuggestions: ScoredCombo[] =
    isToday && remainingToday.status === "ready"
      ? matchEveningCombos(
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
  const eatenEveningCombos: { combo: ScoredCombo; entries: LoggedEntry[] }[] =
    isToday && remainingToday.status === "ready"
      ? (() => {
          const byPattern = new Map<
            string,
            { entries: LoggedEntry[]; items: MealItem[] }
          >();
          for (const item of remainingToday.todaysItems) {
            if (!item.comboId || !EVENING_PATTERN_BY_ID.has(item.comboId)) continue;
            const bucket = byPattern.get(item.comboId) ?? { entries: [], items: [] };
            bucket.entries.push({ id: item.id, slot: item.slot });
            bucket.items.push(item);
            byPattern.set(item.comboId, bucket);
          }
          const result: { combo: ScoredCombo; entries: LoggedEntry[] }[] = [];
          for (const [patternId, bucket] of byPattern) {
            const pattern = EVENING_PATTERN_BY_ID.get(patternId);
            if (!pattern) continue;
            result.push({
              combo: {
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
  const eatenEveningIds = new Set(eatenEveningCombos.map((e) => e.combo.id));
  // A pattern already eaten today shouldn't also show as a fresh
  // recommendation card — matchEveningCombos doesn't know about "already
  // eaten" state, so this is filtered here rather than in eveningRecommend.ts.
  const visibleEveningSuggestions = eveningSuggestions.filter(
    (combo) => !eatenEveningIds.has(combo.id)
  );

  function handleFoodSelect(food: Nutrition, quantityG: number) {
    if (activeSlot) {
      addItem(activeSlot, food.name_tr, quantityG);
      setFoodModalOpen(false);
      setActiveSlot(null);
    }
  }

  // `factor` is the chosen portion multiplier (see COMBO_PORTIONS in
  // combos.ts) — every ingredient is scaled together, so the meal's protein
  // and carb portions stay proportional. The logged comboId is unchanged:
  // it's provenance, the grams are what actually count.
  function handleComboSelect(combo: Combo, factor: number) {
    if (!activeSlot) return;
    runAsOneStep(`${combo.nameTr} eklendi`, () => {
      for (const item of scaleComboItems(combo.items, factor)) {
        const nutrition = lookupNutrition(catalogMap, item.foodId);
        if (nutrition) {
          addItem(activeSlot, nutrition.name_tr, item.grams, combo.id);
        }
      }
    });
    setComboModalOpen(false);
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
  function addEveningComboToList(combo: ScoredCombo) {
    for (const item of combo.items) {
      const name = catalogMap.get(item.foodId)?.name_tr ?? item.foodId;
      onAddShoppingItem(name, `${item.grams}g`);
    }
  }

  function removeEveningComboFromList(combo: ScoredCombo) {
    for (const item of combo.items) {
      const name = catalogMap.get(item.foodId)?.name_tr ?? item.foodId;
      onRemoveShoppingItem(name);
    }
  }

  function isEveningComboOnList(combo: ScoredCombo) {
    return combo.items.every((item) =>
      isOnShoppingList(catalogMap.get(item.foodId)?.name_tr ?? item.foodId)
    );
  }

  function toggleEveningPreparing(comboId: string) {
    setEveningPreparingIds((prev) => {
      const next = new Set(prev);
      if (next.has(comboId)) next.delete(comboId);
      else next.add(comboId);
      return next;
    });
  }

  // Uses remainingToday.logConsumption directly — never touches `activeSlot`
  // (the food/recipe-picker modals' state), so this can never attach to
  // whatever slot a modal happens to have selected. logConsumption infers
  // its own slot from time-of-day (see useRemainingToday.ts's inferSlot),
  // independently of anything in this component.
  function eatEveningCombo(combo: ScoredCombo) {
    if (remainingToday.status !== "ready") return;
    runAsOneStep(`${combo.nameTr} eklendi`, () => {
      for (const item of combo.items) {
        remainingToday.logConsumption(item.foodId, item.grams, combo.id);
      }
    });
    setEveningPreparingIds((prev) => {
      if (!prev.has(combo.id)) return prev;
      const next = new Set(prev);
      next.delete(combo.id);
      return next;
    });
  }

  function undoEveningCombo(comboId: string) {
    if (remainingToday.status !== "ready") return;
    const found = eatenEveningCombos.find((e) => e.combo.id === comboId);
    if (!found) return;
    runAsOneStep(`${found.combo.nameTr} kaldırıldı`, () => {
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
          <MacroSummaryCard
            consumed={totals}
            target={targetMacros}
            isEstimated={false}
          />

          {/* Meal Containers */}
          <div className="space-y-3">
            {MEAL_SLOTS.map(({ slot }) => (
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
                  setComboModalOpen(true);
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
                mealNameFor={id => mealNameById.get(id)}
                onClear={() => clearSlot(slot)}
              />
            ))}
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

          {(visibleEveningSuggestions.length > 0 || eatenEveningCombos.length > 0) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Akşam için öneriler
              </h3>
              <ul className="space-y-2">
                {visibleEveningSuggestions.map((combo) => (
                  <SuggestionCard
                    key={combo.id}
                    combo={combo}
                    preparing={eveningPreparingIds.has(combo.id)}
                    added={isEveningComboOnList(combo)}
                    onAdd={() => addEveningComboToList(combo)}
                    onRemove={() => removeEveningComboFromList(combo)}
                    onTogglePreparing={() => toggleEveningPreparing(combo.id)}
                    onEat={() => eatEveningCombo(combo)}
                  />
                ))}
                {eatenEveningCombos.map(({ combo }) => (
                  <SuggestionCard
                    key={combo.id}
                    combo={combo}
                    preparing={false}
                    added={isEveningComboOnList(combo)}
                    eaten
                    onUndo={() => undoEveningCombo(combo.id)}
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
        isOpen={comboModalOpen}
        onClose={() => {
          setComboModalOpen(false);
          setActiveSlot(null);
        }}
        slot={activeSlot}
        combos={scoredCombos}
        catalog={catalogMap}
        foods={foods}
        exclusions={personalizationProfile.foodExclusions}
        allergenExclusions={personalizationProfile.allergenExclusions}
        remaining={remainingMacros}
        filledSlots={filledSlots}
        targetsEstimated={!hasSavedProfile}
        canSaveMeals={!!userId}
        savedMeals={savedMeals.savedMeals}
        savedLoading={savedMeals.isLoading}
        onCreateSaved={savedMeals.create}
        onUpdateSaved={savedMeals.update}
        onDeleteSaved={savedMeals.remove}
        onSelect={handleComboSelect}
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
