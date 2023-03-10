import { ComponentPublicInstance } from "vue";
import { VcTextareaEmits, VcTextareaProps } from "./vc-textarea-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Textarea from "./vc-textarea.vue";
export const VcTextarea: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcTextareaProps, any, any, any, any, VcTextareaEmits>
> = Textarea;
