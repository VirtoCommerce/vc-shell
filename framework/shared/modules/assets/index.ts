import { createAppModule } from "@core/plugins/modularity";
import * as components from "@shared/modules/assets/components";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    AssetsDetails: (typeof components)["AssetsDetails"];
  }
}

export const AssetsDetailsModule = createAppModule(components);

export default components;
