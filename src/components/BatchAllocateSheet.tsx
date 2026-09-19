import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { COMBO_BY_ID } from "@/lib/combos";
import type { NutritionMap } from "@/lib/nutrition";
import {
  hasHardExclusion,
  hasHardAllergenClassExclusion,
  type FoodExclusion,
  type AllergenClassExclusion,
} from "@/lib/foodExclusions";
import { batchDateLabel, hasRemaining } from "@/lib/preparationBatch";
import type { BatchWithRemaining } from "@/hooks/useBatches";

type Props = {
  subtitle: string;
  ledger: BatchWithRemaining[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  onAdd: (batchId: string, foodId: string, quantityG: number) => void;
  onClose: () => void;
};

export function BatchAllocateSheet({
  subtitle,
  ledger,
  catalog,
  exclusions,
  allergenExclusions,
  onAdd,
  onClose,
}: Props) {
  // A food the person can no longer eat (hard-tier exclusion added after the
  // batch was cooked) is not offered — same rule as every other logging
  // surface. Foods missing from the catalog are kept so nothing silently
  // vanishes; they fall through the exclusion check because it needs the row.
  function isOffered(foodId: string): boolean {
    const food = catalog.get(foodId);
    if (!food) return true;
    return !hasHardExclusion(exclusions, food) && !hasHardAllergenClassExclusion(allergenExclusions, food);
  }

  const offered = ledger
    .filter(({ remaining }) => hasRemaining(remaining))
    .map(({ batch, remaining }) => ({
      batch,
      rows: remaining.filter((item) => item.remainingG > 0 && isOffered(item.foodId)),
    }))
    .filter(({ rows }) => rows.length > 0);

  return (
    <BottomSheet title="Partiden ekle" titleId="batch-allocate-sheet-title" onClose={onClose}>
      <p className="-mt-2 mb-3 shrink-0 text-xs text-muted-foreground">{subtitle}</p>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-2">
        {offered.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground">
            Eklenecek kalan parti yok. Yemek Planı'ndaki "Toplu Hazırlıklar" satırından yeni
            bir parti oluşturabilirsin.
          </p>
        )}
        {offered.map(({ batch, rows }) => {
          const title = batch.sourceComboId
            ? (COMBO_BY_ID.get(batch.sourceComboId)?.nameTr ?? "Parti")
            : "Elle hazırlanan parti";
          return (
            <section key={batch.id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-foreground">{title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {batchDateLabel(batch.preparedDate)}
                </span>
              </div>
              {batch.storageNote && (
                <p className="mt-1 text-xs text-muted-foreground">{batch.storageNote}</p>
              )}
              <ul className="mt-2 divide-y divide-border">
                {rows.map((item) => (
                  <AllocationRow
                    key={item.foodId}
                    name={catalog.get(item.foodId)?.name_tr ?? item.foodId}
                    remainingG={item.remainingG}
                    onAdd={(quantityG) => onAdd(batch.id, item.foodId, quantityG)}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function AllocationRow({
  name,
  remainingG,
  onAdd,
}: {
  name: string;
  remainingG: number;
  onAdd: (quantityG: number) => void;
}) {
  const full = Math.max(1, Math.round(remainingG));
  const [gramsText, setGramsText] = useState(String(full));
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  // After an add the ledger refetches and `remainingG` shrinks — snap the
  // prefill to the new "Tümü" so the next tap is sensible, and any over-
  // allocation hint disappears on its own.
  useEffect(() => {
    setGramsText(String(full));
  }, [full]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const grams = Number(gramsText);
  const valid = Number.isFinite(grams) && grams > 0;
  const over = valid && grams > remainingG;

  function add() {
    if (!valid || justAdded) return;
    onAdd(grams);
    setJustAdded(true);
    timerRef.current = window.setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <li className="space-y-2 py-2 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-foreground">{name}</span>
        <span className="ledger tabular-nums text-xs text-muted-foreground">
          {Math.round(remainingG)}g kaldı
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          value={gramsText}
          aria-label={`${name} miktarı (gram)`}
          onInput={(event: Event) => setGramsText((event.target as HTMLInputElement).value)}
          className="ledger h-9 w-20 px-2 text-right tabular-nums"
        />
        <span className="text-xs text-muted-foreground">g</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setGramsText(String(Math.max(1, Math.round(remainingG / 2))))}>
          ½
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setGramsText(String(full))}>
          Tümü
        </Button>
        <Button
          type="button"
          size="sm"
          className="ml-auto"
          disabled={!valid || justAdded}
          onClick={add}>
          {justAdded ? "Eklendi ✓" : "Ekle"}
        </Button>
      </div>
      {over && (
        <p className="text-xs text-signal">Partide kalandan fazla ({Math.round(remainingG)}g).</p>
      )}
    </li>
  );
}
