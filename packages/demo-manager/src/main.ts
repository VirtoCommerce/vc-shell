import { createApp } from "vue";
import App from "./App.vue";
import VcUiKit from "@virtocommerce/ui-kit";
import VcShell from "@virtocommerce/shell";
import i18n from "./i18n";

// Load required CSS
import "@fortawesome/fontawesome-free/css/all.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@virtocommerce/shell/dist/shell.css";
import "@virtocommerce/ui-kit/dist/ui-kit.css";

createApp(App)
  .use(i18n)
  .use(VcUiKit)
  .use(VcShell, {
    extensions: [],
  })
  .mount("#app");
