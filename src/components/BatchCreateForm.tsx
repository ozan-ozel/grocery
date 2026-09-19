import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmoothPillTabs } from "@/components/ui/smooth-pill";
import { MealFoodPicker } from "@/components/MealFoodPicker";
import { ALL_COMBOS, scaleComboItems } from "@/lib/combos";
import { scoreAllCombos } from "@/lib/comboMatch";
import { scaleNutrition, sumMacros } from "@/lib/mealNutrition";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import {
  normalizeComposition,
  isValidComposition,
  type BatchCompositionItem,
} from "@/lib/preparationBatch";

export type BatchCreateData = {
  preparedDate: string;
  storageNote?: string;
  sourceComboId?: string;
  composition: BatchCompositionItem[];
};

type Props = {
  foods: Nutrition[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  defaultDate: string;
  onSubmit: (data: BatchCreateData) => Promise<boolean>;
  onCancel: () => void;
};

type Mode = "combo" | "manual";

// Same sane range the Yemekler picker's custom multiplier uses — a typo can't
// create a 50 kg batch.
const MULTIPLIER_MIN = 0.5;
const MULTIPLIER_MAX = 20;

export function BatchCreateForm({
  foods,
  catalog,
  exclusions,
  allergenExclusions,
  defaultDate,
  onSubmit,
  onCancel,
}: Props) {
  const [mode, setMode] = useState<Mode>("combo");
  const [preparedDate, setPreparedDate] = useState(defaultDate);
  const [storageNote, setStorageNote] = useState("");
  const [multiplierText, setMultiplierText] = useState("4");
  // Hard-excluded combos are already dropped by scoreAllCombos — a batch can
  // never be created from a combo containing a hard-excluded food.
  const allowedCombos = scoreAllCombos(ALL_COMBOS, exclusions, allergenExclusions, catalog);
  const [comboId, setComboId] = useState(allowedCombos[0]?.id ?? "");
  const [manualItems, setManualItems] = useState<BatchCompositionItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  const multiplier = Number(multiplierText);
  const multiplierValid =
    Number.isFinite(multiplier) && multiplier >= MULTIPLIER_MIN && multiplier <= MULTIPLIER_MAX;

  function buildComposition(): BatchCompositionItem[] {
    if (mode === "manual") return normalizeComposition(manualItems);
    const combo = allowedCombos.find((c) => c.id === comboId);
    if (!combo || !multiplierValid) return [];
    return normalizeComposition(
      scaleComboItems(combo.items, multiplier).map((item) => ({
        foodId: item.foodId,
        quantityG: item.grams,
      }))
    );
  }

  const composition = buildComposition();
  const totals = sumMacros(
    composition.flatMap((item) => {
      const nutrition = catalog.get(item.foodId);
      return nutrition ? [scaleNutrition(nutrition, item.quantityG)] : [];
    })
  );
  const canSubmit = isValidComposition(composition) && !!preparedDate && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setFailed(false);
    try {
      const saved = await onSubmit({
        preparedDate,
        storageNote: storageNote.trim() ? storageNote.trim() : undefined,
        sourceComboId: mode === "combo" ? comboId : undefined,
        composition,
      });
      // On success the parent swaps this form out, so there is nothing to
      // reset here; only a failure needs to stay visible.
      if (!saved) setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <SmoothPillTabs<Mode>
        value={mode}
        onChange={setMode}
        items={[
          { value: "combo", label: "Yemekten" },
          { value: "manual", label: "Elle seç" },
        ]}
      />

      {mode === "combo" ? (
        <div className="grid grid-cols-[1fr_6rem] gap-3">
          <label className="text-xs text-muted-foreground">
            Yemek
            <select
              value={comboId}
              onChange={(event) => setComboId((event.target as HTMLSelectElement).value)}
              className="mt-1 h-11 w-full rounded-md border border-input bg-card px-2 text-base text-foreground">
              {allowedCombos.length === 0 && <option value="">Uygun yemek yok</option>}
              {allowedCombos.map((combo) => (
                <option key={combo.id} value={combo.id}>
                  {combo.nameTr}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Kaç porsiyon
            <Input
              type="number"
              inputMode="decimal"
              min={MULTIPLIER_MIN}
              max={MULTIPLIER_MAX}
              step="0.5"
              value={multiplierText}
              onInput={(event: Event) =>
                setMultiplierText((event.target as HTMLInputElement).value)
              }
              className="mt-1 ledger text-right tabular-nums"
            />
          </label>
        </div>
      ) : (
        <div>
          {manualItems.length > 0 && (
            <ul className="space-y-1">
              {manualItems.map((item, index) => (
                <li
                  key={`${item.foodId}-${index}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>
                    {item.foodId} — {item.quantityG}g
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setManualItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-xs text-muted-foreground hover:text-foreground active:text-foreground">
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
            onAdd={(foodId, quantityG) =>
              setManualItems((prev) => [...prev, { foodId, quantityG }])
            }
          />
        </div>
      )}

      {mode === "combo" && !multiplierValid && (
        <p className="text-xs text-signal">
          Porsiyon sayısı {MULTIPLIER_MIN} ile {MULTIPLIER_MAX} arasında olmalı.
        </p>
      )}

      {composition.length > 0 && (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Parti içeriği
          </p>
          <ul className="mt-2 space-y-1">
            {composition.map((item) => (
              <li key={item.foodId} className="flex items-center justify-between text-sm">
                <span>{item.foodId}</span>
                <span className="ledger tabular-nums text-xs text-muted-foreground">
                  {Math.round(item.quantityG)}g
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
            Toplam {Math.round(totals.kcal)} kcal · P: {Math.round(totals.proteinG)}g · K:{" "}
            {Math.round(totals.carbsG)}g · Y: {Math.round(totals.fatG)}g
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-muted-foreground">
          Hazırlanma tarihi
          <Input
            type="date"
            value={preparedDate}
            onInput={(event: Event) =>
              setPreparedDate((event.target as HTMLInputElement).value)
            }
            className="mt-1"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Saklama notu (isteğe bağlı)
          <Input
            type="text"
            value={storageNote}
            onInput={(event: Event) =>
              setStorageNote((event.target as HTMLInputElement).value)
            }
            placeholder="Örn. Buzdolabında 3 gün"
            className="mt-1"
          />
        </label>
      </div>

      {failed && (
        <p className="text-xs text-signal">Parti kaydedilemedi. Bağlantını kontrol edip tekrar dene.</p>
      )}

      <div className="flex gap-2">
        <Button type="button" className="flex-1" disabled={!canSubmit} onClick={submit}>
          {submitting ? "Kaydediliyor…" : "Partiyi oluştur"}
        </Button>
        <Button type="button" variant="quiet" onClick={onCancel} disabled={submitting}>
          Vazgeç
        </Button>
      </div>
    </div>
  );
}
