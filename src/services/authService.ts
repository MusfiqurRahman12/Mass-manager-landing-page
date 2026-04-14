import apiClient from "./apiClient";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "member" | "manager";
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
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

  // Login user
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("tokenType", data.token_type);
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
  createMess: async (payload: CreateMessPayload): Promise<any> => {
    const { data } = await apiClient.post<any>("/auth/create-mess", payload);
    return data;
  },

  // Join existing mess
  joinMess: async (messId: string): Promise<any> => {
    const { data } = await apiClient.post<any>(`/auth/join-mess/${messId}`);
    return data;
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
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
