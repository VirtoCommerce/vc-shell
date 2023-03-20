import InfoRow from "./vc-info-row.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";
import { VNode } from "vue";

export type VcInfoRowSlots = {
  default?: () => VNode[];
};

export const VcInfoRow: GlobalComponentConstructor<typeof InfoRow, VcInfoRowSlots> = InfoRow;
