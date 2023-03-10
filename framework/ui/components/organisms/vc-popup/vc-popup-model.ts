import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const popupProps = {
  title: String,
  closable: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String as PropType<"small" | "medium" | "fullscreen">,
    default: "fullscreen",
  },
};

export const popupEmits = {
  close: () => true,
};

export type VcPopupProps = ExtractTypes<typeof popupProps>;
export type VcPopupEmits = typeof popupEmits;

export interface VcPopupSlots {
  default: () => VNode[];
}
