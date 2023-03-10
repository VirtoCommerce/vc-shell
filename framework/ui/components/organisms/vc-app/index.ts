import { ComponentPublicInstance } from "vue";
import { VcAppEmits, VcAppProps } from "./vc-app-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import App from "./vc-app.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcApp: ComponentConstructor<ComponentPublicInstance<VcAppProps, any, any, any, any, VcAppEmits>> = App;
