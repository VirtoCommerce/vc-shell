import { VNode } from "vue";

export interface VcLoadingProps {
  active?: boolean | undefined;
}

export interface VcLoadingSlots {
  default: () => VNode[];
}
