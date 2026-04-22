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

/**
 * Maps a sign-in result to a user-facing error message.
 */
export function formatSignInError(result: { status?: number; error?: string }): string {
  if (result.status === 401) {
    return "The login or password is incorrect.";
  }
  if (result.status) {
    return "Authentication error (code: " + result.status + ").";
  }
  if (result.error) {
    return "Authentication error: " + result.error;
  }
  return "The login or password is incorrect.";
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
