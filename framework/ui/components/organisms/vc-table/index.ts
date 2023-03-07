import { ComponentPublicInstance } from "vue";
import { VcTableEmits, VcTableProps } from "./vc-table-model";
import { ComponentConstructor } from "./../../../types/ts-helpers";
import Table from "./vc-table.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VcTable: ComponentConstructor<ComponentPublicInstance<VcTableProps, any, any, any, any, VcTableEmits>> =
  Table;
