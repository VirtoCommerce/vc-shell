import { Router } from "vue-router";
import { useUserManagement } from "@core/composables/useUserManagement";
import { notification } from "@core/notifications/notification";
import { createLogger } from "@core/utilities";
import { useSlowNetworkDetection } from "@core/composables/useSlowNetworkDetection";

const logger = createLogger("interceptors");

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
        if (response.status === 401) {
          if (isAuthenticated.value) {
            signOut()
              .catch((err) => {
                logger.error("signOut failed after 401:", err);
              })
              .finally(() => {
                redirect(router);
                notification.error(
                  "Access Denied: Your session has expired or you do not have the necessary permissions.\nPlease log in again or contact the administrator for assistance.",
                );
              });
          }
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
