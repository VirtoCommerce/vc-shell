import type { Router } from "vue-router";

/**
 * Navigate to the application's main (root) route.
 *
 * Resolves the route marked with `meta.root`, preferring its alias if one exists.
 * Uses `router.replace()` to avoid adding a history entry.
 */
export function navigateToMainRoute(router: Router, params?: Record<string, string>): void {
  const routes = router.getRoutes();
  const mainRoute = routes.find((r) => r.meta?.root);
  const mainRouteAlias = routes.find((r) => r.aliasOf?.path === mainRoute?.path) ?? mainRoute;

  if (mainRouteAlias?.name) {
    router.replace({ name: mainRouteAlias.name, params });
  }
}
