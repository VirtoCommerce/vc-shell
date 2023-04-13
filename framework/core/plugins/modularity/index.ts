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

export const createAppModule = (pages: unknown, locales?: unknown) => {
  const module = createModule(pages, locales);

  return {
    install(app: App): void {
      // Register pages
      Object.entries(pages).forEach(([, page]) => {
        app.config.globalProperties.pages?.push(page);
      });
      module.install(app);
    },
  };
};
