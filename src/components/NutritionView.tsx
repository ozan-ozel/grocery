import { useEffect, useMemo, useState } from "react";
import { Pencil, Search, Upload } from "lucide-react";
import type { Item } from "@/lib/store";
import {
  browseNutrition,
  fetchNutritionCached,
  lookupNutrition,
  rememberNutrition,
  saveNutrition,
  saveNutritionBulk,
  type Nutrition,
  type NutritionMap,
  type NutritionWrite,
} from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  items: Item[];
};

type Status = "idle" | "loading" | "ready" | "error";
type Scope = "list" | "all";
const BROWSE_LIMIT = 60;

export function NutritionView({ items }: Props) {
  const [scope, setScope] = useState<Scope>("list");
  const [map, setMap] = useState<NutritionMap>(() => new Map());
  const [status, setStatus] = useState<Status>("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const names = useMemo(() => items.map((i) => i.name), [items]);
  const namesKey = names.join(" ");

  useEffect(() => {
    if (names.length === 0) {
      setMap(new Map());
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetchNutritionCached(names)
      .then((next) => {
        if (cancelled) return;
        setMap(next);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          "[nutrition] fetch failed — if you're running locally, npm run pages:dev serves /api/*, npm run dev does not:",
          err
        );
        setMap(new Map());
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [namesKey]);

  useEffect(() => {
    setEditingId(null);
  }, [namesKey]);

  const rows = items.map((item) => ({
    item,
    nutrition: lookupNutrition(map, item.name),
  }));

  useEffect(() => {
    if (status !== "ready") return;
    const missing = rows.filter((r) => !r.nutrition).map((r) => r.item.name);
    if (missing.length > 0) {
      console.info("[nutrition] missing:", missing);
    }
  }, [status, namesKey]);

  const totals = rows.reduce(
    (acc, r) => {
      if (!r.nutrition) return acc;
      acc.kcal += r.nutrition.kcal_per_100;
      acc.protein += r.nutrition.protein_g;
      acc.fat += r.nutrition.fat_g;
      acc.carbs += r.nutrition.carbs_g;
      acc.fiber += r.nutrition.fiber_g;
      acc.matched += 1;
      return acc;
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, matched: 0 }
  );

  function upsertLocal(saved: Nutrition, itemName: string) {
    setMap((prev) => {
      const next = new Map(prev);
      next.set(saved.name_tr, saved);
      next.set(itemName.trim().toLocaleLowerCase("tr-TR"), saved);
      return next;
    });
    rememberNutrition([saved]);
  }

  function upsertBulkLocal(savedRows: Nutrition[]) {
    rememberNutrition(savedRows);
    setMap((prev) => {
      const next = new Map(prev);
      for (const s of savedRows) next.set(s.name_tr, s);
      return next;
    });
  }

  const scopeToggle = (
    <div className="mb-3 inline-flex items-center gap-1 rounded-lg bg-accent/50 p-1">
      <button
        type="button"
        onClick={() => setScope("list")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          scope === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Listedeki ürünler
      </button>
      <button
        type="button"
        onClick={() => setScope("all")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          scope === "all"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Tümü
      </button>
    </div>
  );

  if (scope === "all") {
    return (
      <div>
        {scopeToggle}
        <AllFoodsBrowser />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        {scopeToggle}
        <div className="flex items-center justify-between px-1 py-3">
          <p className="text-sm text-muted-foreground">
            Önce listene bir şeyler ekle. Besin değerleri burada görünür.
          </p>
          <UploadTrigger onClick={() => setUploadOpen(true)} />
        </div>
        {uploadOpen && (
          <UploadPanel
            onClose={() => setUploadOpen(false)}
            onSaved={upsertBulkLocal}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {scopeToggle}
      <div className="flex items-center justify-between px-1 pb-3">
        <p className="text-xs text-muted-foreground">
          Değerler 100 g / 100 ml içindir.
        </p>
        <UploadTrigger onClick={() => setUploadOpen(true)} />
      </div>

      {uploadOpen && (
        <UploadPanel
          onClose={() => setUploadOpen(false)}
          onSaved={upsertBulkLocal}
        />
      )}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="py-2 pr-2 text-left font-normal">Ürün</th>
            <th className="py-2 px-1 text-right font-normal">kcal</th>
            <th className="py-2 px-1 text-right font-normal">P</th>
            <th className="py-2 px-1 text-right font-normal">Y</th>
            <th className="py-2 px-1 text-right font-normal">K</th>
            <th className="py-2 px-1 text-right font-normal">L</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {status === "loading"
            ? items.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="py-2 pr-2">{item.name}</td>
                  <td colSpan={6} className="py-2">
                    <div className="ml-auto h-3 w-24 animate-pulse rounded bg-border" />
                  </td>
                </tr>
              ))
            : rows.map(({ item, nutrition }) => {
                const editing = editingId === item.id;
                if (editing) {
                  return (
                    <EditorRow
                      key={item.id}
                      itemName={item.name}
                      initial={nutrition}
                      onCancel={() => setEditingId(null)}
                      onSaved={(saved) => {
                        upsertLocal(saved, item.name);
                        setEditingId(null);
                      }}
                    />
                  );
                }
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-border/60",
                      !nutrition && "text-muted-foreground"
                    )}
                  >
                    <td className="py-2 pr-2">{item.name}</td>
                    <Cell value={nutrition?.kcal_per_100} />
                    <Cell value={nutrition?.protein_g} />
                    <Cell value={nutrition?.fat_g} />
                    <Cell value={nutrition?.carbs_g} />
                    <Cell value={nutrition?.fiber_g} />
                    <td className="py-2 pl-1 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={
                          nutrition
                            ? `${item.name} değerlerini düzenle`
                            : `${item.name} için değer ekle`
                        }
                        title={nutrition ? "Düzenle" : "Ekle"}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
        </tbody>
        {status === "ready" && totals.matched > 0 && (
          <tfoot>
            <tr className="border-t border-border font-medium">
              <td className="py-2 pr-2 text-xs text-muted-foreground">
                Toplam ({totals.matched}/{items.length})
              </td>
              <Cell value={totals.kcal} />
              <Cell value={totals.protein} />
              <Cell value={totals.fat} />
              <Cell value={totals.carbs} />
              <Cell value={totals.fiber} />
              <td />
            </tr>
          </tfoot>
        )}
      </table>

      {status === "error" && (
        <p className="px-1 pt-3 text-xs text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}
    </div>
  );
}

type BrowseStatus = "idle" | "loading" | "ready" | "error";

// Browses/searches the whole nutrition table, independent of the active
// list. Same interaction as the Alışveriş > Bul tab (SearchView) — icon
// inside the input, no separate search button, live as you type — but this
// one is backed by the DB instead of an already-loaded local catalog, so
// typing is debounced (300ms) to avoid firing a request per keystroke.
function AllFoodsBrowser() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Nutrition[]>([]);
  const [status, setStatus] = useState<BrowseStatus>("idle");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    const handle = window.setTimeout(() => {
      browseNutrition(query, BROWSE_LIMIT)
        .then((next) => {
          if (cancelled) return;
          setRows(next);
          setStatus("ready");
        })
        .catch((err) => {
          if (cancelled) return;
          console.warn(
            "[nutrition] browse failed — if you're running locally, npm run pages:dev serves /api/*, npm run dev does not:",
            err
          );
          setStatus("error");
        });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          aria-label="Besin ara"
          placeholder="Besin ara"
          className="pl-9"
          onInput={(e: Event) => setQuery((e.target as HTMLInputElement).value)}
        />
      </div>

      <p className="ledger px-1 pb-1 pt-4 text-xs uppercase tracking-widest text-muted-foreground">
        {query.trim() ? `${rows.length} sonuç` : "alfabetik"}
      </p>

      {status === "loading" && rows.length === 0 && (
        <p className="px-1 py-8 text-sm text-muted-foreground">Yükleniyor…</p>
      )}
      {status === "ready" && rows.length === 0 && (
        <p className="px-1 py-8 text-sm text-muted-foreground">
          {query.trim()
            ? `"${query.trim()}" ile eşleşen besin yok.`
            : "Henüz kayıtlı besin yok."}
        </p>
      )}
      {status === "error" && (
        <p className="px-1 py-8 text-sm text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}

      {rows.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-2 pr-2 text-left font-normal">Ürün</th>
              <th className="py-2 px-1 text-right font-normal">kcal</th>
              <th className="py-2 px-1 text-right font-normal">P</th>
              <th className="py-2 px-1 text-right font-normal">Y</th>
              <th className="py-2 px-1 text-right font-normal">K</th>
              <th className="py-2 px-1 text-right font-normal">L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.name_tr} className="border-b border-border/60">
                <td className="py-2 pr-2">{n.name_tr}</td>
                <Cell value={n.kcal_per_100} />
                <Cell value={n.protein_g} />
                <Cell value={n.fat_g} />
                <Cell value={n.carbs_g} />
                <Cell value={n.fiber_g} />
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Cell({ value }: { value: number | undefined }) {
  return (
    <td className="ledger px-1 py-2 text-right tabular-nums">
      {typeof value === "number" ? format(value) : "-"}
    </td>
  );
}

function format(n: number) {
  return n >= 100 ? Math.round(n).toString() : n.toFixed(1);
}

type EditorProps = {
  itemName: string;
  initial: Nutrition | undefined;
  onCancel: () => void;
  onSaved: (saved: Nutrition) => void;
};

function EditorRow({ itemName, initial, onCancel, onSaved }: EditorProps) {
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
            <Button type="submit" size="sm" disabled={saving}>
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

function UploadTrigger({ onClick }: { onClick: () => void }) {
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

function UploadPanel({ onClose, onSaved }: UploadProps) {
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
