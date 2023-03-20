import { VNode } from "vue";
import Widget from "./vc-widget.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";

export type VcWidgetSlots = {
  default?: () => VNode[];
}

export const VcWidget: GlobalComponentConstructor<typeof Widget, VcWidgetSlots> = Widget;
