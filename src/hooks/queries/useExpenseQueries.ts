import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi, type AddMealExpensePayload, type UpdateMealExpensePayload, type AddHomeRentPayload, type AddUtilityPayload } from "../../services/expenseApi";
import { depositService, type AddDepositPayload, type UpdateDepositPayload } from "../../services/depositService";
import { queryKeys } from "../../lib/queryKeys";
import { toast } from "sonner";

// ── Meal Expenses ──────────────────────────────────────────────────────────

export function useMealExpenses(monthId?: string) {
  return useQuery({
    queryKey: queryKeys.expenses.mealExpenses(monthId),
    queryFn: () => expenseApi.getMealExpenses(monthId),
  });
}

export function useAddMealExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMealExpensePayload) => expenseApi.addMealExpense(payload),
    onSuccess: () => {
      toast.success("Expense added successfully");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add expense"),
  });
}

export function useUpdateMealExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMealExpensePayload }) =>
      expenseApi.updateMealExpense(id, payload),
    onSuccess: () => {
      toast.success("Expense updated successfully");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update expense"),
  });
}

export function useDeleteMealExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.deleteMealExpense(id),
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete expense"),
  });
}

// ── Home Rent ──────────────────────────────────────────────────────────────

export function useHomeRentExpenses(monthId?: string) {
  return useQuery({
    queryKey: queryKeys.expenses.homeRent(monthId),
    queryFn: () => expenseApi.getHomeRentExpenses(monthId),
  });
}

export function useAddHomeRent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddHomeRentPayload) => expenseApi.addHomeRent(payload),
    onSuccess: () => {
      toast.success("Home rent added successfully");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add home rent"),
  });
}

export function useDeleteHomeRent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.deleteHomeRent(id),
    onSuccess: () => {
      toast.success("Home rent deleted successfully");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete home rent"),
  });
}

// ── Utility Expenses ───────────────────────────────────────────────────────

export function useUtilityExpenses(monthId?: string) {
  return useQuery({
    queryKey: queryKeys.expenses.utilities(monthId),
    queryFn: () => expenseApi.getUtilityExpenses({ month_id: monthId }),
  });
}

export function useAddUtilityExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddUtilityPayload) => expenseApi.addUtilityExpense(payload),
    onSuccess: () => {
      toast.success("Utility expense added successfully");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add utility expense"),
  });
}

export function useDeleteUtilityExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.deleteUtilityExpense(id),
    onSuccess: () => {
      toast.success("Utility expense deleted successfully");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete utility expense"),
  });
}

// ── Summary ────────────────────────────────────────────────────────────────

export function useExpenseSummaryByMembers(monthId?: string) {
  return useQuery({
    queryKey: queryKeys.expenses.summaryByMembers(monthId),
    queryFn: () => expenseApi.getSummaryByMembers(monthId),
    // Only skip if caller explicitly passes null/undefined AND we should skip
    enabled: monthId !== null,
  });
}

export function useExpenseSummaryTotals(monthId?: string) {
  return useQuery({
    queryKey: queryKeys.expenses.summaryTotals(monthId),
    queryFn: () => expenseApi.getSummaryTotals(monthId),
    enabled: monthId !== null,
  });
}

// ── Deposits ───────────────────────────────────────────────────────────────

export function useDeposits(params?: Parameters<typeof depositService.getDeposits>[0]) {
  return useQuery({
    queryKey: queryKeys.deposits.list(params),
    queryFn: () => depositService.getDeposits(params),
    enabled: !!params?.month_id,
  });
}

export function useAddDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddDepositPayload) => depositService.addDeposit(payload),
    onSuccess: () => {
      toast.success("Deposit added successfully");
      qc.invalidateQueries({ queryKey: ["deposits"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add deposit"),
  });
}

export function useUpdateDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDepositPayload }) =>
      depositService.updateDeposit(id, payload),
    onSuccess: () => {
      toast.success("Deposit updated successfully");
      qc.invalidateQueries({ queryKey: ["deposits"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update deposit"),
  });
}

export function useDeleteDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => depositService.deleteDeposit(id),
    onSuccess: () => {
      toast.success("Deposit deleted successfully");
      qc.invalidateQueries({ queryKey: ["deposits"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete deposit"),
  });
}
