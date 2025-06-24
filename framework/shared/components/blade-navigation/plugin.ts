import { Router } from "vue-router";
import { App, ref } from "vue";
import * as components from "./components";
import { BladeNavigationPlugin } from "./types";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcBladeNavigation: (typeof components)["VcBladeNavigation"];
  }
}

export let bladeNavigationInstance: BladeNavigationPlugin;

export const VcBladeNavigationComponent = {
  install(app: App, args: { router: Router }) {
    // Register framework's own blade UI components like VcBladeNavigation
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });

    // The plugin instance primarily provides the router.
    // Blade resolution is now handled by useBladeNavigation via useBladeRegistry.
    const bladeNavigationPluginData: BladeNavigationPlugin = {
      router: args.router,
      // blades: ref([]), // This state was for useBladeNavigation, it should manage its own state internally or via its singleton.
      // If blades ref is truly global and shared, it needs careful consideration.
      // For now, assuming blade state management is within useBladeNavigationSingleton.
    };

    // This global instance is used as a fallback in useBladeNavigation.
    // It should contain at least what useBladeNavigation might try to access from it.
    // Primarily, the router.
    bladeNavigationInstance = bladeNavigationPluginData;

    // Provide the plugin instance (mainly for the router) for useBladeNavigation to inject.
    // useBladeNavigation can then also useBladeRegistry() independently.
    app.provide("bladeNavigationPlugin", bladeNavigationPluginData);
  },
};
