import type { MacroTotals } from "@/lib/mealNutrition";

type Props = {
  remaining: MacroTotals;
  target: MacroTotals;
  isEstimated?: boolean;
};

// Ring fill matches each tile's existing (hardcoded, pre-token-system)
// border color rather than the app's single --color-signal accent, since
// these five tiles already establish per-metric color identity on screen —
// a single-accent ring would visibly mismatch its own tile's border.
type Metric = {
  label: string;
  key: keyof MacroTotals;
  borderColor: string;
  ringColor: string;
};

export function MacroSummaryCard({ remaining, target, isEstimated }: Props) {
  const topMetrics: Metric[] = [
    { label: "Kalori", key: "kcal", borderColor: "border-l-blue-500", ringColor: "#3b82f6" },
    { label: "Protein", key: "proteinG", borderColor: "border-l-red-500", ringColor: "#ef4444" },
  ];
  const bottomMetrics: Metric[] = [
    { label: "Karbonhidrat", key: "carbsG", borderColor: "border-l-green-500", ringColor: "#22c55e" },
    { label: "Yağ", key: "fatG", borderColor: "border-l-yellow-500", ringColor: "#eab308" },
    { label: "Lif", key: "fiberG", borderColor: "border-l-purple-500", ringColor: "#a855f7" },
  ];

  function renderTile({ label, key, borderColor, ringColor }: Metric) {
    const totalValue = Math.round(target[key]);
    const remainingValue = Math.round(remaining[key]);
    // Fills up as the day's budget is used (consumed = target - remaining),
    // capped at 100%; target 0 (no profile yet) reads as 0% rather than NaN.
    const consumed = target[key] - remaining[key];
    const percent =
      target[key] > 0 ? Math.max(0, Math.min(1, consumed / target[key])) : 0;
    return (
      <div key={label} className={`rounded-lg border-l-4 bg-background p-2 ${borderColor}`}>
        <p className="text-[0.7rem] font-medium text-muted-foreground">{label}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <MacroRing percent={percent} color={ringColor} />
          <p className="ledger text-base font-bold text-foreground">{totalValue}</p>
        </div>
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

// A single-series meter (dataviz skill: "a single ratio against a limit" ->
// meter, same-ramp track). Track is a lighter step of the same color via
// color-mix, matching the color-mix(var(--color-signal), ...) idiom already
// used throughout index.css, rather than a flat gray unrelated to the fill.
function MacroRing({ percent, color }: { percent: number; color: string }) {
  const size = 22;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="-rotate-90 shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`color-mix(in oklab, ${color} 18%, transparent)`}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  );
}
