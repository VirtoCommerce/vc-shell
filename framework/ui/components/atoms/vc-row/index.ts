import { VNode } from "vue";
import _Row from "./vc-row.vue";

export const VcRow = _Row as typeof _Row & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
