import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import type { IBladeStack, ParsedBladeUrl } from "@shared/components/blade-navigation/types";

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
 * @returns `true` if the URL needs cleanup (non-routable blade was skipped)
 */
export async function restoreFromUrl(
  bladeStack: IBladeStack,
  bladeRegistry: IBladeRegistry,
  parsed: ParsedBladeUrl,
): Promise<boolean> {
  // Skip if no workspace URL to restore
  if (!parsed.workspaceUrl) return false;

  // Find workspace blade by URL segment
  const workspaceMatch = bladeRegistry.getBladeByRoute(parsed.workspaceUrl);
  if (!workspaceMatch) {
    console.warn(
      `[restoreFromUrl] No workspace blade found for URL segment '${parsed.workspaceUrl}'`,
    );
    return false;
  }

  // Check if workspace is actually marked as workspace
  if (!workspaceMatch.data.isWorkspace) {
    console.warn(
      `[restoreFromUrl] Blade '${workspaceMatch.name}' matched URL '${parsed.workspaceUrl}' but is not a workspace`,
    );
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
      const existingChild = bladeStack.blades.value.find(
        (b) => b.name === bladeMatch.name && b.param === parsed.param,
      );
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
      console.warn(
        `[restoreFromUrl] No blade found for URL segment '${parsed.bladeUrl}'`,
      );
    }
  }

  return false;
}
