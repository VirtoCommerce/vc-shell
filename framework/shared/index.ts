import { App } from "vue";
import { default as AssetsDetailsModule } from "./assets";
import { default as VcAppSwitcherModule } from "./app-switcher";
import { default as VcBladeNavigationModule } from "./blade-navigation";
import { default as AssetsManagerModule } from "./assets-manager";

export default {
  install(app: App): void {
    app.use(AssetsDetailsModule).use(VcAppSwitcherModule).use(VcBladeNavigationModule).use(AssetsManagerModule);
  },
};

export * from "./assets";
export * from "./app-switcher";
export * from "./blade-navigation";
export * from "./assets-manager";
