import { ComponentPublicInstance } from "vue";
import { VcTextareaProps } from "./vc-textarea-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Textarea from "./vc-textarea.vue";
export const VcTextarea: ComponentConstructor<
  ComponentPublicInstance<VcTextareaProps>
> = Textarea;
