import { VNode } from "vue";
import _Button from "./vc-button.vue";

export const VcButton = _Button as typeof _Button & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
