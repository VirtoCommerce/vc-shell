import { ComponentPublicInstance } from "vue";
import { VcContainerEmits, VcContainerProps } from "./vc-container-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Container from "./vc-container.vue";
export const VcContainer: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcContainerProps, any, any, any, any, VcContainerEmits>
> = Container;
