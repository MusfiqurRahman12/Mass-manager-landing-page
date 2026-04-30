export let globalCurrency = "BDT";

export function setGlobalCurrency(currency: string) {
  globalCurrency = currency;
  if (typeof window !== "undefined") {
    localStorage.setItem("mess_currency", currency);
  }
}

// Initialize from local storage if available
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("mess_currency");
  if (stored) {
    globalCurrency = stored;
  }
}

/**
 * Formats a number as currency using the global currency setting
 */
export function formatCurrency(
  amount: number,
  currency: string = globalCurrency,
): string {
  let locale = "en-US";
  if (currency === "BDT") locale = "en-BD";
  else if (currency === "INR") locale = "en-IN";
  else if (currency === "EUR") locale = "de-DE";
  else if (currency === "GBP") locale = "en-GB";

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // Force the Taka symbol if BDT (some browsers show 'BDT' instead of '৳' by default)
  if (currency === "BDT") {
    return formatted.replace("BDT", "৳").replace("bdt", "৳");
  }

  return formatted;
}

/**
 * Formats a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/**
 * Capitalizes first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts camelCase to Title Case
 */
export function camelCaseToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

/**
 * Returns a human-readable relative time string, e.g. "3 minutes ago"
 */
export function formatDistanceToNow(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}
