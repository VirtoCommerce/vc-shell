/**
 * The path the login page returns to after sign-in: a deep link that needed a session
 * (authGuard) or the page a session expired on (fetch interceptor).
 *
 * Kept in sessionStorage, not localStorage: the path belongs to the tab that lost its
 * session. In localStorage it outlived the tab, so a later sign-in, days on or in another
 * tab, landed on a page the user never asked for.
 */

const KEY = "redirectAfterLogin";

export function rememberRedirectAfterLogin(path: string): void {
  sessionStorage.setItem(KEY, path);
}

/** Returns the remembered path once, then forgets it. */
export function takeRedirectAfterLogin(): string | null {
  const path = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  return path;
}
