import { createModule } from "../../core/plugins/modularity";
import * as components from "./components";
import * as locales from "./locales";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    AssetsManager: (typeof components)["AssetsManager"];
  }
}

export default createModule(components, locales);

export * from "./components";
// export * from "./composables";
export * from "./types";
