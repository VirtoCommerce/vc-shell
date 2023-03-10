import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const linkProps = {
  active: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
};

export const linkEmits = {
  click: () => true,
};

export type VcLinkProps = ExtractTypes<typeof linkProps>;
export type VcLinkEmits = typeof linkEmits;

export interface VcLinkSlots {
  default: () => VNode[];
}
