import { VNode } from "vue";
import _Container from "./vc-container.vue";

export const VcContainer = _Container as typeof _Container & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
