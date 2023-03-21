import { VNode } from "vue";
import Gallery from "./vc-gallery.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcGallerySlots = {
  default?: () => VNode[];
};

export const VcGallery: GlobalComponentConstructor<InstanceType<typeof Gallery>, VcGallerySlots> = Gallery;
