import { VNode } from "vue";

export interface VcEditorProps {
  placeholder?: string | undefined;
  modelValue?: string | number | Date | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  label?: string | undefined;
  tooltip?: string | undefined;
  name?: string | undefined;
  errorMessage?: string | undefined;
  "onUpdate:modelValue"?: (value: string) => void;
}

export interface VcEditorSlots {
  error: () => VNode[];
}
