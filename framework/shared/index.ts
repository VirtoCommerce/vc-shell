import { Router } from "vue-router";
import { App } from "vue";
import { AssetsDetailsModule } from "@shared/modules/assets";
import { VcAppSwitcherComponent } from "@shared/components/app-switcher";
import { VcBladeNavigationComponent } from "@shared/components/blade-navigation";
import { AssetsManagerModule } from "@shared/modules/assets-manager";
import { VcPopupHandler } from "@shared/components/popup-handler";

export const SharedModule = {
  install(app: App, args: { router: Router }): void {
    app
      .use(AssetsDetailsModule)
      .use(AssetsManagerModule)
      .use(VcBladeNavigationComponent, { router: args.router })
      .use(VcAppSwitcherComponent)
      .use(VcPopupHandler);
  },
};

export * from "@shared/modules";
export * from "@shared/components";
export * from "@shared/pages";
export * from "@shared/composables";
export * from "@shared/utilities";
