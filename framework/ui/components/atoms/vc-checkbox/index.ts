import { VNode } from "vue";
import _Checkbox from "./vc-checkbox.vue";

export const VcCheckbox = _Checkbox as typeof _Checkbox & {
  new (): {
    $slots: {
      default: () => VNode[];
      error: () => VNode[];
    };
  };
};
