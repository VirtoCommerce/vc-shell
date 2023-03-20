import { VNode } from "vue";
import Checkbox from "./vc-checkbox.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcCheckboxSlots = {
  default?: () => VNode[];
  error?: () => VNode[];
};

export const VcCheckbox: GlobalComponentConstructor<typeof Checkbox, VcCheckboxSlots> = Checkbox;
