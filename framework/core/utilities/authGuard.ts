import type { ComputedRef } from "vue";
import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";

interface UserManagement {
  isAuthenticated: ComputedRef<boolean>;
  loadUser: () => Promise<unknown>;
}

/**
 * Sends an unauthenticated visitor of the app's root routes to the login page.
 *
 * "No user held" is not "not signed in": `loadUser()` swallows its errors, so one 5xx or dropped
 * connection while the app starts leaves no user behind a live session cookie. The user is loaded
 * once more before deciding — deduplicated with a load already in flight — and only a visitor the
 * server still does not know is sent to log in.
 */
export async function requireAuthentication(
  to: RouteLocationNormalized,
  { isAuthenticated, loadUser }: UserManagement,
): Promise<RouteLocationRaw | undefined> {
  if (to.meta.root !== true) return undefined;

  try {
    if (!isAuthenticated.value) await loadUser();
    if (isAuthenticated.value) return undefined;
  } catch (_e) {
    // Falls through to the login page, as a failed check always has.
  }

  localStorage.setItem("redirectAfterLogin", to.fullPath);
  return { name: "Login" };
}
