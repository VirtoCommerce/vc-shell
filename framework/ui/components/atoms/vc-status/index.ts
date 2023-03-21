import { VNode } from "vue";
import _Status from "./vc-status.vue";

export const VcStatus = _Status as typeof _Status & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
