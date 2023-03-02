import { VNode } from "vue";

export interface VcBreadcrumbsProps {
  items?: {
    current: boolean;
    icon: string;
    title: string;
    clickHandler: () => void;
    id: string;
  }[];
}

export interface VcBreadcrumbsSlots {
  default: () => VNode[];
}
