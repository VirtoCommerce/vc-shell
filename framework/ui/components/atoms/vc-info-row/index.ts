import { ComponentPublicInstance } from "vue";
import { VcInfoRowProps } from "./vc-info-row-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import InfoRow from "./vc-info-row.vue";
export const VcInfoRow: ComponentConstructor<
  ComponentPublicInstance<VcInfoRowProps>
> = InfoRow;
