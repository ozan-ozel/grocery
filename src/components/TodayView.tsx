import { useMemo, useState } from "react";
import { useRemainingToday } from "@/hooks/useRemainingToday";
import type { MacroTotals } from "@/lib/mealNutrition";
import { matchCombos, type ScoredCombo } from "@/lib/comboMatch";
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

// How long a combo's "Listeye ekle" button stays on "Eklendi".
const ADDED_FEEDBACK_MS = 1500;

type Props = {
  userId: string | null;
  householdId: string | null;
  onAddItem: (name: string, qty: string) => void;
};

export function TodayView({ userId, householdId, onAddItem }: Props) {
  const remaining = useRemainingToday(userId, householdId);
  // The shopping list lives on another tab, so a combo that was just added
  // shows its own transient confirmation here instead.
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const suggestions = useMemo<ScoredCombo[]>(() => {
    if (remaining.status !== "ready") return [];
    return matchCombos(
      COMBOS,
      remaining.remaining,
      remaining.excludedFoodIds,
      remaining.catalogMap
    );
  }, [remaining]);

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
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Yükleniyor…
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
    setAddedIds((prev) => new Set(prev).add(combo.id));
    window.setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(combo.id);
        return next;
      });
    }, ADDED_FEEDBACK_MS);
  }

  function logComboEaten(combo: ScoredCombo) {
    for (const item of combo.items) {
      remaining.logConsumption(item.foodId, item.grams);
    }
  }

  return (
    <div className="space-y-4">
      <RemainingSummary remaining={remaining.remaining} />
      {suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Bugünkü bütçene uyan hazır bir kombinasyon yok — az kaldıysa bu
          normal.
        </p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map((combo) => (
            <li key={combo.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{combo.nameTr}</span>
                <span className="text-xs text-muted-foreground">
                  {combo.prepMinutes} dk
                </span>
              </div>
              <p className="ledger mt-1 text-xs text-muted-foreground">
                {Math.round(combo.totals.kcal)} kcal ·{" "}
                {Math.round(combo.totals.proteinG)}g protein
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => addComboToList(combo)}
                  className="rounded-md border border-border px-2 py-1 text-xs">
                  {addedIds.has(combo.id) ? "Eklendi" : "Listeye ekle"}
                </button>
                <button
                  type="button"
                  onClick={() => logComboEaten(combo)}
                  className="rounded-md border border-border px-2 py-1 text-xs">
                  Yedim de
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
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
