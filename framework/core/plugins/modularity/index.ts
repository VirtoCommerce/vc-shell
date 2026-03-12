import { App, Component, inject, resolveComponent } from "vue";
import { NotificationTemplatesKey } from "@framework/injection-keys";
import { i18n } from "@core/plugins/i18n";
import type { BladeInstanceConstructor } from "@shared/components/blade-navigation/types";
import { createLogger } from "@core/utilities";
import { addMenuItem } from "@core/composables/useMenuService";
import { useNotifications } from "@core/composables/useNotifications";
import { notification } from "@shared/components/notifications/core";
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
  /** Notification templates */
  notificationTemplates?: Record<string, Component & { notifyType?: string }>;
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
  const { blades, locales, notificationTemplates } = options;

  return {
    install(app: App): void {
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

            bladeRegistry._registerBladeFn(name, {
              component,
              route: component.url,
              isWorkspace: component.isWorkspace || false,
              routable: component.routable !== false,
              permissions: component.permissions,
            });

            // Menu item registration
            if (component.url && component.menuItem) {
              app.runWithContext(() => {
                addMenuItem({
                  ...component.menuItem!,
                  icon: resolveComponent(component.menuItem!.icon as string),
                  url: component.url!,
                  routeId: name,
                  permissions: component.permissions || component.menuItem!.permissions,
                });
              });
            }
          }
        }
      }

      // Step 2: Notification subscriptions (separate from blade registration)
      if (blades) {
        for (const component of Object.values(blades)) {
          if (component.notifyType) {
            const notifyTypes = Array.isArray(component.notifyType)
              ? component.notifyType
              : [component.notifyType];

            if (notifyTypes.length > 0) {
              const { markAsRead, setNotificationHandler } = useNotifications(notifyTypes);

              setNotificationHandler((message) => {
                if (message.title) {
                  notification(message.title, {
                    onClose() {
                      markAsRead(message);
                    },
                  });
                }
              });
            }
          }
        }
      }

      // Step 3: Notification templates
      if (notificationTemplates) {
        const templateRegistry = app.runWithContext(() =>
          inject<(Component & { notifyType?: string })[]>(NotificationTemplatesKey),
        );
        if (templateRegistry) {
          for (const template of Object.values(notificationTemplates)) {
            const existingIndex = templateRegistry.findIndex(
              (t: Component & { notifyType?: string }) => t.notifyType === template.notifyType,
            );
            if (existingIndex !== -1) {
              templateRegistry.splice(existingIndex, 1);
            }
            templateRegistry.push(template);
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
) {
  return defineAppModule({
    blades: pages,
    locales,
    notificationTemplates,
  });
}
