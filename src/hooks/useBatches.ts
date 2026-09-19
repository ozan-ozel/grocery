// DEC-069: household-scoped PreparationBatch list + creation, mirroring
// useMealPlan.ts's TanStack Query pattern. Kept separate from useMealPlan
// (a different query key, a different lifecycle — a batch list isn't pinned
// to one date) rather than folded into it.
import { useQueries, useQuery, useQueryClient } from "@tanstack/preact-query";
import {
  createPreparationBatch,
  fetchPreparationBatches,
  remainingComposition,
  type MealAllocation,
  type NewPreparationBatch,
  type PreparationBatch,
  type RemainingItem,
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

// Every allocation (meal_entries row with this batch_id) ever drawn from one
// batch, as the plain { foodId, quantityG } pairs remainingComposition needs.
async function fetchBatchAllocations(
  householdId: string,
  batchId: string
): Promise<MealAllocation[]> {
  const entries = await fetchMealEntriesForBatch(householdId, batchId);
  return entries.map((entry) => ({ foodId: entry.foodId, quantityG: entry.quantityG }));
}

export type BatchWithRemaining = {
  batch: PreparationBatch;
  remaining: RemainingItem[];
};

// The one place batches and their leftovers are combined: the newest-first
// batch list, each with its derived remaining grams. Uses the SAME query keys
// as useBatchAllocations, so one invalidation refreshes both. While a batch's
// allocations are still loading, its remaining shows the full composition
// (nothing allocated yet) rather than blocking the whole list.
export function useBatchLedger(householdId: string | null) {
  const { batches, isLoading: batchesLoading, createBatch } = useBatches(householdId);

  const allocationQueries = useQueries({
    queries: batches.map((batch) => ({
      queryKey: ["batchAllocations", householdId ?? "local", batch.id] as const,
      queryFn: () => fetchBatchAllocations(householdId as string, batch.id),
      enabled: !!householdId,
      staleTime: 15_000,
    })),
  });

  const ledger: BatchWithRemaining[] = batches.map((batch, index) => ({
    batch,
    remaining: remainingComposition(batch, allocationQueries[index]?.data ?? []),
  }));

  return { ledger, isLoading: batchesLoading, createBatch };
}
