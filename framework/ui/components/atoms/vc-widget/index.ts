import { ComponentPublicInstance } from "vue";
import { VcWidgetProps } from "./vc-widget-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Widget from "./vc-widget.vue";
export const VcWidget: ComponentConstructor<ComponentPublicInstance<VcWidgetProps>> = Widget;
