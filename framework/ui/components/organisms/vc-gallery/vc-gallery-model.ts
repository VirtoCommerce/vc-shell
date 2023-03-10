import { isArray, isObject } from "./../../../utils";
import { IImage } from "./../../../../core/types";
import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const galleryProps = {
  images: {
    type: Array as PropType<IImage[]>,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  label: String,
  tooltip: String,
  tooltipIcon: {
    type: String,
    default: "fas fa-info",
  },
  uploadIcon: {
    type: String,
    default: "fas fa-upload",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String as PropType<"gallery" | "file-upload">,
    default: "gallery",
  },
  itemActions: {
    type: Object as PropType<{
      name?: string | undefined;
      preview: boolean | undefined;
      edit: boolean | undefined;
      remove: boolean | undefined;
    }>,
    default: () => ({
      preview: true,
      edit: true,
      remove: true,
    }),
  },
  disableDrag: {
    type: Boolean,
    default: false,
  },
  hideAfterUpload: {
    type: Boolean,
    default: false,
  },
  rules: [String, Object] as PropType<string | Record<string, unknown>>,
  name: {
    type: String,
    default: "Gallery",
  },
};

export const galleryEmits = {
  upload: (files: FileList) => !!files,
  sort: (sorted: IImage[]) => isArray(sorted),
  "item:edit": (image: IImage) => isObject(image),
  "item:remove": (image: IImage) => isObject(image),
  "item:move": (image: IImage) => isObject(image),
};

export type VcGalleryProps = ExtractTypes<typeof galleryProps>;
export type VcGalleryEmits = typeof galleryEmits;

export interface VcGallerySlots {
  default: () => VNode[];
}
