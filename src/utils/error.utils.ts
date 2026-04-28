import { AxiosError } from "axios";

/**
 * Extracts a user-friendly error message from an API error response.
 * Handles both standard detail strings and FastAPI validation error arrays.
 */
export const getErrorMessage = (error: unknown, fallback: string = "An unexpected error occurred"): string => {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response?.data?.detail) {
      const detail = axiosError.response.data.detail;
      
      // Handle simple string detail
      if (typeof detail === "string") {
        return detail;
      }
      
      // Handle FastAPI validation error array (loc, msg, type)
      if (Array.isArray(detail)) {
        return detail.map((err: any) => err.msg).join(", ");
      }
    }
    
    // Fallback to the error's own message if it's available and not a generic "Network Error"
    if (error.message && error.message !== "Network Error") {
        return error.message;
    }
  }
  
  return fallback;
};
