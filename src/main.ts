import VirtoShellFramework, { notification, useLanguages, useUser } from "@vc-shell/framework";
import { App, Plugin, createApp } from "vue";
import * as modules from "@vcmp-vendor-portal/modules";
import ImportModule from "@virtocommerce/import-app";
import { router } from "./router";
import * as locales from "./locales";
import { RouterView, Router } from "vue-router";
import { bootstrap } from "./bootstrap";
import { useSellerDetails } from "./modules/seller-details/composables";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/index.css";
import "@virtocommerce/import-app/dist/style.css";

interface ModuleManifest {
  file: string;
  name: string;
  src: string;
  isEntry: boolean;
}

interface CssManifest {
  file: string;
  src: string;
}

interface Manifest {
  [key: string]: ModuleManifest | CssManifest;
}

async function loadModules(app: App, { router }: { router: Router }) {
  try {
    const modulePaths = [
      import.meta.env.APP_PLATFORM_URL +
        "/Modules/$(VirtoCommerce.MarketplaceReviews)/reviews-app/dist/packages/modules",
    ];

    for (const module of modulePaths) {
      const manifestResponse = await fetch(module + "/manifest.json");

      if (!manifestResponse.ok) {
        throw new Error(`Failed to load manifest: ${manifestResponse.statusText}`);
      }

      const manifest: Manifest = await manifestResponse.json();

      // Find entry point
      const entry = Object.values(manifest).find((file) => (file as ModuleManifest).isEntry);

      if (!entry) {
        throw new Error("Entry file not found");
      }

      // Find style
      await Promise.all(
        Object.values(manifestResponse)
          .filter((file) => file.file.endsWith(".css"))
          .map((file) => import(/* @vite-ignore */ module + "/" + `${file.file}`)),
      );

      const mainModule = await import(/* @vite-ignore */ module + "/" + entry.file);

      Object.values(mainModule.default).forEach((mod) => {
        app.use((mod as Record<"default", Plugin>).default, { router });
      });
    }
  } catch (error) {
    console.error("Failed to load modules", error);
  }
}

async function startApp() {
  const { loadUser } = useUser();
  const { load: loadSeller, item: sellerDetails } = useSellerDetails();

  try {
    await loadUser();
    await loadSeller();
  } catch (e) {
    console.log(e);
  }

  const { currentLocale, setLocale } = useLanguages();

  const app = createApp(RouterView);

  app.use(VirtoShellFramework, {
    router,
    platformUrl: import.meta.env.APP_PLATFORM_URL,
    i18n: {
      locale: import.meta.env.APP_I18N_LOCALE,
      fallbackLocale: import.meta.env.APP_I18N_FALLBACK_LOCALE,
    },
    signalR: {
      creator: sellerDetails.value?.id,
    },
  });

  Object.values(modules.default).forEach((module) => {
    app.use(module.default, { router });
  });

  app.use(ImportModule.Import.default, { router });

  await loadModules(app, { router });

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
