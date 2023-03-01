import { ComponentPublicInstance } from "vue";
import { VcPopupProps } from "./vc-popup-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Popup from "./vc-popup.vue";
export const VcPopup: ComponentConstructor<
  ComponentPublicInstance<VcPopupProps>
> = Popup;