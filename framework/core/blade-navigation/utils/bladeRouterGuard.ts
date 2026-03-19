import type { RouteLocationNormalized } from "vue-router";
import type { Router } from "vue-router";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import type { IBladeStack } from "@core/blade-navigation/types";
import { parseBladeUrl, buildUrlFromStack } from "@core/blade-navigation/utils/urlSync";
import { restoreFromUrl } from "@core/blade-navigation/utils/restoreFromUrl";

/**
 * Result of the blade router guard.
 *
 * - `undefined` — allow navigation (no redirect)
 * - `{ path, query, replace }` — redirect to cleaned-up URL
 */
export type BladeGuardResult =
  | undefined
  | { path: string; query: Record<string, string>; replace: true };

/**
 * Router guard that syncs URL navigation with the BladeStack.
 *
 * Determines whether a navigation target is a real Vue Router page
 * or a blade URL handled by the catch-all route:
 *
 * - **Real child routes** (e.g. "Platform", "Dashboard"): clears any open
 *   blades and lets Vue Router render the page.
 * - **Blade catch-all route**: parses URL segments and restores the
 *   blade stack (workspace + optional child blade).
 *
 * The catch-all route is identified by `meta.bladeCatchAll`, which is set
 * by the BladeNavigationPlugin when it registers the catch-all.
 */
export async function bladeRouterGuard(
  to: RouteLocationNormalized,
  bladeStack: IBladeStack,
  bladeRegistry: IBladeRegistry,
  hasAccess?: (permissions: string | string[] | undefined) => boolean,
  router?: Router,
): Promise<BladeGuardResult> {
  // Only process routes under the root (App) route
  if (!to.matched.some((r) => r.meta?.root)) return undefined;

  // Only run blade restoration when the URL matches the blade catch-all route.
  // Real Vue Router child routes (e.g. "Platform", "Dashboard") should be
  // handled by Vue Router normally — not interpreted as blade URL segments.
  const isBladeCatchAll = to.matched.some((r) => r.meta?.bladeCatchAll);
  if (!isBladeCatchAll) {
    // Clear any open blades so the page renders without stale blade state
    if (bladeStack.blades.value.length > 0) {
      bladeStack._restoreStack([]);
    }
    return undefined;
  }

  // Extract tenant prefix from route params (first param, typically sellerId)
  const tenantPrefix = (Object.values(to.params)?.[0] as string) || "";

  // Parse the URL path into blade segments
  const parsed = parseBladeUrl(to.path, tenantPrefix);

  if (!parsed.workspaceUrl) {
    // No workspace in URL (e.g. navigating to "/") — clear the blade stack.
    // The app shell renders its own default view (e.g. dashboard) when the stack is empty.
    if (bladeStack.blades.value.length > 0) {
      bladeStack._restoreStack([]);
    }
    return undefined;
  }

  // Preserve route params (e.g. sellerId) so fallback redirects keep the tenant prefix
  const routeParams = Object.fromEntries(
    Object.entries(to.params).filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;

  // Restore blade stack from URL (idempotent — skips if already matching)
  const needsUrlCleanup = await restoreFromUrl(bladeStack, bladeRegistry, parsed, hasAccess, router, routeParams);

  // If a non-routable blade was in the URL, clean up to match actual stack
  if (needsUrlCleanup) {
    const { path, query } = buildUrlFromStack(tenantPrefix, bladeStack.blades.value);
    return { path, query, replace: true };
  }

  return undefined;
}
