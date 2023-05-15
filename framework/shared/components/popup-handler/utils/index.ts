import { getCurrentInstance, inject } from "vue";
import { PopupPlugin } from "../types";

export function getPopupPlugin() {
  const instance = getCurrentInstance();
  if (instance) {
    return inject<PopupPlugin>("popupPlugin");
  }
}
