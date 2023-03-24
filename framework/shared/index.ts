import { App } from "vue";
import { default as AssetsDetailsModule } from "./modules/assets";
import { default as VcAppSwitcherComponent } from "./components/app-switcher";
import { default as VcBladeNavigationComponent } from "./components/blade-navigation";
import { default as AssetsManagerModule } from "./modules/assets-manager";

export default {
  install(app: App): void {
    app.use(AssetsDetailsModule).use(AssetsManagerModule).use(VcBladeNavigationComponent).use(VcAppSwitcherComponent);
  },
};

export * from "./modules/assets";
export * from "./modules/assets-manager";

export * from "./components/app-switcher";
export * from "./components/blade-navigation";
