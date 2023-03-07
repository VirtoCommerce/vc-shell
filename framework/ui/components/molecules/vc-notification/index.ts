import { ComponentPublicInstance } from "vue";
import { VcNotificationEmits, VcNotificationProps } from "./vc-notification-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Notification from "./vc-notification.vue";
export const VcNotification: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcNotificationProps, any, any, any, any, VcNotificationEmits>
> = Notification;
