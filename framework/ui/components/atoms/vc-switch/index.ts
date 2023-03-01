import { ComponentPublicInstance } from "vue";
import { VcSwitchProps } from "./vc-switch-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Switch from "./vc-switch.vue";
export const VcSwitch: ComponentConstructor<
    ComponentPublicInstance<VcSwitchProps>
> = Switch;