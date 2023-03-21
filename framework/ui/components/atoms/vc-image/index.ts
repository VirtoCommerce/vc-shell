import { VNode } from "vue";
import Image from "./vc-image.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcImageSlots = {
  default?: () => VNode[];
};

export const VcImage: GlobalComponentConstructor<InstanceType<typeof Image>, VcImageSlots> = Image;
