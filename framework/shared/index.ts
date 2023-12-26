import { Router } from "vue-router";
import { App } from "vue";
import { AssetsDetailsModule } from "./modules/assets";
import { VcAppSwitcherComponent } from "./components/app-switcher";
import { VcBladeNavigationComponent } from "./components/blade-navigation";
import { AssetsManagerModule } from "./modules/assets-manager";
import { VcPopupHandler } from "./components/popup-handler";
import * as locales from "./locales";
import { i18n } from "./../core/plugins";

export const SharedModule = {
  install(app: App, args: { router: Router }): void {
    // Load locales
    if (locales) {
      Object.entries(locales).forEach(([key, message]) => {
        i18n.global.mergeLocaleMessage(key, message);
      });
    }

    app
      .use(AssetsDetailsModule)
      .use(AssetsManagerModule)
      .use(VcBladeNavigationComponent, { router: args.router })
      .use(VcAppSwitcherComponent)
      .use(VcPopupHandler);
  },
};

export * from "./modules";
export * from "./components";
export * from "./pages";
