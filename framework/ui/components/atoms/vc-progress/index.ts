import { ComponentPublicInstance } from "vue";
import { VcProgressProps } from "./vc-progress-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Progress from "./vc-progress.vue";
export const VcProgress: ComponentConstructor<
  ComponentPublicInstance<VcProgressProps>
> = Progress;
