import { useEffect, useState } from "react";
import type { ComponentChildren } from "preact";
import { ChevronDown, Clock, Pencil } from "lucide-react";
import { scaledComboTotals, type ScoredCombo } from "@/lib/comboMatch";
import { COMBO_PORTIONS, recipeSteps, scaleComboItems, type PortionId } from "@/lib/combos";
import type { NutritionMap } from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Custom amounts are a multiplier too (the batch planner's "Kat sayısı"), kept
// to a sane range so a typo can't log a 50 kg dinner.
const CUSTOM_MIN = 0.25;
const CUSTOM_MAX = 5;

type Props = {
  combo: ScoredCombo;
  catalog: NutritionMap;
  // A unique DOM id for this row (the same meal can appear in two sections, so
  // the combo id alone isn't unique) — used to scroll the open editor into view.
  domId: string;
  // true  = built-in / recommended meals: Küçük / Normal / Büyük chips + custom
  //         multiplier.
  // false = the user's saved meals: added at their saved grams, only the custom
  //         multiplier is offered.
  showTiers: boolean;
  // The tier a tap on the row body adds, shown as the filled chip. For the
  // normal list it is the remembered last tier; for "Sana uygun" rows it is the
  // recommended tier. Ignored when showTiers is false.
  activeTier: PortionId;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  // `rememberTier` is set only by a chip tap — the row-body tap never changes
  // the remembered tier.
  onAdd: (combo: ScoredCombo, factor: number, rememberTier?: PortionId) => void;
  // Extra buttons on the bottom line of a saved meal (Düzenle / Sil).
  actions?: ComponentChildren;
};

export function MealRow({
  combo,
  catalog,
  domId,
  showTiers,
  activeTier,
  editing,
  onStartEdit,
  onCancelEdit,
  onAdd,
  actions,
}: Props) {
  const [customText, setCustomText] = useState("1");
  const [stepsOpen, setStepsOpen] = useState(false);
  const steps = recipeSteps(combo);

  // Reset the multiplier each time the editor opens, and once it has opened
  // bring the row fully into view — after a beat, so it lands against the
  // sheet's final height once the keyboard has opened.
  useEffect(() => {
    if (!editing) return;
    setCustomText("1");
    const id = window.setTimeout(() => {
      document.getElementById(domId)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 250);
    return () => window.clearTimeout(id);
  }, [editing, domId]);

  const bodyFactor = showTiers
    ? (COMBO_PORTIONS.find((p) => p.id === activeTier)?.factor ?? 1)
    : 1;
  const tierTotals = COMBO_PORTIONS.map(
    (p) => scaledComboTotals(combo, p.factor, catalog) ?? combo.totals
  );
  const shown = showTiers
    ? tierTotals[COMBO_PORTIONS.findIndex((p) => p.id === activeTier)]
    : (scaledComboTotals(combo, 1, catalog) ?? combo.totals);

  const customFactor = Number(customText);
  const customValid =
    Number.isFinite(customFactor) && customFactor >= CUSTOM_MIN && customFactor <= CUSTOM_MAX;
  const customItems = editing && customValid ? scaleComboItems(combo.items, customFactor) : null;
  const customTotals =
    editing && customValid ? scaledComboTotals(combo, customFactor, catalog) : null;

  const pencil = (
    <button
      type="button"
      onClick={onStartEdit}
      aria-label="Özel miktar"
      title="Özel miktar"
      className="flex w-11 shrink-0 items-center justify-center rounded-md border border-border py-1.5 text-muted-foreground transition-colors hover:text-foreground active:text-foreground">
      <Pencil className="size-4" />
    </button>
  );

  return (
    <div id={domId} className="rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={() => onAdd(combo, bodyFactor)}
        className="w-full rounded-t-lg p-3 pb-2 text-left transition-colors hover:bg-accent active:bg-accent">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground">
            {combo.nameTr}
            {steps.length > 0 && (
              <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 align-middle text-[0.65rem] font-medium text-muted-foreground">
                Tarif
              </span>
            )}
          </h4>
          {combo.prepMinutes > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {combo.prepMinutes} dk
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {combo.items.length} malzeme · {Math.round(shown.kcal)} kcal · P:{" "}
          {Math.round(shown.proteinG)}g
        </p>
        {combo.hasSoftConflict && (
          <p className="mt-1 text-xs text-signal">İçinde hassasiyet listendeki bir besin var</p>
        )}
      </button>

      {steps.length > 0 && (
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => setStepsOpen((open) => !open)}
            aria-expanded={stepsOpen}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground active:text-foreground">
            <ChevronDown
              className={cn("size-3.5 transition-transform", stepsOpen && "rotate-180")}
            />
            {stepsOpen ? "Tarifi gizle" : "Tarifi göster"}
          </button>
          {stepsOpen &&
            (steps.length === 1 ? (
              <p className="mt-1.5 text-xs text-foreground">{steps[0]}</p>
            ) : (
              <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs text-foreground">
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ))}
        </div>
      )}

      {editing ? (
        <div className="space-y-2 border-t border-border p-3">
          <div className="flex items-center gap-2">
            <label htmlFor={`${domId}-custom`} className="text-xs text-muted-foreground">
              Kat sayısı
            </label>
            <Input
              id={`${domId}-custom`}
              type="number"
              inputMode="decimal"
              min={CUSTOM_MIN}
              max={CUSTOM_MAX}
              step="0.25"
              value={customText}
              autoFocus
              onInput={(event: Event) => setCustomText((event.target as HTMLInputElement).value)}
              className="ledger h-9 w-20 px-2 text-right"
            />
            <Button
              type="button"
              size="sm"
              disabled={!customValid}
              onClick={() => onAdd(combo, customFactor)}
              className="ml-auto">
              Ekle
            </Button>
            <Button type="button" variant="quiet" size="sm" onClick={onCancelEdit}>
              Vazgeç
            </Button>
          </div>
          {customItems && customTotals ? (
            <>
              <p className="text-xs text-muted-foreground">
                {customItems.map((item) => `${item.foodId} ${item.grams} g`).join(" · ")}
              </p>
              <p className="ledger text-xs text-foreground">
                {Math.round(customTotals.kcal)} kcal · P: {Math.round(customTotals.proteinG)}g · K:{" "}
                {Math.round(customTotals.carbsG)}g · Y: {Math.round(customTotals.fatG)}g
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {CUSTOM_MIN} ile {CUSTOM_MAX} arasında bir değer gir.
            </p>
          )}
        </div>
      ) : showTiers ? (
        <div className="flex gap-1.5 px-3 pb-3">
          {COMBO_PORTIONS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdd(combo, p.factor, p.id)}
              aria-label={`${p.label} porsiyon, ${Math.round(tierTotals[i].kcal)} kcal`}
              className={cn(
                "flex-1 rounded-md border px-1 py-1.5 text-center leading-tight transition-colors",
                p.id === activeTier
                  ? "border-signal bg-signal/10 text-signal"
                  : "border-border text-muted-foreground hover:text-foreground active:text-foreground"
              )}>
              <span className="block text-xs font-medium">{p.label}</span>
              <span className="ledger block text-[0.65rem]">
                {Math.round(tierTotals[i].kcal)} kcal
              </span>
            </button>
          ))}
          {pencil}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 pb-3">
          {actions}
          <span className="ml-auto" />
          {pencil}
        </div>
      )}
    </div>
  );
}
