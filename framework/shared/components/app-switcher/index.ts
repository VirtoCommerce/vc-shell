import { createModule } from "../../../core/plugins/modularity";
import * as components from "./components";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcAppSwitcher: (typeof components)["VcAppSwitcher"];
  }
}

export default createModule(components);

export * from "./components";
export * from "./composables";
