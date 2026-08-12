import { Router } from "vue-router";
import { useUserManagement } from "@core/composables/useUserManagement";
import { notification } from "@core/notifications/notification";
import { createLogger } from "@core/utilities";
import { isSessionExpired, markSessionExpired, SessionExpiredError } from "@core/utilities/sessionExpiration";
import { useSlowNetworkDetection } from "@core/composables/useSlowNetworkDetection";

const logger = createLogger("interceptors");

// Paths a platform redirects an unauthenticated request to.
const LOGIN_PATH_PATTERN = /(^|\/)(login|signin|sign-in|account\/login|connect\/authorize)(\/|$)/i;

/**
 * Detects a dead session that no status code reveals.
 *
 * Some platform configurations answer an unauthenticated API call with a redirect
 * to the login page instead of a 401. `fetch` follows that redirect transparently,
 * so the interceptor sees a 200 carrying HTML: the caller then parses a login page
 * as data and the UI silently renders "nothing found" while the session is gone.
 *
 * HTML alone is not the signal — an endpoint may legitimately serve a rendered
 * template or an export. It counts only when the request was also redirected away
 * from the endpoint that was asked. A login-shaped final URL is conclusive on its
 * own, for platforms that omit the content type.
 */
function looksLikeLoginPage(response: Response): boolean {
  let pathname: string;
  try {
    pathname = new URL(response.url, window.location.origin).pathname;
  } catch {
    return false;
  }

  if (LOGIN_PATH_PATTERN.test(pathname)) {
    return true;
  }

  const contentType = response.headers?.get?.("content-type") ?? "";
  return response.redirected === true && contentType.includes("text/html");
}

type PatchedFetch = typeof window.fetch & { __vcInterceptorsInstalled__?: true };

export function registerInterceptors(router: Router) {
  // Idempotency guard: a second install would wrap the already-wrapped fetch,
  // stacking timeouts, duplicate 401 sign-outs and slow-network tracking.
  // A brand on the function survives module reloads (HMR / test workers) while
  // living only within this tab.
  const existing = window.fetch as PatchedFetch;
  if (existing.__vcInterceptorsInstalled__) {
    logger.warn("registerInterceptors called twice — ignoring second install");
    return window.fetch;
  }

  const { fetch: originalFetch } = window;
  const { signOut, isAuthenticated } = useUserManagement();
  const { trackRequest, untrackRequest } = useSlowNetworkDetection();
  let requestCounter = 0;

  const patched = (async (...args: Parameters<typeof window.fetch>) => {
    /**
     * Overrides the global `fetch` function to handle API calls in demo mode.
     * If `window.__DEMO_MODE__` is true, the fetch is cancelled and a warning is logged.
     * Otherwise, the original `fetch` function is called.
     * @param args - The arguments passed to the `fetch` function.
     * @returns A promise that resolves to the response from the API call.
     */
    if (window.__DEMO_MODE__) {
      logger.warn("CANCELLED FETCH WHILE IN __DEMO_MODE__: ", ...args);
      logger.warn("Please logout and add APP_PLATFORM_URL into .env file of your application to enable API calls");
      return new Promise((resolve: any) => {
        /**
         * This conditions are mocking login, currentuser API calls for demo purposes.
         */
        if (args[0] === "/api/platform/security/login") {
          resolve({
            status: 200,
            text: async () => JSON.stringify({ succeeded: true }),
          });
        } else if (args[0] === "/api/platform/security/currentuser") {
          notification.warning(
            "You are currently in DEMO mode until the first page refresh. \n All API calls are disabled. Please add APP_PLATFORM_URL to your application's .env file to enable API calls.",
            {
              timeout: 10000,
            },
          );
          resolve({
            status: 200,
            text: async () => JSON.stringify({ id: "demo_user_id", userName: "DEMO_USER" }),
          });
        } else {
          resolve({
            status: 200,
            text: async () => JSON.stringify({}),
          });
        }
      });
    } else {
      const [resource, init] = args;

      function isApiRequest(input: RequestInfo | URL): boolean {
        const raw = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();

        try {
          const url = new URL(raw, window.location.origin);
          return url.origin === window.location.origin && url.pathname.startsWith("/api/");
        } catch {
          return false;
        }
      }

      // Scope hardening only to platform API calls
      if (!isApiRequest(resource)) {
        return originalFetch(...args);
      }

      if (!navigator.onLine) {
        logger.warn("Request blocked: browser is offline", resource);
        return Promise.reject(new Error("Network unavailable. Please check your connection."));
      }

      const requestId = String(++requestCounter);
      trackRequest(requestId);

      // Always enforce timeout, but preserve external cancellation semantics
      const controller = new AbortController();
      let didTimeout = false;
      const timeoutId = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, 30000);

      const externalSignal = init?.signal;
      const abortFromExternal = () => controller.abort();
      if (externalSignal?.aborted) {
        abortFromExternal();
      } else if (externalSignal) {
        externalSignal.addEventListener("abort", abortFromExternal, { once: true });
      }

      try {
        const response = await originalFetch(resource, {
          ...(init || {}),
          signal: controller.signal,
        });

        /**
         * If the response is unauthorized, logout the user
         */
        // A 401 on a session we still believe is alive means the cookie died under us.
        // Flag it before returning the 401 to the caller, so the data-load errors it
        // triggers (blade banners + toasts on the page that was mid-navigation) are
        // suppressed in favour of a single clean redirect to login.
        //
        // The flag doubles as an "already handling it" latch: concurrent 401s from the
        // same dead session are suppressed by it but skip this branch, so sign-out,
        // redirect and toast happen exactly once. It is deliberately not set when we
        // are not signed in — a 401 we don't act on must not silence the whole app.
        // A 401 is the explicit signal; a successful response that is actually the
        // login page is the same death reported differently (see looksLikeLoginPage).
        // A 403 is deliberately excluded — authenticated-but-unauthorized is not an
        // expired session, and signing the user out over it would be wrong.
        const isLoginPageResponse = response.ok && looksLikeLoginPage(response);
        const sessionDied = response.status === 401 || isLoginPageResponse;

        if (sessionDied && !isSessionExpired() && isAuthenticated.value) {
          markSessionExpired();

          signOut()
            .catch((err) => {
              logger.error("signOut failed after session expiry:", err);
            })
            .finally(() => {
              redirect(router);
              notification.error(
                "Access Denied: Your session has expired or you do not have the necessary permissions.\nPlease log in again or contact the administrator for assistance.",
              );
            });
        }

        // A 200 that is really the login page must not reach the caller — it would be parsed
        // as data. On a concurrent burst every request then raised its own
        // "Unexpected token '<', "<!DOCTYPE "..." on a page already redirecting to login,
        // burying the one message that says what happened (VCST-5688). Failing the request is
        // the honest answer: it returned no data. All of them fail with the same error, so a
        // consumer that does surface it shows one message, not one per request.
        //
        // Gated on the expiry flag, which the branch above has just set for the first response
        // of the burst: while nobody is signed in a login page is an expected answer, not a
        // session death, and failing those requests would break the pre-auth flow.
        //
        // A 401 is still returned unchanged: its body is not a document, so nothing tries to
        // parse markup, and callers may legitimately branch on the status themselves.
        if (isLoginPageResponse && isSessionExpired()) {
          throw new SessionExpiredError();
        }

        return response;
      } catch (e) {
        if (didTimeout) {
          throw new Error("Request timed out. Please try again.");
        }
        throw e;
      } finally {
        untrackRequest(requestId);
        clearTimeout(timeoutId);
        if (externalSignal) {
          externalSignal.removeEventListener("abort", abortFromExternal);
        }
      }
    }
  }) as PatchedFetch;

  patched.__vcInterceptorsInstalled__ = true;
  window.fetch = patched;
  return patched;
}

function redirect(router: Router) {
  // redirect to login page if it exists
  if (router && router.getRoutes().some((route) => route.path === "/login" || route.name === "Login")) {
    if (router.currentRoute.value.path !== "/login") {
      router.push("/login");
    }
  } else {
    // Use the origin to redirect to the root of the application if no login page exists.
    // Usually this is the case when the application is used as a module.
    window.location.href = window.location.origin + "/";
  }
}
