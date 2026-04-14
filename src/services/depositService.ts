import apiClient from "./apiClient";

export interface Deposit {
  id: string;
  member_id: string;
  month_id: string;
  amount: number;
  deposit_date: string;
  note?: string;
  created_at: string;
}

export interface AddDepositPayload {
  member_id: string;
  amount: number;
  deposit_date: string;
  note?: string;
}

export interface UpdateDepositPayload {
  amount?: number;
  deposit_date?: string;
  note?: string;
}

export const depositService = {
  // Get deposits
  getDeposits: async (params?: {
    month_id?: string;
    member_id?: string;
  }): Promise<Deposit[]> => {
    const { data } = await apiClient.get<Deposit[]>("/deposits", { params });
    return data;
  },

  // Add deposit
  addDeposit: async (payload: AddDepositPayload): Promise<Deposit> => {
    const { data } = await apiClient.post<Deposit>("/deposits", payload);
    return data;
  },

  // Update deposit
  updateDeposit: async (
    depositId: string,
    payload: UpdateDepositPayload,
  ): Promise<Deposit> => {
    const { data } = await apiClient.put<Deposit>(
      `/deposits/${depositId}`,
      payload,
    );
    return data;
  },

  // Delete deposit
  deleteDeposit: async (depositId: string): Promise<void> => {
    await apiClient.delete(`/deposits/${depositId}`);
  },
};
