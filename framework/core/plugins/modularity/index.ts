import { App, Component, inject, resolveComponent } from "vue";
import { NotificationTemplatesKey } from "@framework/injection-keys";
import { i18n } from "@core/plugins/i18n";
import { Router } from "vue-router";
import type { BladeInstanceConstructor } from "@shared/components/blade-navigation/types";
import { kebabToPascal, createLogger } from "@core/utilities";
import { addMenuItem, useMenuService } from "@core/composables/useMenuService";
import { useNotifications } from "@core/composables/useNotifications";
import * as _ from "lodash-es";
import { notification } from "@shared/components/notifications/core";
import { BladeRegistryKey, IBladeRegistrationData, IBladeRegistryInstance } from "@core/composables/useBladeRegistry";

const logger = createLogger("modularity");

/**
 * Options for createAppModule.
 */
export interface AppModuleOptions {
  /**
   * List of blade names that must already be registered before this module installs.
   * Used to enforce load-order dependencies between modules.
   *
   * @example
   * ```ts
   * export default createAppModule(pages, locales, undefined, undefined, {
   *   dependsOn: ["SellerDetails", "Products"],
   * });
   * ```
   */
  dependsOn?: string[];
}

export function createAppModule(
  pages: { [key: string]: BladeInstanceConstructor },
  locales?: { [key: string]: object },
  notificationTemplates?: { [key: string]: Component & { notifyType?: string } },
  moduleComponents?: { [key: string]: Component },
  moduleOptions?: AppModuleOptions,
) {
  return {
    install(app: App, options?: { router: Router }): void {
      // Inject the BladeRegistry instance
      const bladeRegistry = app.runWithContext(() => inject<IBladeRegistryInstance>(BladeRegistryKey));
      let registerBladeWithRegistry: (name: string, data: IBladeRegistrationData) => void;

      // Validate module dependencies (must be registered before this module)
      if (moduleOptions?.dependsOn?.length && bladeRegistry) {
        const missing = moduleOptions.dependsOn.filter(
          (dep) => !bladeRegistry.getBlade(dep),
        );
        if (missing.length > 0) {
          const moduleName = Object.values(pages)[0]?.name || "unknown";
          logger.error(
            `Module '${moduleName}' depends on blades [${missing.join(", ")}] ` +
            `which are not yet registered. Ensure dependent modules are installed first.`,
          );
        }
      }

      if (bladeRegistry && bladeRegistry._registerBladeFn) {
        registerBladeWithRegistry = bladeRegistry._registerBladeFn;
      } else {
        logger.error(
          "createAppModule: BladeRegistry or its _registerBladeFn not found via inject. Blade registration will be skipped.",
        );
        registerBladeWithRegistry = (name: string, data: IBladeRegistrationData) => {
          logger.warn(`BladeRegistry (noop): Tried to register '${name}' but _registerBladeFn is missing.`);
        };
      }

      const uid = _.uniqueId("module_");

      // Register pages
      Object.values(pages).forEach((page) => {
        if (!("routable" in page)) {
          page.routable = true;
        }

        // All components registered through this plugin are blades
        page.isBlade = true;

        if (!page.url) {
          if (page.name) {
            registerBladeWithRegistry(page.name, {
              component: page,
              isWorkspace: page.isWorkspace || false,
              permissions: page.permissions,
            });
          } else {
            logger.warn(
              "createAppModule: Page without URL is missing a name. Cannot register with BladeRegistry.",
              page,
            );
          }
        } else {
          const routeName = page.name || kebabToPascal(page.url.substring(1));
          if (page.name !== routeName) {
            page.name = routeName;
          }

          registerBladeWithRegistry(routeName, {
            component: page,
            route: page.url,
            isWorkspace: page.isWorkspace || false,
            routable: page.routable !== false,
            permissions: page.permissions,
          });

          // Note: No router.addRoute() — blades are NOT Vue Router pages.
          // BladeStack manages blade rendering; Vue Router is URL sync only.

          if (page.menuItem) {
            addMenuItem({
              ...page.menuItem,
              icon: resolveComponent(page.menuItem.icon as string),
              url: page.url,
              routeId: routeName,
              permissions: page.permissions || page.menuItem.permissions,
            });
          }
        }

        if (!page.moduleUid) {
          page.moduleUid = uid;
        }

        if (page.notifyType) {
          const notifyTypes = Array.isArray(page.notifyType) ? page.notifyType : [page.notifyType];

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
      });

      if (notificationTemplates) {
        // Register notification templates via DI only — no globalProperties (FR-3.5)
        const templateRegistry = app.runWithContext(() =>
          inject<(Component & { notifyType?: string })[]>(NotificationTemplatesKey),
        );
        if (templateRegistry) {
          Object.entries(notificationTemplates).forEach(([, template]) => {
            const existingIndex = templateRegistry.findIndex(
              (t: Component & { notifyType?: string }) => t.notifyType === template.notifyType,
            );
            if (existingIndex !== -1) {
              templateRegistry.splice(existingIndex, 1);
            }
            templateRegistry.push(template);
          });
        }
      }

      if (moduleComponents) {
        // Register module components globally
        Object.entries(moduleComponents).forEach(([name, component]) => {
          // Check if the component is already registered
          if (app.component(name)) {
            // Overwrite existing component
            logger.warn(`Component ${name} is already registered. It will be overwritten with the new component.`);
          }
          app.component(name, component);
        });
      }

      if (locales) {
        Object.entries(locales).forEach(([key, message]) => {
          // Merge locale messages, overwriting existing ones
          i18n.global.mergeLocaleMessage(key, message);
        });
      }
    },
  };
}
