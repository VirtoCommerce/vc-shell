import { VNode } from "vue";
import _CodeEditor from "./vc-code-editor.vue";

export const VcCodeEditor = _CodeEditor as typeof _CodeEditor & {
  new (): {
    $slots: {
      error: () => VNode[];
    };
  };
};
