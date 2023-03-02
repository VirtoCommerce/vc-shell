import { ComponentPublicInstance } from "vue";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Input from "./vc-input.vue";
import { VcInputProps } from "./vc-input-model";

export const VcInput: ComponentConstructor<
  ComponentPublicInstance<VcInputProps>
> = Input;
