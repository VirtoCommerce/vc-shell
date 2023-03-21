import { VNode } from "vue";
import Badge from "./vc-badge.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcBadgeSlots = {
  /**
   * Slot for component content
   * */
  default?: () => VNode[];
};

export const VcBadge: GlobalComponentConstructor<InstanceType<typeof Badge>, VcBadgeSlots> = Badge;
