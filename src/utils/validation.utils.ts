/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates phone number (Indian format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

/**
 * Validates if a string is a valid invite code
 */
export function isValidInviteCode(code: string): boolean {
  // Alphanumeric, 8-12 characters
  const codeRegex = /^[A-Z0-9]{8,12}$/;
  return codeRegex.test(code.toUpperCase());
}

/**
 * Validates if a value is a valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates minimum amount (e.g., deposit, expense)
 */
export function isValidAmount(
  amount: number | string,
  min: number = 0,
): boolean {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return !isNaN(num) && num >= min;
}

/**
 * Validates that a required field is not empty
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * Validates UUID format (v4)
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
