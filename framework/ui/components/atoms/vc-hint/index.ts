import Hint from "./vc-hint.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";
import { VNode } from "vue";

export type VcHintSlots = {
  default?: () => VNode[];
};

export const VcHint: GlobalComponentConstructor<typeof Hint, VcHintSlots> = Hint;
