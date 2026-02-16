import { computed } from "vue";
import type { MaybeRefOrGetter } from "vue";
import { toValue } from "vue";
import { useRoute } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";

/**
 * Strip the tenant prefix from a route path for comparison with menu URLs.
 * Route paths may include a tenant prefix (e.g., "/583818f7.../products")
 * while menu item URLs don't (e.g., "/products").
 */
export function stripTenantPrefix(route: RouteLocationNormalizedLoaded): string {
  const firstParam = Object.values(route.params)?.[0];
  const tenant = typeof firstParam === "string" ? firstParam : "";
  if (tenant && route.path.startsWith(`/${tenant}/`)) {
    return route.path.slice(tenant.length + 1);
  }
  if (tenant && route.path === `/${tenant}`) {
    return "/";
  }
  return route.path;
}

/**
 * Reactive route-based active detection for menu items.
 *
 * Uses `computed` over `route.path` so it stays reactive when the route changes.
 * Supports exact match and prefix match (e.g., `/products` matches `/products/edit/123`).
 */
export function useMenuActiveState(url: MaybeRefOrGetter<string | undefined>) {
  const route = useRoute();

  const isActive = computed(() => {
    const urlValue = toValue(url);
    if (!urlValue) return false;
    const path = stripTenantPrefix(route);
    return path === urlValue || path.startsWith(urlValue + "/");
  });

  return { isActive };
}
