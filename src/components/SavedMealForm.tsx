import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MealCompositionEditor } from "@/components/MealCompositionEditor";
import { scaleNutrition, sumMacros } from "@/lib/mealNutrition";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import { normalizeComposition, type BatchCompositionItem } from "@/lib/preparationBatch";
import {
  SAVED_MEAL_LIMITS,
  parseSteps,
  stepsToText,
  validateSavedMeal,
  type SavedMeal,
} from "@/lib/savedMeals";

export type SavedMealFormData = {
  name: string;
  items: BatchCompositionItem[];
  steps: string[];
};

type Props = {
  foods: Nutrition[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  // Present = editing this meal; absent = "Yeni Yemek".
  initial?: SavedMeal;
  // Show "Kaydet ve ekle" (save, then add to the slot the sheet was opened for).
  canAddToSlot: boolean;
  // Resolves true on success. The parent closes/switches the view itself.
  onSubmit: (data: SavedMealFormData, addToSlot: boolean) => Promise<boolean>;
  onCancel: () => void;
};

// Must match validateSavedMeal's message for an empty composition.
const NO_ITEMS_ERROR = "En az bir besin ekle.";

// "Yeni Yemek": pick foods + grams, name it, optionally add preparation steps
// (which is all it takes for the meal to also show up under "Tarifler").
export function SavedMealForm({
  foods,
  catalog,
  exclusions,
  allergenExclusions,
  initial,
  canAddToSlot,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [items, setItems] = useState<BatchCompositionItem[]>(initial?.items ?? []);
  const [stepsOpen, setStepsOpen] = useState((initial?.steps.length ?? 0) > 0);
  const [stepsText, setStepsText] = useState(stepsToText(initial?.steps ?? []));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const composition = normalizeComposition(items);
  const totals = sumMacros(
    composition.flatMap((item) => {
      const nutrition = catalog.get(item.foodId);
      return nutrition ? [scaleNutrition(nutrition, item.quantityG)] : [];
    })
  );

  // Desktop keeps instant typing; on a touch device an auto-opened keyboard
  // would cover the builder before the person has even chosen to type a name.
  const autoFocusName =
    !initial &&
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(pointer: coarse)").matches;

  // The "no foods" error is only true until the first food is added.
  function handleItemsChange(next: BatchCompositionItem[]) {
    setItems(next);
    if (error === NO_ITEMS_ERROR && normalizeComposition(next).length > 0) setError(null);
  }

  async function submit(addToSlot: boolean) {
    if (submitting) return;
    const data: SavedMealFormData = {
      name: name.trim(),
      items: composition,
      steps: stepsOpen ? parseSteps(stepsText) : [],
    };
    const problem = validateSavedMeal(data);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const ok = await onSubmit(data, addToSlot);
      // On success the parent swaps this form out, so only a failure needs to
      // stay visible.
      if (!ok) {
        setError(
          "Yemek kaydedilemedi. Bağlantını, besin miktarlarını (en çok 20.000 g) ve kayıtlı yemek sayısını (en çok 100) kontrol edip tekrar dene."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-2">
      <label className="block text-xs text-muted-foreground">
        Yemeğin adı
        <Input
          type="text"
          value={name}
          maxLength={SAVED_MEAL_LIMITS.nameMax}
          autoFocus={autoFocusName}
          placeholder="Örn. Antrenman akşamı"
          onInput={(event: Event) => setName((event.target as HTMLInputElement).value)}
          className="mt-1"
        />
      </label>

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Besinler ve miktarlar</p>
        <MealCompositionEditor
          items={items}
          onChange={handleItemsChange}
          foods={foods}
          exclusions={exclusions}
          allergenExclusions={allergenExclusions}
        />
      </div>

      {composition.length > 0 && (
        <p className="ledger rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
          Toplam {Math.round(totals.kcal)} kcal · P: {Math.round(totals.proteinG)}g · K:{" "}
          {Math.round(totals.carbsG)}g · Y: {Math.round(totals.fatG)}g
        </p>
      )}

      {stepsOpen ? (
        <label className="block text-xs text-muted-foreground">
          Hazırlama adımları (her satır bir adım)
          <textarea
            value={stepsText}
            rows={5}
            onInput={(event: Event) =>
              setStepsText((event.target as HTMLTextAreaElement).value)
            }
            placeholder={"Tavuğu haşla\nPirinci pişir\nBrokoliyi buharda yumuşat"}
            className="mt-1 w-full rounded-md border border-input bg-card p-2 text-base text-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </label>
      ) : (
        <Button
          type="button"
          variant="quiet"
          size="sm"
          onClick={() => setStepsOpen(true)}
          className="active:text-foreground">
          + Hazırlama adımları ekle
        </Button>
      )}

      {error && <p className="text-xs text-signal">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="flex-1"
          disabled={submitting}
          onClick={() => submit(false)}>
          {submitting ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        {canAddToSlot && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={submitting}
            onClick={() => submit(true)}>
            Kaydet ve ekle
          </Button>
        )}
        <Button type="button" variant="quiet" onClick={onCancel} disabled={submitting}>
          Vazgeç
        </Button>
      </div>
    </div>
  );
}
