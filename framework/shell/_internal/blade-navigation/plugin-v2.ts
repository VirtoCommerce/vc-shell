import { Router } from "vue-router";
import { App } from "vue";
import * as components from "@shell/_internal/blade-navigation/components";
import { BladeNavigationPlugin, BladeStackKey, BladeMessagingKey } from "@core/blade-navigation/types";
import { createBladeStack } from "@core/blade-navigation/useBladeStack";
import { createBladeMessaging } from "@core/blade-navigation/useBladeMessaging";
import { bladeRouterGuard } from "@core/blade-navigation/utils/bladeRouterGuard";
import { useBladeRegistry } from "@core/composables/useBladeRegistry";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import { usePermissions } from "@core/composables/usePermissions";
import {
  setBladeNavigationInstance,
  setBladeStackInstance,
  setBladeMessagingInstance,
  setBladeRegistryInstance,
} from "@core/blade-navigation/singletons";

// Re-export singletons for backward compatibility
export {
  bladeNavigationInstance,
  bladeStackInstance,
  bladeMessagingInstance,
  bladeRegistryInstance,
  _resetBladeNavigationSingletons,
} from "@core/blade-navigation/singletons";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcBladeNavigation: (typeof components)["VcBladeNavigation"];
  }
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
    setBladeNavigationInstance(bladeNavigationPluginData);

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

    // Get permission checker for workspace access control
    const { hasAccess } = app.runWithContext(() => usePermissions());

    // Create BladeStack with permission enforcement
    const bladeStack = createBladeStack(bladeRegistry, hasAccess);
    app.provide(BladeStackKey, bladeStack);
    setBladeStackInstance(bladeStack);

    // Create BladeMessaging
    const messaging = createBladeMessaging(bladeStack);
    app.provide(BladeMessagingKey, messaging);
    setBladeMessagingInstance(messaging);
    setBladeRegistryInstance(bladeRegistry!);

    // ── Auto-register catch-all route ───────────────────────────────────────
    // Safety net: prevents Vue Router "route not found" errors for blade URLs
    // in hash mode. BladeStack handles actual rendering.
    const mainRoute = router.getRoutes().find((r) => r.meta?.root);
    if (mainRoute) {
      router.addRoute(mainRoute.name as string, {
        path: ":pathMatch(.*)*",
        component: { render: () => null },
        meta: { bladeCatchAll: true },
      });
    }

    // ── Router guard for URL → blade stack restoration ──────────────────────
    // Fires on: direct URL entry, deep links, back/forward (popstate)
    // The adapter's router.push()/replace() also triggers this, but
    // restoreFromUrl is idempotent — if stack already matches URL, it's a no-op.
    router.beforeEach((to) => bladeRouterGuard(to, bladeStack, bladeRegistry, hasAccess, router));
  },
};
