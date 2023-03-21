import { VNode } from "vue";
import _LoginForm from "./vc-login-form.vue";

export const VcLoginForm = _LoginForm as typeof _LoginForm & {
  new (): {
    $slots: {
      default: () => VNode[];
    };
  };
};
