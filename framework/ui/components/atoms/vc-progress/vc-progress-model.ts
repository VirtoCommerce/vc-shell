import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const progressProps = {
  value: {
    type: Number,
    default: 0,
  },
  variant: {
    type: String as PropType<"default" | "striped">,
    default: "default",
  },
};

export type VcProgressProps = ExtractTypes<typeof progressProps>;

export interface VcProgressSlots {
  default: () => VNode[];
}
