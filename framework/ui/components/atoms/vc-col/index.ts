import { VNode } from "vue";
import Col from "./vc-col.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcColSlots = {
  default?: () => VNode[];
};

export const VcCol: GlobalComponentConstructor<InstanceType<typeof Col>, VcColSlots> = Col;
