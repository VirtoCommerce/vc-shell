import { createApp } from "vue";
import App from "./App.vue";
import VcUiKit, { VcWorkspacePage, VcLoginPage } from "@virtoshell/ui";
import i18n from "./i18n";
import { createLogger } from "vue-logger-plugin";
import { createRouter, createWebHashHistory } from "vue-router";

// Load required CSS
import "@fortawesome/fontawesome-free/css/all.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@virtoshell/ui/dist/ui.css";
import "@virtoshell/ui-theme-light/dist/theme.css";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/login", component: VcLoginPage },
    { path: "/:pathMatch(.*)*", component: VcWorkspacePage },
  ],
});

createApp(App)
  .use(
    createLogger({
      enabled: process.env.VUE_APP_LOG_ENABLED ?? true,
      level: process.env.VUE_APP_LOG_LEVEL ?? "debug",
    })
  )
  .use(router)
  .use(i18n)
  .use(VcUiKit)
  .mount("#app");
