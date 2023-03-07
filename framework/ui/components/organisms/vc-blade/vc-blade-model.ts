import { IBladeToolbar } from "./../../../../core/types";
import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";

export const bladeProps = {
  icon: String,
  title: String,
  subtitle: String,
  width: {
    type: [Number, String],
    default: "30%",
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  closable: {
    type: Boolean,
    default: true,
  },
  toolbarItems: {
    type: Array as PropType<IBladeToolbar[]>,
    default: () => [],
  },
};

export const bladeEmits = {
  close: () => true,
};

export type VcBladeProps = ExtractTypes<typeof bladeProps>;
export type VcBladeEmits = typeof bladeEmits;

export interface VcBladeSlots {
  actions: () => VNode[];
  default: () => VNode[];
}
