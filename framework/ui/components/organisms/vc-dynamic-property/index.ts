import { VNode } from "vue";
import DynamicProperty from "./vc-dynamic-property.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcDynamicPropertySlots = {
  default?: () => VNode[];
};

export const VcDynamicProperty: GlobalComponentConstructor<
  InstanceType<typeof DynamicProperty>,
  VcDynamicPropertySlots
> = DynamicProperty;
