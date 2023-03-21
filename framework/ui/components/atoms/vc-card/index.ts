import { VNode } from "vue";
import Card from "./vc-card.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcCardSlots = {
  default?: () => VNode[];
  actions?: () => VNode[];
};

export const VcCard: GlobalComponentConstructor<InstanceType<typeof Card>, VcCardSlots> = Card;
