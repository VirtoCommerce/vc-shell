import { VNode } from "vue";
import Row from "./vc-row.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcRowSlots = {
  default?: () => VNode[];
};

export const VcRow: GlobalComponentConstructor<typeof Row, VcRowSlots> = Row;
