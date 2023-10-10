import VirtoShellFramework, { notification, useUser } from "@vc-shell/framework";
import { createApp } from "vue";
import ImportModule from "./modules/import";
import OffersModule from "./modules/offers";
import OrdersModule from "./modules/orders";
import ProductsModule from "./modules/products";
import RatingModule from "./modules/rating";
import SettingsModule from "./modules/settings";
import MpProductsModule from "./modules/marketplace-products";
import { router } from "./router";
import * as locales from "./locales";
import { RouterView } from "vue-router";

import newProducts from "./modules/newProducts";
import newOffers from "./modules/newOffers";
import newTeam from "./modules/newTeam";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/index.css";

async function startApp() {
  const { loadUser } = useUser();

  await loadUser();

  const app = createApp(RouterView)
    .use(VirtoShellFramework)
    .use(OrdersModule, { router })
    .use(ProductsModule, { router })
    .use(MpProductsModule, { router })
    .use(OffersModule, { router })
    .use(ImportModule, { router })
    .use(RatingModule, { router })
    .use(SettingsModule, { router })
    .use(newProducts, { router })
    .use(newOffers, { router })
    .use(newTeam, { router })
    .use(router);

  Object.entries(locales).forEach(([key, message]) => {
    app.config.globalProperties.$mergeLocaleMessage(key, message);
  });

  app.provide("platformUrl", import.meta.env.APP_PLATFORM_URL);

  app.config.errorHandler = (err) => {
    notification.error(err.toString(), {
      timeout: 5000,
    });
  };

  await router.isReady();

  app.mount("#app");
}

startApp();
