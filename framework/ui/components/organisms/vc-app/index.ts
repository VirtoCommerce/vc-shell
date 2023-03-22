import { VNode } from "vue";
import _App from "./vc-app.vue";

export const VcApp = _App as typeof _App & {
  new (): {
    $slots: {
      appSwitcher: () => VNode[];
      bladeNavigation: () => VNode[];
      notifications: () => VNode[];
      passwordChange: () => VNode[];
    };
  };
};
