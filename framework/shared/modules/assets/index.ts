import { defineAppModule } from "@core/plugins/modularity";
import * as components from "@shared/modules/assets/components";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    AssetsDetails: (typeof components)["AssetsDetails"];
  }
}

export const AssetsDetailsModule = defineAppModule({ blades: components });

export default components;
