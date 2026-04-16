import { PopupPlugin } from "@shell/_internal/popup/types";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $popupPlugin: PopupPlugin;
  }
}

export * from "@shell/_internal/popup/plugin";
export * from "@shell/_internal/popup/components";
export * from "@shell/_internal/popup/composables";
export * from "@shell/_internal/popup/types";
export * from "@shell/_internal/popup/utils";
