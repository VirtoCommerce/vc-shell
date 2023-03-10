import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const statusProps = {
  variant: {
    type: String as PropType<"info" | "warning" | "danger" | "success" | "light-danger">,
    default: "info",
  },
  outline: {
    type: Boolean,
    default: true,
  },
  extend: {
    type: Boolean,
    default: false,
  },
};

export type VcStatusProps = ExtractTypes<typeof statusProps>;

export interface VcStatusSlots {
  default: () => VNode[];
}
