/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "vue-router";
import { useUser } from "../composables/useUser";
import { notification } from "../../shared";

export function registerInterceptors(router: Router) {
  const { fetch } = window;
  const { signOut, isAuthenticated } = useUser();

  window.fetch = async (...args) => {
    /**
     * Overrides the global `fetch` function to handle API calls in demo mode.
     * If `window.__DEMO_MODE__` is true, the fetch is cancelled and a warning is logged.
     * Otherwise, the original `fetch` function is called.
     * @param args - The arguments passed to the `fetch` function.
     * @returns A promise that resolves to the response from the API call.
     */
    if (window.__DEMO_MODE__) {
      console.warn("CANCELLED FETCH WHILE IN __DEMO_MODE__: ", ...args);
      console.warn("Please logout and add APP_PLATFORM_URL into .env file of your application to enable API calls");
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
            "You are currently in DEMO mode until the first page refresh. \n All API calls are disabled. Please log out and add APP_PLATFORM_URL to your application's .env file to enable API calls.",
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
      const response = await fetch(...args);

      /**
       * If the response is unauthorized, logout the user
       */
      if (response.status === 401) {
        //logout user
        if (isAuthenticated.value) {
          signOut().then(() => {
            // redirect to login page if it exists
            if (router && router.getRoutes().some((route) => route.path === "/login" || route.name === "Login")) {
              router.currentRoute.value.path !== "/login" && router.push("/login");
            } else {
              // Use the origin to redirect to the root of the application if no login page exists.
              // Usually this is the case when the application is used as a module.
              window.location.href = window.location.origin + "/";
            }
          });
        }
      }

      return response;
    }
  };

  return window.fetch;
}
