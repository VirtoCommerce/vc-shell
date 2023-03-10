import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const loadingProps = {
  active: {
    type: Boolean,
    default: false,
  },
};

export type VcLoadingProps = ExtractTypes<typeof loadingProps>;

export interface VcLoadingSlots {
  default: () => VNode[];
}
