import { VNode } from "vue";

export interface VcLinkProps {
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  onClick?: () => void;
}

export interface VcLinkSlots {
  default: () => VNode[];
}
