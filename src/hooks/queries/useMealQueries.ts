import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mealService, type Meal, type AddMealBatchPayload, type UpdateMealPayload, type SetMealCostPayload } from "../../services/mealService";
import { queryKeys } from "../../lib/queryKeys";

// ── Queries ────────────────────────────────────────────────────────────────

export function useMeals(params?: Parameters<typeof mealService.getMeals>[0]) {
  return useQuery({
    queryKey: queryKeys.meals.list(params),
    queryFn: () => mealService.getMeals(params),
  });
}

export function useMealCost() {
  return useQuery({
    queryKey: queryKeys.meals.cost(),
    queryFn: mealService.getMealCost,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useAddMealBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMealBatchPayload) => mealService.addMealBatch(payload),
    onSuccess: (data) => {
      const msg = (data as { message?: string }).message;
      toast.success(msg || "Meals added successfully");
      // Invalidate both meals list and cost so they refetch fresh data
      qc.invalidateQueries({ queryKey: queryKeys.meals.all });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add meal"),
  });
}

export function useUpdateMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMealPayload }) =>
      mealService.updateMeal(id, payload),
    onSuccess: (updatedRaw) => {
      const updated = updatedRaw as Meal;
      toast.success("Meal updated successfully");
      // Optimistically patch the cached list
      qc.setQueriesData<Meal[]>({ queryKey: queryKeys.meals.all }, (old) =>
        Array.isArray(old) ? old.map((m) => (m.id === updated.id ? updated : m)) : old
      );
      qc.invalidateQueries({ queryKey: queryKeys.meals.cost() });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update meal"),
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mealId: string) => mealService.deleteMeal(mealId),
    onSuccess: (_data, mealId) => {
      toast.success("Meal deleted successfully");
      // Remove immediately from cache
      qc.setQueriesData<Meal[]>({ queryKey: queryKeys.meals.all }, (old) =>
        Array.isArray(old) ? old.filter((m) => m.id !== mealId) : old
      );
      qc.invalidateQueries({ queryKey: queryKeys.meals.cost() });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete meal"),
  });
}

export function useSetMealCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SetMealCostPayload) => mealService.setMealCost(payload),
    onSuccess: () => {
      toast.success("Meal cost updated successfully");
      qc.invalidateQueries({ queryKey: queryKeys.meals.cost() });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update meal cost"),
  });
}
