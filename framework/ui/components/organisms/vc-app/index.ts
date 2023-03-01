import { ComponentPublicInstance } from "vue";
import { VcAppProps } from "./vc-app-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import App from "./vc-app.vue";
export const VcApp: ComponentConstructor<ComponentPublicInstance<VcAppProps>> =
  App;
