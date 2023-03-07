import { VNode } from "vue";
import { isBoolean } from "./../../../utils";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const checkboxProps = {
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: "Field",
  },
  errorMessage: String,
};

export const checkboxEmits = {
  "update:modelValue": (value: boolean) => isBoolean(value),
};

export type VcCheckboxProps = ExtractTypes<typeof checkboxProps>;
export type VcCheckboxEmits = typeof checkboxEmits;

export interface VcCheckboxSlots {
  default: () => VNode[];
  error: () => VNode[];
}
