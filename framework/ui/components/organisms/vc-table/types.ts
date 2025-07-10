/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref, VNode } from "vue";
import { IActionBuilderResult, ITableColumns } from "../../../../core/types";

export interface TableSlots<T> {
  header: (props: { header: () => VNode }) => any;
  filters: (args: { closePanel: () => void }) => any;
  "mobile-item": (args: { item: T }) => any;
  [key: `header_${string}`]: (props: any) => any;
  [key: `item_${string}`]: (args: { item: T; cell: ITableColumns | TableColPartial; index: number }) => any;
  notfound: (props: any) => any;
  empty: (props: any) => any;
  footer: (props: any) => any;
}

export interface TableItem {
  [x: string]: any;
  actions?: IActionBuilderResult<any>[];
}

export type TableColPartial = Partial<
  ITableColumns & {
    predefined?: boolean;
  }
>;

export interface StatusImage {
  image?: string;
  text: string | Ref<string>;
  action?: string;
  clickHandler?: () => void;
}
