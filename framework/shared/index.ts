import { App } from "vue";
import { AssetsDetailsModule } from "./modules/assets";
import { VcAppSwitcherComponent } from "./components/app-switcher";
import { VcBladeNavigationComponent } from "./components/blade-navigation";
import { AssetsManagerModule } from "./modules/assets-manager";

export const SharedModule = {
  install(app: App): void {
    app.use(AssetsDetailsModule).use(AssetsManagerModule).use(VcBladeNavigationComponent).use(VcAppSwitcherComponent);
  },
};

export * from "./modules/assets";
export * from "./modules/assets-manager";

export * from "./components/app-switcher";
export * from "./components/blade-navigation";
export * from "./components/notifications";
export * from "./components/error-interceptor";
