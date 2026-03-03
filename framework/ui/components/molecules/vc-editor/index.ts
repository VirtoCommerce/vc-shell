import { defineAsyncComponent } from "vue";

type VcEditorComponent = typeof import("./vc-editor.vue")["default"];

export const VcEditor = defineAsyncComponent({
  loader: () => import("./vc-editor.vue"),
  delay: 200,
  timeout: 10000,
  suspensible: false,
}) as VcEditorComponent;
export type {
  CustomToolbarButton,
  CustomToolbarDropdown,
  CustomToolbarItem,
} from "./_internal/toolbar-types";
