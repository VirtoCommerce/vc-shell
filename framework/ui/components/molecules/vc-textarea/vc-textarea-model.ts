import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";
import { isString } from "./../../../utils";

export const textareaProps = {
  placeholder: {
    type: String,
    default: "",
  },
  modelValue: String,
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  label: String,
  tooltip: String,
  name: {
    type: String,
    default: "Field",
  },
  maxchars: {
    type: String,
    default: "1024",
  },
  errorMessage: String,
};

export const textareaEmits = {
  "update:modelValue": (value: string) => isString(value),
};

export type VcTextareaProps = ExtractTypes<typeof textareaProps>;
export type VcTextareaEmits = typeof textareaEmits;

export interface VcTextareaSlots {
  error: () => VNode[];
}
