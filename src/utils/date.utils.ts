import {
  format,
  formatDistance,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";

/**
 * Formats a date to a readable string
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "PPP",
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Formats date for display in UI
 */
export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, "HH:mm")}`;
  }

  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, "HH:mm")}`;
  }

  return format(dateObj, "PP HH:mm");
}

/**
 * Get current month name and year
 */
export function getCurrentMonthYear(): string {
  return format(new Date(), "MMMM yyyy");
}

/**
 * Get month start and end dates
 */
export function getMonthRange(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return { start, end };
}
