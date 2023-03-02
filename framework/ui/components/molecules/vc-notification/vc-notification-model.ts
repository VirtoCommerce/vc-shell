import { VNode } from "vue";

export interface VcNotificationProps {
  timeout?: number | undefined;
  onDismiss?: () => void;
  onExpired?: () => void;
}

export interface VcNotificationSlots {
  default: () => VNode[];
}
