import { VNode } from "vue";
import _Notification from "./vc-notification.vue";

export const VcNotification = _Notification as typeof _Notification & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
