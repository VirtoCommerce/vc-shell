import _Label from "./vc-label.vue";
import { VNode } from "vue";

export const VcLabel = _Label as typeof _Label & {
  new (): {
    $slots: {
      default: () => VNode[];
      tooltip: () => VNode[];
    };
  };
};
