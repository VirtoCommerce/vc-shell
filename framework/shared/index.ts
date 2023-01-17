import { App } from "vue";
import { default as AssetsDetails } from "./assets";
import { default as VcAppSwitcher } from "./app-switcher";
import { default as VcBladeNavigation } from "./blade-navigation";

const components = [AssetsDetails, VcAppSwitcher, VcBladeNavigation];

export function init(app: App): App {
  components.forEach((component) => app.use(component));

  return app;
}

export * from "./assets";
export * from "./app-switcher";
export * from "./blade-navigation";
