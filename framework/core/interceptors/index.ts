import { Router } from "vue-router";
import { useUser } from "../composables/useUser";

export function registerInterceptors(router: Router) {
  const { fetch } = window;
  const { signOut, isAuthenticated } = useUser();

  window.fetch = async (...args) => {
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
  };

  return window.fetch;
}
