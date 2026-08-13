/**
 * Shared flag signalling that the session was involuntarily invalidated — the server
 * returned 401 for a platform API call — and the app is redirecting to the login page.
 *
 * Auth is cookie-based, so the client only learns the session died when an /api/ request
 * comes back 401. By then the user may have already navigated to a new page whose blades
 * fired their data loads. Without this flag every one of those failed loads surfaces its
 * own error (blade banner + toast), burying the redirect under a cascade of
 * "failed to load data" messages. While the flag is set, useAsync and ErrorInterceptor
 * suppress those data-load errors so the user gets a single clean redirect to login.
 *
 * Kept as a plain module with NO imports (same circular-dependency constraint documented
 * in pendingErrorNotifications.ts): it is read from useAsync — reachable via the
 * @core/composables barrel — and from the fetch interceptor.
 */

let sessionExpired = false;

/**
 * Mark the session as expired. Called by the fetch interceptor on the first 401 that
 * kills a session we believed was alive. Idempotent, and the interceptor also reads the
 * flag back as an "already handling it" latch so concurrent 401s don't stack up
 * duplicate sign-outs, redirects and toasts.
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
 * The alternative was to pass the login page's HTML back, which every caller then tried to
 * `JSON.parse` — so a concurrent burst produced one "Unexpected token '<'" per request on a
 * page that was already redirecting to login, burying the message that explains what
 * happened. Failing the request is the honest answer: it returned no data.
 *
 * Detect it by `name`, not `instanceof`: this module is duplicated per bundle in a Module
 * Federation setup, so the class identity is not shared across remotes.
 */
export class SessionExpiredError extends Error {
  constructor(message = "The session has expired, so this request was not completed.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}
