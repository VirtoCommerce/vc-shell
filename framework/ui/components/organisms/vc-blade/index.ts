import { VNode } from "vue";
import _Blade from "./vc-blade.vue";

export const VcBlade = _Blade as typeof _Blade & {
  new (): {
    $slots: {
      actions: () => VNode[];
      default: () => VNode[];
    };
  };
};
