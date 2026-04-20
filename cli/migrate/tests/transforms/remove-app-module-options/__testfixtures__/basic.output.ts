import VirtoShellFramework from "@vc-shell/framework";
import { createApp } from "vue";
import { router } from "./router";
import MyModule from "./modules/my-module";

const app = createApp(RouterView)
  .use(VirtoShellFramework, {
    router,
    i18n: { locale: "en", fallbackLocale: "en" },
  })
  .use(MyModule)
  .use(router);
