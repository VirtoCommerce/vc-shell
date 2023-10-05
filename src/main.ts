import VirtoShellFramework, { notification } from "@vc-shell/framework";
import { createApp } from "vue";
import ImportModule from "./modules/import";
import OffersModule from "./modules/offers";
import OrdersModule from "./modules/orders";
import ProductsModule from "./modules/products";
import RatingModule from "./modules/rating";
import SettingsModule from "./modules/settings";
import MpProductsModule from "./modules/marketplace-products";
import VideosModule from "./modules/videos";
import { router } from "./router";
import * as locales from "./locales";
import { useLogin } from "./composables";
import { RouterView } from "vue-router";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/index.css";

const app = createApp(RouterView)
  .use(VirtoShellFramework, {
    useLogin,
  })
  .use(OrdersModule, { router })
  .use(ProductsModule, { router })
  .use(MpProductsModule, { router })
  .use(OffersModule, { router })
  .use(ImportModule, { router })
  .use(RatingModule, { router })
  .use(SettingsModule, { router })
  .use(VideosModule, { router })
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

app.mount("#app");
