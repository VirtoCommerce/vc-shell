import { VNode } from "vue";

export interface VcPaginationProps {
  expanded?: boolean | undefined;
  pages?: number | undefined;
  currentPage?: number | undefined;
  onItemClick?: (pages: number) => void;
}

export interface VcPaginationSlots {
  default: () => VNode[];
}
