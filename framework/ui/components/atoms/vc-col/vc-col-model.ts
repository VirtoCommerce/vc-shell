import { VNode } from "vue";

export interface VcColProps {
  size?: string | undefined;
}

export interface VcColSlots {
  default: () => VNode[];
}
