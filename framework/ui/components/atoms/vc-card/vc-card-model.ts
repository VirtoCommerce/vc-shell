import { VNode, PropType } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";
import { isBoolean } from "./../../../utils";

export const cardProps = {
  header: String,
  icon: String,
  isCollapsable: {
    type: Boolean,
    default: false,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  fill: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String as PropType<"default" | "success" | "danger">,
    default: "default",
  },
};

export const cardEmits = {
  "header:click": () => true,
  "state:collapsed": (isCollapsedState: boolean) => isBoolean(isCollapsedState),
};

export type VcCardProps = ExtractTypes<typeof cardProps>;
export type VcCardEmits = typeof cardEmits;

export interface VcCardSlots {
  default: () => VNode[];
  actions: () => VNode[];
}
