import { VNode } from "vue";
import Table from "./vc-table.vue";
import { GlobalComponentConstructor } from "./../../../services/types/ts-helpers";
import { ITableColumns } from "core/types";

export type VcTableSlots = {
  header?: () => VNode[];
  filters?: (args: { closePanel: () => void }) => VNode[];
  "mobile-item"?: (args: { item: { [x: string]: any; id: string } }) => VNode[];
  [key: `header_${string}`]: () => VNode[];
  [key: `item_${string}`]: (args: { item?: { [x: string]: any; id: string }; cell?: ITableColumns }) => VNode[];
  notfound?: () => VNode[];
  empty?: () => VNode[];
  footer?: () => VNode[];
};

export const VcTable: GlobalComponentConstructor<typeof Table, VcTableSlots> = Table;
