import { VNode } from "vue";
import Icon from "./vc-icon.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcIconSlots = {
  default?: () => VNode[];
};

export const VcIcon: GlobalComponentConstructor<InstanceType<typeof Icon>, VcIconSlots> = Icon;
