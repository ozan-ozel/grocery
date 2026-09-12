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
    borderColor: string;
  }> = [
    { label: "Kalori", key: "kcal", borderColor: "border-l-blue-500" },
    { label: "Protein", key: "proteinG", borderColor: "border-l-red-500" },
    { label: "Karbonhidrat", key: "carbsG", borderColor: "border-l-green-500" },
    { label: "Yağ", key: "fatG", borderColor: "border-l-yellow-500" },
    { label: "Lif", key: "fiberG", borderColor: "border-l-purple-500" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
        GÜNLÜK MAKROLAR
        {isEstimated && (
          <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Tahmini
          </span>
        )}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {metrics.map(({ label, key, borderColor }) => {
          const totalValue = Math.round(target[key]);
          const remainingValue = Math.round(remaining[key]);
          return (
            <div
              key={label}
              className={`rounded-lg border-l-4 bg-background p-3 ${borderColor}`}>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="ledger mt-2 text-lg font-bold text-foreground">
                {totalValue}
              </p>
              <p className="ledger text-sm font-light text-muted-foreground">
                +{remainingValue}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
