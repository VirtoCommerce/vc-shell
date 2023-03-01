import { ComponentPublicInstance } from "vue";
import { VcLoadingProps } from "./vc-loading-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Loading from "./vc-loading.vue";
export const VcLoading: ComponentConstructor<
  ComponentPublicInstance<VcLoadingProps>
> = Loading;
