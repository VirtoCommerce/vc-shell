import { ComponentPublicInstance } from "vue";
import { VcWidgetEmits, VcWidgetProps } from "./vc-widget-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Widget from "./vc-widget.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcWidget: ComponentConstructor<ComponentPublicInstance<VcWidgetProps, any, any, any, any, VcWidgetEmits>> =
  Widget;
