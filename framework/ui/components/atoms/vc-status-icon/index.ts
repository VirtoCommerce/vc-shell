import { ComponentPublicInstance } from "vue";
import { VcStatusIconProps } from "./vc-status-icon-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import StatusIcon from "./vc-status-icon.vue";
export const VcStatusIcon: ComponentConstructor<
  ComponentPublicInstance<VcStatusIconProps>
> = StatusIcon;
