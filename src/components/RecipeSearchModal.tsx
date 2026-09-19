import { useEffect, useState } from "react";
import { Clock, Pencil, Search } from "lucide-react";
import type { ScoredCombo } from "@/lib/comboMatch";
import { scaledComboTotals } from "@/lib/comboMatch";
import { COMBO_PORTIONS, scaleComboItems, type PortionId } from "@/lib/combos";
import { loadMealPortion, saveMealPortion } from "@/lib/preferences";
import type { NutritionMap } from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  title: string;
  combos: ScoredCombo[];
  catalog: NutritionMap;
  isOpen: boolean;
  onClose: () => void;
  // `factor` is the portion multiplier over the combo's authored grams
  // (1 = as authored); the caller scales the items with scaleComboItems.
  onSelect: (combo: ScoredCombo, factor: number) => void;
};

// Custom amounts are a multiplier too (the batch planner's "Kat sayısı"), kept
// to a sane range so a typo can't log a 50 kg dinner.
const CUSTOM_MIN = 0.25;
const CUSTOM_MAX = 5;

export function RecipeSearchModal({
  title,
  combos,
  catalog,
  isOpen,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  // The last tier picked — what tapping a row's body adds, so the old
  // one-tap "tap a meal, it's added" flow stays one tap. Shown as the filled
  // chip so it's never a hidden default.
  const [portion, setPortion] = useState<PortionId>(loadMealPortion);
  const [customFor, setCustomFor] = useState<string | null>(null);
  const [customText, setCustomText] = useState("1");
  const queryLower = query.trim().toLocaleLowerCase("tr-TR");
  const results = queryLower
    ? combos.filter(combo =>
        combo.nameTr.toLocaleLowerCase("tr-TR").includes(queryLower),
      )
    : combos;

  const rememberedFactor =
    COMBO_PORTIONS.find(p => p.id === portion)?.factor ?? 1;

  function resetModal() {
    setQuery("");
    setCustomFor(null);
    setCustomText("1");
    onClose();
  }

  function addAt(combo: ScoredCombo, factor: number, remember?: PortionId) {
    if (remember) {
      setPortion(remember);
      saveMealPortion(remember);
    }
    onSelect(combo, factor);
    resetModal();
  }

  // Once the custom editor opens, bring its row fully into view — after a beat,
  // so it lands against the sheet's final height once the keyboard has opened.
  useEffect(() => {
    if (!customFor) return;
    const id = window.setTimeout(() => {
      document
        .getElementById(`combo-row-${customFor}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 250);
    return () => window.clearTimeout(id);
  }, [customFor]);

  if (!isOpen) return null;

  // The list is short and curated (a couple dozen meals) and each row now
  // carries a portion chip row, so on a touch device an auto-opened keyboard
  // would leave room for ~2 rows. Browse first there; the field is one tap
  // away. Desktop keeps the instant-typing focus.
  const autoFocusSearch =
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(pointer: coarse)").matches;

  const customFactor = Number(customText);
  const customValid =
    Number.isFinite(customFactor) &&
    customFactor >= CUSTOM_MIN &&
    customFactor <= CUSTOM_MAX;

  return (
    <BottomSheet
      title={title}
      titleId="recipe-search-modal-title"
      onClose={resetModal}>
      <div className="relative mb-4 shrink-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Yemek ara..."
          value={query}
          onInput={event =>
            setQuery((event.target as HTMLInputElement).value)
          }
          autoFocus={autoFocusSearch}
          className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* min-h-0 + overscroll-contain: this list — not the search field — is
          what gives when the keyboard shrinks the sheet, and a scroll that
          hits its end must not chain into the sheet drag or the page behind. */}
      <div className="min-h-0 max-h-[28rem] space-y-2 overflow-y-auto overscroll-contain">
        {results.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            &quot;{query.trim()}&quot; ile eşleşen yemek yok
          </div>
        ) : (
          results.map(combo => {
            const tierTotals = COMBO_PORTIONS.map(
              p => scaledComboTotals(combo, p.factor, catalog) ?? combo.totals,
            );
            const shown =
              tierTotals[COMBO_PORTIONS.findIndex(p => p.id === portion)];
            const editing = customFor === combo.id;
            const customItems = editing && customValid
              ? scaleComboItems(combo.items, customFactor)
              : null;
            const customTotals =
              editing && customValid
                ? scaledComboTotals(combo, customFactor, catalog)
                : null;
            return (
              <div
                key={combo.id}
                id={`combo-row-${combo.id}`}
                className="rounded-lg border border-border bg-background">
                <button
                  type="button"
                  onClick={() => addAt(combo, rememberedFactor)}
                  className="w-full rounded-t-lg p-3 pb-2 text-left transition-colors hover:bg-accent active:bg-accent">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground">
                      {combo.nameTr}
                    </h4>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {combo.prepMinutes} dk
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {combo.items.length} malzeme · {Math.round(shown.kcal)}{" "}
                    kcal · P: {Math.round(shown.proteinG)}g
                  </p>
                  {combo.hasSoftConflict && (
                    <p className="mt-1 text-xs text-signal">
                      İçinde hassasiyet listendeki bir besin var
                    </p>
                  )}
                </button>

                {editing ? (
                  <div className="space-y-2 border-t border-border p-3">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`combo-custom-${combo.id}`}
                        className="text-xs text-muted-foreground">
                        Kat sayısı
                      </label>
                      <Input
                        id={`combo-custom-${combo.id}`}
                        type="number"
                        inputMode="decimal"
                        min={CUSTOM_MIN}
                        max={CUSTOM_MAX}
                        step="0.25"
                        value={customText}
                        autoFocus
                        onInput={(event: Event) =>
                          setCustomText((event.target as HTMLInputElement).value)
                        }
                        className="ledger h-9 w-20 px-2 text-right"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={!customValid}
                        onClick={() => addAt(combo, customFactor)}
                        className="ml-auto">
                        Ekle
                      </Button>
                      <Button
                        type="button"
                        variant="quiet"
                        size="sm"
                        onClick={() => setCustomFor(null)}>
                        Vazgeç
                      </Button>
                    </div>
                    {customItems && customTotals ? (
                      <>
                        <p className="text-xs text-muted-foreground">
                          {customItems
                            .map(item => `${item.foodId} ${item.grams} g`)
                            .join(" · ")}
                        </p>
                        <p className="ledger text-xs text-foreground">
                          {Math.round(customTotals.kcal)} kcal · P:{" "}
                          {Math.round(customTotals.proteinG)}g · K:{" "}
                          {Math.round(customTotals.carbsG)}g · Y:{" "}
                          {Math.round(customTotals.fatG)}g
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {CUSTOM_MIN} ile {CUSTOM_MAX} arasında bir değer gir.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-1.5 px-3 pb-3">
                    {COMBO_PORTIONS.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addAt(combo, p.factor, p.id)}
                        aria-label={`${p.label} porsiyon, ${Math.round(tierTotals[i].kcal)} kcal`}
                        className={cn(
                          "flex-1 rounded-md border px-1 py-1.5 text-center leading-tight transition-colors",
                          p.id === portion
                            ? "border-signal bg-signal/10 text-signal"
                            : "border-border text-muted-foreground hover:text-foreground active:text-foreground",
                        )}>
                        <span className="block text-xs font-medium">
                          {p.label}
                        </span>
                        <span className="ledger block text-[0.65rem]">
                          {Math.round(tierTotals[i].kcal)} kcal
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomText("1");
                        setCustomFor(combo.id);
                      }}
                      aria-label="Özel miktar"
                      title="Özel miktar"
                      className="flex w-11 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground active:text-foreground">
                      <Pencil className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </BottomSheet>
  );
}
