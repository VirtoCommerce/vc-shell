import { VNode, PropType } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const iconProps = {
  icon: {
    type: String,
    default: "fas fa-square-full",
  },
  size: {
    type: String as PropType<"xs" | "s" | "m" | "l" | "xl" | "xxl">,
    default: "m",
  },
};

export type VcIconProps = ExtractTypes<typeof iconProps>;

export interface VcIconSlots {
  default: () => VNode[];
}
