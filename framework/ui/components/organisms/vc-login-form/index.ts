import { VNode } from "vue";
import LoginForm from "./vc-login-form.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcLoginFormSlots = {
  default?: () => VNode[];
};

export const VcLoginForm: GlobalComponentConstructor<typeof LoginForm, VcLoginFormSlots> = LoginForm;
