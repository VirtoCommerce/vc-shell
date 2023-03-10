import { ComponentPublicInstance } from "vue";
import { VcImageEmits, VcImageProps } from "./vc-image-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Image from "./vc-image.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcImage: ComponentConstructor<ComponentPublicInstance<VcImageProps, any, any, any, any, VcImageEmits>> =
  Image;
