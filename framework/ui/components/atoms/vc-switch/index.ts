import { ComponentPublicInstance } from "vue";
import { VcSwitchEmits, VcSwitchProps } from "./vc-switch-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Switch from "./vc-switch.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcSwitch: ComponentConstructor<ComponentPublicInstance<VcSwitchProps, any, any, any, any, VcSwitchEmits>> =
  Switch;
