import { VNode } from "vue";
import Editor from "./vc-editor.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcEditorSlots = {
  error?: () => VNode[];
};

export const VcEditor: GlobalComponentConstructor<InstanceType<typeof Editor>, VcEditorSlots> = Editor;
