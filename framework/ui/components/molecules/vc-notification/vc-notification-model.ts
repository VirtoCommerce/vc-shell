import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const notificationProps = {
  timeout: {
    type: Number,
    default: 0,
  },
};

export const notificationEmits = {
  dismiss: () => true,
  expired: () => true,
};

export type VcNotificationProps = ExtractTypes<typeof notificationProps>;
export type VcNotificationEmits = typeof notificationEmits;

export interface VcNotificationSlots {
  default: () => VNode[];
}
