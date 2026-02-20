import { VNode } from "vue";
import _Link from "@ui/components/atoms/vc-link/vc-link.vue";

export const VcLink = _Link as typeof _Link & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
