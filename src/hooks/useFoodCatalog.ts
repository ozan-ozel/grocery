import { useEffect, useMemo, useState } from "react";
import { browseNutritionCached, type Nutrition, type NutritionMap } from "@/lib/nutrition";

type Status = "idle" | "loading" | "ready" | "error";

// There are ~64 rows total, so loading them all once (rather than the
// debounced server-side search AllFoodsBrowser uses) and filtering
// client-side — same pattern as SearchView.tsx — is simpler and avoids a
// network round trip per keystroke in the Add Food picker.
const CATALOG_LIMIT = 200;

export function useFoodCatalog() {
  const [foods, setFoods] = useState<Nutrition[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    browseNutritionCached("", CATALOG_LIMIT)
      .then((rows) => {
        if (cancelled) return;
        setFoods(rows);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          "[mealPlan] food catalog fetch failed — if you're running locally, npm run netlify:dev serves /api/*, npm run dev does not:",
          err
        );
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const catalogMap: NutritionMap = useMemo(
    () => new Map(foods.map((f) => [f.name_tr, f])),
    [foods]
  );

  return { foods, catalogMap, status };
}
