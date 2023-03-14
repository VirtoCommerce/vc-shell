import { ExtractTypes } from "./../../../types/ts-helpers";
import { VNode, PropType } from "vue";

export const buttonProps = {
  icon: String,
  variant: {
    type: String as PropType<"primary" | "secondary" | "special" | "danger" | "widget" | "onlytext">,
    default: "primary",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  small: {
    type: Boolean,
    default: false,
  },
  outline: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
};

export const buttonEmits = {
  click: (e: Event) => e instanceof Event,
};

export type VcButtonProps = ExtractTypes<typeof buttonProps>;
export type VcButtonEmits = typeof buttonEmits;

export interface VcButtonSlots {
  default: () => VNode[];
}
