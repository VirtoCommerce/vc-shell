import { ComponentPublicInstance } from "vue";
import { VcBladeProps } from "./vc-blade-model";
import { ComponentConstructor } from "./../../../types/ts-helpers"
import Blade from "./vc-blade.vue";
export const VcBlade: ComponentConstructor<
  ComponentPublicInstance<VcBladeProps>
> = Blade;
