import { createModule } from "../../core/plugins/modularity";
import * as components from "./components";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcBladeNavigation: (typeof components)["VcBladeNavigation"];
  }
}

export default createModule(components);

export * from "./components";
export * from "./composables";
export * from "./types";
