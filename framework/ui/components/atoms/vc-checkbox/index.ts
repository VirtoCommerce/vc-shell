import { ComponentPublicInstance } from "vue";
import { VcCheckboxEmits, VcCheckboxProps } from "./vc-checkbox-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Checkbox from "./vc-checkbox.vue";
export const VcCheckbox: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcCheckboxProps, any, any, any, any, VcCheckboxEmits>
> = Checkbox;
