import { ComponentPublicInstance } from "vue";
import { VcGalleryEmits, VcGalleryProps } from "./vc-gallery-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Gallery from "./vc-gallery.vue";
export const VcGallery: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcGalleryProps, any, any, any, any, VcGalleryEmits>
> = Gallery;
