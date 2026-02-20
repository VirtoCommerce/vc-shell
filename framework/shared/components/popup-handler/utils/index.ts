import { getCurrentInstance, inject } from "vue";
import { PopupPluginKey } from "@shared/components/popup-handler/keys";

export function getPopupPlugin() {
  const instance = getCurrentInstance();
  if (instance) {
    return inject(PopupPluginKey, undefined);
  }
}
