/* eslint-disable @typescript-eslint/no-explicit-any */
import { IActionBuilderResult, ITableColumns } from "./../../../../core/types";
import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";
import { isNumber, isString, isObject } from "./../../../utils";

export interface StatusImage {
  image?: string;
  text: string;
  action?: string;
  clickHandler?: () => void;
}

export const tableProps = {
  columns: { type: Array as PropType<ITableColumns[]>, default: () => [] },
  items: { type: Array as PropType<{ id?: string }[] | any[]>, default: () => [] },
  itemActionBuilder: {
    type: Function as PropType<(item: { id?: string }) => IActionBuilderResult[]>,
    default: undefined,
  },
  sort: {
    type: String,
    default: undefined,
  },
  multiselect: {
    type: Boolean,
    default: false,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  totalLabel: {
    type: String,
    default: "Totals:",
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  pages: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 0,
  },
  searchPlaceholder: {
    type: String,
    default: "Search...",
  },
  searchValue: {
    type: String,
    default: undefined,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  empty: {
    type: Object as PropType<StatusImage>,
    default: () => ({
      text: "List is empty.",
    }),
  },
  notfound: {
    type: Object as PropType<StatusImage>,
    default: () => ({
      text: "Nothing found.",
    }),
  },
  header: {
    type: Boolean,
    default: true,
  },
  footer: {
    type: Boolean,
    default: true,
  },
  activeFilterCount: {
    type: Number,
    default: 0,
  },
  selectedItemId: {
    type: String,
    default: undefined,
  },
  scrolling: {
    type: Boolean,
    default: false,
  },
};

export const tableEmits = {
  paginationClick: (page: number) => isNumber(page),
  selectionChanged: (values: Record<string, boolean>) => isObject(values),
  "search:change": (value: string) => isString(value),
  headerClick: (value: Record<string, unknown>) => isObject(value),
  itemClick: (item: { id?: string }) => isObject(item),
  "scroll:ptr": () => true,
};

export type VcTableProps = ExtractTypes<typeof tableProps>;
export type VcTableEmits = typeof tableEmits;

export interface VcTableSlots {
  header: () => VNode[];
  filters: (args: { closePanel: () => void }) => VNode[];
  "mobile-item": (args: { item: { [x: string]: any; id: string } }) => VNode[];
  [key: `header_${string}`]: () => VNode[];
  [key: `item_${string}`]: (args: { item?: { [x: string]: any; id: string }; cell?: ITableColumns }) => VNode[];
  notfound: () => VNode[];
  empty: () => VNode[];
  footer: () => VNode[];
}
