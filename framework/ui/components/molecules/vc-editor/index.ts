import { VNode } from "vue";
import _Editor from "./vc-editor.vue";

export const VcEditor = _Editor as typeof _Editor & {
  new (): {
    $slots: {
      error: () => VNode[];
    };
  };
};
