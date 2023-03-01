import { ComponentPublicInstance } from "vue";
import { VcImageProps } from "./vc-image-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Image from "./vc-image.vue";
export const VcImage: ComponentConstructor<
  ComponentPublicInstance<VcImageProps>
> = Image;
