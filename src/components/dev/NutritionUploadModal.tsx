import { useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { rememberNutrition, saveNutritionBulk, type NutritionWrite } from "@/lib/nutrition";

// Maintenance tool, not a user feature: pastes a JSON array of nutrition rows
// into the GLOBAL nutrition table. Nothing in the normal UI links here — it is
// opened only by the hidden tap passcode in SettingsView. That concealment is
// not the security boundary: PUT /api/nutrition refuses anyone whose email is
// not in ADMIN_EMAILS (lib/auth.ts requireAdmin), so a non-admin who finds this
// modal just gets an error back.
export function NutritionUploadModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  async function submit() {
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
      rememberNutrition(saved);
      setSavedCount(saved.length);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("idle");
    }
  }

  return (
    <ConfirmModal
      title="Besin verisi yükle"
      description="docs/nutrition-prompt.md ile hazırladığın JSON diziyi yapıştır."
      confirmLabel={status === "saving" ? "Kaydediliyor…" : "Kaydet"}
      cancelLabel={status === "done" ? "Kapat" : "Vazgeç"}
      confirmDisabled={status !== "idle" || !text.trim()}
      onConfirm={submit}
      onCancel={onClose}>
      <textarea
        value={text}
        onInput={(e: Event) => setText((e.target as HTMLTextAreaElement).value)}
        rows={8}
        placeholder='[{"name_tr":"süt","kcal_per_100":61,...}]'
        className="mt-3 w-full rounded-md border border-border bg-background p-2 font-mono text-xs outline-none focus:ring-1 focus:ring-ring"
        disabled={status === "saving"}
      />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {status === "done" && (
        <p className="mt-2 text-xs text-signal">{savedCount} satır kaydedildi.</p>
      )}
    </ConfirmModal>
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
