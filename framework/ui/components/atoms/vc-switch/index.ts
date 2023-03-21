import { VNode } from "vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";
import Switch from "./vc-switch.vue";

export type VcSwitchSlots = {
  default?: () => VNode[];
};

export const VcSwitch: GlobalComponentConstructor<InstanceType<typeof Switch>, VcSwitchSlots> = Switch;
