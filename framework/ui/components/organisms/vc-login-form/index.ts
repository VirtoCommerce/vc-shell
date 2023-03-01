import { ComponentPublicInstance } from "vue";
import { VcLoginFormProps } from "./vc-login-form-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import LoginForm from "./vc-login-form.vue";
export const VcLoginForm: ComponentConstructor<
  ComponentPublicInstance<VcLoginFormProps>
> = LoginForm;
