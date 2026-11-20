import type { RouteRecordNormalized, Router } from "vue-router";

/**
 * Resolve the application's main route — the one marked `meta.root` — preferring its alias.
 *
 * Returns `undefined` when no route declares `meta.root`. The alias lookup is guarded on
 * that: with `mainRoute` undefined the predicate reads `r.aliasOf?.path === undefined`,
 * true for every route without an alias, so `find` would return whatever registered first.
 */
export function resolveMainRoute(router: Router): RouteRecordNormalized | undefined {
  const routes = router.getRoutes();
  const mainRoute = routes.find((r) => r.meta?.root);
  if (!mainRoute) return undefined;
  return routes.find((r) => r.aliasOf?.path === mainRoute.path) ?? mainRoute;
}

/**
 * The location of the application's main route, by path, with its params (tenant prefix) filled in.
 *
 * By path, not by name: navigating to a route by name matches only that record, not its
 * empty-path child, so an app whose main route renders its default page as such a child
 * (`children: [{ path: "", ... }]`) would be left with an empty page.
 *
 * Returns `undefined` when no route declares `meta.root`.
 */
export function mainRouteLocation(router: Router, params?: Record<string, string>): { path: string } | undefined {
  const mainRoute = resolveMainRoute(router);
  if (!mainRoute?.name) return undefined;
  return { path: router.resolve({ name: mainRoute.name, params }).path };
}

/**
 * Navigate to the application's main (root) route.
 *
 * Uses `router.replace()` to avoid adding a history entry. Not for use inside a navigation
 * guard: a guard returns `mainRouteLocation()` instead.
 */
export function navigateToMainRoute(router: Router, params?: Record<string, string>): void {
  const location = mainRouteLocation(router, params);
  if (location) {
    router.replace(location);
  }
}
