/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComputedRef, Ref, VNode } from "vue";
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

export interface TableEmptyAction {
  icon?: string;
  text: string | Ref<string> | ComputedRef<string>;
  action?: string | Ref<string> | ComputedRef<string>;
  clickHandler?: () => void;
}
