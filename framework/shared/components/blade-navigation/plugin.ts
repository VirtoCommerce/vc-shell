import { App, ref } from "vue";
import { createModule } from "./../../../core/plugins";
import * as components from "./components";
import { BladeNavigationPlugin, IBladeContainer, IBladeRef } from "./types";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcBladeNavigation: (typeof components)["VcBladeNavigation"];
  }
}

export let bladeNavigationInstance: BladeNavigationPlugin;

export const VcBladeNavigationComponent = {
  install(app: App) {
    // Register components
    createModule(components).install(app);

    // Plugin
    const blades = ref<IBladeContainer[]>([]);
    const bladesRefs = ref<IBladeRef[]>([]);

    const bladeNavigationPlugin: BladeNavigationPlugin = {
      blades,
      bladesRefs,
    };

    app.config.globalProperties.$bladeNavigationPlugin = bladeNavigationPlugin;
    app.provide("bladeNavigationPlugin", bladeNavigationPlugin);
    bladeNavigationInstance = bladeNavigationPlugin;
  },
};
