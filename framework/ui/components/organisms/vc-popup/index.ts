import { VNode } from "vue";
import Popup from "./vc-popup.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcPopupSlots = {
  default?: () => VNode[];
};

export const VcPopup: GlobalComponentConstructor<typeof Popup, VcPopupSlots> = Popup;
