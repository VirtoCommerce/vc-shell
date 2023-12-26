import { App, Component, defineComponent, h } from "vue";
import { i18n } from "./../i18n";
import { Router } from "vue-router";
import { BladeInstanceConstructor } from "./../../../shared/components/blade-navigation/types";
import { kebabToPascal } from "./../../utilities";
import { useMenuService } from "../../composables";
import { ComponentProps } from "../../../shared/utilities/vueUtils";
import { reactiveComputed } from "@vueuse/core";

export const createModule = (components: { [key: string]: BladeInstanceConstructor }, locales?: unknown) => ({
  install(app: App): void {
    // Register components
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    // Load locales
    if (locales) {
      Object.entries(locales).forEach(([key, message]) => {
        i18n.global.mergeLocaleMessage(key, message);
      });
    }
  },
});

export const createAppModule = (
  pages: { [key: string]: BladeInstanceConstructor },
  locales?: { [key: string]: object },
  notificationTemplates?: { [key: string]: Component },
  moduleComponents?: { [key: string]: Component },
) => {
  return {
    install(app: App, options?: { router: Router }): void {
      let routerInstance: Router;

      if (options && options.router) {
        const { router } = options;
        routerInstance = router;
      }

      // Register pages
      Object.entries(pages).forEach(([key, page]) => {
        if (!page.url) {
          app.config.globalProperties.pages?.push(page);

          app.config.globalProperties.bladeRoutes?.push({
            component: page,
            name: page?.name,
            isWorkspace: page.isWorkspace || false,
          });

          // Add to menu
          if (page.menuItem) {
            app.config.globalProperties.menuItems?.push({ ...page.menuItem, url: page.url, routeId: key });
          }

          app.component(page.name, page);
        }

        // Dynamically add pages to vue router
        if (page.url) {
          const mainRouteName = routerInstance.getRoutes().find((r) => r.meta?.root)?.name;

          if (!mainRouteName) {
            throw new Error("No parent route is found. Make sure you have added `meta: {root: true}` to main route.");
          }

          const routeName = page.name || kebabToPascal(page.url.substring(1));

          const BladeInstanceConstructor = Object.assign({}, page, { name: routeName });

          const bladeVNode = h(BladeInstanceConstructor);

          if (routerInstance && mainRouteName) {
            routerInstance.addRoute(mainRouteName, {
              name: routeName,
              path: page.url.substring(1),
              components: { default: bladeVNode },
              meta: {
                permissions: page?.permissions,
              },
            });
          }

          app.config.globalProperties.pages?.push(bladeVNode);

          app.config.globalProperties.bladeRoutes?.push({
            component: bladeVNode,
            route: page.url,
            name: routeName,
            isWorkspace: page.isWorkspace || false,
          });

          app.component(BladeInstanceConstructor.name, BladeInstanceConstructor);

          // Add to menu
          if (page.menuItem) {
            const { addMenuItem } = useMenuService();
            addMenuItem({
              ...page.menuItem,
              url: page.url,
              routeId: routeName,
            });
          }
        }
      });

      if (notificationTemplates) {
        // Register notification templates
        Object.entries(notificationTemplates).forEach(([, template]) => {
          app.config.globalProperties.notificationTemplates?.push(template);
        });
      }

      if (moduleComponents) {
        // Register module components globally
        Object.entries(moduleComponents).forEach(([name, component]) => {
          app.component(name, component);
        });
      }

      if (locales) {
        Object.entries(locales).forEach(([key, message]) => {
          i18n.global.mergeLocaleMessage(key, message);
        });
      }
    },
  };
};
