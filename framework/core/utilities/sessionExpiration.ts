/**
 * Shared flag: the session was involuntarily invalidated (401 from the platform API) and
 * the app is redirecting to login.
 *
 * Auth is cookie-based, so the client only learns the session died when a request comes
 * back 401 — by then the blades of a new page have fired their data loads. While the flag
 * is set, useAsync and ErrorInterceptor suppress those errors so the user gets one clean
 * redirect instead of a cascade of "failed to load data".
 *
 * A plain module with NO imports (same circular-dependency constraint as
 * pendingErrorNotifications.ts): read from useAsync and from the fetch interceptor.
 */

let sessionExpired = false;

/**
 * Mark the session expired. Called by the fetch interceptor on the first 401 that kills
 * a live session. Idempotent; the interceptor reads the flag back as an "already handling
 * it" latch so concurrent 401s do not stack up sign-outs, redirects and toasts.
 */
export function markSessionExpired(): void {
  sessionExpired = true;
}

/** Whether the session is currently flagged as expired (auth lost, redirect in progress). */
export function isSessionExpired(): boolean {
  return sessionExpired;
}

/**
 * Clear the expired flag. Called when a fresh sign-in begins so the next session
 * starts clean and real data-load errors surface again.
 */
export function resetSessionExpired(): void {
  sessionExpired = false;
}

/**
 * Rejection handed to callers whose request landed on the login page instead of data.
 *
 * Passing the HTML back made every caller `JSON.parse` it, so a burst produced one
 * "Unexpected token '<'" per request, burying the message that explains it.
 *
 * Detect by `name`, not `instanceof`: Module Federation duplicates this module per
 * bundle, so the class identity is not shared across remotes.
 */
export class SessionExpiredError extends Error {
  constructor(message = "The session has expired, so this request was not completed.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}
