import { ComponentPublicInstance } from "vue";
import { VcCodeEditorEmits, VcCodeEditorProps } from "./vc-code-editor-model";
import { ComponentConstructor } from "../../../types/ts-helpers";
import Editor from "./vc-code-editor.vue";
export const VcCodeEditor: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcCodeEditorProps, any, any, any, any, VcCodeEditorEmits>
> = Editor;
