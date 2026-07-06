/**
 * Validates and sanitizes a post-login redirect path.
 * Prevents open-redirect attacks by rejecting non-relative URLs.
 */
export function resolveSafeRedirectPath(candidate: string | null): string {
  if (!candidate) return "/";
  const redirectPath = candidate.trim();
  if (!redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return "/";
  }
  return redirectPath;
}

/** Minimal translate function shape (compatible with vue-i18n's `t`). */
type TranslateFn = (key: string, named?: Record<string, unknown>) => string;

/**
 * Maps a sign-in result to a user-facing, localized error message.
 * Takes the `t` function so the util stays pure and testable.
 */
export function formatSignInError(result: { status?: number; error?: string }, t: TranslateFn): string {
  if (result.status === 401) {
    return t("LOGIN.ERRORS.INVALID_CREDENTIALS");
  }
  if (result.status) {
    return t("LOGIN.ERRORS.AUTH_WITH_CODE", { code: result.status });
  }
  if (result.error) {
    return t("LOGIN.ERRORS.AUTH_GENERIC", { detail: result.error });
  }
  return t("LOGIN.ERRORS.INVALID_CREDENTIALS");
}

export interface PasswordClientError {
  code: string;
}

/**
 * Performs client-side password change validation.
 * Returns additional error codes to append to server-side validation results.
 */
export function validatePasswordChange(fields: {
  password: string;
  confirmPassword: string;
  currentPassword: string;
}): PasswordClientError[] {
  const errors: PasswordClientError[] = [];
  if (fields.confirmPassword !== fields.password) {
    errors.push({ code: "Repeat-password" });
  }
  if (fields.password === fields.currentPassword && fields.confirmPassword === fields.currentPassword) {
    errors.push({ code: "Equal-passwords" });
  }
  return errors;
}
