import { VNode } from "vue";
import _Container from "@ui/components/atoms/vc-container/vc-container.vue";

export const VcContainer = _Container as typeof _Container & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
