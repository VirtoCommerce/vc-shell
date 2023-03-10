import { ExtractTypes } from "./../../../types/ts-helpers";
import { VNode } from "vue";

export const badgeProps = {
  active: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
};

export const badgeEmits = {
  click: () => true,
};

export type VcBadgeProps = ExtractTypes<typeof badgeProps>;
export type VcBadgeEmits = typeof badgeEmits;

export interface VcBadgeSlots {
  /**
   * Slot for component content
   * */
  default: () => VNode[];
}
