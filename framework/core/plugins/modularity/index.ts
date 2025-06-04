import { App, Component, h, inject, resolveComponent, watch } from "vue";
import { i18n } from "./../i18n";
import { Router } from "vue-router";
import { BladeInstanceConstructor, BladeVNode } from "./../../../shared/components/blade-navigation/types";
import { kebabToPascal } from "./../../utilities";
import { addMenuItem, useMenuService, useNotifications } from "../../composables";
import * as _ from "lodash-es";
import { notification } from "../../../shared";
import { BladeRegistryKey, IBladeRegistrationData, IBladeRegistryInstance } from "../../composables/useBladeRegistry";

export function createModule(components: { [key: string]: BladeInstanceConstructor }, locales?: unknown) {
  return {
    install(app: App): void {
      // Register components
      Object.entries(components).forEach(([componentName, component]) => {
        // Check if the component is already registered
        if (app.component(componentName)) {
          // Remove the existing component
          // Note: Vue does not provide a method to remove a component, so we can overwrite it
          console.warn(
            `Component ${componentName} is already registered. It will be overwritten with the new component.`,
          );
        }
        app.component(componentName, component);
      });

      // Load locales
      if (locales) {
        Object.entries(locales).forEach(([key, message]) => {
          // Merge locale messages, overwriting existing ones
          i18n.global.mergeLocaleMessage(key, message);
        });
      }
    },
  };
}

export function createAppModule(
  pages: { [key: string]: BladeInstanceConstructor },
  locales?: { [key: string]: object },
  notificationTemplates?: { [key: string]: Component & { notifyType?: string } },
  moduleComponents?: { [key: string]: Component },
) {
  return {
    install(app: App, options?: { router: Router }): void {
      let routerInstance: Router;

      // Inject the BladeRegistry instance
      const bladeRegistry = app.runWithContext(() => inject<IBladeRegistryInstance>(BladeRegistryKey));
      let registerBladeWithRegistry: (name: string, data: IBladeRegistrationData) => void;

      if (bladeRegistry && bladeRegistry._registerBladeFn) {
        registerBladeWithRegistry = bladeRegistry._registerBladeFn;
      } else {
        console.error(
          "createAppModule: BladeRegistry or its _registerBladeFn not found via inject. Blade registration will be skipped.",
        );
        registerBladeWithRegistry = (name: string, data: IBladeRegistrationData) => {
          console.warn(`BladeRegistry (noop): Tried to register '${name}' but _registerBladeFn is missing.`);
        };
      }

      if (options && options.router) {
        const { router } = options;
        routerInstance = router;
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
            });
          } else {
            console.warn(
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
          });

          const mainRoute = routerInstance.getRoutes().find((r) => r.meta?.root);
          if (!mainRoute) {
            throw new Error("Main route not found. Make sure you have added `meta: {root: true}` to the main route.");
          }
          const mainRouteName = mainRoute.name;

          const bladeVNodeForRouter = h(page, {
            navigation: {},
          }) as BladeVNode;

          if (routerInstance.hasRoute(routeName)) {
            routerInstance.removeRoute(routeName);
          }

          routerInstance.addRoute(mainRouteName as string, {
            name: routeName,
            path: page.url.substring(1),
            components: { default: bladeVNodeForRouter },
            meta: {
              permissions: page.permissions,
            },
          });

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
        // Register notification templates
        Object.entries(notificationTemplates).forEach(([, template]) => {
          // Remove existing template if it exists
          if (app.config.globalProperties.notificationTemplates) {
            const existingIndex = app.config.globalProperties.notificationTemplates.findIndex(
              (t: Component & { notifyType: string }) => t.notifyType === template.notifyType,
            );
            if (existingIndex !== -1) {
              app.config.globalProperties.notificationTemplates.splice(existingIndex, 1);
            }
          }
          app.config.globalProperties.notificationTemplates?.push(template);
        });
      }

      if (moduleComponents) {
        // Register module components globally
        Object.entries(moduleComponents).forEach(([name, component]) => {
          // Check if the component is already registered
          if (app.component(name)) {
            // Overwrite existing component
            console.warn(`Component ${name} is already registered. It will be overwritten with the new component.`);
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

export * from "./loader";
export * from "./extensions-helper";
