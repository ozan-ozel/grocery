// Yemeklerim: the signed-in user's saved meals. Mirrors useBatches.ts's
// TanStack Query pattern. Per-user (not per-household), so the key is the userId.
// Mounted by MealPlanView (not by the sheet) so the list is already fetched by
// the time the "Yemekler" sheet opens.
import { useQuery, useQueryClient } from "@tanstack/preact-query";
import {
  createSavedMeal,
  deleteSavedMeal,
  fetchSavedMeals,
  updateSavedMeal,
  type NewSavedMeal,
  type SavedMeal,
} from "@/lib/savedMeals";

export function useSavedMeals(userId: string | null) {
  const queryKey = ["savedMeals", userId ?? "local"] as const;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: fetchSavedMeals,
    enabled: !!userId,
    staleTime: 60_000,
  });

  // Each mutation waits for the server before touching the cache (a saved meal
  // has no optimistic UI to protect — the form stays open until it resolves).
  async function create(input: NewSavedMeal): Promise<SavedMeal | null> {
    const created = await createSavedMeal(input);
    if (created) {
      queryClient.setQueryData<SavedMeal[]>(queryKey, (prev) => [created, ...(prev ?? [])]);
    }
    return created;
  }

  async function update(id: string, input: Omit<NewSavedMeal, "id">): Promise<SavedMeal | null> {
    const updated = await updateSavedMeal(id, input);
    if (updated) {
      queryClient.setQueryData<SavedMeal[]>(queryKey, (prev) =>
        (prev ?? []).map((meal) => (meal.id === id ? updated : meal))
      );
    }
    return updated;
  }

  async function remove(id: string): Promise<boolean> {
    const ok = await deleteSavedMeal(id);
    if (ok) {
      queryClient.setQueryData<SavedMeal[]>(queryKey, (prev) =>
        (prev ?? []).filter((meal) => meal.id !== id)
      );
    }
    return ok;
  }

  return {
    savedMeals: query.data ?? [],
    isLoading: !!userId && query.isLoading,
    create,
    update,
    remove,
  };
}
