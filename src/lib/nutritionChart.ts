import type { Nutrition } from "@/lib/nutrition";

export type NutritionAxis = { key: keyof Nutrition; label: string; unit: string };

// Same five nutrients shown in NutritionCompareView's table, in the same
// order — the only ones the data model tracks (see src/lib/nutrition.ts),
// so there's nothing else reliable to add as a sixth axis/bar group. Shared
// between the radar and bar chart so both stay numerically consistent.
export const NUTRITION_AXES: NutritionAxis[] = [
  { key: "kcal_per_100", label: "Kalori", unit: "kcal" },
  { key: "protein_g", label: "Protein", unit: "g" },
  { key: "fat_g", label: "Yağ", unit: "g" },
  { key: "carbs_g", label: "Karbonhidrat", unit: "g" },
  { key: "fiber_g", label: "Lif", unit: "g" },
];

// Non-negative and finite by construction (guards a value that's somehow
// missing/NaN rather than trusting the data model). A true zero stays at
// zero; any nonzero value gets a small floor so it doesn't collapse to
// nothing and read as "no data".
export function fractionOf(value: number, max: number): number {
  const v = Number.isFinite(value) ? Math.max(0, value) : 0;
  if (v <= 0) return 0;
  if (!Number.isFinite(max) || max <= 0) return 0;
  return Math.min(1, Math.max(0.04, v / max));
}

// Reference scale: each axis is normalized against whichever of the two
// compared foods is higher on that nutrient — not a catalog-wide max. A
// catalog-wide reference sounds more "consistent," but a single outlier
// (e.g. sunflower oil's 100g fat) flattens every ordinary comparison's fat
// axis to near-invisible. Scaling to the visible pair means the larger of
// the two always reaches the top/edge, so every comparison is legible on
// its own terms. With only one food selected, it's normalized against
// itself (full bar/pentagon) as a placeholder until a second food gives it
// something to compare against.
export function computeMaxByKey(
  foodA: Nutrition | null,
  foodB: Nutrition | null
): Record<string, number> {
  const max: Record<string, number> = {};
  for (const axis of NUTRITION_AXES) {
    const a = foodA ? (foodA[axis.key] as number) : 0;
    const b = foodB ? (foodB[axis.key] as number) : 0;
    max[axis.key] = Math.max(Number.isFinite(a) ? a : 0, Number.isFinite(b) ? b : 0);
  }
  return max;
}

export function formatNutritionValue(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
}
