import apiClient from "./apiClient";

export interface TransferRequest {
  id: string;
  from_manager_id: string;
  from_manager_name: string;
  requested_at: string;
  expires_at: string;
}

export interface RequestTransferPayload {
  target_member_id: string;
}

export interface RequestTransferResponse {
  message: string;
  transfer_id: string;
  expires_at: string;
}

export interface ApproveTransferResponse {
  message: string;
  effective_date: string;
}

export interface RejectTransferResponse {
  message: string;
}

export const transferService = {
  // Request to transfer manager role (Section 10.1)
  requestTransfer: async (
    payload: RequestTransferPayload,
  ): Promise<RequestTransferResponse> => {
    const { data } = await apiClient.post<RequestTransferResponse>(
      "/transfer/request",
      payload,
    );
    return data;
  },

  // Get pending transfer requests (Section 10.2)
  getPendingTransfers: async (): Promise<TransferRequest[]> => {
    const { data } =
      await apiClient.get<TransferRequest[]>("/transfer/pending");
    return data;
  },

  // Approve transfer request (Section 10.3)
  approveTransfer: async (
    transferId: string,
  ): Promise<ApproveTransferResponse> => {
    const { data } = await apiClient.post<ApproveTransferResponse>(
      `/transfer/${transferId}/approve`,
    );
    return data;
  },

  // Reject/cancel transfer request (Section 10.4)
  rejectTransfer: async (
    transferId: string,
  ): Promise<RejectTransferResponse> => {
    const { data } = await apiClient.delete<RejectTransferResponse>(
      `/transfer/${transferId}/reject`,
    );
    return data;
  },
};
