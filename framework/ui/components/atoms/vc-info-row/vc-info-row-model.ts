import { VNode } from "vue";

export interface VcInfoRowProps {
  label?: string | undefined;
  value?: string | undefined;
  tooltip?: string | undefined;
  type?: "default" | "email";
}

export interface VcInfoRowSlots {
  default: () => VNode[];
}
