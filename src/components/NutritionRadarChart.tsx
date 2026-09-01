import { useMemo } from "react";
import type { Nutrition } from "@/lib/nutrition";

type Axis = { key: keyof Nutrition; label: string; unit: string };

// Same five nutrients as NutritionCompareView's table, in the same order —
// the only ones the data model tracks (see src/lib/nutrition.ts), so there's
// nothing else reliable to add as a sixth axis.
const AXES: Axis[] = [
  { key: "kcal_per_100", label: "Kalori", unit: "kcal" },
  { key: "protein_g", label: "Protein", unit: "g" },
  { key: "fat_g", label: "Yağ", unit: "g" },
  { key: "carbs_g", label: "Karbonhidrat", unit: "g" },
  { key: "fiber_g", label: "Lif", unit: "g" },
];

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 84;
const LABEL_RADIUS = RADIUS + 30;
const RINGS = [0.25, 0.5, 0.75, 1];

function angleFor(index: number): number {
  return -Math.PI / 2 + index * ((2 * Math.PI) / AXES.length);
}

function pointAt(index: number, fraction: number): { x: number; y: number } {
  const angle = angleFor(index);
  return {
    x: CENTER + fraction * RADIUS * Math.cos(angle),
    y: CENTER + fraction * RADIUS * Math.sin(angle),
  };
}

// Non-negative and finite by construction (guards a value that's somehow
// missing/NaN rather than trusting the data model). A true zero stays at
// dead center; any nonzero value gets a small floor so it doesn't collapse
// to the same point and read as "no data".
function fractionOf(value: number, max: number): number {
  const v = Number.isFinite(value) ? Math.max(0, value) : 0;
  if (v <= 0) return 0;
  if (!Number.isFinite(max) || max <= 0) return 0;
  return Math.min(1, Math.max(0.04, v / max));
}

function polygonPoints(food: Nutrition, maxByKey: Record<string, number>): string {
  return AXES.map((axis, i) => {
    const value = food[axis.key] as number;
    const { x, y } = pointAt(i, fractionOf(value, maxByKey[axis.key]));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function formatValue(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
}

export function NutritionRadarChart({
  foodA,
  foodB,
}: {
  foodA: Nutrition;
  foodB: Nutrition | null;
}) {
  // Reference scale: each axis is normalized against whichever of the two
  // compared foods is higher on that nutrient — not a catalog-wide max.
  // A catalog-wide reference sounds more "consistent," but in practice a
  // single outlier (sunflower oil's 100g fat) flattens every ordinary
  // comparison's fat axis to near-invisible. Scaling to the visible pair
  // means the larger of the two always reaches the outer ring, so every
  // comparison is legible on its own terms. With only one food selected,
  // it's normalized against itself (full pentagon) as a placeholder until
  // a second food gives it something to compare against.
  const maxByKey = useMemo(() => {
    const max: Record<string, number> = {};
    for (const axis of AXES) {
      const a = foodA[axis.key] as number;
      const b = foodB ? (foodB[axis.key] as number) : 0;
      max[axis.key] = Math.max(
        Number.isFinite(a) ? a : 0,
        Number.isFinite(b) ? b : 0
      );
    }
    return max;
  }, [foodA, foodB]);

  const pointsA = polygonPoints(foodA, maxByKey);
  const pointsB = foodB ? polygonPoints(foodB, maxByKey) : null;

  return (
    <div className="mt-4">
      <div className="mx-auto w-full max-w-[15rem]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full"
          role="img"
          aria-label={
            foodB
              ? `${foodA.name_tr} ve ${foodB.name_tr} besin profili karşılaştırması`
              : `${foodA.name_tr} besin profili`
          }
        >
          {RINGS.map((ring) => (
            <polygon
              key={ring}
              points={AXES.map((_, i) => {
                const { x, y } = pointAt(i, ring);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              }).join(" ")}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          ))}

          {AXES.map((axis, i) => {
            const outer = pointAt(i, 1);
            return (
              <line
                key={axis.key}
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
            );
          })}

          {pointsB && (
            <polygon
              points={pointsB}
              fill="var(--color-primary)"
              fillOpacity={0.16}
              stroke="var(--color-primary)"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          )}
          <polygon
            points={pointsA}
            fill="var(--color-signal)"
            fillOpacity={0.28}
            stroke="var(--color-signal)"
            strokeWidth={2}
          />

          {AXES.map((axis, i) => {
            const a = pointAt(i, fractionOf(foodA[axis.key] as number, maxByKey[axis.key]));
            const b = foodB
              ? pointAt(i, fractionOf(foodB[axis.key] as number, maxByKey[axis.key]))
              : null;
            return (
              <g key={axis.key}>
                <circle cx={a.x} cy={a.y} r={3} fill="var(--color-signal)">
                  <title>{`${foodA.name_tr} · ${axis.label}: ${formatValue(foodA[axis.key] as number, axis.unit)}`}</title>
                </circle>
                {b && foodB && (
                  <circle cx={b.x} cy={b.y} r={3} fill="var(--color-primary)">
                    <title>{`${foodB.name_tr} · ${axis.label}: ${formatValue(foodB[axis.key] as number, axis.unit)}`}</title>
                  </circle>
                )}
              </g>
            );
          })}

          {AXES.map((axis, i) => {
            const { x, y } = pointAt(i, LABEL_RADIUS / RADIUS);
            const anchor = x < CENTER - 4 ? "end" : x > CENTER + 4 ? "start" : "middle";
            const baseline = y < CENTER - 4 ? "auto" : y > CENTER + 4 ? "hanging" : "middle";
            return (
              <text
                key={axis.key}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline={baseline}
                className="fill-muted-foreground"
                fontSize={10}
              >
                {axis.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ background: "var(--color-signal)" }} />
          {foodA.name_tr}
        </span>
        {foodB ? (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full border-2 border-dashed"
              style={{ borderColor: "var(--color-primary)", background: "transparent" }}
            />
            {foodB.name_tr}
          </span>
        ) : (
          <span className="text-muted-foreground/70">2. besin seç →</span>
        )}
      </div>
    </div>
  );
}
