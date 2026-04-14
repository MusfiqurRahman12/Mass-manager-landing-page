import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 * Handles Tailwind CSS conflicts properly
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
