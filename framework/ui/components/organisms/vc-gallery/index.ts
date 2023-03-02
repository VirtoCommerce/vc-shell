import { ComponentPublicInstance } from "vue";
import { VcGalleryProps } from "./vc-gallery-model";
import { ComponentConstructor } from "./../../../types/ts-helpers"
import Gallery from "./vc-gallery.vue";
export const VcGallery: ComponentConstructor<
  ComponentPublicInstance<VcGalleryProps>
> = Gallery;
