import { VNode } from "vue";
import App from "./vc-app.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcAppSlots = {
  appSwitcher?: () => VNode[];
  bladeNavigation?: () => VNode[];
  notifications?: () => VNode[];
  passwordChange?: () => VNode[];
};

export const VcApp: GlobalComponentConstructor<typeof App, VcAppSlots> = App;
