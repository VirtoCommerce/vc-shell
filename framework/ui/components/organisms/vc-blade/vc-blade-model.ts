import { IBladeToolbar } from "./../../../../core/types";
import { VNode } from "vue";

export interface VcBladeProps {
  icon?: string | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  width?: number | string | undefined;
  expanded?: boolean | undefined;
  closable?: boolean | undefined;
  toolbarItems?: IBladeToolbar[] | undefined;
  onClose?: () => void;
}

export interface VcBladeSlots {
  actions: () => VNode[];
  default: () => VNode[];
}
