import type { VNode } from "vue";
import _Popup from "./vc-popup.vue";

export const VcPopup = _Popup as typeof _Popup & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
