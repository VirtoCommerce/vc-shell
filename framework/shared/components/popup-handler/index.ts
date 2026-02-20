import * as components from "@shared/components/popup-handler/components";
import { PopupPlugin } from "@shared/components/popup-handler/types";

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    VcPopupContainer: (typeof components)["VcPopupContainer"];
  }

  export interface ComponentCustomProperties {
    $popupPlugin: PopupPlugin;
  }
}

export * from "@shared/components/popup-handler/plugin";
export * from "@shared/components/popup-handler/components";
export * from "@shared/components/popup-handler/composables";
export * from "@shared/components/popup-handler/types";
export * from "@shared/components/popup-handler/utils";
