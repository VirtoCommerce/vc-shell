import { VNode } from "vue";
import _Form from "@ui/components/molecules/vc-form/vc-form.vue";

export const VcForm = _Form as typeof _Form & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
