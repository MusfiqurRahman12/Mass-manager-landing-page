import apiClient from "./apiClient";

export interface Mess {
  id: string;
  name: string;
  address: string;
  manager_id: string;
  automatic_market_date: string;
  currency: string;
  created_at: string;
}

export interface UpdateMessPayload {
  name?: string;
  address?: string;
  automatic_market_date?: string;
  currency?: string;
}

export const messService = {
  // Get current mess details
  getMess: async (): Promise<Mess> => {
    const { data } = await apiClient.get<Mess>("/mess");
    return data;
  },

  // Update mess information
  updateMess: async (payload: UpdateMessPayload): Promise<Mess> => {
    const { data } = await apiClient.put<Mess>("/mess", payload);
    return data;
  },

  // Delete mess (only if no active month)
  deleteMess: async (): Promise<void> => {
    await apiClient.delete("/mess");
  },
};
