import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const fileUploadProps = {
  variant: {
    type: String as PropType<"gallery" | "file-upload">,
    default: "gallery",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: ".jpg, .png, .jpeg",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  rules: [String, Object] as PropType<string | Record<string, unknown>>,
  name: {
    type: String,
    default: "Gallery",
  },
};

export const fileUploadEmits = {
  upload: (files: FileList) => !!files,
};

export type VcFileUploadProps = ExtractTypes<typeof fileUploadProps>;
export type VcFileUploadEmits = typeof fileUploadEmits;

export interface VcFileUploadSlots {
  error: () => VNode[];
}
