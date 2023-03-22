import { VNode } from "vue";
import _FileUpload from "./vc-file-upload.vue";

export const VcFileUpload = _FileUpload as typeof _FileUpload & {
  new (): {
    $slots: {
      error?: () => VNode[];
    };
  };
};
