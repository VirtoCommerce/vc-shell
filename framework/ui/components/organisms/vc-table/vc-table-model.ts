import { IActionBuilderResult, ITableColumns } from "./../../../../core/types";
import { VNode } from "vue";

export interface StatusImage {
  image?: string;
  text: string;
  action?: string;
  clickHandler?: () => void;
}

export interface VcTableProps {
  columns?: ITableColumns[];
  items?: { id?: string }[] | any[];
  itemActionBuilder?: (item: {
    id?: string;
  }) => IActionBuilderResult[] | undefined;
  sort?: string | undefined;
  multiselect?: boolean | undefined;
  expanded?: boolean | undefined;
  totalLabel?: string | undefined;
  totalCount?: number | undefined;
  pages?: number | undefined;
  currentPage?: number | undefined;
  searchPlaceholder?: string | undefined;
  searchValue?: string | undefined;
  loading?: boolean | undefined;
  empty?: StatusImage | undefined;
  notfound?: StatusImage | undefined;
  header?: boolean | undefined;
  footer?: boolean | undefined;
  activeFilterCount?: number | undefined;
  selectedItemId?: string | undefined;
  scrolling?: boolean | undefined;
  onPaginationClick?: (page: number) => void;
  onSelectionChanged?: (values: Record<string, boolean>) => void;
  "onSearch:change"?: (value: string) => void;
  onHeaderClick?: (value: Record<string, unknown>) => void;
  onItemClick?: (item: { id?: string }) => void;
  "onScroll:ptr"?: () => void;
}

export interface VcTableSlots {
  header: () => VNode[];
  filters: (args: { closePanel: () => void }) => VNode[];
  "mobile-item": (args: {
    item: { [x: string]: any; id: string };
  }) => VNode[];
  [key: `header_${string}`]: () => VNode[];
  [key: `item_${string}`]: (args: {
    item?: { [x: string]: any; id: string };
    cell?: ITableColumns;
  }) => VNode[];
  notfound: () => VNode[];
  empty: () => VNode[];
  footer: () => VNode[];
}
