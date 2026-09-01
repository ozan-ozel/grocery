import { useMemo } from "react";
import type { Nutrition } from "@/lib/nutrition";
import { NUTRITION_AXES as AXES, computeMaxByKey, fractionOf, formatNutritionValue } from "@/lib/nutritionChart";

const BAR_AREA_HEIGHT = 128; // px — the vertical space bars grow within

// Same data/scale as NutritionRadarChart (see nutritionChart.ts) — a
// grouped column chart alternative to the pentagon, one group per nutrient.
// Caller only renders this when at least one of foodA/foodB is picked.
export function NutritionBarChart({
  foodA,
  foodB,
}: {
  foodA: Nutrition | null;
  foodB: Nutrition | null;
}) {
  const maxByKey = useMemo(() => computeMaxByKey(foodA, foodB), [foodA, foodB]);

  return (
    <div className="mt-4">
      <div
        className="mx-auto flex w-full max-w-[20rem] items-end justify-between gap-2"
        style={{ height: BAR_AREA_HEIGHT + 28 }}
      >
        {AXES.map((axis) => {
          const aValue = foodA ? (foodA[axis.key] as number) : undefined;
          const bValue = foodB ? (foodB[axis.key] as number) : undefined;
          const aFraction = aValue !== undefined ? fractionOf(aValue, maxByKey[axis.key]) : 0;
          const bFraction = bValue !== undefined ? fractionOf(bValue, maxByKey[axis.key]) : 0;
          return (
            <div key={axis.key} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="flex w-full items-end justify-center gap-1"
                style={{ height: BAR_AREA_HEIGHT }}
              >
                {aValue !== undefined && (
                  <div
                    className="w-3 rounded-t bg-signal"
                    style={{ height: `${aFraction * 100}%` }}
                    title={`${foodA!.name_tr} · ${axis.label}: ${formatNutritionValue(aValue, axis.unit)}`}
                  />
                )}
                {bValue !== undefined && (
                  <div
                    className="w-3 rounded-t border-2 border-dashed border-primary bg-transparent"
                    style={{ height: `${bFraction * 100}%` }}
                    title={`${foodB!.name_tr} · ${axis.label}: ${formatNutritionValue(bValue, axis.unit)}`}
                  />
                )}
              </div>
              <span className="text-center text-[10px] leading-tight text-muted-foreground">
                {axis.label}
              </span>
            </div>
          );
        })}
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
