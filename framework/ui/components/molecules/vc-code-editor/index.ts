import { VNode } from "vue";
import CodeEditor from "./vc-code-editor.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcCodeEditorSlots = {
  error?: () => VNode[];
};

export const VcCodeEditor: GlobalComponentConstructor<typeof CodeEditor, VcCodeEditorSlots> = CodeEditor;
