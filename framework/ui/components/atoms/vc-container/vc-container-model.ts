import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const containerProps = {
  shadow: {
    type: Boolean,
    default: false,
  },
  noPadding: {
    type: Boolean,
    default: false,
  },
  usePtr: {
    type: Boolean,
    default: false,
  },
};

export const containerEmits = {
  "scroll:ptr": () => true,
};

export type VcContainerProps = ExtractTypes<typeof containerProps>;
export type VcContainerEmits = typeof containerEmits;

export interface VcContainerSlots {
  default: () => VNode[];
}
