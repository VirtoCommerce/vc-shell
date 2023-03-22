/* eslint-disable @typescript-eslint/no-explicit-any */
import { VNode } from "vue";
import _Table from "./vc-table.vue";
import { ITableColumns } from "./../../../../core/types";

export const VcTable = _Table as typeof _Table & {
  new (): {
    $slots: {
      header: () => VNode[];
      filters: (args: { closePanel: () => void }) => VNode[];
      "mobile-item": (args: { item: { [x: string]: any; id: string } }) => VNode[];
      [key: `header_${string}`]: () => VNode[];
      [key: `item_${string}`]: (args: { item: { [x: string]: any; id: string }; cell: ITableColumns }) => VNode[];
      notfound: () => VNode[];
      empty: () => VNode[];
      footer: () => VNode[];
    };
  };
};
