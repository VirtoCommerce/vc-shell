import { ComponentPublicInstance } from "vue";
import { VcBladeEmits, VcBladeProps } from "./vc-blade-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Blade from "./vc-blade.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcBlade: ComponentConstructor<ComponentPublicInstance<VcBladeProps, any, any, any, any, VcBladeEmits>> =
  Blade;
