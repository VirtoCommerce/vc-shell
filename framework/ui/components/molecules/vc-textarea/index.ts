import { VNode } from "vue";
import _Textarea from "./vc-textarea.vue";

export const VcTextarea = _Textarea as typeof _Textarea & {
  new (): {
    $slots: {
      error: () => VNode[];
    };
  };
};
