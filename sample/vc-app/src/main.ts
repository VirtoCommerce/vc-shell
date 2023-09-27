import VirtoShellFramework, { notification } from "@vc-shell/framework";
import { createApp } from "vue";
import { router } from "./router";
import * as locales from "./locales";
import { RouterView } from "vue-router";
import { useLogin } from "./composables";
import modules from "./modules";

// Load required CSS
import "./styles/index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@vc-shell/framework/dist/index.css";

const app = createApp(RouterView);
app.use(VirtoShellFramework, {
  useLogin,
});

Object.values(modules).forEach((module) => {
  app.use(module.default, { router });
});

app.use(router);

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
