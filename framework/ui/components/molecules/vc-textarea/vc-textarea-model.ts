import { VNode } from "vue";

export interface VcTextareaProps {
  placeholder?: string | undefined;
  modelValue: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  label?: string | undefined;
  tooltip?: string | undefined;
  name?: string | undefined;
  maxchars?: string | undefined;
  errorMessage?: string | undefined;
  "onUpdate:modelValue"?: (value: string) => void;
}

export interface VcTextareaSlots {
  error: () => VNode[];
}
