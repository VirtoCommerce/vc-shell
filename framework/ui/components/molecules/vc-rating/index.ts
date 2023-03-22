import { VNode } from "vue";
import _Rating from "./vc-rating.vue";

export const VcRating = _Rating as typeof _Rating & {
  new (): {
    $slots: {
      details: () => VNode[];
    };
  };
};
