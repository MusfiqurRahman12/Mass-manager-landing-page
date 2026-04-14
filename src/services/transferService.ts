import apiClient from "./apiClient";

export interface TransferRequest {
  id: string;
  from_manager_name: string;
  requested_at: string;
  expires_at: string;
}

export interface RequestTransferPayload {
  target_member_id: string;
}

export const transferService = {
  // Request to transfer manager role
  requestTransfer: async (payload: RequestTransferPayload): Promise<any> => {
    const { data } = await apiClient.post<any>("/transfer/request", payload);
    return data;
  },

  // Get pending transfer requests (for target member)
  getPendingTransfers: async (): Promise<TransferRequest[]> => {
    const { data } =
      await apiClient.get<TransferRequest[]>("/transfer/pending");
    return data;
  },

  // Approve transfer request
  approveTransfer: async (transferId: string): Promise<any> => {
    const { data } = await apiClient.post<any>(
      `/transfer/${transferId}/approve`,
    );
    return data;
  },

  // Reject/cancel transfer request
  rejectTransfer: async (transferId: string): Promise<any> => {
    const { data } = await apiClient.delete<any>(
      `/transfer/${transferId}/reject`,
    );
    return data;
  },
};
