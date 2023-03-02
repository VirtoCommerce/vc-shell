import { VNode } from "vue";

export interface VcCardProps {
  header?: string | undefined;
  icon?: string | undefined;
  isCollapsable?: boolean | undefined;
  isCollapsed?: boolean | undefined;
  fill?: boolean | undefined;
  variant?: "default" | "success" | "danger" | undefined;
  "onHeader:click"?: () => void;
  "onState:collapsed"?: (isCollapsedState: boolean) => void;
}

export interface VcCardSlots {
  default: () => VNode[];
  actions: () => VNode[];
}
