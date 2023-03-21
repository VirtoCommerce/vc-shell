import Label from "./vc-label.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";
import { VNode } from "vue";

export type VcLabelSlots = {
  default?: () => VNode[];
  tooltip?: () => VNode[];
};

export const VcLabel: GlobalComponentConstructor<InstanceType<typeof Label>, VcLabelSlots> = Label;
