import { useState } from "react";
import { Upload } from "lucide-react";
import { saveNutritionBulk, type Nutrition, type NutritionWrite } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";

export function UploadTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="quiet"
      size="sm"
      onClick={onClick}
      title="Besin JSON'u yükle"
    >
      <Upload className="size-3.5" />
      JSON yükle
    </Button>
  );
}

type UploadProps = {
  onClose: () => void;
  onSaved: (rows: Nutrition[]) => void;
};

export function UploadPanel({ onClose, onSaved }: UploadProps) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  async function submit(e: Event) {
    e.preventDefault();
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      setError(`Geçersiz JSON: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    if (!Array.isArray(parsed)) {
      setError("JSON bir dizi olmalı.");
      return;
    }
    const rows = validateBulk(parsed);
    if ("error" in rows) {
      setError(rows.error);
      return;
    }
    setStatus("saving");
    try {
      const saved = await saveNutritionBulk(rows);
      setSavedCount(saved.length);
      onSaved(saved);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("idle");
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
      <form
        onSubmit={submit as unknown as (e: Event) => void}
        className="flex flex-col gap-2"
      >
        <div className="text-xs text-muted-foreground">
          docs/nutrition-prompt.md'yi kullanıp aldığın JSON diziyi buraya yapıştır.
        </div>
        <textarea
          value={text}
          onInput={(e: Event) => setText((e.target as HTMLTextAreaElement).value)}
          rows={8}
          placeholder='[{"name_tr":"süt","kcal_per_100":61,...}]'
          className="w-full rounded-md border border-border bg-background p-2 font-mono text-xs outline-none focus:ring-1 focus:ring-ring"
          disabled={status === "saving"}
        />
        {error && <div className="text-xs text-destructive">{error}</div>}
        {status === "done" && (
          <div className="text-xs text-signal">
            {savedCount} satır kaydedildi.
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={onClose}
            disabled={status === "saving"}
          >
            {status === "done" ? "Kapat" : "Vazgeç"}
          </Button>
          {status !== "done" && (
            <Button type="submit" size="sm" disabled={status === "saving" || !text.trim()}>
              {status === "saving" ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function validateBulk(input: unknown[]): NutritionWrite[] | { error: string } {
  const out: NutritionWrite[] = [];
  for (let i = 0; i < input.length; i++) {
    const raw = input[i];
    if (!raw || typeof raw !== "object") {
      return { error: `Satır ${i + 1}: obje değil.` };
    }
    const r = raw as Record<string, unknown>;
    if (typeof r.name_tr !== "string" || r.name_tr.trim().length === 0) {
      return { error: `Satır ${i + 1}: name_tr eksik.` };
    }
    for (const key of ["kcal_per_100", "protein_g", "fat_g", "carbs_g"] as const) {
      if (typeof r[key] !== "number" || !Number.isFinite(r[key])) {
        return { error: `Satır ${i + 1} (${r.name_tr}): ${key} sayı olmalı.` };
      }
    }
    const fiber = r.fiber_g;
    if (fiber !== undefined && (typeof fiber !== "number" || !Number.isFinite(fiber))) {
      return { error: `Satır ${i + 1} (${r.name_tr}): fiber_g sayı olmalı.` };
    }
    const aliases = Array.isArray(r.aliases)
      ? r.aliases.filter((a): a is string => typeof a === "string")
      : [];
    out.push({
      name_tr: r.name_tr,
      aliases,
      kcal_per_100: r.kcal_per_100 as number,
      protein_g: r.protein_g as number,
      fat_g: r.fat_g as number,
      carbs_g: r.carbs_g as number,
      fiber_g: typeof fiber === "number" ? fiber : 0,
    });
  }
  return out;
}
