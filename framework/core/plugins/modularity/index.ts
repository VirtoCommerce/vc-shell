import { App } from "vue";
import { i18n } from "./../i18n";

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
    install(app: App): void {
      // Register pages
      Object.entries(pages).forEach(([, page]) => {
        app.config.globalProperties.pages?.push(page);
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
