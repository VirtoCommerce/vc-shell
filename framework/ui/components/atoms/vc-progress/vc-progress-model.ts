import { VNode } from "vue";

export interface VcProgressProps {
  value?: number | undefined;
  variant?: "default" | "striped" | undefined;
}

export interface VcProgressSlots {
  default: () => VNode[];
}
