import { useState } from "react";
import { saveNutrition, type Nutrition } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EditorProps = {
  itemName: string;
  initial: Nutrition | undefined;
  onCancel: () => void;
  onSaved: (saved: Nutrition) => void;
};

export function EditorRow({ itemName, initial, onCancel, onSaved }: EditorProps) {
  const [kcal, setKcal] = useState(str(initial?.kcal_per_100));
  const [protein, setProtein] = useState(str(initial?.protein_g));
  const [fat, setFat] = useState(str(initial?.fat_g));
  const [carbs, setCarbs] = useState(str(initial?.carbs_g));
  const [fiber, setFiber] = useState(str(initial?.fiber_g));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: Event) {
    e.preventDefault();
    const kcalN = num(kcal);
    const proteinN = num(protein);
    const fatN = num(fat);
    const carbsN = num(carbs);
    const fiberN = num(fiber);
    if (
      kcalN === null ||
      proteinN === null ||
      fatN === null ||
      carbsN === null ||
      fiberN === null
    ) {
      setError("Tüm alanlar sayı olmalı.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await saveNutrition({
        name_tr: itemName,
        aliases: initial?.name_tr && initial.name_tr !== normalizeLocal(itemName)
          ? [initial.name_tr]
          : [],
        kcal_per_100: kcalN,
        protein_g: proteinN,
        fat_g: fatN,
        carbs_g: carbsN,
        fiber_g: fiberN,
      });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-border/60 bg-muted/30">
      <td colSpan={7} className="py-3">
        <form
          onSubmit={submit as unknown as (e: Event) => void}
          className="flex flex-col gap-2"
        >
          <div className="text-xs text-muted-foreground">
            {itemName} — 100 g / 100 ml
          </div>
          <div className="grid grid-cols-5 gap-1">
            <NumInput label="kcal" value={kcal} onInput={setKcal} />
            <NumInput label="P" value={protein} onInput={setProtein} />
            <NumInput label="Y" value={fat} onInput={setFat} />
            <NumInput label="K" value={carbs} onInput={setCarbs} />
            <NumInput label="L" value={fiber} onInput={setFiber} />
          </div>
          {error && <div className="text-xs text-destructive">{error}</div>}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={onCancel}
              disabled={saving}
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="active:bg-primary/80"
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </form>
      </td>
    </tr>
  );
}

function NumInput({
  label,
  value,
  onInput,
}: {
  label: string;
  value: string;
  onInput: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.65rem] uppercase text-muted-foreground">
        {label}
      </span>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.1"
        value={value}
        onInput={(e: Event) => onInput((e.target as HTMLInputElement).value)}
        className="ledger h-9 px-2 text-right tabular-nums"
      />
    </label>
  );
}

function str(n: number | undefined): string {
  return typeof n === "number" ? String(n) : "";
}

function num(s: string): number | null {
  const v = Number(s);
  if (!Number.isFinite(v) || v < 0) return null;
  return v;
}

function normalizeLocal(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}
