import axios, { AxiosError } from "axios";
import { getErrorMessage } from "../utils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle auth errors and transform error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && 
        !error.config?.url?.includes("/auth/login") &&
        window.location.pathname !== "/login") {
      // Token expired or invalid - clear and redirect to login
      // Note: window.location.href is intentional here because this interceptor
      // runs outside the React component tree where useNavigate() is unavailable.
      localStorage.removeItem("token");
      localStorage.removeItem("tokenType");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Transform backend detail into the error's main message so that
    // components doing `error.message` always get the user-readable text.
    error.message = getErrorMessage(error, error.message);

    return Promise.reject(error);
  },
);

export default apiClient;
