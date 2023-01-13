import { ComponentPublicInstance } from "vue";
import { VcButtonProps } from "./vc-button-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Button from "./vc-button.vue";
export const VcBadge: ComponentConstructor<
  ComponentPublicInstance<VcButtonProps>
> = Button;
