import { useMemo, useState } from "react";
import { ChefHat, Undo2 } from "lucide-react";
import { useRemainingToday, type LoggedEntry } from "@/hooks/useRemainingToday";
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

// A logged combo, kept around so "Bugün yediklerin" can render it and Geri al
// can undo it. Not persisted anywhere — which meal_entries rows belong to
// which combo only exists in this component's memory, so it resets on
// reload. The meal_entries themselves are real and permanent either way.
type EatenCombo = {
  key: string;
  combo: ScoredCombo;
  entries: LoggedEntry[];
};

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
  // Purely a visual "I'm cooking this right now" flag — no timer, no
  // backend write, resets on reload. A real cook-time tracker is a later
  // idea, not this one.
  const [preparingIds, setPreparingIds] = useState<Set<string>>(new Set());
  const [eatenCombos, setEatenCombos] = useState<EatenCombo[]>([]);

  const suggestions = useMemo<ScoredCombo[]>(() => {
    if (remaining.status !== "ready") return [];
    return matchCombos(
      COMBOS,
      remaining.remaining,
      remaining.excludedFoodIds,
      remaining.catalogMap
    );
  }, [remaining]);

  // Yedim moves a combo here instead of just letting it fall out of
  // matchCombos' results — otherwise it can vanish mid-tap with no
  // confirmation the moment the shrunk budget no longer fits it.
  const eatenComboIds = new Set(eatenCombos.map((e) => e.combo.id));
  const visibleSuggestions = suggestions.filter((combo) => !eatenComboIds.has(combo.id));

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

  function togglePreparing(comboId: string) {
    setPreparingIds((prev) => {
      const next = new Set(prev);
      if (next.has(comboId)) next.delete(comboId);
      else next.add(comboId);
      return next;
    });
  }

  function eatCombo(combo: ScoredCombo) {
    const entries = combo.items.map((item) =>
      remaining.logConsumption(item.foodId, item.grams)
    );
    setEatenCombos((prev) => [...prev, { key: `${combo.id}-${Date.now()}`, combo, entries }]);
    setPreparingIds((prev) => {
      if (!prev.has(combo.id)) return prev;
      const next = new Set(prev);
      next.delete(combo.id);
      return next;
    });
  }

  function undoEaten(key: string) {
    const entry = eatenCombos.find((e) => e.key === key);
    if (!entry) return;
    remaining.undoConsumption(entry.entries);
    setEatenCombos((prev) => prev.filter((e) => e.key !== key));
  }

  return (
    <div className="space-y-4">
      <RemainingSummary remaining={remaining.remaining} />
      {visibleSuggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Bugünkü bütçene uyan hazır bir kombinasyon yok — az kaldıysa bu
          normal.
        </p>
      ) : (
        <ul className="space-y-2">
          {visibleSuggestions.map((combo) => (
            <SuggestionCard
              key={combo.id}
              combo={combo}
              preparing={preparingIds.has(combo.id)}
              added={addedIds.has(combo.id)}
              onAdd={() => addComboToList(combo)}
              onTogglePreparing={() => togglePreparing(combo.id)}
              onEat={() => eatCombo(combo)}
            />
          ))}
        </ul>
      )}

      {eatenCombos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Bugün yediklerin
          </h3>
          <ul className="space-y-2">
            {eatenCombos.map(({ key, combo }) => (
              <li key={key}>
                <div className="gradient-edge rounded-lg p-1">
                  <div className="rounded-[calc(0.5rem-4px)] bg-background p-3">
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
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => undoEaten(key)}
                        className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs">
                        <Undo2 className="size-3.5" />
                        Geri al
                      </button>
                    </div>
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
  onAdd,
  onTogglePreparing,
  onEat,
}: {
  combo: ScoredCombo;
  preparing: boolean;
  added: boolean;
  onAdd: () => void;
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
      <p className="ledger mt-1 text-xs text-muted-foreground">
        {Math.round(combo.totals.kcal)} kcal ·{" "}
        {Math.round(combo.totals.proteinG)}g protein
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-border px-2 py-1 text-xs">
          {added ? "Eklendi" : "Listeye ekle"}
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
