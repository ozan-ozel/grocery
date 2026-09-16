import { AlertTriangle, Check } from "lucide-react";
import type { MacroTotals } from "@/lib/mealNutrition";

type Props = {
  consumed: MacroTotals;
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

// Status tiers once a macro reaches its daily target, keyed off
// consumed/target ratio. Thresholds are a judgment call (not a nutrition
// guideline), chosen to read as: right at goal, a little over, notably
// over, way over. Colors before red reuse the Karşılaştır (compare) tab's
// existing amber-600 "higher value" tint instead of inventing a new one.
const OVER_MILD_RATIO = 1.1;
const OVER_WARNING_RATIO = 1.25;
const OVER_SEVERE_RATIO = 1.5;
const STATUS_GREEN = "#22c55e";
const STATUS_YELLOW = "#eab308";
const STATUS_AMBER = "#d97706";

function getMacroStatus(ratio: number) {
  if (ratio < 1) return null;
  if (ratio < OVER_MILD_RATIO) return { icon: Check, color: STATUS_GREEN, textClassName: "" };
  if (ratio < OVER_WARNING_RATIO) return { icon: Check, color: STATUS_YELLOW, textClassName: "" };
  if (ratio < OVER_SEVERE_RATIO)
    return { icon: AlertTriangle, color: STATUS_AMBER, textClassName: "text-[#d97706]" };
  return { icon: AlertTriangle, color: "var(--color-destructive)", textClassName: "text-destructive" };
}

export function MacroSummaryCard({ consumed, target, isEstimated }: Props) {
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
    const consumedValue = Math.round(consumed[key]);
    // Ring fills as the day's log approaches (and can exceed) the target;
    // target 0 (no profile yet) reads as 0% rather than NaN.
    const ratio = target[key] > 0 ? consumed[key] / target[key] : 0;
    const percent = Math.max(0, Math.min(1, ratio));
    const status = getMacroStatus(ratio);
    return (
      <div key={label} className={`rounded-lg border-l-4 bg-background p-2.5 ${borderColor}`}>
        <p className="text-[0.7rem] font-medium text-muted-foreground">{label}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <MacroRing percent={percent} color={ringColor} status={status} />
          <div>
            <p className="ledger text-lg font-bold leading-none text-foreground">{totalValue}</p>
            <p
              className={`ledger mt-1 text-xs font-light ${status?.textClassName || "text-muted-foreground"}`}>
              +{consumedValue}
            </p>
          </div>
        </div>
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
type MacroStatus = {
  icon: typeof Check;
  color: string;
  textClassName: string;
};

function MacroRing({
  percent,
  color,
  status,
}: {
  percent: number;
  color: string;
  status: MacroStatus | null;
}) {
  const size = 40;
  const stroke = 4.5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent);
  const StatusIcon = status?.icon;
  return (
    // Crisp solid border frames the badge; the fade lives only in the inlet
    // fill behind it, not on the ring/arc itself — the progress arc stays
    // fully solid so the actual progress reading is never softened. Once
    // the target is reached, a status icon takes over the ring's hollow
    // center instead of leaving it empty.
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full border"
      style={{
        background: `color-mix(in oklab, ${color} 12%, transparent)`,
        borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
      }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`color-mix(in oklab, ${color} 15%, transparent)`}
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
      {StatusIcon && (
        <StatusIcon
          aria-hidden="true"
          className="absolute size-3.5"
          style={{ color: status.color }}
          strokeWidth={3}
        />
      )}
    </div>
  );
}
