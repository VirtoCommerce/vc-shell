import { createApp } from "vue";
import App from "./App.vue";
import VcUiKit, {
  VcNotfoundPage,
  VcLoginPage,
} from "@virtocommerce/platform-manager-ui";
import i18n from "./i18n";
import { createLogger } from "vue-logger-plugin";
import { createRouter, createWebHashHistory } from "vue-router";

// Load required CSS
import "@fortawesome/fontawesome-free/css/all.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@virtocommerce/platform-manager-ui/dist/ui.css";
import "@virtocommerce/platform-manager-theme-light/dist/theme.css";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/login", component: VcLoginPage },
    { path: "/:pathMatch(.*)*", component: VcNotfoundPage },
  ],
});

createApp(App)
  .use(router)
  .use(i18n)
  .use(
    createLogger({
      enabled: process.env.VUE_APP_LOG_ENABLED ?? true,
      level: process.env.VUE_APP_LOG_LEVEL ?? "debug",
    })
  )
  .use(VcUiKit)
  .mount("#app");
