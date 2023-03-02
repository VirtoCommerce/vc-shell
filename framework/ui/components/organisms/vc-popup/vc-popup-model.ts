import { VNode } from "vue";

export interface VcPopupProps {
  title?: string | undefined;
  closable?: boolean | undefined;
  variant?: "small" | "medium" | "fullscreen" | undefined;
  onClose?: () => void;
}

export interface VcPopupSlots {
  default: () => VNode[];
}
