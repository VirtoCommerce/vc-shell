import { createAppModule } from "../../../core/plugins/modularity";
import * as components from "./components";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    AssetsManager: (typeof components)["AssetsManager"];
  }
}

export const AssetsManagerModule = async () => {
  const { createAppModule } = await import("../../../core/plugins/modularity");
  return createAppModule(components);
};

export * from "./components";
