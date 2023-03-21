import { VNode } from "vue";
import Button from "./vc-button.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcButtonSlots = {
  default?: () => VNode[];
};

export const VcButton: GlobalComponentConstructor<InstanceType<typeof Button>, VcButtonSlots> = Button;
