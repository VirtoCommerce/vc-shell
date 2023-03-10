import { VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";
import { isNumber } from "./../../../utils";

export const paginationProps = {
  expanded: {
    type: Boolean,
    default: false,
  },
  pages: {
    type: Number,
    default: 1,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
};

export const paginationEmits = {
  itemClick: (pages: number) => isNumber(pages),
};

export type VcPaginationProps = ExtractTypes<typeof paginationProps>;
export type VcPaginationEmits = typeof paginationEmits;

export interface VcPaginationSlots {
  default: () => VNode[];
}
