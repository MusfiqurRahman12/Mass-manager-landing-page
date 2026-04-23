import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseAsyncOptions {
  onSuccess?: (data: unknown) => void;
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

  // Use ref for options to avoid infinite re-render loop
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(async () => {
    setStatus("pending");
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus("success");
      optionsRef.current?.onSuccess?.(response);

      if (optionsRef.current?.showToast) {
        toast.success("Operation successful");
      }

      return response;
    } catch (err) {
      const error = err as E;
      setError(error);
      setStatus("error");
      optionsRef.current?.onError?.(error as Error);

      if (optionsRef.current?.showToast) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred",
        );
      }

      throw err;
    }
  }, [asyncFunction]);

  // Auto-execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { status, data, error, execute, isLoading: status === "pending" };
}
