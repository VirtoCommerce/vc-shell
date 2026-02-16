import { Router } from "vue-router";
import { App } from "vue";
import * as components from "./components";
import { BladeNavigationPlugin, BladeStackKey, BladeMessagingKey } from "./types";
import { createBladeStack } from "./composables/useBladeStack";
import { createBladeMessaging } from "./composables/useBladeMessaging";
import { parseBladeUrl, buildUrlFromStack } from "./utils/urlSync";
import { restoreFromUrl } from "./utils/restoreFromUrl";
import { useBladeRegistry } from "../../../core/composables/useBladeRegistry";
import type { IBladeRegistry } from "../../../core/composables/useBladeRegistry";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcBladeNavigation: (typeof components)["VcBladeNavigation"];
  }
}

// Keep legacy global reference for backward compatibility
export let bladeNavigationInstance: BladeNavigationPlugin;

// Module-level singletons — accessible without inject() (for use in route guards, adapters, etc.)
// These are set once during plugin install and persist for the app's lifetime.
// Limitation: only one Vue app per JS context is supported.
// Call _resetBladeNavigationSingletons() in test teardown to prevent cross-test leaks.
import type { IBladeStack, IBladeMessaging } from "./types";
export let bladeStackInstance: IBladeStack | undefined;
export let bladeMessagingInstance: IBladeMessaging | undefined;
export let bladeRegistryInstance: IBladeRegistry | undefined;

/**
 * Reset all module-level singletons. For use in test teardown only.
 * @internal
 */
export function _resetBladeNavigationSingletons(): void {
  bladeStackInstance = undefined;
  bladeMessagingInstance = undefined;
  bladeRegistryInstance = undefined;
}

/**
 * New Blade Navigation Plugin (v2).
 *
 * Sets up:
 * - BladeStack state machine (provided via BladeStackKey)
 * - BladeMessaging for inter-blade communication (provided via BladeMessagingKey)
 * - Auto catch-all route under the root route (safety net for blade URLs)
 * - Router beforeEach guard for URL → blade stack restoration
 *
 * Vue Router serves as the URL sync layer only. BladeStack is the source of truth.
 * Back/forward is handled natively by Vue Router — beforeEach fires on popstate
 * and restores BladeStack from the URL.
 */
export const VcBladeNavigationComponent = {
  install(app: App, args: { router: Router }) {
    const { router } = args;

    // ── Register UI components ──────────────────────────────────────────────
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    // ── Legacy backward compatibility ───────────────────────────────────────
    const bladeNavigationPluginData: BladeNavigationPlugin = {
      router: args.router,
    };
    bladeNavigationInstance = bladeNavigationPluginData;
    app.provide("bladeNavigationPlugin", bladeNavigationPluginData);

    // ── New BladeStack system ───────────────────────────────────────────────

    // BladeRegistry must already be provided by the main app setup (framework/index.ts)
    const bladeRegistry = app.runWithContext(() => {
      try {
        return useBladeRegistry();
      } catch {
        console.warn(
          "[BladeNavigationPlugin] BladeRegistry not yet available. " +
          "BladeStack will be created but URL restoration may be deferred.",
        );
        return undefined;
      }
    }) as IBladeRegistry | undefined;

    if (!bladeRegistry) {
      console.error("[BladeNavigationPlugin] BladeRegistry is required but not found.");
      return;
    }

    // Create BladeStack
    const bladeStack = createBladeStack(bladeRegistry);
    app.provide(BladeStackKey, bladeStack);
    bladeStackInstance = bladeStack;

    // Create BladeMessaging
    const messaging = createBladeMessaging(bladeStack);
    app.provide(BladeMessagingKey, messaging);
    bladeMessagingInstance = messaging;
    bladeRegistryInstance = bladeRegistry;

    // ── Auto-register catch-all route ───────────────────────────────────────
    // Safety net: prevents Vue Router "route not found" errors for blade URLs
    // in hash mode. BladeStack handles actual rendering.
    const mainRoute = router.getRoutes().find((r) => r.meta?.root);
    if (mainRoute) {
      router.addRoute(mainRoute.name as string, {
        path: ":pathMatch(.*)*",
        component: { render: () => null },
      });
    }

    // ── Router guard for URL → blade stack restoration ──────────────────────
    // Fires on: direct URL entry, deep links, back/forward (popstate)
    // The adapter's router.push()/replace() also triggers this, but
    // restoreFromUrl is idempotent — if stack already matches URL, it's a no-op.
    router.beforeEach(async (to) => {
      // Only process routes under the root (App) route
      if (!to.matched.some((r) => r.meta?.root)) return;

      // Extract tenant prefix from route params (first param, typically sellerId)
      const tenantPrefix = (Object.values(to.params)?.[0] as string) || "";

      // Parse the URL path into blade segments
      const parsed = parseBladeUrl(to.path, tenantPrefix);

      if (!parsed.workspaceUrl) {
        // No workspace in URL (e.g. Dashboard at "/") — clear any existing blade stack
        if (bladeStack.blades.value.length > 0) {
          bladeStack._restoreStack([]);
        }
        return;
      }

      // Restore blade stack from URL (idempotent — skips if already matching)
      const needsUrlCleanup = await restoreFromUrl(bladeStack, bladeRegistry, parsed);

      // If a non-routable blade was in the URL, clean up to match actual stack
      if (needsUrlCleanup) {
        const { path, query } = buildUrlFromStack(tenantPrefix, bladeStack.blades.value);
        return { path, query, replace: true };
      }
    });
  },
};
