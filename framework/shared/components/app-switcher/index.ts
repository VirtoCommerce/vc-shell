import { createModule } from "@core/plugins/modularity";
import * as components from "@shared/components/app-switcher/components";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcAppSwitcher: (typeof components)["VcAppSwitcher"];
  }
}

export const VcAppSwitcherComponent = createModule(components);

export { components };
export * from "@shared/components/app-switcher/composables";
