import { createAppModule } from "@core/plugins/modularity";
import * as components from "@shared/modules/assets-manager/components";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    AssetsManager: (typeof components)["AssetsManager"];
  }
}

export const AssetsManagerModule = createAppModule(components);

export * from "@shared/modules/assets-manager/components";
