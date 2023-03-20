import { VNode } from "vue";
import StatusIcon from "./vc-status-icon.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcStatusIconSlots = {
  default?: () => VNode[];
};

export const VcStatusIcon: GlobalComponentConstructor<typeof StatusIcon, VcStatusIconSlots> = StatusIcon;
