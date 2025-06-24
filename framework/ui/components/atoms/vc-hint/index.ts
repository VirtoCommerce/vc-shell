import _Hint from "./vc-hint.vue";
import { VNode } from "vue";

export const VcHint = _Hint as typeof _Hint & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
