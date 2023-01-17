import { ComponentPublicInstance } from "vue";
import { VcSelectProps } from "./vc-select-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Select from "./vc-select.vue";
export const VcSelect: ComponentConstructor<
  ComponentPublicInstance<VcSelectProps>
> = Select;
