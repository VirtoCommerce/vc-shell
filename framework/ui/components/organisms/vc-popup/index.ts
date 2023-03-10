import { ComponentPublicInstance } from "vue";
import { VcPopupEmits, VcPopupProps } from "./vc-popup-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Popup from "./vc-popup.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcPopup: ComponentConstructor<ComponentPublicInstance<VcPopupProps, any, any, any, any, VcPopupEmits>> =
  Popup;
