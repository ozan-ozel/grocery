import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BatchCreateForm, type BatchCreateData } from "@/components/BatchCreateForm";
import { COMBO_BY_ID } from "@/lib/combos";
import { uid } from "@/lib/store";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import {
  batchDateLabel,
  hasRemaining,
  type NewPreparationBatch,
  type PreparationBatch,
} from "@/lib/preparationBatch";
import type { BatchWithRemaining } from "@/hooks/useBatches";

type Props = {
  householdId: string;
  ledger: BatchWithRemaining[];
  catalog: NutritionMap;
  foods: Nutrition[];
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  defaultDate: string;
  createBatch: (input: NewPreparationBatch) => Promise<PreparationBatch | null>;
  onClose: () => void;
};

export function BatchSheet({
  householdId,
  ledger,
  catalog,
  foods,
  exclusions,
  allergenExclusions,
  defaultDate,
  createBatch,
  onClose,
}: Props) {
  const [creating, setCreating] = useState(false);

  async function handleSubmit(data: BatchCreateData): Promise<boolean> {
    const created = await createBatch({
      id: uid(),
      householdId,
      preparedDate: data.preparedDate,
      storageNote: data.storageNote,
      sourceComboId: data.sourceComboId,
      composition: data.composition,
    });
    if (created) setCreating(false);
    return created !== null;
  }

  return (
    <BottomSheet
      title={creating ? "Yeni parti" : "Toplu Hazırlıklar"}
      titleId="batch-sheet-title"
      onClose={onClose}>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-2">
        {creating ? (
          <BatchCreateForm
            foods={foods}
            catalog={catalog}
            exclusions={exclusions}
            allergenExclusions={allergenExclusions}
            defaultDate={defaultDate}
            onSubmit={handleSubmit}
            onCancel={() => setCreating(false)}
          />
        ) : (
          <>
            <Button type="button" className="w-full" onClick={() => setCreating(true)}>
              Yeni parti
            </Button>

            {ledger.length === 0 && (
              <p className="py-2 text-sm text-muted-foreground">
                Henüz toplu hazırlık yok. Bir kere pişirip birkaç güne yaydığın yemekleri
                buraya ekle; her öğüne ne kadarını yediğini sonra Yemek Planı'ndaki
                "Partiden" düğmesiyle eklersin.
              </p>
            )}

            <ul className="space-y-2">
              {ledger.map(({ batch, remaining }) => {
                const title = batch.sourceComboId
                  ? (COMBO_BY_ID.get(batch.sourceComboId)?.nameTr ?? "Parti")
                  : "Elle hazırlanan parti";
                const depleted = !hasRemaining(remaining);
                return (
                  <li
                    key={batch.id}
                    className={`rounded-lg border border-border bg-background p-3 ${depleted ? "opacity-60" : ""}`}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-foreground">{title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {depleted ? "Tükendi · " : ""}
                        {batchDateLabel(batch.preparedDate)}
                      </span>
                    </div>
                    {batch.storageNote && (
                      <p className="mt-1 text-xs text-muted-foreground">{batch.storageNote}</p>
                    )}
                    <ul className="mt-2 space-y-1">
                      {remaining.map((item) => (
                        <li
                          key={item.foodId}
                          className="flex items-center justify-between text-sm">
                          <span>{catalog.get(item.foodId)?.name_tr ?? item.foodId}</span>
                          <span className="ledger tabular-nums text-xs text-muted-foreground">
                            {Math.round(item.quantityG)}g hazırlandı ·{" "}
                            <span className={item.remainingG < 0 ? "text-signal" : ""}>
                              {Math.round(item.remainingG)}g kaldı
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
