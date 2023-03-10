import { ComponentPublicInstance } from "vue";
import { VcFileUploadEmits, VcFileUploadProps } from "./vc-file-upload-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import FileUpload from "./vc-file-upload.vue";
export const VcFileUpload: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcFileUploadProps, any, any, any, any, VcFileUploadEmits>
> = FileUpload;
