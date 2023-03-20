import { VNode } from "vue";
import Textarea from "./vc-textarea.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcTextareaSlots = {
  error?: () => VNode[];
};

export const VcTextarea: GlobalComponentConstructor<typeof Textarea, VcTextareaSlots> = Textarea;
