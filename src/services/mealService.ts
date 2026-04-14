import apiClient from "./apiClient";

export interface Meal {
  id: string;
  member_id: string;
  month_id: string;
  meal_date: string;
  meal_count: number;
  created_at: string;
}

export interface AddMealPayload {
  member_id: string;
  meal_date: string;
  meal_count: number;
}

export interface UpdateMealPayload {
  meal_count: number;
}

export interface MealCost {
  meal_rate: number;
  total_cost: number;
  total_meal: number;
}

export interface SetMealCostPayload {
  total_cost: number;
}

export const mealService = {
  // Get meals for active month
  getMeals: async (params?: {
    member_id?: string;
    meal_date?: string;
  }): Promise<Meal[]> => {
    const { data } = await apiClient.get<Meal[]>("/meals", { params });
    return data;
  },

  // Add meal entry
  addMeal: async (payload: AddMealPayload): Promise<Meal> => {
    const { data } = await apiClient.post<Meal>("/meals", payload);
    return data;
  },

  // Update meal entry
  updateMeal: async (
    mealId: string,
    payload: UpdateMealPayload,
  ): Promise<Meal> => {
    const { data } = await apiClient.put<Meal>(`/meals/${mealId}`, payload);
    return data;
  },

  // Delete meal entry
  deleteMeal: async (mealId: string): Promise<void> => {
    await apiClient.delete(`/meals/${mealId}`);
  },

  // Get current meal rate and totals
  getMealCost: async (): Promise<MealCost> => {
    const { data } = await apiClient.get<MealCost>("/meals/cost");
    return data;
  },

  // Set total meal cost for month (recalculates meal rate)
  setMealCost: async (payload: SetMealCostPayload): Promise<MealCost> => {
    const { data } = await apiClient.post<MealCost>("/meals/cost", payload);
    return data;
  },
};
