import { VNode } from "vue";
import _Progress from "@ui/components/atoms/vc-progress/vc-progress.vue";

export const VcProgress = _Progress as typeof _Progress & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
