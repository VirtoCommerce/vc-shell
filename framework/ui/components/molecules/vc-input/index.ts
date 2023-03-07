import { ComponentPublicInstance } from "vue";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Input from "./vc-input.vue";
import { VcInputEmits, VcInputProps } from "./vc-input-model";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcInput: ComponentConstructor<ComponentPublicInstance<VcInputProps, any, any, any, any, VcInputEmits>> =
  Input;
