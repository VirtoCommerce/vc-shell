import VirtoShellFramework from "@vc-shell/framework";
import AssetsModule from "@vc-shell/mod-assets";
import { createApp, h, resolveComponent } from "vue";
import PushHub from "./config/push-hub";
import ImportModule from "./modules/import";
import OffersModule from "./modules/offers";
import OrdersModule from "./modules/orders";
import ProductsModule from "./modules/products";
import RatingModule from "./modules/rating";
import SettingsModule from "./modules/settings";
import { router } from "./router";

import * as locales from "./locales";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/style.css";

const app = createApp({
  render: () => h(resolveComponent("router-view")),
})
  .use(router)
  .use(PushHub)
  .use(VirtoShellFramework)
  .use(AssetsModule)
  .use(OrdersModule)
  .use(ProductsModule)
  .use(OffersModule)
  .use(ImportModule)
  .use(RatingModule)
  .use(SettingsModule);

Object.entries(locales).forEach(([key, message]) => {
  app.config.globalProperties.$mergeLocaleMessage(key, message);
});

app.mount("#app");
