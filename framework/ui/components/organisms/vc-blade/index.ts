import { VNode } from "vue";
import Blade from "./vc-blade.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcBladeSlots = {
  actions?: () => VNode[];
  default?: () => VNode[];
};

export const VcBlade: GlobalComponentConstructor<typeof Blade, VcBladeSlots> = Blade;
