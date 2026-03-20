import { App, Component, inject, resolveComponent } from "vue";
import { i18n } from "@core/plugins/i18n";
import type { BladeInstanceConstructor } from "@core/blade-navigation/types";
import { createLogger } from "@core/utilities";
import { useNotificationStore } from "@core/notifications";
import type { ModuleNotificationsConfig } from "@core/notifications";
import { notification } from "@core/notifications/notification";
import { BladeRegistryKey, IBladeRegistryInstance } from "@core/composables/useBladeRegistry";

const logger = createLogger("modularity");

/**
 * Options for defineAppModule.
 */
export interface DefineAppModuleOptions {
  /** Blade components for BladeRegistry registration */
  blades?: Record<string, BladeInstanceConstructor>;
  /** Locales for vue-i18n merge */
  locales?: Record<string, object>;
  /** @deprecated Use `notifications` instead */
  notificationTemplates?: Record<string, Component & { notifyType?: string }>;
  /** Notification type configurations (new API) */
  notifications?: ModuleNotificationsConfig;
}

/**
 * Creates an app module plugin with explicit registration intent.
 *
 * @example
 * ```ts
 * export default defineAppModule({
 *   blades: { OrdersList, OrderDetails },
 *   locales: { en, de },
 * });
 * ```
 */
export function defineAppModule(options: DefineAppModuleOptions) {
  const { blades, locales, notificationTemplates, notifications } = options;

  return {
    install(app: App): void {
      const store = useNotificationStore();

      // Step 1: Blade registration (only if blades provided)
      if (blades && Object.keys(blades).length > 0) {
        const bladeRegistry = app.runWithContext(() => inject<IBladeRegistryInstance>(BladeRegistryKey));

        if (!bladeRegistry?._registerBladeFn) {
          logger.error(
            "defineAppModule: BladeRegistry not found. Blade registration will be skipped.",
          );
        } else {
          for (const [exportKey, component] of Object.entries(blades)) {
            const name = component.name || exportKey;
            app.runWithContext(() => {
              bladeRegistry._registerBladeFn(name, {
                component,
                route: component.url,
                isWorkspace: component.isWorkspace || false,
                routable: component.routable !== false,
                permissions: component.permissions,
              });
            });
          }
        }
      }

      // Step 2: Register notification types (new API)
      if (notifications) {
        for (const [type, config] of Object.entries(notifications)) {
          store.registerType(type, config);
        }
      }

      // Step 3: Legacy notification support (deprecated)
      if (!notifications && notificationTemplates) {
        for (const template of Object.values(notificationTemplates)) {
          const type = template.notifyType;
          if (type) {
            store.registerType(type, {
              template: template as Component,
              toast: { mode: "auto" },
            });
          }
        }
      }

      // Step 3b: Legacy blade notifyType compat shim (deprecated)
      if (blades) {
        for (const component of Object.values(blades)) {
          if (component.notifyType) {
            const notifyTypes = Array.isArray(component.notifyType)
              ? component.notifyType
              : [component.notifyType];

            // Skip if notifications config already handles these types
            const unhandledTypes = notifyTypes.filter((t) => !store.registry.has(t));
            if (unhandledTypes.length > 0) {
              // Permanent subscription — no cleanup needed (app lifetime)
              store.subscribe({
                types: notifyTypes,
                handler: (message) => {
                  if (message.title) {
                    notification(message.title, {
                      onClose() {
                        store.markAsRead(message);
                      },
                    });
                  }
                },
              });

              if (import.meta.env.DEV) {
                logger.warn(
                  `[vc-shell] notifyType on blade "${component.name}" is deprecated. ` +
                  `Use useBladeNotifications() inside the blade instead. ` +
                  `See: MIGRATION_GUIDE.md#notifications`,
                );
              }
            }
          }
        }
      }

      // Step 4: Locale merge
      if (locales) {
        for (const [key, message] of Object.entries(locales)) {
          i18n.global.mergeLocaleMessage(key, message);
        }
      }
    },
  };
}

/**
 * @deprecated Use `defineAppModule()` instead. This function is a backward-compatible
 * adapter that delegates to `defineAppModule`. It will be removed in a future major version.
 *
 * @example
 * ```ts
 * // Before:
 * export default createAppModule(pages, locales);
 * // After:
 * export default defineAppModule({ blades: pages, locales });
 * ```
 */
export function createAppModule(
  pages: Record<string, BladeInstanceConstructor>,
  locales?: Record<string, object>,
  notificationTemplates?: Record<string, Component & { notifyType?: string }>,
  components?: Record<string, Component>
) {
  return defineAppModule({
    blades: pages,
    locales,
    notificationTemplates,
  });
}
