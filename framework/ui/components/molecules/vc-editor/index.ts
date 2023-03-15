import { ComponentPublicInstance } from "vue";
import { VcEditorEmits, VcEditorProps } from "./vc-editor-model";
import { ComponentConstructor } from "../../../types/ts-helpers";
import Editor from "./vc-editor.vue";
export const VcEditor: ComponentConstructor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentPublicInstance<VcEditorProps, any, any, any, any, VcEditorEmits>
> = Editor;
