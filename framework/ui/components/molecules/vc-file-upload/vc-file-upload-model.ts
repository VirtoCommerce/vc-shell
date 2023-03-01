import { VNode } from "vue";

export interface VcFileUploadProps {
  variant?: "gallery" | "file-upload" | undefined;
  loading?: boolean | undefined;
  accept?: string | undefined;
  multiple?: boolean | undefined;
  rules?: string | Record<string, unknown> | undefined;
  name?: string | undefined;
  onUpload?: (files: FileList) => void;
}

export interface VcFileUploadSlots {
  error: () => VNode[];
}
