import type { Router } from "vue-router";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import type { IBladeStack, ParsedBladeUrl } from "@core/blade-navigation/types";
import { mainRouteLocation } from "./navigateToMainRoute";
import { notification } from "@core/notifications/notification";
import { i18n } from "@core/plugins";

/**
 * What the router guard does after a restore:
 * - `false` — nothing; the stack matches the URL
 * - `true` — clean the URL to match the stack (a non-routable blade was skipped)
 * - a location — redirect there: the URL can't be opened and the main route is shown instead
 */
export type RestoreFromUrlResult = boolean | { path: string; replace: true };

/**
 * Restore the blade stack from a parsed URL.
 *
 * Used on initial page load and when navigating via URL (not back/forward).
 * Resolves URL segments to blade names via BladeRegistry, then opens
 * workspace + child blade.
 *
 * Runs inside a navigation guard, so it never navigates itself: a URL it can't open
 * (no blade, not a workspace, no access) comes back as a redirect to the main route
 * for the guard to return. A navigation started from inside the guard would cancel the
 * one in progress, and when it resolved to the current route Vue Router would skip it as
 * a duplicate, leaving the bad URL in the address bar.
 *
 * @param bladeStack - The BladeStack to populate
 * @param bladeRegistry - Registry for resolving URLs → blade names
 * @param parsed - Parsed URL segments
 * @param hasAccess - Optional permission check function
 * @param router - Optional router to resolve the main route's location for the redirect
 * @param routeParams - Route params to preserve on redirect (e.g. sellerId for tenant prefix)
 * @returns `true` if the URL needs cleanup (non-routable blade was skipped), a location to redirect to
 *   if the URL can't be opened, `false` otherwise
 */
export async function restoreFromUrl(
  bladeStack: IBladeStack,
  bladeRegistry: IBladeRegistry,
  parsed: ParsedBladeUrl,
  hasAccess?: (permissions: string | string[] | undefined) => boolean,
  router?: Router,
  routeParams?: Record<string, string>,
): Promise<RestoreFromUrlResult> {
  // Skip if no workspace URL to restore
  if (!parsed.workspaceUrl) return false;

  const toMainRoute = (): RestoreFromUrlResult => {
    const location = router && mainRouteLocation(router, routeParams);
    return location ? { ...location, replace: true } : false;
  };

  // Find workspace blade by URL segment
  const workspaceMatch = bladeRegistry.getBladeByRoute(parsed.workspaceUrl);

  // Guard 1: blade not found
  if (!workspaceMatch) {
    console.warn(`[restoreFromUrl] No workspace blade found for URL segment '${parsed.workspaceUrl}'`);
    return toMainRoute();
  }

  // Guard 2: not a workspace
  if (!workspaceMatch.data.isWorkspace) {
    console.warn(
      `[restoreFromUrl] Blade '${workspaceMatch.name}' matched URL '${parsed.workspaceUrl}' but is not a workspace`,
    );
    return toMainRoute();
  }

  // Guard 3: permissions
  // Note: openWorkspace() also checks permissions as a safety net (defense-in-depth),
  // but we check here first to redirect and show toast before the workspace is opened.
  if (hasAccess && workspaceMatch.data.permissions && !hasAccess(workspaceMatch.data.permissions)) {
    console.warn(`[restoreFromUrl] Access denied to workspace '${workspaceMatch.name}'`);
    notification.error(i18n.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), { timeout: 3000 });
    return toMainRoute();
  }

  // Open workspace (if not already the current one)
  const currentWorkspace = bladeStack.workspace.value;
  if (currentWorkspace?.name !== workspaceMatch.name) {
    await bladeStack.openWorkspace({ name: workspaceMatch.name });
  }

  // If there's a child blade URL, open it (if not already open with matching param)
  if (parsed.bladeUrl) {
    const bladeMatch = bladeRegistry.getBladeByRoute(parsed.bladeUrl);
    if (bladeMatch) {
      // Skip a child already open with the same name and param. The guard runs on every
      // catch-all navigation, including back/forward to a URL the stack already matches,
      // and `openBlade` has no same-target no-op of its own, so this would stack a
      // duplicate.
      const existingChild = bladeStack.blades.value.find((b) => b.name === bladeMatch.name && b.param === parsed.param);
      if (existingChild) {
        return false;
      }

      // Non-routable blades should not be restored from URL.
      // Signal the caller to clean the URL.
      if (bladeMatch.data.routable === false) {
        return true;
      }

      await bladeStack.openBlade({
        name: bladeMatch.name,
        param: parsed.param,
        // options not available from URL — blade must handle gracefully
      });
    } else {
      console.warn(`[restoreFromUrl] No blade found for URL segment '${parsed.bladeUrl}'`);
    }
  }

  return false;
}
