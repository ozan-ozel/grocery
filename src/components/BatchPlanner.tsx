// DEC-069 (batch cooking, leftovers, storage-aware planning) — minimum UI
// surface: create a PreparationBatch (from a Combo or manually), see its
// composition, see what remains, and allocate part of it into a meal entry
// on any date. Reuses MealFoodPicker for manual food selection, comboMatch's
// existing hard-exclusion filtering for the Combo picker, and mealPlan.ts's
// existing createMealEntry for allocation — no new safety or nutrition
// logic is introduced here.
import { useState } from "react";
import { useQueryClient } from "@tanstack/preact-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MealFoodPicker } from "@/components/MealFoodPicker";
import { ALL_COMBOS, COMBO_BY_ID } from "@/lib/combos";
import { scoreAllCombos } from "@/lib/comboMatch";
import { scaleNutrition, sumMacros, type MacroTotals } from "@/lib/mealNutrition";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import { MEAL_SLOTS, type MealSlot } from "@/lib/localMealPlan";
import { createMealEntry } from "@/lib/mealPlan";
import { uid } from "@/lib/store";
import { useBatches, useBatchAllocations } from "@/hooks/useBatches";
import {
  normalizeComposition,
  isValidComposition,
  remainingComposition,
  type BatchCompositionItem,
  type PreparationBatch,
} from "@/lib/preparationBatch";

type Props = {
  householdId: string | null;
  foods: Nutrition[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  defaultDate: string; // YYYY-MM-DD — the date currently shown in MealPlanView
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function compositionTotals(items: BatchCompositionItem[], catalog: NutritionMap): MacroTotals {
  const totals: MacroTotals[] = [];
  for (const item of items) {
    const nutrition = catalog.get(item.foodId);
    if (nutrition) totals.push(scaleNutrition(nutrition, item.quantityG));
  }
  return sumMacros(totals);
}

export function BatchPlanner({
  householdId,
  foods,
  catalog,
  exclusions,
  allergenExclusions,
  defaultDate,
}: Props) {
  const { batches, createBatch } = useBatches(householdId);
  const [creating, setCreating] = useState(false);

  return (
    <div className="mt-6 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Toplu Hazırlıklar
        </span>
        <Button type="button" variant="quiet" size="sm" onClick={() => setCreating((v) => !v)}>
          {creating ? "Vazgeç" : "Yeni parti"}
        </Button>
      </div>

      {batches.length === 0 && !creating && (
        <p className="py-3 text-sm text-muted-foreground">
          Henüz toplu hazırlık yok. Bir kombinasyondan veya elle seçtiğin
          besinlerden büyük miktarda hazırlık oluşturup birden fazla güne
          yayabilirsin.
        </p>
      )}

      {creating && householdId && (
        <BatchCreateForm
          foods={foods}
          catalog={catalog}
          exclusions={exclusions}
          allergenExclusions={allergenExclusions}
          defaultDate={defaultDate}
          onSubmit={async (data) => {
            await createBatch({
              id: uid(),
              householdId,
              preparedDate: data.preparedDate,
              storageNote: data.storageNote,
              sourceComboId: data.sourceComboId,
              composition: data.composition,
            });
            setCreating(false);
          }}
        />
      )}

      {batches.length > 0 && (
        <ul className="mt-3 space-y-2">
          {batches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              householdId={householdId}
              catalog={catalog}
              defaultDate={defaultDate}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function BatchCreateForm({
  foods,
  catalog,
  exclusions,
  allergenExclusions,
  defaultDate,
  onSubmit,
}: {
  foods: Nutrition[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  defaultDate: string;
  onSubmit: (data: {
    preparedDate: string;
    storageNote?: string;
    sourceComboId?: string;
    composition: BatchCompositionItem[];
  }) => void;
}) {
  const [mode, setMode] = useState<"combo" | "manual">("combo");
  const [preparedDate, setPreparedDate] = useState(defaultDate);
  const [storageNote, setStorageNote] = useState("");
  const [multiplier, setMultiplier] = useState("1");
  // Hard-excluded combos are already dropped by scoreAllCombos, mirroring
  // TodayView's own suggestion list — a batch can never be created from a
  // combo containing a hard-excluded food.
  const allowedCombos = scoreAllCombos(ALL_COMBOS, exclusions, allergenExclusions, catalog);
  const [comboId, setComboId] = useState(allowedCombos[0]?.id ?? "");
  const [manualItems, setManualItems] = useState<BatchCompositionItem[]>([]);

  function addManualItem(foodId: string, quantityG: number) {
    setManualItems((prev) => [...prev, { foodId, quantityG }]);
  }

  function removeManualItem(index: number) {
    setManualItems((prev) => prev.filter((_, i) => i !== index));
  }

  function buildComposition(): BatchCompositionItem[] {
    if (mode === "combo") {
      const combo = ALL_COMBOS.find((c) => c.id === comboId);
      if (!combo) return [];
      const factor = Number(multiplier);
      const safeFactor = Number.isFinite(factor) && factor > 0 ? factor : 1;
      return normalizeComposition(
        combo.items.map((item) => ({ foodId: item.foodId, quantityG: item.grams * safeFactor }))
      );
    }
    return normalizeComposition(manualItems);
  }

  const composition = buildComposition();
  const canSubmit = isValidComposition(composition) && !!preparedDate;
  const totals = compositionTotals(composition, catalog);

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      preparedDate,
      storageNote: storageNote.trim() ? storageNote.trim() : undefined,
      sourceComboId: mode === "combo" ? comboId : undefined,
      composition,
    });
  }

  return (
    <div className="mt-3 space-y-3 rounded-md border border-border p-3">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "combo" ? "default" : "outline"}
          onClick={() => setMode("combo")}>
          Kombinasyondan
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => setMode("manual")}>
          Elle seç
        </Button>
      </div>

      {mode === "combo" ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-muted-foreground">
            Kombinasyon
            <select
              value={comboId}
              onChange={(event) => setComboId((event.target as HTMLSelectElement).value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {allowedCombos.length === 0 && <option value="">Uygun kombinasyon yok</option>}
              {allowedCombos.map((combo) => (
                <option key={combo.id} value={combo.id}>
                  {combo.nameTr}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Kat sayısı
            <Input
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={multiplier}
              onInput={(event: Event) => setMultiplier((event.target as HTMLInputElement).value)}
              className="mt-1 h-9"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          {manualItems.length > 0 && (
            <ul className="space-y-1">
              {manualItems.map((item, index) => (
                <li
                  key={`${item.foodId}-${index}`}
                  className="flex items-center justify-between rounded border border-border px-2 py-1 text-sm">
                  <span>
                    {catalog.get(item.foodId)?.name_tr ?? item.foodId} — {item.quantityG}g
                  </span>
                  <button
                    type="button"
                    onClick={() => removeManualItem(index)}
                    className="text-xs text-muted-foreground hover:text-foreground">
                    Kaldır
                  </button>
                </li>
              ))}
            </ul>
          )}
          <MealFoodPicker
            foods={foods}
            exclusions={exclusions}
            allergenExclusions={allergenExclusions}
            onAdd={addManualItem}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-muted-foreground">
          Hazırlanma tarihi
          <Input
            type="date"
            value={preparedDate}
            onInput={(event: Event) => setPreparedDate((event.target as HTMLInputElement).value)}
            className="mt-1 h-9"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Saklama notu (isteğe bağlı)
          <Input
            type="text"
            value={storageNote}
            onInput={(event: Event) => setStorageNote((event.target as HTMLInputElement).value)}
            placeholder="Örn. Buzdolabında 3 gün"
            className="mt-1 h-9"
          />
        </label>
      </div>

      {composition.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {composition.length} besin ·{" "}
          {Math.round(totals.kcal)} kcal · {Math.round(totals.proteinG)}g protein
        </p>
      )}

      <Button type="button" size="sm" disabled={!canSubmit} onClick={submit}>
        Partiyi oluştur
      </Button>
    </div>
  );
}

function BatchCard({
  batch,
  householdId,
  catalog,
  defaultDate,
}: {
  batch: PreparationBatch;
  householdId: string | null;
  catalog: NutritionMap;
  defaultDate: string;
}) {
  const { allocations } = useBatchAllocations(householdId, batch.id);
  const remaining = remainingComposition(batch, allocations);
  const queryClient = useQueryClient();

  const [allocFoodId, setAllocFoodId] = useState(batch.composition[0]?.foodId ?? "");
  const [allocQuantity, setAllocQuantity] = useState("100");
  const [allocDate, setAllocDate] = useState(defaultDate);
  const [allocSlot, setAllocSlot] = useState<MealSlot>("kahvalti");
  const [allocating, setAllocating] = useState(false);

  const sourceCombo = batch.sourceComboId ? COMBO_BY_ID.get(batch.sourceComboId) : undefined;
  const title = sourceCombo?.nameTr ?? "Manuel parti";

  async function allocate() {
    if (!householdId) return;
    const quantityG = Number(allocQuantity);
    if (!allocFoodId || !Number.isFinite(quantityG) || quantityG <= 0) return;
    setAllocating(true);
    try {
      const saved = await createMealEntry({
        id: uid(),
        householdId,
        date: allocDate,
        slot: allocSlot,
        foodId: allocFoodId,
        quantityG,
        position: 0,
        batchId: batch.id,
      });
      if (saved) {
        queryClient.invalidateQueries({ queryKey: ["batchAllocations", householdId, batch.id] });
        queryClient.invalidateQueries({ queryKey: ["mealEntries", householdId, allocDate] });
      }
    } finally {
      setAllocating(false);
    }
  }

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{batch.preparedDate}</span>
      </div>
      {batch.storageNote && (
        <p className="mt-1 text-xs text-muted-foreground">{batch.storageNote}</p>
      )}
      <ul className="mt-2 space-y-1">
        {remaining.map((item) => (
          <li key={item.foodId} className="flex items-center justify-between text-sm">
            <span>{catalog.get(item.foodId)?.name_tr ?? item.foodId}</span>
            <span className="ledger tabular-nums text-xs text-muted-foreground">
              {item.quantityG}g hazırlandı ·{" "}
              <span className={item.remainingG < 0 ? "text-signal" : ""}>
                {item.remainingG}g kaldı
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-2 sm:grid-cols-4">
        <select
          value={allocFoodId}
          onChange={(event) => setAllocFoodId((event.target as HTMLSelectElement).value)}
          aria-label="Besin"
          className="h-9 rounded-md border border-input bg-background px-2 text-xs">
          {batch.composition.map((item) => (
            <option key={item.foodId} value={item.foodId}>
              {catalog.get(item.foodId)?.name_tr ?? item.foodId}
            </option>
          ))}
        </select>
        <Input
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          value={allocQuantity}
          aria-label="Miktar (gram)"
          onInput={(event: Event) => setAllocQuantity((event.target as HTMLInputElement).value)}
          className="h-9 text-xs"
        />
        <Input
          type="date"
          value={allocDate}
          aria-label="Tarih"
          onInput={(event: Event) => setAllocDate((event.target as HTMLInputElement).value)}
          className="h-9 text-xs"
        />
        <select
          value={allocSlot}
          onChange={(event) => setAllocSlot((event.target as HTMLSelectElement).value as MealSlot)}
          aria-label="Öğün"
          className="h-9 rounded-md border border-input bg-background px-2 text-xs">
          {MEAL_SLOTS.map(({ slot, label }) => (
            <option key={slot} value={slot}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="button"
        size="sm"
        variant="quiet"
        disabled={allocating || !allocFoodId}
        onClick={allocate}
        className="mt-2">
        Bu partiden ekle
      </Button>
    </li>
  );
}

export { todayStr as defaultBatchDate };
