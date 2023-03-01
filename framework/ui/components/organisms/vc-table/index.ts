import { ComponentPublicInstance } from "vue";
import { VcTableProps } from "./vc-table-model";
import { ComponentConstructor } from "@/ui/types/ts-helpers";
import Table from "./vc-table.vue";
export const VcTable: ComponentConstructor<
  ComponentPublicInstance<VcTableProps>
> = Table;
