import { VNode, PropType } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const imageProps = {
  aspect: {
    type: String,
    default: "1x1",
  },
  rounded: {
    type: Boolean,
    default: false,
  },
  bordered: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  src: String,
  size: {
    type: String as PropType<"auto" | "1x1" | "16x9" | "4x3" | "3x2" | "xs" | "s" | "m" | "l" | "xl" | "xxl">,
    default: "auto",
  },
  background: {
    type: String as PropType<"cover" | "contain" | "auto">,
    default: "cover",
  },
};

export const imageEmits = {
  click: () => true,
};

export type VcImageProps = ExtractTypes<typeof imageProps>;
export type VcImageEmits = typeof imageEmits;

export interface VcImageSlots {
  default: () => VNode[];
}
