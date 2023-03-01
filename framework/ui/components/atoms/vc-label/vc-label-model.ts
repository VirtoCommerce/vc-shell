import { VNode } from "vue";

export interface VcLabelProps {
  required?: boolean | undefined;
  tooltipIcon?: string | undefined;
}

export interface VcLabelSlots {
  default: () => VNode[];
  tooltip: () => VNode[];
}
