import _Hint from "@ui/components/atoms/vc-hint/vc-hint.vue";
import { VNode } from "vue";

export const VcHint = _Hint as typeof _Hint & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
