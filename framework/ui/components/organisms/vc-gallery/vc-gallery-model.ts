import { IImage } from "@/core/types";
import { VNode } from "vue";

export interface VcGalleryProps {
  images?: IImage[] | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  label?: string | undefined;
  tooltip?: string | undefined;
  tooltipIcon?: string | undefined;
  uploadIcon?: string | undefined;
  multiple?: boolean | undefined;
  variant?: "gallery" | "file-upload" | undefined;
  itemActions?: {
    name?: string | undefined;
    preview: boolean | undefined;
    edit: boolean | undefined;
    remove: boolean | undefined;
  };
  disableDrag?: boolean | undefined;
  hideAfterUpload?: boolean | undefined;
  rules?: string | Record<string, unknown> | undefined;
  name?: string | undefined;
  onUpload?: (files: FileList) => void;
  onSort?: (sorted: IImage[]) => void;
  "onItem:edit"?: (image: IImage) => void;
  "onItem:remove"?: (image: IImage) => void;
  "onItem:move"?: (image: IImage) => void;
}

export interface VcGallerySlots {
  default: () => VNode[];
}
