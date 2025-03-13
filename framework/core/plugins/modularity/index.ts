import { App, Component, h, resolveComponent, watch } from "vue";
import { i18n } from "./../i18n";
import { Router } from "vue-router";
import { BladeInstanceConstructor, BladeVNode } from "./../../../shared/components/blade-navigation/types";
import { kebabToPascal } from "./../../utilities";
import { addMenuItem, useMenuService, useNotifications } from "../../composables";
import * as _ from "lodash-es";
import { notification } from "../../../shared";

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
          // Remove existing page if it exists
          if (app.config.globalProperties.pages) {
            const existingPageIndex = app.config.globalProperties.pages.findIndex(
              (p: BladeInstanceConstructor) => p.name === page.name,
            );
            if (existingPageIndex !== -1) {
              app.config.globalProperties.pages.splice(existingPageIndex, 1);
            }
          }

          // Add new page
          app.config.globalProperties.pages?.push(page);

          // Remove existing bladeRoute if it exists
          if (app.config.globalProperties.bladeRoutes) {
            const existingBladeRouteIndex = app.config.globalProperties.bladeRoutes.findIndex(
              (r: BladeInstanceConstructor) => r.name === page.name,
            );
            if (existingBladeRouteIndex !== -1) {
              app.config.globalProperties.bladeRoutes.splice(existingBladeRouteIndex, 1);
            }
          }

          // Add new bladeRoute
          app.config.globalProperties.bladeRoutes?.push({
            component: page,
            name: page?.name,
            isWorkspace: page.isWorkspace || false,
          });

          // Register component globally
          if (page.name) {
            if (app.component(page.name)) {
              // Overwrite existing component
              console.warn(
                `Component ${page.name} is already registered. It will be overwritten with the new component.`,
              );
            }
            app.component(page.name, page);
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

        // Dynamically add pages to Vue Router
        if (page.url) {
          const mainRoute = routerInstance.getRoutes().find((r) => r.meta?.root);

          if (!mainRoute) {
            throw new Error("Main route not found. Make sure you have added `meta: {root: true}` to the main route.");
          }

          const mainRouteName = mainRoute.name;

          const routeName = page.name || kebabToPascal(page.url.substring(1));

          const BladeInstanceConstructor = Object.assign({}, page, { name: routeName });

          const bladeVNode = h(BladeInstanceConstructor, {
            navigation: {},
          }) as BladeVNode;

          // Remove existing route if it exists
          if (routerInstance.hasRoute(routeName)) {
            routerInstance.removeRoute(routeName);
          }

          // Add new route
          routerInstance.addRoute(mainRouteName as string, {
            name: routeName,
            path: page.url.substring(1),
            components: { default: bladeVNode },
            meta: {
              permissions: page?.permissions,
            },
          });

          // Remove existing page in global properties if it exists
          if (app.config.globalProperties.pages) {
            const existingPageIndex = app.config.globalProperties.pages.findIndex(
              (p: BladeInstanceConstructor) => p.name === bladeVNode.type.name,
            );
            if (existingPageIndex !== -1) {
              app.config.globalProperties.pages.splice(existingPageIndex, 1);
            }
          }

          // Add new page to global properties
          app.config.globalProperties.pages?.push(bladeVNode);

          // Remove existing bladeRoute if it exists
          if (app.config.globalProperties.bladeRoutes) {
            const existingBladeRouteIndex = app.config.globalProperties.bladeRoutes.findIndex(
              (r: BladeInstanceConstructor) => r.name === routeName,
            );
            if (existingBladeRouteIndex !== -1) {
              app.config.globalProperties.bladeRoutes.splice(existingBladeRouteIndex, 1);
            }
          }

          // Add new bladeRoute
          app.config.globalProperties.bladeRoutes?.push({
            component: bladeVNode,
            route: page.url,
            name: routeName,
            isWorkspace: page.isWorkspace || false,
          });

          // Register component globally
          if (app.component(BladeInstanceConstructor.name)) {
            // Overwrite existing component
            console.warn(
              `Component ${BladeInstanceConstructor.name} is already registered. It will be overwritten with the new component.`,
            );
          }
          app.component(BladeInstanceConstructor.name, BladeInstanceConstructor);

          // Add to menu
          if (page.menuItem) {
            addMenuItem({
              ...page.menuItem,
              icon: resolveComponent(page.menuItem.icon as string),
              url: page.url,
              routeId: routeName,
              permissions: page.permissions,
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
