import { useRemainingToday } from "@/hooks/useRemainingToday";
import type { MacroTotals } from "@/lib/mealNutrition";

type Props = {
  userId: string | null;
  householdId: string | null;
};

export function TodayView({ userId, householdId }: Props) {
  const remaining = useRemainingToday(userId, householdId);

  if (remaining.status === "no-profile") {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Bugün için önerilerin olsun diye önce Kişisel Plan'ını doldurman
        gerekiyor.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RemainingSummary remaining={remaining.remaining} />
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
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border p-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p
            className={`ledger text-lg font-semibold ${value < 0 ? "text-signal" : ""}`}>
            {Math.round(value)}
          </p>
        </div>
      ))}
    </div>
  );
}
