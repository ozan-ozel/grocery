import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/preact-query";
import {
  browseNutritionCached,
  BROWSE_CACHE_TTL_MS,
  type NutritionMap,
} from "@/lib/nutrition";

export type Status = "idle" | "loading" | "ready" | "error";

// The catalog is small enough to load in full and filter client-side — same
// pattern as AddItem.tsx's catalog suggestions — avoiding a network round
// trip per keystroke. Matches the server's BROWSE_LIMIT_MAX (api/nutrition.ts)
// so a growing catalog doesn't silently get truncated here.
const CATALOG_LIMIT = 1000;

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

  // One resolution point for "does this string name a known Food" — keyed
  // by name_tr AND every alias, so an exclusion search or any other catalog
  // consumer can find a food by an alias spelling too (Phase 9 §20.6 C5).
  // Still exact-match only; fuzzy matching stays out of this map by design.
  const catalogMap: NutritionMap = useMemo(() => {
    const map: NutritionMap = new Map();
    for (const food of foods) {
      map.set(food.name_tr, food);
      for (const alias of food.aliases ?? []) {
        if (!map.has(alias)) map.set(alias, food);
      }
    }
    return map;
  }, [foods]);

  const status: Status = query.isError
    ? "error"
    : query.isPending
      ? "loading"
      : "ready";

  useEffect(() => {
    if (query.isError) {
      console.warn(
        "[mealPlan] food catalog fetch failed — if you're running locally, npm run vercel:dev serves /api/*, npm run dev does not:",
        query.error
      );
    }
  }, [query.isError, query.error]);

  return { foods, catalogMap, status };
}
