import { Router } from "vue-router";
import { useUserManagement } from "@core/composables/useUserManagement";
import { notification } from "@core/notifications/notification";
import { createLogger } from "@core/utilities";
import { i18n } from "@core/plugins/i18n";
import { isSessionExpired, markSessionExpired, SessionExpiredError } from "@core/utilities/sessionExpiration";
import { useSlowNetworkDetection } from "@core/composables/useSlowNetworkDetection";

const logger = createLogger("interceptors");

// Paths a platform redirects an unauthenticated request to.
const LOGIN_PATH_PATTERN = /(^|\/)(login|signin|sign-in|account\/login|connect\/authorize)(\/|$)/i;

/**
 * Detects a dead session that no status code reveals.
 *
 * Some platforms answer an unauthenticated API call with a redirect to the login page.
 * `fetch` follows it, so the interceptor sees a 200 carrying HTML and the caller parses
 * a login page as data.
 *
 * HTML alone is not the signal — an endpoint may legitimately serve a template. It counts
 * only when the request was also redirected away, or the final URL is login-shaped.
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

      function isSameOrigin(input: RequestInfo | URL): boolean {
        const raw = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();

        try {
          return new URL(raw, window.location.origin).origin === window.location.origin;
        } catch {
          return false;
        }
      }

      /**
       * Act on a response that says the session is gone.
       *
       * Flagging a 401 before it reaches the caller suppresses the data-load errors it
       * would trigger in favour of one redirect to login. The flag doubles as an
       * "already handling it" latch, so concurrent 401s sign out and redirect once.
       * Not set when signed out: a 401 we do not act on must not silence the app.
       * 403 is excluded — authenticated-but-unauthorized is not an expired session.
       */
      function handleSessionDeath(sessionDied: boolean): void {
        if (!sessionDied || isSessionExpired() || !isAuthenticated.value) return;

        markSessionExpired();

        signOut()
          .catch((err) => {
            logger.error("signOut failed after session expiry:", err);
          })
          .finally(() => {
            redirect(router);
            notification.error(i18n.global.t("CORE.ERRORS.SESSION_EXPIRED"));
          });
      }

      // Timeout, offline and slow-request handling stay scoped to the platform API.
      // A dead session does not: the cookie is global, and SignalR negotiates against
      // /pushNotificationHub, so its 401 arrives outside /api/ — and when the API
      // answers the same dead session with a 403 that hub 401 is the only signal there
      // is. The login-page heuristic below stays API-only: a non-API same-origin
      // request may serve HTML legitimately.
      if (!isApiRequest(resource)) {
        if (!isSameOrigin(resource)) {
          return originalFetch(...args);
        }
        const response = await originalFetch(...args);
        handleSessionDeath(response.status === 401);
        return response;
      }

      if (!navigator.onLine) {
        logger.warn("Request blocked: browser is offline", resource);
        return Promise.reject(new Error(i18n.global.t("CORE.ERRORS.NETWORK_UNAVAILABLE")));
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

        const isLoginPageResponse = response.ok && looksLikeLoginPage(response);
        handleSessionDeath(response.status === 401 || isLoginPageResponse);

        // A 200 carrying the login page would be parsed as data, and on a burst every
        // request raised its own "Unexpected token '<'" instead of the one message that
        // explains it (VCST-5688). Failing them all with the same error is the honest
        // answer. Gated on the expiry flag so a login page before sign-in stays valid.
        // A 401 passes through: its body is not a document and callers may branch on it.
        if (isLoginPageResponse && isSessionExpired()) {
          throw new SessionExpiredError();
        }

        return response;
      } catch (e) {
        if (didTimeout) {
          throw new Error(i18n.global.t("CORE.ERRORS.REQUEST_TIMED_OUT"));
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
