import { VNode } from "vue";
import Status from "./vc-status.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcStatusSlots = {
  default?: () => VNode[];
};

export const VcStatus: GlobalComponentConstructor<InstanceType<typeof Status>, VcStatusSlots> = Status;
