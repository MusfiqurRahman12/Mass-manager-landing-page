import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context";

interface UseCheckAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook to check and verify authentication status
 */
export function useCheckAuth(): UseCheckAuthReturn {
  const { isAuthenticated, isLoading } = useAuth();

  return { isLoading, isAuthenticated };
}

/**
 * Hook to require authentication - redirects if not authenticated
 */
export function useRequireAuth() {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login", { replace: true });
      } else {
        setIsReady(true);
      }
    }
  }, [isLoading, user, navigate]);

  return { isReady, user };
}

/**
 * Hook to require manager role
 */
export function useRequireManager() {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "manager") {
        navigate("/dashboard", { replace: true });
      } else {
        setIsReady(true);
      }
    }
  }, [isLoading, user, navigate]);

  return { isReady };
}
