import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { monthService, type StartMonthPayload } from "../../services/monthService";
import { queryKeys } from "../../lib/queryKeys";
import { toast } from "sonner";

export function useActiveMonth() {
  return useQuery({
    queryKey: queryKeys.months.active(),
    queryFn: monthService.getActiveMonth,
    // Don't throw on 404 — no active month is a valid state
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });
}

export function useMonthHistory(limit = 12, offset = 0) {
  return useQuery({
    queryKey: queryKeys.months.history(limit, offset),
    queryFn: () => monthService.getMonthHistory(limit, offset),
  });
}

export function useMonthDetails(monthId: string) {
  return useQuery({
    queryKey: queryKeys.months.detail(monthId),
    queryFn: () => monthService.getMonthDetails(monthId),
    enabled: !!monthId,
  });
}

export function useStartNewMonth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartMonthPayload) => monthService.startNewMonth(payload),
    onSuccess: () => {
      toast.success("New month started successfully");
      // Invalidate everything that depends on the active month
      qc.invalidateQueries({ queryKey: queryKeys.months.active() });
      qc.invalidateQueries({ queryKey: queryKeys.months.history(12, 0) });
      qc.invalidateQueries({ queryKey: ["meals"] });
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to start new month"),
  });
}
