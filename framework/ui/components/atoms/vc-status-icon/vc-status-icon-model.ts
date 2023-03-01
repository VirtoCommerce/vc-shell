import { VNode } from "vue";

export interface VcStatusIconProps {
  status?: boolean | undefined;
}

export interface VcStatusIconSlots {
  default: () => VNode[];
}
