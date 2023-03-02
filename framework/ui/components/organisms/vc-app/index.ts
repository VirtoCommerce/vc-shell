import { ComponentPublicInstance } from "vue";
import { VcAppProps } from "./vc-app-model";
import { ComponentConstructor } from "./../../../types/ts-helpers"
import App from "./vc-app.vue";
export const VcApp: ComponentConstructor<ComponentPublicInstance<VcAppProps>> =
  App;
