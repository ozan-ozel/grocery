// DEC-069: household-scoped PreparationBatch list + creation, mirroring
// useMealPlan.ts's TanStack Query pattern. Kept separate from useMealPlan
// (a different query key, a different lifecycle — a batch list isn't pinned
// to one date) rather than folded into it.
import { useQuery, useQueryClient } from "@tanstack/preact-query";
import {
  createPreparationBatch,
  fetchPreparationBatches,
  type MealAllocation,
  type NewPreparationBatch,
  type PreparationBatch,
} from "@/lib/preparationBatch";
import { fetchMealEntriesForBatch } from "@/lib/mealPlan";

export function useBatches(householdId: string | null) {
  const queryKey = ["preparationBatches", householdId ?? "local"] as const;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => fetchPreparationBatches(householdId as string),
    enabled: !!householdId,
    staleTime: 30_000,
  });

  async function createBatch(input: NewPreparationBatch): Promise<PreparationBatch | null> {
    const created = await createPreparationBatch(input);
    if (created) {
      queryClient.setQueryData<PreparationBatch[]>(queryKey, (prev) => [created, ...(prev ?? [])]);
    }
    return created;
  }

  return {
    batches: query.data ?? [],
    isLoading: !!householdId && query.isLoading,
    createBatch,
  };
}

// Allocations (meal_entries rows) drawn from one specific batch — a separate
// query key per batch id, refetched whenever a new allocation is created
// against it (see BatchPlanner.tsx's invalidateQueries call).
export function useBatchAllocations(householdId: string | null, batchId: string) {
  const query = useQuery({
    queryKey: ["batchAllocations", householdId ?? "local", batchId] as const,
    queryFn: async (): Promise<MealAllocation[]> => {
      const entries = await fetchMealEntriesForBatch(householdId as string, batchId);
      return entries.map((entry) => ({ foodId: entry.foodId, quantityG: entry.quantityG }));
    },
    enabled: !!householdId,
    staleTime: 15_000,
  });
  return { allocations: query.data ?? [], isLoading: !!householdId && query.isLoading };
}
