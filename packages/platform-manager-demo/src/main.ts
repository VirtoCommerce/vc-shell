import { createApp } from "vue";
import App from "./App.vue";
import VcUiKit, {
  VcWorkspacePage,
  VcLoginPage,
} from "@virtocommerce/platform-manager-ui";
import i18n from "./i18n";

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
    { path: "/:pathMatch(.*)*", component: VcWorkspacePage },
  ],
});

createApp(App).use(router).use(i18n).use(VcUiKit).mount("#app");
