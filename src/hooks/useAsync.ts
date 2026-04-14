import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

/**
 * Hook for handling async operations with loading, error, and data states
 */
export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  options?: UseAsyncOptions,
) {
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus("pending");
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus("success");
      options?.onSuccess?.(response);

      if (options?.showToast) {
        toast.success("Operation successful");
      }

      return response;
    } catch (err) {
      const error = err as E;
      setError(error);
      setStatus("error");
      options?.onError?.(error as any);

      if (options?.showToast) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred",
        );
      }

      throw err;
    }
  }, [asyncFunction, options]);

  // Auto-execute on mount if immediate is true
  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { status, data, error, execute, isLoading: status === "pending" };
}

// Import React at top
import React from "react";
