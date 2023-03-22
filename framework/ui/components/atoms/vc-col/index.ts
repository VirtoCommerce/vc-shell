import { VNode } from "vue";
import _Col from "./vc-col.vue";

export const VcCol = _Col as typeof _Col & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
