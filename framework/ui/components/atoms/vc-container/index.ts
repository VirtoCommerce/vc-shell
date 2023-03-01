import { ComponentPublicInstance } from "vue";
import { VcContainerProps } from "./vc-container-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Container from "./vc-container.vue";
export const VcContainer: ComponentConstructor<
  ComponentPublicInstance<VcContainerProps>
> = Container;
