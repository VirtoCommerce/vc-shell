import { VNode } from "vue";
import Notification from "./vc-notification.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcNotificationSlots = {
  default?: () => VNode[];
};

export const VcNotification: GlobalComponentConstructor<typeof Notification, VcNotificationSlots> = Notification;
