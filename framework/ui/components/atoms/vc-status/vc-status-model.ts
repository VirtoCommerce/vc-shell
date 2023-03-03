import { VNode } from "vue";

export interface VcStatusProps {
  variant?: "info" | "warning" | "danger" | "success" | "light-danger" | undefined;
  outline?: boolean | undefined;
  extend?: boolean | undefined;
}

export interface VcStatusSlots {
  default: () => VNode[];
}
