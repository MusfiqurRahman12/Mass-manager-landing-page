import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
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

// ── Refresh state ──────────────────────────────────────────────────────────
// Track whether a token refresh is already in flight.
// Any request that 401s while a refresh is pending is queued here so that
// once we get the new access token we can replay them all at once.
let isRefreshing = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let pendingQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
}

function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

// ── Request interceptor — attach JWT ──────────────────────────────────────
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

// ── Response interceptor — silent token refresh ────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh for 401 errors that are NOT from the auth endpoints
    // themselves, and only if we haven't already retried this request.
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry &&
      window.location.pathname !== "/login"
    ) {
      const storedRefreshToken = localStorage.getItem("refreshToken");

      // No refresh token stored — hard logout immediately
      if (!storedRefreshToken) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Another request already started a refresh — queue this one
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark this request as retried and start the refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use a bare axios call so we don't recurse through THIS interceptor
        const { data } = await axios.post<{
          access_token: string;
          refresh_token: string;
          token_type: string;
        }>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: storedRefreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        localStorage.setItem("tokenType", data.token_type);

        // Update the auth header on the original request and replay it
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        processQueue(null, data.access_token);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed (token expired / invalid) — log the user out
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Transform backend detail into the error's main message so that
    // components doing `error.message` always get the user-readable text.
    error.message = getErrorMessage(error, error.message);

    return Promise.reject(error);
  },
);

export default apiClient;
