import { VNode } from "vue";
import _Card from "./vc-card.vue";

export const VcCard = _Card as typeof _Card & {
  new (): {
    $slots: {
      default: () => VNode[];
      actions: () => VNode[];
    };
  };
};
