import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const loginFormProps = {
  logo: String,
  background: String,
  title: {
    type: String,
    default: "Login",
  },
};

export type VcLoginFormProps = ExtractTypes<typeof loginFormProps>;
export interface VcLoginFormSlots {
  default: () => VNode[];
}
