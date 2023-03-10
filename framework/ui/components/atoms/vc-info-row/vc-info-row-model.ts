import { VNode, PropType } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const infoRowProps = {
  label: {
    type: String,
    default: "",
  },
  value: {
    type: String,
    default: "",
  },
  tooltip: {
    type: String,
    default: "",
  },
  type: {
    type: String as PropType<"default" | "email">,
    default: "",
  },
};

export type VcInfoRowProps = ExtractTypes<typeof infoRowProps>;

export interface VcInfoRowSlots {
  default: () => VNode[];
}
