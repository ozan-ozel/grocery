import { useMemo } from "react";
import type { Nutrition } from "@/lib/nutrition";
import { NUTRITION_AXES as AXES, computeMaxByKey, fractionOf, formatNutritionValue } from "@/lib/nutritionChart";

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

function polygonPoints(food: Nutrition, maxByKey: Record<string, number>): string {
  return AXES.map((axis, i) => {
    const value = food[axis.key] as number;
    const { x, y } = pointAt(i, fractionOf(value, maxByKey[axis.key]));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

// Caller only renders this when at least one of foodA/foodB is picked — the
// two slots fill independently (either can be chosen first), so both are
// nullable here and the chart degrades to a single placeholder pentagon for
// whichever one is actually set.
export function NutritionRadarChart({
  foodA,
  foodB,
}: {
  foodA: Nutrition | null;
  foodB: Nutrition | null;
}) {
  const maxByKey = useMemo(() => computeMaxByKey(foodA, foodB), [foodA, foodB]);

  const pointsA = foodA ? polygonPoints(foodA, maxByKey) : null;
  const pointsB = foodB ? polygonPoints(foodB, maxByKey) : null;

  const ariaLabel =
    foodA && foodB
      ? `${foodA.name_tr} ve ${foodB.name_tr} besin profili karşılaştırması`
      : foodA
        ? `${foodA.name_tr} besin profili`
        : foodB
          ? `${foodB.name_tr} besin profili`
          : "besin profili";

  return (
    <div className="mt-4">
      <div className="mx-auto w-full max-w-[15rem]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full"
          style={{ overflow: "visible" }}
          role="img"
          aria-label={ariaLabel}
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
          {pointsA && (
            <polygon
              points={pointsA}
              fill="var(--color-signal)"
              fillOpacity={0.28}
              stroke="var(--color-signal)"
              strokeWidth={2}
            />
          )}

          {AXES.map((axis, i) => {
            const a = foodA
              ? pointAt(i, fractionOf(foodA[axis.key] as number, maxByKey[axis.key]))
              : null;
            const b = foodB
              ? pointAt(i, fractionOf(foodB[axis.key] as number, maxByKey[axis.key]))
              : null;
            return (
              <g key={axis.key}>
                {a && foodA && (
                  <circle cx={a.x} cy={a.y} r={3} fill="var(--color-signal)">
                    <title>{`${foodA.name_tr} · ${axis.label}: ${formatNutritionValue(foodA[axis.key] as number, axis.unit)}`}</title>
                  </circle>
                )}
                {b && foodB && (
                  <circle cx={b.x} cy={b.y} r={3} fill="var(--color-primary)">
                    <title>{`${foodB.name_tr} · ${axis.label}: ${formatNutritionValue(foodB[axis.key] as number, axis.unit)}`}</title>
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
        {foodA ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full" style={{ background: "var(--color-signal)" }} />
            {foodA.name_tr}
          </span>
        ) : (
          <span className="text-muted-foreground/70">1. besin seç →</span>
        )}
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
