import { App } from "vue";
import { i18n } from "./../i18n";
import { Router } from "vue-router";
import { BladeConstructor } from "./../../../shared/components/blade-navigation/types";
import { kebabToPascal } from "./../../utilities";

export const createModule = (components: unknown, locales?: unknown) => ({
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

export const createAppModule = (pages: unknown, locales?: unknown, notificationTemplates?: unknown) => {
  const module = createModule(pages, locales);

  return {
    install(app: App, options?: { router: Router }): void {
      let routerInstance;

      if (options && options.router) {
        const { router } = options;
        routerInstance = router;
      }

      // Register pages
      Object.entries(pages).forEach(([, page]: [string, BladeConstructor]) => {
        app.config.globalProperties.pages?.push(page);

        // Dynamically add pages to vue router
        if (page.url) {
          const mainRouteName = routerInstance.getRoutes().find((r) => r.meta?.root)?.name;

          if (routerInstance) {
            routerInstance.addRoute(mainRouteName, {
              name: kebabToPascal(page.url.substring(1)),
              path: page.url.substring(1),
              component: page,
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
      module.install(app);
    },
  };
};
