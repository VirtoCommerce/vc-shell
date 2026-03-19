import { getCurrentInstance, inject } from "vue";
import { PopupPluginKey } from "@shell/_internal/popup/keys";

export function getPopupPlugin() {
  const instance = getCurrentInstance();
  if (instance) {
    return inject(PopupPluginKey, undefined);
  }
}
