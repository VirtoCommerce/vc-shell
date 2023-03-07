import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const labelProps = {
  required: {
    type: Boolean,
    default: false,
  },
  tooltipIcon: {
    type: String,
    default: "fas fa-info-circle",
  },
};

export type VcLabelProps = ExtractTypes<typeof labelProps>;

export interface VcLabelSlots {
  default: () => VNode[];
  tooltip: () => VNode[];
}
