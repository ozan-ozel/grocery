import type { MacroTotals } from "@/lib/mealNutrition";

type Props = {
  remaining: MacroTotals;
  target: MacroTotals;
  isEstimated?: boolean;
};

export function MacroSummaryCard({ remaining, target, isEstimated }: Props) {
  const topMetrics: Array<{ label: string; key: keyof MacroTotals; borderColor: string }> = [
    { label: "Kalori", key: "kcal", borderColor: "border-l-blue-500" },
    { label: "Protein", key: "proteinG", borderColor: "border-l-red-500" },
  ];
  const bottomMetrics: Array<{ label: string; key: keyof MacroTotals; borderColor: string }> = [
    { label: "Karbonhidrat", key: "carbsG", borderColor: "border-l-green-500" },
    { label: "Yağ", key: "fatG", borderColor: "border-l-yellow-500" },
    { label: "Lif", key: "fiberG", borderColor: "border-l-purple-500" },
  ];

  function renderTile({ label, key, borderColor }: (typeof topMetrics)[number]) {
    const totalValue = Math.round(target[key]);
    const remainingValue = Math.round(remaining[key]);
    return (
      <div key={label} className={`rounded-lg border-l-4 bg-background p-2 ${borderColor}`}>
        <p className="text-[0.7rem] font-medium text-muted-foreground">{label}</p>
        <p className="ledger mt-1 text-base font-bold text-foreground">{totalValue}</p>
        <p className="ledger text-xs font-light text-muted-foreground">+{remainingValue}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <h2 className="mb-2 text-xs font-semibold text-muted-foreground">
        GÜNLÜK MAKROLAR
        {isEstimated && (
          <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Tahmini
          </span>
        )}
      </h2>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">{topMetrics.map(renderTile)}</div>
        <div className="grid grid-cols-3 gap-2">{bottomMetrics.map(renderTile)}</div>
      </div>
    </div>
  );
}
