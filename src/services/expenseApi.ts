import apiClient from "./apiClient";

// ==================== Meal Expenses Types ====================
export interface MealExpense {
  id: string;
  mess_id: string;
  month_id: string;
  expense_date: string;
  amount: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_at: string;
}

export interface MealExpensesResponse {
  total_meal_expenses: number;
  total_meals: number;
  meal_rate: number;
  monthly_meal_cost_set: number | null;
  expenses: MealExpense[];
}

export interface AddMealExpensePayload {
  amount: number;
  description: string;
  expense_date: string;
  member_id?: string;
  add_deposit?: boolean;
}

export interface UpdateMealExpensePayload {
  amount?: number;
  description?: string;
  expense_date?: string;
}

// ==================== Home Rent Types ====================
export type ShareType = "equal" | "percentage" | "manual";

export interface MemberShareInput {
  member_id: string;
  percentage?: number;
  amount?: number;
}

export interface MemberSharePreview {
  member_id: string;
  member_name: string;
  amount: number;
  percentage: number | null;
}

export interface MemberShare extends MemberSharePreview {
  id: string;
  created_at: string;
}

export interface HomeRentPreviewRequest {
  total_amount: number;
  share_type: ShareType;
  member_shares?: MemberShareInput[];
}

export interface HomeRentPreviewResponse {
  total_amount: number;
  share_type: ShareType;
  member_shares: MemberSharePreview[];
}

export interface HomeRentExpense {
  id: string;
  mess_id: string;
  month_id: string;
  total_amount: number;
  share_type: ShareType;
  description: string;
  expense_date: string;
  created_by: string;
  created_at: string;
  member_shares: MemberShare[];
}

export interface AddHomeRentPayload {
  total_amount: number;
  share_type: ShareType;
  description: string;
  expense_date: string;
  member_shares?: MemberShareInput[];
}

export type UpdateHomeRentPayload = Partial<AddHomeRentPayload>;

// ==================== Utility Expenses Types ====================
export type UtilityType = "electricity" | "gas" | "water" | "internet" | "other";

export interface UtilityExpense {
  id: string;
  mess_id: string;
  month_id: string;
  utility_type: UtilityType;
  total_amount: number;
  share_type: ShareType;
  description: string;
  expense_date: string;
  created_by: string;
  created_at: string;
  member_shares: MemberShare[];
}

export interface AddUtilityPayload {
  utility_type: UtilityType;
  total_amount: number;
  share_type: ShareType;
  description: string;
  expense_date: string;
  member_shares?: MemberShareInput[];
}

export type UpdateUtilityPayload = Partial<AddUtilityPayload>;

// ==================== Summary Types ====================
export interface MemberSummary {
  member_id: string;
  member_name: string;
  home_rent_share: number;
  utility_share: number;
  total_share: number;
}

export interface ExpenseSummaryMembersResponse {
  month_id: string;
  home_rent_total: number;
  utilities_total: number;
  grand_total: number;
  member_summaries: MemberSummary[];
  home_rent_expenses: HomeRentExpense[];
  utility_expenses: UtilityExpense[];
}

export interface ExpenseSummaryTotalsResponse {
  month_id: string;
  meal_expenses: number;
  home_rent: number;
  utilities: number;
  other_expenses: number;
  grand_total: number;
}

// ==================== API Service ====================
export const expenseApi = {
  // ========== Meal Expenses ==========
  getMealExpenses: async (month_id?: string): Promise<MealExpensesResponse> => {
    const params = month_id ? { month_id } : {};
    const { data } = await apiClient.get<MealExpensesResponse>("/expenses/meals", { params });
    return data;
  },

  addMealExpense: async (payload: AddMealExpensePayload): Promise<MealExpense> => {
    const { data } = await apiClient.post<MealExpense>("/expenses/meals", payload);
    return data;
  },

  updateMealExpense: async (
    expenseId: string,
    payload: UpdateMealExpensePayload,
  ): Promise<MealExpense> => {
    const { data } = await apiClient.put<MealExpense>(`/expenses/meals/${expenseId}`, payload);
    return data;
  },

  deleteMealExpense: async (expenseId: string): Promise<void> => {
    await apiClient.delete(`/expenses/meals/${expenseId}`);
  },

  approveMealExpense: async (expenseId: string, addDeposit: boolean): Promise<MealExpense> => {
    const { data } = await apiClient.patch<MealExpense>(`/expenses/meals/${expenseId}/approve`, {
      add_deposit: addDeposit,
    });
    return data;
  },

  rejectMealExpense: async (expenseId: string): Promise<MealExpense> => {
    const { data } = await apiClient.patch<MealExpense>(`/expenses/meals/${expenseId}/reject`);
    return data;
  },

  // ========== Home Rent ==========
  getHomeRentPreview: async (params: HomeRentPreviewRequest): Promise<HomeRentPreviewResponse> => {
    const { data } = await apiClient.post<HomeRentPreviewResponse>(
      "/expenses/home-rent/preview",
      params
    );
    return data;
  },

  getHomeRentExpenses: async (month_id?: string): Promise<HomeRentExpense[]> => {
    const params = month_id ? { month_id } : {};
    const { data } = await apiClient.get<HomeRentExpense[]>("/expenses/home-rent", { params });
    return data;
  },

  addHomeRent: async (payload: AddHomeRentPayload): Promise<HomeRentExpense> => {
    const { data } = await apiClient.post<HomeRentExpense>("/expenses/home-rent", payload);
    return data;
  },

  updateHomeRent: async (
    expenseId: string,
    payload: UpdateHomeRentPayload,
  ): Promise<HomeRentExpense> => {
    const { data } = await apiClient.put<HomeRentExpense>(`/expenses/home-rent/${expenseId}`, payload);
    return data;
  },

  deleteHomeRent: async (expenseId: string): Promise<void> => {
    await apiClient.delete(`/expenses/home-rent/${expenseId}`);
  },

  // ========== Utility Expenses ==========
  getUtilityPreview: async (params: HomeRentPreviewRequest): Promise<HomeRentPreviewResponse> => {
    const { data } = await apiClient.post<HomeRentPreviewResponse>(
      "/expenses/utilities/preview",
      params
    );
    return data;
  },

  getUtilityExpenses: async (params?: {
    month_id?: string;
    utility_type?: UtilityType;
  }): Promise<UtilityExpense[]> => {
    const { data } = await apiClient.get<UtilityExpense[]>("/expenses/utilities", { params });
    return data;
  },

  addUtilityExpense: async (payload: AddUtilityPayload): Promise<UtilityExpense> => {
    const { data } = await apiClient.post<UtilityExpense>("/expenses/utilities", payload);
    return data;
  },

  updateUtilityExpense: async (
    expenseId: string,
    payload: UpdateUtilityPayload,
  ): Promise<UtilityExpense> => {
    const { data } = await apiClient.put<UtilityExpense>(`/expenses/utilities/${expenseId}`, payload);
    return data;
  },

  deleteUtilityExpense: async (expenseId: string): Promise<void> => {
    await apiClient.delete(`/expenses/utilities/${expenseId}`);
  },

  // ========== Summary Endpoints ==========
  getSummaryByMembers: async (month_id?: string): Promise<ExpenseSummaryMembersResponse> => {
    const params = month_id ? { month_id } : {};
    const { data } = await apiClient.get<ExpenseSummaryMembersResponse>(
      "/expenses/summary/members",
      { params }
    );
    return data;
  },

  getSummaryTotals: async (month_id?: string): Promise<ExpenseSummaryTotalsResponse> => {
    const params = month_id ? { month_id } : {};
    const { data } = await apiClient.get<ExpenseSummaryTotalsResponse>(
      "/expenses/summary/totals",
      { params }
    );
    return data;
  },
};
