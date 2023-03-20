import { VNode } from "vue";
import Loading from "./vc-loading.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcLoadingSlots = {
  default?: () => VNode[];
};

export const VcLoading: GlobalComponentConstructor<typeof Loading, VcLoadingSlots> = Loading;
