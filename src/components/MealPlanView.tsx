import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMealPlan, type NutritionValues } from "@/hooks/useMealPlan";
import type { MealEntry, MealSlot } from "@/lib/mealPlan";

type Props = {
  householdId: string | null;
};

const FIXED_SLOTS: { slot: Exclude<MealSlot, "ara">; label: string }[] = [
  { slot: "kahvalti", label: "Kahvaltı" },
  { slot: "ogle", label: "Öğle" },
  { slot: "aksam", label: "Akşam" },
];

export function MealPlanView({ householdId }: Props) {
  const {
    dateLabel,
    goToPrevDay,
    goToNextDay,
    fixedEntry,
    araEntries,
    dayTotals,
    saveFixedSlotText,
    addAraEntry,
    saveEntryNutrition,
    removeEntry,
    errorIds,
    retrySave,
  } = useMealPlan(householdId);

  const totals = dayTotals();
  const hasTotals =
    totals.kcal > 0 ||
    totals.protein > 0 ||
    totals.fat > 0 ||
    totals.carbs > 0 ||
    totals.fiber > 0;

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <Button
          type="button"
          variant="quiet"
          size="icon"
          onClick={goToPrevDay}
          aria-label="Önceki gün"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-lg font-semibold tracking-tight">{dateLabel}</span>
        <Button
          type="button"
          variant="quiet"
          size="icon"
          onClick={goToNextDay}
          aria-label="Sonraki gün"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {FIXED_SLOTS.map(({ slot, label }) => {
          const entry = fixedEntry(slot);
          return (
            <FixedSlotRow
              key={slot}
              label={label}
              entry={entry}
              onSaveText={(text) => saveFixedSlotText(slot, text)}
              onSaveNutrition={(values) => entry && saveEntryNutrition(entry.id, values)}
              hasError={entry ? errorIds.has(entry.id) : false}
              onRetry={entry ? () => retrySave(entry.id) : undefined}
            />
          );
        })}

        <AraOgunSection
          entries={araEntries()}
          onAdd={addAraEntry}
          onSaveNutrition={saveEntryNutrition}
          onRemove={removeEntry}
          errorIds={errorIds}
          onRetry={retrySave}
        />
      </div>

      {hasTotals && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Toplam
          </span>
          <span className="ledger tabular-nums">
            {Math.round(totals.kcal)} kcal · P {totals.protein.toFixed(1)} · Y{" "}
            {totals.fat.toFixed(1)} · K {totals.carbs.toFixed(1)} · L {totals.fiber.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}

function FixedSlotRow({
  label,
  entry,
  onSaveText,
  onSaveNutrition,
  hasError,
  onRetry,
}: {
  label: string;
  entry: MealEntry | undefined;
  onSaveText: (text: string) => void;
  onSaveNutrition: (values: NutritionValues) => void;
  hasError: boolean;
  onRetry: (() => void) | undefined;
}) {
  const [text, setText] = useState(entry?.text ?? "");

  // `entry` can arrive after this row's first mount — e.g. a page reload
  // mounts the row before the meal-entries fetch resolves, or switching
  // households / days changes the underlying entry without remounting this
  // component (it's keyed by slot, not by entry id). Re-sync local text
  // whenever the fetched value changes so the input doesn't stay stuck on
  // its stale initial value.
  useEffect(() => {
    setText(entry?.text ?? "");
  }, [entry?.text]);

  return (
    <div>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        value={text}
        aria-label={`${label} yemeği`}
        placeholder="ör. Menemen"
        onInput={(e: Event) => setText((e.target as HTMLInputElement).value)}
        onBlur={() => onSaveText(text)}
        className="mt-1 w-full border-0 border-b border-border bg-transparent px-0 py-1.5 text-[0.975rem] outline-none focus:border-foreground"
      />
      {entry && (
        <div className="mt-1.5">
          <NutritionFields entry={entry} onSave={onSaveNutrition} />
          {hasError && onRetry && <ErrorRetry onRetry={onRetry} />}
        </div>
      )}
    </div>
  );
}

function AraOgunSection({
  entries,
  onAdd,
  onSaveNutrition,
  onRemove,
  errorIds,
  onRetry,
}: {
  entries: MealEntry[];
  onAdd: (text: string) => void;
  onSaveNutrition: (id: string, values: NutritionValues) => void;
  onRemove: (id: string) => void;
  errorIds: Set<string>;
  onRetry: (id: string) => void;
}) {
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  }

  return (
    <div>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">Ara öğün</span>
      <ul className="mt-1">
        {entries.map((entry) => (
          <li key={entry.id} className="border-b border-border py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.975rem]">{entry.text}</span>
              <button
                type="button"
                aria-label={`${entry.text} kaldır`}
                onClick={() => onRemove(entry.id)}
                className="rounded p-1 text-muted-foreground hover:text-signal"
              >
                <X className="size-4" />
              </button>
            </div>
            <NutritionFields
              entry={entry}
              onSave={(values) => onSaveNutrition(entry.id, values)}
            />
            {errorIds.has(entry.id) && <ErrorRetry onRetry={() => onRetry(entry.id)} />}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-2">
        <Input
          value={text}
          aria-label="Ara öğün ekle"
          placeholder="Ara öğün ekle"
          onInput={(e: Event) => setText((e.target as HTMLInputElement).value)}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button type="button" variant="quiet" size="sm" onClick={submit} disabled={!text.trim()}>
          Ekle
        </Button>
      </div>
    </div>
  );
}

function NutritionFields({
  entry,
  onSave,
}: {
  entry: MealEntry;
  onSave: (values: NutritionValues) => void;
}) {
  // Unlike FixedSlotRow's <input> (which always renders, even before the
  // owning entry has loaded), this component only ever mounts once its
  // caller already has a defined `entry` (`{entry && <NutritionFields .../>}`
  // in both call sites) — so these initializers are always correct at mount
  // time and, deliberately, are NOT kept in sync with `entry` on every
  // re-render: `commit()` below re-saves all 5 fields on every blur, so a
  // resync effect keyed on entry's values would refire on each field's own
  // commit and could race with the next field's in-progress edit, wiping a
  // just-typed value before its blur fires. Local state is the source of
  // truth for the lifetime of this mount.
  const [kcal, setKcal] = useState(str(entry.kcal));
  const [protein, setProtein] = useState(str(entry.proteinG));
  const [fat, setFat] = useState(str(entry.fatG));
  const [carbs, setCarbs] = useState(str(entry.carbsG));
  const [fiber, setFiber] = useState(str(entry.fiberG));

  function commit() {
    onSave({
      kcal: num(kcal),
      proteinG: num(protein),
      fatG: num(fat),
      carbsG: num(carbs),
      fiberG: num(fiber),
    });
  }

  return (
    <div className="mt-1 grid grid-cols-5 gap-1">
      <NumField label="kcal" value={kcal} onInput={setKcal} onBlur={commit} />
      <NumField label="P" value={protein} onInput={setProtein} onBlur={commit} />
      <NumField label="Y" value={fat} onInput={setFat} onBlur={commit} />
      <NumField label="K" value={carbs} onInput={setCarbs} onBlur={commit} />
      <NumField label="L" value={fiber} onInput={setFiber} onBlur={commit} />
    </div>
  );
}

function NumField({
  label,
  value,
  onInput,
  onBlur,
}: {
  label: string;
  value: string;
  onInput: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.65rem] uppercase text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.1"
        value={value}
        onInput={(e: Event) => onInput((e.target as HTMLInputElement).value)}
        onBlur={onBlur}
        className="ledger h-9 px-2 text-right tabular-nums"
      />
    </label>
  );
}

function ErrorRetry({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className="mt-1 text-xs text-destructive underline underline-offset-2"
    >
      kaydedilemedi · tekrar dene
    </button>
  );
}

function str(n: number | null): string {
  return typeof n === "number" ? String(n) : "";
}

function num(s: string): number | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const v = Number(trimmed);
  return Number.isFinite(v) && v >= 0 ? v : null;
}
