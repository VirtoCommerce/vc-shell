import { Router } from "vue-router";
import { notification } from "../../shared";
import { IAuthProvider } from "../types/auth-provider";

export function registerInterceptors(router: Router, authProvider: IAuthProvider) {
  const { fetch: originalFetch } = window;

  window.fetch = async (...args) => {
    /**
     * Intercepts fetch requests to handle authentication errors.
     * Note: Demo mode should be handled by the auth provider itself, not by global interceptors.
     */
    const response = await originalFetch(...args);

    /**
     * If the response is unauthorized, logout the user
     */
    if (response.status === 401) {
      //logout user
      if (authProvider.isAuthenticated.value) {
        authProvider.signOut().then(() => {
          redirect(router);
          notification.error(
            "Access Denied: Your session has expired or you do not have the necessary permissions.\nPlease log in again or contact the administrator for assistance.",
          );
        });
      }
    }

    return response;
  };

  return window.fetch;
}

function redirect(router: Router) {
  // redirect to login page if it exists
  if (router && router.getRoutes().some((route) => route.path === "/login" || route.name === "Login")) {
    router.currentRoute.value.path !== "/login" && router.push("/login");
  } else {
    // Use the origin to redirect to the root of the application if no login page exists.
    // Usually this is the case when the application is used as a module.
    window.location.href = window.location.origin + "/";
  }
}
