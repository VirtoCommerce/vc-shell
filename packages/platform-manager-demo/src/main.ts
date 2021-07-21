import { createApp } from "vue";
import App from "./App.vue";
import VcUiKit from "@virtocommerce/platform-manager-ui";
import i18n from "./i18n";
import { createLogger } from "vue-logger-plugin";

// Load required CSS
import "@fortawesome/fontawesome-free/css/all.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@virtocommerce/platform-manager-theme-light/dist/theme.css";

const app = createApp(App);
app
  .use(i18n)
  .use(
    createLogger({
      enabled: process.env.VUE_APP_LOG_ENABLED ?? true,
      level: process.env.VUE_APP_LOG_LEVEL ?? "debug",
    })
  )
  .use(VcUiKit)
  .mount("#app");
