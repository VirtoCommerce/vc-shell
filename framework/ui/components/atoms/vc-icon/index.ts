import { ComponentPublicInstance } from "vue";
import { VcIconProps } from "./vc-icon-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Icon from "./vc-icon.vue";
export const VcIcon: ComponentConstructor<
    ComponentPublicInstance<VcIconProps>
> = Icon;
