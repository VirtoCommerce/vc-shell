import { VNode } from "vue";

export interface VcButtonProps {
  icon?: string | undefined;
  variant?: "primary" | "secondary" | "special" | "danger" | "widget" | "onlytext" | undefined;
  disabled?: boolean | undefined;
  small?: boolean | undefined;
  outline?: boolean | undefined;
  selected?: boolean | undefined;
  onClick?: () => void;
}

export interface VcButtonSlots {
  default: () => VNode[];
}
