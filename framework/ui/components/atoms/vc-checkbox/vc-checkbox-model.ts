import { VNode } from "vue";

export interface VcCheckboxProps {
  modelValue?: boolean | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  name?: string | undefined;
  errorMessage?: string | undefined;
  "onUpdate:modelValue"?: (value: boolean) => void;
}

export interface VcCheckboxSlots {
  default: () => VNode[];
  error: () => VNode[];
}
