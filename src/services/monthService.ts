import apiClient from "./apiClient";

export interface Month {
  id: string;
  mess_id: string;
  month_year: string;
  is_active: boolean;
  opening_balance: number;
  total_meal: number;
  total_cost: number;
  meal_rate: number;
  closing_balance: number;
  created_at: string;
}

export interface StartMonthPayload {
  month_year: string;
}

export const monthService = {
  // Get active month
  getActiveMonth: async (): Promise<Month> => {
    const { data } = await apiClient.get<Month>("/months/active");
    return data;
  },

  // Start new month
  startNewMonth: async (payload: StartMonthPayload): Promise<Month> => {
    const { data } = await apiClient.post<Month>("/months/start", payload);
    return data;
  },

  // Get month history
  getMonthHistory: async (
    limit: number = 12,
    offset: number = 0,
  ): Promise<Month[]> => {
    const { data } = await apiClient.get<Month[]>("/months/history", {
      params: { limit, offset },
    });
    return data;
  },

  // Get specific month details
  getMonthDetails: async (monthId: string): Promise<Month> => {
    const { data } = await apiClient.get<Month>(`/months/${monthId}`);
    return data;
  },
};
