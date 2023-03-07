import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";
import { isBoolean } from "./../../../utils";

export const switchProps = {
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  label: String,
};

export const switchEmits = {
  "update:modelValue": (value: boolean) => isBoolean(value),
};

export type VcSwitchProps = ExtractTypes<typeof switchProps>;
export type VcSwitchEmits = typeof switchEmits;

export interface VcSwitchSlots {
  default: () => VNode[];
}
