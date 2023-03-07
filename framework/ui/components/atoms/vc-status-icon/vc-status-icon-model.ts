import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const statusIconProps = {
  status: {
    type: Boolean,
    default: false,
  },
};

export type VcStatusIconProps = ExtractTypes<typeof statusIconProps>;

export interface VcStatusIconSlots {
  default: () => VNode[];
}
