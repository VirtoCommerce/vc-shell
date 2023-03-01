import { ComponentPublicInstance } from "vue";
import { VcCheckboxProps } from "./vc-checkbox-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Checkbox from "./vc-checkbox.vue";
export const VcCheckbox: ComponentConstructor<
    ComponentPublicInstance<VcCheckboxProps>
> = Checkbox;
