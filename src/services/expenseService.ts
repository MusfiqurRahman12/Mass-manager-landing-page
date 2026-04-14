import apiClient from "./apiClient";

export type ExpenseCategory =
  | "electricity"
  | "groceries"
  | "maintenance"
  | "cleaning"
  | "water"
  | "gas"
  | "other";

export interface Expense {
  id: string;
  mess_id: string;
  month_id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
}

export interface AddExpensePayload {
  category: ExpenseCategory;
  amount: number;
  description: string;
  expense_date: string;
}

export interface UpdateExpensePayload {
  category?: ExpenseCategory;
  amount?: number;
  description?: string;
  expense_date?: string;
}

export const expenseService = {
  // Get all expenses
  getExpenses: async (params?: {
    month_id?: string;
    category?: ExpenseCategory;
    start_date?: string;
    end_date?: string;
  }): Promise<Expense[]> => {
    const { data } = await apiClient.get<Expense[]>("/expenses", { params });
    return data;
  },

  // Add new expense
  addExpense: async (payload: AddExpensePayload): Promise<Expense> => {
    const { data } = await apiClient.post<Expense>("/expenses", payload);
    return data;
  },

  // Update expense
  updateExpense: async (
    expenseId: string,
    payload: UpdateExpensePayload,
  ): Promise<Expense> => {
    const { data } = await apiClient.put<Expense>(
      `/expenses/${expenseId}`,
      payload,
    );
    return data;
  },

  // Delete expense
  deleteExpense: async (expenseId: string): Promise<void> => {
    await apiClient.delete(`/expenses/${expenseId}`);
  },
};
