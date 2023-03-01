import { ComponentPublicInstance } from "vue";
import { VcColProps } from "./vc-col-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Col from "./vc-col.vue";
export const VcCol: ComponentConstructor<ComponentPublicInstance<VcColProps>> =
  Col;
