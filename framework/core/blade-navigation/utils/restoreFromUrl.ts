import type { Router } from "vue-router";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import type { IBladeStack, ParsedBladeUrl } from "@core/blade-navigation/types";
import { navigateToMainRoute } from "./navigateToMainRoute";
import { notification } from "@core/notifications/notification";
import { i18n } from "@core/plugins";

/**
 * Restore the blade stack from a parsed URL.
 *
 * Used on initial page load and when navigating via URL (not back/forward).
 * Resolves URL segments to blade names via BladeRegistry, then opens
 * workspace + child blade.
 *
 * Returns `true` if the URL contained segments for a non-routable blade
 * that was skipped — the caller should clean up the URL to match the
 * actual blade stack state.
 *
 * @param bladeStack - The BladeStack to populate
 * @param bladeRegistry - Registry for resolving URLs → blade names
 * @param parsed - Parsed URL segments
 * @param hasAccess - Optional permission check function
 * @param router - Optional router for redirecting on access denial
 * @param routeParams - Route params to preserve on redirect (e.g. sellerId for tenant prefix)
 * @returns `true` if the URL needs cleanup (non-routable blade was skipped)
 */
export async function restoreFromUrl(
  bladeStack: IBladeStack,
  bladeRegistry: IBladeRegistry,
  parsed: ParsedBladeUrl,
  hasAccess?: (permissions: string | string[] | undefined) => boolean,
  router?: Router,
  routeParams?: Record<string, string>,
): Promise<boolean> {
  // Skip if no workspace URL to restore
  if (!parsed.workspaceUrl) return false;

  // Find workspace blade by URL segment
  const workspaceMatch = bladeRegistry.getBladeByRoute(parsed.workspaceUrl);

  // Guard 1: blade not found
  if (!workspaceMatch) {
    console.warn(`[restoreFromUrl] No workspace blade found for URL segment '${parsed.workspaceUrl}'`);
    if (router) navigateToMainRoute(router, routeParams);
    return false;
  }

  // Guard 2: not a workspace
  if (!workspaceMatch.data.isWorkspace) {
    console.warn(
      `[restoreFromUrl] Blade '${workspaceMatch.name}' matched URL '${parsed.workspaceUrl}' but is not a workspace`,
    );
    if (router) navigateToMainRoute(router, routeParams);
    return false;
  }

  // Guard 3: permissions
  // Note: openWorkspace() also checks permissions as a safety net (defense-in-depth),
  // but we check here first to redirect and show toast before the workspace is opened.
  if (hasAccess && workspaceMatch.data.permissions && !hasAccess(workspaceMatch.data.permissions)) {
    console.warn(`[restoreFromUrl] Access denied to workspace '${workspaceMatch.name}'`);
    notification.error(i18n.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), { timeout: 3000 });
    if (router) navigateToMainRoute(router, routeParams);
    return false;
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
      // Idempotency: skip if child already exists with same name and param.
      // This means the blade was opened programmatically (normal operation)
      // and syncUrlPush just triggered the guard — not a page restore.
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
