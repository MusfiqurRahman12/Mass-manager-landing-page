import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messService, type UpdateMessPayload } from "../../services/messService";
import { transferService, type RequestTransferPayload } from "../../services/transferService";
import { toast } from "sonner";

// Define mess query keys since they weren't in the central queryKeys yet
export const messKeys = {
  detail: ["mess", "detail"] as const,
  transfers: ["mess", "transfers"] as const,
};

export function useMess() {
  return useQuery({
    queryKey: messKeys.detail,
    queryFn: messService.getMess,
  });
}

export function useUpdateMess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMessPayload) => messService.updateMess(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messKeys.detail });
      toast.success("Settings saved successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save settings"),
  });
}

export function useDeleteMess() {
  return useMutation({
    mutationFn: messService.deleteMess,
    onSuccess: () => toast.success("Mess deleted successfully"),
    onError: (err: Error) => toast.error(err.message || "Failed to delete mess"),
  });
}

export function usePendingTransfers() {
  return useQuery({
    queryKey: messKeys.transfers,
    queryFn: transferService.getPendingTransfers,
    retry: false, // Fail silently if user has no pending transfers
  });
}

export function useRequestTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RequestTransferPayload) => transferService.requestTransfer(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Transfer request sent successfully");
      qc.invalidateQueries({ queryKey: messKeys.transfers });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send transfer request"),
  });
}
