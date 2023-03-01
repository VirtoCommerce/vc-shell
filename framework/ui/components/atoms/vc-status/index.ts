import { ComponentPublicInstance } from "vue";
import { VcStatusProps } from "./vc-status-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Status from "./vc-status.vue";
export const VcStatus: ComponentConstructor<
    ComponentPublicInstance<VcStatusProps>
> = Status;
