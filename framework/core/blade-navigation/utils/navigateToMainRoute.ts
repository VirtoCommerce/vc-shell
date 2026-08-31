import type { RouteRecordNormalized, Router } from "vue-router";

/**
 * Resolve the application's main (root) route — the one marked `meta.root`,
 * preferring its alias when one exists.
 *
 * Returns `undefined` when no route declares `meta.root`. The alias lookup is
 * deliberately guarded on that: with `mainRoute` undefined the predicate reads
 * `r.aliasOf?.path === undefined`, which is true for every route without an
 * alias, so `find` would hand back whatever was registered first — Login, on a
 * typical app.
 */
export function resolveMainRoute(router: Router): RouteRecordNormalized | undefined {
  const routes = router.getRoutes();
  const mainRoute = routes.find((r) => r.meta?.root);
  if (!mainRoute) return undefined;
  return routes.find((r) => r.aliasOf?.path === mainRoute.path) ?? mainRoute;
}

/**
 * Navigate to the application's main (root) route.
 *
 * Uses `router.replace()` to avoid adding a history entry.
 */
export function navigateToMainRoute(router: Router, params?: Record<string, string>): void {
  const mainRoute = resolveMainRoute(router);
  if (mainRoute?.name) {
    router.replace({ name: mainRoute.name, params });
  }
}
