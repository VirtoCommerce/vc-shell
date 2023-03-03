import { ComponentPublicInstance } from "vue";
import { VcNotificationProps } from "./vc-notification-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Notification from "./vc-notification.vue";
export const VcNotification: ComponentConstructor<ComponentPublicInstance<VcNotificationProps>> = Notification;
