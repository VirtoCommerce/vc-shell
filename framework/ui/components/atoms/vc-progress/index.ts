import { VNode } from "vue";
import Progress from "./vc-progress.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcProgressSlots = {
  default?: () => VNode[];
};

export const VcProgress: GlobalComponentConstructor<typeof Progress, VcProgressSlots> = Progress;
