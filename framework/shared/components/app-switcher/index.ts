import { createModule } from "../../../core/plugins/modularity";
import * as components from "./components";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcAppSwitcher: (typeof components)["VcAppSwitcher"];
  }
}

export const VcAppSwitcherComponent = createModule(components);

export { components };
export * from "./composables";
