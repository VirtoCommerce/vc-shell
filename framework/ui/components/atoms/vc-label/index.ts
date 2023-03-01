import { ComponentPublicInstance } from "vue";
import { VcLabelProps } from "./vc-label-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Label from "./vc-label.vue";
export const VcLabel: ComponentConstructor<
  ComponentPublicInstance<VcLabelProps>
> = Label;
