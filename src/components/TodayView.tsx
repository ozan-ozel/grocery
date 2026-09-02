import { useMemo, useState } from "react";
import { ChefHat, ChevronRight, Undo2 } from "lucide-react";
import { useRemainingToday, type LoggedEntry } from "@/hooks/useRemainingToday";
import { useDetailsTransition } from "@/hooks/useDetailsTransition";
import { LoadingBlock } from "@/components/LoadingBlock";
import type { MacroTotals } from "@/lib/mealNutrition";
import { matchCombos, scoreAllCombos, type ScoredCombo } from "@/lib/comboMatch";
import { calculateItemsNutrition, type MealItem } from "@/lib/localMealPlan";
import combosData from "../../data/combos.json";
import type { Combo } from "@/lib/combos";

// data/combos.json is hand-authored with snake_case keys (name_tr/food_id/prep_minutes —
// see data/README.md, matching nutrition.json's convention), but the `Combo` type
// (src/lib/combos.ts) and comboMatch.ts consume camelCase. A bare `as Combo[]` cast doesn't
// even typecheck ("neither type sufficiently overlaps with the other"), so normalize here at
// the one place this file gets loaded into the app rather than reshaping the shared type.
type RawCombo = {
  id: string;
  name_tr: string;
  items: { food_id: string; grams: number }[];
  prep_minutes: number;
  tags: string[];
};

const COMBOS: Combo[] = (combosData as RawCombo[]).map((raw) => ({
  id: raw.id,
  nameTr: raw.name_tr,
  items: raw.items.map((item) => ({ foodId: item.food_id, grams: item.grams })),
  prepMinutes: raw.prep_minutes,
  tags: raw.tags,
}));

const COMBO_BY_ID = new Map(COMBOS.map((c) => [c.id, c]));

// A combo eaten today, reconstructed from real meal_entries (grouped by the
// comboId "Yedim" tags each ingredient with) rather than kept in component
// state — so "Bugün yediklerin" survives a reload instead of resetting.
// totals sum the entries' actual logged quantities, not the catalog combo's
// nominal ones, so a later quantity edit in Yemek Planı stays reflected.
type EatenGroup = {
  comboId: string;
  nameTr: string;
  prepMinutes: number;
  totals: MacroTotals;
  entries: LoggedEntry[];
};

type Props = {
  userId: string | null;
  householdId: string | null;
  onAddItem: (name: string, qty: string) => void;
  isOnList: (name: string) => boolean;
  onRemoveItemByName: (name: string) => void;
};

export function TodayView({
  userId,
  householdId,
  onAddItem,
  isOnList,
  onRemoveItemByName,
}: Props) {
  const remaining = useRemainingToday(userId, householdId);
  // Purely a visual "I'm cooking this right now" flag — no timer, no
  // backend write, resets on reload. A real cook-time tracker is a later
  // idea, not this one.
  const [preparingIds, setPreparingIds] = useState<Set<string>>(new Set());
  const otherCombosDetails = useDetailsTransition<HTMLElement>("nearest");

  const suggestions = useMemo<ScoredCombo[]>(() => {
    if (remaining.status !== "ready") return [];
    return matchCombos(
      COMBOS,
      remaining.remaining,
      remaining.excludedFoodIds,
      remaining.catalogMap
    );
  }, [remaining]);

  // The full catalog, budget-unfiltered — backs "Diğer kombinasyonlar" so a
  // combo that doesn't fit today never just vanishes; it's still browsable.
  const allCombos = useMemo<ScoredCombo[]>(() => {
    if (remaining.status !== "ready") return [];
    return scoreAllCombos(COMBOS, remaining.excludedFoodIds, remaining.catalogMap);
  }, [remaining]);

  // Reconstructed from today's real meal_entries (grouped by comboId) rather
  // than kept in local state, so it's correct on first paint and after a
  // reload — not just immediately after a "Yedim" click in this tab.
  const eatenGroups = useMemo<EatenGroup[]>(() => {
    if (remaining.status !== "ready") return [];
    const byCombo = new Map<string, { entries: LoggedEntry[]; items: MealItem[] }>();
    for (const item of remaining.todaysItems) {
      if (!item.comboId) continue;
      const bucket = byCombo.get(item.comboId) ?? { entries: [], items: [] };
      bucket.entries.push({ id: item.id, slot: item.slot });
      bucket.items.push(item);
      byCombo.set(item.comboId, bucket);
    }
    const groups: EatenGroup[] = [];
    for (const [comboId, bucket] of byCombo) {
      const raw = COMBO_BY_ID.get(comboId);
      if (!raw) continue; // combo removed from the catalog since it was logged
      groups.push({
        comboId,
        nameTr: raw.nameTr,
        prepMinutes: raw.prepMinutes,
        totals: calculateItemsNutrition(bucket.items, remaining.catalogMap),
        entries: bucket.entries,
      });
    }
    return groups;
  }, [remaining]);

  // Yedim moves a combo here instead of just letting it fall out of
  // matchCombos' results — otherwise it can vanish mid-tap with no
  // confirmation the moment the shrunk budget no longer fits it.
  const eatenComboIds = new Set(eatenGroups.map((g) => g.comboId));
  const visibleSuggestions = suggestions.filter((combo) => !eatenComboIds.has(combo.id));
  const visibleSuggestionIds = new Set(visibleSuggestions.map((combo) => combo.id));
  const otherCombos = allCombos.filter(
    (combo) => !eatenComboIds.has(combo.id) && !visibleSuggestionIds.has(combo.id)
  );

  if (remaining.status === "no-profile") {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Bugün için önerilerin olsun diye önce Kişisel Plan'ını doldurman
        gerekiyor.
      </div>
    );
  }

  if (remaining.status === "loading-catalog") {
    return (
      <div className="space-y-2">
        <LoadingBlock className="h-24" />
        <LoadingBlock className="h-24" />
        <LoadingBlock className="h-24" />
      </div>
    );
  }

  if (remaining.status === "catalog-error") {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Besin verilerine ulaşılamadı. Sayfayı yenile.
      </div>
    );
  }

  function addComboToList(combo: ScoredCombo) {
    for (const item of combo.items) {
      onAddItem(item.foodId, `${item.grams}g`);
    }
  }

  function removeComboFromList(combo: ScoredCombo) {
    for (const item of combo.items) {
      onRemoveItemByName(item.foodId);
    }
  }

  // A combo counts as "on the list" only once every one of its ingredients
  // is — if the shopping list side removed just one, re-showing "Listeye
  // ekle" is the honest state (and clicking it just re-adds what's missing,
  // addItem no-ops on ones already there).
  function isComboOnList(combo: ScoredCombo) {
    return combo.items.every((item) => isOnList(item.foodId));
  }

  function togglePreparing(comboId: string) {
    setPreparingIds((prev) => {
      const next = new Set(prev);
      if (next.has(comboId)) next.delete(comboId);
      else next.add(comboId);
      return next;
    });
  }

  function eatCombo(combo: ScoredCombo) {
    for (const item of combo.items) {
      remaining.logConsumption(item.foodId, item.grams, combo.id);
    }
    setPreparingIds((prev) => {
      if (!prev.has(combo.id)) return prev;
      const next = new Set(prev);
      next.delete(combo.id);
      return next;
    });
  }

  function undoEaten(comboId: string) {
    const group = eatenGroups.find((g) => g.comboId === comboId);
    if (!group) return;
    remaining.undoConsumption(group.entries);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Kalan Makrolar
      </h3>
      <RemainingSummary remaining={remaining.remaining} />
      {visibleSuggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Bugünkü kalan makrolarına uyan hazır bir kombinasyon yok — az
          kaldıysa bu normal.
        </p>
      ) : (
        <ul className="space-y-2">
          {visibleSuggestions.map((combo) => (
            <SuggestionCard
              key={combo.id}
              combo={combo}
              preparing={preparingIds.has(combo.id)}
              added={isComboOnList(combo)}
              onAdd={() => addComboToList(combo)}
              onRemove={() => removeComboFromList(combo)}
              onTogglePreparing={() => togglePreparing(combo.id)}
              onEat={() => eatCombo(combo)}
            />
          ))}
        </ul>
      )}

      {otherCombos.length > 0 && (
        <details
          className="group rounded-lg border border-border p-3"
          onToggle={event =>
            otherCombosDetails.onToggle(
              (event.target as HTMLDetailsElement).open
            )
          }>
          <summary
            ref={otherCombosDetails.ref}
            className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 items-center justify-center rounded-full border border-signal/70 bg-signal/10 text-signal shadow-sm">
              <ChevronRight className="size-3 transition-transform group-open:rotate-90" />
            </span>
            <span className="flex-1">
              Diğer kombinasyonlar ({otherCombos.length})
            </span>
          </summary>
          <ul className="mt-3 space-y-2">
            {otherCombos.map((combo) => (
              <SuggestionCard
                key={combo.id}
                combo={combo}
                preparing={preparingIds.has(combo.id)}
                added={isComboOnList(combo)}
                overBudgetBy={Math.max(0, combo.totals.kcal - remaining.remaining.kcal)}
                onAdd={() => addComboToList(combo)}
                onRemove={() => removeComboFromList(combo)}
                onTogglePreparing={() => togglePreparing(combo.id)}
                onEat={() => eatCombo(combo)}
              />
            ))}
          </ul>
        </details>
      )}

      {eatenGroups.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Bugün yediklerin
          </h3>
          <ul className="space-y-2">
            {eatenGroups.map((group) => (
              <li key={group.comboId}>
                <div className="rounded-lg border border-border bg-signal/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{group.nameTr}</span>
                    <span className="text-xs text-muted-foreground">
                      {group.prepMinutes} dk
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Math.round(group.totals.kcal)} kcal ·{" "}
                    {Math.round(group.totals.proteinG)}g protein
                  </p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => undoEaten(group.comboId)}
                      className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs">
                      <Undo2 className="size-3.5" />
                      Geri al
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SuggestionCard({
  combo,
  preparing,
  added,
  overBudgetBy,
  onAdd,
  onRemove,
  onTogglePreparing,
  onEat,
}: {
  combo: ScoredCombo;
  preparing: boolean;
  added: boolean;
  // Only set for "Diğer kombinasyonlar" entries that don't fit today's
  // remaining kcal — how far over, so it reads as an honest heads-up
  // rather than hiding why it wasn't in the top suggestions.
  overBudgetBy?: number;
  onAdd: () => void;
  onRemove: () => void;
  onTogglePreparing: () => void;
  onEat: () => void;
}) {
  // Both states share the exact same box model (1px frame + p-3 content) so
  // toggling "Hazırlanıyor" only swaps backgrounds, never the layout — a
  // gradient border of a different thickness than the plain one would shift
  // the card size on toggle. The background wash is signal-only (not the
  // border's primary→signal blend) and low-opacity so it reads as a subtle
  // tint rather than a loud color in every theme, light or dark, without
  // touching text contrast.
  const content = (
    <div
      className={`rounded-[calc(0.5rem-1px)] bg-background p-3 ${
        preparing ? "bg-gradient-to-br from-signal/10 to-transparent" : ""
      }`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{combo.nameTr}</span>
        <span className="text-xs text-muted-foreground">
          {combo.prepMinutes} dk
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {Math.round(combo.totals.kcal)} kcal ·{" "}
        {Math.round(combo.totals.proteinG)}g protein
      </p>
      {!!overBudgetBy && overBudgetBy > 0 && (
        <p className="mt-1 text-xs text-signal">
          Kalan makronun {Math.round(overBudgetBy)} kcal üzerinde
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={added}
          onClick={added ? onRemove : onAdd}
          className={`rounded-md border px-2 py-1 text-xs ${
            added ? "border-signal/70 bg-signal/10 text-signal" : "border-border"
          }`}>
          {added ? "Listeden çıkar" : "Listeye ekle"}
        </button>
        <button
          type="button"
          aria-pressed={preparing}
          onClick={onTogglePreparing}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${
            preparing ? "border-signal bg-signal/10" : "border-border"
          }`}>
          <ChefHat className="size-3.5" />
          Hazırlanıyor
        </button>
        <button
          type="button"
          onClick={onEat}
          className="rounded-md border border-border px-2 py-1 text-xs">
          Yedim
        </button>
      </div>
    </div>
  );

  return (
    <li>
      <div className={`rounded-lg p-px ${preparing ? "gradient-edge" : "bg-border"}`}>
        {content}
      </div>
    </li>
  );
}

function RemainingSummary({ remaining }: { remaining: MacroTotals }) {
  const rows: [string, number][] = [
    ["Kalori", remaining.kcal],
    ["Protein", remaining.proteinG],
    ["Yağ", remaining.fatG],
    ["Karbonhidrat", remaining.carbsG],
    ["Lif", remaining.fiberG],
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {rows.map(([label, value]) => {
        // Style off the rounded number, not the raw one: -0.3 renders as "0"
        // (Math.round gives -0, which stringifies to "0"), and a "0" tile in
        // over-budget red reads as a bug.
        const rounded = Math.round(value);
        return (
          <div key={label} className="rounded-lg border border-border p-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
              className={`ledger text-lg font-semibold ${rounded < 0 ? "text-signal" : ""}`}>
              {rounded}
            </p>
          </div>
        );
      })}
    </div>
  );
}
