import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";
import type { Ref } from "vue";
import type { AuthState } from "@core/composables/useUser";

export interface AuthGuardDeps {
  /** What the app knows about the session — see AuthState. */
  authState: Readonly<Ref<AuthState>>;
  /** Asks the platform for the current user; deduplicated with a load already in flight. */
  loadUser: () => Promise<unknown>;
  /** Called when the session still cannot be checked; the guard then cancels the navigation. */
  onSessionCheckFailed: () => void;
}

/**
 * Result of the auth guard: `undefined` allows the navigation, `false` cancels it (the session could
 * not be checked), and a location redirects to Login.
 */
export type AuthGuardResult = undefined | false | RouteLocationRaw;

/**
 * The root-route auth guard.
 *
 * Only a definitive "not signed in" (`anonymous`) leads to Login. While the session is `unknown` —
 * the start-up load has not answered yet, or failed with a 5xx / dropped connection — the user is
 * asked for once more; if the platform still gives no answer, the navigation is cancelled and the
 * failure reported, and the session is left alone. Treating a failed load as "not signed in" is what
 * ended live sessions on a server blip (VM-1829); the platform's admin UI draws the same line.
 */
export async function authGuard(to: RouteLocationNormalized, deps: AuthGuardDeps): Promise<AuthGuardResult> {
  if (to.meta.root !== true) return undefined;

  if (deps.authState.value === "unknown") {
    await deps.loadUser();
  }

  if (deps.authState.value === "unknown") {
    deps.onSessionCheckFailed();
    return false;
  }

  if (deps.authState.value === "anonymous") {
    localStorage.setItem("redirectAfterLogin", to.fullPath);
    return { name: "Login" };
  }

  return undefined;
}
