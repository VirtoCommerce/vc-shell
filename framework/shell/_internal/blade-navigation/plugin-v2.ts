import { Router } from "vue-router";
import { App } from "vue";
import { BladeNavigationPlugin, BladeStackKey, BladeMessagingKey } from "@core/blade-navigation/types";
import type { IBladeStack } from "@core/blade-navigation/types";
import { createBladeStack } from "@core/blade-navigation/useBladeStack";
import { createBladeMessaging } from "@core/blade-navigation/useBladeMessaging";
import { bladeRouterGuard } from "@core/blade-navigation/utils/bladeRouterGuard";
import { createRouterUrlSink } from "@core/blade-navigation/utils/urlSync";
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

/**
 * Blade navigation plugin (v2). Sets up the BladeStack state machine and BladeMessaging,
 * registers the catch-all route under the root route, and installs the beforeEach guard
 * that restores the stack from the URL.
 *
 * Vue Router is the URL sync layer only; BladeStack is the source of truth. Back/forward
 * works natively — beforeEach fires on popstate.
 */
export const VcBladeNavigationComponent = {
  install(app: App, args: { router: Router }) {
    const { router } = args;

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

    // Create BladeStack with permission enforcement.
    // The stack owns URL sync: it writes through the sink after every navigation
    // action, so no caller has to remember to sync. The sink reads the stack
    // lazily because it is built first.
    const stackHolder: { current?: IBladeStack } = {};
    const urlSink = createRouterUrlSink(router, () => stackHolder.current);
    const bladeStack = createBladeStack(bladeRegistry, hasAccess, urlSink);
    stackHolder.current = bladeStack;
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

    // Router guard for URL → blade stack restoration. Fires on direct entry, deep links,
    // back/forward, and the adapter's own push/replace — restoreFromUrl is idempotent.
    // Writes are suppressed for its duration: the guard restores the stack from the URL,
    // and a write-back from inside beforeEach would re-enter it.
    router.beforeEach((to) =>
      urlSink.suppressWhile(() => bladeRouterGuard(to, bladeStack, bladeRegistry, hasAccess, router)),
    );
  },
};
