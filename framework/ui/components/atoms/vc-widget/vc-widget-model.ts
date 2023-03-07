import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const widgetProps = {
  icon: String,
  title: String,
  value: [String, Number],
  disabled: {
    type: Boolean,
    default: false,
  },
};

export const widgetEmits = {
  click: () => true,
};

export type VcWidgetProps = ExtractTypes<typeof widgetProps>;
export type VcWidgetEmits = typeof widgetEmits;

export interface VcWidgetSlots {
  default: () => VNode[];
}
