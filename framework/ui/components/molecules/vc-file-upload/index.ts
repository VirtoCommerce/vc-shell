import { VNode } from "vue";
import FileUpload from "./vc-file-upload.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcFileUploadSlots = {
  error?: () => VNode[];
};

export const VcFileUpload: GlobalComponentConstructor<InstanceType<typeof FileUpload>, VcFileUploadSlots> = FileUpload;
