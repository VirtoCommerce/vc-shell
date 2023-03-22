import { VNode } from "vue";
import _Badge from "./vc-badge.vue";

export const VcBadge = _Badge as typeof _Badge & {
  new (): {
    $slots: {
      /**
       * Slot for component content
       * */
      default: () => VNode[];
    };
  };
};
