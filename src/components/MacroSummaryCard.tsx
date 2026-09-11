import type { MacroTotals } from "@/lib/mealNutrition";

type Props = {
  remaining: MacroTotals;
  target: MacroTotals;
  isEstimated?: boolean;
};

export function MacroSummaryCard({ remaining, target, isEstimated }: Props) {
  const metrics: Array<{
    label: string;
    key: keyof MacroTotals;
    colorClass: string;
  }> = [
    { label: "Kalori", key: "kcal", colorClass: "bg-blue-50 dark:bg-blue-950" },
    {
      label: "Protein",
      key: "proteinG",
      colorClass: "bg-red-50 dark:bg-red-950",
    },
    {
      label: "Karbonhidrat",
      key: "carbsG",
      colorClass: "bg-green-50 dark:bg-green-950",
    },
    { label: "Yağ", key: "fatG", colorClass: "bg-yellow-50 dark:bg-yellow-950" },
    { label: "Lif", key: "fiberG", colorClass: "bg-purple-50 dark:bg-purple-950" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
        GÜNLÜK TOPLAM / KALAN MAKROLAR
        {isEstimated && (
          <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Tahmini
          </span>
        )}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {metrics.map(({ label, key, colorClass }) => {
          const currentValue = Math.round(remaining[key]);
          const targetValue = Math.round(target[key]);
          return (
            <div
              key={label}
              className={`rounded-lg p-3 ${colorClass}`}>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="ledger mt-1 text-lg font-bold text-foreground">
                {currentValue} / {targetValue}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
