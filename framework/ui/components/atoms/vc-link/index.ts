import { VNode } from "vue";
import _Link from "./vc-link.vue";

export const VcLink = _Link as typeof _Link & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
