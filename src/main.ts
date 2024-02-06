import VirtoShellFramework, { notification, useLanguages, useUser } from "@vc-shell/framework";
import { createApp } from "vue";
import * as modules from "@vcmp-vendor-portal/modules";
import ImportModule from "@virtocommerce/import-app";
import { router } from "./router";
import * as locales from "./locales";
import { RouterView } from "vue-router";
import { bootstrap } from "./bootstrap";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/index.css";
import "@virtocommerce/import-app/dist/style.css";

async function startApp() {
  const { loadUser } = useUser();
  await loadUser();

  const { currentLocale, setLocale } = useLanguages();

  const app = createApp(RouterView);

  app.use(VirtoShellFramework, {
    router,
    platformUrl: import.meta.env.APP_PLATFORM_URL,
    i18n: {
      locale: import.meta.env.APP_I18N_LOCALE,
      fallbackLocale: import.meta.env.APP_I18N_FALLBACK_LOCALE,
    },
  });

  Object.values(modules.default).forEach((module) => {
    app.use(module.default, { router });
  });

  app.use(ImportModule.Import.default, { router });

  app.use(router);

  bootstrap(app);

  Object.entries(locales).forEach(([key, message]) => {
    app.config.globalProperties.$mergeLocaleMessage(key, message);
  });

  setLocale(currentLocale.value);

  // Global error handler
  app.config.errorHandler = (err: unknown) => {
    notification.error((err as Error).toString(), {
      timeout: 5000,
    });
  };

  await router.isReady();

  app.mount("#app");
}

startApp();
