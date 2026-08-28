import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/preact-query";
import {
  browseNutritionCached,
  BROWSE_CACHE_TTL_MS,
  type NutritionMap,
} from "@/lib/nutrition";

type Status = "idle" | "loading" | "ready" | "error";

// There are ~64 rows total, so loading them all once (rather than the
// debounced server-side search AllFoodsBrowser uses) and filtering
// client-side — same pattern as SearchView.tsx — is simpler and avoids a
// network round trip per keystroke in the Add Food picker.
const CATALOG_LIMIT = 200;

export function useFoodCatalog() {
  const query = useQuery({
    queryKey: ["foodCatalog", CATALOG_LIMIT],
    queryFn: () => browseNutritionCached("", CATALOG_LIMIT),
    // browseNutritionCached already owns a localStorage TTL cache of its
    // own — this just mirrors that TTL so the two layers agree on when a
    // remount/refocus should re-run the fetcher, instead of TanStack
    // Query's default (treat data stale immediately) fighting it.
    staleTime: BROWSE_CACHE_TTL_MS,
  });

  const foods = useMemo(() => query.data ?? [], [query.data]);

  const catalogMap: NutritionMap = useMemo(
    () => new Map(foods.map((f) => [f.name_tr, f])),
    [foods]
  );

  const status: Status = query.isError
    ? "error"
    : query.isPending
      ? "loading"
      : "ready";

  useEffect(() => {
    if (query.isError) {
      console.warn(
        "[mealPlan] food catalog fetch failed — if you're running locally, npm run netlify:dev serves /api/*, npm run dev does not:",
        query.error
      );
    }
  }, [query.isError, query.error]);

  return { foods, catalogMap, status };
}
