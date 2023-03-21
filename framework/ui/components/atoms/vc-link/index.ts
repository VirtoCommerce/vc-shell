import { VNode } from "vue";
import Link from "./vc-link.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcLinkSlots = {
  default?: () => VNode[];
};

export const VcLink: GlobalComponentConstructor<InstanceType<typeof Link>, VcLinkSlots> = Link;
