import { VNode } from "vue";

export interface VcWidgetProps {
  icon?: string | undefined;
  title?: string | undefined;
  value?: string | number | undefined;
  disabled?: boolean | undefined;
  onClick?: () => void;
}

export interface VcWidgetSlots {
  default: () => VNode[];
}
