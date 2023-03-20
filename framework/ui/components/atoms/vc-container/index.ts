import { VNode } from "vue";
import Container from "./vc-container.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcContainerSlots = {
  default?: () => VNode[];
};

export const VcContainer: GlobalComponentConstructor<typeof Container, VcContainerSlots> = Container;
