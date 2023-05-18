import * as components from "./components";
import { PopupPlugin } from "./types";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcPopupContainer: (typeof components)["VcPopupContainer"];
  }

  export interface ComponentCustomProperties {
    $popupPlugin: PopupPlugin;
  }
}

export * from "./plugin";
export * from "./components";
export * from "./composables";
export * from "./types";
export * from "./utils";
