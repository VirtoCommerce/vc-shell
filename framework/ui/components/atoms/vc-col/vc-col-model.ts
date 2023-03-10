import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const colProps = {
  size: {
    type: String,
    default: "1",
  },
};

export type VcColProps = ExtractTypes<typeof colProps>;

export interface VcColSlots {
  default: () => VNode[];
}
