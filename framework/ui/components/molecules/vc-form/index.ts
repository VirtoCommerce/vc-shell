import { VNode } from "vue";
import Form from "./vc-form.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcFormSlots = {
  default?: () => VNode[];
};

export const VcForm: GlobalComponentConstructor<InstanceType<typeof Form>, VcFormSlots> = Form;
