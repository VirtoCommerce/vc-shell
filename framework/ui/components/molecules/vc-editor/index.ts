import { ComponentPublicInstance } from "vue";
import { VcEditorProps } from "./vc-editor-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Editor from "./vc-editor.vue";
export const VcEditor: ComponentConstructor<
  ComponentPublicInstance<VcEditorProps>
> = Editor;
