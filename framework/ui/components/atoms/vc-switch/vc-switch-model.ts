import { VNode } from "vue";

export interface VcSwitchProps {
  modelValue?: boolean | undefined;
  disabled?: boolean | undefined;
  tooltip?: string | undefined;
  required?: boolean | undefined;
  label?: string | undefined;
  "onUpdate:modelValue"?: (value: boolean) => void;
}

export interface VcSwitchSlots {
  default: () => VNode[];
}
