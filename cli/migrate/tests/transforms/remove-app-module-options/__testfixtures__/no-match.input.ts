import { createApp } from "vue";
import { router } from "./router";

const app = createApp(App)
  .use(router)
  .use(SomePlugin, { router, theme: "dark" });
