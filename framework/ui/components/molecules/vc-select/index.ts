import { ComponentPublicInstance } from "vue";
import { VcSelectProps, VcSelectEmits } from "./vc-select-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Select from "./vc-select.vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcSelect: ComponentConstructor<ComponentPublicInstance<VcSelectProps, any, any, any, any, VcSelectEmits>> =
  Select;
