import { ComponentPublicInstance } from "vue";
import { VcInputProps } from "./vc-input-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Input from "./vc-input.vue";

export const VcInput: ComponentConstructor<
  ComponentPublicInstance<VcInputProps>
> = Input;
