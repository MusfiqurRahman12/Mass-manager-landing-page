import { useEffect, useState } from "react";
import { useAuth } from "../context";

interface UseCheckAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

/**
 * Hook to check and verify authentication status
 */
export function useCheckAuth(): UseCheckAuthReturn {
  const { isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Additional auth verification can be done here if needed
  }, [isAuthenticated]);

  return { isLoading, isAuthenticated, error };
}

/**
 * Hook to require authentication - redirects if not authenticated
 */
export function useRequireAuth() {
  const { isLoading, user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = "/login";
      } else {
        setIsReady(true);
      }
    }
  }, [isLoading, user]);

  return { isReady };
}

/**
 * Hook to require manager role
 */
export function useRequireManager() {
  const { isLoading, user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "manager") {
        window.location.href = "/dashboard";
      } else {
        setIsReady(true);
      }
    }
  }, [isLoading, user]);

  return { isReady };
}
