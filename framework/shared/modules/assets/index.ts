import * as components from "./components";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    AssetsDetails: (typeof components)["AssetsDetails"];
  }
}

export const AssetsDetailsModule = async () => {
  const { createAppModule } = await import("../../../core/plugins/modularity");
  return createAppModule(components);
};

export * from "./components";
