import apiClient from "./apiClient";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "member" | "manager";
  mess_id: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateMessPayload {
  name: string;
  address: string;
  automatic_market_date: string; // e.g., "Friday"
}

export interface JoinMessPayload {
  mess_id: string;
}

export const authService = {
  // Register new user
  register: async (payload: RegisterPayload): Promise<User> => {
    const { data: registerResponse } = await apiClient.post<User>(
      "/auth/register",
      payload,
    );
    // After successful register, still need to login to get token
    // But return the user data
    return registerResponse;
  },

  // Login user — stores both access and refresh tokens
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("tokenType", data.token_type);
    }
    if (data.refresh_token) {
      localStorage.setItem("refreshToken", data.refresh_token);
    }
    return data;
  },

  // Get current user info
  getCurrentUserInfo: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/auth/me");
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  // Create new mess
  createMess: async (payload: CreateMessPayload): Promise<{ id: string; name: string; message: string }> => {
    const { data } = await apiClient.post<{ id: string; name: string; message: string }>("/auth/create-mess", payload);
    return data;
  },

  // Join existing mess
  joinMess: async (messId: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(`/auth/join-mess/${messId}`);
    return data;
  },

  // Refresh tokens — exchanges the stored refresh token for a new token pair
  refreshToken: async (): Promise<AuthResponse> => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }
    // Use a plain axios call (not apiClient) to avoid triggering the interceptor again
    const { default: axios } = await import("axios");
    const API_BASE_URL =
      (import.meta as { env: Record<string, string> }).env.VITE_API_BASE_URL ||
      "http://localhost:3000/api";
    const { data } = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: storedRefreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);
    localStorage.setItem("tokenType", data.token_type);
    return data;
  },

  // Logout — clears all stored tokens
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};
